import Link from "next/link"
import { Compass, Heart, ShieldCheck, Sparkles } from "lucide-react"
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
      <main className="flex-1 px-4 py-12 sm:py-16">
        <article className="mx-auto max-w-2xl space-y-10">
          <header>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
              {t.about.title}
            </h1>
            <p className="text-muted-foreground text-balance">
              {t.about.subtitle}
            </p>
          </header>

          <section className="space-y-3 text-[15px] leading-relaxed text-foreground/90">
            <h2 className="text-lg font-semibold">{t.about.whyTitle}</h2>
            <p>{t.about.why1}</p>
            <p>{t.about.why2}</p>
          </section>

          <section className="grid sm:grid-cols-3 gap-4">
            <Card icon={<Compass className="size-5" />} title={t.about.cardCalmTitle}>
              {t.about.cardCalmDesc}
            </Card>
            <Card icon={<Sparkles className="size-5" />} title={t.about.cardFocusTitle}>
              {t.about.cardFocusDesc}
            </Card>
            <Card icon={<ShieldCheck className="size-5" />} title={t.about.cardAccurateTitle}>
              {t.about.cardAccurateDesc}
            </Card>
          </section>

          <section className="space-y-3 text-[15px] leading-relaxed text-foreground/90">
            <h2 className="text-lg font-semibold">{t.about.featuresTitle}</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>{t.about.feat1Bold}</strong> {t.about.feat1}
              </li>
              <li>
                <strong>{t.about.feat2Bold}</strong> {t.about.feat2}
              </li>
              <li>
                <strong>{t.about.feat3Bold}</strong> {t.about.feat3}
              </li>
              <li>
                <strong>{t.about.feat4Bold}</strong> {t.about.feat4}
              </li>
              <li>
                <strong>{t.about.feat5Bold}</strong>{" "}
                {t.about.feat5}{" "}
                <a
                  href={REPO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-2 hover:no-underline"
                >
                  github.com/putramkti/cita
                </a>
              </li>
            </ul>
          </section>

          <section className="space-y-3 text-[15px] leading-relaxed text-foreground/90">
            <h2 className="text-lg font-semibold">{t.about.stackTitle}</h2>
            <p className="text-muted-foreground">{t.about.stackBody}</p>
          </section>

          <section className="space-y-3 text-[15px] leading-relaxed text-foreground/90">
            <h2 className="text-lg font-semibold">{t.about.disclaimerTitle}</h2>
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm space-y-2">
              <p>
                <strong>{t.about.disclaimerBody1Bold}</strong>
              </p>
              <p className="text-muted-foreground">{t.about.disclaimerBody2}</p>
            </div>
          </section>

          <section className="space-y-3 text-[15px] leading-relaxed text-foreground/90">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Heart className="size-4 text-rose-400" aria-hidden="true" />
              {t.about.teamTitle}
            </h2>
            <p>{t.about.teamBody1}</p>
            <p>
              {t.about.teamBody2}{" "}
              <a
                href={ISSUES_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2 hover:no-underline"
              >
                {t.about.teamLinkLabel}
              </a>
              .
            </p>
          </section>

          <div className="mt-6 flex flex-wrap gap-4 text-sm" lang={locale}>
            <Link href="/" className="text-primary hover:underline">
              {t.about.backHome}
            </Link>
            <Link href="/privacy" className="text-primary hover:underline">
              {t.about.privacy}
            </Link>
            <Link href="/terms" className="text-primary hover:underline">
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
    <div className="rounded-xl border border-border/60 bg-card/30 p-5 backdrop-blur">
      <div className="text-primary mb-3">{icon}</div>
      <h3 className="font-semibold mb-1.5">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{children}</p>
    </div>
  )
}
