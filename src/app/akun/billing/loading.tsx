import { SiteHeader } from "@/components/layout/site-header";

/**
 * /akun/billing loading fallback.
 *
 * Mirrors: BILLING eyebrow → big serif title → current plan card →
 * payment history list.
 */
export default function AkunBillingLoading() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 px-4 sm:px-8 py-12 sm:py-16">
        <div className="mx-auto max-w-4xl space-y-10">
          {/* Header */}
          <div>
            <div className="zen-skeleton h-3 w-32 mb-4" />
            <div className="zen-skeleton h-3 w-20 mb-3" />
            <div className="zen-skeleton h-9 w-2/3 max-w-md" />
          </div>

          {/* Current plan card */}
          <div className="rounded-xl border border-border bg-card p-7 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="zen-skeleton h-3 w-24 mb-3" />
                <div className="flex items-center gap-2">
                  <div className="zen-skeleton h-9 w-32" />
                  <div className="zen-skeleton h-5 w-16 rounded-full" />
                </div>
                <div className="zen-skeleton h-3 w-2/3 max-w-sm mt-4" />
              </div>
              <div className="zen-skeleton h-9 w-24 rounded-md shrink-0" />
            </div>
          </div>

          {/* Orders list */}
          <div className="rounded-xl border border-border bg-card p-7 sm:p-8">
            <div className="zen-skeleton h-3 w-40 mb-5" />
            <ul className="divide-y divide-border">
              {Array.from({ length: 4 }).map((_, i) => (
                <li
                  key={i}
                  className="py-3.5 flex items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="zen-skeleton h-4 w-1/2 max-w-[14rem]" />
                    <div className="zen-skeleton h-3 w-2/3 max-w-[18rem]" />
                  </div>
                  <div className="text-right space-y-1.5">
                    <div className="zen-skeleton h-3 w-16 ml-auto" />
                    <div className="zen-skeleton h-3 w-20 ml-auto" />
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Footer note */}
          <div className="text-center space-y-2">
            <div className="zen-skeleton h-3 w-2/3 max-w-md mx-auto" />
            <div className="zen-skeleton h-3 w-1/3 max-w-xs mx-auto" />
          </div>
        </div>
      </main>
    </div>
  );
}
