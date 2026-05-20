"use client"

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatDuration } from "@/lib/tryout"
import type { AttemptItem, Category } from "@/lib/types"
import { answerQuestion, submitTryout } from "../actions"

interface Props {
  attemptId: string
  items: AttemptItem[]
  startedAt: number
  durationMin: number
}

export function TryoutClient({ attemptId, items: initialItems, startedAt, durationMin }: Props) {
  const [items, setItems] = useState<AttemptItem[]>(initialItems)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [pending, startTransition] = useTransition()

  // Track time spent per question (entry timestamp)
  const enteredAtRef = useRef<number>(Date.now())
  useEffect(() => {
    enteredAtRef.current = Date.now()
  }, [currentIdx])

  // Timer
  const totalMs = durationMin * 60 * 1000
  const [now, setNow] = useState<number>(Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  const elapsed = now - startedAt
  const remaining = Math.max(0, totalMs - elapsed)

  // Auto-submit when timer hits zero
  const submittedRef = useRef(false)
  useEffect(() => {
    if (remaining === 0 && !submittedRef.current) {
      submittedRef.current = true
      startTransition(() => {
        submitTryout(attemptId).catch(() => {})
      })
    }
  }, [remaining, attemptId])

  const current = items[currentIdx]
  const q = current.question

  // Stats
  const answeredCount = items.filter((it) => it.userAnswer).length
  const progressPct = ((currentIdx + 1) / items.length) * 100

  const setAnswer = useCallback(
    (label: string) => {
      const timeSpentMs = Date.now() - enteredAtRef.current
      setItems((prev) =>
        prev.map((it, i) => (i === currentIdx ? { ...it, userAnswer: label } : it)),
      )
      // Persist autosave (fire and forget — server validates and scores)
      void answerQuestion(attemptId, current.questionId, label, timeSpentMs).catch(() => {})
    },
    [attemptId, currentIdx, current.questionId],
  )

  const goPrev = () => setCurrentIdx((i) => Math.max(0, i - 1))
  const goNext = () => setCurrentIdx((i) => Math.min(items.length - 1, i + 1))

  const onSubmit = () => {
    if (submittedRef.current) return
    submittedRef.current = true
    startTransition(() => {
      void submitTryout(attemptId)
    })
  }

  if (!q) {
    return (
      <main className="px-4 py-12">
        <div className="mx-auto max-w-3xl text-center text-muted-foreground">
          Soal tidak tersedia. <a href="/tryout" className="underline">Coba mulai ulang</a>.
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 px-4 py-6 sm:py-10">
      <div className="mx-auto max-w-3xl">
        {/* Top bar: timer + progress */}
        <div className="sticky top-14 z-30 -mx-4 mb-6 px-4 py-3 bg-background/85 backdrop-blur border-b border-border/40">
          <div className="flex items-center justify-between gap-4 mb-2">
            <div className="flex items-center gap-2 text-sm">
              <CategoryBadge category={q.category} />
              <span className="text-muted-foreground">
                Soal {currentIdx + 1} dari {items.length}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground hidden sm:inline">
                {answeredCount}/{items.length} dijawab
              </span>
              <span
                className={cn(
                  "tabular-nums font-mono text-base font-semibold tracking-tight",
                  remaining < 60_000 && "text-destructive animate-pulse",
                )}
              >
                {formatDuration(remaining)}
              </span>
            </div>
          </div>
          <Progress value={progressPct} className="h-1" />
        </div>

        {/* Question */}
        <article className="space-y-6">
          <header>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
              {q.subcategory}
            </p>
            <h1 className="text-lg sm:text-xl font-medium leading-relaxed text-balance">
              {q.questionText}
            </h1>
          </header>

          <ul className="space-y-2.5">
            {q.options.map((opt) => {
              const selected = current.userAnswer === opt.label
              return (
                <li key={opt.label}>
                  <button
                    type="button"
                    onClick={() => setAnswer(opt.label)}
                    className={cn(
                      "w-full text-left rounded-xl border bg-card/30 p-4 transition-all",
                      "hover:border-primary/50 hover:bg-card/60",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                      selected
                        ? "border-primary bg-primary/8 ring-1 ring-primary/40"
                        : "border-border/60",
                    )}
                  >
                    <div className="flex gap-3 items-start">
                      <span
                        className={cn(
                          "shrink-0 inline-flex items-center justify-center size-7 rounded-md border text-xs font-semibold",
                          selected
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border/80 text-muted-foreground",
                        )}
                      >
                        {opt.label}
                      </span>
                      <span className="text-sm leading-relaxed pt-0.5">
                        {opt.text}
                      </span>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        </article>

        {/* Bottom nav */}
        <nav className="mt-10 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={goPrev}
            disabled={currentIdx === 0}
          >
            ← Sebelumnya
          </Button>
          {currentIdx < items.length - 1 ? (
            <Button type="button" onClick={goNext}>
              Selanjutnya →
            </Button>
          ) : (
            <Button
              type="button"
              onClick={onSubmit}
              disabled={pending || submittedRef.current}
            >
              {pending ? "Menghitung skor…" : "Submit tryout"}
            </Button>
          )}
        </nav>

        {/* Mini grid — quick jump */}
        <QuestionGrid items={items} currentIdx={currentIdx} onJump={setCurrentIdx} />
      </div>
    </main>
  )
}

function QuestionGrid({
  items,
  currentIdx,
  onJump,
}: {
  items: AttemptItem[]
  currentIdx: number
  onJump: (idx: number) => void
}) {
  const grouped = useMemo(() => {
    const out: Record<Category, { idx: number; answered: boolean }[]> = {
      TWK: [],
      TIU: [],
      TKP: [],
    }
    items.forEach((it, idx) => {
      const cat = it.question?.category
      if (!cat) return
      out[cat].push({ idx, answered: !!it.userAnswer })
    })
    return out
  }, [items])

  return (
    <section className="mt-12 rounded-xl border border-border/60 bg-card/30 p-4 sm:p-5">
      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
        Navigasi cepat
      </p>
      <div className="space-y-3">
        {(["TWK", "TIU", "TKP"] as Category[]).map((cat) => (
          <div key={cat} className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-muted-foreground w-10">{cat}</span>
            {grouped[cat].map(({ idx, answered }) => (
              <button
                key={idx}
                type="button"
                onClick={() => onJump(idx)}
                className={cn(
                  "size-7 text-xs rounded-md border transition-colors",
                  idx === currentIdx
                    ? "bg-primary text-primary-foreground border-primary"
                    : answered
                      ? "border-primary/50 bg-primary/10 text-foreground hover:bg-primary/20"
                      : "border-border/60 text-muted-foreground hover:bg-accent",
                )}
                aria-label={`Soal ${idx + 1}`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}

function CategoryBadge({ category }: { category: Category }) {
  const tone =
    category === "TWK"
      ? "bg-sky-500/15 text-sky-300 border-sky-500/30"
      : category === "TIU"
        ? "bg-violet-500/15 text-violet-300 border-violet-500/30"
        : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
  return (
    <Badge variant="outline" className={cn("text-xs font-semibold", tone)}>
      {category}
    </Badge>
  )
}
