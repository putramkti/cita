import Link from "next/link"
import { Logo } from "@/components/brand/logo"
import { getLocale, getDictByLocale } from "@/lib/i18n"

const REPO_URL = "https://github.com/putramkti/cita"
const ISSUES_URL = "https://github.com/putramkti/cita/issues"

/**
 * Site footer — Academic Zen redesign.
 *
 * Three-column layout: brand block + Resources + Legal.
 * Hairline top border, parchment fill, no shadows.
 */
export async function SiteFooter() {
  const locale = await getLocale()
  const t = getDictByLocale(locale)
  const year = new Date().getFullYear()

  return (
    <footer className="mt-24 border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-6xl px-4 sm:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand block */}
          <div className="md:col-span-6 flex flex-col gap-4">
            <Link
              href="/"
              aria-label="Cita home"
              className="inline-flex items-center gap-2 text-foreground"
            >
              <Logo className="size-8 text-foreground" />
              <span className="serif text-xl font-medium tracking-tight">
                Cita Academic
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
              {t.footer.excellence}
            </p>
            <p className="text-xs text-muted-foreground/80 mt-2">
              © {year} {t.footer.copyright}
            </p>
            <p className="text-xs text-muted-foreground/70 max-w-md leading-relaxed">
              {t.footer.disclaimer}
            </p>
          </div>

          {/* Resources column */}
          <div className="md:col-span-3 flex flex-col gap-3">
            <h3 className="label-caps text-foreground">
              {t.footer.resourcesTitle}
            </h3>
            <ul className="flex flex-col gap-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t.footer.about}
                </Link>
              </li>
              <li>
                <a
                  href={REPO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href={ISSUES_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t.footer.methodology}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal column */}
          <div className="md:col-span-3 flex flex-col gap-3">
            <h3 className="label-caps text-foreground">
              {t.footer.legalTitle}
            </h3>
            <ul className="flex flex-col gap-2 text-sm">
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t.footer.privacy}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t.footer.terms}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
