/**
 * Personalized result insight — typed payload schema.
 *
 * Cached at attempt.aiInsight (Json?) so the result page renders
 * instantly on reload. Versioned via `version` so prompt upgrades
 * can opt-in to regenerate vs read-stale.
 */

export interface InsightTopicWeakness {
  /** Display label e.g. 'TIU — Numerik Aritmetika'. */
  label: string;
  /** Raw category for filtering. */
  category: "TWK" | "TIU" | "TKP";
  /** Raw subcategory string from the DB. */
  subcategory: string;
  /** Number of attempted items in this topic. */
  attempted: number;
  /** Number correct. */
  correct: number;
  /** Saran 1-line untuk user (formal "Anda"). */
  suggestion: string;
}

export interface InsightTopicStrength {
  label: string;
  category: "TWK" | "TIU" | "TKP";
  subcategory: string;
  attempted: number;
  correct: number;
}

export interface InsightPayload {
  /** Bump when prompt format changes; old cached payloads become stale-only. */
  version: 1;
  /** Locale used to generate copy. */
  locale: "id" | "en";
  /** 2-3 sentence narrative ringkasan dari LLM. */
  summary: string;
  /** Top 3 strengths. */
  strengths: InsightTopicStrength[];
  /** Top 3 areas to improve. */
  weaknesses: InsightTopicWeakness[];
  /** Generic study suggestions (not specific question IDs — drilling
   *  feature lives in Phase 7.5). */
  recommendations: string[];
  /** Generated timestamp ISO. */
  generatedAt: string;
}

export type InsightStatus = "PENDING" | "READY" | "FAILED";
