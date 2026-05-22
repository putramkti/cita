/**
 * /admin/vouchers/[id] loading fallback.
 */
export default function AdminVoucherDetailLoading() {
  return (
    <div className="space-y-8">
      <div className="zen-skeleton h-3 w-44" />

      <header className="space-y-2">
        <div className="zen-skeleton h-3 w-20" />
        <div className="zen-skeleton h-8 w-2/3 max-w-md" />
        <div className="zen-skeleton h-3 w-1/2 max-w-sm" />
      </header>

      <section className="grid sm:grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5">
            <div className="zen-skeleton h-3 w-24" />
            <div className="zen-skeleton h-7 w-2/3 mt-3" />
            <div className="zen-skeleton h-3 w-1/2 mt-2" />
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="zen-skeleton h-3 w-44 mb-1" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <div className="zen-skeleton h-3 w-24 mb-2" />
            <div className="zen-skeleton h-9 w-full rounded-md" />
          </div>
        ))}
      </section>
    </div>
  );
}
