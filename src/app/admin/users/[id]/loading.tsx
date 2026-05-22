/**
 * /admin/users/[id] loading fallback.
 */
export default function AdminUserDetailLoading() {
  return (
    <div className="space-y-8">
      {/* Back link */}
      <div className="zen-skeleton h-3 w-32" />

      {/* Header */}
      <header className="space-y-2">
        <div className="zen-skeleton h-8 w-2/3 max-w-md" />
        <div className="zen-skeleton h-3 w-1/2 max-w-sm" />
      </header>

      {/* Two-col profile + plan */}
      <section className="grid sm:grid-cols-2 gap-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5">
            <div className="zen-skeleton h-3 w-20" />
            <div className="zen-skeleton h-7 w-32 mt-3" />
            <div className="zen-skeleton h-3 w-2/3 mt-2" />
          </div>
        ))}
      </section>

      {/* Section: orders */}
      <section className="rounded-xl border border-border bg-card p-5">
        <div className="zen-skeleton h-3 w-32 mb-4" />
        <ul className="divide-y divide-border">
          {Array.from({ length: 4 }).map((_, i) => (
            <li
              key={i}
              className="py-3 flex items-center justify-between gap-3"
            >
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="zen-skeleton h-3 w-2/3 max-w-[16rem]" />
                <div className="zen-skeleton h-3 w-1/3 max-w-[10rem]" />
              </div>
              <div className="zen-skeleton h-3 w-16" />
            </li>
          ))}
        </ul>
      </section>

      {/* Section: attempts */}
      <section className="rounded-xl border border-border bg-card p-5">
        <div className="zen-skeleton h-3 w-32 mb-4" />
        <ul className="divide-y divide-border">
          {Array.from({ length: 3 }).map((_, i) => (
            <li
              key={i}
              className="py-3 flex items-center justify-between gap-3"
            >
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="zen-skeleton h-3 w-1/2 max-w-[14rem]" />
                <div className="zen-skeleton h-3 w-1/4 max-w-[8rem]" />
              </div>
              <div className="zen-skeleton h-3 w-16" />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
