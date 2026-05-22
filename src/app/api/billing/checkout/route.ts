/**
 * POST /api/billing/checkout
 *
 * Initiate a Premium upgrade. Authenticated users only.
 *
 *   1. Resolve user (Supabase). 401 if anon.
 *   2. Reject if user already PREMIUM ACTIVE.
 *   3. (Optional) Validate voucher code → compute final amount.
 *   4. If finalAmount === 0 (100% voucher):
 *        - Create Order with status=PAID, paidAt=now, midtransOrderId
 *          prefixed `cita-free-`, no Snap call.
 *        - Activate subscription immediately.
 *        - Record VoucherRedemption.
 *        - Return { free: true, redirectUrl: '/akun/billing?status=success' }.
 *   5. Otherwise (finalAmount > 0):
 *        - Create Order with status=PENDING.
 *        - Create Snap transaction with finalAmount.
 *        - If voucher used, record VoucherRedemption (so quota is
 *          reserved even before payment confirms — webhook will
 *          confirm or revert via standard order-status update).
 *        - Return { token, redirectUrl } as before.
 *
 * Free-after-voucher orders never touch Midtrans. The webhook handler
 * is unaffected because it looks up Orders by `midtransOrderId` and
 * those orders are already PAID.
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
import { validateVoucher } from "@/lib/billing/vouchers";
import { activateSubscriptionForOrder } from "@/lib/billing/activate-subscription";
import type { Plan } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface CheckoutRequest {
  plan: Plan;
  voucherCode?: string;
}

function jsonError(status: number, message: string, code?: string) {
  return new Response(JSON.stringify({ error: { message, code } }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return jsonError(401, "Login dulu untuk upgrade.", "no_session");
  }

  let body: CheckoutRequest;
  try {
    body = (await request.json()) as CheckoutRequest;
  } catch {
    return jsonError(400, "Body tidak valid.", "invalid_body");
  }
  if (body.plan !== "PREMIUM") {
    return jsonError(400, "Plan tidak dikenal.", "invalid_plan");
  }

  const currentPlan = await getCurrentPlan(user.id);
  if (currentPlan === "PREMIUM") {
    return jsonError(
      409,
      "Anda sudah berlangganan Premium.",
      "already_premium",
    );
  }

  const planMeta = PLANS.PREMIUM;
  const listPriceIdr = planMeta.priceIdr;

  // ── Voucher validation (optional) ──
  let finalAmount = listPriceIdr;
  let discountAmount = 0;
  let voucherCode: string | null = null;
  let voucherId: string | null = null;

  if (body.voucherCode && body.voucherCode.trim()) {
    const voucherResult = await validateVoucher({
      code: body.voucherCode,
      userId: user.id,
      plan: "PREMIUM",
      listPriceIdr,
    });
    if (!voucherResult.ok) {
      return jsonError(422, voucherResult.message, voucherResult.code);
    }
    finalAmount = voucherResult.finalAmount;
    discountAmount = voucherResult.discountAmount;
    voucherCode = voucherResult.voucher.code;
    voucherId = voucherResult.voucher.id;
  }

  const ts = Date.now();
  const isFree = finalAmount === 0;
  const midtransOrderId = isFree
    ? `cita-free-${user.id.slice(0, 8)}-${ts}`
    : `cita-${user.id.slice(0, 12)}-${ts}`;

  // ── Free-after-voucher path: skip Midtrans entirely ──
  if (isFree) {
    try {
      const order = await prisma.$transaction(async (tx) => {
        const created = await tx.order.create({
          data: {
            userId: user.id,
            plan: "PREMIUM",
            amount: 0,
            originalAmount: listPriceIdr,
            voucherCode,
            discountAmount,
            durationDays: PREMIUM_DURATION_DAYS,
            status: "PAID",
            paidAt: new Date(),
            midtransOrderId,
          },
        });

        await activateSubscriptionForOrder({ order: created, tx });

        if (voucherId) {
          await tx.voucherRedemption.create({
            data: {
              voucherId,
              userId: user.id,
              orderId: created.id,
              discountAmount,
              originalAmount: listPriceIdr,
              finalAmount: 0,
            },
          });
        }

        return created;
      });

      return new Response(
        JSON.stringify({
          free: true,
          orderId: order.midtransOrderId,
          redirectUrl: "/akun/billing?status=success",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    } catch (e) {
      console.error("[billing/checkout] free-order activation error", e);
      return jsonError(
        500,
        "Gagal mengaktifkan langganan dengan voucher. Coba lagi.",
        "free_activation_failed",
      );
    }
  }

  // ── Paid path: Midtrans Snap ──
  if (!isMidtransConfigured()) {
    return jsonError(
      503,
      "Pembayaran sedang dipersiapkan. Coba lagi sebentar.",
      "midtrans_not_configured",
    );
  }

  // Create the Order row first (audit trail) + reserve voucher slot.
  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        userId: user.id,
        plan: "PREMIUM",
        amount: finalAmount,
        originalAmount: listPriceIdr,
        voucherCode,
        discountAmount,
        durationDays: PREMIUM_DURATION_DAYS,
        status: "PENDING",
        midtransOrderId,
      },
      select: { id: true, midtransOrderId: true, amount: true },
    });

    if (voucherId) {
      // Reserve the voucher slot now. If payment fails, we leave the
      // redemption in place to discourage retry-spam; admin can clean
      // up via dashboard if needed. Conservative trade-off favoring
      // quota integrity over user convenience.
      await tx.voucherRedemption.create({
        data: {
          voucherId,
          userId: user.id,
          orderId: created.id,
          discountAmount,
          originalAmount: listPriceIdr,
          finalAmount,
        },
      });
    }

    return created;
  });

  // Resolve callback URL — prefer env, fall back to request origin.
  const origin =
    process.env.NEXT_PUBLIC_APP_URL ??
    request.headers.get("origin") ??
    new URL(request.url).origin;

  let snap;
  try {
    snap = await createSnapTransaction({
      orderId: order.midtransOrderId,
      amountIdr: finalAmount,
      customerEmail: user.email ?? `${user.id}@cita.local`,
      customerName: user.displayName ?? user.email ?? null,
      itemName: voucherCode
        ? `Cita Premium — ${PREMIUM_DURATION_DAYS} hari (${voucherCode})`
        : `Cita Premium — ${PREMIUM_DURATION_DAYS} hari`,
      callbackFinishUrl: `${origin}/akun/billing?status=success`,
    });
  } catch (e) {
    console.error("[billing/checkout] midtrans error", e);
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

  await prisma.order.update({
    where: { id: order.id },
    data: { midtransSnapToken: snap.token },
  });

  return new Response(
    JSON.stringify({
      free: false,
      token: snap.token,
      redirectUrl: snap.redirectUrl,
      orderId: order.midtransOrderId,
      finalAmount,
      discountAmount,
      voucherCode,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
}
