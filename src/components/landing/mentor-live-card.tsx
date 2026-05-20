"use client"

import { useEffect, useState } from "react"
import { GraduationCap } from "lucide-react"

/**
 * Mentor AI live-chat preview — runs once when the card scrolls
 * into view. Sequence:
 *   1. User question bubble appears (instantly).
 *   2. Tutor avatar shows a 3-dot typing indicator for ~2.5s.
 *   3. The full assistant reply replaces the typing indicator with
 *      a fade + scale(0.95→1) reveal.
 *
 * Cycles:
 *   - Default: plays once and stays at the final state.
 *   - Set `loop` to replay on a long interval (e.g. demo loops on
 *     a stage). For the landing page we keep loop=false so it
 *     feels intentional, not gimmicky.
 *
 * Visual: keeps the dark mentor card surface from the original
 * landing page (#0c1018) and tutor brand gold avatar tint.
 *
 * Avatar pulse: gold ring breathes via .zen-avatar-active utility
 * — subtle "active" status indicator.
 */
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
  const [phase, setPhase] = useState<"idle" | "typing" | "answered">(
    "idle",
  )

  // Drive the sequence: idle → typing (after startDelay) → answered (after thinkingMs)
  useEffect(() => {
    let cancelled = false
    const timers: number[] = []

    const run = () => {
      // Phase 1: kick off after a small delay so the user has time to
      // see the user-question bubble first
      timers.push(
        window.setTimeout(() => {
          if (cancelled) return
          setPhase("typing")
        }, startDelayMs),
      )
      // Phase 2: thinking finished, reveal the answer
      timers.push(
        window.setTimeout(() => {
          if (cancelled) return
          setPhase("answered")
          if (loop) {
            // Reset and restart after a long pause
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
        <span
          aria-hidden="true"
          className="zen-avatar-active size-7 shrink-0 rounded-full bg-[var(--gold)]/20 border border-[var(--gold)]/40 inline-flex items-center justify-center text-[var(--gold-soft)]"
        >
          <GraduationCap className="size-3.5" strokeWidth={2} />
        </span>

        {phase === "answered" ? (
          <p
            key="answered"
            className="zen-message-reveal rounded-lg bg-white/[0.04] border border-white/10 px-3.5 py-2.5 text-sm text-white/75 leading-relaxed"
          >
            {answerText}
          </p>
        ) : (
          <div
            aria-hidden={phase !== "typing"}
            className="rounded-lg bg-white/[0.04] border border-white/10 px-3.5 py-3 inline-flex items-center gap-1.5 min-h-[36px]"
          >
            <span className="zen-typing-dot size-1.5 rounded-full bg-white/55" />
            <span className="zen-typing-dot size-1.5 rounded-full bg-white/55" />
            <span className="zen-typing-dot size-1.5 rounded-full bg-white/55" />
            <span className="sr-only">Mentor sedang mengetik</span>
          </div>
        )}
      </div>
    </div>
  )
}
