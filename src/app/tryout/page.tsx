import Link from "next/link"
import { startTryout } from "./actions"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { getDict } from "@/lib/i18n"

export const metadata = {
  title: "Mulai Tryout SKD CPNS",
}

export default async function TryoutLandingPage() {
  const t = await getDict()
  return (
    <>
      <SiteHeader />
      <main className="flex-1 px-4 py-12 sm:py-20">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
              SKD Mock Test
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              {t.tryout.briefingTitle}
            </h1>
            <p className="mt-3 text-muted-foreground text-balance">
              {t.tryout.briefingSubtitle}
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card/40 p-6 sm:p-8 backdrop-blur space-y-5">
            <ul className="space-y-3 text-sm">
              <Bullet>{t.tryout.rule1}</Bullet>
              <Bullet>{t.tryout.rule2}</Bullet>
              <Bullet>{t.tryout.rule3}</Bullet>
              <Bullet>{t.tryout.rule4}</Bullet>
            </ul>

            <form action={startTryout} className="pt-3">
              <Button type="submit" size="lg" className="w-full px-7">
                {t.tryout.startNow}
              </Button>
            </form>
            <p className="text-center text-xs text-muted-foreground">
              {t.tryout.legalNote}{" "}
              <Link href="/terms" className="underline hover:text-foreground">
                {t.footer.terms}
              </Link>{" "}
              {t.tryout.and}{" "}
              <Link href="/privacy" className="underline hover:text-foreground">
                {t.footer.privacy}
              </Link>
              {" "}Cita.
            </p>
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground/70">
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
      <span className="mt-1.5 size-1.5 rounded-full bg-primary shrink-0" />
      <span className="text-muted-foreground leading-relaxed">{children}</span>
    </li>
  )
}
