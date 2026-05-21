"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/auth/get-user";
import { syncOrderFromMidtrans } from "@/lib/admin/orders";

async function assertAdmin() {
  const admin = await getAdminUser();
  if (!admin) throw new Error("FORBIDDEN");
  return admin;
}

export async function syncOrderAction(formData: FormData): Promise<void> {
  await assertAdmin();
  const orderId = String(formData.get("orderId") ?? "");
  if (!orderId) throw new Error("missing orderId");

  await syncOrderFromMidtrans(orderId);
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin/subscriptions");
  revalidatePath("/admin");
}
