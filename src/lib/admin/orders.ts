import "server-only";
import { prisma } from "@/lib/db/prisma";
import {
  fetchMidtransStatus,
  midtransStatusToPaymentStatus,
  isMidtransConfigured,
} from "@/lib/billing/midtrans";
import type { PaymentStatus, Prisma } from "@prisma/client";

export interface OrderListRow {
  id: string;
  midtransOrderId: string;
  userId: string;
  userEmail: string | null;
  userDisplayName: string | null;
  plan: string;
  amount: number;
  status: PaymentStatus;
  paidAt: Date | null;
  createdAt: Date;
}

export interface OrderListResult {
  rows: OrderListRow[];
  total: number;
  page: number;
  pageSize: number;
}

export async function listOrders(opts: {
  status?: PaymentStatus | "ALL";
  q?: string;
  page?: number;
  pageSize?: number;
}): Promise<OrderListResult> {
  const page = Math.max(1, opts.page ?? 1);
  const pageSize = Math.min(100, Math.max(10, opts.pageSize ?? 25));
  const where: Prisma.OrderWhereInput = {};

  if (opts.status && opts.status !== "ALL") where.status = opts.status;
  if (opts.q && opts.q.trim()) {
    const q = opts.q.trim();
    where.OR = [
      { midtransOrderId: { contains: q, mode: "insensitive" } },
      { id: { contains: q } },
      { userId: { contains: q } },
    ];
  }

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        midtransOrderId: true,
        userId: true,
        plan: true,
        amount: true,
        status: true,
        paidAt: true,
        createdAt: true,
      },
    }),
  ]);

  // Batch user lookup
  const userIds = Array.from(new Set(orders.map((o) => o.userId)));
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, email: true, displayName: true },
  });
  const userMap = new Map(users.map((u) => [u.id, u]));

  return {
    rows: orders.map((o) => ({
      id: o.id,
      midtransOrderId: o.midtransOrderId,
      userId: o.userId,
      userEmail: userMap.get(o.userId)?.email ?? null,
      userDisplayName: userMap.get(o.userId)?.displayName ?? null,
      plan: o.plan,
      amount: o.amount,
      status: o.status,
      paidAt: o.paidAt,
      createdAt: o.createdAt,
    })),
    total,
    page,
    pageSize,
  };
}

export async function getOrderDetail(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      subscription: {
        select: {
          id: true,
          plan: true,
          status: true,
          startedAt: true,
          expiresAt: true,
        },
      },
    },
  });
  if (!order) return null;
  const user = await prisma.user.findUnique({
    where: { id: order.userId },
    select: { id: true, email: true, displayName: true, role: true },
  });
  return { order, user };
}

/**
 * Sync an order's status with Midtrans (read-only on Midtrans side).
 *
 * Use case: webhook URL was missing during the payment, so our DB still
 * shows PENDING but Midtrans already has settlement. This calls Midtrans
 * Status API and applies the same Order → Subscription transition logic
 * as the webhook handler.
 *
 * Idempotent. Returns the new payment status + whether DB changed.
 */
export async function syncOrderFromMidtrans(orderId: string): Promise<{
  found: boolean;
  newStatus: PaymentStatus | null;
  changed: boolean;
}> {
  if (!isMidtransConfigured()) {
    throw new Error("midtrans_not_configured");
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      userId: true,
      plan: true,
      durationDays: true,
      status: true,
      paidAt: true,
      midtransOrderId: true,
    },
  });
  if (!order) throw new Error("order_not_found");

  const remote = await fetchMidtransStatus(order.midtransOrderId);
  if (!remote) return { found: false, newStatus: null, changed: false };

  const newStatus = midtransStatusToPaymentStatus({
    transactionStatus: remote.transaction_status,
    fraudStatus: remote.fraud_status,
  });

  if (newStatus === order.status) {
    return { found: true, newStatus, changed: false };
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: newStatus,
      midtransTxId: remote.transaction_id ?? null,
      paidAt:
        newStatus === "PAID" && !order.paidAt
          ? new Date()
          : order.paidAt ?? null,
      raw: remote as unknown as object,
    },
  });

  if (newStatus === "PAID") {
    const now = new Date();
    const durationMs = order.durationDays * 24 * 60 * 60 * 1000;

    const existing = await prisma.subscription.findUnique({
      where: { userId: order.userId },
      select: { id: true, plan: true, status: true, expiresAt: true },
    });

    const baseExpiry =
      existing?.plan === order.plan &&
      existing.expiresAt &&
      existing.expiresAt > now
        ? existing.expiresAt
        : now;
    const newExpiry = new Date(baseExpiry.getTime() + durationMs);

    if (existing) {
      await prisma.subscription.update({
        where: { id: existing.id },
        data: {
          plan: order.plan,
          status: "ACTIVE",
          startedAt: existing.status === "ACTIVE" ? undefined : now,
          expiresAt: newExpiry,
          cancelledAt: null,
          autoRenew: true,
          lastOrderId: order.id,
        },
      });
      await prisma.order.update({
        where: { id: order.id },
        data: { subscriptionId: existing.id },
      });
    } else {
      const created = await prisma.subscription.create({
        data: {
          userId: order.userId,
          plan: order.plan,
          status: "ACTIVE",
          startedAt: now,
          expiresAt: newExpiry,
          autoRenew: true,
          lastOrderId: order.id,
        },
      });
      await prisma.order.update({
        where: { id: order.id },
        data: { subscriptionId: created.id },
      });
    }

    // Mirror role for fast filter (preserve elevated roles).
    const u = await prisma.user.findUnique({
      where: { id: order.userId },
      select: { role: true },
    });
    if (u && u.role !== "ADMIN" && u.role !== "MODERATOR") {
      await prisma.user.update({
        where: { id: order.userId },
        data: { role: "PREMIUM" },
      });
    }
  }

  return { found: true, newStatus, changed: true };
}
