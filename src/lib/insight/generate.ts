import "server-only";
import { prisma } from "@/lib/db/prisma";
import type { Category } from "@prisma/client";
import type {
  InsightPayload,
  InsightTopicStrength,
  InsightTopicWeakness,
} from "./schema";

/**
 * Per-topic stat aggregated from attempt items.
 *
 * Computed deterministically (no LLM) so the LLM only authors copy,
 * not numbers. Numbers stay reproducible across retries.
 */
interface TopicStat {
  category: Category;
  subcategory: string;
  attempted: number;
  correct: number;
}

interface AttemptStatsResult {
  topicStats: TopicStat[];
  scoreTWK: number | null;
  scoreTIU: number | null;
  scoreTKP: number | null;
  totalScore: number | null;
  passingStatus: string | null;
}

export async function loadAttemptStats(
  attemptId: string,
): Promise<AttemptStatsResult | null> {
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    select: {
      scoreTWK: true,
      scoreTIU: true,
      scoreTKP: true,
      totalScore: true,
      passingStatus: true,
      items: {
        select: {
          isCorrect: true,
          userAnswer: true,
          question: {
            select: { category: true, subcategory: true },
          },
        },
      },
    },
  });

  if (!attempt) return null;

  // Aggregate per (category, subcategory).
  const byTopic = new Map<string, TopicStat>();
  for (const item of attempt.items) {
    const k = `${item.question.category}::${item.question.subcategory}`;
    const cur = byTopic.get(k) ?? {
      category: item.question.category,
      subcategory: item.question.subcategory,
      attempted: 0,
      correct: 0,
    };
    if (item.userAnswer != null) {
      cur.attempted += 1;
      if (item.isCorrect) cur.correct += 1;
    }
    byTopic.set(k, cur);
  }

  return {
    topicStats: Array.from(byTopic.values()),
    scoreTWK: attempt.scoreTWK,
    scoreTIU: attempt.scoreTIU,
    scoreTKP: attempt.scoreTKP,
    totalScore: attempt.totalScore,
    passingStatus: attempt.passingStatus,
  };
}

/**
 * Pick top 3 weaknesses + strengths deterministically.
 *
 * Weakness ranking:
 *   1. Min correct rate (correct/attempted) ascending
 *   2. Tie-break by attempted count descending (more samples = more confident)
 *
 * Strength ranking:
 *   1. Max correct rate descending
 *   2. Tie-break by attempted count descending
 *
 * Topics with attempted=0 are excluded entirely. TKP is treated as a
 * regular subtest — caller may choose to exclude TKP from weakness if
 * scoring scheme makes raw rate misleading. We keep TKP because the
 * subcategory-level pattern still gives useful signal.
 */
export function rankTopics(stats: TopicStat[]): {
  strengths: InsightTopicStrength[];
  weaknesses: InsightTopicWeakness[];
} {
  const eligible = stats.filter((t) => t.attempted >= 1);

  const sortedByWeak = [...eligible].sort((a, b) => {
    const ra = a.correct / a.attempted;
    const rb = b.correct / b.attempted;
    if (ra !== rb) return ra - rb;
    return b.attempted - a.attempted;
  });

  const sortedByStrong = [...eligible].sort((a, b) => {
    const ra = a.correct / a.attempted;
    const rb = b.correct / b.attempted;
    if (ra !== rb) return rb - ra;
    return b.attempted - a.attempted;
  });

  const weaknesses: InsightTopicWeakness[] = sortedByWeak
    .slice(0, 3)
    .map((t) => ({
      label: `${t.category} — ${t.subcategory}`,
      category: t.category,
      subcategory: t.subcategory,
      attempted: t.attempted,
      correct: t.correct,
      suggestion: "", // Filled by LLM step.
    }));

  // De-dup strengths against weaknesses to avoid both lists pointing at
  // the same topic when accuracy is mid-tier.
  const weakKeys = new Set(weaknesses.map((w) => `${w.category}::${w.subcategory}`));
  const strengths: InsightTopicStrength[] = sortedByStrong
    .filter((t) => !weakKeys.has(`${t.category}::${t.subcategory}`))
    .filter((t) => t.correct / t.attempted >= 0.5) // Only meaningful strengths.
    .slice(0, 3)
    .map((t) => ({
      label: `${t.category} — ${t.subcategory}`,
      category: t.category,
      subcategory: t.subcategory,
      attempted: t.attempted,
      correct: t.correct,
    }));

  return { strengths, weaknesses };
}

/**
 * Build LLM prompt that asks Haiku to author the narrative parts only.
 * Numbers are computed by us; LLM never sees raw items.
 */
export function buildInsightPrompt(args: {
  locale: "id" | "en";
  totalScore: number | null;
  passingStatus: string | null;
  scoreTWK: number | null;
  scoreTIU: number | null;
  scoreTKP: number | null;
  strengths: InsightTopicStrength[];
  weaknesses: InsightTopicWeakness[];
}): { system: string; user: string } {
  const { locale } = args;
  const passLabel =
    args.passingStatus === "PASS"
      ? locale === "id"
        ? "lulus"
        : "passed"
      : args.passingStatus === "FAIL"
      ? locale === "id"
        ? "belum lulus"
        : "did not pass"
      : locale === "id"
      ? "belum dinilai"
      : "ungraded";

  const strengthLines = args.strengths
    .map(
      (s) =>
        `- ${s.label} (${s.correct}/${s.attempted})`,
    )
    .join("\n");

  const weaknessLines = args.weaknesses
    .map(
      (w) =>
        `- ${w.label} (${w.correct}/${w.attempted})`,
    )
    .join("\n");

  if (locale === "id") {
    const system = `Anda adalah konsultan pembelajaran untuk persiapan tes CPNS Indonesia (SKD: TWK, TIU, TKP). Tugas Anda: menulis analisa hasil tryout yang ringkas, jelas, dan dapat ditindaklanjuti.

Aturan:
- Gunakan kata sapaan formal "Anda" (bukan "kamu" atau "lo").
- Jangan mengulang angka skor di summary — fokus ke narasi.
- Untuk setiap area lemah, berikan saran belajar 1 kalimat yang spesifik ke topik (mis. "Latih operasi pecahan dan perbandingan").
- Hindari saran generik kosong (mis. "belajar lebih giat").
- Jangan menyebut fitur yang belum ada (jangan janjikan "5 soal latihan otomatis").
- Output harus VALID JSON, tidak ada teks lain di luar JSON.
- Field "summary" 2-3 kalimat, padat. Field "recommendations" 3 item, masing-masing 1 kalimat.

Format JSON yang harus dihasilkan:
{
  "summary": "...",
  "weakness_suggestions": ["...", "...", "..."],
  "recommendations": ["...", "...", "..."]
}`;

    const user = `Hasil tryout pengguna:
- Skor total: ${args.totalScore ?? "—"} (${passLabel})
- TWK: ${args.scoreTWK ?? "—"}, TIU: ${args.scoreTIU ?? "—"}, TKP: ${args.scoreTKP ?? "—"}

Kekuatan utama (topik dengan akurasi tertinggi):
${strengthLines || "- (tidak ada topik kuat yang menonjol)"}

Area yang perlu dikuatkan (topik dengan akurasi terendah, urutan dari paling lemah):
${weaknessLines || "- (tidak ada data cukup)"}

Tugas Anda:
1. Tulis "summary" 2-3 kalimat yang menyoroti pola hasil pengguna (lulus/tidak, kekuatan utama, area paling perlu dilatih).
2. Untuk setiap area lemah di atas (urutan SAMA), tulis 1 saran spesifik. Hasil dalam "weakness_suggestions" — array berisi tepat ${args.weaknesses.length} item, urutannya sama dengan daftar di atas.
3. Tulis 3 "recommendations" generik tapi actionable: arahkan pengguna untuk belajar materi spesifik dari sumber belajar mereka, mencoba ulang tryout MINI untuk membiasakan diri, dan memanfaatkan fitur Cita Tutor untuk diskusi soal sulit. Jangan menjanjikan fitur "5 soal latihan otomatis" atau "drill targeted" karena belum ada.

Output JSON valid saja, tanpa markdown fence.`;
    return { system, user };
  }

  // English
  const system = `You are a learning consultant for Indonesia's CPNS (civil-service) preparation test (SKD: TWK, TIU, TKP). Write a concise, clear, actionable analysis of one tryout attempt.

Rules:
- Use formal "you".
- Do not restate raw scores in the summary — focus on the narrative.
- For each weak area, write a one-sentence topic-specific study suggestion. Avoid empty generic advice.
- Do not promise features that don't exist yet (no "5 targeted drill questions").
- Output VALID JSON only — no surrounding prose.

Required JSON shape:
{
  "summary": "...",
  "weakness_suggestions": ["...", "...", "..."],
  "recommendations": ["...", "...", "..."]
}`;

  const user = `Tryout result:
- Total: ${args.totalScore ?? "—"} (${passLabel})
- TWK: ${args.scoreTWK ?? "—"}, TIU: ${args.scoreTIU ?? "—"}, TKP: ${args.scoreTKP ?? "—"}

Strengths:
${strengthLines || "- (none yet)"}

Weak areas (lowest accuracy first):
${weaknessLines || "- (insufficient data)"}

Tasks:
1. "summary": 2-3 sentences highlighting the result pattern.
2. "weakness_suggestions": array of EXACTLY ${args.weaknesses.length} suggestions, same order as the weak areas above, each topic-specific and one sentence.
3. "recommendations": 3 actionable but generic items — study the relevant materials from their own source, redo a MINI tryout to build familiarity, use the Cita Tutor feature to discuss hard questions. Do not promise targeted-drill or "5 practice questions" features that do not yet exist.

JSON only.`;
  return { system, user };
}

interface LlmJsonResponse {
  summary: string;
  weakness_suggestions: string[];
  recommendations: string[];
}

/**
 * Calls the 9router proxy to generate the narrative parts of the
 * insight. Returns a typed object or throws — caller maps to FAILED
 * status.
 */
export async function callInsightLlm(
  prompts: { system: string; user: string },
): Promise<LlmJsonResponse> {
  const apiBase = process.env.EXPLAINER_API_BASE;
  const apiKey = process.env.EXPLAINER_API_KEY;
  const model = process.env.INSIGHT_MODEL || process.env.EXPLAINER_MODEL || "kr/claude-haiku-4.5";

  if (!apiBase || !apiKey) {
    throw new Error("insight_llm_not_configured");
  }

  const resp = await fetch(`${apiBase}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: prompts.system },
        { role: "user", content: prompts.user },
      ],
      stream: false,
      max_tokens: 800,
      temperature: 0.5,
      response_format: { type: "json_object" },
    }),
    // Server-to-server, no special caching.
    cache: "no-store",
  });

  if (!resp.ok) {
    const txt = await resp.text().catch(() => "");
    throw new Error(`insight_llm_upstream:${resp.status}:${txt.slice(0, 200)}`);
  }

  const json = (await resp.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = json.choices?.[0]?.message?.content ?? "";
  if (!content) throw new Error("insight_llm_empty");

  const parsed = parseInsightJson(content);
  return parsed;
}

/**
 * Defensive JSON parse: handles markdown fences, trailing prose, and
 * nested code blocks. Throws on irrecoverable shape mismatch.
 */
function parseInsightJson(content: string): LlmJsonResponse {
  let cleaned = content.trim();
  // Strip ```json ... ``` fence if present.
  const fenceMatch = cleaned.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
  if (fenceMatch) cleaned = fenceMatch[1].trim();
  // If still has prose, try to slice from first "{" to last "}".
  if (!cleaned.startsWith("{")) {
    const i = cleaned.indexOf("{");
    const j = cleaned.lastIndexOf("}");
    if (i >= 0 && j > i) cleaned = cleaned.slice(i, j + 1);
  }

  type Parsed = {
    summary?: unknown;
    weakness_suggestions?: unknown;
    recommendations?: unknown;
  };
  const obj = JSON.parse(cleaned) as Parsed;
  if (
    typeof obj.summary !== "string" ||
    !Array.isArray(obj.weakness_suggestions) ||
    !Array.isArray(obj.recommendations)
  ) {
    throw new Error("insight_llm_bad_shape");
  }
  return {
    summary: obj.summary,
    weakness_suggestions: obj.weakness_suggestions.filter(
      (x: unknown): x is string => typeof x === "string",
    ),
    recommendations: obj.recommendations.filter(
      (x: unknown): x is string => typeof x === "string",
    ),
  };
}

/**
 * End-to-end: load attempt → rank → call LLM → assemble payload → save
 * to DB. Returns the final payload or throws on irrecoverable error.
 *
 * Pre-condition: attempt must be SUBMITTED (or EXPIRED with scores).
 * Post-condition: aiInsight, insightStatus, insightAt are persisted.
 *
 * Idempotent: if insightStatus is READY, returns cached payload.
 */
export async function generateAndSaveInsight(args: {
  attemptId: string;
  locale: "id" | "en";
  /** Force regeneration even if cached. */
  force?: boolean;
}): Promise<InsightPayload | null> {
  const existing = await prisma.attempt.findUnique({
    where: { id: args.attemptId },
    select: {
      insightStatus: true,
      aiInsight: true,
      status: true,
    },
  });
  if (!existing) return null;
  if (existing.status === "IN_PROGRESS") return null; // No insight for live attempts.

  if (
    !args.force &&
    existing.insightStatus === "READY" &&
    existing.aiInsight
  ) {
    return existing.aiInsight as unknown as InsightPayload;
  }

  // Mark as PENDING immediately so concurrent triggers see it.
  await prisma.attempt.update({
    where: { id: args.attemptId },
    data: { insightStatus: "PENDING" },
  });

  let payload: InsightPayload;
  try {
    const stats = await loadAttemptStats(args.attemptId);
    if (!stats) throw new Error("attempt_not_found");

    const ranked = rankTopics(stats.topicStats);
    const prompts = buildInsightPrompt({
      locale: args.locale,
      totalScore: stats.totalScore,
      passingStatus: stats.passingStatus,
      scoreTWK: stats.scoreTWK,
      scoreTIU: stats.scoreTIU,
      scoreTKP: stats.scoreTKP,
      strengths: ranked.strengths,
      weaknesses: ranked.weaknesses,
    });

    const llm = await callInsightLlm(prompts);

    // Pair LLM-authored suggestions back with the deterministic weakness rows.
    const weaknesses: InsightTopicWeakness[] = ranked.weaknesses.map(
      (w, i) => ({ ...w, suggestion: llm.weakness_suggestions[i] ?? "" }),
    );

    payload = {
      version: 1,
      locale: args.locale,
      summary: llm.summary,
      strengths: ranked.strengths,
      weaknesses,
      recommendations: llm.recommendations,
      generatedAt: new Date().toISOString(),
    };

    await prisma.attempt.update({
      where: { id: args.attemptId },
      data: {
        aiInsight: payload as unknown as object,
        insightStatus: "READY",
        insightAt: new Date(),
      },
    });
  } catch (err) {
    console.error("[insight] generation failed", args.attemptId, err);
    await prisma.attempt.update({
      where: { id: args.attemptId },
      data: { insightStatus: "FAILED", insightAt: new Date() },
    });
    throw err;
  }

  return payload;
}

/** Read-only helper for the result page. */
export async function getInsight(
  attemptId: string,
): Promise<{
  payload: InsightPayload | null;
  status: string | null;
}> {
  const row = await prisma.attempt.findUnique({
    where: { id: attemptId },
    select: { aiInsight: true, insightStatus: true },
  });
  if (!row) return { payload: null, status: null };
  return {
    payload: (row.aiInsight as unknown as InsightPayload) ?? null,
    status: row.insightStatus,
  };
}
