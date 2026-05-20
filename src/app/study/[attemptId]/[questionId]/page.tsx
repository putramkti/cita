import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { ArrowLeft, ArrowRight, Lightbulb, Check } from "lucide-react"
import { cookies } from "next/headers"
import { getServiceClient } from "@/utils/supabase/admin"
import { SiteHeader } from "@/components/layout/site-header"
import { TutorChat } from "./tutor-chat"
import type { AttemptItem, Category, Question } from "@/lib/types"
import { cn } from "@/lib/utils"
import { getDict } from "@/lib/i18n"

export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{ attemptId: string; questionId: string }>
}

const CATEGORY_NAMES: Record<Category, { id: string; en: string }> = {
  TWK: {
    id: "Tes Wawasan Kebangsaan",
    en: "National Insight Test",
  },
  TIU: {
    id: "Tes Intelegensi Umum",
    en: "General Intelligence Test",
  },
  TKP: {
    id: "Tes Karakteristik Pribadi",
    en: "Personality Test",
  },
}

export default async function StudyPage({ params }: PageProps) {
  const { attemptId, questionId } = await params
  const t = await getDict()

  // Auth: must own the attempt via cookie
  const cookieStore = await cookies()
  const userId = cookieStore.get("cita_anon_id")?.value
  if (!userId) redirect(`/tryout`)

  const sb = getServiceClient()

  const { data: attempt } = await sb
    .from("attempts")
    .select("id, userId, status")
    .eq("id", attemptId)
    .single()

  if (!attempt) notFound()
  if (attempt.userId !== userId) redirect("/tryout")
  if (attempt.status !== "SUBMITTED") redirect(`/tryout/${attemptId}`)

  // Load attempt item + question
  const { data: itemRaw } = await sb
    .from("attempt_items")
    .select(
      "id, attemptId, questionId, userAnswer, isCorrect, scoreEarned, question:questions(id, category, subcategory, questionText, options, correctAnswer, optionWeights, difficulty, explanation, source, createdAt)",
    )
    .eq("attemptId", attemptId)
    .eq("questionId", questionId)
    .single()

  if (!itemRaw) notFound()

  const item = itemRaw as unknown as AttemptItem & {
    question: Question | Question[] | null
  }
  const question: Question | null = Array.isArray(item.question)
    ? item.question[0]
    : item.question ?? null

  if (!question) notFound()

  // Chat history
  const { data: msgsRaw } = await sb
    .from("explainer_messages")
    .select("id, role, content, createdAt")
    .eq("attemptId", attemptId)
    .eq("questionId", questionId)
    .order("createdAt", { ascending: true })

  const initialMessages = (msgsRaw ?? []).map((m) => ({
    id: m.id as string,
    role: m.role as "user" | "assistant",
    content: m.content as string,
  }))
  const userMsgCount = initialMessages.filter((m) => m.role === "user").length

  // Find this question's index for prev/next nav
  const { data: allItems } = await sb
    .from("attempt_items")
    .select("questionId, question:questions(category)")
    .eq("attemptId", attemptId)

  const ordered = (allItems ?? []) as Array<{
    questionId: string
    question: { category: Category } | { category: Category }[] | null
  }>
  const catOrder = { TWK: 0, TIU: 1, TKP: 2 } as const
  ordered.sort((a, b) => {
    const ca = Array.isArray(a.question) ? a.question[0]?.category : a.question?.category
    const cb = Array.isArray(b.question) ? b.question[0]?.category : b.question?.category
    const av = ca ? catOrder[ca] : 99
    const bv = cb ? catOrder[cb] : 99
    if (av !== bv) return av - bv
    return a.questionId.localeCompare(b.questionId)
  })
  const idx = ordered.findIndex((it) => it.questionId === questionId)
  const prevQ = idx > 0 ? ordered[idx - 1].questionId : null
  const nextQ = idx >= 0 && idx < ordered.length - 1 ? ordered[idx + 1].questionId : null

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-8 py-6 sm:py-10">
          {/* Top nav row */}
          <div className="mb-8 flex items-center justify-between gap-3 flex-wrap">
            <Link
              href={`/tryout/${attemptId}/result`}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-4" strokeWidth={1.5} />
              {t.study.backToResult}
            </Link>
            <div className="flex items-center gap-1">
              {prevQ && (
                <Link
                  href={`/study/${attemptId}/${prevQ}`}
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5"
                >
                  <ArrowLeft className="size-3.5" strokeWidth={1.5} />
                  {t.study.prevQuestion}
                </Link>
              )}
              {nextQ && (
                <Link
                  href={`/study/${attemptId}/${nextQ}`}
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5"
                >
                  {t.study.nextQuestion}
                  <ArrowRight className="size-3.5" strokeWidth={1.5} />
                </Link>
              )}
            </div>
          </div>

          {/* 2-col split */}
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-10">
            {/* LEFT: Question recap */}
            <section className="lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto pr-1">
              <p className="label-caps mb-3">
                {t.locale === "en" ? "QUESTION RECAP" : "RINGKASAN SOAL"}
              </p>
              <h1 className="serif text-3xl text-foreground leading-tight mb-1.5">
                {CATEGORY_NAMES[question.category][t.locale]} ({question.category})
              </h1>
              <p className="text-sm text-muted-foreground mb-7">
                {t.locale === "en" ? "Topic" : "Topik"}: {question.subcategory}
              </p>

              <article className="rounded-xl border border-border bg-card p-6 sm:p-7 mb-6">
                <p className="serif text-xl leading-relaxed text-foreground mb-7">
                  {question.questionText}
                </p>

                <ul className="space-y-2.5">
                  {question.options.map((opt) => {
                    const userPicked = item.userAnswer === opt.label
                    const isAnsKey = opt.label === question.correctAnswer
                    return (
                      <li key={opt.label}>
                        <div
                          className={cn(
                            "flex items-start gap-3 rounded-lg border px-3.5 py-3 text-sm",
                            isAnsKey
                              ? "border-foreground bg-foreground/[0.04]"
                              : userPicked
                                ? "border-destructive/40 bg-[var(--error-soft)]"
                                : "border-border",
                          )}
                        >
                          <span
                            className={cn(
                              "shrink-0 inline-flex items-center justify-center size-7 rounded-md text-xs font-semibold border",
                              isAnsKey
                                ? "bg-primary text-primary-foreground border-primary"
                                : userPicked
                                  ? "bg-card text-foreground border-border"
                                  : "bg-card text-muted-foreground border-border",
                            )}
                          >
                            {opt.label}
                          </span>
                          <span className="flex-1 leading-relaxed pt-0.5 text-foreground/90">
                            {opt.text}
                          </span>
                          {isAnsKey && (
                            <Check
                              className="size-4 text-foreground shrink-0 mt-1"
                              strokeWidth={2}
                            />
                          )}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </article>

              {question.explanation && (
                <div className="rounded-xl border border-[var(--gold)]/40 bg-[var(--review-amber)] px-5 py-4 flex gap-3">
                  <Lightbulb
                    className="size-5 shrink-0 text-[var(--review-amber-fg)] mt-0.5"
                    strokeWidth={1.5}
                  />
                  <p className="text-sm italic leading-relaxed text-[var(--review-amber-fg)]">
                    {question.explanation}
                  </p>
                </div>
              )}
            </section>

            {/* RIGHT: Tutor chat */}
            <section className="min-h-[60vh]">
              <TutorChat
                attemptId={attemptId}
                questionId={questionId}
                initialMessages={initialMessages}
                initialUserMsgCount={userMsgCount}
                maxUserMsgs={5}
                dict={t.study}
              />
              <p className="mt-3 text-center text-xs text-muted-foreground">
                {t.locale === "en"
                  ? "Cita AI can make mistakes. Verify important information with the official syllabus."
                  : "Cita AI dapat keliru. Mohon validasi informasi penting dengan silabus resmi."}
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
