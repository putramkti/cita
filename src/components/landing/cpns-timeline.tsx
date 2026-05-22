"use client"

import { motion } from "motion/react"
import { Check, Clock } from "lucide-react"
import { useMemo } from "react"

/**
 * CPNS 2026 timeline — landing page section.
 *
 * Renders the 8-stage CPNS recruitment pipeline as a horizontal
 * progress timeline (desktop / tablet) and a vertical card stack
 * (mobile). Each stage carries a status (done | active | upcoming)
 * which drives the visual treatment:
 *
 *   done     — gold check pill, gold connector behind it
 *   active   — gold spinner pill with subtle radial pulse
 *   upcoming — hairline ink-blue circle, dashed connector
 *
 * Status data is hard-coded for now since the official 2026
 * schedule has not been published yet (see source notes in
 * landing dict). When BKN releases firm dates, swap to a
 * server-rendered computation against the current date.
 *
 * Source attribution rendered inline so the user can verify the
 * recency. We never claim "official" — copy uses 'estimasi'
 * (estimate) explicitly.
 */

type Stage = {
  id: string
  label: string
  period: string
  status: "done" | "active" | "upcoming"
}

const REVEAL_EASE = [0.16, 1, 0.3, 1] as const

export function CpnsTimeline({
  eyebrow,
  title,
  subtitle,
  sourceLabel,
  stages,
  legendDone,
  legendActive,
  legendUpcoming,
  progressLabel,
}: {
  eyebrow: string
  title: string
  subtitle: string
  sourceLabel: string
  stages: ReadonlyArray<Stage>
  legendDone: string
  legendActive: string
  legendUpcoming: string
  progressLabel: string
}) {
  // Progress percent = (done + 0.5*active) / total. Active stages
  // count as half so the bar sits in the middle of the active node
  // — visually intuitive without needing per-stage progress.
  const percent = useMemo(() => {
    const done = stages.filter((s) => s.status === "done").length
    const active = stages.filter((s) => s.status === "active").length
    return Math.round(((done + active * 0.5) / stages.length) * 100)
  }, [stages])

  return (
    <section
      aria-labelledby="cpns-timeline-heading"
      className="relative border-y border-border/60 bg-card/30"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-8 py-16 sm:py-20">
        {/* Header */}
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            <span className="size-1.5 rounded-full bg-accent" />
            {eyebrow}
          </span>
          <h2
            id="cpns-timeline-heading"
            className="serif mt-5 text-3xl sm:text-4xl leading-[1.15] tracking-tight text-foreground"
          >
            {title}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed text-balance">
            {subtitle}
          </p>
        </div>

        {/* Progress meter */}
        <div className="mt-10 sm:mt-12">
          <div className="flex items-end justify-between gap-3 mb-3">
            <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              {progressLabel}
            </span>
            <motion.span
              className="serif text-2xl sm:text-3xl text-foreground tabular-nums"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.6, ease: REVEAL_EASE }}
            >
              {percent}%
            </motion.span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={progressLabel}
            className="relative h-1.5 rounded-full bg-border/60 overflow-hidden"
          >
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-accent"
              initial={{ width: "0%" }}
              whileInView={{ width: `${percent}%` }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 1.4, ease: REVEAL_EASE, delay: 0.15 }}
            />
            {/* Shimmer */}
            <motion.div
              className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-white/50 to-transparent dark:via-white/15"
              initial={{ x: "-6rem" }}
              animate={{ x: "calc(100vw + 6rem)" }}
              transition={{
                duration: 4.5,
                ease: "linear",
                repeat: Infinity,
                repeatDelay: 1.2,
              }}
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Desktop / tablet: horizontal stage rail */}
        <ol className="mt-12 hidden md:grid grid-cols-8 gap-2 relative">
          {/* Connector line behind nodes */}
          <div
            aria-hidden="true"
            className="absolute top-4 left-[6%] right-[6%] h-px bg-gradient-to-r from-border via-border/60 to-border"
          />
          {stages.map((stage, i) => (
            <DesktopNode
              key={stage.id}
              stage={stage}
              index={i + 1}
              total={stages.length}
            />
          ))}
        </ol>

        {/* Mobile: vertical card stack */}
        <ol className="mt-10 md:hidden relative">
          {/* Vertical connector */}
          <div
            aria-hidden="true"
            className="absolute left-[15px] top-2 bottom-2 w-px bg-gradient-to-b from-border via-border/60 to-border"
          />
          {stages.map((stage, i) => (
            <MobileNode
              key={stage.id}
              stage={stage}
              index={i + 1}
              total={stages.length}
            />
          ))}
        </ol>

        {/* Legend + source */}
        <div className="mt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 border-t border-border/60">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <LegendDot kind="done" label={legendDone} />
            <LegendDot kind="active" label={legendActive} />
            <LegendDot kind="upcoming" label={legendUpcoming} />
          </div>
          <p className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground/70">
            {sourceLabel}
          </p>
        </div>
      </div>
    </section>
  )
}

function DesktopNode({
  stage,
  index,
  total,
}: {
  stage: Stage
  index: number
  total: number
}) {
  const delay = 0.05 * index
  return (
    <motion.li
      className="relative flex flex-col items-center text-center px-1"
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.7, ease: REVEAL_EASE, delay }}
    >
      <StageNode stage={stage} />
      <span className="mt-3 text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground/80">
        {String(index).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </span>
      <span className="mt-1.5 text-[13px] font-medium text-foreground leading-tight text-balance">
        {stage.label}
      </span>
      <span className="mt-1 text-[11px] text-muted-foreground leading-tight">
        {stage.period}
      </span>
    </motion.li>
  )
}

function MobileNode({
  stage,
  index,
  total,
}: {
  stage: Stage
  index: number
  total: number
}) {
  const delay = 0.04 * index
  return (
    <motion.li
      className="relative pl-12 pb-7 last:pb-0"
      initial={{ opacity: 0, x: -12 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.6, ease: REVEAL_EASE, delay }}
    >
      <span className="absolute left-0 top-0">
        <StageNode stage={stage} />
      </span>
      <span className="block text-[10px] font-medium uppercase tracking-[0.1em] text-muted-foreground/80">
        {String(index).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </span>
      <span className="mt-1 block text-[14px] font-medium text-foreground leading-tight">
        {stage.label}
      </span>
      <span className="mt-0.5 block text-[12px] text-muted-foreground leading-snug">
        {stage.period}
      </span>
    </motion.li>
  )
}

function StageNode({ stage }: { stage: Stage }) {
  if (stage.status === "done") {
    return (
      <span
        aria-label="completed"
        className="relative size-8 rounded-full bg-accent text-accent-foreground inline-flex items-center justify-center shadow-[0_0_0_4px_rgba(181,147,91,0.12)]"
      >
        <Check className="size-3.5" strokeWidth={2.5} />
      </span>
    )
  }
  if (stage.status === "active") {
    return (
      <span
        aria-label="active"
        className="relative size-8 rounded-full bg-accent text-accent-foreground inline-flex items-center justify-center"
      >
        {/* Soft blink dot — signals 'in progress' without reading as loading */}
        <motion.span
          aria-hidden="true"
          className="size-2 rounded-full bg-accent-foreground"
          animate={{ opacity: [1, 0.35, 1] }}
          transition={{
            duration: 1.6,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        />
        {/* Outer glow halo — slow expand-fade, complements the blink */}
        <motion.span
          aria-hidden="true"
          className="absolute inset-0 rounded-full ring-2 ring-accent/50"
          animate={{ scale: [1, 1.35, 1.35], opacity: [0.45, 0, 0] }}
          transition={{
            duration: 2.4,
            ease: "easeOut",
            repeat: Infinity,
          }}
        />
      </span>
    )
  }
  return (
    <span
      aria-label="upcoming"
      className="relative size-8 rounded-full bg-card border border-border/80 text-muted-foreground/70 inline-flex items-center justify-center"
    >
      <Clock className="size-3.5" strokeWidth={1.7} />
    </span>
  )
}

function LegendDot({
  kind,
  label,
}: {
  kind: "done" | "active" | "upcoming"
  label: string
}) {
  const tone =
    kind === "done"
      ? "bg-accent"
      : kind === "active"
        ? "bg-accent ring-2 ring-accent/40"
        : "bg-card border border-border"
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`size-2 rounded-full ${tone}`} />
      <span>{label}</span>
    </span>
  )
}
