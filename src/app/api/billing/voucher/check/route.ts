/**
 * GET /api/billing/voucher/check?code=XXX&plan=PREMIUM
 *
 * Real-time voucher validation for the checkout page. Authenticated
 * users only — anonymous users have nothing to validate against (no
 * user redemption count) and shouldn't be able to enumerate codes.
 *
 * Returns the same VoucherValidationResult shape as the server lib so
 * the client can render the receipt directly without translating
 * codes.
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-user";
import { validateVoucher } from "@/lib/billing/vouchers";
import { PLANS } from "@/lib/billing/plans";
import type { Plan } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { ok: false, code: "no_session", message: "Login dulu untuk pakai voucher." },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(request.url);
  const code = (searchParams.get("code") ?? "").trim();
  const planParam = (searchParams.get("plan") ?? "PREMIUM").toUpperCase();

  if (!code) {
    return NextResponse.json(
      { ok: false, code: "not_found", message: "Kode voucher kosong." },
      { status: 400 },
    );
  }

  if (planParam !== "PREMIUM") {
    return NextResponse.json(
      { ok: false, code: "plan_not_applicable", message: "Plan tidak dikenal." },
      { status: 400 },
    );
  }

  const plan = planParam as Plan;
  const listPriceIdr = PLANS.PREMIUM.priceIdr;

  const result = await validateVoucher({
    code,
    userId: user.id,
    plan,
    listPriceIdr,
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 422,
    headers: { "Cache-Control": "no-store" },
  });
}
