import "server-only";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/get-user";
import type { User as DbUser } from "@prisma/client";

const ANON_COOKIE = "cita_anon_id";

/**
 * Resolve the active Cita user record.
 *
 * Cita is anonymous-first:
 *   - Visitor with no Supabase auth + no `cita_anon_id` cookie  → null (caller decides whether to create)
 *   - Visitor with `cita_anon_id` cookie only                   → loads the existing anon User row (or null if cookie stale)
 *   - Authenticated Supabase user                               → loads the User row keyed by Supabase user id
 *
 * @returns DB User row, or null if no record exists yet.
 */
export async function getActiveUser(): Promise<DbUser | null> {
  const supabaseUser = await getCurrentUser();

  if (supabaseUser) {
    return prisma.user.findUnique({ where: { id: supabaseUser.id } });
  }

  const cookieStore = await cookies();
  const anonId = cookieStore.get(ANON_COOKIE)?.value;
  if (!anonId) return null;

  return prisma.user.findUnique({ where: { id: anonId } });
}

/**
 * Ensure a DB User row exists for the current visitor.
 *
 * Idempotent — safe to call multiple times. Side-effects:
 *   - If authenticated, upserts a row keyed by Supabase user.id and
 *     stamps email + displayName from auth metadata.
 *   - If anonymous with cookie, ensures the cookie's id has a row.
 *   - If anonymous WITHOUT cookie, callers should set the cookie first
 *     (we don't auto-set here because cookie writes need a Response
 *     context — usually a server action or route handler).
 */
export async function ensureUser(opts: {
  /** Anonymous id from cookie. Required if not authenticated. */
  anonId?: string | null;
}): Promise<DbUser | null> {
  const supabaseUser = await getCurrentUser();

  if (supabaseUser) {
    return prisma.user.upsert({
      where: { id: supabaseUser.id },
      create: {
        id: supabaseUser.id,
        email: supabaseUser.email,
        displayName: supabaseUser.displayName,
        isAnonymous: false,
      },
      update: {
        email: supabaseUser.email,
        displayName: supabaseUser.displayName,
        isAnonymous: false,
      },
    });
  }

  if (!opts.anonId) return null;

  return prisma.user.upsert({
    where: { id: opts.anonId },
    create: { id: opts.anonId, isAnonymous: true },
    update: {},
  });
}

/**
 * Migrate an anonymous user's data to the authenticated user record.
 *
 * Called once after successful login when the user previously had a
 * `cita_anon_id` cookie. Strategy:
 *   1. If anon row doesn't exist → no-op.
 *   2. If anon row exists and registered row exists → reassign all
 *      Attempt rows to registered user, then delete anon row.
 *   3. If anon row exists but registered row doesn't → rename anon
 *      row's id to authenticated id (via insert + update + delete in
 *      a transaction).
 *
 * Returns the count of attempts migrated.
 */
export async function migrateAnonToUser(args: {
  anonId: string;
  authenticatedUserId: string;
  email?: string | null;
  displayName?: string | null;
}): Promise<{ attemptsMigrated: number }> {
  const { anonId, authenticatedUserId, email, displayName } = args;

  if (anonId === authenticatedUserId) return { attemptsMigrated: 0 };

  return prisma.$transaction(async (tx) => {
    const anonRow = await tx.user.findUnique({ where: { id: anonId } });
    if (!anonRow) return { attemptsMigrated: 0 };

    // Ensure target user exists
    await tx.user.upsert({
      where: { id: authenticatedUserId },
      create: {
        id: authenticatedUserId,
        email: email ?? null,
        displayName: displayName ?? null,
        isAnonymous: false,
      },
      update: {
        email: email ?? undefined,
        displayName: displayName ?? undefined,
        isAnonymous: false,
      },
    });

    // Reassign attempts
    const updated = await tx.attempt.updateMany({
      where: { userId: anonId },
      data: { userId: authenticatedUserId },
    });

    // Drop anon row
    await tx.user.delete({ where: { id: anonId } });

    return { attemptsMigrated: updated.count };
  });
}
