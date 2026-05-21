"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/auth/get-user";
import {
  setUserRole as setUserRoleDb,
  grantPremium as grantPremiumDb,
} from "@/lib/admin/users";
import type { Role } from "@prisma/client";

const VALID_ROLES: Role[] = ["REGISTERED", "PREMIUM", "MODERATOR", "ADMIN"];

async function assertAdmin() {
  const admin = await getAdminUser();
  if (!admin) throw new Error("FORBIDDEN");
  return admin;
}

export async function setUserRoleAction(formData: FormData) {
  await assertAdmin();
  const userId = String(formData.get("userId") ?? "");
  const role = String(formData.get("role") ?? "");
  if (!userId) throw new Error("missing userId");
  if (!VALID_ROLES.includes(role as Role)) throw new Error("invalid role");

  await setUserRoleDb(userId, role as Role);
  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin/users");
  revalidatePath("/admin");
}

export async function grantPremiumAction(formData: FormData): Promise<void> {
  await assertAdmin();
  const userId = String(formData.get("userId") ?? "");
  const days = Number(formData.get("days") ?? 0);
  if (!userId) throw new Error("missing userId");
  if (!Number.isFinite(days) || days <= 0 || days > 365) {
    throw new Error("days must be in (0, 365]");
  }

  await grantPremiumDb(userId, days);
  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin/users");
  revalidatePath("/admin/subscriptions");
  revalidatePath("/admin");
}
