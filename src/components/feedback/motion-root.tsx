"use client"

import { MotionConfig } from "motion/react"
import type { ReactNode } from "react"

/**
 * Root Motion provider.
 *
 * Wraps the entire app so all Motion components inherit a single
 * configuration. We honour the user's `prefers-reduced-motion`
 * system flag via `reducedMotion="user"` — when the flag is on,
 * Motion automatically swaps every transition for an instant
 * end-state, which means we don't need to repeat the guard at
 * every call site.
 */
export function MotionRoot({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}
