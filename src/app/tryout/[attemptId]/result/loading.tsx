import { SiteHeader } from "@/components/layout/site-header"

/**
 * Result page loading fallback. Reproduces the score hero + 3 subtest
 * cards + AI insight banner so the layout settles cleanly.
 */
export default function ResultLoading() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 px-4 sm:px-8 py-12 sm:py-16">
        <div className="mx-auto max-w-5xl space-y-12">
          {/* Hero */}
          <div className="text-center space-y-5">
            <div className="mx-auto zen-skeleton h-3 w-40" />
            <div className="mx-auto zen-skeleton h-10 w-2/3" />
            <div className="mx-auto zen-skeleton h-3 w-1/3" />
            <div className="mx-auto rounded-xl border border-border bg-card px-10 py-12 inline-flex flex-col items-center gap-4">
              <div className="zen-skeleton h-3 w-24" />
              <div className="zen-skeleton h-24 w-44" />
              <div className="zen-skeleton h-3 w-32" />
            </div>
          </div>

          {/* Subtest cards */}
          <div className="grid sm:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-card p-6 space-y-4"
              >
                <div className="zen-skeleton h-3 w-20" />
                <div className="zen-skeleton h-12 w-3/4" />
                <div className="zen-skeleton h-2 w-full rounded-full" />
                <div className="zen-skeleton h-3 w-1/2" />
              </div>
            ))}
          </div>

          {/* AI Insight banner */}
          <div className="rounded-xl bg-foreground/95 p-7 sm:p-9 space-y-4">
            <div className="zen-skeleton h-3 w-32 opacity-30" />
            <div className="zen-skeleton h-6 w-2/3 opacity-30" />
            <div className="zen-skeleton h-4 w-full opacity-25" />
            <div className="zen-skeleton h-4 w-5/6 opacity-25" />
          </div>

          {/* Item analysis list */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="zen-skeleton h-3 w-32" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="rounded-lg border border-border p-4 flex items-center gap-3"
              >
                <div className="zen-skeleton size-8 shrink-0" />
                <div className="flex-1 zen-skeleton h-4" />
                <div className="zen-skeleton h-7 w-24 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
