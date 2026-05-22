"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth/get-user";
import {
  createVoucher,
  updateVoucher,
  VoucherValidationError,
} from "@/lib/admin/vouchers";
import type { DiscountType, Plan } from "@prisma/client";

/**
 * Admin server actions for voucher CRUD.
 *
 * Each action gates on getAdminUser() so they can be invoked from
 * client form handlers safely. On success, revalidate the list path
 * so the new row shows up without a hard refresh.
 */

interface CreateState {
  ok?: boolean;
  error?: string;
  voucherId?: string;
}

export async function createVoucherAction(
  _prev: CreateState,
  formData: FormData,
): Promise<CreateState> {
  const admin = await getAdminUser();
  if (!admin) return { error: "Tidak diizinkan." };

  try {
    const code = String(formData.get("code") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim() || null;
    const discountType = String(
      formData.get("discountType") ?? "PERCENTAGE",
    ) as DiscountType;
    const discountValue = Number(formData.get("discountValue") ?? 0);
    const validUntilStr = String(formData.get("validUntil") ?? "").trim();
    const validFromStr = String(formData.get("validFrom") ?? "").trim();
    const maxRedemptionsStr = String(
      formData.get("maxRedemptions") ?? "",
    ).trim();
    const maxPerUser = Math.max(1, Number(formData.get("maxPerUser") ?? 1));
    const minPurchaseStr = String(formData.get("minPurchase") ?? "").trim();
    const isActive = formData.get("isActive") === "on";

    if (!validUntilStr) {
      return { error: "Tanggal akhir wajib diisi." };
    }
    const validUntil = new Date(validUntilStr);
    if (Number.isNaN(validUntil.getTime())) {
      return { error: "Format tanggal akhir tidak valid." };
    }

    const validFrom = validFromStr ? new Date(validFromStr) : undefined;
    if (validFrom && Number.isNaN(validFrom.getTime())) {
      return { error: "Format tanggal mulai tidak valid." };
    }

    const created = await createVoucher({
      code,
      description,
      discountType,
      discountValue,
      validFrom,
      validUntil,
      maxRedemptions: maxRedemptionsStr ? Number(maxRedemptionsStr) : null,
      maxPerUser,
      applicablePlans: ["PREMIUM"] as Plan[],
      minPurchase: minPurchaseStr ? Number(minPurchaseStr) : null,
      isActive,
      createdById: admin.id,
    });

    revalidatePath("/admin/vouchers");
    return { ok: true, voucherId: created.id };
  } catch (e) {
    if (e instanceof VoucherValidationError) {
      return { error: e.message };
    }
    console.error("[createVoucherAction]", e);
    return { error: "Terjadi kesalahan. Coba lagi." };
  }
}

interface UpdateState {
  ok?: boolean;
  error?: string;
}

export async function updateVoucherAction(
  voucherId: string,
  _prev: UpdateState,
  formData: FormData,
): Promise<UpdateState> {
  const admin = await getAdminUser();
  if (!admin) return { error: "Tidak diizinkan." };

  try {
    const description = String(formData.get("description") ?? "").trim() || null;
    const validUntilStr = String(formData.get("validUntil") ?? "").trim();
    const maxRedemptionsStr = String(
      formData.get("maxRedemptions") ?? "",
    ).trim();
    const maxPerUser = Math.max(1, Number(formData.get("maxPerUser") ?? 1));
    const minPurchaseStr = String(formData.get("minPurchase") ?? "").trim();
    const isActive = formData.get("isActive") === "on";

    let validUntil: Date | undefined;
    if (validUntilStr) {
      validUntil = new Date(validUntilStr);
      if (Number.isNaN(validUntil.getTime())) {
        return { error: "Format tanggal akhir tidak valid." };
      }
    }

    await updateVoucher(voucherId, {
      description,
      validUntil,
      maxRedemptions: maxRedemptionsStr ? Number(maxRedemptionsStr) : null,
      maxPerUser,
      minPurchase: minPurchaseStr ? Number(minPurchaseStr) : null,
      isActive,
    });

    revalidatePath("/admin/vouchers");
    revalidatePath(`/admin/vouchers/${voucherId}`);
    return { ok: true };
  } catch (e) {
    if (e instanceof VoucherValidationError) {
      return { error: e.message };
    }
    console.error("[updateVoucherAction]", e);
    return { error: "Terjadi kesalahan. Coba lagi." };
  }
}

export async function toggleVoucherActiveAction(
  voucherId: string,
  next: boolean,
): Promise<void> {
  const admin = await getAdminUser();
  if (!admin) return;
  try {
    await updateVoucher(voucherId, { isActive: next });
    revalidatePath("/admin/vouchers");
    revalidatePath(`/admin/vouchers/${voucherId}`);
  } catch (e) {
    console.error("[toggleVoucherActiveAction]", e);
  }
}

export async function navigateToVoucher(id: string): Promise<void> {
  redirect(`/admin/vouchers/${id}`);
}
