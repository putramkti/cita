/**
 * /admin/vouchers loading fallback.
 */
export default function AdminVouchersLoading() {
  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <div className="zen-skeleton h-8 w-32" />
          <div className="zen-skeleton h-3 w-48 mt-2" />
        </div>
        <div className="zen-skeleton h-9 w-32 rounded-md" />
      </header>

      <div className="rounded-xl border border-border bg-card p-4 flex flex-wrap items-end gap-2">
        <div className="flex-1 min-w-[200px]">
          <div className="zen-skeleton h-3 w-32 mb-2" />
          <div className="zen-skeleton h-9 w-full rounded-md" />
        </div>
        <div className="w-32">
          <div className="zen-skeleton h-3 w-16 mb-2" />
          <div className="zen-skeleton h-9 w-full rounded-md" />
        </div>
        <div className="zen-skeleton h-9 w-24 rounded-md" />
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <ul className="divide-y divide-border">
          {Array.from({ length: 6 }).map((_, i) => (
            <li
              key={i}
              className="px-4 py-4 flex flex-col sm:flex-row sm:items-center gap-3"
            >
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="zen-skeleton h-4 w-32" />
                <div className="zen-skeleton h-3 w-2/3 max-w-[18rem]" />
              </div>
              <div className="text-right space-y-1.5">
                <div className="zen-skeleton h-4 w-20 ml-auto" />
                <div className="zen-skeleton h-3 w-32 ml-auto" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
