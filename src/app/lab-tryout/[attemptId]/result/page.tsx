import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { CheckCircle2, XCircle } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/get-user";
import { MODE_CONFIG, thresholdFor } from "@/lib/tryout/config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

const ANON_COOKIE = "cita_anon_id";

export const metadata: Metadata = {
  title: "Hasil tryout",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ attemptId: string }>;
};

export default async function LabTryoutResultPage({ params }: Props) {
  const { attemptId } = await params;

  const supabaseUser = await getCurrentUser();
  const cookieStore = await cookies();
  const anonCookie = cookieStore.get(ANON_COOKIE)?.value;
  const viewerId = supabaseUser?.id ?? anonCookie ?? null;

  console.log(
    `[result] attemptId=${attemptId} viewerId=${viewerId} supabaseUser=${supabaseUser?.id ?? "null"} anonCookie=${anonCookie ?? "null"}`,
  );

  if (!viewerId) {
    console.error(`[result] NO VIEWER ID → redirect /lab-tryout`);
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

  console.log(
    `[result] attempt=${attempt?.id ?? "null"} userId=${attempt?.userId ?? "null"} status=${attempt?.status ?? "null"}`,
  );

  if (!attempt) {
    console.error(`[result] ATTEMPT NOT FOUND → 404`);
    notFound();
  }
  if (attempt.userId !== viewerId) {
    console.error(
      `[result] OWNERSHIP FAIL viewer=${viewerId} attemptUser=${attempt.userId} → 404`,
    );
    notFound();
  }

  if (attempt.status === "IN_PROGRESS") {
    console.log(`[result] STILL IN_PROGRESS → redirect to attempt page`);
    redirect(`/lab-tryout/${attemptId}`);
  }

  const cfg = MODE_CONFIG[attempt.mode];
  const threshold = thresholdFor(attempt.mode);

  const scoreTWK = attempt.scoreTWK ?? 0;
  const scoreTIU = attempt.scoreTIU ?? 0;
  const scoreTKP = attempt.scoreTKP ?? 0;
  const total = attempt.totalScore ?? 0;
  const lulus = attempt.passingStatus === "lulus";

  const passByCategory = {
    TWK: scoreTWK >= threshold.TWK,
    TIU: scoreTIU >= threshold.TIU,
    TKP: scoreTKP >= threshold.TKP,
  };

  const correctCount = attempt.items.filter((it) => it.isCorrect === true).length;
  const wrongCount = attempt.items.filter((it) => it.isCorrect === false).length;
  const skippedCount = attempt.items.filter((it) => !it.userAnswer).length;

  const durationMin = Math.floor((attempt.durationSec ?? 0) / 60);
  const durationSec = (attempt.durationSec ?? 0) % 60;

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-8">
      <nav className="mb-4 text-sm">
        <Link
          href="/lab-tryout"
          className="text-muted-foreground hover:text-foreground"
        >
          ← Tryout lain
        </Link>
      </nav>

      {/* Big banner: lulus / tidak lulus */}
      <header className="mb-8 rounded-md border border-border/60 p-6 sm:p-8">
        <div className="flex items-start gap-4">
          {lulus ? (
            <CheckCircle2
              className="size-10 flex-shrink-0 text-emerald-600 dark:text-emerald-400"
              aria-hidden="true"
            />
          ) : (
            <XCircle
              className="size-10 flex-shrink-0 text-rose-600 dark:text-rose-400"
              aria-hidden="true"
            />
          )}
          <div className="flex-1">
            <Badge variant="outline" className="mb-2 font-mono text-xs">
              {cfg.labelId} · {attempt.status === "EXPIRED" ? "Expired" : "Submitted"}
            </Badge>
            <h1 className="serif text-3xl font-medium">
              {lulus ? "Lulus" : "Belum lulus"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {lulus
                ? "Semua kategori melewati ambang batas. Pertahankan ritme."
                : "Salah satu kategori belum mencapai ambang. Lihat breakdown di bawah untuk fokus latihan berikutnya."}
            </p>
            <dl className="mt-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-muted-foreground">Total skor</dt>
                <dd className="serif text-2xl">{total}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Benar</dt>
                <dd className="serif text-2xl text-emerald-600 dark:text-emerald-400">
                  {correctCount}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Salah</dt>
                <dd className="serif text-2xl text-rose-600 dark:text-rose-400">
                  {wrongCount}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Kosong</dt>
                <dd className="serif text-2xl text-muted-foreground">
                  {skippedCount}
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-xs text-muted-foreground">
              Durasi: {durationMin} menit {durationSec} detik · {attempt.items.length} soal
            </p>
          </div>
        </div>
      </header>

      {/* Per-category breakdown */}
      <section className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-3">
        {(["TWK", "TIU", "TKP"] as const).map((cat) => {
          const score =
            cat === "TWK" ? scoreTWK : cat === "TIU" ? scoreTIU : scoreTKP;
          const pass = passByCategory[cat];
          const min = threshold[cat];
          return (
            <Card
              key={cat}
              className={
                pass
                  ? "border-emerald-300 dark:border-emerald-800"
                  : "border-rose-300 dark:border-rose-800"
              }
            >
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-lg">{cat}</CardTitle>
                  <Badge
                    variant="outline"
                    className={
                      pass
                        ? "border-emerald-500 text-emerald-700 dark:text-emerald-300"
                        : "border-rose-500 text-rose-700 dark:text-rose-300"
                    }
                  >
                    {pass ? "lulus" : "belum"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="serif text-3xl">{score}</span>
                  <span className="text-sm text-muted-foreground">/ ≥{min}</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {cfg.perCategory[cat]} soal · ambang batas{" "}
                  {attempt.mode === "FULL" ? "SKD resmi" : "scaled mini"}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* Question-by-question review */}
      <section>
        <h2 className="serif mb-4 text-2xl">Tinjauan soal</h2>
        <div className="space-y-3">
          {attempt.items.map((it, i) => {
            const isCorrect = it.isCorrect === true;
            const isWrong = it.isCorrect === false;
            const isSkipped = !it.userAnswer;

            const tone = isCorrect
              ? "border-emerald-300 bg-emerald-50/40 dark:border-emerald-900 dark:bg-emerald-950/20"
              : isWrong
                ? "border-rose-300 bg-rose-50/40 dark:border-rose-900 dark:bg-rose-950/20"
                : "border-border bg-muted/30";

            const weights = it.question.optionWeights as Record<string, number> | null;

            return (
              <details
                key={it.id}
                className={`group rounded-md border ${tone} px-4 py-3`}
              >
                <summary className="flex cursor-pointer items-start gap-3 text-sm">
                  <span className="font-mono text-xs text-muted-foreground">
                    #{i + 1}
                  </span>
                  <span className="flex-1 leading-snug">
                    {it.question.questionText.length > 90
                      ? it.question.questionText.slice(0, 90) + "…"
                      : it.question.questionText}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {it.question.category}
                  </Badge>
                  {isCorrect && (
                    <span className="font-mono text-xs text-emerald-700 dark:text-emerald-300">
                      +{it.scoreEarned}
                    </span>
                  )}
                  {it.question.category === "TKP" && it.scoreEarned > 0 && (
                    <span className="font-mono text-xs text-emerald-700 dark:text-emerald-300">
                      +{it.scoreEarned}
                    </span>
                  )}
                  {isWrong && (
                    <span className="font-mono text-xs text-rose-700 dark:text-rose-300">
                      ✗
                    </span>
                  )}
                  {isSkipped && (
                    <span className="font-mono text-xs text-muted-foreground">
                      kosong
                    </span>
                  )}
                </summary>
                <div className="mt-3 space-y-2 border-t border-border/60 pt-3 text-sm">
                  <p>
                    <span className="text-xs text-muted-foreground">
                      Jawaban Anda:{" "}
                    </span>
                    <span className="font-mono">
                      {it.userAnswer ?? "—"}
                    </span>
                    {it.question.correctAnswer && (
                      <>
                        <span className="ml-3 text-xs text-muted-foreground">
                          Kunci:{" "}
                        </span>
                        <span className="font-mono">
                          {it.question.correctAnswer}
                        </span>
                      </>
                    )}
                  </p>
                  {weights && (
                    <p className="text-xs text-muted-foreground">
                      Bobot per opsi:{" "}
                      <span className="font-mono">
                        {Object.entries(weights)
                          .map(([k, v]) => `${k}=${v}`)
                          .join(" · ")}
                      </span>
                    </p>
                  )}
                  {it.question.explanation && (
                    <p className="text-sm text-foreground/90">
                      <span className="text-xs text-muted-foreground">
                        Penjelasan:{" "}
                      </span>
                      {it.question.explanation}
                    </p>
                  )}
                  <p className="text-[10px] font-mono text-muted-foreground">
                    {it.question.subcategory} · {it.question.topic} ·{" "}
                    difficulty {it.question.difficulty}
                  </p>
                </div>
              </details>
            );
          })}
        </div>
      </section>

      {/* CTAs */}
      <footer className="mt-10 flex flex-wrap gap-3 border-t border-border/60 pt-6">
        <Link href="/lab-tryout">
          <Button>Tryout lagi</Button>
        </Link>
        <Link href="/lab">
          <Button variant="outline">Lihat bank soal</Button>
        </Link>
      </footer>
    </main>
  );
}
