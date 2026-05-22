import { SiteHeader } from "@/components/layout/site-header"

/**
 * Leaderboard loading fallback — table shape with 10 row skeletons.
 */
export default function LeaderboardLoading() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 px-4 sm:px-8 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl space-y-12">
          <div className="text-center space-y-4">
            <div className="mx-auto zen-skeleton h-3 w-40" />
            <div className="mx-auto zen-skeleton h-12 w-2/3" />
            <div className="mx-auto zen-skeleton h-4 w-1/2" />
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="bg-secondary/60 px-5 py-3.5 grid grid-cols-[40px_1fr_80px_80px_80px] gap-3">
              <div className="zen-skeleton h-3" />
              <div className="zen-skeleton h-3" />
              <div className="zen-skeleton h-3" />
              <div className="zen-skeleton h-3" />
              <div className="zen-skeleton h-3" />
            </div>
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="px-5 py-4 border-t border-border grid grid-cols-[40px_1fr_80px_80px_80px] gap-3 items-center"
              >
                <div className="zen-skeleton size-9 rounded-full" />
                <div className="space-y-1.5">
                  <div className="zen-skeleton h-4 w-3/4" />
                  <div className="zen-skeleton h-3 w-1/2" />
                </div>
                <div className="zen-skeleton h-6 w-12 ml-auto" />
                <div className="zen-skeleton h-3 w-16 ml-auto" />
                <div className="zen-skeleton h-6 w-16 ml-auto rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
