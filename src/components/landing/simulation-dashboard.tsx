"use client"

import { useEffect, useState } from "react"
import { motion } from "motion/react"
import { ChevronLeft, ChevronRight, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Simulation dashboard — landing-page preview card (Aggressive Trim).
 *
 * A non-functional but lifelike replica of the real /tryout/[id]
 * exam screen. Heavily pruned to fit a constrained landing-page
 * column on every viewport:
 *
 *   Kept (essential signal "ini exam interface"):
 *     - Window chrome (mac dots + brief test title)
 *     - Live countdown timer (serif, tabular-nums, red)
 *     - 5×6 question grid w/ active + marked states
 *     - Question stem (serif)
 *     - 3 answer options (A / B / C) — was 5
 *     - Previous + Next w/ hover nudge
 *
 *   Dropped (visual noise / redundant on a small card):
 *     - "Start Test" chip in window chrome
 *     - "SIMULATION MODE" / "TIME REMAINING" labels
 *     - Tab pills (Overview / TWK / TIU / TKP)
 *     - Sidebar Submit Exam button
 *     - Breadcrumb (TIU · ANALOGI VERBAL)
 *     - Mark for Review button
 *     - Italic motivational quote
 *     - Right tool rail (Brain / Notes / Calculator)
 *     - Options D & E
 *
 * Layout strategy:
 *   - ≥640px (sm+): two-column shell — left ~170px (timer + grid),
 *     right flexible (question + options + actions).
 *   - <640px (phone): single column — compact header bar with title
 *     + inline timer, then question, then mini 5×2 representative
 *     grid (10 cells of the 30 in the real screen), then options &
 *     Prev/Next inline.
 *
 * Reduced-motion users automatically get the static end-state via
 * the MotionConfig reducedMotion="user" wrapper in root layout.
 */
export interface SimulationDashboardDict {
  testTitle: string
  questionStem: string
  options: string[]
  optionLabels: string[]
  previous: string
  next: string
  // The trimmed dashboard ignores the rest of the dict, but we keep
  // the wider shape so the i18n contract isn't broken for callers.
  modeLabel?: string
  timeRemainingLabel?: string
  questionMeta?: string
  markReview?: string
  submit?: string
  quote?: string
  toolsAi?: string
  toolsNotes?: string
  toolsCalc?: string
  tabOverview?: string
  tabTwk?: string
  tabTiu?: string
  tabTkp?: string
  startTest?: string
}

const TOTAL_SECONDS = 45 * 60
const ZEN_EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

export function SimulationDashboard({
  dict,
}: {
  dict: SimulationDashboardDict
}) {
  // Live countdown — start at 44:58 (matches design source).
  const [secondsLeft, setSecondsLeft] = useState(44 * 60 + 58)

  useEffect(() => {
    const id = window.setInterval(() => {
      setSecondsLeft((s) => (s <= 0 ? TOTAL_SECONDS : s - 1))
    }, 1000)
    return () => window.clearInterval(id)
  }, [])

  const mm = Math.floor(secondsLeft / 60).toString().padStart(2, "0")
  const ss = (secondsLeft % 60).toString().padStart(2, "0")
  // Trim to 3 options (A / B / C) for visual breathing room.
  const visibleOptions = dict.options.slice(0, 3)

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-[0_1px_0_rgba(15,23,42,0.04)]">
      {/* Window chrome — title + mac dots; no Start Test chip */}
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-border bg-secondary/40">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="size-2 rounded-full bg-[#ff5f57]" />
          <span className="size-2 rounded-full bg-[#febc2e]" />
          <span className="size-2 rounded-full bg-[#28c840]" />
        </div>
        <span className="label-caps truncate text-[10px]">
          {dict.testTitle}
        </span>
        {/* Inline timer on mobile so we keep one row of chrome,
            saving ~80px of vertical space. Hidden on sm+ where the
            sidebar timer shows instead. */}
        <span className="sm:hidden inline-flex items-center gap-1 text-destructive">
          <Clock className="size-3" strokeWidth={1.5} />
          <span className="serif text-sm tabular-nums leading-none">
            {mm}:{ss}
          </span>
        </span>
        <span className="hidden sm:inline-block size-2 invisible" />
      </div>

      {/* Body — 2-column on sm+, single column on phone */}
      <div className="grid sm:grid-cols-[170px_1fr]">
        {/* ─── LEFT SIDEBAR (sm+) ─────────────────────────────────────
            On phone we collapse this into a compact mini-grid below
            the question, so this column is only rendered ≥sm. */}
        <aside className="hidden sm:flex border-r border-border p-4 flex-col gap-4">
          <div className="flex items-center gap-1.5 text-destructive">
            <Clock className="size-4" strokeWidth={1.5} />
            <span className="serif text-2xl tabular-nums leading-none">
              {mm}:{ss}
            </span>
          </div>

          {/* Full 5×6 question grid */}
          <QuestionGrid total={30} />
        </aside>

        {/* ─── MAIN PANEL ────────────────────────────────────────────── */}
        <section className="p-4 sm:p-5 flex flex-col gap-4 min-w-0">
          <div className="flex items-start gap-3">
            <span className="size-7 shrink-0 rounded-md bg-secondary text-foreground inline-flex items-center justify-center text-xs font-semibold">
              1
            </span>
            <h3 className="serif text-lg sm:text-xl text-foreground leading-snug min-w-0 break-words">
              {dict.questionStem}
            </h3>
          </div>

          {/* Mobile-only mini grid (5×2 = 10 representative cells) */}
          <div className="sm:hidden">
            <QuestionGrid total={10} compact />
          </div>

          {/* 3 answer options */}
          <ul className="space-y-2">
            {visibleOptions.map((opt, idx) => (
              <li
                key={opt}
                className="flex items-center gap-3 rounded-lg border border-border bg-card px-3.5 py-2.5"
              >
                <span
                  aria-hidden="true"
                  className="size-4 rounded-full border border-border shrink-0"
                />
                <span className="text-xs sm:text-sm text-foreground/85 truncate">
                  <strong className="font-semibold mr-2">
                    {dict.optionLabels[idx]}.
                  </strong>
                  {opt}
                </span>
              </li>
            ))}
          </ul>

          {/* Prev / Next only — Mark for Review removed */}
          <div className="flex items-center gap-2 pt-1">
            <motion.button
              type="button"
              tabIndex={-1}
              whileHover="hover"
              initial="rest"
              animate="rest"
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card text-xs font-medium px-3 py-2 text-foreground hover:bg-secondary transition-colors"
            >
              <motion.span
                variants={{ rest: { x: 0 }, hover: { x: -4 } }}
                transition={{ duration: 0.2, ease: ZEN_EASE }}
                className="inline-flex"
              >
                <ChevronLeft className="size-3.5" strokeWidth={1.5} />
              </motion.span>
              {dict.previous}
            </motion.button>

            <motion.button
              type="button"
              tabIndex={-1}
              whileHover="hover"
              initial="rest"
              animate="rest"
              className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium px-3 py-2 hover:bg-primary/90 transition-colors"
            >
              {dict.next}
              <motion.span
                variants={{ rest: { x: 0 }, hover: { x: 4 } }}
                transition={{ duration: 0.2, ease: ZEN_EASE }}
                className="inline-flex"
              >
                <ChevronRight className="size-3.5" strokeWidth={1.5} />
              </motion.span>
            </motion.button>
          </div>
        </section>
      </div>
    </div>
  )
}

/* ─── Atoms ─────────────────────────────────────────────────────────── */

/**
 * Question grid — renders `total` cells (default 30 = 5×6).
 *
 * Marks cell #1 as the active position with a Motion-driven
 * breathing ring overlay, and cell #3 as "marked for review"
 * with the amber review-amber token.
 *
 * @param compact  Smaller cells + tighter gap, used on mobile.
 */
function QuestionGrid({
  total,
  compact = false,
}: {
  total: number
  compact?: boolean
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-5",
        compact ? "gap-1" : "gap-1.5",
      )}
    >
      {Array.from({ length: total }).map((_, i) => {
        const n = i + 1
        const isCurrent = n === 1
        const isMarked = n === 3
        if (isCurrent) {
          return (
            <div
              key={n}
              className={cn("relative aspect-square", compact && "max-h-7")}
            >
              <motion.span
                aria-hidden="true"
                className="absolute inset-0 rounded-md"
                animate={{
                  boxShadow: [
                    "0 0 0 0 color-mix(in oklab, var(--gold) 45%, transparent)",
                    "0 0 0 5px color-mix(in oklab, var(--gold) 0%, transparent)",
                    "0 0 0 0 color-mix(in oklab, var(--gold) 45%, transparent)",
                  ],
                }}
                transition={{
                  duration: 2.8,
                  ease: "easeInOut",
                  repeat: Infinity,
                }}
              />
              <span
                className={cn(
                  "relative inline-flex h-full w-full items-center justify-center rounded-md bg-primary text-primary-foreground font-medium tabular-nums",
                  compact ? "text-[10px]" : "text-[11px]",
                )}
              >
                {n}
              </span>
            </div>
          )
        }
        return (
          <span
            key={n}
            className={cn(
              "aspect-square inline-flex items-center justify-center rounded-md font-medium tabular-nums",
              compact ? "text-[10px] max-h-7" : "text-[11px]",
              isMarked &&
                "bg-[var(--review-amber)] text-[var(--review-amber-fg)] border border-[var(--gold)]/40",
              !isMarked && "bg-card text-foreground border border-border",
            )}
          >
            {n}
          </span>
        )
      })}
    </div>
  )
}
