import "server-only";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/db/prisma";
import type { User } from "@supabase/supabase-js";

/**
 * Auth user roles in Cita.
 *
 * Hierarchy (low → high):
 *   ANON       → no Supabase user, only cita_anon_id cookie
 *   REGISTERED → Supabase user, free tier
 *   PREMIUM    → Supabase user, paid tier (active subscription)
 *   MODERATOR  → content review, no admin powers
 *   ADMIN      → full access
 *
 * Stored in DB `users.role` column (Phase 8). Default: REGISTERED on first login.
 * Migrated from `user_metadata.role` (Phase 4) to dedicated DB column for
 * fast SQL filter at /admin/users and consistency with billing logic.
 */
export type CitaRole =
  | "ANON"
  | "REGISTERED"
  | "PREMIUM"
  | "MODERATOR"
  | "ADMIN";

export type CitaUser = {
  id: string;
  email: string | null;
  role: Exclude<CitaRole, "ANON">;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: string;
  raw: User;
};

/**
 * Get current authenticated user (server-side, RSC-safe).
 * Returns null for anonymous visitors.
 *
 * Resolves role from `users.role` DB column. Falls back to REGISTERED
 * if the row exists but role is unset (shouldn't happen post-migration,
 * but kept defensive in case Supabase auth fires before Cita user row
 * is created — see /auth/callback handler).
 *
 * Use {@link requireUser} when an authenticated session is mandatory.
 */
export async function getCurrentUser(): Promise<CitaUser | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return mapUser(data.user);
}

/**
 * Throws when no authenticated user — use in protected routes.
 * Pair with middleware redirect for graceful UX.
 */
export async function requireUser(): Promise<CitaUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED: requireUser() called without session");
  }
  return user;
}

/**
 * Role-gated assertion. Throws if user role is below `minRole`.
 *
 * Hierarchy:
 *   REGISTERED < PREMIUM < MODERATOR < ADMIN
 */
const ROLE_RANK: Record<CitaUser["role"], number> = {
  REGISTERED: 0,
  PREMIUM: 1,
  MODERATOR: 2,
  ADMIN: 3,
};

export async function requireRole(
  minRole: CitaUser["role"],
): Promise<CitaUser> {
  const user = await requireUser();
  if (ROLE_RANK[user.role] < ROLE_RANK[minRole]) {
    throw new Error(
      `FORBIDDEN: role ${user.role} is below required ${minRole}`,
    );
  }
  return user;
}

/**
 * Convenience helper for /admin gates. Returns null if not admin (caller
 * should redirect to '/'). Use this in server components instead of
 * `requireRole("ADMIN")` when you want a soft redirect rather than throw.
 */
export async function getAdminUser(): Promise<CitaUser | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  return user.role === "ADMIN" ? user : null;
}

async function mapUser(u: User): Promise<CitaUser> {
  const meta = (u.user_metadata ?? {}) as Record<string, unknown>;

  // Resolve role from DB. The Cita users.id mirrors Supabase user id.
  // Single fast lookup with covering index on `id` (PK).
  const dbUser = await prisma.user.findUnique({
    where: { id: u.id },
    select: { role: true, displayName: true },
  });

  const role: CitaUser["role"] =
    (dbUser?.role as CitaUser["role"] | undefined) ?? "REGISTERED";

  return {
    id: u.id,
    email: u.email ?? null,
    role,
    displayName:
      dbUser?.displayName ??
      (meta.full_name as string | undefined) ??
      (meta.name as string | undefined) ??
      null,
    avatarUrl: (meta.avatar_url as string | undefined) ?? null,
    createdAt: u.created_at,
    raw: u,
  };
}
