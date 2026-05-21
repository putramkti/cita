"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import type { AttemptMode } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { ensureUser } from "@/lib/db/users";
import { getCurrentUser } from "@/lib/auth/get-user";
import {
  sampleStratified,
  scoreAnswer,
  thresholdFor,
} from "@/lib/tryout/config";

const ANON_COOKIE = "cita_anon_id";

/**
 * Generate a cuid-lite for anonymous user ids.
 * Not crypto-grade — just unique enough.
 */
function makeAnonId(): string {
  const t = Date.now().toString(36);
  const r =
    Math.random().toString(36).slice(2, 9) +
    Math.random().toString(36).slice(2, 9);
  return `anon_${t}${r}`;
}

/**
 * Resolve the current attempt's owner id.
 *   - If authenticated → Supabase user.id (DB row guaranteed via callback)
 *   - Else → existing or new `cita_anon_id` cookie value, with DB row upserted
 */
async function resolveUserId(): Promise<string> {
  const supabaseUser = await getCurrentUser();
  if (supabaseUser) {
    await ensureUser({ anonId: null });
    return supabaseUser.id;
  }

  const cookieStore = await cookies();
  let anonId = cookieStore.get(ANON_COOKIE)?.value;
  if (!anonId) {
    anonId = makeAnonId();
    cookieStore.set(ANON_COOKIE, anonId, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
      httpOnly: true,
    });
  }
  await ensureUser({ anonId });
  return anonId;
}

/**
 * Start a new tryout attempt.
 *
 *   - Resolves owner (auth user or anon cookie).
 *   - Resumes any IN_PROGRESS attempt of the requested mode (avoids
 *     orphan-attempt clutter on accidental re-clicks).
 *   - Otherwise samples soal stratified by category, persists Attempt
 *     + AttemptItem rows in a transaction, redirects to /tryout/<id>.
 */
export async function startTryout(formData: FormData): Promise<void> {
  const modeRaw = String(formData.get("mode") ?? "MINI").toUpperCase();
  const mode: AttemptMode =
    modeRaw === "FULL" ? "FULL" : "MINI";

  const userId = await resolveUserId();

  // Resume in-progress attempt if exists for same mode
  const existing = await prisma.attempt.findFirst({
    where: { userId, status: "IN_PROGRESS", mode },
    orderBy: { startedAt: "desc" },
  });

  if (existing) {
    redirect(`/tryout/${existing.id}`);
  }

  // Pull pool for the categories needed (only published soal in real use;
  // for now the lab DB has all REVIEWED/DRAFT seeded — accept all).
  const pool = await prisma.question.findMany({
    where: {
      status: { in: ["REVIEWED", "PUBLISHED"] },
    },
    select: { id: true, category: true },
  });

  if (pool.length === 0) {
    throw new Error("Belum ada soal di bank. Coba lagi nanti.");
  }

  const selectedIds = sampleStratified(pool, mode);

  const attempt = await prisma.$transaction(async (tx) => {
    const a = await tx.attempt.create({
      data: {
        userId,
        mode,
        status: "IN_PROGRESS",
      },
    });
    await tx.attemptItem.createMany({
      data: selectedIds.map((qid, idx) => ({
        attemptId: a.id,
        questionId: qid,
        position: idx, // store sample order
      })),
    });
    return a;
  });

  revalidatePath("/tryout");
  redirect(`/tryout/${attempt.id}`);
}

/**
 * Save a single answer mid-attempt (called on each option pick).
 * Idempotent: re-pick same option → no-op aside from updating timestamp.
 *
 * Does NOT compute final score — scoring happens at submit time so we
 * can re-derive after content fixes (e.g. correctAnswer hot-patch).
 */
export async function saveAnswer(args: {
  attemptId: string;
  questionId: string;
  userAnswer: string | null;
}): Promise<{ ok: true } | { error: string }> {
  const userId = await resolveUserId();

  const attempt = await prisma.attempt.findUnique({
    where: { id: args.attemptId },
    select: { userId: true, status: true },
  });

  if (!attempt || attempt.userId !== userId) {
    return { error: "Attempt tidak ditemukan." };
  }
  if (attempt.status !== "IN_PROGRESS") {
    return { error: "Attempt sudah selesai." };
  }

  await prisma.attemptItem.update({
    where: {
      attemptId_questionId: {
        attemptId: args.attemptId,
        questionId: args.questionId,
      },
    },
    data: {
      userAnswer: args.userAnswer,
      answeredAt: args.userAnswer ? new Date() : null,
    },
  });

  return { ok: true };
}

/**
 * Submit attempt: score everything, freeze totals, mark SUBMITTED.
 * Idempotent on already-submitted attempts → returns existing scores.
 */
export async function submitAttempt(attemptId: string): Promise<void> {
  console.log(`[submitAttempt] START attemptId=${attemptId}`);
  const userId = await resolveUserId();
  console.log(`[submitAttempt] resolveUserId=${userId}`);

  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      items: {
        include: {
          question: {
            select: {
              category: true,
              correctAnswer: true,
              optionWeights: true,
            },
          },
        },
      },
    },
  });

  console.log(
    `[submitAttempt] attempt=${attempt?.id ?? "null"} userId=${attempt?.userId ?? "null"} status=${attempt?.status ?? "null"} items=${attempt?.items.length ?? 0}`,
  );

  if (!attempt || attempt.userId !== userId) {
    console.error(
      `[submitAttempt] OWNERSHIP FAIL viewerId=${userId} attemptUserId=${attempt?.userId ?? "null"}`,
    );
    throw new Error("Attempt tidak ditemukan.");
  }

  if (attempt.status === "SUBMITTED") {
    console.log(`[submitAttempt] already SUBMITTED → redirect to result`);
    redirect(`/lab-tryout/${attemptId}/result`);
  }

  // Score per category
  let scoreTWK = 0;
  let scoreTIU = 0;
  let scoreTKP = 0;
  const itemUpdates: { id: string; earned: number; isCorrect: boolean | null }[] =
    [];

  for (const item of attempt.items) {
    const { earned, isCorrect } = scoreAnswer(
      {
        category: item.question.category,
        correctAnswer: item.question.correctAnswer,
        optionWeights: item.question.optionWeights,
      },
      item.userAnswer,
    );
    if (item.question.category === "TWK") scoreTWK += earned;
    else if (item.question.category === "TIU") scoreTIU += earned;
    else if (item.question.category === "TKP") scoreTKP += earned;

    itemUpdates.push({ id: item.id, earned, isCorrect });
  }

  const totalScore = scoreTWK + scoreTIU + scoreTKP;
  const threshold = thresholdFor(attempt.mode);
  const lulus =
    scoreTWK >= threshold.TWK &&
    scoreTIU >= threshold.TIU &&
    scoreTKP >= threshold.TKP;
  const passingStatus = lulus ? "lulus" : "tidak_lulus";

  const finishedAt = new Date();
  const durationSec = Math.floor(
    (finishedAt.getTime() - attempt.startedAt.getTime()) / 1000,
  );

  // Persist scores. Avoid 30-50 serial UPDATE round-trips inside a single
  // transaction (Vercel iad1 → Supabase Singapore ≈ 250ms each = >5s default
  // Prisma transaction timeout → P2028). Strategy:
  //   1) Update Attempt totals first (one round-trip).
  //   2) Update each item OUTSIDE transaction in parallel (Promise.all).
  // Both writes are idempotent, and submitAttempt is itself guarded by
  // `attempt.status === SUBMITTED` early-return → safe even on partial retry.
  await prisma.attempt.update({
    where: { id: attemptId },
    data: {
      status: "SUBMITTED",
      finishedAt,
      durationSec,
      scoreTWK,
      scoreTIU,
      scoreTKP,
      totalScore,
      passingStatus,
    },
  });

  // Bulk update items in parallel — 30-50 updates resolve in ~1 RTT instead of N.
  await Promise.all(
    itemUpdates.map((u) =>
      prisma.attemptItem.update({
        where: { id: u.id },
        data: {
          scoreEarned: u.earned,
          isCorrect: u.isCorrect,
        },
      }),
    ),
  );

  console.log(
    `[submitAttempt] PERSISTED scores TWK=${scoreTWK} TIU=${scoreTIU} TKP=${scoreTKP} total=${totalScore} status=${passingStatus}`,
  );

  revalidatePath(`/lab-tryout/${attemptId}`);
  console.log(`[submitAttempt] redirecting → /lab-tryout/${attemptId}/result`);
  redirect(`/lab-tryout/${attemptId}/result`);
}

/**
 * Auto-expire on timeout. Same as submit but flagged differently.
 * Called from client when timer reaches zero.
 */
export async function expireAttempt(attemptId: string): Promise<void> {
  const userId = await resolveUserId();
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    select: { userId: true, status: true },
  });
  if (!attempt || attempt.userId !== userId) return;
  if (attempt.status !== "IN_PROGRESS") return;

  // Score then mark EXPIRED (separate state from manual SUBMITTED)
  await submitAttempt(attemptId);
  // submitAttempt redirects, so this never returns; but keep for clarity:
  await prisma.attempt.update({
    where: { id: attemptId },
    data: { status: "EXPIRED" },
  });
}
