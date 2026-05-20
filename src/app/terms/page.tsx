import Link from "next/link"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { getDict } from "@/lib/i18n"

const ISSUES_URL = "https://github.com/putramkti/cita/issues/new"
const EFFECTIVE_DATE = "2026-05-20"

export async function generateMetadata() {
  const t = await getDict()
  return {
    title: `${t.terms.title} · Cita`,
    description: t.terms.s1Body,
  }
}

export default async function TermsPage() {
  const t = await getDict()

  return (
    <>
      <SiteHeader />
      <main className="flex-1 px-4 py-12 sm:py-16">
        <article className="mx-auto max-w-2xl">
          <h1 className="serif text-4xl sm:text-5xl tracking-tight text-foreground mb-3">{t.terms.title}</h1>
          <p className="text-sm text-muted-foreground mb-8">
            {t.terms.effective}: {EFFECTIVE_DATE} · {t.terms.lastUpdated}: {EFFECTIVE_DATE}
          </p>

          <div className="space-y-6 text-[15px] leading-relaxed text-foreground/90">
            <section className="rounded-xl border border-[var(--gold)]/40 bg-[var(--review-amber)] p-5 space-y-2">
              <h2 className="text-sm font-semibold text-[var(--review-amber-fg)] uppercase tracking-widest mb-2">
                {t.terms.noticeLabel}
              </h2>
              <p className="text-sm text-[var(--review-amber-fg)]">
                <strong>{t.terms.noticeBoldBody}</strong>
              </p>
              <p className="text-sm text-[var(--review-amber-fg)]/85">{t.terms.noticeBody}</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">{t.terms.s1Title}</h2>
              <p>{t.terms.s1Body}</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">{t.terms.s2Title}</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>{t.terms.s2Item1}</li>
                <li>{t.terms.s2Item2}</li>
                <li>{t.terms.s2Item3}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">{t.terms.s3Title}</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>{t.terms.s3Item1}</li>
                <li>{t.terms.s3Item2}</li>
                <li>{t.terms.s3Item3}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">{t.terms.s4Title}</h2>
              <p>{t.terms.s4Lead}</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>{t.terms.s4Item1}</li>
                <li>{t.terms.s4Item2}</li>
                <li>{t.terms.s4Item3}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">{t.terms.s5Title}</h2>
              <p>{t.terms.s5Body}</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">{t.terms.s6Title}</h2>
              <p>{t.terms.s6Body}</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">{t.terms.s7Title}</h2>
              <p>{t.terms.s7Body}</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">{t.terms.s8Title}</h2>
              <p>{t.terms.s8Body}</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">{t.terms.contactTitle}</h2>
              <p>
                {t.terms.contactBody}{" "}
                <a
                  href={ISSUES_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-2 hover:no-underline"
                >
                  {t.terms.contactLinkLabel}
                </a>
                .
              </p>
            </section>
          </div>

          <div className="mt-10 flex gap-4 text-sm">
            <Link href="/privacy" className="text-primary hover:underline">
              {t.terms.navPrivacy}
            </Link>
            <Link href="/" className="text-primary hover:underline">
              {t.terms.navHome}
            </Link>
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  )
}
