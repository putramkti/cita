import { SiteHeader } from "@/components/layout/site-header"
import {
  SkeletonCard,
  SkeletonHeading,
  SkeletonLine,
} from "@/components/feedback/skeleton"

/**
 * Tryout briefing loading fallback. Briefing is a lightweight DB
 * read (resume-attempt lookup) so the visible time is short, but the
 * skeleton prevents a blank flash on slow networks.
 */
export default function TryoutBriefingLoading() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 px-4 sm:px-8 py-16 sm:py-24">
        <div className="mx-auto max-w-2xl space-y-10">
          <div className="text-center space-y-4">
            <div className="mx-auto zen-skeleton h-3 w-32" />
            <SkeletonHeading className="mx-auto w-3/4" />
            <SkeletonLine className="mx-auto w-1/2" />
          </div>
          <SkeletonCard>
            <div className="space-y-4">
              <SkeletonLine className="w-3/4" />
              <SkeletonLine className="w-full" />
              <SkeletonLine className="w-5/6" />
              <SkeletonLine className="w-4/5" />
              <div className="zen-skeleton h-11 w-full mt-3" />
            </div>
          </SkeletonCard>
        </div>
      </main>
    </>
  )
}
