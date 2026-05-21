import "server-only";

/**
 * Tryout configuration — dual-mode for SKD CPNS practice.
 *
 * MINI  — daily drill, 30 soal, 30 menit
 *         (10 TWK + 10 TIU + 10 TKP)
 * FULL  — full SKD simulation, 110 soal, 100 menit
 *         (30 TWK + 35 TIU + 45 TKP) — mirror SKD CPNS asli
 *
 * Passing grade SKD CPNS resmi (2026):
 *   TWK ≥ 65
 *   TIU ≥ 80
 *   TKP ≥ 156
 *
 * Scoring:
 *   TWK + TIU: correct = 5 pts, wrong = 0 pts
 *   TKP:       option weights 1..5 (no zero)
 */

import type { AttemptMode, Category } from "@prisma/client";

export interface ModeConfig {
  totalSoal: number;
  durationMin: number;
  perCategory: Record<Category, number>;
  /** UI label */
  labelId: string;
  /** Short blurb in Indonesian */
  taglineId: string;
}

export const MODE_CONFIG: Record<AttemptMode, ModeConfig> = {
  MINI: {
    totalSoal: 30,
    durationMin: 30,
    perCategory: { TWK: 10, TIU: 10, TKP: 10 },
    labelId: "Drill Mini",
    taglineId: "30 soal · 30 menit · cocok untuk latihan harian",
  },
  FULL: {
    totalSoal: 110,
    durationMin: 100,
    perCategory: { TWK: 30, TIU: 35, TKP: 45 },
    labelId: "Simulasi Penuh",
    taglineId: "110 soal · 100 menit · mirror SKD CPNS resmi",
  },
};

/**
 * SKD passing grade — same for both modes.
 * Total threshold = 65 + 80 + 156 = 301 points (lulus = pass all 3).
 *
 * Scaling note: untuk MINI mode (10/10/10), skor maks per kategori = 50/50/45-50,
 * jadi raw score gak bisa langsung pakai threshold ini. Hitung lulus per
 * kategori pakai persen relatif terhadap pool size mode bersangkutan.
 */
export const PASSING_GRADE = {
  TWK: 65,
  TIU: 80,
  TKP: 156,
} as const;

/**
 * Compute "scaled" passing thresholds for a given mode.
 *
 * Logic: SKD asli punya 30/35/45 soal per kategori. Threshold di-set
 * berdasarkan asumsi pool tsb. Untuk MINI (10/10/10), threshold dibagi
 * proporsional supaya UX feedback lulus/tidak lulus tetap meaningful.
 *
 * MINI scaled:
 *   TWK ≥ 22  (65 × 10/30)
 *   TIU ≥ 23  (80 × 10/35)
 *   TKP ≥ 35  (156 × 10/45) - integer floor
 */
export function thresholdFor(mode: AttemptMode) {
  if (mode === "FULL") return { ...PASSING_GRADE };
  const cfg = MODE_CONFIG[mode];
  return {
    TWK: Math.floor(PASSING_GRADE.TWK * (cfg.perCategory.TWK / 30)),
    TIU: Math.floor(PASSING_GRADE.TIU * (cfg.perCategory.TIU / 35)),
    TKP: Math.floor(PASSING_GRADE.TKP * (cfg.perCategory.TKP / 45)),
  };
}

/**
 * SKD scoring constants for non-TKP categories.
 *
 * TKP scoring is per-option-weight, varies per question. Stored in
 * Question.optionWeights JSON.
 */
export const SCORE_PER_CORRECT = 5;
export const SCORE_PER_WRONG = 0;

/** Fisher-Yates shuffle. */
export function shuffle<T>(arr: T[], rng: () => number = Math.random): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Pick `n` questions per category, ordered TWK → TIU → TKP.
 * Throws if pool insufficient for the requested mode.
 */
export function sampleStratified(
  pool: { id: string; category: Category }[],
  mode: AttemptMode,
  rng: () => number = Math.random,
): string[] {
  const cfg = MODE_CONFIG[mode];
  const buckets: Record<Category, string[]> = { TWK: [], TIU: [], TKP: [] };
  for (const q of pool) buckets[q.category].push(q.id);

  const out: string[] = [];
  for (const cat of ["TWK", "TIU", "TKP"] as Category[]) {
    const need = cfg.perCategory[cat];
    if (buckets[cat].length < need) {
      throw new Error(
        `Pool ${cat} cuma ${buckets[cat].length} soal — butuh ${need} untuk mode ${mode}`,
      );
    }
    const shuffled = shuffle(buckets[cat], rng);
    out.push(...shuffled.slice(0, need));
  }
  return out;
}

/**
 * Score a single answer.
 *
 * For TWK/TIU: returns { earned: 5|0, isCorrect: bool }.
 * For TKP:     returns { earned: 1..5, isCorrect: bool (vs correctAnswer field) }.
 * For null userAnswer (skipped): { earned: 0, isCorrect: null }.
 */
export function scoreAnswer(
  question: {
    category: Category;
    correctAnswer: string | null;
    optionWeights: unknown;
  },
  userAnswer: string | null,
): { earned: number; isCorrect: boolean | null } {
  if (userAnswer === null || userAnswer === "") {
    return { earned: 0, isCorrect: null };
  }

  if (question.category === "TKP") {
    const weights = (question.optionWeights ?? {}) as Record<string, number>;
    const earned = weights[userAnswer] ?? 0;
    return {
      earned,
      isCorrect:
        question.correctAnswer === null
          ? null
          : userAnswer === question.correctAnswer,
    };
  }

  const correct = userAnswer === question.correctAnswer;
  return {
    earned: correct ? SCORE_PER_CORRECT : SCORE_PER_WRONG,
    isCorrect: correct,
  };
}

/** Format ms → mm:ss for client clock display. */
export function formatDuration(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const mm = Math.floor(totalSec / 60).toString().padStart(2, "0");
  const ss = (totalSec % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
}
