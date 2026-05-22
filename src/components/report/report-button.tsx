"use client";

import { useState, useRef, useEffect } from "react";
import { Flag, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const REPORT_TO = "putramukti26@gmail.com";

export type ReportSurface = "tryout" | "result" | "tutor";

interface ReportButtonProps {
  surface: ReportSurface;
  questionId: string;
  category?: string | null; // TWK / TIU / TKP
  subcategory?: string | null;
  questionText?: string | null;
  userAnswer?: string | null;
  correctAnswer?: string | null;
  attemptId?: string | null;
  userEmail?: string | null;
  locale?: "id" | "en";
  /** Visual variant — icon-only for compact tool slots, or text label. */
  variant?: "icon" | "text" | "subtle";
  /** Optional Tailwind classes for the trigger button. */
  className?: string;
}

interface ReportCategory {
  id: string;
  labelId: string;
  labelEn: string;
}

const CATEGORIES: ReportCategory[] = [
  {
    id: "unclear",
    labelId: "Soal tidak jelas / typo",
    labelEn: "Question is unclear / typo",
  },
  {
    id: "wrong_key",
    labelId: "Kunci jawaban terindikasi salah",
    labelEn: "Answer key looks incorrect",
  },
  {
    id: "wrong_explanation",
    labelId: "Pembahasan keliru",
    labelEn: "Explanation is incorrect",
  },
  {
    id: "tutor_error",
    labelId: "AI tutor menjawab keliru",
    labelEn: "AI tutor answered incorrectly",
  },
  {
    id: "other",
    labelId: "Lainnya",
    labelEn: "Other",
  },
];

/**
 * Report button — opens user's mail client with a pre-filled email
 * to putramukti26@gmail.com containing question + context metadata.
 *
 * Surfaces:
 *   - tryout : question card during the test
 *   - result : per-question review row on the result page
 *   - tutor  : header of the tutor chat panel
 *
 * Categories are filtered per surface so users only see relevant
 * options (e.g. tryout doesn't show 'tutor error' since they're not
 * in tutor mode).
 */
export function ReportButton({
  surface,
  questionId,
  category,
  subcategory,
  questionText,
  userAnswer,
  correctAnswer,
  attemptId,
  userEmail,
  locale = "id",
  variant = "icon",
  className,
}: ReportButtonProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isEn = locale === "en";

  // Filter categories by surface relevance.
  const relevantCategories = CATEGORIES.filter((c) => {
    if (surface === "tryout") {
      // During the test the user can't see the answer key yet.
      return c.id === "unclear" || c.id === "other";
    }
    if (surface === "tutor") {
      return c.id !== "wrong_explanation"; // explanation is in result, not tutor
    }
    return c.id !== "tutor_error"; // result page = no tutor context
  });

  // Click outside closes dropdown.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const handlePick = (catId: string) => {
    const cat = CATEGORIES.find((c) => c.id === catId)!;
    const subject = `[Cita Report] ${isEn ? cat.labelEn : cat.labelId} — Soal #${questionId.slice(0, 8)}`;

    const lines: string[] = [];
    lines.push(isEn ? "Hello," : "Halo,");
    lines.push("");
    lines.push(
      isEn
        ? "I would like to report an issue with the following question on Cita."
        : "Saya ingin melaporkan kendala pada soal berikut di Cita.",
    );
    lines.push("");
    lines.push(`${isEn ? "Category" : "Kategori laporan"}: ${isEn ? cat.labelEn : cat.labelId}`);
    lines.push(`${isEn ? "Surface" : "Halaman"}: ${surfaceLabel(surface, isEn)}`);
    lines.push("");
    lines.push("--- " + (isEn ? "Question metadata" : "Detail soal") + " ---");
    lines.push(`Question ID: ${questionId}`);
    if (category) {
      lines.push(`${isEn ? "Topic" : "Materi"}: ${category}${subcategory ? ` · ${subcategory}` : ""}`);
    }
    if (attemptId) {
      lines.push(`Attempt ID: ${attemptId}`);
    }
    if (questionText) {
      const truncated = questionText.length > 280
        ? questionText.slice(0, 280) + "…"
        : questionText;
      lines.push(`${isEn ? "Question" : "Pertanyaan"}: ${truncated}`);
    }
    if (userAnswer) {
      lines.push(`${isEn ? "User answer" : "Jawaban pelapor"}: ${userAnswer}`);
    }
    if (correctAnswer) {
      lines.push(`${isEn ? "Answer key" : "Kunci jawaban"}: ${correctAnswer}`);
    }
    lines.push("");
    if (typeof window !== "undefined") {
      lines.push(`URL: ${window.location.href}`);
    }
    if (userEmail) {
      lines.push(`${isEn ? "Reporter email" : "Email pelapor"}: ${userEmail}`);
    } else {
      lines.push(`${isEn ? "Reporter" : "Pelapor"}: ${isEn ? "Anonymous" : "Anonim"}`);
    }
    lines.push("");
    lines.push("--- " + (isEn ? "Your notes" : "Catatan tambahan dari pelapor") + " ---");
    lines.push(isEn ? "(write here)" : "(tulis di sini)");
    lines.push("");
    lines.push("");
    lines.push(isEn ? "Thank you," : "Terima kasih,");

    const body = lines.join("\n");

    // Build mailto URL. encodeURIComponent handles all reserved chars
    // including newlines (%0A) which most clients render correctly.
    const url = `mailto:${REPORT_TO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setOpen(false);
    // Use window.location.href so the browser handles the protocol
    // hand-off (Gmail web, Apple Mail, Outlook, etc.). Some browsers
    // block window.open on user-initiated synchronous events here;
    // location.href is reliable.
    window.location.href = url;
  };

  // Trigger: variant-aware
  const triggerLabel = isEn ? "Report" : "Laporkan";

  return (
    <div ref={ref} className={cn("relative inline-block", className)}>
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        aria-label={triggerLabel + " " + (isEn ? "this question" : "soal ini")}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "inline-flex items-center gap-1 rounded-md transition-colors",
          variant === "icon"
            ? "size-8 justify-center border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary"
            : variant === "subtle"
              ? "px-1.5 py-0.5 text-[11px] text-muted-foreground hover:text-foreground"
              : "border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary px-2.5 py-1.5 text-xs",
        )}
      >
        <Flag className={variant === "subtle" ? "size-3" : "size-3.5"} strokeWidth={1.75} />
        {variant !== "icon" && (
          <>
            <span>{triggerLabel}</span>
            <ChevronDown
              className={variant === "subtle" ? "size-3" : "size-3.5"}
              strokeWidth={1.75}
            />
          </>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-1 z-50 min-w-[260px] rounded-lg border border-border bg-popover shadow-lg overflow-hidden"
        >
          <div className="px-3 py-2 border-b border-border">
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
              {isEn ? "Report a problem" : "Laporkan masalah"}
            </p>
            <p className="text-[11px] text-muted-foreground/80 mt-0.5 leading-snug">
              {isEn
                ? "Opens your email app, pre-filled."
                : "Akan membuka aplikasi email Anda dengan draf siap kirim."}
            </p>
          </div>
          <ul className="py-1" role="none">
            {relevantCategories.map((c) => (
              <li key={c.id} role="none">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => handlePick(c.id)}
                  className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
                >
                  {isEn ? c.labelEn : c.labelId}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function surfaceLabel(s: ReportSurface, isEn: boolean): string {
  if (s === "tryout") return isEn ? "During tryout" : "Saat mengerjakan tryout";
  if (s === "tutor") return isEn ? "Cita Tutor chat" : "Diskusi Cita Tutor";
  return isEn ? "Result review" : "Hasil tryout";
}
