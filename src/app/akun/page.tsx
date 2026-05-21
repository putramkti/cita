import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, User, ReceiptText } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { getCurrentUser } from "@/lib/auth/get-user";
import { getCurrentPlan } from "@/lib/billing/get-plan";
import { PLANS } from "@/lib/billing/plans";
import { PremiumBadge } from "@/components/billing/premium-badge";
import { getDict } from "@/lib/i18n";

export const dynamic = "force-dynamic";

/**
 * Akun (Account) overview page.
 *
 * Anonymous → /auth/login. Authenticated → shows profile + plan + links to
 * billing, history (future), settings (future).
 */
export default async function AkunPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login?next=/akun");
  const t = await getDict();
  const plan = await getCurrentPlan(user.id);
  const planLabel = t.locale === "en"
    ? PLANS[plan === "ANON" ? "FREE" : plan].labelEn
    : PLANS[plan === "ANON" ? "FREE" : plan].labelId;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 px-4 sm:px-8 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl space-y-10">
          {/* Header */}
          <div>
            <p className="label-caps mb-3">
              {t.locale === "en" ? "ACCOUNT" : "AKUN"}
            </p>
            <h1 className="serif text-4xl tracking-tight text-foreground leading-tight">
              {user.displayName ?? user.email ?? "Akun saya"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {user.email}
            </p>
          </div>

          {/* Profile + plan card */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-2 mb-3">
                <User
                  className="size-4 text-muted-foreground"
                  strokeWidth={1.5}
                />
                <p className="label-caps">
                  {t.locale === "en" ? "ROLE" : "PERAN"}
                </p>
              </div>
              <p className="serif text-2xl tracking-tight">{user.role}</p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <ReceiptText
                    className="size-4 text-muted-foreground"
                    strokeWidth={1.5}
                  />
                  <p className="label-caps">
                    {t.locale === "en" ? "PLAN" : "PAKET"}
                  </p>
                </div>
                {plan === "PREMIUM" && <PremiumBadge size="sm" />}
              </div>
              <p className="serif text-2xl tracking-tight">{planLabel}</p>
              <Link
                href="/akun/billing"
                className="mt-4 inline-flex items-center gap-1 text-xs text-foreground hover:underline"
              >
                {t.locale === "en"
                  ? "Manage subscription"
                  : "Kelola langganan"}
                <ArrowRight className="size-3" strokeWidth={2} />
              </Link>
            </div>
          </div>

          {/* Tryout history */}
          <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
            <p className="label-caps mb-2">
              {t.locale === "en" ? "ATTEMPT HISTORY" : "RIWAYAT TRYOUT"}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t.locale === "en"
                ? "Full attempt history will appear here. For now, your last attempt is reachable from /tryout."
                : "Riwayat lengkap tryout akan tampil di sini. Sementara ini, percobaan terakhir bisa diakses dari /tryout."}
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
