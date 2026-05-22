"use client"

import { useEffect } from "react"
import Link from "next/link"
import { RefreshCcw, ArrowLeft } from "lucide-react"

/**
 * Route-level error boundary — Academic Zen.
 *
 * Catches errors in any segment under the root layout. Uses
 * baked-in copy (English fallback) since the i18n dict requires
 * a server async boundary that we can't safely cross from the
 * client error boundary.
 *
 * In production, replace the console.error with a Sentry capture
 * once that's wired up.
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("[error.tsx]", error)
  }, [error])

  return (
    <main className="flex-1 flex items-center justify-center px-4 sm:px-8 py-24 sm:py-32">
      <div className="max-w-xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-destructive/80">
          <span className="size-1.5 rounded-full bg-destructive" />
          Something went wrong
        </span>

        <h1 className="serif mt-7 text-3xl sm:text-4xl leading-[1.1] tracking-tight text-foreground">
          We hit an unexpected snag
        </h1>

        <p className="mt-5 text-base text-muted-foreground leading-relaxed text-balance">
          Sorry, something went wrong on this page. Try reloading, or
          head back to the home page.
        </p>

        {error?.digest && (
          <p className="mt-4 text-xs text-muted-foreground/70 font-mono">
            ref: {error.digest}
          </p>
        )}

        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground text-sm font-medium px-6 py-3 hover:bg-primary/90 transition-colors w-full sm:w-auto"
          >
            <RefreshCcw className="size-4" strokeWidth={1.5} />
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-card text-foreground text-sm font-medium px-6 py-3 hover:bg-secondary transition-colors w-full sm:w-auto"
          >
            <ArrowLeft className="size-4" strokeWidth={1.5} />
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  )
}
