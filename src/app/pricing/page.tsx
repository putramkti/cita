import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { getDict } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/auth/get-user";
import { getCurrentPlan } from "@/lib/billing/get-plan";
import { PLANS, PRICING_TIERS } from "@/lib/billing/plans";
import { UpgradeButton } from "./upgrade-button";

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const t = await getDict();
  const user = await getCurrentUser();
  const currentPlan = await getCurrentPlan(user?.id ?? null);

  // Plan-side feature rows (label + value per plan)
  const featureRows = [
    {
      label: t.locale === "en" ? "Unlimited tryouts" : "Tryout tanpa batas",
      free: true,
      premium: true,
    },
    {
      label:
        t.locale === "en"
          ? `Cita Tutor — ${PLANS.FREE.features.tutorDailyQuota} msg/day`
          : `Cita Tutor — ${PLANS.FREE.features.tutorDailyQuota} pesan/hari`,
      free: true,
      premium: false,
    },
    {
      label:
        t.locale === "en"
          ? `Cita Tutor — ${PLANS.PREMIUM.features.tutorDailyQuota} msg/day`
          : `Cita Tutor — ${PLANS.PREMIUM.features.tutorDailyQuota} pesan/hari`,
      free: false,
      premium: true,
    },
    {
      label: t.locale === "en" ? "Full result history" : "Riwayat lengkap",
      free: true,
      premium: true,
    },
    {
      label:
        t.locale === "en"
          ? "AI Insight — personalized for you"
          : "AI Insight — dipersonalisasi",
      free: false,
      premium: true,
    },
    {
      label: t.locale === "en" ? "Premium badge" : "Premium badge",
      free: false,
      premium: true,
    },
  ];

  // "Coming soon" teasers — purely marketing copy, no code dep yet.
  const comingSoon =
    t.locale === "en"
      ? [
          "Targeted drill — practice a specific topic",
          "Spaced repetition reminders",
          "Daily streak rewards",
          "Expert-curated soal pack",
        ]
      : [
          "Targeted drill — latih topik tertentu saja",
          "Pengingat spaced repetition",
          "Reward streak harian",
          "Soal pilihan kurator",
        ];

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 px-4 sm:px-8 py-12 sm:py-16">
        <div className="mx-auto max-w-5xl space-y-12 sm:space-y-16">
          {/* Header */}
          <div className="text-center">
            <p className="label-caps mb-4">
              {t.locale === "en" ? "PRICING" : "HARGA"}
            </p>
            <h1 className="serif text-4xl sm:text-5xl tracking-tight text-foreground leading-tight">
              {t.locale === "en"
                ? "Simple pricing. Real results."
                : "Harga sederhana. Hasil nyata."}
            </h1>
            <p className="mt-5 text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t.locale === "en"
                ? "Start free. Upgrade when you need deeper guidance from Cita Tutor."
                : "Mulai gratis. Upgrade saat butuh bimbingan lebih dalam dari Cita Tutor."}
            </p>
          </div>

          {/* Pricing cards — 2-up grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {PRICING_TIERS.map((tier) => {
              const isCurrent =
                (currentPlan === "FREE" && tier.id === "FREE") ||
                (currentPlan === "PREMIUM" && tier.id === "PREMIUM");
              const isPremium = tier.id === "PREMIUM";

              return (
                <div
                  key={tier.id}
                  className={
                    isPremium
                      ? "relative rounded-xl border border-foreground/30 bg-card p-7 sm:p-8 shadow-sm"
                      : "relative rounded-xl border border-border bg-card p-7 sm:p-8"
                  }
                >
                  {isPremium && (
                    <div className="absolute -top-3 right-6 inline-flex items-center gap-1.5 rounded-full bg-foreground text-background text-[10px] font-semibold uppercase tracking-wider px-3 py-1.5">
                      <Sparkles
                        className="size-3"
                        strokeWidth={2}
                        aria-hidden
                      />
                      {t.locale === "en" ? "Recommended" : "Rekomendasi"}
                    </div>
                  )}

                  {/* Plan name + price */}
                  <div className="mb-6">
                    <p className="label-caps mb-3">
                      {t.locale === "en" ? tier.labelEn : tier.labelId}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="serif text-4xl sm:text-5xl tracking-tight">
                        {tier.priceIdr === 0
                          ? t.locale === "en"
                            ? "Free"
                            : "Gratis"
                          : `Rp ${tier.priceIdr.toLocaleString("id-ID")}`}
                      </span>
                      {tier.priceIdr > 0 && (
                        <span className="text-sm text-muted-foreground">
                          /{t.locale === "en" ? "month" : "bulan"}
                        </span>
                      )}
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                      {t.locale === "en" ? tier.taglineEn : tier.taglineId}
                    </p>
                  </div>

                  {/* Feature list — only checked rows for this tier */}
                  <ul className="space-y-3 mb-7">
                    {featureRows
                      .filter((row) =>
                        tier.id === "FREE" ? row.free : row.premium,
                      )
                      .map((row) => (
                        <li
                          key={row.label}
                          className="flex items-start gap-2.5 text-sm leading-relaxed"
                        >
                          <Check
                            className="size-4 text-foreground shrink-0 mt-0.5"
                            strokeWidth={2}
                            aria-hidden
                          />
                          <span>{row.label}</span>
                        </li>
                      ))}
                  </ul>

                  {/* CTA */}
                  {isCurrent ? (
                    <button
                      type="button"
                      disabled
                      className="w-full inline-flex items-center justify-center rounded-md border border-border text-sm font-medium px-4 py-2.5 text-muted-foreground cursor-not-allowed"
                    >
                      {t.locale === "en"
                        ? "Your current plan"
                        : "Paket Anda saat ini"}
                    </button>
                  ) : isPremium ? (
                    <UpgradeButton
                      authed={Boolean(user)}
                      labelUpgrade={
                        t.locale === "en"
                          ? "Upgrade to Premium"
                          : "Upgrade ke Premium"
                      }
                      labelLogin={
                        t.locale === "en"
                          ? "Login to upgrade"
                          : "Login untuk upgrade"
                      }
                      processingLabel={
                        t.locale === "en" ? "Processing…" : "Memproses…"
                      }
                    />
                  ) : (
                    <Link
                      href="/tryout"
                      className="w-full inline-flex items-center justify-center rounded-md border border-border text-sm font-medium px-4 py-2.5 text-foreground hover:bg-secondary/50 transition-colors"
                    >
                      {t.locale === "en" ? "Start free" : "Mulai gratis"}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>

          {/* Coming soon teaser */}
          <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-7 sm:p-8">
            <p className="label-caps mb-4">
              {t.locale === "en"
                ? "COMING SOON FOR PREMIUM"
                : "AKAN HADIR UNTUK PREMIUM"}
            </p>
            <h2 className="serif text-2xl sm:text-3xl tracking-tight text-foreground leading-tight mb-5">
              {t.locale === "en"
                ? "Premium grows with your prep."
                : "Premium berkembang seiring persiapan Anda."}
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
              {comingSoon.map((label) => (
                <li key={label} className="flex items-start gap-2.5">
                  <Sparkles
                    className="size-4 text-foreground/60 shrink-0 mt-0.5"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                  <span>{label}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs text-muted-foreground/80 leading-relaxed">
              {t.locale === "en"
                ? "Subscribe today and get access to these features as they ship — no extra charge."
                : "Berlangganan sekarang dan dapatkan akses fitur baru saat dirilis — tanpa biaya tambahan."}
            </p>
          </div>

          {/* FAQ-ish footer note */}
          <div className="text-center text-sm text-muted-foreground space-y-2">
            <p>
              {t.locale === "en"
                ? "Payment via Midtrans — QRIS, GoPay, OVO, DANA, ShopeePay, bank transfer, credit card."
                : "Pembayaran via Midtrans — QRIS, GoPay, OVO, DANA, ShopeePay, transfer bank, kartu kredit."}
            </p>
            <p>
              {t.locale === "en"
                ? "Cancel anytime. Access continues until the end of your billing period."
                : "Bisa dibatalkan kapan saja. Akses tetap aktif hingga akhir periode."}
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
