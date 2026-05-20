import { SiteHeader } from "@/components/layout/site-header"

/**
 * In-progress tryout loading fallback. Reproduces the 3-column shell
 * (left timer/grid, center question, right tool rail) so the layout
 * doesn't shift when the actual content lands.
 */
export default function TryoutAttemptLoading() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8">
        <div className="mx-auto max-w-7xl">
          {/* Title row */}
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="zen-skeleton h-3 w-32" />
              <div className="zen-skeleton h-7 w-48" />
            </div>
            <div className="zen-skeleton h-9 w-28" />
          </div>

          <div className="grid gap-6 lg:grid-cols-[260px_1fr_72px]">
            {/* Left sidebar */}
            <aside className="space-y-5">
              <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                <div className="zen-skeleton h-3 w-24" />
                <div className="zen-skeleton h-10 w-32" />
                <div className="zen-skeleton h-2 w-full rounded-full" />
              </div>
              <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                <div className="zen-skeleton h-3 w-28" />
                <div className="grid grid-cols-5 gap-2">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <div key={i} className="zen-skeleton aspect-square" />
                  ))}
                </div>
              </div>
              <div className="zen-skeleton h-11 w-full rounded-md" />
            </aside>

            {/* Center question */}
            <section className="rounded-xl border border-border bg-card p-7 sm:p-9 space-y-5">
              <div className="zen-skeleton h-3 w-40" />
              <div className="space-y-3">
                <div className="zen-skeleton h-6 w-full" />
                <div className="zen-skeleton h-6 w-11/12" />
                <div className="zen-skeleton h-6 w-3/4" />
              </div>
              <div className="space-y-3 pt-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-border p-4 flex gap-3"
                  >
                    <div className="zen-skeleton size-8 shrink-0 rounded-md" />
                    <div className="flex-1 zen-skeleton h-5" />
                  </div>
                ))}
              </div>
            </section>

            {/* Right rail */}
            <aside className="hidden lg:flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="zen-skeleton h-12 w-12 rounded-xl mx-auto"
                />
              ))}
            </aside>
          </div>
        </div>
      </main>
    </>
  )
}
