import Link from "next/link"
import { Logo } from "@/components/brand/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { LocaleToggle } from "@/components/locale-toggle"
import { getLocale, getDictByLocale } from "@/lib/i18n"

/**
 * Site header — Academic Zen redesign.
 *
 * Backdrop-blurred parchment surface with hairline bottom border.
 * Wordmark in serif on the left, link nav in the centre,
 * cosmetic "Log In" placeholder + locale/theme toggles + ink-blue
 * CTA on the right.
 */
export async function SiteHeader() {
  const locale = await getLocale()
  const t = getDictByLocale(locale)
  return (
    <header className="sticky top-0 z-40 surface-blur border-b border-border/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-8">
        <Link
          href="/"
          aria-label="Cita home"
          className="inline-flex items-center gap-2 text-foreground"
        >
          <Logo className="size-8 text-foreground" />
          <span className="serif text-xl font-medium tracking-tight">
            Cita
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm">
          <Link
            href="/tryout"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {t.nav.tryout}
          </Link>
          <Link
            href="/leaderboard"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {t.nav.leaderboard}
          </Link>
          <Link
            href="/persyaratan"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {t.nav.requirements}
          </Link>
          <Link
            href="/about"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {t.nav.about}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <LocaleToggle current={locale} />
          <ThemeToggle
            labelDark={t.common.lightMode}
            labelLight={t.common.darkMode}
          />
          {/* Cosmetic Log In placeholder — Cita is anonymous-first; this slot
              is reserved for future cross-device sync. Disabled to signal
              non-interactive state without removing the visual anchor. */}
          <button
            type="button"
            disabled
            aria-disabled="true"
            title={t.nav.login}
            className="hidden sm:inline-flex items-center text-sm text-muted-foreground/70 hover:text-muted-foreground/70 cursor-not-allowed select-none px-2 py-1.5"
          >
            {t.nav.login}
          </button>
          <Link
            href="/tryout"
            className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-medium px-4 py-2 hover:bg-primary/90 transition-colors"
          >
            {t.nav.start}
          </Link>
        </div>
      </div>
    </header>
  )
}
