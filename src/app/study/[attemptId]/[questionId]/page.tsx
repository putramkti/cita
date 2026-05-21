import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, Lightbulb, Check } from "lucide-react";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/get-user";
import { getCurrentPlan } from "@/lib/billing/get-plan";
import { quota } from "@/lib/billing/entitlements";
import { checkTutorQuota } from "@/lib/billing/usage";
import { SiteHeader } from "@/components/layout/site-header";
import { TutorChat } from "./tutor-chat";
import { AnonBlurOverlay } from "@/components/billing/anon-blur-overlay";
import type { Category } from "@prisma/client";
import { cn } from "@/lib/utils";
import { getDict } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const ANON_COOKIE = "cita_anon_id";

interface PageProps {
  params: Promise<{ attemptId: string; questionId: string }>;
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

const CATEGORY_ORDER: Record<Category, number> = { TWK: 0, TIU: 1, TKP: 2 };

interface QuestionOption {
  label: string;
  text: string;
}

export default async function StudyPage({ params }: PageProps) {
  const { attemptId, questionId } = await params;
  const t = await getDict();

  // Auth: dual — Supabase user OR anon cookie. Mirror result page pattern.
  const supabaseUser = await getCurrentUser();
  const cookieStore = await cookies();
  const anonId = cookieStore.get(ANON_COOKIE)?.value ?? null;
  const viewerId = supabaseUser?.id ?? anonId;
  const isAnon = !supabaseUser && Boolean(anonId);

  if (!viewerId) redirect("/tryout");

  // Load attempt with item + question + all sibling items for prev/next nav
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    select: {
      id: true,
      userId: true,
      status: true,
      items: {
        select: {
          id: true,
          questionId: true,
          userAnswer: true,
          isCorrect: true,
          scoreEarned: true,
          position: true,
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
            },
          },
        },
      },
    },
  });

  if (!attempt) notFound();
  if (attempt.userId !== viewerId) notFound();

  // Tutor only available after attempt is terminal (SUBMITTED or EXPIRED)
  if (attempt.status === "IN_PROGRESS") redirect(`/tryout/${attemptId}`);

  // Find target item
  const item = attempt.items.find((it) => it.questionId === questionId);
  if (!item) notFound();
  const question = item.question;

  // Chat history for this (attempt, question) pair
  const historyRows = await prisma.explainerMessage.findMany({
    where: { attemptId, questionId },
    orderBy: { createdAt: "asc" },
    select: { id: true, role: true, content: true },
  });

  const initialMessages = historyRows.map((m) => ({
    id: m.id,
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  // Tutor quota — per-account daily, plan-aware (Phase 7).
  // FREE = 5/day, PREMIUM = 50/day, ANON = 0 (gated to login earlier upstream).
  // Source of truth: lib/billing/plans.ts → tutorDailyQuota.
  const plan = supabaseUser?.id ? await getCurrentPlan(supabaseUser.id) : "ANON";
  const dailyLimit = quota(plan, "tutorDailyQuota");
  const quotaCheck = supabaseUser?.id
    ? await checkTutorQuota(supabaseUser.id, dailyLimit)
    : { allowed: false, used: 0, limit: dailyLimit, remaining: dailyLimit };

  // Build prev/next nav — sort by category order then position
  const ordered = [...attempt.items].sort((a, b) => {
    const ca = CATEGORY_ORDER[a.question.category];
    const cb = CATEGORY_ORDER[b.question.category];
    if (ca !== cb) return ca - cb;
    return a.position - b.position;
  });
  const idx = ordered.findIndex((it) => it.questionId === questionId);
  const prevQ = idx > 0 ? ordered[idx - 1].questionId : null;
  const nextQ =
    idx >= 0 && idx < ordered.length - 1 ? ordered[idx + 1].questionId : null;

  const options = (question.options as unknown as QuestionOption[]) ?? [];

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
                {CATEGORY_NAMES[question.category][t.locale]} (
                {question.category})
              </h1>
              <p className="text-sm text-muted-foreground mb-7">
                {t.locale === "en" ? "Topic" : "Topik"}: {question.subcategory}
                {question.topic ? ` · ${question.topic}` : ""}
              </p>

              <article className="rounded-xl border border-border bg-card p-6 sm:p-7 mb-6">
                <p className="serif text-xl leading-relaxed text-foreground mb-7">
                  {question.questionText}
                </p>

                <ul className="space-y-2.5">
                  {options.map((opt) => {
                    const userPicked = item.userAnswer === opt.label;
                    const isAnsKey = opt.label === question.correctAnswer;
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
                    );
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
            <section className="min-h-[60vh] relative">
              <TutorChat
                attemptId={attemptId}
                questionId={questionId}
                initialMessages={initialMessages}
                initialUserMsgCount={quotaCheck.used}
                maxUserMsgs={quotaCheck.limit}
                dict={t.study}
              />
              <p className="mt-3 text-center text-xs text-muted-foreground">
                {t.locale === "en"
                  ? "Cita AI can make mistakes. Verify important information with the official syllabus."
                  : "Cita AI dapat keliru. Mohon validasi informasi penting dengan silabus resmi."}
              </p>
              {isAnon && (
                <AnonBlurOverlay
                  locale={t.locale}
                  nextPath={`/study/${attemptId}/${questionId}`}
                />
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
