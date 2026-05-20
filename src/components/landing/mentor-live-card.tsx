"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { GraduationCap } from "lucide-react"

/**
 * Mentor AI live-chat preview — runs once when the component
 * mounts. Sequence:
 *   1. User question bubble appears (instantly).
 *   2. Tutor avatar shows a 3-dot typing indicator for ~2.5s.
 *      Each dot pulses with a staggered Motion loop.
 *   3. The full assistant reply replaces the typing indicator with
 *      a fade + scale(0.95→1) reveal driven by AnimatePresence.
 *
 * Avatar pulse: a soft gold ring breathes around the tutor avatar
 * via two stacked Motion ring layers — a gentler, more modern
 * take on the "active status" indicator than a CSS keyframe.
 *
 * Reduced-motion users see the end-state instantly thanks to the
 * MotionConfig reducedMotion="user" wrapper in the root layout.
 */
const ZEN_EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

export function MentorLiveCard({
  questionText,
  answerText,
  loop = false,
  startDelayMs = 600,
  thinkingMs = 2500,
}: {
  questionText: string
  answerText: string
  loop?: boolean
  startDelayMs?: number
  thinkingMs?: number
}) {
  const [phase, setPhase] = useState<"idle" | "typing" | "answered">("idle")

  useEffect(() => {
    let cancelled = false
    const timers: number[] = []

    const run = () => {
      timers.push(
        window.setTimeout(() => {
          if (cancelled) return
          setPhase("typing")
        }, startDelayMs),
      )
      timers.push(
        window.setTimeout(() => {
          if (cancelled) return
          setPhase("answered")
          if (loop) {
            timers.push(
              window.setTimeout(() => {
                if (cancelled) return
                setPhase("idle")
                run()
              }, 6000),
            )
          }
        }, startDelayMs + thinkingMs),
      )
    }

    run()
    return () => {
      cancelled = true
      timers.forEach((id) => window.clearTimeout(id))
    }
  }, [loop, startDelayMs, thinkingMs])

  return (
    <div className="space-y-3">
      {/* User question bubble (always visible) */}
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="size-7 shrink-0 rounded-full bg-white/10 border border-white/15"
        />
        <p className="rounded-lg bg-white/[0.06] border border-white/10 px-3.5 py-2.5 text-sm italic text-white/80 leading-relaxed">
          “{questionText}”
        </p>
      </div>

      {/* Tutor reply: typing indicator → message reveal */}
      <div className="flex items-start gap-3">
        {/* Avatar with breathing ring — two layered motion rings */}
        <div className="relative size-7 shrink-0">
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 rounded-full"
            style={{
              boxShadow: "0 0 0 0 color-mix(in oklab, var(--gold) 35%, transparent)",
            }}
            animate={{
              boxShadow: [
                "0 0 0 0 color-mix(in oklab, var(--gold) 35%, transparent)",
                "0 0 0 6px color-mix(in oklab, var(--gold) 0%, transparent)",
                "0 0 0 0 color-mix(in oklab, var(--gold) 35%, transparent)",
              ],
            }}
            transition={{
              duration: 2.4,
              ease: "easeInOut",
              repeat: Infinity,
            }}
          />
          <span className="relative size-7 rounded-full bg-[var(--gold)]/20 border border-[var(--gold)]/40 inline-flex items-center justify-center text-[var(--gold-soft)]">
            <GraduationCap className="size-3.5" strokeWidth={2} />
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <AnimatePresence mode="wait">
            {phase === "answered" ? (
              <motion.p
                key="answered"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: ZEN_EASE }}
                className="rounded-lg bg-white/[0.04] border border-white/10 px-3.5 py-2.5 text-sm text-white/75 leading-relaxed origin-left"
              >
                {answerText}
              </motion.p>
            ) : (
              <motion.div
                key="typing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                aria-hidden={phase !== "typing"}
                className="rounded-lg bg-white/[0.04] border border-white/10 px-3.5 py-3 inline-flex items-center gap-1.5 min-h-[36px]"
              >
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="size-1.5 rounded-full bg-white/55"
                    animate={{ y: [0, -2, 0], opacity: [0.25, 1, 0.25] }}
                    transition={{
                      duration: 1.4,
                      ease: "easeInOut",
                      repeat: Infinity,
                      delay: i * 0.18,
                    }}
                  />
                ))}
                <span className="sr-only">Mentor sedang mengetik</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
