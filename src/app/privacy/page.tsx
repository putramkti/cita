import Link from "next/link"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { getDict } from "@/lib/i18n"

const ISSUES_URL = "https://github.com/putramkti/cita/issues/new"
const SUPABASE_PRIVACY = "https://supabase.com/privacy"
const VERCEL_PRIVACY = "https://vercel.com/legal/privacy-policy"
const EFFECTIVE_DATE = "2026-05-20"

export async function generateMetadata() {
  const t = await getDict()
  return {
    title: `${t.privacy.title} · Cita`,
    description: t.privacy.summaryBody,
  }
}

export default async function PrivacyPage() {
  const t = await getDict()

  return (
    <>
      <SiteHeader />
      <main className="flex-1 px-4 py-12 sm:py-16">
        <article className="mx-auto max-w-2xl">
          <h1 className="serif text-4xl sm:text-5xl tracking-tight text-foreground mb-3">{t.privacy.title}</h1>
          <p className="text-sm text-muted-foreground mb-8">
            {t.privacy.effective}: {EFFECTIVE_DATE} · {t.privacy.lastUpdated}: {EFFECTIVE_DATE}
          </p>

          <div className="space-y-6 text-[15px] leading-relaxed text-foreground/90">
            <section>
              <h2 className="text-lg font-semibold mb-2">{t.privacy.summaryTitle}</h2>
              <p>{t.privacy.summaryBody}</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">{t.privacy.collectedTitle}</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>{t.privacy.collectedAnonIdLabel}</strong> — {t.privacy.collectedAnonIdBody}
                </li>
                <li>
                  <strong>{t.privacy.collectedAnswersLabel}</strong> — {t.privacy.collectedAnswersBody}
                </li>
                <li>
                  <strong>{t.privacy.collectedEmailLabel}</strong> — {t.privacy.collectedEmailBody}
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">{t.privacy.notDoTitle}</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>{t.privacy.notDo1}</li>
                <li>{t.privacy.notDo2}</li>
                <li>{t.privacy.notDo3}</li>
                <li>{t.privacy.notDo4}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">{t.privacy.thirdPartyTitle}</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Supabase</strong> — {t.privacy.thirdPartySupabase.replace(/^Supabase\s+—\s+/, "")}{" "}
                  <a
                    href={SUPABASE_PRIVACY}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline underline-offset-2 hover:no-underline"
                  >
                    {t.privacy.thirdPartySupabaseLink}
                  </a>
                  .
                </li>
                <li>
                  <strong>Vercel</strong> — {t.privacy.thirdPartyVercel.replace(/^Vercel\s+—\s+/, "")}{" "}
                  <a
                    href={VERCEL_PRIVACY}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline underline-offset-2 hover:no-underline"
                  >
                    {t.privacy.thirdPartyVercelLink}
                  </a>
                  .
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">{t.privacy.rightsTitle}</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>{t.privacy.rightsDelete}</li>
                <li>{t.privacy.rightsAccess}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">{t.privacy.contactTitle}</h2>
              <p>
                {t.privacy.contactBody}{" "}
                <a
                  href={ISSUES_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-2 hover:no-underline"
                >
                  {t.privacy.contactLinkLabel}
                </a>
                .
              </p>
            </section>

            <p className="pt-6 border-t border-border/40 text-xs text-muted-foreground">
              {t.privacy.footnote}
            </p>
          </div>

          <div className="mt-10 flex gap-4 text-sm">
            <Link href="/terms" className="text-primary hover:underline">
              {t.privacy.navTerms}
            </Link>
            <Link href="/" className="text-primary hover:underline">
              {t.privacy.navHome}
            </Link>
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  )
}
