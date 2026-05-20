import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { ArrowLeft, Sparkles } from "lucide-react"
import { cookies } from "next/headers"
import { getServiceClient } from "@/utils/supabase/admin"
import { SiteHeader } from "@/components/layout/site-header"
import { Badge } from "@/components/ui/badge"
import { TutorChat } from "./tutor-chat"
import type { AttemptItem, Category, Question } from "@/lib/types"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{ attemptId: string; questionId: string }>
}

export default async function StudyPage({ params }: PageProps) {
  const { attemptId, questionId } = await params

  // Auth: must own the attempt via cookie
  const cookieStore = await cookies()
  const userId = cookieStore.get("cita_anon_id")?.value
  if (!userId) {
    redirect(`/tryout`)
  }

  const sb = getServiceClient()

  const { data: attempt } = await sb
    .from("attempts")
    .select("id, userId, status")
    .eq("id", attemptId)
    .single()

  if (!attempt) notFound()
  if (attempt.userId !== userId) {
    redirect("/tryout")
  }
  if (attempt.status !== "SUBMITTED") {
    // Tutor only after submit
    redirect(`/tryout/${attemptId}`)
  }

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

  // Load existing chat history
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

  // Find this question's index in the attempt for nav
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
        <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
          <div className="mb-5 flex items-center justify-between gap-3 flex-wrap">
            <Link
              href={`/tryout/${attemptId}/result`}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-4" />
              Kembali ke hasil
            </Link>
            <div className="flex items-center gap-2">
              {prevQ && (
                <Link
                  href={`/study/${attemptId}/${prevQ}`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2"
                >
                  ← Soal sebelumnya
                </Link>
              )}
              {nextQ && (
                <Link
                  href={`/study/${attemptId}/${nextQ}`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2"
                >
                  Soal selanjutnya →
                </Link>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
            {/* LEFT: Question recap */}
            <section className="lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto pr-1">
              <div className="space-y-5">
                <div className="flex items-center gap-2 text-xs">
                  <CategoryBadge category={question.category} />
                  <span className="text-muted-foreground">{question.subcategory}</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground">Tingkat {question.difficulty}/5</span>
                </div>

                <h1 className="text-xl sm:text-2xl font-semibold leading-relaxed">
                  {question.questionText}
                </h1>

                <ul className="space-y-2">
                  {question.options.map((opt) => {
                    const userPicked = item.userAnswer === opt.label
                    const isAnsKey = opt.label === question.correctAnswer
                    const weight =
                      question.category === "TKP" && question.optionWeights
                        ? question.optionWeights[opt.label]
                        : null
                    return (
                      <li
                        key={opt.label}
                        className={cn(
                          "flex gap-3 rounded-md border px-3 py-2 text-sm",
                          isAnsKey
                            ? "border-emerald-500/40 bg-emerald-500/5"
                            : userPicked
                              ? "border-amber-500/40 bg-amber-500/5"
                              : "border-border/40",
                        )}
                      >
                        <span
                          className={cn(
                            "shrink-0 inline-flex items-center justify-center size-6 rounded text-xs font-semibold",
                            isAnsKey
                              ? "bg-emerald-500/20 text-emerald-300"
                              : userPicked
                                ? "bg-amber-500/20 text-amber-300"
                                : "bg-muted text-muted-foreground",
                          )}
                        >
                          {opt.label}
                        </span>
                        <span className="flex-1 leading-relaxed pt-0.5">{opt.text}</span>
                        <span className="text-xs text-muted-foreground shrink-0 pt-1">
                          {weight !== null && <span>bobot {weight}</span>}
                          {userPicked && !isAnsKey && (
                            <span className="ml-2">jawaban lo</span>
                          )}
                          {isAnsKey && <span className="ml-2">kunci</span>}
                        </span>
                      </li>
                    )
                  })}
                </ul>

                {question.explanation && (
                  <div className="rounded-md border border-primary/20 bg-primary/5 p-4 text-sm leading-relaxed">
                    <div className="flex items-center gap-1.5 text-primary mb-2 text-xs uppercase tracking-widest font-semibold">
                      <Sparkles className="size-3.5" />
                      Penjelasan dasar
                    </div>
                    <p className="text-foreground/90">{question.explanation}</p>
                  </div>
                )}
              </div>
            </section>

            {/* RIGHT: Tutor chat */}
            <section className="min-h-[60vh]">
              <TutorChat
                attemptId={attemptId}
                questionId={questionId}
                initialMessages={initialMessages}
                initialUserMsgCount={userMsgCount}
                maxUserMsgs={5}
              />
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}

function CategoryBadge({ category }: { category: Category }) {
  const tone =
    category === "TWK"
      ? "bg-sky-500/15 text-sky-300 border-sky-500/30"
      : category === "TIU"
        ? "bg-violet-500/15 text-violet-300 border-violet-500/30"
        : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
  return (
    <Badge variant="outline" className={cn("text-[10px] font-semibold", tone)}>
      {category}
    </Badge>
  )
}
