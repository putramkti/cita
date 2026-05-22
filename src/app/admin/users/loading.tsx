/**
 * /admin/users loading fallback.
 *
 * Header + filter bar + table-shaped row list. Pagination row left
 * out so the perceived page weight matches the loaded version.
 */
export default function AdminUsersLoading() {
  return (
    <div className="space-y-6">
      <header>
        <div className="zen-skeleton h-8 w-32" />
        <div className="zen-skeleton h-3 w-48 mt-2" />
      </header>

      {/* Filter bar */}
      <div className="rounded-xl border border-border bg-card p-4 flex flex-wrap items-end gap-2">
        <div className="flex-1 min-w-[200px]">
          <div className="zen-skeleton h-3 w-32 mb-2" />
          <div className="zen-skeleton h-9 w-full rounded-md" />
        </div>
        <div className="w-40">
          <div className="zen-skeleton h-3 w-16 mb-2" />
          <div className="zen-skeleton h-9 w-full rounded-md" />
        </div>
        <div className="zen-skeleton h-9 w-24 rounded-md" />
        <div className="zen-skeleton h-9 w-20 rounded-md" />
      </div>

      {/* Row list (table simulated as rows) */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border bg-muted/30 px-4 py-3 hidden sm:flex items-center gap-3">
          <div className="zen-skeleton h-3 w-32" />
          <div className="zen-skeleton h-3 w-24" />
          <div className="zen-skeleton h-3 w-20" />
          <div className="zen-skeleton h-3 w-28" />
          <div className="zen-skeleton h-3 w-20 ml-auto" />
        </div>
        <ul className="divide-y divide-border">
          {Array.from({ length: 8 }).map((_, i) => (
            <li
              key={i}
              className="px-4 py-3.5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4"
            >
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="zen-skeleton h-4 w-2/3 max-w-[18rem]" />
                <div className="zen-skeleton h-3 w-1/3 max-w-[10rem]" />
              </div>
              <div className="zen-skeleton h-5 w-20 rounded-full" />
              <div className="zen-skeleton h-3 w-24" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
