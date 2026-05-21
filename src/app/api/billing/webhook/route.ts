/**
 * POST /api/billing/webhook
 *
 * Midtrans HTTP Notification handler.
 *
 *   1. Verify signature (sha512 of order_id + status_code + gross_amount + serverKey).
 *   2. Look up Order by midtransOrderId. 404 if unknown.
 *   3. Update Order.status from Midtrans transaction_status / fraud_status.
 *   4. If PAID → upsert Subscription (extend or create).
 *
 * Idempotent: replaying the same notification is safe.
 *
 * Midtrans recommends responding 200 OK for any received event so they
 * don't keep retrying. Bad signatures still return 401 because that's
 * the documented "not from us" response.
 *
 * Reference: https://docs.midtrans.com/en/after-payment/http-notification
 */

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import {
  midtransStatusToPaymentStatus,
  verifyWebhookSignature,
} from "@/lib/billing/midtrans";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface MidtransNotification {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
  transaction_status: string;
  fraud_status?: string;
  transaction_id?: string;
  payment_type?: string;
  transaction_time?: string;
  expiry_time?: string;
}

function ok(message: string, extra?: Record<string, unknown>) {
  return new Response(JSON.stringify({ message, ...extra }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function err(status: number, message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(request: NextRequest) {
  let payload: MidtransNotification;
  try {
    payload = (await request.json()) as MidtransNotification;
  } catch {
    return err(400, "invalid_body");
  }

  if (!payload.order_id || !payload.signature_key) {
    return err(400, "missing_fields");
  }

  // Verify signature first — reject anything not signed with our server key.
  const signatureOk = verifyWebhookSignature({
    order_id: payload.order_id,
    status_code: payload.status_code,
    gross_amount: payload.gross_amount,
    signature_key: payload.signature_key,
  });

  if (!signatureOk) {
    console.warn(
      "[billing/webhook] bad signature for order",
      payload.order_id,
    );
    return err(401, "bad_signature");
  }

  // Find the order
  const order = await prisma.order.findUnique({
    where: { midtransOrderId: payload.order_id },
    select: {
      id: true,
      userId: true,
      plan: true,
      durationDays: true,
      status: true,
      paidAt: true,
    },
  });

  if (!order) {
    console.warn("[billing/webhook] unknown order", payload.order_id);
    return err(404, "order_not_found");
  }

  const newStatus = midtransStatusToPaymentStatus({
    transactionStatus: payload.transaction_status,
    fraudStatus: payload.fraud_status,
  });

  // Idempotency: if already PAID and event repeats, just ack.
  if (order.status === "PAID" && newStatus === "PAID") {
    return ok("already_paid", { orderId: payload.order_id });
  }

  // Update Order row first
  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: newStatus,
      midtransTxId: payload.transaction_id ?? null,
      paidAt:
        newStatus === "PAID" && !order.paidAt
          ? new Date()
          : order.paidAt ?? null,
      raw: payload as unknown as object,
    },
  });

  // PAID transition → upsert Subscription (extend if existing PREMIUM, else create)
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
        ? existing.expiresAt // extend from current expiry
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
      // Link order to subscription
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
  }

  return ok("processed", {
    orderId: payload.order_id,
    status: newStatus,
  });
}
