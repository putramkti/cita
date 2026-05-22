import "server-only";
import { prisma } from "@/lib/db/prisma";

/**
 * Admin metric snapshots.
 *
 * Each function returns a small typed payload tailored for one admin
 * card or chart. Keep functions focused and independently cachable.
 *
 * Heavy aggregations are written as raw SQL (`$queryRaw`) for perf —
 * Prisma's groupBy on date-truncated columns isn't ergonomic.
 */

export interface OverviewStats {
  users: {
    total: number;
    registered: number;
    premium: number;
    moderator: number;
    admin: number;
    anon: number;
    newToday: number;
    new7d: number;
  };
  attempts: {
    today: number;
    sevenDays: number;
    inProgress: number;
  };
  tutor: {
    msgsToday: number;
    msgs7d: number;
    activeUsersToday: number;
  };
  billing: {
    activeSubscriptions: number;
    expiredSubscriptions: number;
    cancelledSubscriptions: number;
    paidOrdersToday: number;
    paidOrders7d: number;
    revenueIdrToday: number;
    revenueIdr7d: number;
    revenueIdr30d: number;
    pendingOrders: number;
  };
}

function dayUtcOffset(daysAgo = 0): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - daysAgo),
  );
}

export async function getOverviewStats(): Promise<OverviewStats> {
  const today = dayUtcOffset(0);
  const seven = dayUtcOffset(7);
  const thirty = dayUtcOffset(30);

  const [
    userTotal,
    registered,
    premium,
    moderator,
    admin,
    anon,
    newToday,
    new7d,
    attemptsToday,
    attempts7d,
    inProgress,
    tutorToday,
    tutor7d,
    activeTutorToday,
    activeSubs,
    expiredSubs,
    cancelledSubs,
    paidToday,
    paid7d,
    revToday,
    rev7d,
    rev30d,
    pendingOrders,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "REGISTERED", isAnonymous: false } }),
    prisma.user.count({ where: { role: "PREMIUM" } }),
    prisma.user.count({ where: { role: "MODERATOR" } }),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.user.count({ where: { isAnonymous: true } }),
    prisma.user.count({
      where: { isAnonymous: false, createdAt: { gte: today } },
    }),
    prisma.user.count({
      where: { isAnonymous: false, createdAt: { gte: seven } },
    }),
    prisma.attempt.count({ where: { startedAt: { gte: today } } }),
    prisma.attempt.count({ where: { startedAt: { gte: seven } } }),
    prisma.attempt.count({ where: { status: "IN_PROGRESS" } }),
    prisma.explainerMessage.count({
      where: { role: "user", createdAt: { gte: today } },
    }),
    prisma.explainerMessage.count({
      where: { role: "user", createdAt: { gte: seven } },
    }),
    prisma.tutorUsage
      .findMany({
        where: { date: today },
        select: { userId: true },
      })
      .then((rows) => new Set(rows.map((r) => r.userId)).size),
    prisma.subscription.count({
      where: { plan: "PREMIUM", status: "ACTIVE" },
    }),
    prisma.subscription.count({
      where: { status: "EXPIRED" },
    }),
    prisma.subscription.count({
      where: { status: "CANCELLED" },
    }),
    prisma.order.count({
      where: { status: "PAID", paidAt: { gte: today } },
    }),
    prisma.order.count({
      where: { status: "PAID", paidAt: { gte: seven } },
    }),
    prisma.order.aggregate({
      where: { status: "PAID", paidAt: { gte: today } },
      _sum: { amount: true },
    }),
    prisma.order.aggregate({
      where: { status: "PAID", paidAt: { gte: seven } },
      _sum: { amount: true },
    }),
    prisma.order.aggregate({
      where: { status: "PAID", paidAt: { gte: thirty } },
      _sum: { amount: true },
    }),
    prisma.order.count({ where: { status: "PENDING" } }),
  ]);

  return {
    users: {
      total: userTotal,
      registered,
      premium,
      moderator,
      admin,
      anon,
      newToday,
      new7d,
    },
    attempts: {
      today: attemptsToday,
      sevenDays: attempts7d,
      inProgress,
    },
    tutor: {
      msgsToday: tutorToday,
      msgs7d: tutor7d,
      activeUsersToday: activeTutorToday,
    },
    billing: {
      activeSubscriptions: activeSubs,
      expiredSubscriptions: expiredSubs,
      cancelledSubscriptions: cancelledSubs,
      paidOrdersToday: paidToday,
      paidOrders7d: paid7d,
      revenueIdrToday: revToday._sum.amount ?? 0,
      revenueIdr7d: rev7d._sum.amount ?? 0,
      revenueIdr30d: rev30d._sum.amount ?? 0,
      pendingOrders,
    },
  };
}

/**
 * Daily counts for the past N days (default 7). Used for sparkline / bar
 * charts on the admin dashboard.
 *
 * Returns { date: 'YYYY-MM-DD', signups, paidOrders, attempts, tutorMsgs }
 * for each day, oldest first.
 */
export interface DailyPoint {
  date: string;
  signups: number;
  paidOrders: number;
  attempts: number;
  tutorMsgs: number;
}

export async function getDailySeries(days = 7): Promise<DailyPoint[]> {
  const start = dayUtcOffset(days - 1);

  // Pull raw rows then bucket in JS — N is small (<=30), no perf concern.
  const [users, orders, attempts, tutorMsgs] = await Promise.all([
    prisma.user.findMany({
      where: { isAnonymous: false, createdAt: { gte: start } },
      select: { createdAt: true },
    }),
    prisma.order.findMany({
      where: { status: "PAID", paidAt: { gte: start, not: null } },
      select: { paidAt: true, amount: true },
    }),
    prisma.attempt.findMany({
      where: { startedAt: { gte: start } },
      select: { startedAt: true },
    }),
    prisma.explainerMessage.findMany({
      where: { role: "user", createdAt: { gte: start } },
      select: { createdAt: true },
    }),
  ]);

  function dayKey(d: Date): string {
    return new Date(
      Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
    )
      .toISOString()
      .slice(0, 10);
  }

  const buckets = new Map<string, DailyPoint>();
  for (let i = 0; i < days; i++) {
    const key = dayKey(dayUtcOffset(days - 1 - i));
    buckets.set(key, {
      date: key,
      signups: 0,
      paidOrders: 0,
      attempts: 0,
      tutorMsgs: 0,
    });
  }

  for (const u of users) {
    const k = dayKey(u.createdAt);
    const b = buckets.get(k);
    if (b) b.signups += 1;
  }
  for (const o of orders) {
    if (!o.paidAt) continue;
    const k = dayKey(o.paidAt);
    const b = buckets.get(k);
    if (b) b.paidOrders += 1;
  }
  for (const a of attempts) {
    const k = dayKey(a.startedAt);
    const b = buckets.get(k);
    if (b) b.attempts += 1;
  }
  for (const m of tutorMsgs) {
    const k = dayKey(m.createdAt);
    const b = buckets.get(k);
    if (b) b.tutorMsgs += 1;
  }

  return Array.from(buckets.values());
}
