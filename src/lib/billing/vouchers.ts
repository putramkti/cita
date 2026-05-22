import "server-only";
import { prisma } from "@/lib/db/prisma";
import type { Plan, Voucher, DiscountType } from "@prisma/client";

/**
 * Voucher validation + redemption helpers.
 *
 * Single source of truth for "is this code valid for this user buying
 * this plan at this price?". Used by:
 *   - GET  /api/billing/voucher/check   (real-time validate while typing)
 *   - POST /api/billing/checkout        (re-validate before charging)
 *   - Admin CRUD                         (CRUD doesn't validate, but uses the
 *                                         same shape for redemption summaries)
 *
 * The validate path is deliberately read-only. Redemption (recording the
 * VoucherRedemption row) happens inside the checkout flow's transaction
 * after payment is confirmed (or immediately for free-after-voucher orders).
 */

export interface VoucherValidationOk {
  ok: true;
  voucher: {
    id: string;
    code: string;
    discountType: DiscountType;
    discountValue: number;
  };
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  /** When finalAmount === 0 we skip Midtrans entirely. */
  isFree: boolean;
}

export interface VoucherValidationErr {
  ok: false;
  /** Stable machine code for client-side i18n. */
  code:
    | "not_found"
    | "inactive"
    | "not_started"
    | "expired"
    | "exhausted"
    | "user_limit_reached"
    | "plan_not_applicable"
    | "below_minimum"
    | "invalid_value";
  /** Human-readable Indonesian message (default UI copy). */
  message: string;
}

export type VoucherValidationResult =
  | VoucherValidationOk
  | VoucherValidationErr;

/**
 * Compute the effective discount in IDR for a given list price.
 *
 *   PERCENTAGE   → round(listPrice * value/100)
 *   FIXED_AMOUNT → min(value, listPrice)   (never produce negative orders)
 *
 * Caps the discount at listPrice so the user never gets a credit beyond
 * what they're buying.
 */
export function computeDiscount(
  listPriceIdr: number,
  type: DiscountType,
  value: number,
): number {
  if (listPriceIdr <= 0) return 0;
  if (value <= 0) return 0;
  if (type === "PERCENTAGE") {
    const pct = Math.min(100, Math.max(0, value));
    return Math.min(listPriceIdr, Math.round((listPriceIdr * pct) / 100));
  }
  // FIXED_AMOUNT
  return Math.min(listPriceIdr, value);
}

/**
 * Validate a voucher code against a user + plan + list price.
 *
 * Cheap (single voucher fetch + 2 counts in parallel). Safe to call
 * on every keystroke from the checkout page (debounced client-side).
 */
export async function validateVoucher(opts: {
  code: string;
  userId: string;
  plan: Plan;
  listPriceIdr: number;
}): Promise<VoucherValidationResult> {
  const code = opts.code.trim().toUpperCase();
  if (!code) {
    return { ok: false, code: "not_found", message: "Kode voucher kosong." };
  }

  const voucher = await prisma.voucher.findUnique({
    where: { code },
  });

  if (!voucher) {
    return {
      ok: false,
      code: "not_found",
      message: "Kode voucher tidak ditemukan.",
    };
  }

  return validateVoucherRecord({
    voucher,
    userId: opts.userId,
    plan: opts.plan,
    listPriceIdr: opts.listPriceIdr,
  });
}

/**
 * Internal: validate a Voucher row (already loaded). Used by the public
 * `validateVoucher` and by the checkout transaction (which loads the row
 * with `findUniqueOrThrow` inside its tx for atomicity).
 */
export async function validateVoucherRecord(opts: {
  voucher: Voucher;
  userId: string;
  plan: Plan;
  listPriceIdr: number;
}): Promise<VoucherValidationResult> {
  const { voucher, userId, plan, listPriceIdr } = opts;

  if (!voucher.isActive) {
    return {
      ok: false,
      code: "inactive",
      message: "Kode voucher sudah tidak aktif.",
    };
  }

  const now = new Date();
  if (voucher.validFrom > now) {
    return {
      ok: false,
      code: "not_started",
      message: "Kode voucher belum berlaku.",
    };
  }
  if (voucher.validUntil < now) {
    return {
      ok: false,
      code: "expired",
      message: "Kode voucher sudah kedaluwarsa.",
    };
  }

  if (!voucher.applicablePlans.includes(plan)) {
    return {
      ok: false,
      code: "plan_not_applicable",
      message: "Kode voucher tidak berlaku untuk paket ini.",
    };
  }

  if (voucher.minPurchase != null && listPriceIdr < voucher.minPurchase) {
    return {
      ok: false,
      code: "below_minimum",
      message: `Voucher berlaku untuk pembelian minimal Rp ${voucher.minPurchase.toLocaleString(
        "id-ID",
      )}.`,
    };
  }

  // Quota checks. Run global + per-user in parallel for speed.
  const [totalRedemptions, userRedemptions] = await Promise.all([
    voucher.maxRedemptions != null
      ? prisma.voucherRedemption.count({ where: { voucherId: voucher.id } })
      : Promise.resolve(0),
    prisma.voucherRedemption.count({
      where: { voucherId: voucher.id, userId },
    }),
  ]);

  if (
    voucher.maxRedemptions != null &&
    totalRedemptions >= voucher.maxRedemptions
  ) {
    return {
      ok: false,
      code: "exhausted",
      message: "Kuota voucher sudah habis.",
    };
  }

  if (userRedemptions >= voucher.maxPerUser) {
    return {
      ok: false,
      code: "user_limit_reached",
      message: "Anda sudah pernah memakai voucher ini.",
    };
  }

  const discountAmount = computeDiscount(
    listPriceIdr,
    voucher.discountType,
    voucher.discountValue,
  );

  if (discountAmount <= 0) {
    return {
      ok: false,
      code: "invalid_value",
      message: "Voucher tidak menghasilkan potongan harga.",
    };
  }

  const finalAmount = listPriceIdr - discountAmount;

  return {
    ok: true,
    voucher: {
      id: voucher.id,
      code: voucher.code,
      discountType: voucher.discountType,
      discountValue: voucher.discountValue,
    },
    originalAmount: listPriceIdr,
    discountAmount,
    finalAmount,
    isFree: finalAmount === 0,
  };
}
