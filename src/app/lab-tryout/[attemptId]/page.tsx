import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/get-user";
import { MODE_CONFIG } from "@/lib/tryout/config";
import { TryoutClient } from "./tryout-client";

export const dynamic = "force-dynamic";

const ANON_COOKIE = "cita_anon_id";

export const metadata: Metadata = {
  title: "Tryout berlangsung",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ attemptId: string }>;
};

export default async function LabTryoutAttemptPage({ params }: Props) {
  const { attemptId } = await params;

  // Resolve viewer id (must own this attempt)
  const supabaseUser = await getCurrentUser();
  const cookieStore = await cookies();
  const viewerId =
    supabaseUser?.id ?? cookieStore.get(ANON_COOKIE)?.value ?? null;

  if (!viewerId) {
    redirect("/lab-tryout");
  }

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
  if (attempt.userId !== viewerId) {
    // Don't leak existence — treat as 404
    notFound();
  }

  if (attempt.status === "SUBMITTED" || attempt.status === "EXPIRED") {
    redirect(`/lab-tryout/${attemptId}/result`);
  }

  const cfg = MODE_CONFIG[attempt.mode];
  const startedAtMs = attempt.startedAt.getTime();
  const elapsedSec = Math.floor((Date.now() - startedAtMs) / 1000);
  const totalSec = cfg.durationMin * 60;
  const remainingSec = totalSec - elapsedSec;

  if (remainingSec <= 0) {
    redirect(`/lab-tryout/${attemptId}/result`);
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-8">
      <nav className="mb-4 flex items-center justify-between text-xs text-muted-foreground">
        <Link href="/lab-tryout" className="hover:text-foreground">
          ← Briefing
        </Link>
        <span className="font-mono">
          {cfg.labelId} · {cfg.totalSoal} soal · {cfg.durationMin} menit
        </span>
      </nav>

      <TryoutClient
        attemptId={attempt.id}
        items={attempt.items.map((it) => ({
          id: it.id,
          questionId: it.questionId,
          userAnswer: it.userAnswer,
          question: {
            ...it.question,
            options: it.question.options as { label: string; text: string }[],
          },
        }))}
        startedAtMs={startedAtMs}
        durationMin={cfg.durationMin}
        mode={attempt.mode}
      />
    </main>
  );
}
