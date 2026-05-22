/**
 * /admin/orders/[id] loading fallback.
 */
export default function AdminOrderDetailLoading() {
  return (
    <div className="space-y-8">
      <div className="zen-skeleton h-3 w-32" />

      <header className="space-y-2">
        <div className="zen-skeleton h-8 w-2/3 max-w-md" />
        <div className="zen-skeleton h-3 w-1/3 max-w-sm" />
      </header>

      {/* Status + amount cards */}
      <section className="grid sm:grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5">
            <div className="zen-skeleton h-3 w-20" />
            <div className="zen-skeleton h-7 w-2/3 mt-3" />
            <div className="zen-skeleton h-3 w-1/2 mt-2" />
          </div>
        ))}
      </section>

      {/* Detail panel */}
      <section className="rounded-xl border border-border bg-card p-5">
        <div className="zen-skeleton h-3 w-32 mb-4" />
        <div className="divide-y divide-border">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="py-3 flex items-center justify-between gap-3"
            >
              <div className="zen-skeleton h-3 w-32" />
              <div className="zen-skeleton h-3 w-44" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
