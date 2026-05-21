"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { AttemptMode, Category } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { saveAnswer, submitAttempt } from "../actions";

type ClientItem = {
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
};

type Props = {
  attemptId: string;
  items: ClientItem[];
  startedAtMs: number;
  durationMin: number;
  mode: AttemptMode;
};

const categoryColor: Record<Category, string> = {
  TWK: "bg-blue-100 text-blue-900 dark:bg-blue-950/40 dark:text-blue-200",
  TIU: "bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
  TKP: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200",
};

function formatClock(sec: number): string {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function TryoutClient({
  attemptId,
  items: initialItems,
  startedAtMs,
  durationMin,
  mode,
}: Props) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [activeIdx, setActiveIdx] = useState(0);
  const [showOverview, setShowOverview] = useState(false);
  const [isSubmitting, startSubmitTransition] = useTransition();
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  const totalSec = durationMin * 60;

  // Live ticking timer
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const elapsedSec = Math.max(0, Math.floor((now - startedAtMs) / 1000));
  const remainingSec = Math.max(0, totalSec - elapsedSec);

  // Auto-submit on expiry
  const submittedRef = useRef(false);
  useEffect(() => {
    if (remainingSec === 0 && !submittedRef.current) {
      submittedRef.current = true;
      void submitAttempt(attemptId);
    }
  }, [remainingSec, attemptId]);

  const active = items[activeIdx];
  const answeredCount = items.filter((it) => it.userAnswer).length;
  const progressPct = Math.round((answeredCount / items.length) * 100);

  const handlePick = (label: string) => {
    if (active.userAnswer === label) return;
    setItems((prev) =>
      prev.map((it, i) => (i === activeIdx ? { ...it, userAnswer: label } : it)),
    );
    void saveAnswer({
      attemptId,
      questionId: active.questionId,
      userAnswer: label,
    });
  };

  const handleClear = () => {
    if (!active.userAnswer) return;
    setItems((prev) =>
      prev.map((it, i) => (i === activeIdx ? { ...it, userAnswer: null } : it)),
    );
    void saveAnswer({
      attemptId,
      questionId: active.questionId,
      userAnswer: null,
    });
  };

  const handleSubmit = () => {
    startSubmitTransition(async () => {
      try {
        await submitAttempt(attemptId);
      } catch {
        // submitAttempt redirects, errors are usually NEXT_REDIRECT — swallow
        router.push(`/lab-tryout/${attemptId}/result`);
      }
    });
  };

  // Group items by category for the overview grid
  const grouped = useMemo(() => {
    const acc: Record<Category, { idx: number; item: ClientItem }[]> = {
      TWK: [],
      TIU: [],
      TKP: [],
    };
    items.forEach((item, idx) => acc[item.question.category].push({ idx, item }));
    return acc;
  }, [items]);

  const lowTime = remainingSec <= 60;
  const urgentTime = remainingSec <= 10;

  return (
    <div className="space-y-6">
      {/* Sticky header — timer + progress */}
      <div className="sticky top-16 z-20 -mx-4 border-b border-border/60 bg-background/90 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setShowOverview((s) => !s)}
            className="rounded-md border border-border/60 px-3 py-1.5 text-xs hover:border-foreground/40"
          >
            {showOverview ? "Tutup peta" : `Soal ${activeIdx + 1}/${items.length}`}
          </button>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted-foreground sm:inline">
              {answeredCount}/{items.length} terjawab
            </span>
            <span
              className={cn(
                "rounded-md border px-3 py-1.5 font-mono text-sm tabular-nums",
                urgentTime &&
                  "animate-pulse border-rose-500 text-rose-700 dark:text-rose-300",
                lowTime &&
                  !urgentTime &&
                  "border-amber-500 text-amber-700 dark:text-amber-300",
                !lowTime && "border-border/60",
              )}
            >
              {formatClock(remainingSec)}
            </span>
          </div>
        </div>
        <Progress value={progressPct} className="mt-2 h-1" />
      </div>

      {/* Overview map */}
      {showOverview && (
        <section className="rounded-md border border-border/60 p-4">
          <h3 className="serif mb-3 text-base">Peta soal</h3>
          {(["TWK", "TIU", "TKP"] as Category[]).map((cat) => {
            const cells = grouped[cat];
            if (cells.length === 0) return null;
            return (
              <div key={cat} className="mb-3 last:mb-0">
                <div className="mb-2 text-xs text-muted-foreground">
                  <Badge className={cn("mr-2", categoryColor[cat])}>
                    {cat}
                  </Badge>
                  {cells.length} soal
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {cells.map(({ idx, item }) => {
                    const answered = !!item.userAnswer;
                    const current = idx === activeIdx;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setActiveIdx(idx);
                          setShowOverview(false);
                        }}
                        className={cn(
                          "size-8 rounded border text-xs font-mono transition-colors",
                          current && "ring-2 ring-foreground ring-offset-1",
                          answered && !current &&
                            "border-foreground bg-foreground text-background",
                          !answered &&
                            !current &&
                            "border-border hover:border-foreground/40",
                        )}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* Active question */}
      {!showOverview && active && (
        <article className="rounded-md border border-border/60 p-6">
          <header className="mb-4 flex items-start justify-between gap-3">
            <div className="space-y-2">
              <Badge className={categoryColor[active.question.category]}>
                {active.question.category}
              </Badge>
              <p className="text-xs text-muted-foreground">
                {active.question.subcategory} · {active.question.topic}
              </p>
            </div>
            <span className="font-mono text-xs text-muted-foreground">
              #{activeIdx + 1}/{items.length}
            </span>
          </header>

          <h2 className="serif mb-4 text-xl leading-snug">
            {active.question.questionText}
          </h2>

          {active.question.imagePrompt && (
            <div className="mb-4 rounded-md border border-dashed border-border bg-muted/40 p-4 text-xs text-muted-foreground">
              <span className="font-medium uppercase tracking-wide">
                ilustrasi:
              </span>{" "}
              <em>{active.question.imagePrompt}</em>
              <p className="mt-2 text-[10px] text-muted-foreground/70">
                (Image generator belum aktif di lab — abaikan placeholder ini.)
              </p>
            </div>
          )}

          <ol className="space-y-2">
            {active.question.options.map((opt) => {
              const picked = active.userAnswer === opt.label;
              return (
                <li key={opt.label}>
                  <button
                    type="button"
                    onClick={() => handlePick(opt.label)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-md border px-4 py-3 text-left text-sm transition-colors",
                      "hover:border-foreground/40",
                      picked && "border-foreground bg-muted/30",
                      !picked && "border-border",
                    )}
                  >
                    <span className="font-mono text-xs font-medium">
                      {opt.label}.
                    </span>
                    <span className="flex-1">{opt.text}</span>
                    {picked && (
                      <span className="font-mono text-xs">✓</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ol>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setActiveIdx((i) => Math.max(0, i - 1))}
              disabled={activeIdx === 0}
            >
              ← Sebelumnya
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleClear}
              disabled={!active.userAnswer}
            >
              Hapus jawaban
            </Button>
            <Button
              size="sm"
              onClick={() =>
                setActiveIdx((i) => Math.min(items.length - 1, i + 1))
              }
              disabled={activeIdx === items.length - 1}
            >
              Selanjutnya →
            </Button>
          </div>
        </article>
      )}

      {/* Submit footer */}
      <footer className="border-t border-border/60 pt-6">
        {!confirmSubmit ? (
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              {answeredCount === items.length
                ? "Semua soal terjawab. Siap submit?"
                : `${items.length - answeredCount} soal belum terjawab.`}
            </p>
            <Button
              variant="outline"
              onClick={() => setConfirmSubmit(true)}
              disabled={isSubmitting}
            >
              Submit tryout
            </Button>
          </div>
        ) : (
          <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm dark:border-amber-800 dark:bg-amber-950/40">
            <p className="font-medium">Submit sekarang?</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Jawaban yang sudah disimpan akan dinilai. Tidak bisa diubah setelah submit.
            </p>
            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Mengirim…" : "Ya, submit"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setConfirmSubmit(false)}
                disabled={isSubmitting}
              >
                Batal
              </Button>
            </div>
          </div>
        )}
        <p className="mt-3 text-center text-[10px] text-muted-foreground">
          Mode: {mode === "MINI" ? "Drill Mini" : "Simulasi Penuh"} ·{" "}
          {durationMin} menit · {items.length} soal
        </p>
      </footer>
    </div>
  );
}
