import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/get-user";
import { cookies } from "next/headers";
import { SiteHeader } from "@/components/layout/site-header";
import { MODE_CONFIG } from "@/lib/tryout/config";
import { getDict } from "@/lib/i18n";
import { TryoutClient } from "./tryout-client";
import { expireStaleAttempt } from "../actions";

export const dynamic = "force-dynamic";

const ANON_COOKIE = "cita_anon_id";

interface PageProps {
  params: Promise<{ attemptId: string }>;
}

export default async function TryoutPage({ params }: PageProps) {
  const { attemptId } = await params;

  // Resolve viewer (auth user or anon cookie) — read-only, no minting
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
              difficulty: true,
              imagePrompt: true,
            },
          },
        },
      },
    },
  });

  if (!attempt) notFound();
  if (attempt.userId !== viewerId) notFound();

  if (attempt.status === "SUBMITTED" || attempt.status === "EXPIRED") {
    redirect(`/tryout/${attemptId}/result`);
  }

  const cfg = MODE_CONFIG[attempt.mode];
  const totalSec = cfg.durationMin * 60;
  const elapsedSec = Math.floor(
    (Date.now() - attempt.startedAt.getTime()) / 1000,
  );
  const remainingSec = totalSec - elapsedSec;

  if (remainingSec <= 0) {
    // Timer udah lewat. Auto-score + mark EXPIRED so result page can render.
    // Without this we'd loop: briefing→exam→result→exam (briefing redirects
    // IN_PROGRESS attempts to /exam, /exam redirects expired ones to /result,
    // /result redirects IN_PROGRESS back to /exam → infinite).
    await expireStaleAttempt(attempt.id);
    redirect(`/tryout/${attemptId}/result`);
  }

  // Items normalized for the client component
  const clientItems = attempt.items.map((it) => ({
    id: it.id,
    questionId: it.questionId,
    userAnswer: it.userAnswer,
    question: {
      id: it.question.id,
      category: it.question.category,
      subcategory: it.question.subcategory,
      topic: it.question.topic,
      questionText: it.question.questionText,
      options: it.question.options as { label: string; text: string }[],
      difficulty: it.question.difficulty,
      imagePrompt: it.question.imagePrompt,
    },
  }));

  const t = await getDict();

  return (
    <>
      <SiteHeader />
      <TryoutClient
        attemptId={attemptId}
        items={clientItems}
        startedAtMs={attempt.startedAt.getTime()}
        durationMin={cfg.durationMin}
        mode={attempt.mode}
        modeLabelId={cfg.labelId}
        dict={{
          modeLabel: t.tryout.modeLabel,
          timeRemainingLabel: t.tryout.timeRemainingLabel,
          overview: t.tryout.overview,
          questionPanelLabel: t.tryout.questionPanelLabel,
          ofLabel: t.tryout.ofLabel,
          previous: t.tryout.previous,
          next: t.tryout.next,
          markReview: t.tryout.markReview,
          submit: t.tryout.submit,
          submitting: t.tryout.submitting,
          questionUnavailable: t.tryout.questionUnavailable,
          retry: t.tryout.retry,
          tools: t.tryout.tools,
          toolAi: t.tryout.toolAi,
          toolNotes: t.tryout.toolNotes,
          toolCalc: t.tryout.toolCalc,
          toolsComingSoon: t.tryout.toolsComingSoon,
          motivationalQuote: t.tryout.motivationalQuote,
          answeredCount: t.tryout.answeredCount,
        }}
      />
    </>
  );
}
