import Link from "next/link"
import { Logo } from "@/components/brand/logo"
import { getLocale, getDictByLocale } from "@/lib/i18n"

export async function SiteFooter() {
  const locale = await getLocale()
  const t = getDictByLocale(locale)
  return (
    <footer className="border-t border-border/40 mt-20">
      <div className="mx-auto max-w-6xl px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Logo className="size-5" />
          <span>
            <span className="font-medium text-foreground">Cita</span> · {t.footer.tagline}
          </span>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/privacy" className="hover:text-foreground">
            {t.footer.privacy}
          </Link>
          <Link href="/terms" className="hover:text-foreground">
            {t.footer.terms}
          </Link>
          <Link href="/about" className="hover:text-foreground">
            {t.footer.about}
          </Link>
        </nav>
        <p className="text-xs text-muted-foreground/70 text-center sm:text-right max-w-[18rem]">
          {t.footer.disclaimer}
        </p>
      </div>
    </footer>
  )
}
