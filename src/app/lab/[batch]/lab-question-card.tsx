"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LabQuestion } from "@/lib/lab/types";

const difficultyLabel: Record<number, string> = {
  1: "Mudah",
  2: "Sedang−",
  3: "Sedang",
  4: "Sedang+",
  5: "Sulit",
};

export function LabQuestionCard({
  question,
  index,
}: {
  question: LabQuestion;
  index: number;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [showLong, setShowLong] = useState(false);

  const isCorrect = picked === question.correctAnswer;
  const hasWeights = question.optionWeights !== null;

  return (
    <article
      id={question.id}
      className="border-b border-border/60 py-8 last:border-0"
    >
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono">#{index + 1}</span>
            <span>·</span>
            <span className="font-mono">{question.id}</span>
          </div>
          <h3 className="serif mt-2 text-xl leading-snug">
            {question.questionText}
          </h3>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <Badge variant="outline" className="font-mono text-xs">
            {question.category} · {question.subcategory}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {difficultyLabel[question.difficulty]}
          </span>
        </div>
      </header>

      {question.imagePrompt && (
        <div className="mb-4 rounded-md border border-dashed border-border bg-muted/40 p-4 text-xs text-muted-foreground">
          <span className="font-medium uppercase tracking-wide">image_prompt:</span>{" "}
          <em>{question.imagePrompt}</em>
        </div>
      )}

      <ol className="space-y-2">
        {question.options.map((opt) => {
          const isPicked = picked === opt.label;
          const isAnswer = opt.label === question.correctAnswer;
          const showCorrect = revealed && isAnswer;
          const showWrong = revealed && isPicked && !isCorrect;
          const weight = hasWeights
            ? question.optionWeights![opt.label as keyof typeof question.optionWeights]
            : null;

          return (
            <li key={opt.label}>
              <button
                type="button"
                onClick={() => {
                  if (!revealed) setPicked(opt.label);
                }}
                className={cn(
                  "flex w-full items-start gap-3 rounded-md border px-4 py-3 text-left text-sm transition-colors",
                  "hover:border-foreground/40",
                  isPicked && !revealed && "border-foreground bg-muted/30",
                  showCorrect &&
                    "border-emerald-500 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/30",
                  showWrong &&
                    "border-rose-500 bg-rose-50 dark:border-rose-700 dark:bg-rose-950/30",
                  !isPicked && !showCorrect && "border-border"
                )}
              >
                <span className="font-mono text-xs font-medium">
                  {opt.label}.
                </span>
                <span className="flex-1">{opt.text}</span>
                {hasWeights && revealed && (
                  <span className="font-mono text-xs text-muted-foreground">
                    +{weight}
                  </span>
                )}
                {showCorrect && (
                  <span className="font-mono text-xs text-emerald-700 dark:text-emerald-300">
                    ✓
                  </span>
                )}
                {showWrong && (
                  <span className="font-mono text-xs text-rose-700 dark:text-rose-300">
                    ✗
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ol>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {!revealed ? (
          <Button
            size="sm"
            onClick={() => setRevealed(true)}
            disabled={!picked && !hasWeights}
          >
            {hasWeights ? "Lihat bobot & penjelasan" : "Cek jawaban"}
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setRevealed(false);
              setPicked(null);
              setShowLong(false);
            }}
          >
            Reset
          </Button>
        )}
        {revealed && (
          <Badge
            variant="outline"
            className={cn(
              "font-mono text-xs",
              !hasWeights &&
                isCorrect &&
                "border-emerald-500 text-emerald-700 dark:text-emerald-300",
              !hasWeights &&
                !isCorrect &&
                "border-rose-500 text-rose-700 dark:text-rose-300"
            )}
          >
            {hasWeights
              ? `bobot: ${question.optionWeights![picked as keyof typeof question.optionWeights] ?? "—"}`
              : isCorrect
                ? "benar"
                : `salah · jawaban: ${question.correctAnswer}`}
          </Badge>
        )}
      </div>

      {revealed && (
        <div className="mt-5 rounded-md bg-muted/40 px-4 py-3 text-sm">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {question.explanation}
            </ReactMarkdown>
          </div>
          {question.explanationLong && question.explanationLong !== question.explanation && (
            <div className="mt-3 border-t border-border/60 pt-3">
              <button
                type="button"
                onClick={() => setShowLong((s) => !s)}
                className="text-xs font-medium text-foreground underline-offset-4 hover:underline"
              >
                {showLong ? "Sembunyikan" : "Penjelasan panjang"}
              </button>
              {showLong && (
                <div className="prose prose-sm mt-2 max-w-none dark:prose-invert">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {question.explanationLong}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          )}
          {question.source && (
            <p className="mt-3 text-xs text-muted-foreground">
              <span className="font-medium">Sumber:</span> {question.source}
            </p>
          )}
        </div>
      )}

      {question.warnings.length > 0 && (
        <div className="mt-3 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          <span className="font-medium">⚠ {question.warnings.length} warning</span>
          <ul className="mt-1 list-inside list-disc">
            {question.warnings.map((w, i) => (
              <li key={i} className="font-mono">
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      {question.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {question.tags.map((t) => (
            <span
              key={t}
              className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
