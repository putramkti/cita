import Link from "next/link"
import { Logo } from "@/components/brand/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { LocaleToggle } from "@/components/locale-toggle"
import { HeaderAuth } from "@/components/layout/header-auth"
import { MobileMenu } from "@/components/layout/mobile-menu"
import { getCurrentUser } from "@/lib/auth/get-user"
import { getLocale, getDictByLocale } from "@/lib/i18n"

/**
 * Site header — Academic Zen redesign.
 *
 * Backdrop-blurred parchment surface with hairline bottom border.
 * Wordmark + hamburger (mobile) on the left, link nav in the centre (desktop),
 * locale + theme toggles + auth slot + ink-blue CTA on the right.
 *
 * Mobile (<md): wordmark · spacer · CTA · hamburger
 * Desktop (md+): wordmark · centre nav · toggles + auth + CTA
 */
export async function SiteHeader() {
  const locale = await getLocale()
  const t = getDictByLocale(locale)
  const user = await getCurrentUser()

  const navLinks = [
    { href: "/tryout", label: t.nav.tryout },
    { href: "/leaderboard", label: t.nav.leaderboard },
    { href: "/pricing", label: t.nav.pricing },
    { href: "/persyaratan", label: t.nav.requirements },
    { href: "/about", label: t.nav.about },
  ]

  const mobileUser = user
    ? {
        label: user.displayName ?? user.email ?? "Akun",
        role: user.role,
      }
    : null

  return (
    <header className="sticky top-0 z-40 surface-blur border-b border-border/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-8">
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

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7 text-sm">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LocaleToggle current={locale} />
          <ThemeToggle
            labelDark={t.common.lightMode}
            labelLight={t.common.darkMode}
          />
          {/* Auth slot — desktop only (mobile shows it inside hamburger) */}
          <HeaderAuth loginLabel={t.nav.login} />
          <Link
            href="/tryout"
            className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-medium px-4 py-2 hover:bg-primary/90 transition-colors"
          >
            {t.nav.start}
          </Link>
          {/* Hamburger — mobile only */}
          <MobileMenu
            navLinks={navLinks}
            loginLabel={t.nav.login}
            logoutLabel="Keluar"
            accountLabel="Akun saya"
            user={mobileUser}
          />
        </div>
      </div>
    </header>
  )
}
