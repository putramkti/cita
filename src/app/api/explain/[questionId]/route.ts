/**
 * POST /api/explain/[questionId]
 *
 * Cita Tutor — streaming chat endpoint that proxies to a 9router
 * OpenAI-compatible LLM. Authenticated via the anon cookie.
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

import { NextRequest } from "next/server"
import { cookies } from "next/headers"
import { getServiceClient } from "@/utils/supabase/admin"
import { buildSystemPrompt, sanitizeUserInput, type TutorLocale } from "@/lib/tutor"
import { makeId } from "@/lib/tryout"
import { LOCALE_COOKIE, SUPPORTED_LOCALES, DEFAULT_LOCALE } from "@/lib/i18n"
import type { Question } from "@/lib/types"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const ANON_COOKIE = "cita_anon_id"
const MAX_USER_MSGS_PER_QUESTION = 5

interface ExplainRequest {
  attemptId: string
  prompt: string
}

function jsonError(status: number, message: string, code?: string) {
  return new Response(JSON.stringify({ error: { message, code } }), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ questionId: string }> },
) {
  const { questionId } = await params

  // Auth: must have anon cookie
  const cookieStore = await cookies()
  const userId = cookieStore.get(ANON_COOKIE)?.value
  if (!userId) {
    return jsonError(401, "Mulai tryout dulu sebelum tanya tutor.", "no_session")
  }

  // Parse body
  let body: ExplainRequest
  try {
    body = (await request.json()) as ExplainRequest
  } catch {
    return jsonError(400, "Body tidak valid (harus JSON).", "invalid_body")
  }

  const attemptId = body?.attemptId?.trim()
  const promptRaw = body?.prompt
  if (!attemptId || typeof promptRaw !== "string") {
    return jsonError(400, "attemptId dan prompt wajib.", "missing_fields")
  }

  const prompt = sanitizeUserInput(promptRaw, 500)
  if (!prompt) {
    return jsonError(400, "Pertanyaan kosong.", "empty_prompt")
  }

  const sb = getServiceClient()

  // Verify attempt belongs to this user
  const { data: attempt } = await sb
    .from("attempts")
    .select("id, userId, status")
    .eq("id", attemptId)
    .single()

  if (!attempt) {
    return jsonError(404, "Attempt tidak ditemukan.", "attempt_not_found")
  }
  if (attempt.userId !== userId) {
    return jsonError(403, "Akses ditolak.", "wrong_owner")
  }

  // Verify attempt has this question
  const { data: attemptItem } = await sb
    .from("attempt_items")
    .select("id, questionId, userAnswer, isCorrect, scoreEarned")
    .eq("attemptId", attemptId)
    .eq("questionId", questionId)
    .single()

  if (!attemptItem) {
    return jsonError(404, "Soal tidak ada di attempt ini.", "question_not_in_attempt")
  }

  // Load full question
  const { data: question } = await sb
    .from("questions")
    .select(
      "id, category, subcategory, questionText, options, correctAnswer, optionWeights, difficulty, explanation, source, createdAt",
    )
    .eq("id", questionId)
    .single()

  if (!question) {
    return jsonError(404, "Soal tidak ditemukan.", "question_not_found")
  }

  // Count user messages so far for this (attempt, question)
  const { count: userMsgCount } = await sb
    .from("explainer_messages")
    .select("id", { count: "exact", head: true })
    .eq("attemptId", attemptId)
    .eq("questionId", questionId)
    .eq("role", "user")

  if ((userMsgCount ?? 0) >= MAX_USER_MSGS_PER_QUESTION) {
    return jsonError(
      429,
      `Batas ${MAX_USER_MSGS_PER_QUESTION} pertanyaan per soal sudah tercapai.`,
      "limit_reached",
    )
  }

  // Load chat history for this question
  const { data: historyRows } = await sb
    .from("explainer_messages")
    .select("role, content")
    .eq("attemptId", attemptId)
    .eq("questionId", questionId)
    .order("createdAt", { ascending: true })

  const history = (historyRows ?? []) as Array<{ role: string; content: string }>

  // Read locale from cookie (default id)
  const localeCookie = cookieStore.get(LOCALE_COOKIE)?.value
  const locale: TutorLocale =
    localeCookie && (SUPPORTED_LOCALES as readonly string[]).includes(localeCookie)
      ? (localeCookie as TutorLocale)
      : (DEFAULT_LOCALE as TutorLocale)

  // Build messages for LLM
  const systemPrompt = buildSystemPrompt({
    question: question as Question,
    userAnswer: attemptItem.userAnswer ?? null,
    isCorrect: attemptItem.isCorrect ?? null,
    scoreEarned: attemptItem.scoreEarned ?? 0,
    locale,
  })

  const messages = [
    { role: "system", content: systemPrompt },
    ...history.map((h) => ({ role: h.role, content: h.content })),
    { role: "user", content: prompt },
  ]

  // Save user message immediately (so it persists even if AI fails)
  const userMsgId = makeId("em")
  await sb.from("explainer_messages").insert({
    id: userMsgId,
    attemptId,
    questionId,
    role: "user",
    content: prompt,
  })

  // Forward to LLM with streaming
  const apiBase = process.env.EXPLAINER_API_BASE
  const apiKey = process.env.EXPLAINER_API_KEY
  const model = process.env.EXPLAINER_MODEL || "kr/claude-haiku-4.5"

  if (!apiBase || !apiKey) {
    return jsonError(503, "Tutor belum dikonfigurasi.", "missing_env")
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
  })

  if (!llmResp.ok || !llmResp.body) {
    const errText = await llmResp.text().catch(() => "")
    console.error("LLM upstream error:", llmResp.status, errText.slice(0, 300))
    return jsonError(502, "Tutor lagi sibuk, coba lagi sebentar.", "upstream_error")
  }

  // Pipe SSE through, accumulating the full response so we can save it.
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()
  let fullContent = ""
  let buffer = ""

  const stream = new ReadableStream({
    async start(controller) {
      const reader = llmResp.body!.getReader()
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          buffer += chunk

          // Split by SSE event boundary "\n\n"
          const events = buffer.split(/\r?\n\r?\n/)
          buffer = events.pop() ?? "" // keep last incomplete event

          for (const ev of events) {
            const lines = ev.split(/\r?\n/)
            for (const line of lines) {
              if (!line.startsWith("data:")) continue
              const dataStr = line.slice(5).trim()
              if (dataStr === "[DONE]") {
                // pass through to client too
                controller.enqueue(encoder.encode("data: [DONE]\n\n"))
                continue
              }
              if (!dataStr) continue
              try {
                const json = JSON.parse(dataStr) as {
                  choices?: Array<{
                    delta?: { content?: string }
                  }>
                }
                const piece = json.choices?.[0]?.delta?.content ?? ""
                if (piece) {
                  fullContent += piece
                  // Forward as a simpler delta to client
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ delta: piece })}\n\n`),
                  )
                }
              } catch {
                // ignore malformed event
              }
            }
          }
        }

        // Persist assistant message after stream ends
        if (fullContent.trim()) {
            const aMsgId = makeId("em")
          try {
            await sb.from("explainer_messages").insert({
              id: aMsgId,
              attemptId,
              questionId,
              role: "assistant",
              content: fullContent,
            })
          } catch (e) {
            console.error("failed to save assistant msg", e)
          }
        }
      } catch (e) {
        console.error("stream error", e)
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}

/**
 * GET — list chat history for a (attemptId, questionId).
 * Query: ?attemptId=...
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ questionId: string }> },
) {
  const { questionId } = await params
  const url = new URL(request.url)
  const attemptId = url.searchParams.get("attemptId")
  if (!attemptId) return jsonError(400, "attemptId required", "missing_field")

  const cookieStore = await cookies()
  const userId = cookieStore.get(ANON_COOKIE)?.value
  if (!userId) return jsonError(401, "no session", "no_session")

  const sb = getServiceClient()

  const { data: attempt } = await sb
    .from("attempts")
    .select("userId")
    .eq("id", attemptId)
    .single()
  if (!attempt) return jsonError(404, "attempt not found", "attempt_not_found")
  if (attempt.userId !== userId) return jsonError(403, "forbidden", "wrong_owner")

  const { data: msgs } = await sb
    .from("explainer_messages")
    .select("id, role, content, createdAt")
    .eq("attemptId", attemptId)
    .eq("questionId", questionId)
    .order("createdAt", { ascending: true })

  const userMsgCount = (msgs ?? []).filter((m) => m.role === "user").length

  return new Response(
    JSON.stringify({
      messages: msgs ?? [],
      userMsgCount,
      maxUserMsgs: MAX_USER_MSGS_PER_QUESTION,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  )
}
