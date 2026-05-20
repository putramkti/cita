import Link from "next/link"
import { Check, Clock, BarChart3, GraduationCap, Sparkle } from "lucide-react"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { getDict } from "@/lib/i18n"

/**
 * Landing page — Academic Zen redesign.
 *
 * Structure follows the design source one-to-one:
 *   1. Eyebrow pill + serif italic hero + dual CTA
 *   2. Two-column feature cards (light Privacy + dark AI Mentor)
 *   3. Simulation showcase: text left, browser mockup right
 *   4. Final CTA section (centered serif italic + single solid Ink CTA)
 *
 * Hero copy is locked per the user spec: the tagline
 *   "Wujudkan Cita-cita jadi ASN, dimulai dari sini."
 * remains intact, with the trailing clause set in serif italic to mirror
 * the design source's editorial emphasis pattern.
 */
export default async function HomePage() {
  const t = await getDict()
  return (
    <>
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
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          <span className="size-1.5 rounded-full bg-accent" />
          {t.heroEyebrow}
        </span>

        <h1 className="serif mx-auto mt-8 max-w-3xl text-balance text-[2.75rem] sm:text-6xl leading-[1.05] tracking-tight text-foreground">
          {t.heroTitle}
          <br />
          <em className="italic text-foreground">{t.heroTitleItalic}</em>
        </h1>

        <p className="mx-auto mt-7 max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed text-balance">
          {t.heroSubtitle}
        </p>

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
        <article className="rounded-xl border border-border bg-card p-7 sm:p-8">
          <div className="flex items-start justify-between mb-5">
            <span
              aria-hidden="true"
              className="inline-flex items-center justify-center size-10 rounded-lg border border-border text-foreground"
            >
              <Sparkle className="size-5" strokeWidth={1.5} />
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
        </article>

        {/* AI mentor card (dark, contrast block) */}
        <article className="rounded-xl border border-[#1f2a3a] bg-[#0c1018] text-[#e7e8e9] p-7 sm:p-8">
          <div className="flex items-start justify-between mb-5">
            <span
              aria-hidden="true"
              className="inline-flex items-center justify-center size-10 rounded-lg border border-white/10 text-[var(--gold-soft)]"
            >
              <GraduationCap className="size-5" strokeWidth={1.5} />
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

          {/* Mock chat preview */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className="size-7 shrink-0 rounded-full bg-white/10 border border-white/15"
              />
              <p className="rounded-lg bg-white/[0.06] border border-white/10 px-3.5 py-2.5 text-sm italic text-white/80 leading-relaxed">
                “{t.mentorCardChat1Q}”
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className="size-7 shrink-0 rounded-full bg-[var(--gold)]/20 border border-[var(--gold)]/40 inline-flex items-center justify-center text-[var(--gold-soft)]"
              >
                <GraduationCap className="size-3.5" strokeWidth={2} />
              </span>
              <p className="rounded-lg bg-white/[0.04] border border-white/10 px-3.5 py-2.5 text-sm text-white/75 leading-relaxed">
                {t.mentorCardChat1A}
              </p>
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
 *  SHOWCASE (text left, browser mockup right)
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

        {/* Browser mockup */}
        <div className="relative">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {/* Window chrome */}
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border bg-secondary/50">
              <span className="size-2.5 rounded-full bg-[#ff5f57]" />
              <span className="size-2.5 rounded-full bg-[#febc2e]" />
              <span className="size-2.5 rounded-full bg-[#28c840]" />
            </div>
            {/* Mock content */}
            <div className="px-6 py-7">
              <div className="flex items-center justify-between mb-8">
                <span className="label-caps">{t.showcaseQuestionLabel}</span>
                <span className="font-mono text-sm font-semibold text-destructive">
                  45:00
                </span>
              </div>
              <div className="aspect-[4/3] rounded-md border border-dashed border-border bg-secondary/40 flex flex-col items-center justify-center gap-3 text-center">
                <div className="grid grid-cols-3 gap-1">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <span
                      key={i}
                      className="size-3 rounded-sm border border-border"
                    />
                  ))}
                </div>
                <p className="serif text-xl text-foreground">
                  {t.showcaseMockTitle}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t.showcaseMockSubtitle}
                </p>
              </div>
            </div>
          </div>
          {/* Floating accent badge */}
          <span className="absolute -bottom-3 right-4 inline-flex items-center rounded-full bg-[var(--gold)]/15 text-[var(--review-amber-fg)] border border-[var(--gold)]/30 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em]">
            {t.showcaseBadge}
          </span>
        </div>
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
    </section>
  )
}
