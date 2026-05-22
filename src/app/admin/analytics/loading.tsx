/**
 * /admin/analytics loading fallback.
 */
export default function AdminAnalyticsLoading() {
  return (
    <div className="space-y-10">
      <header>
        <div className="zen-skeleton h-8 w-44" />
        <div className="zen-skeleton h-3 w-72 mt-2" />
      </header>

      {/* Stat strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5">
            <div className="zen-skeleton h-3 w-2/3" />
            <div className="zen-skeleton h-7 w-1/3 mt-3" />
            <div className="zen-skeleton h-3 w-3/4 mt-2" />
          </div>
        ))}
      </section>

      {/* Two charts */}
      <section className="grid lg:grid-cols-2 gap-3">
        {Array.from({ length: 2 }).map((_, p) => (
          <div key={p} className="rounded-xl border border-border bg-card p-5">
            <div className="zen-skeleton h-3 w-32 mb-4" />
            <div className="h-44 flex items-end gap-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="zen-skeleton flex-1 rounded-md"
                  style={{ height: `${25 + ((i * 17) % 65)}%` }}
                />
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Funnel / breakdown */}
      <section className="rounded-xl border border-border bg-card p-5">
        <div className="zen-skeleton h-3 w-44 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="zen-skeleton h-3 w-32" />
              <div
                className="zen-skeleton h-5 rounded-md flex-1"
                style={{ maxWidth: `${85 - i * 12}%` }}
              />
              <div className="zen-skeleton h-3 w-12" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
