import "server-only";
import { prisma } from "@/lib/db/prisma";
import type {
  Plan,
  Prisma,
  SubscriptionStatus,
} from "@prisma/client";

export interface SubListRow {
  id: string;
  userId: string;
  userEmail: string | null;
  userDisplayName: string | null;
  plan: Plan;
  status: SubscriptionStatus;
  startedAt: Date;
  expiresAt: Date | null;
  cancelledAt: Date | null;
  autoRenew: boolean;
  lastOrderId: string | null;
  updatedAt: Date;
}

export interface SubListResult {
  rows: SubListRow[];
  total: number;
  page: number;
  pageSize: number;
}

export async function listSubscriptions(opts: {
  status?: SubscriptionStatus | "ALL";
  q?: string;
  page?: number;
  pageSize?: number;
}): Promise<SubListResult> {
  const page = Math.max(1, opts.page ?? 1);
  const pageSize = Math.min(100, Math.max(10, opts.pageSize ?? 25));
  const where: Prisma.SubscriptionWhereInput = {};

  if (opts.status && opts.status !== "ALL") where.status = opts.status;
  if (opts.q && opts.q.trim()) {
    const q = opts.q.trim();
    where.userId = { contains: q };
  }

  const [total, subs] = await Promise.all([
    prisma.subscription.count({ where }),
    prisma.subscription.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        userId: true,
        plan: true,
        status: true,
        startedAt: true,
        expiresAt: true,
        cancelledAt: true,
        autoRenew: true,
        lastOrderId: true,
        updatedAt: true,
      },
    }),
  ]);

  const userIds = Array.from(new Set(subs.map((s) => s.userId)));
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, email: true, displayName: true },
  });
  const userMap = new Map(users.map((u) => [u.id, u]));

  return {
    rows: subs.map((s) => ({
      ...s,
      userEmail: userMap.get(s.userId)?.email ?? null,
      userDisplayName: userMap.get(s.userId)?.displayName ?? null,
    })),
    total,
    page,
    pageSize,
  };
}

/**
 * Override the expiresAt of a subscription. Used to:
 *   - Compensation (extend by N days for ops issue)
 *   - Truncation (refund: shorten to today)
 *
 * Note: status & role mirroring NOT touched here. Use cancelSubscription
 * for the no-longer-active case.
 */
export async function setSubscriptionExpiry(
  subscriptionId: string,
  newExpiresAt: Date,
): Promise<void> {
  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: { expiresAt: newExpiresAt },
  });
}

/**
 * Force cancel a subscription. The user keeps access until expiresAt
 * (matches user-initiated cancel semantics from /api/billing/cancel).
 *
 * If `revokeNow=true`, also moves expiresAt to now and demotes role.
 */
export async function cancelSubscription(
  subscriptionId: string,
  opts: { revokeNow?: boolean } = {},
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const sub = await tx.subscription.findUnique({
      where: { id: subscriptionId },
      select: { id: true, userId: true, expiresAt: true },
    });
    if (!sub) throw new Error("subscription_not_found");

    const now = new Date();
    await tx.subscription.update({
      where: { id: sub.id },
      data: {
        status: opts.revokeNow ? "EXPIRED" : "CANCELLED",
        cancelledAt: now,
        expiresAt: opts.revokeNow ? now : sub.expiresAt,
        autoRenew: false,
      },
    });

    if (opts.revokeNow) {
      const u = await tx.user.findUnique({
        where: { id: sub.userId },
        select: { role: true },
      });
      if (u && u.role === "PREMIUM") {
        await tx.user.update({
          where: { id: sub.userId },
          data: { role: "REGISTERED" },
        });
      }
    }
  });
}

/**
 * Re-activate a cancelled or expired subscription, granting N days from
 * now. If the subscription doesn't exist, throws — use grantPremium on
 * the users module instead.
 */
export async function reactivateSubscription(
  subscriptionId: string,
  days: number,
): Promise<void> {
  if (days <= 0 || days > 365) throw new Error("days must be in (0, 365]");
  const ms = days * 24 * 60 * 60 * 1000;
  const newExpiry = new Date(Date.now() + ms);

  await prisma.$transaction(async (tx) => {
    const sub = await tx.subscription.findUnique({
      where: { id: subscriptionId },
      select: { id: true, userId: true },
    });
    if (!sub) throw new Error("subscription_not_found");

    await tx.subscription.update({
      where: { id: sub.id },
      data: {
        status: "ACTIVE",
        expiresAt: newExpiry,
        cancelledAt: null,
        autoRenew: false, // Stay manual until user opts back in.
      },
    });

    // Mirror role.
    const u = await tx.user.findUnique({
      where: { id: sub.userId },
      select: { role: true },
    });
    if (u && u.role !== "ADMIN" && u.role !== "MODERATOR") {
      await tx.user.update({
        where: { id: sub.userId },
        data: { role: "PREMIUM" },
      });
    }
  });
}

export async function getSubscriptionDetail(id: string) {
  const sub = await prisma.subscription.findUnique({
    where: { id },
    include: {
      orders: {
        select: {
          id: true,
          midtransOrderId: true,
          plan: true,
          amount: true,
          status: true,
          paidAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!sub) return null;
  const user = await prisma.user.findUnique({
    where: { id: sub.userId },
    select: { id: true, email: true, displayName: true, role: true },
  });
  return { sub, user };
}
