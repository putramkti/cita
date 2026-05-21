"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/auth/get-user";
import {
  setSubscriptionExpiry,
  cancelSubscription,
  reactivateSubscription,
} from "@/lib/admin/subscriptions";

async function assertAdmin() {
  const admin = await getAdminUser();
  if (!admin) throw new Error("FORBIDDEN");
  return admin;
}

export async function setExpiryAction(formData: FormData): Promise<void> {
  await assertAdmin();
  const subscriptionId = String(formData.get("subscriptionId") ?? "");
  const expiryStr = String(formData.get("expiresAt") ?? "");
  if (!subscriptionId) throw new Error("missing subscriptionId");
  const date = new Date(expiryStr);
  if (Number.isNaN(date.getTime())) throw new Error("invalid date");

  await setSubscriptionExpiry(subscriptionId, date);
  revalidatePath(`/admin/subscriptions/${subscriptionId}`);
  revalidatePath("/admin/subscriptions");
  revalidatePath("/admin");
}

export async function cancelAction(formData: FormData): Promise<void> {
  await assertAdmin();
  const subscriptionId = String(formData.get("subscriptionId") ?? "");
  const revokeNow = formData.get("revokeNow") === "1";
  if (!subscriptionId) throw new Error("missing subscriptionId");

  await cancelSubscription(subscriptionId, { revokeNow });
  revalidatePath(`/admin/subscriptions/${subscriptionId}`);
  revalidatePath("/admin/subscriptions");
  revalidatePath("/admin/users");
  revalidatePath("/admin");
}

export async function reactivateAction(formData: FormData): Promise<void> {
  await assertAdmin();
  const subscriptionId = String(formData.get("subscriptionId") ?? "");
  const days = Number(formData.get("days") ?? 0);
  if (!subscriptionId) throw new Error("missing subscriptionId");
  if (!Number.isFinite(days) || days <= 0 || days > 365) {
    throw new Error("days must be in (0, 365]");
  }

  await reactivateSubscription(subscriptionId, days);
  revalidatePath(`/admin/subscriptions/${subscriptionId}`);
  revalidatePath("/admin/subscriptions");
  revalidatePath("/admin/users");
  revalidatePath("/admin");
}
