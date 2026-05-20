import { SiteHeader } from "@/components/layout/site-header"

/**
 * Study/tutor page loading fallback. Reproduces the 2-col split
 * (question recap left, tutor chat right).
 */
export default function StudyLoading() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 px-4 sm:px-8 py-6 sm:py-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center justify-between">
            <div className="zen-skeleton h-4 w-32" />
            <div className="zen-skeleton h-4 w-40" />
          </div>

          <div className="grid lg:grid-cols-2 gap-6 lg:gap-10">
            {/* Question recap */}
            <section className="space-y-4">
              <div className="zen-skeleton h-3 w-32" />
              <div className="zen-skeleton h-9 w-3/4" />
              <div className="zen-skeleton h-3 w-1/3" />
              <div className="rounded-xl border border-border bg-card p-7 space-y-5">
                <div className="space-y-2">
                  <div className="zen-skeleton h-5 w-full" />
                  <div className="zen-skeleton h-5 w-11/12" />
                  <div className="zen-skeleton h-5 w-3/4" />
                </div>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-border p-3 flex gap-3"
                  >
                    <div className="zen-skeleton size-7 shrink-0" />
                    <div className="flex-1 zen-skeleton h-4" />
                  </div>
                ))}
              </div>
            </section>

            {/* Tutor chat */}
            <section>
              <div className="rounded-xl border border-border bg-card overflow-hidden flex flex-col h-[60vh]">
                <div className="border-b border-border px-5 py-4 flex items-center gap-3">
                  <div className="zen-skeleton size-9 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="zen-skeleton h-4 w-32" />
                    <div className="zen-skeleton h-3 w-48" />
                  </div>
                </div>
                <div className="flex-1 px-5 py-6 space-y-4">
                  <div className="zen-skeleton h-4 w-3/4" />
                  <div className="zen-skeleton h-4 w-2/3" />
                  <div className="zen-skeleton h-4 w-5/6" />
                </div>
                <div className="border-t border-border px-5 py-4">
                  <div className="zen-skeleton h-10 w-full rounded-md" />
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  )
}
