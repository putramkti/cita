"use client"

import { useEffect, useState } from "react"
import {
  Send,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Brain,
  StickyNote,
  Calculator,
  Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Simulation dashboard — landing-page preview card.
 *
 * A non-functional but lifelike replica of the real /tryout/[id]
 * exam screen, used on the landing page to give visitors a real
 * sense of what the test interface feels like before they start.
 *
 * Live elements:
 *   - Countdown timer (ticks once per second, default 45:00).
 *     Uses tabular-nums so digit width doesn't shift the layout.
 *   - Breathing pulse on the "current" question cell (#1) to draw
 *     the eye to the active position in the navigator.
 *   - Hover nudge on Previous / Next buttons (arrow translates 4px).
 *
 * All copy is locale-aware via the dict prop; the calling page
 * passes `t.landing.sim` from the i18n catalogue.
 */
export interface SimulationDashboardDict {
  modeLabel: string
  timeRemainingLabel: string
  questionMeta: string
  questionStem: string
  options: string[]
  optionLabels: string[]
  previous: string
  next: string
  markReview: string
  submit: string
  quote: string
  toolsAi: string
  toolsNotes: string
  toolsCalc: string
  tabOverview: string
  tabTwk: string
  tabTiu: string
  tabTkp: string
  testTitle: string
  startTest: string
}

const TOTAL_SECONDS = 45 * 60

export function SimulationDashboard({ dict }: { dict: SimulationDashboardDict }) {
  // Live countdown — start at 44:58 (matches design source) so the
  // bar feels mid-session.
  const [secondsLeft, setSecondsLeft] = useState(44 * 60 + 58)

  useEffect(() => {
    const id = window.setInterval(() => {
      setSecondsLeft((s) => (s <= 0 ? TOTAL_SECONDS : s - 1))
    }, 1000)
    return () => window.clearInterval(id)
  }, [])

  const mm = Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, "0")
  const ss = (secondsLeft % 60).toString().padStart(2, "0")

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-[0_1px_0_rgba(15,23,42,0.04)]">
      {/* Window chrome — keeps the showcase feeling like a screenshot */}
      <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-border bg-secondary/40">
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex items-center gap-2 label-caps">
          <span>{dict.testTitle}</span>
        </div>
        <span className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground text-[11px] font-semibold px-3 py-1.5">
          {dict.startTest}
        </span>
      </div>

      {/* Body: 3-column shell mirroring /tryout/[id] */}
      <div className="grid lg:grid-cols-[210px_1fr_60px]">
        {/* ─── LEFT SIDEBAR ──────────────────────────────────────────── */}
        <aside className="border-r border-border p-4 sm:p-5 flex flex-col gap-4">
          <div>
            <p className="label-caps mb-2">{dict.modeLabel}</p>
            <div className="flex items-center gap-1.5 text-destructive">
              <Clock className="size-4" strokeWidth={1.5} />
              <span className="serif text-2xl tabular-nums leading-none">
                {mm}:{ss}
              </span>
            </div>
            <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground/70">
              {dict.timeRemainingLabel}
            </p>
          </div>

          {/* Tab pills */}
          <div className="flex flex-wrap gap-1">
            <Pill active>{dict.tabOverview}</Pill>
            <Pill>{dict.tabTwk}</Pill>
            <Pill>{dict.tabTiu}</Pill>
            <Pill>{dict.tabTkp}</Pill>
          </div>

          {/* Question grid — 5 cols × 6 rows = 30 cells */}
          <div className="grid grid-cols-5 gap-1.5">
            {Array.from({ length: 30 }).map((_, i) => {
              const n = i + 1
              const isCurrent = n === 1
              const isMarked = n === 3
              return (
                <span
                  key={n}
                  className={cn(
                    "aspect-square inline-flex items-center justify-center rounded-md text-[11px] font-medium tabular-nums",
                    isCurrent &&
                      "bg-primary text-primary-foreground zen-breathing",
                    isMarked &&
                      "bg-[var(--review-amber)] text-[var(--review-amber-fg)] border border-[var(--gold)]/40",
                    !isCurrent &&
                      !isMarked &&
                      "bg-card text-foreground border border-border",
                  )}
                >
                  {n}
                </span>
              )
            })}
          </div>

          {/* Submit button */}
          <button
            type="button"
            tabIndex={-1}
            disabled
            aria-hidden="true"
            className="mt-auto inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground text-xs font-medium px-3 py-2.5 cursor-default"
          >
            {dict.submit}
            <Send className="size-3.5" strokeWidth={1.5} />
          </button>
        </aside>

        {/* ─── MAIN PANEL ────────────────────────────────────────────── */}
        <section className="p-5 sm:p-7 flex flex-col gap-5 min-w-0">
          <p className="label-caps">{dict.questionMeta}</p>

          <div className="flex items-start gap-3">
            <span className="size-7 shrink-0 rounded-md bg-secondary text-foreground inline-flex items-center justify-center text-xs font-semibold">
              1
            </span>
            <h3 className="serif text-xl sm:text-2xl text-foreground leading-snug min-w-0 break-words">
              {dict.questionStem}
            </h3>
          </div>

          {/* Answer options */}
          <ul className="space-y-2">
            {dict.options.map((opt, idx) => (
              <li
                key={opt}
                className="flex items-center gap-3 rounded-lg border border-border bg-card px-3.5 py-2.5"
              >
                <span
                  aria-hidden="true"
                  className="size-4 rounded-full border border-border"
                />
                <span className="text-xs sm:text-sm text-foreground/85">
                  <strong className="font-semibold mr-2">
                    {dict.optionLabels[idx]}.
                  </strong>
                  {opt}
                </span>
              </li>
            ))}
          </ul>

          {/* Action row */}
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <button
              type="button"
              tabIndex={-1}
              className="zen-nudge-left inline-flex items-center gap-2 rounded-md border border-border bg-card text-xs font-medium px-3.5 py-2 text-foreground hover:bg-secondary transition-colors"
            >
              <ChevronLeft
                data-arrow
                className="size-3.5"
                strokeWidth={1.5}
              />
              {dict.previous}
            </button>
            <button
              type="button"
              tabIndex={-1}
              className="zen-nudge-right inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground text-xs font-medium px-3.5 py-2 hover:bg-primary/90 transition-colors"
            >
              {dict.next}
              <ChevronRight
                data-arrow
                className="size-3.5"
                strokeWidth={1.5}
              />
            </button>
            <button
              type="button"
              tabIndex={-1}
              className="ml-auto inline-flex items-center gap-2 rounded-md bg-[var(--review-amber)] text-[var(--review-amber-fg)] border border-[var(--gold)]/30 text-xs font-medium px-3.5 py-2 hover:bg-[var(--review-amber)]/80 transition-colors"
            >
              <Bookmark className="size-3.5" strokeWidth={1.5} />
              {dict.markReview}
            </button>
          </div>

          <p className="serif italic text-xs text-muted-foreground text-center pt-2">
            {dict.quote}
          </p>
        </section>

        {/* ─── RIGHT TOOL RAIL ───────────────────────────────────────── */}
        <aside className="hidden lg:flex border-l border-border bg-secondary/30 py-7 flex-col items-center gap-5 text-muted-foreground">
          <span
            aria-label={dict.toolsAi}
            title={dict.toolsAi}
            className="inline-flex items-center justify-center size-9 rounded-md hover:bg-secondary transition-colors"
          >
            <Brain className="size-4" strokeWidth={1.5} />
          </span>
          <span
            aria-label={dict.toolsNotes}
            title={dict.toolsNotes}
            className="inline-flex items-center justify-center size-9 rounded-md hover:bg-secondary transition-colors"
          >
            <StickyNote className="size-4" strokeWidth={1.5} />
          </span>
          <span
            aria-label={dict.toolsCalc}
            title={dict.toolsCalc}
            className="inline-flex items-center justify-center size-9 rounded-md hover:bg-secondary transition-colors"
          >
            <Calculator className="size-4" strokeWidth={1.5} />
          </span>
        </aside>
      </div>
    </div>
  )
}

/* ─── Atoms ─────────────────────────────────────────────────────────── */

function Pill({
  children,
  active,
}: {
  children: React.ReactNode
  active?: boolean
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em]",
        active
          ? "bg-[var(--gold)]/15 text-foreground border border-[var(--gold)]/30"
          : "text-muted-foreground/80",
      )}
    >
      {children}
    </span>
  )
}
