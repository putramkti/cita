import Link from "next/link"
import { Logo } from "@/components/brand/logo"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/70 border-b border-border/40">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight"
        >
          <Logo className="size-7" />
          <span className="text-lg">Cita</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-3 text-sm">
          <Link
            href="/tryout"
            className="px-3 py-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
          >
            Tryout
          </Link>
          <Link
            href="/leaderboard"
            className="px-3 py-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground hidden sm:inline"
          >
            Peringkat
          </Link>
          <Link
            href="/tryout"
            className="ml-1 px-3 py-1.5 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
          >
            Mulai
          </Link>
        </nav>
      </div>
    </header>
  )
}
