/**
 * POST /api/explain/[questionId]
 *
 * Cita Tutor — streaming chat endpoint that proxies to a 9router
 * OpenAI-compatible LLM.
 *
 * Auth: dual-mode — Supabase user OR cita_anon_id cookie. Same
 * resolution as /tryout/[id]/result page.
 *
 * Body: { attemptId, prompt }
 * Returns: text/event-stream (SSE) — line-delimited "data: <chunk>\n\n",
 *          ending with "data: [DONE]\n\n"
 *
 * Limits:
 *   - max 5 user messages per (attemptId, questionId)
 *   - max 500 chars per prompt
 *   - server-side prompt construction; client never sees the system prompt
 */

import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/get-user";
import { getCurrentPlan } from "@/lib/billing/get-plan";
import { quota, can } from "@/lib/billing/entitlements";
import {
  checkTutorQuota,
  incrementTutorUsage,
} from "@/lib/billing/usage";
import {
  buildSystemPrompt,
  sanitizeUserInput,
  type TutorLocale,
} from "@/lib/tutor";
import {
  LOCALE_COOKIE,
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
} from "@/lib/i18n";
import type { Question } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ANON_COOKIE = "cita_anon_id";
// NOTE: Per-question rate limit removed in Phase 7. Replaced with per-user
// daily quota via `lib/billing/usage`. See entitlements for plan limits.

interface ExplainRequest {
  attemptId: string;
  prompt: string;
}

function jsonError(status: number, message: string, code?: string) {
  return new Response(JSON.stringify({ error: { message, code } }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Resolve viewer for tutor:
 *   - Authenticated Supabase user → use their internal Cita user.id (eligible for tutor)
 *   - Anonymous (cookie only)     → return { id: null, anonCookie: cookieVal }
 *
 * Tutor access requires authentication in Phase 7. Anon get the cookie
 * back so /api/explain can still answer 401 with a helpful message that
 * links to /auth/login.
 */
async function resolveViewer(): Promise<{
  citaUserId: string | null;
  isAnon: boolean;
}> {
  const supabaseUser = await getCurrentUser();
  if (supabaseUser?.id) return { citaUserId: supabaseUser.id, isAnon: false };
  const cookieStore = await cookies();
  const anon = cookieStore.get(ANON_COOKIE)?.value ?? null;
  return { citaUserId: null, isAnon: Boolean(anon) };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ questionId: string }> },
) {
  const { questionId } = await params;

  const { citaUserId, isAnon } = await resolveViewer();
  if (!citaUserId) {
    return jsonError(
      401,
      isAnon
        ? "Login dulu untuk pakai Cita Tutor."
        : "Mulai tryout dulu sebelum tanya tutor.",
      "no_session",
    );
  }

  // Plan + quota gate (replaces per-question rate limit)
  const plan = await getCurrentPlan(citaUserId);
  if (!can(plan, "tutorAccess")) {
    return jsonError(
      403,
      "Akses tutor tidak tersedia untuk paket Anda.",
      "no_tutor_access",
    );
  }
  const dailyLimit = quota(plan, "tutorDailyQuota");
  const quotaCheck = await checkTutorQuota(citaUserId, dailyLimit);
  if (!quotaCheck.allowed) {
    return new Response(
      JSON.stringify({
        error: {
          message: `Kuota tutor harian habis (${quotaCheck.used}/${quotaCheck.limit}). Reset besok atau upgrade Premium.`,
          code: "quota_exceeded",
          quota: quotaCheck,
          plan,
        },
      }),
      {
        status: 429,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  // Parse body
  let body: ExplainRequest;
  try {
    body = (await request.json()) as ExplainRequest;
  } catch {
    return jsonError(400, "Body tidak valid (harus JSON).", "invalid_body");
  }

  const attemptId = body?.attemptId?.trim();
  const promptRaw = body?.prompt;
  if (!attemptId || typeof promptRaw !== "string") {
    return jsonError(400, "attemptId dan prompt wajib.", "missing_fields");
  }

  const prompt = sanitizeUserInput(promptRaw, 500);
  if (!prompt) {
    return jsonError(400, "Pertanyaan kosong.", "empty_prompt");
  }

  // Load attempt + the targeted item + the question (single query).
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    select: {
      id: true,
      userId: true,
      status: true,
      items: {
        where: { questionId },
        select: {
          id: true,
          questionId: true,
          userAnswer: true,
          isCorrect: true,
          scoreEarned: true,
          question: {
            select: {
              id: true,
              category: true,
              subcategory: true,
              topic: true,
              questionText: true,
              options: true,
              correctAnswer: true,
              optionWeights: true,
              difficulty: true,
              explanation: true,
              source: true,
              createdAt: true,
            },
          },
        },
      },
    },
  });

  if (!attempt) {
    return jsonError(404, "Attempt tidak ditemukan.", "attempt_not_found");
  }
  if (attempt.userId !== citaUserId) {
    return jsonError(403, "Akses ditolak.", "wrong_owner");
  }

  const attemptItem = attempt.items[0];
  if (!attemptItem) {
    return jsonError(
      404,
      "Soal tidak ada di attempt ini.",
      "question_not_in_attempt",
    );
  }

  const questionRow = attemptItem.question;
  if (!questionRow) {
    return jsonError(404, "Soal tidak ditemukan.", "question_not_found");
  }

  // Cast Prisma row to legacy Question shape consumed by buildSystemPrompt.
  const question: Question = {
    id: questionRow.id,
    category: questionRow.category,
    subcategory: questionRow.subcategory,
    questionText: questionRow.questionText,
    options: questionRow.options as unknown as Question["options"],
    correctAnswer: questionRow.correctAnswer ?? "",
    optionWeights: (questionRow.optionWeights ?? null) as unknown as Question["optionWeights"],
    difficulty: questionRow.difficulty,
    explanation: questionRow.explanation ?? null,
    source: questionRow.source,
    createdAt:
      questionRow.createdAt instanceof Date
        ? questionRow.createdAt.toISOString()
        : (questionRow.createdAt as unknown as string),
  };

  // Per-question rate limit dropped in Phase 7 — daily quota enforced
  // earlier via checkTutorQuota. Increment counter now (before LLM call)
  // so a single user can't fan-out parallel tabs to bypass the gate.
  await incrementTutorUsage(citaUserId);

  // Load full chat history for context
  const historyRows = await prisma.explainerMessage.findMany({
    where: { attemptId, questionId },
    orderBy: { createdAt: "asc" },
    select: { role: true, content: true },
  });

  // Read locale cookie (default id)
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale: TutorLocale =
    localeCookie && (SUPPORTED_LOCALES as readonly string[]).includes(localeCookie)
      ? (localeCookie as TutorLocale)
      : (DEFAULT_LOCALE as TutorLocale);

  // Build chat array for LLM
  const systemPrompt = buildSystemPrompt({
    question,
    userAnswer: attemptItem.userAnswer ?? null,
    isCorrect: attemptItem.isCorrect ?? null,
    scoreEarned: attemptItem.scoreEarned ?? 0,
    locale,
  });

  const messages = [
    { role: "system", content: systemPrompt },
    ...historyRows.map((h) => ({ role: h.role, content: h.content })),
    { role: "user", content: prompt },
  ];

  // Persist user message immediately (so it stays even if LLM dies later)
  try {
    await prisma.explainerMessage.create({
      data: {
        attemptId,
        questionId,
        role: "user",
        content: prompt,
      },
    });
  } catch (e) {
    console.error("[tutor] failed to save user msg", e);
    return jsonError(500, "Gagal menyimpan pertanyaan.", "save_failed");
  }

  // Forward to LLM with streaming
  const apiBase = process.env.EXPLAINER_API_BASE;
  const apiKey = process.env.EXPLAINER_API_KEY;
  const model = process.env.EXPLAINER_MODEL || "kr/claude-haiku-4.5";

  if (!apiBase || !apiKey) {
    return jsonError(503, "Tutor belum dikonfigurasi.", "missing_env");
  }

  const llmResp = await fetch(`${apiBase}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      max_tokens: 600,
      temperature: 0.7,
    }),
  });

  if (!llmResp.ok || !llmResp.body) {
    const errText = await llmResp.text().catch(() => "");
    console.error(
      "[tutor] LLM upstream error:",
      llmResp.status,
      errText.slice(0, 300),
    );
    return jsonError(
      502,
      "Tutor lagi sibuk, coba lagi sebentar.",
      "upstream_error",
    );
  }

  // Pipe SSE through, accumulating the full response so we can save it.
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let fullContent = "";
  let buffer = "";

  const stream = new ReadableStream({
    async start(controller) {
      const reader = llmResp.body!.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          const events = buffer.split(/\r?\n\r?\n/);
          buffer = events.pop() ?? "";

          for (const ev of events) {
            const lines = ev.split(/\r?\n/);
            for (const line of lines) {
              if (!line.startsWith("data:")) continue;
              const dataStr = line.slice(5).trim();
              if (dataStr === "[DONE]") {
                controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                continue;
              }
              if (!dataStr) continue;
              try {
                const json = JSON.parse(dataStr) as {
                  choices?: Array<{
                    delta?: { content?: string };
                  }>;
                };
                const piece = json.choices?.[0]?.delta?.content ?? "";
                if (piece) {
                  fullContent += piece;
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({ delta: piece })}\n\n`,
                    ),
                  );
                }
              } catch {
                // ignore malformed event
              }
            }
          }
        }

        // Persist assistant message after stream ends
        if (fullContent.trim()) {
          try {
            await prisma.explainerMessage.create({
              data: {
                attemptId,
                questionId,
                role: "assistant",
                content: fullContent,
              },
            });
          } catch (e) {
            console.error("[tutor] failed to save assistant msg", e);
          }
        }
      } catch (e) {
        console.error("[tutor] stream error", e);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

/**
 * GET — list chat history for a (attemptId, questionId).
 * Query: ?attemptId=...
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ questionId: string }> },
) {
  const { questionId } = await params;
  const url = new URL(request.url);
  const attemptId = url.searchParams.get("attemptId");
  if (!attemptId) return jsonError(400, "attemptId required", "missing_field");

  const { citaUserId } = await resolveViewer();
  if (!citaUserId) return jsonError(401, "no session", "no_session");

  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    select: { userId: true },
  });
  if (!attempt) return jsonError(404, "attempt not found", "attempt_not_found");
  if (attempt.userId !== citaUserId)
    return jsonError(403, "forbidden", "wrong_owner");

  const msgs = await prisma.explainerMessage.findMany({
    where: { attemptId, questionId },
    orderBy: { createdAt: "asc" },
    select: { id: true, role: true, content: true, createdAt: true },
  });

  // Daily quota progress (replaces per-question maxUserMsgs)
  const plan = await getCurrentPlan(citaUserId);
  const dailyLimit = quota(plan, "tutorDailyQuota");
  const quotaCheck = await checkTutorQuota(citaUserId, dailyLimit);

  return new Response(
    JSON.stringify({
      messages: msgs,
      // Legacy field retained for client compat — now populated from
      // today's per-account counter, not per-question count.
      userMsgCount: quotaCheck.used,
      maxUserMsgs: quotaCheck.limit,
      dailyQuota: quotaCheck,
      plan,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}
