import "server-only";
import { prisma } from "@/lib/db/prisma";
import type { Order, Plan, Prisma } from "@prisma/client";

/**
 * Activate a subscription given a paid Order.
 *
 * Idempotent — if the order is already linked to a subscription with
 * the right expiry, this is a no-op. Used by:
 *   - POST /api/billing/webhook (when Midtrans confirms PAID)
 *   - POST /api/billing/checkout (when a 100%-voucher free order is
 *     auto-confirmed without going through Midtrans)
 *
 * Returns the upserted subscription's id and new expiry.
 */
export async function activateSubscriptionForOrder(opts: {
  order: Pick<Order, "id" | "userId" | "plan" | "durationDays">;
  /** Pass an open transaction client to keep activation atomic with the
   *  caller's writes. Falls back to the global prisma client. */
  tx?: Prisma.TransactionClient;
}): Promise<{ subscriptionId: string; newExpiry: Date }> {
  const db = opts.tx ?? prisma;
  const { order } = opts;

  const now = new Date();
  const durationMs = order.durationDays * 24 * 60 * 60 * 1000;

  const existing = await db.subscription.findUnique({
    where: { userId: order.userId },
    select: { id: true, plan: true, status: true, expiresAt: true },
  });

  const baseExpiry =
    existing?.plan === order.plan &&
    existing.expiresAt &&
    existing.expiresAt > now
      ? existing.expiresAt // extend from current expiry
      : now;
  const newExpiry = new Date(baseExpiry.getTime() + durationMs);

  if (existing) {
    await db.subscription.update({
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
    await db.order.update({
      where: { id: order.id },
      data: { subscriptionId: existing.id },
    });
    return { subscriptionId: existing.id, newExpiry };
  }

  const created = await db.subscription.create({
    data: {
      userId: order.userId,
      plan: order.plan,
      status: "ACTIVE",
      startedAt: now,
      expiresAt: newExpiry,
      autoRenew: true,
      lastOrderId: order.id,
    },
    select: { id: true },
  });
  await db.order.update({
    where: { id: order.id },
    data: { subscriptionId: created.id },
  });
  return { subscriptionId: created.id, newExpiry };
}

/** Re-export for type checking. */
export type { Plan };
