import Link from "next/link"
import { Compass, Heart, ShieldCheck, Sparkles, ArrowRight } from "lucide-react"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { getDict, getLocale } from "@/lib/i18n"

const REPO_URL = "https://github.com/putramkti/cita"
const ISSUES_URL = "https://github.com/putramkti/cita/issues/new"

export async function generateMetadata() {
  const t = await getDict()
  return {
    title: `${t.about.title} · Cita`,
    description: t.about.subtitle,
  }
}

export default async function AboutPage() {
  const t = await getDict()
  const locale = await getLocale()

  return (
    <>
      <SiteHeader />
      <main className="flex-1 px-4 sm:px-8 py-16 sm:py-24">
        <article className="mx-auto max-w-2xl space-y-12">
          <header className="text-center">
            <p className="label-caps mb-4">CITA · ABOUT</p>
            <h1 className="serif text-4xl sm:text-5xl tracking-tight text-foreground mb-5">
              {t.about.title}
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed text-balance">
              {t.about.subtitle}
            </p>
          </header>

          <section className="space-y-3 text-[15px] leading-relaxed text-foreground/90">
            <h2 className="serif text-2xl text-foreground mb-2">
              {t.about.whyTitle}
            </h2>
            <p>{t.about.why1}</p>
            <p>{t.about.why2}</p>
          </section>

          <section className="grid sm:grid-cols-3 gap-4">
            <Card icon={<Compass className="size-5" strokeWidth={1.5} />} title={t.about.cardCalmTitle}>
              {t.about.cardCalmDesc}
            </Card>
            <Card icon={<Sparkles className="size-5" strokeWidth={1.5} />} title={t.about.cardFocusTitle}>
              {t.about.cardFocusDesc}
            </Card>
            <Card icon={<ShieldCheck className="size-5" strokeWidth={1.5} />} title={t.about.cardAccurateTitle}>
              {t.about.cardAccurateDesc}
            </Card>
          </section>

          <section className="space-y-3 text-[15px] leading-relaxed text-foreground/90">
            <h2 className="serif text-2xl text-foreground mb-2">
              {t.about.featuresTitle}
            </h2>
            <ul className="space-y-3 pl-1">
              <FeatureItem boldText={t.about.feat1Bold} text={t.about.feat1} />
              <FeatureItem boldText={t.about.feat2Bold} text={t.about.feat2} />
              <FeatureItem boldText={t.about.feat3Bold} text={t.about.feat3} />
              <FeatureItem boldText={t.about.feat4Bold} text={t.about.feat4} />
              <FeatureItem boldText={t.about.feat5Bold} text={t.about.feat5}>
                <a
                  href={REPO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground underline underline-offset-2 hover:no-underline"
                >
                  github.com/putramkti/cita
                </a>
              </FeatureItem>
            </ul>
          </section>

          <section className="space-y-3 text-[15px] leading-relaxed text-foreground/90">
            <h2 className="serif text-2xl text-foreground mb-2">
              {t.about.stackTitle}
            </h2>
            <p className="text-muted-foreground">{t.about.stackBody}</p>
          </section>

          <section className="space-y-3 text-[15px] leading-relaxed text-foreground/90">
            <h2 className="serif text-2xl text-foreground mb-2">
              {t.about.disclaimerTitle}
            </h2>
            <div className="rounded-xl border border-[var(--gold)]/40 bg-[var(--review-amber)] p-5 text-sm space-y-2 text-[var(--review-amber-fg)]">
              <p>
                <strong>{t.about.disclaimerBody1Bold}</strong>
              </p>
              <p className="text-[var(--review-amber-fg)]/85">
                {t.about.disclaimerBody2}
              </p>
            </div>
          </section>

          <section className="space-y-3 text-[15px] leading-relaxed text-foreground/90">
            <h2 className="serif text-2xl text-foreground mb-2 flex items-center gap-2">
              <Heart className="size-5 text-[var(--gold)]" strokeWidth={1.5} aria-hidden="true" />
              {t.about.teamTitle}
            </h2>
            <p>{t.about.teamBody1}</p>
            <p>
              {t.about.teamBody2}{" "}
              <a
                href={ISSUES_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline underline-offset-2 hover:no-underline inline-flex items-center gap-1"
              >
                {t.about.teamLinkLabel}
                <ArrowRight className="size-3.5" strokeWidth={2} />
              </a>
            </p>
          </section>

          <div className="mt-10 flex flex-wrap gap-x-5 gap-y-2 text-sm border-t border-border pt-6" lang={locale}>
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {t.about.backHome}
            </Link>
            <Link
              href="/privacy"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {t.about.privacy}
            </Link>
            <Link
              href="/terms"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {t.about.terms}
            </Link>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
            >
              GitHub
            </a>
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  )
}

function Card({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <span className="inline-flex items-center justify-center size-9 rounded-md border border-border text-foreground mb-4">
        {icon}
      </span>
      <h3 className="serif text-lg text-foreground mb-1.5">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{children}</p>
    </div>
  )
}

function FeatureItem({
  boldText,
  text,
  children,
}: {
  boldText: string
  text: string
  children?: React.ReactNode
}) {
  return (
    <li className="flex gap-3">
      <span
        aria-hidden="true"
        className="shrink-0 mt-2 size-1.5 rounded-full bg-[var(--gold)]"
      />
      <span>
        <strong className="text-foreground">{boldText}</strong> {text}
        {children && <> {children}</>}
      </span>
    </li>
  )
}
