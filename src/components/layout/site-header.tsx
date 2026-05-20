import Link from "next/link"
import { Logo } from "@/components/brand/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { LocaleToggle } from "@/components/locale-toggle"
import { getLocale, getDictByLocale } from "@/lib/i18n"

export async function SiteHeader() {
  const locale = await getLocale()
  const t = getDictByLocale(locale)
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/70 border-b border-border/40">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          aria-label="Cita home"
          className="inline-flex items-center gap-2"
        >
          <Logo className="size-7" />
          <span className="font-semibold tracking-tight text-base">Cita</span>
        </Link>
        <nav className="hidden sm:flex items-center gap-6 text-sm">
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
        </nav>
        <div className="flex items-center gap-2">
          <LocaleToggle current={locale} />
          <ThemeToggle
            labelDark={t.common.lightMode}
            labelLight={t.common.darkMode}
          />
          <Link
            href="/tryout"
            className="hidden sm:inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-medium px-3.5 py-1.5 hover:bg-primary/90 transition-colors"
          >
            {t.nav.start}
          </Link>
        </div>
      </div>
    </header>
  )
}
