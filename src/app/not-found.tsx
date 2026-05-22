import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { getDict } from "@/lib/i18n"

/**
 * 404 page — Academic Zen.
 *
 * Renders when Next.js can't find a route or notFound() is called
 * inside a server component. Editorial typography, locale-aware,
 * single CTA back to home.
 */
export default async function NotFound() {
  const t = await getDict()
  return (
    <>
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center px-4 sm:px-8 py-24 sm:py-32">
        <div className="max-w-xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            <span className="size-1.5 rounded-full bg-accent" />
            {t.notFound.eyebrow}
          </span>

          <h1 className="serif mt-7 text-4xl sm:text-5xl leading-[1.1] tracking-tight text-foreground">
            {t.notFound.title}
          </h1>

          <p className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed text-balance">
            {t.notFound.body}
          </p>

          <Link
            href="/"
            className="mt-9 inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground text-sm font-medium px-6 py-3 hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="size-4" strokeWidth={1.5} />
            {t.notFound.cta}
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
