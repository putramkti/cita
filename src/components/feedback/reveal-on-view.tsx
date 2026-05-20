"use client"

import { motion, type Variants } from "motion/react"
import type { ReactNode } from "react"

/**
 * Scroll-triggered reveal wrapper — Academic Zen.
 *
 * Built on Motion (the framer-motion v12+ rebrand). Uses
 * `whileInView` so the wrapped content fades + lifts 30px the
 * first time it scrolls into view, with a -10% rootMargin so
 * the trigger fires once the element is meaningfully on-screen.
 *
 * Reduced-motion users automatically skip the animation: Motion
 * respects `prefers-reduced-motion: reduce` natively when the
 * `MotionConfig reducedMotion="user"` provider is mounted (in
 * the root layout).
 *
 * @param delay  ms applied as `transition.delay` for stagger.
 * @param as     element tag (default <div>).
 * @param once   only animate the first time the element enters
 *               (default true). Set false to re-animate on revisit.
 */
const variants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
}

export function RevealOnView({
  children,
  delay = 0,
  as: Tag = "div",
  className = "",
  once = true,
}: {
  children: ReactNode
  delay?: number
  as?: "div" | "section" | "article" | "li"
  className?: string
  once?: boolean
}) {
  // Motion's transition values are in seconds, not ms — convert.
  const transition = {
    duration: 1.0,
    delay: delay / 1000,
    ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
  }

  // Manual element dispatch — keeps the call sites simple and
  // sidesteps Motion's polymorphic tag generic complexity.
  if (Tag === "section")
    return (
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once, margin: "-10% 0px -10% 0px", amount: 0.05 }}
        variants={variants}
        transition={transition}
        className={className}
      >
        {children}
      </motion.section>
    )
  if (Tag === "article")
    return (
      <motion.article
        initial="hidden"
        whileInView="visible"
        viewport={{ once, margin: "-10% 0px -10% 0px", amount: 0.05 }}
        variants={variants}
        transition={transition}
        className={className}
      >
        {children}
      </motion.article>
    )
  if (Tag === "li")
    return (
      <motion.li
        initial="hidden"
        whileInView="visible"
        viewport={{ once, margin: "-10% 0px -10% 0px", amount: 0.05 }}
        variants={variants}
        transition={transition}
        className={className}
      >
        {children}
      </motion.li>
    )
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-10% 0px -10% 0px", amount: 0.05 }}
      variants={variants}
      transition={transition}
      className={className}
    >
      {children}
    </motion.div>
  )
}
