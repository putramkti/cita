import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import {
  Clock,
  Flag,
  Brain,
  Users,
  ArrowRight,
} from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/get-user";
import { getCurrentPlan } from "@/lib/billing/get-plan";
import { can } from "@/lib/billing/entitlements";
import { ResultItemList } from "./result-item-list";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import {
  MODE_CONFIG,
  thresholdFor,
  formatDuration,
} from "@/lib/tryout/config";
import { getDict } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { Category } from "@prisma/client";
import { PersonalizedInsight } from "./personalized-insight";
import type { InsightPayload } from "@/lib/insight/schema";

export const dynamic = "force-dynamic";

const ANON_COOKIE = "cita_anon_id";

interface PageProps {
  params: Promise<{ attemptId: string }>;
}

interface SubtestRow {
  cat: Category;
  scored: number;
  max: number;
  pass: boolean;
  passing: number;
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
};

const CATEGORY_ICONS: Record<Category, React.ComponentType<{ className?: string }>> = {
  TWK: Flag,
  TIU: Brain,
  TKP: Users,
};

export default async function ResultPage({ params }: PageProps) {
  const { attemptId } = await params;
  const t = await getDict();

  const supabaseUser = await getCurrentUser();
  const cookieStore = await cookies();
  const viewerId =
    supabaseUser?.id ?? cookieStore.get(ANON_COOKIE)?.value ?? null;

  if (!viewerId) redirect("/tryout");

  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      items: {
        orderBy: { position: "asc" },
        include: {
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
            },
          },
        },
      },
    },
  });

  if (!attempt) notFound();
  if (attempt.userId !== viewerId) notFound();

  // Result page only renders for terminal states
  if (attempt.status === "IN_PROGRESS") {
    redirect(`/tryout/${attemptId}`);
  }

  const cfg = MODE_CONFIG[attempt.mode];
  const threshold = thresholdFor(attempt.mode);

  // Per-category max possible score (depends on mode)
  const maxScore = {
    TWK: cfg.perCategory.TWK * 5,
    TIU: cfg.perCategory.TIU * 5,
    TKP: cfg.perCategory.TKP * 5,
  } as const;

  const rows: SubtestRow[] = (
    [
      { cat: "TWK" as const, score: attempt.scoreTWK ?? 0, target: threshold.TWK, max: maxScore.TWK },
      { cat: "TIU" as const, score: attempt.scoreTIU ?? 0, target: threshold.TIU, max: maxScore.TIU },
      { cat: "TKP" as const, score: attempt.scoreTKP ?? 0, target: threshold.TKP, max: maxScore.TKP },
    ]
  ).map(({ cat, score, target, max }) => ({
    cat,
    scored: score,
    max,
    passing: target,
    pass: score >= target,
  }));

  const lulus = attempt.passingStatus === "lulus";
  const totalAnswered = attempt.items.filter((i) => i.userAnswer).length;
  const totalCorrect = attempt.items.filter((i) => i.isCorrect === true).length;

  // Pick first wrong/skipped question for the AI Insight panel target
  const firstWrong = attempt.items.find(
    (it) => !it.userAnswer || it.isCorrect === false,
  );

  // Resolve plan tier for personalized insight gating.
  //   - ANON viewer (anon cookie attempt): blurred preview + login CTA
  //   - FREE: upsell teaser
  //   - PREMIUM: real LLM insight
  const plan = supabaseUser?.id
    ? await getCurrentPlan(supabaseUser.id)
    : "ANON";
  const insightTier: "ANON" | "FREE" | "PREMIUM" = !supabaseUser?.id
    ? "ANON"
    : can(plan, "aiInsightPersonalized")
      ? "PREMIUM"
      : "FREE";

  return (
    <>
      <SiteHeader />
      <main className="flex-1 px-4 sm:px-8 py-12 sm:py-16">
        <div className="mx-auto max-w-5xl space-y-12 sm:space-y-16">
          {/* ─── Hero score card ─── */}
          <HeroSection
            t={t}
            mode={attempt.mode}
            modeLabel={cfg.labelId}
            wasExpired={attempt.status === "EXPIRED"}
            lulus={lulus}
            totalScore={attempt.totalScore ?? 0}
            durationSec={attempt.durationSec ?? 0}
            totalAnswered={totalAnswered}
            totalQuestions={attempt.items.length}
            totalCorrect={totalCorrect}
          />

          {/* ─── Subtest breakdown ─── */}
          <BreakdownSection t={t} rows={rows} locale={t.locale} />

          {/* ─── Personalized Insight (Premium) / FREE upsell ─── */}
          <PersonalizedInsight
            attemptId={attemptId}
            initialStatus={
              attempt.insightStatus === "READY"
                ? "READY"
                : attempt.insightStatus === "FAILED"
                ? "FAILED"
                : attempt.insightStatus === "PENDING"
                ? "PENDING"
                : "NOT_REQUESTED"
            }
            initialPayload={
              (attempt.aiInsight as unknown as InsightPayload | null) ?? null
            }
            tier={insightTier}
            locale={t.locale as "id" | "en"}
            loginNext={`/tryout/${attemptId}/result`}
            firstWrong={
              firstWrong
                ? {
                    id: firstWrong.question.id,
                    category: firstWrong.question.category,
                    subcategory: firstWrong.question.subcategory,
                  }
                : null
            }
          />

          {/* ─── Item analysis (filter + report + CSV download) ─── */}
          <ResultItemList
            attemptId={attemptId}
            attemptCreatedAt={attempt.startedAt.toISOString()}
            attemptMode={attempt.mode}
            scorePct={
              attempt.totalScore != null && cfg.totalSoal > 0
                ? (attempt.totalScore / cfg.totalSoal) * 100
                : null
            }
            userEmail={supabaseUser?.email ?? null}
            locale={t.locale as "id" | "en"}
            dict={{
              itemAnalysisTitle: t.result.itemAnalysisTitle,
              filterAll: t.result.filterAll,
              filterCorrect: t.result.filterCorrect,
              filterWrong: t.result.filterWrong,
              filterSkipped: t.result.filterSkipped,
              downloadReport: t.result.downloadReport,
              tagCorrect: t.result.tagCorrect,
              tagWrong: t.result.tagWrong,
              tagSkipped: t.result.tagSkipped,
              yourAnswer: t.result.yourAnswer,
              correctAnswer: t.result.correctAnswer,
              askTutor: t.result.askTutor,
              viewAllPrefix: t.result.viewAllPrefix,
              viewAllSuffix: t.result.viewAllSuffix,
              emptyFilter: t.result.emptyFilter,
            }}
            items={attempt.items.map((it, idx) => ({
              id: it.id,
              userAnswer: it.userAnswer,
              isCorrect: it.isCorrect,
              position: idx,
              question: {
                id: it.question.id,
                category: it.question.category,
                subcategory: it.question.subcategory,
                questionText: it.question.questionText,
                correctAnswer: it.question.correctAnswer,
              },
            }))}
          />

          {/* ─── CTA next ─── */}
          <CtaNextSection t={t} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 *  HERO
 * ───────────────────────────────────────────────────────────────────────── */

function HeroSection({
  t,
  mode,
  modeLabel,
  wasExpired,
  lulus,
  totalScore,
  durationSec,
  totalAnswered,
  totalQuestions,
  totalCorrect,
}: {
  t: Awaited<ReturnType<typeof getDict>>;
  mode: "MINI" | "FULL";
  modeLabel: string;
  wasExpired: boolean;
  lulus: boolean;
  totalScore: number;
  durationSec: number;
  totalAnswered: number;
  totalQuestions: number;
  totalCorrect: number;
}) {
  return (
    <section className="text-center">
      <span className="inline-flex items-center gap-2 rounded-full border border-[var(--gold)]/40 bg-[var(--review-amber)] text-[var(--review-amber-fg)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em]">
        <span className="size-1.5 rounded-full bg-[var(--gold)]" />
        {wasExpired ? "WAKTU HABIS" : t.result.eyebrow} · {modeLabel}
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
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 *  BREAKDOWN — three subtest cards
 * ───────────────────────────────────────────────────────────────────────── */

function BreakdownSection({
  t,
  rows,
  locale,
}: {
  t: Awaited<ReturnType<typeof getDict>>;
  rows: SubtestRow[];
  locale: "id" | "en";
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
  );
}

function SubtestCard({
  row,
  t,
  locale,
}: {
  row: SubtestRow;
  t: Awaited<ReturnType<typeof getDict>>;
  locale: "id" | "en";
}) {
  const Icon = CATEGORY_ICONS[row.cat];
  const fillPct = Math.min(100, Math.max(0, (row.scored / row.max) * 100));
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
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 *  ITEM ANALYSIS — list of question result cards
 * ───────────────────────────────────────────────────────────────────────── */

interface ItemAnalysisItem {
  id: string;
  userAnswer: string | null;
  isCorrect: boolean | null;
  question: {
    id: string;
    category: Category;
    subcategory: string;
    questionText: string;
    options: { label: string; text: string }[];
    correctAnswer: string | null;
  };
}

function ItemAnalysisSection({
  t,
  attemptId,
  items,
}: {
  t: Awaited<ReturnType<typeof getDict>>;
  attemptId: string;
  items: ItemAnalysisItem[];
}) {
  // Show first 6, then a 'view all' link
  const previewLimit = 6;
  const previewItems = items.slice(0, previewLimit);
  const hasMore = items.length > previewLimit;

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
            {t.result.viewAllPrefix} {items.length} {t.result.viewAllSuffix} →
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
  );
}

function ItemRow({
  item,
  idx,
  t,
  attemptId,
}: {
  item: ItemAnalysisItem;
  idx: number;
  t: Awaited<ReturnType<typeof getDict>>;
  attemptId: string;
}) {
  const q = item.question;
  const skipped = !item.userAnswer;
  const isCorrect = item.isCorrect === true;

  const tagClass = skipped
    ? "bg-secondary text-muted-foreground border-border"
    : isCorrect
      ? "bg-[var(--success-soft)] text-[var(--success-fg)] border-[var(--success-fg)]/20"
      : "bg-[var(--error-soft)] text-[var(--error-fg)] border-[var(--error-fg)]/20";

  const tagLabel = skipped
    ? t.result.tagSkipped
    : isCorrect
      ? t.result.tagCorrect
      : t.result.tagWrong;

  const numberPrefix = String(idx + 1).padStart(2, "0");

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
        <p className="serif text-base text-foreground line-clamp-2 leading-relaxed">
          {q.questionText}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>
            {t.result.yourAnswer}:{" "}
            <span className="font-mono font-semibold text-foreground">
              {item.userAnswer ?? "—"}
            </span>
          </span>
          {q.correctAnswer && (
            <>
              <span className="text-border">·</span>
              <span>
                {t.result.correctAnswer}:{" "}
                <span className="font-mono font-semibold text-foreground">
                  {q.correctAnswer}
                </span>
              </span>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 sm:flex-col sm:items-end">
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em]",
            tagClass,
          )}
        >
          {tagLabel}
        </span>
        <Link
          href={`/study/${attemptId}/${q.id}`}
          className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
        >
          {t.result.askTutor} →
        </Link>
      </div>
    </article>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 *  CTA — bottom call to action
 * ───────────────────────────────────────────────────────────────────────── */

function CtaNextSection({ t }: { t: Awaited<ReturnType<typeof getDict>> }) {
  return (
    <section className="text-center border-t border-border pt-10">
      <h2 className="serif text-2xl sm:text-3xl text-foreground">
        {t.result.ctaNextTitle}
      </h2>
      <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
        {t.result.ctaNextSubtitle}
      </p>
      <div className="mt-7 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
        <Link
          href="/tryout"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground text-sm font-medium px-5 py-3 hover:bg-primary/90 transition-colors"
        >
          {t.result.ctaStartNew}
        </Link>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-card text-foreground text-sm font-medium px-5 py-3 hover:bg-secondary transition-colors"
        >
          {t.result.ctaBackHome}
        </Link>
      </div>
    </section>
  );
}
