import { SiteHeader } from "@/components/layout/site-header";

/**
 * /akun/history loading fallback.
 *
 * Matches the real page's rhythm: AKUN eyebrow → "Riwayat tryout" title
 * → 4-stat overview → filter form → results list (8 row skeletons).
 */
export default function AkunHistoryLoading() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 px-4 sm:px-8 py-12 sm:py-16">
        <div className="mx-auto max-w-4xl space-y-10">
          {/* Header */}
          <div>
            <div className="zen-skeleton h-3 w-20 mb-3" />
            <div className="zen-skeleton h-9 w-2/3 max-w-md" />
            <div className="zen-skeleton h-3 w-3/4 max-w-lg mt-3" />
            <div className="zen-skeleton h-3 w-32 mt-4" />
          </div>

          {/* Stats summary */}
          <section>
            <div className="zen-skeleton h-3 w-24 mb-3" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border bg-card p-4"
                >
                  <div className="zen-skeleton h-3 w-2/3" />
                  <div className="zen-skeleton h-7 w-1/3 mt-3" />
                  <div className="zen-skeleton h-3 w-3/4 mt-2" />
                </div>
              ))}
            </div>
          </section>

          {/* Filters */}
          <section>
            <div className="rounded-xl border border-border bg-card p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-4 gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i}>
                  <div className="zen-skeleton h-3 w-12 mb-2" />
                  <div className="zen-skeleton h-9 w-full rounded-md" />
                </div>
              ))}
              <div className="flex items-end gap-2">
                <div className="zen-skeleton h-9 flex-1 rounded-md" />
              </div>
            </div>
          </section>

          {/* List */}
          <section>
            <div className="zen-skeleton h-3 w-24 mb-3" />
            <ul className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <li
                  key={i}
                  className="rounded-xl border border-border bg-card p-4 sm:p-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="zen-skeleton h-5 w-12 rounded-full" />
                        <div className="zen-skeleton h-5 w-16 rounded-full" />
                      </div>
                      <div className="zen-skeleton h-7 w-1/2 max-w-md" />
                      <div className="flex items-center gap-3">
                        <div className="zen-skeleton h-3 w-32" />
                        <div className="zen-skeleton h-3 w-20" />
                      </div>
                    </div>
                    <div className="zen-skeleton h-9 w-32 rounded-md" />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
