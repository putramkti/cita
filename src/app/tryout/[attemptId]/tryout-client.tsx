"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Send,
  Brain,
  StickyNote,
  Calculator,
  Clock,
  Loader2,
} from "lucide-react";
import type { AttemptMode, Category } from "@prisma/client";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/tryout/config";
import { saveAnswer, submitAttempt } from "../actions";

export interface TryoutClientDict {
  modeLabel: string;
  timeRemainingLabel: string;
  overview: string;
  questionPanelLabel: string;
  ofLabel: string;
  previous: string;
  next: string;
  markReview: string;
  submit: string;
  submitting: string;
  submittingTitle: string;
  submittingHint: string;
  questionUnavailable: string;
  retry: string;
  tools: string;
  toolAi: string;
  toolNotes: string;
  toolCalc: string;
  toolsComingSoon: string;
  motivationalQuote: string;
  answeredCount: string;
}

interface ClientItem {
  id: string;
  questionId: string;
  userAnswer: string | null;
  question: {
    id: string;
    category: Category;
    subcategory: string;
    topic: string;
    questionText: string;
    options: { label: string; text: string }[];
    difficulty: number;
    imagePrompt: string | null;
  };
}

interface Props {
  attemptId: string;
  items: ClientItem[];
  startedAtMs: number;
  durationMin: number;
  mode: AttemptMode;
  modeLabelId: string;
  dict: TryoutClientDict;
}

/**
 * Tryout in-progress — Academic Zen 3-column layout (visual-port from old).
 *
 *   Left sidebar:  mode label, big timer, subject tabs, question grid,
 *                  submit button anchored to the bottom.
 *   Centre:        breadcrumb subcategory, question stem in serif,
 *                  vertical answer cards with letter badges, action row,
 *                  motivational footer quote.
 *   Right rail:    cosmetic tools rail (AI tutor / Notes / Calculator).
 *
 * Data layer is Prisma (via server actions saveAnswer + submitAttempt).
 */
export function TryoutClient({
  attemptId,
  items: initialItems,
  startedAtMs,
  durationMin,
  mode,
  modeLabelId,
  dict,
}: Props) {
  const [items, setItems] = useState<ClientItem[]>(initialItems);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [pending, startTransition] = useTransition();
  const [marked, setMarked] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState<"all" | Category>("all");

  // Track time spent per question
  const enteredAtRef = useRef<number>(Date.now());
  useEffect(() => {
    enteredAtRef.current = Date.now();
  }, [currentIdx]);

  // Timer — derived from server startedAt, ticked every second
  const totalMs = durationMin * 60 * 1000;
  const [now, setNow] = useState<number>(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const elapsed = now - startedAtMs;
  const remaining = Math.max(0, totalMs - elapsed);

  // Auto-submit on timer expiry
  const submittedRef = useRef(false);
  useEffect(() => {
    if (remaining === 0 && !submittedRef.current) {
      submittedRef.current = true;
      startTransition(() => {
        submitAttempt(attemptId).catch(() => {});
      });
    }
  }, [remaining, attemptId]);

  const current = items[currentIdx];
  const q = current?.question;

  const answeredCount = items.filter((it) => it.userAnswer).length;

  const setAnswer = useCallback(
    (label: string) => {
      setItems((prev) =>
        prev.map((it, i) =>
          i === currentIdx ? { ...it, userAnswer: label } : it,
        ),
      );
      void saveAnswer({
        attemptId,
        questionId: current.questionId,
        userAnswer: label,
      }).catch(() => {});
    },
    [attemptId, currentIdx, current?.questionId],
  );

  const goPrev = () => setCurrentIdx((i) => Math.max(0, i - 1));
  const goNext = () => setCurrentIdx((i) => Math.min(items.length - 1, i + 1));

  const toggleMark = () => {
    setMarked((prev) => {
      const next = new Set(prev);
      if (next.has(currentIdx)) next.delete(currentIdx);
      else next.add(currentIdx);
      return next;
    });
  };

  const onSubmit = () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    startTransition(() => {
      void submitAttempt(attemptId);
    });
  };

  // Filter visible question grid by tab
  const gridItems = useMemo(() => {
    if (activeTab === "all") return items.map((it, idx) => ({ idx, item: it }));
    return items
      .map((it, idx) => ({ idx, item: it }))
      .filter(({ item }) => item.question.category === activeTab);
  }, [items, activeTab]);

  if (!q) {
    return (
      <main className="px-4 py-12">
        <div className="mx-auto max-w-3xl text-center text-muted-foreground">
          {dict.questionUnavailable}{" "}
          <a href="/tryout" className="underline">
            {dict.retry}
          </a>
          .
        </div>
      </main>
    );
  }

  const isLast = currentIdx === items.length - 1;
  const timerCritical = remaining < 60_000;

  // Adapt grid columns based on mode (MINI=30 fits 5×6, FULL=110 needs more cols)
  const gridCols =
    mode === "FULL" ? "grid-cols-10 sm:grid-cols-10" : "grid-cols-5";

  return (
    <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8">
      <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ─── LEFT SIDEBAR ─── */}
        <aside className="lg:col-span-3 order-2 lg:order-1">
          <div className="lg:sticky lg:top-20 rounded-xl border border-border bg-card p-5 flex flex-col gap-5">
            {/* Mode badge + timer */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="label-caps">{dict.modeLabel}</p>
                <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                  {modeLabelId}
                </span>
              </div>
              <div
                className={cn(
                  "flex items-center gap-2.5 font-mono tabular-nums text-3xl sm:text-[2rem] font-semibold tracking-tight",
                  timerCritical
                    ? "text-destructive animate-pulse"
                    : "text-foreground",
                )}
              >
                <Clock className="size-6" strokeWidth={1.5} />
                {formatDuration(remaining)}
              </div>
              <p className="label-caps mt-2 text-muted-foreground">
                {dict.timeRemainingLabel}
              </p>
            </div>

            {/* Subject tabs */}
            <div className="flex items-center gap-1 rounded-lg bg-secondary/60 p-1">
              {(["all", "TWK", "TIU", "TKP"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "flex-1 rounded-md text-[11px] font-bold uppercase tracking-[0.08em] py-1.5 transition-colors",
                    activeTab === tab
                      ? "bg-card text-foreground shadow-none border border-border"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {tab === "all" ? dict.overview : tab}
                </button>
              ))}
            </div>

            {/* Question grid */}
            <div className={cn("grid gap-2", gridCols)}>
              {gridItems.map(({ idx, item }) => {
                const isCurrent = idx === currentIdx;
                const isMarked = marked.has(idx);
                const isAnswered = !!item.userAnswer;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentIdx(idx)}
                    className={cn(
                      "aspect-square text-xs font-semibold rounded-md border transition-colors",
                      isCurrent
                        ? "bg-primary text-primary-foreground border-primary"
                        : isMarked
                          ? "bg-[var(--review-amber)] text-[var(--review-amber-fg)] border-[var(--gold)]/40"
                          : isAnswered
                            ? "bg-secondary text-foreground border-border"
                            : "bg-card text-muted-foreground border-border hover:border-foreground/40",
                    )}
                    aria-label={`${dict.questionPanelLabel} ${idx + 1}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Submit button */}
            <button
              type="button"
              onClick={onSubmit}
              disabled={pending || submittedRef.current}
              aria-busy={pending || undefined}
              className={cn(
                "mt-1 inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium px-4 py-3 transition-colors",
                "bg-primary text-primary-foreground hover:bg-primary/90",
                "disabled:opacity-60 disabled:cursor-not-allowed",
              )}
            >
              {pending ? (
                <>
                  <span className="zen-spinner" aria-hidden="true" />
                  {dict.submitting}
                </>
              ) : (
                <>
                  {dict.submit}
                  <Send className="size-4" strokeWidth={1.5} />
                </>
              )}
            </button>

            <p className="text-[11px] text-muted-foreground text-center">
              {answeredCount}/{items.length} {dict.answeredCount}
            </p>
          </div>
        </aside>

        {/* ─── MAIN QUESTION PANEL ─── */}
        <article className="lg:col-span-7 order-1 lg:order-2">
          <div className="rounded-xl border border-border bg-card px-6 py-7 sm:px-10 sm:py-10">
            {/* Breadcrumb */}
            <p className="label-caps mb-5">
              {q.category} · {q.subcategory}
              {q.topic && q.topic !== q.subcategory && (
                <span className="text-muted-foreground"> · {q.topic}</span>
              )}
            </p>

            {/* Question stem */}
            <div className="flex items-start gap-4 mb-9">
              <span className="shrink-0 inline-flex items-center justify-center size-9 rounded-md bg-secondary text-sm font-semibold text-foreground">
                {currentIdx + 1}
              </span>
              <h1 className="serif text-2xl sm:text-[1.75rem] leading-relaxed text-balance text-foreground">
                {q.questionText}
              </h1>
            </div>

            {/* Image prompt placeholder for TIU Figural */}
            {q.imagePrompt && (
              <div className="mb-7 rounded-md border border-dashed border-border bg-muted/40 p-4 text-xs text-muted-foreground">
                <span className="font-medium uppercase tracking-wide">
                  ilustrasi:
                </span>{" "}
                <em>{q.imagePrompt}</em>
                <p className="mt-2 text-[10px] text-muted-foreground/70">
                  (Image generator belum aktif — abaikan placeholder ini.)
                </p>
              </div>
            )}

            {/* Answer options */}
            <ul className="space-y-3 mb-10">
              {q.options.map((opt) => {
                const selected = current.userAnswer === opt.label;
                return (
                  <li key={opt.label}>
                    <button
                      type="button"
                      onClick={() => setAnswer(opt.label)}
                      className={cn(
                        "w-full text-left rounded-lg border bg-card transition-colors",
                        "px-4 py-3.5 sm:px-5 sm:py-4",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
                        selected
                          ? "border-foreground bg-foreground/[0.04]"
                          : "border-border hover:border-foreground/30",
                      )}
                    >
                      <div className="flex items-start gap-4">
                        <span
                          aria-hidden="true"
                          className={cn(
                            "shrink-0 mt-0.5 size-5 rounded-full border-2 transition-colors",
                            selected
                              ? "border-foreground bg-foreground"
                              : "border-border",
                          )}
                        >
                          {selected && (
                            <span className="block size-2 rounded-full bg-card mx-auto mt-[3px]" />
                          )}
                        </span>
                        <span className="text-sm sm:text-base leading-relaxed text-foreground/90">
                          <span className="font-semibold mr-1.5">
                            {opt.label}.
                          </span>
                          {opt.text}
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* Action row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={goPrev}
                disabled={currentIdx === 0}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-card text-foreground text-sm font-medium px-4 py-2.5 hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="size-4" strokeWidth={1.5} />
                {dict.previous}
              </button>
              {!isLast ? (
                <button
                  type="button"
                  onClick={goNext}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground text-sm font-medium px-4 py-2.5 hover:bg-primary/90 transition-colors"
                >
                  {dict.next}
                  <ChevronRight className="size-4" strokeWidth={1.5} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onSubmit}
                  disabled={pending || submittedRef.current}
                  aria-busy={pending || undefined}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground text-sm font-medium px-4 py-2.5 hover:bg-primary/90 transition-colors disabled:opacity-60"
                >
                  {pending && <span className="zen-spinner" aria-hidden="true" />}
                  {pending ? dict.submitting : dict.submit}
                </button>
              )}
              <button
                type="button"
                onClick={toggleMark}
                className={cn(
                  "inline-flex items-center justify-center gap-2 rounded-md border text-sm font-medium px-4 py-2.5 transition-colors sm:ml-auto",
                  marked.has(currentIdx)
                    ? "bg-[var(--review-amber)] text-[var(--review-amber-fg)] border-[var(--gold)]/40 hover:bg-[var(--review-amber)]/80"
                    : "bg-card text-foreground border-border hover:bg-secondary",
                )}
              >
                <Bookmark
                  className={cn(
                    "size-4",
                    marked.has(currentIdx) && "fill-[var(--gold)]",
                  )}
                  strokeWidth={1.5}
                />
                {dict.markReview}
              </button>
            </div>

            {/* Motivational quote */}
            <p className="mt-10 pt-6 border-t border-border italic text-sm text-muted-foreground text-center">
              {dict.motivationalQuote}
            </p>
          </div>
        </article>

        {/* ─── RIGHT RAIL (cosmetic tool rail) ─── */}
        <aside className="lg:col-span-2 order-3">
          <div className="lg:sticky lg:top-20 rounded-xl border border-border bg-card p-3 flex lg:flex-col gap-3">
            <ToolButton
              icon={<Brain className="size-5" strokeWidth={1.5} />}
              label={dict.toolAi}
              hint={dict.toolsComingSoon}
            />
            <ToolButton
              icon={<StickyNote className="size-5" strokeWidth={1.5} />}
              label={dict.toolNotes}
              hint={dict.toolsComingSoon}
            />
            <ToolButton
              icon={<Calculator className="size-5" strokeWidth={1.5} />}
              label={dict.toolCalc}
              hint={dict.toolsComingSoon}
            />
          </div>
        </aside>
      </div>

      {/* ─── FULLSCREEN SUBMIT OVERLAY ───
       *
       * Shown while the submit server action is in flight, so the user
       * can't double-click, navigate, or interact with stale state.
       * Backdrop blur sits over the whole tryout layout; the spinner
       * card is centred. Auto-submit on timer expiry triggers the same
       * overlay because both paths share `pending`.
       */}
      {pending ? (
        <div
          role="alertdialog"
          aria-live="assertive"
          aria-busy="true"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-background/70 backdrop-blur-md px-6"
        >
          <div className="flex flex-col items-center text-center max-w-md">
            <Loader2
              className="size-12 sm:size-14 text-foreground animate-spin"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <p className="serif mt-6 text-2xl sm:text-3xl text-foreground leading-tight">
              {dict.submittingTitle}
            </p>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
              {dict.submittingHint}
            </p>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function ToolButton({
  icon,
  label,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      disabled
      title={`${label} — ${hint}`}
      aria-disabled="true"
      className="flex-1 lg:flex-none flex flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-border/70 bg-secondary/30 text-muted-foreground py-3 cursor-not-allowed select-none hover:bg-secondary/40 transition-colors"
    >
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-[0.08em]">
        {label}
      </span>
    </button>
  );
}
