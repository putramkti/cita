"use client"

import { useEffect, useRef, useState } from "react"

/**
 * Scroll-triggered reveal wrapper — Academic Zen.
 *
 * Wraps any block of content in a fade + lift-30px animation that
 * fires the first time the element scrolls into view (rootMargin:
 * -10%). Uses the global `.zen-reveal` class + a `data-revealed`
 * attribute to drive the animation from CSS, so the keyframes can
 * sit in globals.css next to all the other Academic Zen tokens.
 *
 * Reduced-motion users keep the end-state via the
 * @media (prefers-reduced-motion: reduce) override in globals.css.
 *
 * @param delay  ms applied as `animation-delay` for stagger.
 * @param as     element tag (default <div>).
 * @param once   only animate the first time the element enters
 *               (default true). Set false to re-animate on revisit.
 */
export function RevealOnView({
  children,
  delay = 0,
  as: Tag = "div",
  className = "",
  once = true,
}: {
  children: React.ReactNode
  delay?: number
  as?: "div" | "section" | "article" | "li"
  className?: string
  once?: boolean
}) {
  const ref = useRef<HTMLElement | null>(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // SSR-safe IO check
    if (typeof IntersectionObserver === "undefined") {
      setRevealed(true)
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true)
            if (once) io.unobserve(entry.target)
          } else if (!once) {
            setRevealed(false)
          }
        }
      },
      { rootMargin: "-10% 0px -10% 0px", threshold: 0.05 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [once])

  // Apply animation-delay inline so we can stagger via JSX prop.
  const style =
    delay > 0 ? { animationDelay: `${delay}ms` } : undefined
  const dataRevealed = revealed ? "true" : undefined
  const cls = `zen-reveal ${className}`.trim()

  // Manual element dispatch — each branch gets the right ref type
  // for its tag. Keeps Next 16's strict TS happy without a generic
  // polymorphic union.
  if (Tag === "section")
    return (
      <section
        ref={ref as React.Ref<HTMLElement>}
        data-revealed={dataRevealed}
        className={cls}
        style={style}
      >
        {children}
      </section>
    )
  if (Tag === "article")
    return (
      <article
        ref={ref as React.Ref<HTMLElement>}
        data-revealed={dataRevealed}
        className={cls}
        style={style}
      >
        {children}
      </article>
    )
  if (Tag === "li")
    return (
      <li
        ref={ref as React.Ref<HTMLLIElement>}
        data-revealed={dataRevealed}
        className={cls}
        style={style}
      >
        {children}
      </li>
    )
  return (
    <div
      ref={ref as React.Ref<HTMLDivElement>}
      data-revealed={dataRevealed}
      className={cls}
      style={style}
    >
      {children}
    </div>
  )
}
