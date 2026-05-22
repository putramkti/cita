import "server-only";
import { prisma } from "@/lib/db/prisma";
import type {
  Voucher,
  DiscountType,
  Plan,
  Prisma,
} from "@prisma/client";

/**
 * Admin CRUD for vouchers.
 *
 * Voucher code is uppercase and unique. Once a voucher has been
 * redeemed, only soft-edits (description, isActive flip, validUntil
 * extension) are allowed — discount value/type cannot change to
 * preserve the integrity of past redemption snapshots.
 */

export interface VoucherListRow {
  id: string;
  code: string;
  description: string | null;
  discountType: DiscountType;
  discountValue: number;
  validFrom: Date;
  validUntil: Date;
  maxRedemptions: number | null;
  maxPerUser: number;
  applicablePlans: Plan[];
  minPurchase: number | null;
  isActive: boolean;
  createdAt: Date;
  redemptionsCount: number;
}

export interface VoucherListResult {
  rows: VoucherListRow[];
  total: number;
  page: number;
  pageSize: number;
}

export async function listVouchers(opts: {
  q?: string;
  status?: "active" | "inactive" | "expired" | "all";
  page?: number;
  pageSize?: number;
}): Promise<VoucherListResult> {
  const page = Math.max(1, opts.page ?? 1);
  const pageSize = Math.min(100, Math.max(10, opts.pageSize ?? 25));

  const where: Prisma.VoucherWhereInput = {};
  if (opts.q && opts.q.trim()) {
    const q = opts.q.trim().toUpperCase();
    where.OR = [
      { code: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }
  const now = new Date();
  if (opts.status === "active") {
    where.isActive = true;
    where.validUntil = { gte: now };
  } else if (opts.status === "inactive") {
    where.isActive = false;
  } else if (opts.status === "expired") {
    where.validUntil = { lt: now };
  }

  const [total, vouchers] = await Promise.all([
    prisma.voucher.count({ where }),
    prisma.voucher.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        code: true,
        description: true,
        discountType: true,
        discountValue: true,
        validFrom: true,
        validUntil: true,
        maxRedemptions: true,
        maxPerUser: true,
        applicablePlans: true,
        minPurchase: true,
        isActive: true,
        createdAt: true,
        _count: { select: { redemptions: true } },
      },
    }),
  ]);

  return {
    rows: vouchers.map((v) => ({
      id: v.id,
      code: v.code,
      description: v.description,
      discountType: v.discountType,
      discountValue: v.discountValue,
      validFrom: v.validFrom,
      validUntil: v.validUntil,
      maxRedemptions: v.maxRedemptions,
      maxPerUser: v.maxPerUser,
      applicablePlans: v.applicablePlans,
      minPurchase: v.minPurchase,
      isActive: v.isActive,
      createdAt: v.createdAt,
      redemptionsCount: v._count.redemptions,
    })),
    total,
    page,
    pageSize,
  };
}

export interface VoucherDetail extends VoucherListRow {
  redemptions: Array<{
    id: string;
    userId: string;
    userEmail: string | null;
    orderId: string | null;
    discountAmount: number;
    originalAmount: number;
    finalAmount: number;
    redeemedAt: Date;
  }>;
}

export async function getVoucherDetail(
  id: string,
): Promise<VoucherDetail | null> {
  const v = await prisma.voucher.findUnique({
    where: { id },
    include: {
      redemptions: {
        orderBy: { redeemedAt: "desc" },
        take: 50,
      },
      _count: { select: { redemptions: true } },
    },
  });
  if (!v) return null;

  // N+1 lookup user emails for the redemption preview.
  const userIds = Array.from(new Set(v.redemptions.map((r) => r.userId)));
  const users = userIds.length
    ? await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, email: true },
      })
    : [];
  const emailMap = new Map(users.map((u) => [u.id, u.email]));

  return {
    id: v.id,
    code: v.code,
    description: v.description,
    discountType: v.discountType,
    discountValue: v.discountValue,
    validFrom: v.validFrom,
    validUntil: v.validUntil,
    maxRedemptions: v.maxRedemptions,
    maxPerUser: v.maxPerUser,
    applicablePlans: v.applicablePlans,
    minPurchase: v.minPurchase,
    isActive: v.isActive,
    createdAt: v.createdAt,
    redemptionsCount: v._count.redemptions,
    redemptions: v.redemptions.map((r) => ({
      id: r.id,
      userId: r.userId,
      userEmail: emailMap.get(r.userId) ?? null,
      orderId: r.orderId,
      discountAmount: r.discountAmount,
      originalAmount: r.originalAmount,
      finalAmount: r.finalAmount,
      redeemedAt: r.redeemedAt,
    })),
  };
}

export interface CreateVoucherInput {
  code: string;
  description?: string | null;
  discountType: DiscountType;
  discountValue: number;
  validFrom?: Date;
  validUntil: Date;
  maxRedemptions?: number | null;
  maxPerUser?: number;
  applicablePlans?: Plan[];
  minPurchase?: number | null;
  isActive?: boolean;
  createdById?: string;
}

export async function createVoucher(input: CreateVoucherInput): Promise<Voucher> {
  // Sanitize + validate
  const code = input.code.trim().toUpperCase();
  if (!/^[A-Z0-9_-]{3,32}$/.test(code)) {
    throw new VoucherValidationError(
      "Kode hanya boleh huruf besar, angka, dash, atau underscore (3-32 karakter).",
    );
  }
  if (input.discountValue <= 0) {
    throw new VoucherValidationError("Nilai diskon harus lebih dari 0.");
  }
  if (input.discountType === "PERCENTAGE" && input.discountValue > 100) {
    throw new VoucherValidationError("Persentase tidak boleh lebih dari 100.");
  }
  if (input.validFrom && input.validUntil <= input.validFrom) {
    throw new VoucherValidationError(
      "Tanggal akhir harus setelah tanggal mulai.",
    );
  }

  const existing = await prisma.voucher.findUnique({ where: { code } });
  if (existing) {
    throw new VoucherValidationError("Kode voucher sudah dipakai.");
  }

  return prisma.voucher.create({
    data: {
      code,
      description: input.description ?? null,
      discountType: input.discountType,
      discountValue: input.discountValue,
      validFrom: input.validFrom ?? new Date(),
      validUntil: input.validUntil,
      maxRedemptions: input.maxRedemptions ?? null,
      maxPerUser: input.maxPerUser ?? 1,
      applicablePlans: input.applicablePlans ?? ["PREMIUM"],
      minPurchase: input.minPurchase ?? null,
      isActive: input.isActive ?? true,
      createdById: input.createdById ?? null,
    },
  });
}

export interface UpdateVoucherInput {
  description?: string | null;
  validUntil?: Date;
  maxRedemptions?: number | null;
  maxPerUser?: number;
  isActive?: boolean;
  applicablePlans?: Plan[];
  minPurchase?: number | null;
}

/**
 * Update a voucher. Discount type/value/code are NEVER editable to
 * preserve redemption snapshot integrity. If admin needs different
 * discount, deactivate this voucher and create a new one.
 */
export async function updateVoucher(
  id: string,
  input: UpdateVoucherInput,
): Promise<Voucher> {
  const v = await prisma.voucher.findUnique({
    where: { id },
    include: { _count: { select: { redemptions: true } } },
  });
  if (!v) throw new VoucherValidationError("Voucher tidak ditemukan.");

  if (input.validUntil && v.validFrom > input.validUntil) {
    throw new VoucherValidationError(
      "Tanggal akhir harus setelah tanggal mulai.",
    );
  }

  // Don't let admin shrink maxRedemptions below current count.
  if (
    input.maxRedemptions != null &&
    input.maxRedemptions < v._count.redemptions
  ) {
    throw new VoucherValidationError(
      `Cap tidak boleh di bawah jumlah redemption saat ini (${v._count.redemptions}).`,
    );
  }

  return prisma.voucher.update({
    where: { id },
    data: {
      description: input.description,
      validUntil: input.validUntil,
      maxRedemptions: input.maxRedemptions,
      maxPerUser: input.maxPerUser,
      isActive: input.isActive,
      applicablePlans: input.applicablePlans,
      minPurchase: input.minPurchase,
    },
  });
}

export class VoucherValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VoucherValidationError";
  }
}
