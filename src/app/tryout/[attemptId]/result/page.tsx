import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { CheckCircle2, XCircle, Sparkles, Clock } from "lucide-react"
import { getServiceClient } from "@/utils/supabase/admin"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TRYOUT_CONFIG } from "@/lib/types"
import type { AttemptItem, Category, Question } from "@/lib/types"
import { formatDuration } from "@/lib/tryout"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{ attemptId: string }>
}

interface ResultRow {
  cat: Category
  scored: number
  max: number
  pass: boolean
  passing: number
}

export default async function ResultPage({ params }: PageProps) {
  const { attemptId } = await params
  const sb = getServiceClient()

  const { data: attempt } = await sb
    .from("attempts")
    .select(
      "id, status, startedAt, finishedAt, durationSec, scoreTWK, scoreTIU, scoreTKP, totalScore, passingStatus",
    )
    .eq("id", attemptId)
    .single()

  if (!attempt) notFound()

  // If still in progress, push back to tryout
  if (attempt.status !== "SUBMITTED") {
    redirect(`/tryout/${attemptId}`)
  }

  const { data: rawItems } = await sb
    .from("attempt_items")
    .select(
      "id, attemptId, questionId, userAnswer, isCorrect, scoreEarned, timeSpentMs, answeredAt, question:questions(id, category, subcategory, questionText, options, correctAnswer, optionWeights, difficulty, explanation, source, createdAt)",
    )
    .eq("attemptId", attemptId)

  const items: AttemptItem[] = ((rawItems ?? []) as unknown as Array<
    AttemptItem & { question: Question | Question[] | null }
  >).map((r) => ({
    ...r,
    question: Array.isArray(r.question) ? r.question[0] : r.question ?? undefined,
  }))

  const catOrder = { TWK: 0, TIU: 1, TKP: 2 } as const
  items.sort((a, b) => {
    const av = a.question ? catOrder[a.question.category] : 99
    const bv = b.question ? catOrder[b.question.category] : 99
    if (av !== bv) return av - bv
    return a.id.localeCompare(b.id)
  })

  const passing = TRYOUT_CONFIG.passing_grade
  const rows: ResultRow[] = [
    {
      cat: "TWK",
      scored: attempt.scoreTWK ?? 0,
      max: 50,
      pass: (attempt.scoreTWK ?? 0) >= passing.TWK,
      passing: passing.TWK,
    },
    {
      cat: "TIU",
      scored: attempt.scoreTIU ?? 0,
      max: 50,
      pass: (attempt.scoreTIU ?? 0) >= passing.TIU,
      passing: passing.TIU,
    },
    {
      cat: "TKP",
      scored: attempt.scoreTKP ?? 0,
      max: 50,
      pass: (attempt.scoreTKP ?? 0) >= passing.TKP,
      passing: passing.TKP,
    },
  ]

  const lulus = attempt.passingStatus === "lulus"
  const totalAnswered = items.filter((i) => i.userAnswer).length
  const totalCorrect = items.filter((i) => i.isCorrect === true).length

  return (
    <>
      <SiteHeader />
      <main className="flex-1 px-4 py-10 sm:py-14">
        <div className="mx-auto max-w-3xl space-y-10">
          {/* Verdict */}
          <section className="rounded-2xl border border-border/60 bg-card/40 p-6 sm:p-8 backdrop-blur">
            <div className="flex flex-col items-center text-center gap-3">
              {lulus ? (
                <CheckCircle2 className="size-12 text-emerald-400" />
              ) : (
                <XCircle className="size-12 text-amber-400" />
              )}
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {lulus ? "Selamat — lo lulus passing grade" : "Belum lulus passing grade"}
              </h1>
              <p className="text-muted-foreground text-balance max-w-prose">
                {lulus
                  ? "Skor lo memenuhi passing grade SKD pada ketiga kategori. Pertahankan ritme ini."
                  : "Belum apa-apa, ini cuma latihan. Liat per soal di bawah, baca penjelasannya, ulangi besok dengan strategi lebih tajam."}
              </p>
              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Clock className="size-4" />
                  {formatDuration((attempt.durationSec ?? 0) * 1000)}
                </span>
                <span>·</span>
                <span>
                  Dijawab {totalAnswered}/{items.length}
                </span>
                <span>·</span>
                <span>Benar {totalCorrect}</span>
              </div>
            </div>
          </section>

          {/* Score breakdown */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Rincian skor</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {rows.map((r) => (
                <div
                  key={r.cat}
                  className={cn(
                    "rounded-xl border p-5 backdrop-blur",
                    r.pass
                      ? "bg-emerald-500/5 border-emerald-500/30"
                      : "bg-amber-500/5 border-amber-500/30",
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold tracking-widest text-muted-foreground">
                      {r.cat}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] uppercase tracking-wider",
                        r.pass
                          ? "border-emerald-500/40 text-emerald-300"
                          : "border-amber-500/40 text-amber-300",
                      )}
                    >
                      {r.pass ? "Lulus" : "Belum"}
                    </Badge>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{r.scored}</span>
                    <span className="text-muted-foreground text-sm">/ {r.max}</span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Passing grade {r.cat}: {r.passing}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between rounded-xl border border-border/60 bg-card/30 p-4">
              <span className="text-sm text-muted-foreground">Total skor</span>
              <span className="text-xl font-bold">
                {attempt.totalScore ?? 0}{" "}
                <span className="text-sm text-muted-foreground font-normal">/ 150</span>
              </span>
            </div>
          </section>

          {/* Per-question review */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Pembahasan per soal</h2>
            <div className="space-y-4">
              {items.map((it, idx) => {
                const q = it.question
                if (!q) return null
                const isCorrect = it.isCorrect === true
                const skipped = !it.userAnswer
                return (
                  <div
                    key={it.id}
                    className="rounded-xl border border-border/60 bg-card/30 p-5"
                  >
                    <div className="flex items-center gap-2 mb-3 text-xs">
                      <span className="text-muted-foreground">#{idx + 1}</span>
                      <CategoryBadge category={q.category} />
                      <span className="text-muted-foreground">{q.subcategory}</span>
                      <span className="ml-auto">
                        {skipped ? (
                          <Badge variant="outline" className="text-[10px] uppercase">
                            Tidak dijawab
                          </Badge>
                        ) : isCorrect ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] uppercase border-emerald-500/40 text-emerald-300"
                          >
                            +{it.scoreEarned}
                          </Badge>
                        ) : q.category === "TKP" ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] uppercase border-sky-500/40 text-sky-300"
                          >
                            +{it.scoreEarned}
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[10px] uppercase border-amber-500/40 text-amber-300"
                          >
                            Salah
                          </Badge>
                        )}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed mb-3">{q.questionText}</p>
                    <ul className="space-y-1.5 mb-3">
                      {q.options.map((opt) => {
                        const userPicked = it.userAnswer === opt.label
                        const isAnsKey = opt.label === q.correctAnswer
                        const weight =
                          q.category === "TKP" && q.optionWeights
                            ? q.optionWeights[opt.label]
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
                            <span className="flex-1 leading-relaxed pt-0.5">
                              {opt.text}
                            </span>
                            <span className="text-xs text-muted-foreground shrink-0 pt-1">
                              {weight !== null && <span>bobot {weight}</span>}
                              {userPicked && !isAnsKey && <span className="ml-2">jawaban lo</span>}
                              {isAnsKey && <span className="ml-2">kunci</span>}
                            </span>
                          </li>
                        )
                      })}
                    </ul>
                    {q.explanation && (
                      <div className="mt-3 rounded-md border border-primary/20 bg-primary/5 p-3 text-sm leading-relaxed">
                        <div className="flex items-center gap-1.5 text-primary mb-1.5 text-xs uppercase tracking-widest font-semibold">
                          <Sparkles className="size-3.5" />
                          Penjelasan AI
                        </div>
                        <p className="text-foreground/90">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>

          {/* CTA next */}
          <section className="rounded-2xl border border-border/60 bg-card/40 p-6 sm:p-8 text-center">
            <h2 className="text-xl font-semibold">Lanjut latihan?</h2>
            <p className="text-sm text-muted-foreground mt-2 mb-5">
              Konsistensi tiap hari kalahin sesi maraton mingguan.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Button asChild size="lg">
                <Link href="/tryout">Mulai tryout baru</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/">Kembali ke beranda</Link>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-5">
              Pembahasan AI di-generate oleh Claude Opus 4.7 saat soal disusun, divalidasi tim Cita.
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
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
