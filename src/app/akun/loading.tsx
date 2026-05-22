import { SiteHeader } from "@/components/layout/site-header";

/**
 * /akun loading fallback (account overview).
 *
 * Mirrors the real page rhythm: AKUN eyebrow → big serif name → email
 * → 2-card grid (role + plan) → history card.
 */
export default function AkunLoading() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 px-4 sm:px-8 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl space-y-10">
          {/* Header */}
          <div>
            <div className="zen-skeleton h-3 w-20 mb-3" />
            <div className="zen-skeleton h-9 w-2/3 max-w-md" />
            <div className="zen-skeleton h-3 w-1/2 max-w-sm mt-3" />
          </div>

          {/* Role + plan cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-card p-6"
              >
                <div className="zen-skeleton h-3 w-14 mb-3" />
                <div className="zen-skeleton h-7 w-1/2" />
                <div className="zen-skeleton h-3 w-1/3 mt-4" />
              </div>
            ))}
          </div>

          {/* History card */}
          <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
            <div className="zen-skeleton h-3 w-32 mb-3" />
            <div className="zen-skeleton h-7 w-2/3 max-w-sm" />
            <div className="zen-skeleton h-3 w-full max-w-md mt-3" />
            <div className="zen-skeleton h-3 w-3/4 max-w-sm mt-2" />
          </div>
        </div>
      </main>
    </div>
  );
}
