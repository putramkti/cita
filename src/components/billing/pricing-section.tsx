import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { PLANS, PRICING_TIERS } from "@/lib/billing/plans";
import { UpgradeButton } from "@/app/pricing/upgrade-button";

interface PricingSectionProps {
  locale: "id" | "en";
  /** Resolved plan of the viewer ('ANON' for unauthenticated). */
  currentPlan: "ANON" | "FREE" | "PREMIUM";
  authed: boolean;
  /**
   * Variant changes the surrounding chrome:
   *   - "page" : full vertical rhythm with eyebrow + title (used on /pricing)
   *   - "embed": tighter spacing for use as a section inside another page
   *              (e.g. landing). No outer wrapper rhythm changes.
   */
  variant?: "page" | "embed";
}

/**
 * Cita pricing tier cards.
 *
 * Single source-of-truth for pricing UI: rendered both on /pricing (page
 * variant) and as a section on the landing page (embed variant). Pulls
 * tier data from PLANS so adding/changing a plan updates both surfaces
 * in lockstep.
 *
 * The CTA logic delegates to <UpgradeButton> for PREMIUM (handles login
 * redirect → checkout), and a plain Link for FREE.
 */
export function PricingSection({
  locale,
  currentPlan,
  authed,
  variant = "page",
}: PricingSectionProps) {
  const isEn = locale === "en";

  const featureRows: Array<{ label: string; free: boolean; premium: boolean }> = [
    {
      label: isEn ? "Unlimited tryouts" : "Tryout tanpa batas",
      free: true,
      premium: true,
    },
    {
      label: isEn
        ? `Cita Tutor — ${PLANS.FREE.features.tutorDailyQuota} msg/day`
        : `Cita Tutor — ${PLANS.FREE.features.tutorDailyQuota} pesan/hari`,
      free: true,
      premium: false,
    },
    {
      label: isEn
        ? `Cita Tutor — ${PLANS.PREMIUM.features.tutorDailyQuota} msg/day`
        : `Cita Tutor — ${PLANS.PREMIUM.features.tutorDailyQuota} pesan/hari`,
      free: false,
      premium: true,
    },
    {
      label: isEn ? "Full result history" : "Riwayat lengkap",
      free: true,
      premium: true,
    },
    {
      label: isEn
        ? "AI Insight — personalized for you"
        : "AI Insight — dipersonalisasi",
      free: false,
      premium: true,
    },
    {
      label: isEn ? "Premium badge" : "Premium badge",
      free: false,
      premium: true,
    },
  ];

  return (
    <div
      className={
        variant === "page"
          ? "space-y-12 sm:space-y-16"
          : "space-y-10 sm:space-y-12"
      }
    >
      {/* Section header */}
      <div className="text-center">
        <p className="label-caps mb-4">
          {isEn ? "PRICING" : "HARGA"}
        </p>
        <h2
          className={
            variant === "page"
              ? "serif text-4xl sm:text-5xl tracking-tight text-foreground leading-tight"
              : "serif text-3xl sm:text-4xl lg:text-[2.75rem] tracking-tight text-foreground leading-[1.1]"
          }
        >
          {isEn
            ? "Simple pricing. Real results."
            : "Harga sederhana. Hasil nyata."}
        </h2>
        <p className="mt-5 text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          {isEn
            ? "Start free. Upgrade when you need deeper guidance from Cita Tutor."
            : "Mulai gratis. Upgrade saat butuh bimbingan lebih dalam dari Cita Tutor."}
        </p>
      </div>

      {/* Tier cards */}
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
                  <Sparkles className="size-3" strokeWidth={2} aria-hidden />
                  {isEn ? "Recommended" : "Rekomendasi"}
                </div>
              )}

              <div className="mb-6">
                <p className="label-caps mb-3">
                  {isEn ? tier.labelEn : tier.labelId}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="serif text-4xl sm:text-5xl tracking-tight">
                    {tier.priceIdr === 0
                      ? isEn ? "Free" : "Gratis"
                      : `Rp ${tier.priceIdr.toLocaleString("id-ID")}`}
                  </span>
                  {tier.priceIdr > 0 && (
                    <span className="text-sm text-muted-foreground">
                      /{isEn ? "month" : "bulan"}
                    </span>
                  )}
                </div>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  {isEn ? tier.taglineEn : tier.taglineId}
                </p>
              </div>

              <ul className="space-y-3 mb-7">
                {featureRows
                  .filter((row) => (tier.id === "FREE" ? row.free : row.premium))
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

              {isCurrent ? (
                <button
                  type="button"
                  disabled
                  className="w-full inline-flex items-center justify-center rounded-md border border-border text-sm font-medium px-4 py-2.5 text-muted-foreground cursor-not-allowed"
                >
                  {isEn ? "Your current plan" : "Paket Anda saat ini"}
                </button>
              ) : isPremium ? (
                <UpgradeButton
                  authed={authed}
                  labelUpgrade={
                    isEn ? "Upgrade to Premium" : "Upgrade ke Premium"
                  }
                  labelLogin={isEn ? "Login to upgrade" : "Login untuk upgrade"}
                  processingLabel={isEn ? "Processing…" : "Memproses…"}
                />
              ) : (
                <Link
                  href="/tryout"
                  className="w-full inline-flex items-center justify-center rounded-md border border-border text-sm font-medium px-4 py-2.5 text-foreground hover:bg-secondary/50 transition-colors"
                >
                  {isEn ? "Start free" : "Mulai gratis"}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
