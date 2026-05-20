import Link from "next/link"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { startTryout } from "./actions"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { PendingButton } from "@/components/feedback/pending-button"
import { getDict } from "@/lib/i18n"
import { getServiceClient } from "@/utils/supabase/admin"

export const metadata = {
  title: "Mulai Tryout SKD CPNS",
}

// Always run server-side per request — we redirect based on live DB state.
export const dynamic = "force-dynamic"

const ANON_COOKIE = "cita_anon_id"

/**
 * Tryout briefing — Academic Zen layout.
 *
 * Resume-on-revisit: if the visitor already has an IN_PROGRESS
 * attempt, we redirect them straight to that attempt's exam screen
 * instead of showing the briefing card. The exam page will reconcile
 * the timer locally; if the duration has elapsed the user can
 * submit from there. Submitted attempts are ignored (status changes
 * to SUBMITTED on submit), so finished users still see the briefing
 * and can start a new run.
 */
export default async function TryoutLandingPage() {
  const t = await getDict()

  // Resume hook: read the anon cookie without creating a new user
  // (creating a user here would be premature — only startTryout
  // should mint identities).
  const cookieStore = await cookies()
  const userId = cookieStore.get(ANON_COOKIE)?.value

  if (userId) {
    const sb = getServiceClient()
    // Latest IN_PROGRESS attempt for this user. We keep this query
    // narrow (status + userId, single row) so it stays cheap on
    // every visit to /tryout.
    const { data: ongoing } = await sb
      .from("attempts")
      .select("id")
      .eq("userId", userId)
      .eq("status", "IN_PROGRESS")
      .order("startedAt", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (ongoing?.id) {
      redirect(`/tryout/${ongoing.id}`)
    }
  }

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
              <PendingButton
                className="w-full"
                loadingLabel={t.locale === "en" ? "Starting…" : "Memulai…"}
              >
                {t.tryout.startNow}
              </PendingButton>
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
