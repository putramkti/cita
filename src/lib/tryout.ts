/**
 * Tryout helpers: shuffle, sample 30 questions stratified by category,
 * compute scores, and decide passing status.
 *
 * Pure functions only — no DB / network. Tested by unit tests later.
 */

import type {
  AttemptItem,
  Category,
  Question,
} from "./types"
import { TRYOUT_CONFIG } from "./types"

/** Deterministic shuffle (Fisher-Yates). */
export function shuffle<T>(arr: T[], rng: () => number = Math.random): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Pick {per_category} questions from each category in `pool`, then return
 * them in TWK -> TIU -> TKP order. Within each category, the order is
 * shuffled but deterministic if rng is provided.
 */
export function sampleStratified(
  pool: Question[],
  rng: () => number = Math.random,
  perCategory: number = TRYOUT_CONFIG.per_category,
): Question[] {
  const buckets: Record<Category, Question[]> = {
    TWK: [],
    TIU: [],
    TKP: [],
  }
  for (const q of pool) buckets[q.category].push(q)

  const order: Category[] = ["TWK", "TIU", "TKP"]
  const out: Question[] = []
  for (const cat of order) {
    const shuffled = shuffle(buckets[cat], rng)
    out.push(...shuffled.slice(0, perCategory))
  }
  return out
}

/** Score a single answer. Returns the points earned for that answer. */
export function scoreAnswer(
  question: Pick<Question, "category" | "correctAnswer" | "optionWeights">,
  userAnswer: string | null,
): { earned: number; isCorrect: boolean | null } {
  if (userAnswer === null || userAnswer === "") {
    return { earned: 0, isCorrect: null }
  }

  if (question.category === "TKP") {
    const weights = question.optionWeights ?? {}
    const earned = weights[userAnswer] ?? 0
    return {
      earned,
      isCorrect: userAnswer === question.correctAnswer,
    }
  }

  // TWK / TIU
  const correct = userAnswer === question.correctAnswer
  return {
    earned: correct ? TRYOUT_CONFIG.scoring.TWK.correct : 0,
    isCorrect: correct,
  }
}

/** Aggregate per-category scores from an array of attempt items. */
export function summarizeAttempt(items: AttemptItem[]): {
  scoreTWK: number
  scoreTIU: number
  scoreTKP: number
  totalScore: number
  passingStatus: "lulus" | "tidak_lulus"
  perCategoryPass: { TWK: boolean; TIU: boolean; TKP: boolean }
} {
  const score: Record<Category, number> = { TWK: 0, TIU: 0, TKP: 0 }
  for (const it of items) {
    const cat = it.question?.category
    if (!cat) continue
    score[cat] += it.scoreEarned ?? 0
  }
  const total = score.TWK + score.TIU + score.TKP
  const pass = {
    TWK: score.TWK >= TRYOUT_CONFIG.passing_grade.TWK,
    TIU: score.TIU >= TRYOUT_CONFIG.passing_grade.TIU,
    TKP: score.TKP >= TRYOUT_CONFIG.passing_grade.TKP,
  }
  return {
    scoreTWK: score.TWK,
    scoreTIU: score.TIU,
    scoreTKP: score.TKP,
    totalScore: total,
    passingStatus: pass.TWK && pass.TIU && pass.TKP ? "lulus" : "tidak_lulus",
    perCategoryPass: pass,
  }
}

/** Format ms -> mm:ss */
export function formatDuration(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000))
  const mm = Math.floor(totalSec / 60)
    .toString()
    .padStart(2, "0")
  const ss = (totalSec % 60).toString().padStart(2, "0")
  return `${mm}:${ss}`
}

/** Generate a stable id (cuid-lite) — not crypto-grade, just unique enough for client-generated rows. */
export function makeId(prefix = "id"): string {
  const t = Date.now().toString(36)
  const r = Math.random().toString(36).slice(2, 9)
  return `${prefix}_${t}${r}`
}
