/**
 * Cita Billing — Tutor daily usage tracker.
 *
 * Counts user → tutor message-sent events keyed by (userId, dateUtc).
 * Reset = a new day creates a new row (no cron needed).
 *
 * `incrementTutorUsage` is atomic via Prisma upsert.
 *
 *   1. Read current usage:    `getTutorUsageToday(userId)` → number
 *   2. Check quota:           `quota(plan, "tutorDailyQuota") - usage > 0`
 *   3. Increment:             `incrementTutorUsage(userId)`
 */

import "server-only";
import { prisma } from "@/lib/db/prisma";

/** Returns YYYY-MM-DD at 00:00:00 UTC for date-only Prisma column. */
function todayUtcDate(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

/** Read today's count for a given user. Returns 0 if no row yet. */
export async function getTutorUsageToday(userId: string): Promise<number> {
  const row = await prisma.tutorUsage.findUnique({
    where: { userId_date: { userId, date: todayUtcDate() } },
    select: { count: true },
  });
  return row?.count ?? 0;
}

/**
 * Atomic increment-or-create today's row. Returns the new count value.
 * Prisma upsert is single-roundtrip on Postgres ON CONFLICT.
 */
export async function incrementTutorUsage(userId: string): Promise<number> {
  const date = todayUtcDate();
  const row = await prisma.tutorUsage.upsert({
    where: { userId_date: { userId, date } },
    create: { userId, date, count: 1 },
    update: { count: { increment: 1 } },
    select: { count: true },
  });
  return row.count;
}

/**
 * Shape used by /api/explain to decide allow/deny + remaining messages.
 */
export interface TutorQuotaCheck {
  allowed: boolean;
  used: number;
  limit: number;
  remaining: number;
}

/** Check (without mutating) whether the user can send another tutor msg. */
export async function checkTutorQuota(
  userId: string,
  limit: number,
): Promise<TutorQuotaCheck> {
  const used = await getTutorUsageToday(userId);
  return {
    allowed: used < limit,
    used,
    limit,
    remaining: Math.max(0, limit - used),
  };
}
