/**
 * /admin loading fallback (dashboard).
 *
 * AdminShell (header + sidebar) is provided by /admin/layout.tsx, so
 * this fallback only fills the main content slot. Mirrors the dashboard
 * page rhythm: heading → 4 stat cards → 2 panels → chart → role grid.
 */
export default function AdminDashboardLoading() {
  return (
    <div className="space-y-10">
      {/* Heading */}
      <header>
        <div className="zen-skeleton h-8 w-40" />
        <div className="zen-skeleton h-3 w-72 mt-2" />
      </header>

      {/* Top stats row */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5">
            <div className="zen-skeleton h-3 w-2/3" />
            <div className="zen-skeleton h-7 w-1/3 mt-3" />
            <div className="zen-skeleton h-3 w-3/4 mt-2" />
          </div>
        ))}
      </section>

      {/* Tutor + billing panels */}
      <section className="grid lg:grid-cols-2 gap-3">
        {Array.from({ length: 2 }).map((_, p) => (
          <div key={p} className="rounded-xl border border-border bg-card p-5">
            <div className="zen-skeleton h-4 w-28 mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, r) => (
                <div key={r} className="flex items-center justify-between gap-3">
                  <div className="zen-skeleton h-3 flex-1 max-w-[14rem]" />
                  <div className="zen-skeleton h-3 w-16" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Chart band */}
      <section>
        <div className="zen-skeleton h-3 w-48 mb-3" />
        <div className="rounded-xl border border-border bg-card p-5 h-44 flex items-end gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="zen-skeleton flex-1 rounded-md"
              style={{ height: `${30 + ((i * 13) % 60)}%` }}
            />
          ))}
        </div>
      </section>

      {/* Role distribution */}
      <section>
        <div className="zen-skeleton h-3 w-32 mb-3" />
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border border-border bg-card px-4 py-3"
            >
              <div className="zen-skeleton h-3 w-16" />
              <div className="zen-skeleton h-5 w-10 mt-2" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
