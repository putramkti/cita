import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import {
  Sparkles,
  Clock,
  Flag,
  Brain,
  Users,
  Bot,
  ArrowRight,
} from "lucide-react"
import { getServiceClient } from "@/utils/supabase/admin"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { TRYOUT_CONFIG } from "@/lib/types"
import type { AttemptItem, Category, Question } from "@/lib/types"
import { formatDuration } from "@/lib/tryout"
import { getDict } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{ attemptId: string }>
}

interface SubtestRow {
  cat: Category
  scored: number
  max: number
  pass: boolean
  passing: number
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

const CATEGORY_ICONS: Record<Category, React.ComponentType<{ className?: string }>> = {
  TWK: Flag,
  TIU: Brain,
  TKP: Users,
}

export default async function ResultPage({ params }: PageProps) {
  const { attemptId } = await params
  const sb = getServiceClient()
  const t = await getDict()

  const { data: attempt } = await sb
    .from("attempts")
    .select(
      "id, status, startedAt, finishedAt, durationSec, scoreTWK, scoreTIU, scoreTKP, totalScore, passingStatus",
    )
    .eq("id", attemptId)
    .single()

  if (!attempt) notFound()
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
  const rows: SubtestRow[] = (
    [
      { cat: "TWK" as const, score: attempt.scoreTWK ?? 0, target: passing.TWK },
      { cat: "TIU" as const, score: attempt.scoreTIU ?? 0, target: passing.TIU },
      { cat: "TKP" as const, score: attempt.scoreTKP ?? 0, target: passing.TKP },
    ]
  ).map(({ cat, score, target }) => ({
    cat,
    scored: score,
    max: 50,
    passing: target,
    pass: score >= target,
  }))

  const lulus = attempt.passingStatus === "lulus"
  const totalAnswered = items.filter((i) => i.userAnswer).length
  const totalCorrect = items.filter((i) => i.isCorrect === true).length

  // Pick first wrong/skipped question for the AI Insight panel target
  const firstWrongIdx = items.findIndex(
    (it) => !it.userAnswer || it.isCorrect === false,
  )

  return (
    <>
      <SiteHeader />
      <main className="flex-1 px-4 sm:px-8 py-12 sm:py-16">
        <div className="mx-auto max-w-5xl space-y-12 sm:space-y-16">
          {/* ─── Hero score card ─── */}
          <HeroSection
            t={t}
            lulus={lulus}
            totalScore={attempt.totalScore ?? 0}
            durationSec={attempt.durationSec ?? 0}
            totalAnswered={totalAnswered}
            totalQuestions={items.length}
            totalCorrect={totalCorrect}
          />

          {/* ─── Subtest breakdown ─── */}
          <BreakdownSection t={t} rows={rows} locale={t.locale} />

          {/* ─── AI Insight banner ─── */}
          <AiInsightBanner
            t={t}
            attemptId={attemptId}
            firstWrongQuestion={
              firstWrongIdx >= 0 ? items[firstWrongIdx].question : undefined
            }
          />

          {/* ─── Item analysis ─── */}
          <ItemAnalysisSection
            t={t}
            attemptId={attemptId}
            items={items}
          />

          {/* ─── CTA next ─── */}
          <CtaNextSection t={t} />
        </div>
      </main>
      <SiteFooter />
    </>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
 *  HERO
 * ───────────────────────────────────────────────────────────────────────── */

function HeroSection({
  t,
  lulus,
  totalScore,
  durationSec,
  totalAnswered,
  totalQuestions,
  totalCorrect,
}: {
  t: Awaited<ReturnType<typeof getDict>>
  lulus: boolean
  totalScore: number
  durationSec: number
  totalAnswered: number
  totalQuestions: number
  totalCorrect: number
}) {
  return (
    <section className="text-center">
      <span className="inline-flex items-center gap-2 rounded-full border border-[var(--gold)]/40 bg-[var(--review-amber)] text-[var(--review-amber-fg)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em]">
        <span className="size-1.5 rounded-full bg-[var(--gold)]" />
        {t.result.eyebrow}
      </span>

      <h1 className="serif mt-6 text-3xl sm:text-5xl leading-tight tracking-tight">
        {t.result.heroTitle}
      </h1>

      <div className="mt-10 mx-auto max-w-md rounded-xl border border-border bg-card px-8 py-10">
        <p className="serif text-7xl sm:text-[6rem] leading-none text-foreground tabular-nums">
          {totalScore}
        </p>
        <p className="label-caps mt-3">{t.result.totalScoreLabel}</p>
        <span
          className={cn(
            "mt-6 inline-flex items-center rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em]",
            lulus
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-foreground border border-border",
          )}
        >
          {t.result.passingStatusLabel}{" "}
          {lulus ? t.result.passingLulus : t.result.passingBelum}
        </span>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Clock className="size-4" strokeWidth={1.5} />
          {t.result.durationLabel}: {formatDuration(durationSec * 1000)}
        </span>
        <span className="text-border">·</span>
        <span>
          {t.result.answeredLabel}: {totalAnswered}/{totalQuestions}
        </span>
        <span className="text-border">·</span>
        <span>
          {t.result.correctLabel}: {totalCorrect}
        </span>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
 *  BREAKDOWN — three subtest cards
 * ───────────────────────────────────────────────────────────────────────── */

function BreakdownSection({
  t,
  rows,
  locale,
}: {
  t: Awaited<ReturnType<typeof getDict>>
  rows: SubtestRow[]
  locale: "id" | "en"
}) {
  return (
    <section>
      <h2 className="serif text-2xl sm:text-3xl text-foreground mb-6">
        {t.result.breakdownTitle}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {rows.map((row) => (
          <SubtestCard key={row.cat} row={row} t={t} locale={locale} />
        ))}
      </div>
    </section>
  )
}

function SubtestCard({
  row,
  t,
  locale,
}: {
  row: SubtestRow
  t: Awaited<ReturnType<typeof getDict>>
  locale: "id" | "en"
}) {
  const Icon = CATEGORY_ICONS[row.cat]
  const fillPct = Math.min(100, Math.max(0, (row.scored / row.max) * 100))
  return (
    <article
      className={cn(
        "rounded-xl border bg-card p-5",
        row.pass ? "border-border" : "border-destructive/40",
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="label-caps">{row.cat}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {CATEGORY_NAMES[row.cat][locale]}
          </p>
        </div>
        <Icon className="size-5 text-muted-foreground" />
      </div>

      <div className="flex items-baseline gap-1.5 mb-1">
        <span className="serif text-4xl text-foreground tabular-nums">
          {row.scored}
        </span>
        <span className="text-sm text-muted-foreground">/ {row.max}</span>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        {t.result.targetLabel}: {row.passing}
      </p>

      <div className="h-1 rounded-full bg-secondary overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full",
            row.pass ? "bg-[var(--gold)]" : "bg-destructive",
          )}
          style={{ width: `${fillPct}%` }}
        />
      </div>

      {!row.pass && (
        <p className="mt-3 text-xs text-destructive font-medium">
          {t.result.criticalNote}
        </p>
      )}
    </article>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
 *  AI INSIGHT — dark navy banner with editorial copy
 * ───────────────────────────────────────────────────────────────────────── */

function AiInsightBanner({
  t,
  attemptId,
  firstWrongQuestion,
}: {
  t: Awaited<ReturnType<typeof getDict>>
  attemptId: string
  firstWrongQuestion?: Question
}) {
  if (!firstWrongQuestion) return null
  const subcat = firstWrongQuestion.subcategory
  const cat = firstWrongQuestion.category

  return (
    <section className="rounded-xl border border-[#1f2a3a] bg-[#0c1018] text-[#e7e8e9] px-7 py-8 sm:px-10 sm:py-10 relative overflow-hidden">
      <div className="flex items-start gap-3 mb-5">
        <Sparkles
          className="size-5 text-[var(--gold-soft)]"
          strokeWidth={1.5}
        />
        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/60">
          AI Intelligence Insight
        </span>
      </div>

      <p className="serif text-xl sm:text-2xl leading-relaxed text-white/90 max-w-3xl">
        {t.locale === "id"
          ? `Anda paling membutuhkan latihan tambahan pada subtes ${cat} — khususnya topik ${subcat}. Mari mulai dengan soal yang baru saja terlewat dan kupas alasannya bersama tutor.`
          : `You would benefit most from extra practice on the ${cat} subtest — particularly on ${subcat}. Let's start with the question you just missed and unpack the reasoning together.`}
      </p>

      <div className="mt-6 flex items-center gap-2">
        <Bot className="size-4 text-[var(--gold-soft)]" strokeWidth={1.5} />
        <Link
          href={`/study/${attemptId}/${firstWrongQuestion.id}`}
          className="text-sm text-white/80 hover:text-white inline-flex items-center gap-1 underline-offset-2 hover:underline"
        >
          {t.result.askTutorCta}
          <ArrowRight className="size-3.5" strokeWidth={2} />
        </Link>
      </div>

      {/* Decorative accent — top-right gold glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 -right-20 size-60 rounded-full bg-[var(--gold)]/10 blur-3xl"
      />
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
 *  ITEM ANALYSIS — list of question result cards
 * ───────────────────────────────────────────────────────────────────────── */

function ItemAnalysisSection({
  t,
  attemptId,
  items,
}: {
  t: Awaited<ReturnType<typeof getDict>>
  attemptId: string
  items: AttemptItem[]
}) {
  // Show first 6, then a 'view all' link
  const previewLimit = 6
  const previewItems = items.slice(0, previewLimit)
  const hasMore = items.length > previewLimit

  return (
    <section>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <h2 className="serif text-2xl sm:text-3xl text-foreground">
          {t.result.itemAnalysisTitle}
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled
            className="text-[11px] font-bold uppercase tracking-[0.12em] border border-border bg-card text-muted-foreground rounded-md px-3 py-2 cursor-not-allowed"
          >
            {t.result.filterAll}
          </button>
          <button
            type="button"
            disabled
            className="text-[11px] font-bold uppercase tracking-[0.12em] border border-border bg-card text-muted-foreground rounded-md px-3 py-2 cursor-not-allowed"
          >
            {t.result.downloadReport}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {previewItems.map((it, idx) => (
          <ItemRow
            key={it.id}
            item={it}
            idx={idx}
            t={t}
            attemptId={attemptId}
          />
        ))}
      </div>

      {hasMore && (
        <p className="mt-6 text-center">
          <Link
            href={`#all`}
            className="text-sm text-foreground hover:underline underline-offset-2"
          >
            {t.result.viewAllPrefix} {items.length} {t.result.viewAllSuffix}{" "}
            →
          </Link>
        </p>
      )}

      {/* Full list (anchor for the link above) */}
      {hasMore && (
        <div id="all" className="mt-8 space-y-3">
          {items.slice(previewLimit).map((it, idx) => (
            <ItemRow
              key={it.id}
              item={it}
              idx={previewLimit + idx}
              t={t}
              attemptId={attemptId}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function ItemRow({
  item,
  idx,
  t,
  attemptId,
}: {
  item: AttemptItem
  idx: number
  t: Awaited<ReturnType<typeof getDict>>
  attemptId: string
}) {
  const q = item.question
  if (!q) return null
  const skipped = !item.userAnswer
  const isCorrect = item.isCorrect === true

  const tagClass = skipped
    ? "bg-secondary text-muted-foreground border-border"
    : isCorrect
      ? "bg-[var(--success-soft)] text-[var(--success-fg)] border-[var(--success-fg)]/20"
      : "bg-[var(--error-soft)] text-[var(--error-fg)] border-[var(--error-fg)]/20"

  const tagLabel = skipped
    ? t.result.tagSkipped
    : isCorrect
      ? t.result.tagCorrect
      : t.result.tagWrong

  const numberPrefix = String(idx + 1).padStart(2, "0")

  return (
    <article className="rounded-xl border border-border bg-card px-5 py-5 flex flex-col sm:flex-row sm:items-center gap-4">
      <span
        className={cn(
          "shrink-0 inline-flex items-center justify-center size-12 rounded-md serif text-xl tabular-nums border",
          skipped
            ? "border-border bg-secondary text-muted-foreground"
            : isCorrect
              ? "border-[var(--success-fg)]/20 bg-[var(--success-soft)] text-[var(--success-fg)]"
              : "border-[var(--error-fg)]/20 bg-[var(--error-soft)] text-[var(--error-fg)]",
        )}
      >
        {numberPrefix}
      </span>
      <div className="flex-1 min-w-0">
        <p className="label-caps mb-1.5">
          {q.category} · {q.subcategory}
        </p>
        <p className="text-sm text-foreground leading-relaxed line-clamp-2">
          {q.questionText}
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span
          className={cn(
            "inline-flex items-center rounded-md border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em]",
            tagClass,
          )}
        >
          {tagLabel}
        </span>
        <Link
          href={`/study/${attemptId}/${q.id}`}
          className={cn(
            "inline-flex items-center justify-center gap-1.5 rounded-md text-xs font-medium px-3 py-1.5 transition-colors",
            !isCorrect && !skipped
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "border border-border bg-card text-foreground hover:bg-secondary",
          )}
        >
          {t.result.askTutorCta}
        </Link>
      </div>
    </article>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
 *  CTA NEXT
 * ───────────────────────────────────────────────────────────────────────── */

function CtaNextSection({
  t,
}: {
  t: Awaited<ReturnType<typeof getDict>>
}) {
  return (
    <section className="text-center pt-4">
      <h2 className="serif text-2xl sm:text-3xl text-foreground">
        {t.result.ctaNextTitle}
      </h2>
      <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">
        {t.result.ctaNextSubtitle}
      </p>
      <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
        <Link
          href="/tryout"
          className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-medium px-5 py-2.5 hover:bg-primary/90 transition-colors"
        >
          {t.result.ctaStartNew}
        </Link>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md border border-border bg-card text-foreground text-sm font-medium px-5 py-2.5 hover:bg-secondary transition-colors"
        >
          {t.result.ctaBackHome}
        </Link>
      </div>
      <p className="text-xs text-muted-foreground mt-6 max-w-lg mx-auto leading-relaxed">
        {t.result.disclaimer}
      </p>
    </section>
  )
}
