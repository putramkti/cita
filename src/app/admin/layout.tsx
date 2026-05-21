import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth/get-user";
import { AdminShell } from "./_components/admin-shell";

export const metadata: Metadata = {
  title: "Admin · Cita",
  description: "Admin panel internal Cita.",
  robots: { index: false, follow: false },
};

/**
 * /admin/* root layout.
 *
 * Single gate: if not ADMIN, redirect to '/'. Layout is RSC so the
 * Prisma role lookup happens server-side; the user never sees an admin
 * pixel without authorisation.
 *
 * Note: middleware (`src/proxy.ts`) handles session refresh only. Role
 * gating intentionally lives here so we can use Prisma — the edge
 * runtime can't load the Prisma client.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminUser();
  if (!admin) {
    redirect("/");
  }

  return <AdminShell admin={admin}>{children}</AdminShell>;
}
