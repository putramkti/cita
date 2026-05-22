import "server-only";
import { prisma } from "@/lib/db/prisma";
import { PREMIUM_DURATION_DAYS } from "@/lib/billing/plans";
import type { Prisma, Role } from "@prisma/client";

export interface UserListRow {
  id: string;
  email: string | null;
  displayName: string | null;
  isAnonymous: boolean;
  role: Role;
  createdAt: Date;
  attempts: number;
  paidOrders: number;
  subscription: {
    plan: string;
    status: string;
    expiresAt: Date | null;
  } | null;
}

export interface UserListResult {
  rows: UserListRow[];
  total: number;
  page: number;
  pageSize: number;
}

export async function listUsers(opts: {
  q?: string;
  role?: Role | "ALL";
  showAnon?: boolean;
  page?: number;
  pageSize?: number;
}): Promise<UserListResult> {
  const page = Math.max(1, opts.page ?? 1);
  const pageSize = Math.min(100, Math.max(10, opts.pageSize ?? 25));
  const where: Prisma.UserWhereInput = {};

  if (!opts.showAnon) where.isAnonymous = false;
  if (opts.role && opts.role !== "ALL") where.role = opts.role;

  if (opts.q && opts.q.trim()) {
    const q = opts.q.trim();
    where.OR = [
      { email: { contains: q, mode: "insensitive" } },
      { displayName: { contains: q, mode: "insensitive" } },
      { id: { contains: q } },
    ];
  }

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        email: true,
        displayName: true,
        isAnonymous: true,
        role: true,
        createdAt: true,
        _count: { select: { attempts: true } },
      },
    }),
  ]);

  // N+1 batched fetch for subscription + paid orders.
  const ids = users.map((u) => u.id);
  const [subs, orderCounts] = await Promise.all([
    prisma.subscription.findMany({
      where: { userId: { in: ids } },
      select: { userId: true, plan: true, status: true, expiresAt: true },
    }),
    prisma.order.groupBy({
      by: ["userId"],
      where: { userId: { in: ids }, status: "PAID" },
      _count: { _all: true },
    }),
  ]);

  const subMap = new Map(subs.map((s) => [s.userId, s]));
  const ordMap = new Map(orderCounts.map((o) => [o.userId, o._count._all]));

  return {
    rows: users.map((u) => {
      const sub = subMap.get(u.id);
      return {
        id: u.id,
        email: u.email,
        displayName: u.displayName,
        isAnonymous: u.isAnonymous,
        role: u.role,
        createdAt: u.createdAt,
        attempts: u._count.attempts,
        paidOrders: ordMap.get(u.id) ?? 0,
        subscription: sub
          ? {
              plan: sub.plan,
              status: sub.status,
              expiresAt: sub.expiresAt,
            }
          : null,
      };
    }),
    total,
    page,
    pageSize,
  };
}

export interface UserDetail {
  user: {
    id: string;
    email: string | null;
    displayName: string | null;
    isAnonymous: boolean;
    role: Role;
    createdAt: Date;
    updatedAt: Date;
  };
  subscription: {
    id: string;
    plan: string;
    status: string;
    startedAt: Date;
    expiresAt: Date | null;
    cancelledAt: Date | null;
    autoRenew: boolean;
    lastOrderId: string | null;
  } | null;
  attempts: Array<{
    id: string;
    mode: string;
    status: string;
    startedAt: Date;
    finishedAt: Date | null;
    totalScore: number | null;
    passingStatus: string | null;
  }>;
  orders: Array<{
    id: string;
    plan: string;
    amount: number;
    status: string;
    midtransOrderId: string;
    paidAt: Date | null;
    createdAt: Date;
  }>;
  tutorMsgsTotal: number;
}

export async function getUserDetail(id: string): Promise<UserDetail | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      displayName: true,
      isAnonymous: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!user) return null;

  const [subscription, attempts, orders, tutorMsgsTotal] = await Promise.all([
    prisma.subscription.findUnique({
      where: { userId: id },
      select: {
        id: true,
        plan: true,
        status: true,
        startedAt: true,
        expiresAt: true,
        cancelledAt: true,
        autoRenew: true,
        lastOrderId: true,
      },
    }),
    prisma.attempt.findMany({
      where: { userId: id },
      orderBy: { startedAt: "desc" },
      take: 20,
      select: {
        id: true,
        mode: true,
        status: true,
        startedAt: true,
        finishedAt: true,
        totalScore: true,
        passingStatus: true,
      },
    }),
    prisma.order.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        plan: true,
        amount: true,
        status: true,
        midtransOrderId: true,
        paidAt: true,
        createdAt: true,
      },
    }),
    // No FK relation between ExplainerMessage and Attempt — join in JS
    // via attemptIds list. Cheap because per-user attempt count is small.
    (async () => {
      const userAttemptIds = await prisma.attempt.findMany({
        where: { userId: id },
        select: { id: true },
      });
      if (userAttemptIds.length === 0) return 0;
      return prisma.explainerMessage.count({
        where: {
          role: "user",
          attemptId: { in: userAttemptIds.map((a) => a.id) },
        },
      });
    })(),
  ]);

  return { user, subscription, attempts, orders, tutorMsgsTotal };
}

/**
 * Update a user's role. Used by /admin/users/[id] to promote/demote.
 *
 * Side-effect: PREMIUM role is also reflected in Subscription. Setting
 * role = PREMIUM creates an ACTIVE subscription with expiresAt =
 * now + PREMIUM_DURATION_DAYS if the user doesn't have one. Demoting
 * from PREMIUM does NOT auto-cancel the subscription — that decision
 * stays explicit (use the subscriptions module).
 */
export async function setUserRole(
  userId: string,
  role: Role,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    await tx.user.update({
      where: { id: userId },
      data: { role },
    });

    if (role === "PREMIUM") {
      const existing = await tx.subscription.findUnique({
        where: { userId },
      });
      if (!existing) {
        const now = new Date();
        const expires = new Date(
          now.getTime() + PREMIUM_DURATION_DAYS * 24 * 60 * 60 * 1000,
        );
        await tx.subscription.create({
          data: {
            userId,
            plan: "PREMIUM",
            status: "ACTIVE",
            startedAt: now,
            expiresAt: expires,
            autoRenew: false,
          },
        });
      }
    }
  });
}

/**
 * Manually grant Premium for N days, additive on top of any existing
 * expiresAt. If user has no subscription row, creates one starting now.
 *
 * If existing subscription is EXPIRED, treat as fresh grant (start = now).
 * If ACTIVE/CANCELLED with future expiresAt, extend that date.
 */
export async function grantPremium(
  userId: string,
  days: number,
): Promise<{ newExpiresAt: Date }> {
  if (days <= 0 || days > 365) {
    throw new Error("days must be in (0, 365]");
  }
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    const now = new Date();
    const ms = days * 24 * 60 * 60 * 1000;

    const existing = await tx.subscription.findUnique({
      where: { userId },
    });

    let newExpires: Date;
    if (
      existing &&
      (existing.status === "ACTIVE" || existing.status === "CANCELLED") &&
      existing.expiresAt &&
      existing.expiresAt.getTime() > now.getTime()
    ) {
      newExpires = new Date(existing.expiresAt.getTime() + ms);
    } else {
      newExpires = new Date(now.getTime() + ms);
    }

    if (existing) {
      await tx.subscription.update({
        where: { userId },
        data: {
          plan: "PREMIUM",
          status: "ACTIVE",
          expiresAt: newExpires,
          startedAt: existing.startedAt ?? now,
        },
      });
    } else {
      await tx.subscription.create({
        data: {
          userId,
          plan: "PREMIUM",
          status: "ACTIVE",
          startedAt: now,
          expiresAt: newExpires,
          autoRenew: false,
        },
      });
    }

    // Mirror role for fast filter.
    if (user.role !== "ADMIN" && user.role !== "MODERATOR") {
      await tx.user.update({
        where: { id: userId },
        data: { role: "PREMIUM" },
      });
    }

    return { newExpiresAt: newExpires };
  });
}
