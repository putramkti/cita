/**
 * POST /api/billing/cancel
 *
 * Stop auto-renewal for the current user's active subscription.
 *
 * Important: this DOES NOT terminate access. Subscription stays in
 * status=CANCELLED with original expiresAt — user keeps PREMIUM until
 * the period ends, then it lazily transitions to EXPIRED on next access
 * (see lib/billing/get-plan.ts).
 *
 * Idempotent: cancelling an already-cancelled sub is a no-op.
 *
 * No Midtrans call — Cita doesn't auto-charge yet (no recurring
 * billing token). The user just won't see auto-renew prompts. If we
 * ever wire Midtrans recurring, this is also where we'd cancel the
 * stored card token / GoPay binding.
 */

import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/get-user";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(status: number, message: string, code?: string) {
  return new Response(JSON.stringify({ error: { message, code } }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return jsonError(401, "Login dulu.", "no_session");
  }

  const sub = await prisma.subscription.findUnique({
    where: { userId: user.id },
    select: { id: true, status: true, plan: true, expiresAt: true },
  });

  if (!sub || sub.plan === "FREE") {
    return jsonError(404, "Tidak ada langganan aktif.", "no_subscription");
  }
  if (sub.status === "CANCELLED" || sub.status === "EXPIRED") {
    return new Response(
      JSON.stringify({
        message: "already_cancelled",
        expiresAt: sub.expiresAt,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }

  await prisma.subscription.update({
    where: { id: sub.id },
    data: {
      status: "CANCELLED",
      cancelledAt: new Date(),
      autoRenew: false,
    },
  });

  return new Response(
    JSON.stringify({
      message: "cancelled",
      expiresAt: sub.expiresAt,
      note: "Akses Premium tetap aktif sampai akhir periode berlangganan.",
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}
