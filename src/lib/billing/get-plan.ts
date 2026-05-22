/**
 * Cita Billing — Plan resolution per user.
 *
 * Reads Subscription row, returns canonical plan considering expiry/cancel.
 * Anonymous viewers (no userId) → "ANON".
 *
 * Lazy-expire pattern: if ACTIVE but past expiresAt, mark EXPIRED on access.
 * Cron job can do bulk cleanup later, but this guarantees correctness on
 * every access.
 */

import "server-only";
import { prisma } from "@/lib/db/prisma";
import type { Plan } from "@prisma/client";
import type { ResolvedPlan } from "./entitlements";

/**
 * Get the canonical plan for a user (or "ANON" when no userId).
 *
 *   - No subscription row     → FREE (registered) or ANON (no userId)
 *   - ACTIVE non-expired      → plan
 *   - ACTIVE but past expires → lazily mark EXPIRED, return FREE
 *   - CANCELLED non-expired   → plan (still has access until expiry)
 *   - EXPIRED                 → FREE
 *   - PENDING                 → FREE (payment not confirmed yet)
 */
export async function getCurrentPlan(
  userId: string | null,
): Promise<ResolvedPlan> {
  if (!userId) return "ANON";

  const sub = await prisma.subscription.findUnique({
    where: { userId },
    select: {
      id: true,
      plan: true,
      status: true,
      expiresAt: true,
    },
  });

  if (!sub) return "FREE";

  // Lazy expire — ACTIVE/CANCELLED past expiresAt => transition to EXPIRED.
  if (
    (sub.status === "ACTIVE" || sub.status === "CANCELLED") &&
    sub.expiresAt &&
    sub.expiresAt.getTime() < Date.now()
  ) {
    await prisma.subscription.update({
      where: { id: sub.id },
      data: { status: "EXPIRED" },
    });
    return "FREE";
  }

  if (sub.status === "ACTIVE" || sub.status === "CANCELLED") {
    return sub.plan as Plan;
  }

  // PENDING / EXPIRED → FREE access
  return "FREE";
}

/**
 * Get full subscription info for UI rendering at /akun/billing.
 * Returns null if no subscription row (treat as FREE forever).
 */
export async function getSubscriptionDetails(userId: string) {
  return prisma.subscription.findUnique({
    where: { userId },
    select: {
      id: true,
      plan: true,
      status: true,
      startedAt: true,
      expiresAt: true,
      cancelledAt: true,
      autoRenew: true,
      lastOrderId: true,
      updatedAt: true,
    },
  });
}
