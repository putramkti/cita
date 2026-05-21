import "server-only";
import { createClient } from "@/utils/supabase/server";
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
 * Stored in `user_metadata.role` (default: REGISTERED on first login).
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

function mapUser(u: User): CitaUser {
  const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
  const rawRole = (meta.role as string | undefined)?.toUpperCase();
  const role: CitaUser["role"] =
    rawRole && rawRole in ROLE_RANK
      ? (rawRole as CitaUser["role"])
      : "REGISTERED";

  return {
    id: u.id,
    email: u.email ?? null,
    role,
    displayName:
      (meta.full_name as string | undefined) ??
      (meta.name as string | undefined) ??
      null,
    avatarUrl: (meta.avatar_url as string | undefined) ?? null,
    createdAt: u.created_at,
    raw: u,
  };
}
