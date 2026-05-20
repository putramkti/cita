import Link from "next/link"
import { Logo } from "@/components/brand/logo"

export function SiteFooter() {
  return (
    <footer className="border-t border-border/40 mt-20">
      <div className="mx-auto max-w-6xl px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Logo className="size-5" />
          <span>
            <span className="font-medium text-foreground">Cita</span> · Tenang,
            fokus, akurat
          </span>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/privacy" className="hover:text-foreground">
            Privasi
          </Link>
          <Link href="/terms" className="hover:text-foreground">
            Ketentuan
          </Link>
          <Link href="/about" className="hover:text-foreground">
            Tentang
          </Link>
        </nav>
        <p className="text-xs text-muted-foreground/70 text-center sm:text-right">
          Platform persiapan independen.
          <br className="sm:hidden" />{" "}
          <span className="hidden sm:inline">·</span> Bukan afiliasi BKN.
        </p>
      </div>
    </footer>
  )
}
