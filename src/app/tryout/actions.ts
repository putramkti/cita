"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getServiceClient } from "@/utils/supabase/admin"
import { createClient as createServerSupabase } from "@/utils/supabase/server"
import {
  makeId,
  sampleStratified,
  scoreAnswer,
  summarizeAttempt,
} from "@/lib/tryout"
import { tsToMs } from "@/lib/time"
import type { Question } from "@/lib/types"

const ANON_COOKIE = "cita_anon_id"

/**
 * Get or create an anonymous user id stored in a cookie.
 * Hybrid auth: real Supabase auth users use auth.uid(); guests use this cookie.
 */
async function getOrCreateAnonUserId(): Promise<string> {
  const { cookies } = await import("next/headers")
  const cookieStore = await cookies()
  const existing = cookieStore.get(ANON_COOKIE)?.value
  if (existing) return existing

  const id = makeId("anon")
  // Insert into users via service role (RLS-bypass)
  const sb = getServiceClient()
  const now = new Date().toISOString()
  const { error } = await sb.from("users").insert({
    id,
    isAnonymous: true,
    createdAt: now,
    updatedAt: now,
  })
  if (error) {
    console.error("Failed to create anon user:", error)
    throw new Error("Gagal membuat sesi tryout. Coba refresh ya.")
  }
  cookieStore.set(ANON_COOKIE, id, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    httpOnly: true,
  })
  return id
}

/**
 * Start a new tryout attempt.
 * - Picks 30 questions stratified across TWK/TIU/TKP
 * - Persists Attempt row + 30 AttemptItem rows (one per question)
 * - Redirects to /tryout/<attemptId>
 */
export async function startTryout() {
  const userId = await getOrCreateAnonUserId()
  const sb = getServiceClient()

  // Pull all available questions
  const { data: pool, error: qErr } = await sb
    .from("questions")
    .select(
      "id, category, subcategory, questionText, options, correctAnswer, optionWeights, difficulty, explanation, source, createdAt",
    )
  if (qErr || !pool || pool.length === 0) {
    console.error("Question pool fetch error:", qErr)
    throw new Error("Belum ada soal tersedia. Coba lagi nanti.")
  }

  const selected = sampleStratified(pool as unknown as Question[])

  const attemptId = makeId("at")
  const now = new Date().toISOString()
  const { error: aErr } = await sb.from("attempts").insert({
    id: attemptId,
    userId,
    status: "IN_PROGRESS",
    startedAt: now,
  })
  if (aErr) {
    console.error("Attempt insert error:", aErr)
    throw new Error("Gagal memulai tryout. Coba lagi ya.")
  }

  const items = selected.map((q) => ({
    id: makeId("ai"),
    attemptId,
    questionId: q.id,
    userAnswer: null,
    isCorrect: null,
    scoreEarned: 0,
  }))
  const { error: iErr } = await sb.from("attempt_items").insert(items)
  if (iErr) {
    console.error("AttemptItems insert error:", iErr)
    throw new Error("Gagal menyiapkan soal. Coba lagi ya.")
  }

  redirect(`/tryout/${attemptId}`)
}

/** Submit a single answer (autosave). Returns nothing — fire-and-forget. */
export async function answerQuestion(
  attemptId: string,
  questionId: string,
  userAnswer: string | null,
  timeSpentMs: number,
) {
  const sb = getServiceClient()

  const { data: q, error: qErr } = await sb
    .from("questions")
    .select("category, correctAnswer, optionWeights")
    .eq("id", questionId)
    .single()
  if (qErr || !q) return

  const { earned, isCorrect } = scoreAnswer(
    q as unknown as Pick<
      Question,
      "category" | "correctAnswer" | "optionWeights"
    >,
    userAnswer,
  )

  await sb
    .from("attempt_items")
    .update({
      userAnswer,
      isCorrect,
      scoreEarned: earned,
      timeSpentMs,
      answeredAt: new Date().toISOString(),
    })
    .eq("attemptId", attemptId)
    .eq("questionId", questionId)
}

/** Finalize the attempt and compute totals. Idempotent. */
export async function submitTryout(attemptId: string) {
  const sb = getServiceClient()

  // Already submitted? skip.
  const { data: existing } = await sb
    .from("attempts")
    .select("status, startedAt")
    .eq("id", attemptId)
    .single()
  if (!existing) {
    redirect("/tryout")
  }
  if (existing.status === "SUBMITTED") {
    redirect(`/tryout/${attemptId}/result`)
  }

  // Pull all answer rows + question meta to compute scores
  const { data: rows, error } = await sb
    .from("attempt_items")
    .select(
      "id, attemptId, questionId, userAnswer, isCorrect, scoreEarned, timeSpentMs, answeredAt, question:questions(id, category, correctAnswer, optionWeights)",
    )
    .eq("attemptId", attemptId)
  if (error || !rows) {
    throw new Error("Gagal memuat jawaban.")
  }

  // Type plumbing: supabase typed `question` as array; we want object.
  type Row = (typeof rows)[number] & {
    question: { id: string; category: "TWK" | "TIU" | "TKP"; correctAnswer: string; optionWeights: Record<string, number> | null } | null
  }
  const items = (rows as unknown as Row[]).map((r) => ({
    id: r.id,
    attemptId: r.attemptId,
    questionId: r.questionId,
    userAnswer: r.userAnswer,
    isCorrect: r.isCorrect,
    scoreEarned: r.scoreEarned,
    timeSpentMs: r.timeSpentMs,
    answeredAt: r.answeredAt,
    question: r.question
      ? {
          id: r.question.id,
          category: r.question.category,
          subcategory: "",
          questionText: "",
          options: [],
          correctAnswer: r.question.correctAnswer,
          optionWeights: r.question.optionWeights,
          difficulty: 0,
          explanation: null,
          source: "",
          createdAt: "",
        }
      : undefined,
  }))

  const summary = summarizeAttempt(items)

  const startedAt = tsToMs(existing.startedAt)
  const finishedAt = Date.now()
  const durationSec = Math.round((finishedAt - startedAt) / 1000)

  await sb
    .from("attempts")
    .update({
      status: "SUBMITTED",
      finishedAt: new Date(finishedAt).toISOString(),
      durationSec,
      scoreTWK: summary.scoreTWK,
      scoreTIU: summary.scoreTIU,
      scoreTKP: summary.scoreTKP,
      totalScore: summary.totalScore,
      passingStatus: summary.passingStatus,
    })
    .eq("id", attemptId)

  revalidatePath(`/tryout/${attemptId}`)
  redirect(`/tryout/${attemptId}/result`)
}

// Currently unused helper — kept for future auth integration.
export async function getCurrentUserId(): Promise<string> {
  const sb = await createServerSupabase()
  const { data } = await sb.auth.getUser()
  return data.user?.id ?? (await getOrCreateAnonUserId())
}
