"use client";

import { useState, useMemo } from "react";
import { Download, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ReportButton } from "@/components/report/report-button";

interface QuestionLite {
  id: string;
  category: string;
  subcategory: string;
  questionText: string;
  correctAnswer: string | null;
}

interface ItemForList {
  id: string;
  userAnswer: string | null;
  isCorrect: boolean | null;
  position: number;
  question: QuestionLite;
}

interface ResultItemListProps {
  items: ItemForList[];
  attemptId: string;
  attemptCreatedAt: string; // ISO
  attemptMode: string;
  scorePct: number | null;
  userEmail: string | null;
  locale: "id" | "en";
  dict: {
    itemAnalysisTitle: string;
    filterAll: string;
    filterCorrect: string;
    filterWrong: string;
    filterSkipped: string;
    downloadReport: string;
    tagCorrect: string;
    tagWrong: string;
    tagSkipped: string;
    yourAnswer: string;
    correctAnswer: string;
    askTutor: string;
    viewAllPrefix: string;
    viewAllSuffix: string;
    emptyFilter: string;
  };
}

type FilterMode = "all" | "correct" | "wrong" | "skipped";

const PREVIEW_LIMIT = 6;

/**
 * Item analysis section on the result page.
 *
 *   - Filter pills: All / Correct / Wrong / Skipped
 *   - Download CSV report (zero deps; client-side encoded)
 *   - 'Show more' progressive disclosure (preview 6, expand all)
 *   - Per-row Report button (mailto-driven)
 */
export function ResultItemList({
  items,
  attemptId,
  attemptCreatedAt,
  attemptMode,
  scorePct,
  userEmail,
  locale,
  dict,
}: ResultItemListProps) {
  const [filter, setFilter] = useState<FilterMode>("all");
  const [showAll, setShowAll] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    if (filter === "correct") return items.filter((i) => i.isCorrect === true);
    if (filter === "wrong")
      return items.filter((i) => i.userAnswer && i.isCorrect === false);
    return items.filter((i) => !i.userAnswer);
  }, [items, filter]);

  const counts = useMemo(
    () => ({
      all: items.length,
      correct: items.filter((i) => i.isCorrect === true).length,
      wrong: items.filter((i) => i.userAnswer && i.isCorrect === false).length,
      skipped: items.filter((i) => !i.userAnswer).length,
    }),
    [items],
  );

  const visible = showAll ? filtered : filtered.slice(0, PREVIEW_LIMIT);
  const hasMore = filtered.length > PREVIEW_LIMIT;

  const handleDownload = () => {
    setDownloading(true);
    try {
      const csv = buildCsv(items, locale, dict, {
        attemptId,
        attemptCreatedAt,
        attemptMode,
        scorePct,
      });
      const blob = new Blob(["\uFEFF" + csv], {
        // BOM so Excel respects UTF-8.
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const dateStr = attemptCreatedAt.slice(0, 10);
      link.href = url;
      link.download = `cita-tryout-${dateStr}-${attemptId.slice(0, 6)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      // Defer revoke so download starts on slow browsers.
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <section>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <h2 className="serif text-2xl sm:text-3xl text-foreground">
          {dict.itemAnalysisTitle}
        </h2>
        <div className="flex items-center gap-1.5 flex-wrap">
          <FilterPill
            label={dict.filterAll}
            count={counts.all}
            active={filter === "all"}
            onClick={() => {
              setFilter("all");
              setShowAll(false);
            }}
          />
          <FilterPill
            label={dict.filterCorrect}
            count={counts.correct}
            active={filter === "correct"}
            onClick={() => {
              setFilter("correct");
              setShowAll(false);
            }}
          />
          <FilterPill
            label={dict.filterWrong}
            count={counts.wrong}
            active={filter === "wrong"}
            onClick={() => {
              setFilter("wrong");
              setShowAll(false);
            }}
          />
          <FilterPill
            label={dict.filterSkipped}
            count={counts.skipped}
            active={filter === "skipped"}
            onClick={() => {
              setFilter("skipped");
              setShowAll(false);
            }}
          />
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading || items.length === 0}
            className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] border border-border bg-card text-foreground rounded-md px-3 py-2 hover:bg-secondary disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {downloading ? (
              <Loader2 className="size-3.5 animate-spin" strokeWidth={1.75} />
            ) : (
              <Download className="size-3.5" strokeWidth={1.75} />
            )}
            {dict.downloadReport}
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-10 text-center text-sm text-muted-foreground">
          {dict.emptyFilter}
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((it, idx) => (
            <ItemRow
              key={it.id}
              item={it}
              idx={
                filter === "all" ? idx : items.findIndex((x) => x.id === it.id)
              }
              attemptId={attemptId}
              userEmail={userEmail}
              locale={locale}
              dict={dict}
            />
          ))}
        </div>
      )}

      {hasMore && !showAll && (
        <p className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="text-sm text-foreground hover:underline underline-offset-2"
          >
            {dict.viewAllPrefix} {filtered.length} {dict.viewAllSuffix} →
          </button>
        </p>
      )}
    </section>
  );
}

function FilterPill({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "text-[11px] font-bold uppercase tracking-[0.12em] border rounded-md px-3 py-2 transition-colors inline-flex items-center gap-1.5",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary",
      )}
    >
      {label}
      <span
        className={cn(
          "tabular-nums",
          active ? "text-background/80" : "text-muted-foreground/70",
        )}
      >
        {count}
      </span>
    </button>
  );
}

function ItemRow({
  item,
  idx,
  attemptId,
  userEmail,
  locale,
  dict,
}: {
  item: ItemForList;
  idx: number;
  attemptId: string;
  userEmail: string | null;
  locale: "id" | "en";
  dict: ResultItemListProps["dict"];
}) {
  const q = item.question;
  const skipped = !item.userAnswer;
  const isCorrect = item.isCorrect === true;

  const tagClass = skipped
    ? "bg-secondary text-muted-foreground border-border"
    : isCorrect
      ? "bg-[var(--success-soft)] text-[var(--success-fg)] border-[var(--success-fg)]/20"
      : "bg-[var(--error-soft)] text-[var(--error-fg)] border-[var(--error-fg)]/20";

  const tagLabel = skipped
    ? dict.tagSkipped
    : isCorrect
      ? dict.tagCorrect
      : dict.tagWrong;

  const numberPrefix = String(idx + 1).padStart(2, "0");

  return (
    <article className="rounded-xl border border-border bg-card px-5 py-5 flex flex-col sm:flex-row sm:items-center gap-4">
      <span
        className={cn(
          "shrink-0 inline-flex items-center justify-center size-12 rounded-md serif text-xl tabular-nums border",
          skipped
            ? "border-border bg-secondary text-muted-foreground"
            : isCorrect
              ? "border-[var(--success-fg)]/20 bg-[var(--success-soft)] text-[var(--success-fg)]"
              : "border-[var(--error-fg)]/20 bg-[var(--error-soft)] text-[var(--error-fg)]",
        )}
      >
        {numberPrefix}
      </span>
      <div className="flex-1 min-w-0">
        <p className="label-caps mb-1.5">
          {q.category} · {q.subcategory}
        </p>
        <p className="serif text-base text-foreground line-clamp-2 leading-relaxed">
          {q.questionText}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>
            {dict.yourAnswer}:{" "}
            <span className="font-mono font-semibold text-foreground">
              {item.userAnswer ?? "—"}
            </span>
          </span>
          {q.correctAnswer && (
            <>
              <span className="text-border">·</span>
              <span>
                {dict.correctAnswer}:{" "}
                <span className="font-mono font-semibold text-foreground">
                  {q.correctAnswer}
                </span>
              </span>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 sm:flex-col sm:items-end">
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em]",
            tagClass,
          )}
        >
          {tagLabel}
        </span>
        <Link
          href={`/study/${attemptId}/${q.id}`}
          className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
        >
          {dict.askTutor} →
        </Link>
        <ReportButton
          surface="result"
          questionId={q.id}
          category={q.category}
          subcategory={q.subcategory}
          questionText={q.questionText}
          userAnswer={item.userAnswer ?? null}
          correctAnswer={q.correctAnswer ?? null}
          attemptId={attemptId}
          userEmail={userEmail}
          locale={locale}
          variant="subtle"
        />
      </div>
    </article>
  );
}

/* ───────────────── CSV builder ───────────────── */

function buildCsv(
  items: ItemForList[],
  locale: "id" | "en",
  dict: ResultItemListProps["dict"],
  meta: {
    attemptId: string;
    attemptCreatedAt: string;
    attemptMode: string;
    scorePct: number | null;
  },
): string {
  const isEn = locale === "en";

  const header = [
    "#",
    isEn ? "Question ID" : "ID Soal",
    isEn ? "Topic" : "Materi",
    isEn ? "Subtopic" : "Subtopik",
    isEn ? "Question" : "Soal",
    isEn ? "Your answer" : "Jawaban Anda",
    isEn ? "Answer key" : "Kunci",
    isEn ? "Status" : "Status",
  ];

  const rows = items.map((it, idx) => {
    const status = !it.userAnswer
      ? dict.tagSkipped
      : it.isCorrect
        ? dict.tagCorrect
        : dict.tagWrong;
    return [
      String(idx + 1),
      it.question.id,
      it.question.category,
      it.question.subcategory,
      it.question.questionText,
      it.userAnswer ?? "",
      it.question.correctAnswer ?? "",
      status,
    ];
  });

  const metaLines = [
    [`# ${isEn ? "Cita — Tryout report" : "Cita — Laporan Tryout"}`],
    [`# Attempt ID: ${meta.attemptId}`],
    [`# ${isEn ? "Mode" : "Mode"}: ${meta.attemptMode}`],
    [`# ${isEn ? "Created at" : "Tanggal"}: ${meta.attemptCreatedAt}`],
    [
      `# ${isEn ? "Score" : "Skor"}: ${
        meta.scorePct == null ? "—" : meta.scorePct.toFixed(1) + "%"
      }`,
    ],
    [""],
  ];

  const lines = [
    ...metaLines.map((row) => row.join("")),
    header.map(escapeCsv).join(","),
    ...rows.map((r) => r.map(escapeCsv).join(",")),
  ];
  return lines.join("\n");
}

function escapeCsv(v: string): string {
  if (v.includes('"') || v.includes(",") || v.includes("\n")) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}
