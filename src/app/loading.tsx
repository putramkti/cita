import { SiteHeader } from "@/components/layout/site-header"
import {
  SkeletonCard,
  SkeletonHeading,
  SkeletonLine,
} from "@/components/feedback/skeleton"

/**
 * Root loading fallback (covers /, and any segment that doesn't
 * supply its own loading.tsx).
 *
 * Mirrors the typical Academic Zen page rhythm: header + centred
 * eyebrow → big serif title → subline → primary card.
 */
export default function RootLoading() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 px-4 sm:px-8 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl space-y-10">
          <div className="text-center space-y-4">
            <div className="mx-auto zen-skeleton h-3 w-40" />
            <SkeletonHeading className="mx-auto w-3/4" />
            <SkeletonLine className="mx-auto w-1/2" />
          </div>
          <SkeletonCard />
        </div>
      </main>
    </>
  )
}
