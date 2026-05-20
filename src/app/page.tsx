import Link from "next/link"
import { Check, Clock, BarChart3, Sparkles, Fingerprint } from "lucide-react"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { RevealOnView } from "@/components/feedback/reveal-on-view"
import { MentorLiveCard } from "@/components/landing/mentor-live-card"
import { SimulationDashboard } from "@/components/landing/simulation-dashboard"
import { getDict } from "@/lib/i18n"

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://cita-nu.vercel.app"

/**
 * Landing page — Academic Zen redesign.
 *
 * Structure follows the design source one-to-one:
 *   1. Eyebrow pill + serif italic hero + dual CTA
 *   2. Two-column feature cards (light Privacy + dark AI Mentor)
 *   3. Simulation showcase: text left, live exam dashboard right
 *   4. Final CTA section (centered serif italic + single solid Ink CTA)
 *
 * Hero copy is locked per the user spec: the tagline
 *   "Wujudkan Cita-cita jadi ASN, dimulai dari sini."
 * remains intact, with the trailing clause set in serif italic to mirror
 * the design source's editorial emphasis pattern.
 *
 * Choreography (Academic Zen — calm, intentional):
 *   - Every section fades + lifts 30px on scroll-in via RevealOnView.
 *   - Adjacent feature cards stagger by 150ms.
 *   - Mentor card simulates a live tutor reply (typing → reveal).
 *   - Simulation dashboard is interactive: live countdown timer,
 *     breathing pulse on the active question cell, hover nudge on
 *     the prev/next buttons.
 * All animations are gated behind prefers-reduced-motion: no-preference.
 */
export default async function HomePage() {
  const t = await getDict()

  // JSON-LD — EducationalOrganization + WebApplication.
  // Two top-level objects in @graph so search engines treat them as
  // related entities. EducationalOrganization carries the brand;
  // WebApplication signals the actual product (free tryout webapp).
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "EducationalOrganization",
        "@id": `${SITE_URL}#org`,
        name: "Cita",
        url: SITE_URL,
        logo: `${SITE_URL}/icon-512.png`,
        description: t.landing.heroSubtitle,
        sameAs: ["https://github.com/putramkti/cita"],
      },
      {
        "@type": "WebApplication",
        "@id": `${SITE_URL}#app`,
        name: "Cita — Tryout SKD CPNS",
        url: SITE_URL,
        applicationCategory: "EducationalApplication",
        operatingSystem: "Any (web)",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "IDR",
        },
        publisher: { "@id": `${SITE_URL}#org` },
        description: t.landing.heroSubtitle,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />
      <main className="flex-1">
        <HeroSection t={t.landing} />
        <FeatureCardsSection t={t.landing} />
        <ShowcaseSection t={t.landing} />
        <FinalCtaSection t={t.landing} />
      </main>
      <SiteFooter />
    </>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
 *  HERO
 * ───────────────────────────────────────────────────────────────────────── */

function HeroSection({ t }: { t: Awaited<ReturnType<typeof getDict>>["landing"] }) {
  return (
    <section className="relative overflow-hidden">
      {/* Decorative parchment circles — low opacity, purely background texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute -left-40 top-10 h-[420px] w-[420px] rounded-full border border-border/40 opacity-50" />
        <div className="absolute -right-32 -top-10 h-[360px] w-[360px] rounded-full border border-border/40 opacity-40" />
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-8 pt-20 pb-16 sm:pt-28 sm:pb-24 text-center">
        <RevealOnView>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            <span className="size-1.5 rounded-full bg-accent" />
            {t.heroEyebrow}
          </span>
        </RevealOnView>

        <RevealOnView delay={120}>
          <h1 className="serif mx-auto mt-8 max-w-3xl text-balance text-[2.75rem] sm:text-6xl leading-[1.05] tracking-tight text-foreground">
            {t.heroTitle}
            <br />
            <em className="italic text-foreground">{t.heroTitleItalic}</em>
          </h1>
        </RevealOnView>

        <RevealOnView delay={240}>
          <p className="mx-auto mt-7 max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed text-balance">
            {t.heroSubtitle}
          </p>
        </RevealOnView>

        <RevealOnView delay={360}>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/tryout"
              className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-medium px-6 py-3 hover:bg-primary/90 transition-colors w-full sm:w-auto"
            >
              {t.ctaStart}
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center rounded-md border border-border bg-card text-foreground text-sm font-medium px-6 py-3 hover:bg-secondary transition-colors w-full sm:w-auto"
            >
              {t.ctaLeaderboard}
            </Link>
          </div>
        </RevealOnView>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
 *  FEATURE CARDS (Privacy + AI Mentor)
 * ───────────────────────────────────────────────────────────────────────── */

function FeatureCardsSection({
  t,
}: {
  t: Awaited<ReturnType<typeof getDict>>["landing"]
}) {
  return (
    <section className="px-4 sm:px-8 pb-16">
      <div className="mx-auto grid max-w-5xl grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Privacy card (light) */}
        <RevealOnView as="article">
          <div className="rounded-xl border border-border bg-card p-7 sm:p-8 h-full">
            <div className="flex items-start justify-between mb-5">
              <span
                aria-hidden="true"
                className="inline-flex items-center justify-center size-10 rounded-lg border border-border text-foreground"
              >
                <Fingerprint className="size-5" strokeWidth={1.5} />
              </span>
              <span className="label-caps">{t.privacyCardEyebrow}</span>
            </div>
            <h3 className="serif text-2xl sm:text-[1.65rem] leading-snug text-foreground mb-3">
              {t.privacyCardTitle}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              {t.privacyCardBody}
            </p>
            <ul className="space-y-2.5 text-sm text-foreground/90">
              <li className="flex items-start gap-2.5">
                <Check className="size-4 text-accent shrink-0 mt-0.5" />
                <span>{t.privacyCardCheck1}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="size-4 text-accent shrink-0 mt-0.5" />
                <span>{t.privacyCardCheck2}</span>
              </li>
            </ul>
          </div>
        </RevealOnView>

        {/* AI mentor card (dark, contrast block) — staggered 150ms after the
            privacy card to land in sequence rather than simultaneously. */}
        <RevealOnView as="article" delay={150}>
          <div className="rounded-xl border border-[#1f2a3a] bg-[#0c1018] text-[#e7e8e9] p-7 sm:p-8 h-full">
            <div className="flex items-start justify-between mb-5">
              <span
                aria-hidden="true"
                className="inline-flex items-center justify-center size-10 rounded-lg border border-white/10 text-[var(--gold-soft)]"
              >
                <Sparkles className="size-5" strokeWidth={1.5} />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/55">
                {t.mentorCardEyebrow}
              </span>
            </div>
            <h3 className="serif text-2xl sm:text-[1.65rem] leading-snug mb-4">
              {t.mentorCardTitle}
            </h3>
            <p className="text-sm text-white/65 leading-relaxed mb-5">
              {t.mentorCardBody}
            </p>

            {/* Live mentor chat — typing indicator then message reveal */}
            <MentorLiveCard
              questionText={t.mentorCardChat1Q}
              answerText={t.mentorCardChat1A}
            />
          </div>
        </RevealOnView>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
 *  SHOWCASE (text left, live simulation dashboard right)
 * ───────────────────────────────────────────────────────────────────────── */

function ShowcaseSection({
  t,
}: {
  t: Awaited<ReturnType<typeof getDict>>["landing"]
}) {
  return (
    <section className="border-t border-border bg-secondary/40">
      <div className="mx-auto grid max-w-6xl grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center px-4 sm:px-8 py-20 lg:py-28">
        {/* Text column */}
        <RevealOnView>
          <div>
            <h2 className="serif text-3xl sm:text-4xl lg:text-[2.75rem] leading-[1.1] tracking-tight text-foreground">
              {t.showcaseTitle}{" "}
              <em className="italic">{t.showcaseTitleItalic}</em>{" "}
              {t.showcaseTitleAfter}
            </h2>
            <p className="mt-5 text-base text-muted-foreground leading-relaxed max-w-md">
              {t.showcaseBody}
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <Clock className="size-5 text-accent mb-3" strokeWidth={1.5} />
                <h4 className="text-sm font-semibold text-foreground mb-1.5">
                  {t.showcaseFeat1Title}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t.showcaseFeat1Body}
                </p>
              </div>
              <div>
                <BarChart3
                  className="size-5 text-accent mb-3"
                  strokeWidth={1.5}
                />
                <h4 className="text-sm font-semibold text-foreground mb-1.5">
                  {t.showcaseFeat2Title}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t.showcaseFeat2Body}
                </p>
              </div>
            </div>
          </div>
        </RevealOnView>

        {/* Live simulation dashboard — interactive replica of the real
            /tryout/[id] exam screen. Stagger 150ms behind the text. */}
        <RevealOnView delay={150}>
          <div className="relative">
            <SimulationDashboard dict={t.sim} />
            {/* Floating accent badge */}
            <span className="absolute -bottom-3 right-4 inline-flex items-center rounded-full bg-[var(--gold)]/15 text-[var(--review-amber-fg)] border border-[var(--gold)]/30 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em]">
              {t.showcaseBadge}
            </span>
          </div>
        </RevealOnView>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
 *  FINAL CTA
 * ───────────────────────────────────────────────────────────────────────── */

function FinalCtaSection({
  t,
}: {
  t: Awaited<ReturnType<typeof getDict>>["landing"]
}) {
  return (
    <section className="px-4 sm:px-8 py-24 sm:py-32 text-center">
      <RevealOnView>
        <div className="mx-auto max-w-3xl">
          <h2 className="serif text-3xl sm:text-5xl leading-[1.1] tracking-tight text-foreground">
            {t.finalCtaTitle}{" "}
            <em className="italic">{t.finalCtaTitleItalic}</em>{" "}
            {t.finalCtaTitleAfter}
          </h2>
          <p className="mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed">
            {t.finalCtaSubtitle}
          </p>
          <Link
            href="/tryout"
            className="mt-10 inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-medium px-7 py-3 hover:bg-primary/90 transition-colors"
          >
            {t.finalCtaButton}
          </Link>
        </div>
      </RevealOnView>
    </section>
  )
}
