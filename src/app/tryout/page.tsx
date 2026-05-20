import Link from "next/link"
import { startTryout } from "./actions"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { getDict } from "@/lib/i18n"

export const metadata = {
  title: "Mulai Tryout SKD CPNS",
}

/**
 * Tryout briefing — Academic Zen layout.
 *
 * Editorial pre-test surface: label-caps eyebrow, oversized serif
 * heading, a hairline-bordered card carrying the rules and the
 * primary CTA. No gradients, no shadows.
 */
export default async function TryoutLandingPage() {
  const t = await getDict()
  return (
    <>
      <SiteHeader />
      <main className="flex-1 px-4 sm:px-8 py-16 sm:py-24">
        <div className="mx-auto max-w-2xl">
          <div className="mb-10 text-center">
            <p className="label-caps mb-4">SKD MOCK TEST</p>
            <h1 className="serif text-4xl sm:text-5xl tracking-tight text-foreground leading-tight">
              {t.tryout.briefingTitle}
            </h1>
            <p className="mt-5 text-base text-muted-foreground leading-relaxed text-balance">
              {t.tryout.briefingSubtitle}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-7 sm:p-9 space-y-7">
            <ul className="space-y-3.5 text-sm">
              <Bullet>{t.tryout.rule1}</Bullet>
              <Bullet>{t.tryout.rule2}</Bullet>
              <Bullet>{t.tryout.rule3}</Bullet>
              <Bullet>{t.tryout.rule4}</Bullet>
            </ul>

            <form action={startTryout}>
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-medium px-6 py-3 hover:bg-primary/90 transition-colors"
              >
                {t.tryout.startNow}
              </button>
            </form>

            <p className="text-center text-xs text-muted-foreground leading-relaxed">
              {t.tryout.legalNote}{" "}
              <Link
                href="/terms"
                className="text-foreground underline underline-offset-2 hover:no-underline"
              >
                {t.footer.terms}
              </Link>{" "}
              {t.tryout.and}{" "}
              <Link
                href="/privacy"
                className="text-foreground underline underline-offset-2 hover:no-underline"
              >
                {t.footer.privacy}
              </Link>
              {" "}Cita.
            </p>
          </div>

          <p className="mt-10 text-center text-xs text-muted-foreground/80 max-w-md mx-auto leading-relaxed">
            {t.footer.disclaimer}
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span
        aria-hidden="true"
        className="mt-2 size-1.5 rounded-full bg-[var(--gold)] shrink-0"
      />
      <span className="text-foreground/85 leading-relaxed">{children}</span>
    </li>
  )
}
