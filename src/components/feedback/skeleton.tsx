/**
 * Academic Zen skeleton primitives.
 *
 * Used in app/<route>/loading.tsx files to produce shape-of-content
 * placeholders while the segment's data is fetching. Pulse animation
 * comes from the .zen-skeleton utility in globals.css.
 */

export function SkeletonLine({ className = "" }: { className?: string }) {
  return <div className={`zen-skeleton h-3 ${className}`} />
}

export function SkeletonHeading({ className = "" }: { className?: string }) {
  return <div className={`zen-skeleton h-9 ${className}`} />
}

export function SkeletonCard({
  className = "",
  children,
}: {
  className?: string
  children?: React.ReactNode
}) {
  return (
    <div
      className={`rounded-xl border border-border bg-card p-6 sm:p-7 ${className}`}
    >
      {children ?? (
        <div className="space-y-3">
          <SkeletonLine className="w-1/3" />
          <SkeletonLine className="w-full" />
          <SkeletonLine className="w-5/6" />
          <SkeletonLine className="w-2/3" />
        </div>
      )}
    </div>
  )
}

export function SkeletonBadge({ className = "" }: { className?: string }) {
  return <div className={`zen-skeleton h-5 w-20 rounded-full ${className}`} />
}

/** Centered eyebrow + heading + subline pattern used on most pages. */
export function SkeletonPageHeader() {
  return (
    <div className="text-center space-y-4">
      <div className="mx-auto zen-skeleton h-3 w-32" />
      <div className="mx-auto zen-skeleton h-12 w-3/4" />
      <div className="mx-auto zen-skeleton h-4 w-1/2" />
    </div>
  )
}
