import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Clock, Target } from "lucide-react";
import { startTryout } from "./actions";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/get-user";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MODE_CONFIG } from "@/lib/tryout/config";

export const metadata: Metadata = {
  title: "Mulai Tryout SKD CPNS",
  description:
    "Pilih mode latihan: drill mini 30 soal atau simulasi penuh 110 soal mirror SKD CPNS resmi.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const ANON_COOKIE = "cita_anon_id";

export default async function LabTryoutBriefingPage() {
  // Check for any in-progress attempt — offer resume CTA if so
  const supabaseUser = await getCurrentUser();
  const cookieStore = await cookies();
  const userId =
    supabaseUser?.id ?? cookieStore.get(ANON_COOKIE)?.value ?? null;

  let inProgress: { id: string; mode: "MINI" | "FULL" } | null = null;
  if (userId) {
    const a = await prisma.attempt.findFirst({
      where: { userId, status: "IN_PROGRESS" },
      orderBy: { startedAt: "desc" },
      select: { id: true, mode: true },
    });
    if (a) inProgress = { id: a.id, mode: a.mode };
  }

  // If exactly one in-progress, redirect straight to it (resume UX)
  if (inProgress) {
    redirect(`/lab-tryout/${inProgress.id}`);
  }

  const mini = MODE_CONFIG.MINI;
  const full = MODE_CONFIG.FULL;

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-8">
      <header className="mb-10">
        <h1 className="serif text-4xl font-medium tracking-tight">
          Pilih mode latihan
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Latihan harian untuk konsisten, atau simulasi penuh untuk merasakan
          atmosfer SKD CPNS resmi. Pilih sesuai ritme persiapan Anda.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* MINI */}
        <Card className="flex flex-col">
          <CardHeader>
            <div className="mb-3 flex items-center gap-2">
              <Target className="size-4 text-foreground" aria-hidden="true" />
              <Badge variant="outline" className="font-mono text-xs">
                drill harian
              </Badge>
            </div>
            <CardTitle className="text-2xl">{mini.labelId}</CardTitle>
            <CardDescription className="mt-2">{mini.taglineId}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col">
            <dl className="grid grid-cols-2 gap-4 border-y border-border/60 py-4 text-sm">
              <div>
                <dt className="text-muted-foreground">Total soal</dt>
                <dd className="serif text-2xl">{mini.totalSoal}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Durasi</dt>
                <dd className="serif text-2xl">
                  {mini.durationMin}{" "}
                  <span className="text-base font-normal">menit</span>
                </dd>
              </div>
            </dl>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>· {mini.perCategory.TWK} soal TWK</li>
              <li>· {mini.perCategory.TIU} soal TIU</li>
              <li>· {mini.perCategory.TKP} soal TKP</li>
              <li className="pt-2 text-xs">
                Cocok untuk pemanasan harian. Pool memungkinkan 6+ tryout unik
                tanpa mengulang soal.
              </li>
            </ul>
            <form action={startTryout} className="mt-auto pt-6">
              <input type="hidden" name="mode" value="MINI" />
              <Button type="submit" className="w-full" size="lg">
                Mulai Drill Mini
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* FULL */}
        <Card className="flex flex-col border-foreground/30">
          <CardHeader>
            <div className="mb-3 flex items-center gap-2">
              <Clock className="size-4 text-foreground" aria-hidden="true" />
              <Badge className="font-mono text-xs">mirror SKD asli</Badge>
            </div>
            <CardTitle className="text-2xl">{full.labelId}</CardTitle>
            <CardDescription className="mt-2">{full.taglineId}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col">
            <dl className="grid grid-cols-2 gap-4 border-y border-border/60 py-4 text-sm">
              <div>
                <dt className="text-muted-foreground">Total soal</dt>
                <dd className="serif text-2xl">{full.totalSoal}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Durasi</dt>
                <dd className="serif text-2xl">
                  {full.durationMin}{" "}
                  <span className="text-base font-normal">menit</span>
                </dd>
              </div>
            </dl>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>· {full.perCategory.TWK} soal TWK</li>
              <li>· {full.perCategory.TIU} soal TIU</li>
              <li>· {full.perCategory.TKP} soal TKP</li>
              <li className="pt-2 text-xs">
                Mirror persis SKD CPNS 2026. Pakai 1-2 minggu sekali sebelum
                ujian beneran untuk melatih stamina mental.
              </li>
            </ul>
            <form action={startTryout} className="mt-auto pt-6">
              <input type="hidden" name="mode" value="FULL" />
              <Button
                type="submit"
                className="w-full"
                size="lg"
                variant="outline"
              >
                Mulai Simulasi Penuh
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      <footer className="mt-12 border-t border-border/60 pt-6 text-center text-xs text-muted-foreground">
        <p>
          Lab tryout — uses the new schema + 200 soal pool.{" "}
          <Link
            href="/tryout"
            className="underline-offset-4 hover:underline"
          >
            Tryout produksi
          </Link>{" "}
          tetap aktif di /tryout.
        </p>
      </footer>
    </main>
  );
}
