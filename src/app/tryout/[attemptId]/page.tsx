import { notFound, redirect } from "next/navigation"
import { getServiceClient } from "@/utils/supabase/admin"
import { SiteHeader } from "@/components/layout/site-header"
import { TRYOUT_CONFIG } from "@/lib/types"
import type { AttemptItem, Question } from "@/lib/types"
import { tsToMs } from "@/lib/time"
import { TryoutClient } from "./tryout-client"

export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{ attemptId: string }>
}

export default async function TryoutPage({ params }: PageProps) {
  const { attemptId } = await params
  const sb = getServiceClient()

  const { data: attempt, error: aErr } = await sb
    .from("attempts")
    .select("id, status, startedAt, finishedAt, durationSec")
    .eq("id", attemptId)
    .single()

  if (aErr || !attempt) notFound()
  if (attempt.status === "SUBMITTED") {
    redirect(`/tryout/${attemptId}/result`)
  }

  // Check if expired by clock
  const startedAt = tsToMs(attempt.startedAt)
  const elapsedSec = Math.floor((Date.now() - startedAt) / 1000)
  const remainingSec = TRYOUT_CONFIG.duration_min * 60 - elapsedSec
  if (remainingSec <= 0) {
    redirect(`/tryout/${attemptId}/result`)
  }

  const { data: items, error: iErr } = await sb
    .from("attempt_items")
    .select(
      "id, attemptId, questionId, userAnswer, isCorrect, scoreEarned, timeSpentMs, answeredAt, question:questions(id, category, subcategory, questionText, options, correctAnswer, optionWeights, difficulty, explanation, source, createdAt)",
    )
    .eq("attemptId", attemptId)

  if (iErr || !items || items.length === 0) {
    throw new Error("Gagal memuat soal: " + (iErr?.message ?? "kosong"))
  }

  // Sort items in stable order: TWK -> TIU -> TKP, then by id
  type Row = (typeof items)[number] & {
    question: Question | Question[] | null
  }
  const normalized: AttemptItem[] = (items as unknown as Row[]).map((r) => ({
    id: r.id,
    attemptId: r.attemptId,
    questionId: r.questionId,
    userAnswer: r.userAnswer ?? null,
    isCorrect: r.isCorrect ?? null,
    scoreEarned: r.scoreEarned ?? 0,
    timeSpentMs: r.timeSpentMs ?? null,
    answeredAt: r.answeredAt ?? null,
    question: Array.isArray(r.question) ? r.question[0] : r.question ?? undefined,
  }))

  const catOrder = { TWK: 0, TIU: 1, TKP: 2 } as const
  normalized.sort((a, b) => {
    const av = a.question ? catOrder[a.question.category] : 99
    const bv = b.question ? catOrder[b.question.category] : 99
    if (av !== bv) return av - bv
    return a.id.localeCompare(b.id)
  })

  return (
    <>
      <SiteHeader />
      <TryoutClient
        attemptId={attemptId}
        items={normalized}
        startedAt={startedAt}
        durationMin={TRYOUT_CONFIG.duration_min}
      />
    </>
  )
}
