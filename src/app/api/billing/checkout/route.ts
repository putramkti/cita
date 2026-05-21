/**
 * POST /api/billing/checkout
 *
 * Initiate a Premium upgrade. Authenticated users only.
 *
 *   1. Resolve user (Supabase). 401 if anon.
 *   2. Reject if user already PREMIUM ACTIVE (would double-pay).
 *   3. Create Order row (status=PENDING) with a unique midtransOrderId.
 *   4. Call Midtrans Snap to get a token.
 *   5. Persist token on the Order, return { token, redirectUrl } to client.
 *
 * Side effect: creates an Order. The actual Subscription change happens
 * only after Midtrans webhook confirms PAID.
 *
 * If Midtrans is not configured (placeholder env), returns 503 with a
 * "pembayaran sedang dipersiapkan" message — pricing UI surfaces this.
 */

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/get-user";
import { getCurrentPlan } from "@/lib/billing/get-plan";
import {
  createSnapTransaction,
  isMidtransConfigured,
} from "@/lib/billing/midtrans";
import { PLANS, PREMIUM_DURATION_DAYS } from "@/lib/billing/plans";
import type { Plan } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface CheckoutRequest {
  plan: Plan; // currently must be "PREMIUM"
}

function jsonError(status: number, message: string, code?: string) {
  return new Response(JSON.stringify({ error: { message, code } }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(request: NextRequest) {
  // Auth
  const user = await getCurrentUser();
  if (!user) {
    return jsonError(401, "Login dulu untuk upgrade.", "no_session");
  }

  // Parse
  let body: CheckoutRequest;
  try {
    body = (await request.json()) as CheckoutRequest;
  } catch {
    return jsonError(400, "Body tidak valid.", "invalid_body");
  }
  if (body.plan !== "PREMIUM") {
    return jsonError(400, "Plan tidak dikenal.", "invalid_plan");
  }

  // No double upgrade
  const currentPlan = await getCurrentPlan(user.id);
  if (currentPlan === "PREMIUM") {
    return jsonError(
      409,
      "Anda sudah berlangganan Premium.",
      "already_premium",
    );
  }

  // Midtrans guard — if env is placeholder, surface a friendly 503
  if (!isMidtransConfigured()) {
    return jsonError(
      503,
      "Pembayaran sedang dipersiapkan. Coba lagi sebentar.",
      "midtrans_not_configured",
    );
  }

  const planMeta = PLANS.PREMIUM;
  const amount = planMeta.priceIdr;

  // Generate a unique order id. Midtrans rule: 1-50 chars, alnum+dash+underscore.
  const ts = Date.now();
  const midtransOrderId = `cita-${user.id.slice(0, 12)}-${ts}`;

  // Create the Order row first (so even if Midtrans fails we have audit trail).
  const order = await prisma.order.create({
    data: {
      userId: user.id,
      plan: "PREMIUM",
      amount,
      durationDays: PREMIUM_DURATION_DAYS,
      status: "PENDING",
      midtransOrderId,
    },
    select: { id: true, midtransOrderId: true, amount: true },
  });

  // Resolve callback URL — prefer env, fall back to request origin.
  const origin =
    process.env.NEXT_PUBLIC_APP_URL ??
    request.headers.get("origin") ??
    new URL(request.url).origin;

  // Create Snap transaction
  let snap;
  try {
    snap = await createSnapTransaction({
      orderId: order.midtransOrderId,
      amountIdr: amount,
      customerEmail: user.email ?? `${user.id}@cita.local`,
      customerName: user.displayName ?? user.email ?? null,
      itemName: `Cita Premium — ${PREMIUM_DURATION_DAYS} hari`,
      callbackFinishUrl: `${origin}/akun/billing?status=success`,
    });
  } catch (e) {
    console.error("[billing/checkout] midtrans error", e);
    // Mark the order as FAILED so it doesn't dangle.
    await prisma.order
      .update({
        where: { id: order.id },
        data: { status: "FAILED", raw: { error: String(e) } as never },
      })
      .catch(() => {});
    return jsonError(
      502,
      "Gagal menghubungi gateway pembayaran.",
      "midtrans_create_failed",
    );
  }

  // Persist the Snap token so we can re-open the popup if the user closes it.
  await prisma.order.update({
    where: { id: order.id },
    data: { midtransSnapToken: snap.token },
  });

  return new Response(
    JSON.stringify({
      token: snap.token,
      redirectUrl: snap.redirectUrl,
      orderId: order.midtransOrderId,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
}
