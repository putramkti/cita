"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"

/**
 * Top route progress bar — Academic Zen.
 *
 * A slim 2px gold strip pinned to the top of the viewport that
 * animates while a Next.js route transition is in flight.
 *
 * Detection strategy: Next 15+ sets <html data-pending="1"> on
 * <html> while a server transition (RSC fetch) is in progress.
 * That is the most reliable cross-browser signal we can read on
 * the client without monkey-patching <Link> or <a> elements.
 *
 * We pair the data-pending observer with a pathname/search-params
 * listener so the bar always finishes once the new route has
 * actually settled — even if data-pending is missed for a fast
 * cached navigation.
 *
 * Implementation: a single fixed-position div whose width animates
 * 0 → ~85% during pending state, then 85% → 100% → fades out when
 * settled. CSS transitions handle the smoothness; React state
 * drives only the discrete phases (hidden / loading / done).
 */
export function RouteProgress() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [phase, setPhase] = useState<"hidden" | "loading" | "done">("hidden")
  const startedAtRef = useRef<number>(0)

  // Phase 1: observe <html data-pending="1"> changes for navigation start.
  useEffect(() => {
    const html = document.documentElement
    let timer: number | undefined

    const isPending = () => html.getAttribute("data-pending") === "1"

    const handleStart = () => {
      // Only show the bar if the navigation lasts > 80ms — avoids
      // flashes on instant cache hits.
      window.clearTimeout(timer)
      startedAtRef.current = Date.now()
      timer = window.setTimeout(() => {
        if (isPending()) setPhase("loading")
      }, 80)
    }

    const observer = new MutationObserver(() => {
      if (isPending()) {
        if (phase === "hidden") handleStart()
      } else {
        // Pending cleared — finish the bar
        window.clearTimeout(timer)
        if (phase === "loading") {
          setPhase("done")
          // Hide after fade-out animation
          window.setTimeout(() => setPhase("hidden"), 280)
        }
      }
    })

    observer.observe(html, {
      attributes: true,
      attributeFilter: ["data-pending"],
    })

    // Catch the case where data-pending was already 1 on mount
    if (isPending()) handleStart()

    return () => {
      observer.disconnect()
      window.clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Phase 2: when pathname/searchParams change, treat as 'arrived'.
  // This catches client-side renavigations and finishes the bar even
  // if the MutationObserver missed the pending toggle.
  useEffect(() => {
    if (phase === "loading") {
      setPhase("done")
      const timer = window.setTimeout(() => setPhase("hidden"), 280)
      return () => window.clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams])

  if (phase === "hidden") return null

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px]"
    >
      <div
        className={
          phase === "loading"
            ? "h-full bg-[var(--gold)] shadow-[0_0_8px_rgba(181,147,91,0.6)] animate-route-progress-grow"
            : "h-full bg-[var(--gold)] shadow-[0_0_8px_rgba(181,147,91,0.6)] w-full opacity-0 transition-opacity duration-300"
        }
      />
    </div>
  )
}
