import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Sparkles, Receipt, Calendar } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { getCurrentUser } from "@/lib/auth/get-user";
import { getCurrentPlan, getSubscriptionDetails } from "@/lib/billing/get-plan";
import { PLANS } from "@/lib/billing/plans";
import { PremiumBadge } from "@/components/billing/premium-badge";
import { prisma } from "@/lib/db/prisma";
import { getDict } from "@/lib/i18n";
import { CancelButton } from "./cancel-button";

export const dynamic = "force-dynamic";

interface BillingPageProps {
  searchParams?: Promise<{ status?: string }>;
}

/**
 * /akun/billing — subscription management.
 *
 *   - Current plan card (Free vs Premium with expiry + status)
 *   - Last 10 orders table
 *   - Cancel button (only when ACTIVE+autoRenew)
 *   - Upgrade CTA (when FREE)
 */
export default async function BillingPage({
  searchParams,
}: BillingPageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login?next=/akun/billing");

  const t = await getDict();
  const plan = await getCurrentPlan(user.id);
  const sub = await getSubscriptionDetails(user.id);

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      midtransOrderId: true,
      plan: true,
      amount: true,
      status: true,
      paidAt: true,
      createdAt: true,
    },
  });

  const params = (await searchParams) ?? {};
  const flash =
    params.status === "success"
      ? t.locale === "en"
        ? "Pembayaran selesai. Aktivasi akan tampil setelah Midtrans mengirim notifikasi."
        : "Pembayaran selesai. Aktivasi akan tampil setelah Midtrans mengirim notifikasi."
      : params.status === "pending"
        ? t.locale === "en"
          ? "Pembayaran menunggu konfirmasi."
          : "Pembayaran menunggu konfirmasi."
        : params.status === "error"
          ? t.locale === "en"
            ? "Pembayaran gagal. Silakan coba lagi."
            : "Pembayaran gagal. Silakan coba lagi."
          : null;

  const isPremium = plan === "PREMIUM";
  const planMeta = PLANS[plan === "ANON" ? "FREE" : plan];
  const planLabel = t.locale === "en" ? planMeta.labelEn : planMeta.labelId;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 px-4 sm:px-8 py-12 sm:py-16">
        <div className="mx-auto max-w-4xl space-y-10">
          {/* Back link + Header */}
          <div>
            <Link
              href="/akun"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="size-4" strokeWidth={1.5} />
              {t.locale === "en" ? "Back to account" : "Kembali ke akun"}
            </Link>
            <p className="label-caps mb-3">
              {t.locale === "en" ? "BILLING" : "LANGGANAN"}
            </p>
            <h1 className="serif text-4xl tracking-tight text-foreground leading-tight">
              {t.locale === "en" ? "Your subscription" : "Langganan Anda"}
            </h1>
          </div>

          {flash && (
            <div className="rounded-md border border-border bg-muted/30 px-4 py-3 text-sm">
              {flash}
            </div>
          )}

          {/* Current plan card */}
          <div className="rounded-xl border border-border bg-card p-7 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="label-caps mb-2.5">
                  {t.locale === "en" ? "CURRENT PLAN" : "PAKET SAAT INI"}
                </p>
                <div className="flex items-center gap-2">
                  <h2 className="serif text-3xl tracking-tight">{planLabel}</h2>
                  {isPremium && <PremiumBadge size="md" />}
                </div>
                {sub?.expiresAt && (
                  <p className="mt-3 text-sm text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="size-3.5" strokeWidth={1.5} />
                    {sub.status === "CANCELLED"
                      ? t.locale === "en"
                        ? "Access until"
                        : "Akses hingga"
                      : t.locale === "en"
                        ? "Renews on"
                        : "Perpanjang otomatis"}{" "}
                    {sub.expiresAt.toLocaleDateString(
                      t.locale === "en" ? "en-US" : "id-ID",
                      {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      },
                    )}
                  </p>
                )}
                {sub?.status === "CANCELLED" && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t.locale === "en"
                      ? "Auto-renew off — Premium expires at the date above."
                      : "Perpanjangan otomatis dimatikan — Premium akan berakhir pada tanggal di atas."}
                  </p>
                )}
              </div>

              {!isPremium ? (
                <Link
                  href="/pricing"
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium px-4 py-2 hover:bg-primary/90 transition-colors"
                >
                  <Sparkles className="size-4" strokeWidth={1.75} />
                  {t.locale === "en" ? "Upgrade" : "Upgrade"}
                </Link>
              ) : sub?.status === "ACTIVE" && sub.autoRenew ? (
                <CancelButton
                  labelCancel={
                    t.locale === "en"
                      ? "Cancel auto-renew"
                      : "Batalkan perpanjangan otomatis"
                  }
                  labelProcessing={t.locale === "en" ? "Cancelling…" : "Membatalkan…"}
                  labelConfirm={
                    t.locale === "en"
                      ? "Stop auto-renewal? You'll keep Premium until the period ends."
                      : "Hentikan perpanjangan otomatis? Akses Premium tetap aktif sampai akhir periode."
                  }
                  labelYes={t.locale === "en" ? "Yes, cancel" : "Ya, batalkan"}
                  labelNo={t.locale === "en" ? "Keep it" : "Lanjutkan"}
                />
              ) : null}
            </div>
          </div>

          {/* Orders table */}
          <div className="rounded-xl border border-border bg-card p-7 sm:p-8">
            <div className="flex items-center gap-2 mb-5">
              <Receipt className="size-4 text-muted-foreground" strokeWidth={1.5} />
              <p className="label-caps">
                {t.locale === "en" ? "PAYMENT HISTORY" : "RIWAYAT PEMBAYARAN"}
              </p>
            </div>
            {orders.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t.locale === "en"
                  ? "No payments yet."
                  : "Belum ada pembayaran."}
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {orders.map((o) => (
                  <li
                    key={o.id}
                    className="py-3.5 flex items-center justify-between gap-4 text-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {o.plan} · Rp {o.amount.toLocaleString("id-ID")}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5 truncate">
                        {o.midtransOrderId}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={
                          o.status === "PAID"
                            ? "text-xs font-medium uppercase tracking-wider text-foreground"
                            : o.status === "PENDING"
                              ? "text-xs font-medium uppercase tracking-wider text-muted-foreground"
                              : "text-xs font-medium uppercase tracking-wider text-destructive"
                        }
                      >
                        {o.status}
                      </span>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {(o.paidAt ?? o.createdAt).toLocaleDateString(
                          t.locale === "en" ? "en-US" : "id-ID",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer note */}
          <div className="text-center text-xs text-muted-foreground space-y-1.5">
            <p>
              {t.locale === "en"
                ? "Payments are processed by Midtrans. Cita does not store your card or e-wallet credentials."
                : "Pembayaran diproses oleh Midtrans. Cita tidak menyimpan data kartu atau e-wallet Anda."}
            </p>
            <p>
              {t.locale === "en"
                ? "Need help? Contact support at hello@cita.id"
                : "Butuh bantuan? Hubungi hello@cita.id"}
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
