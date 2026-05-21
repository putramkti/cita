import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Clock, Target, Sparkles } from "lucide-react";
import { startTryout } from "./actions";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { PendingButton } from "@/components/feedback/pending-button";
import { getDict } from "@/lib/i18n";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/get-user";
import { MODE_CONFIG } from "@/lib/tryout/config";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Mulai Tryout SKD CPNS",
};

// Always run server-side per request — we redirect based on live DB state.
export const dynamic = "force-dynamic";

const ANON_COOKIE = "cita_anon_id";

/**
 * Tryout briefing — Academic Zen layout, dual mode (MINI + FULL).
 *
 * Resume-on-revisit: if the visitor already has an IN_PROGRESS attempt,
 * we redirect them straight to that attempt's exam screen.
 */
export default async function TryoutLandingPage() {
  const t = await getDict();

  // Resume hook — read viewer id without minting one (only startTryout creates).
  const supabaseUser = await getCurrentUser();
  const cookieStore = await cookies();
  const userId =
    supabaseUser?.id ?? cookieStore.get(ANON_COOKIE)?.value ?? null;

  if (userId) {
    const ongoing = await prisma.attempt.findFirst({
      where: { userId, status: "IN_PROGRESS" },
      orderBy: { startedAt: "desc" },
      select: { id: true },
    });
    if (ongoing) {
      redirect(`/tryout/${ongoing.id}`);
    }
  }

  const mini = MODE_CONFIG.MINI;
  const full = MODE_CONFIG.FULL;

  return (
    <>
      <SiteHeader />
      <main className="flex-1 px-4 sm:px-8 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-12 text-center">
            <p className="label-caps mb-4">TRYOUT SKD CPNS</p>
            <h1 className="serif text-4xl sm:text-5xl tracking-tight text-foreground leading-tight">
              {t.tryout.briefingTitle}
            </h1>
            <p className="mt-5 text-base text-muted-foreground leading-relaxed text-balance max-w-xl mx-auto">
              {t.tryout.briefingSubtitle}
            </p>
          </div>

          {/* Dual mode card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <ModeCard
              mode="MINI"
              icon={<Target className="size-5" strokeWidth={1.5} />}
              eyebrow="DRILL HARIAN"
              title={mini.labelId}
              tagline={mini.taglineId}
              soal={mini.totalSoal}
              durasi={mini.durationMin}
              perCat={mini.perCategory}
              ctaPrimary
              note="Cocok untuk pemanasan harian. Pool memungkinkan 6+ tryout unik tanpa mengulang soal."
            />
            <ModeCard
              mode="FULL"
              icon={<Sparkles className="size-5" strokeWidth={1.5} />}
              eyebrow="MIRROR SKD ASLI"
              title={full.labelId}
              tagline={full.taglineId}
              soal={full.totalSoal}
              durasi={full.durationMin}
              perCat={full.perCategory}
              note="Mirror persis SKD CPNS 2026. Pakai 1-2 minggu sekali sebelum ujian beneran untuk melatih stamina mental."
            />
          </div>

          {/* Rules */}
          <div className="mt-10 rounded-xl border border-border bg-card p-7 sm:p-9">
            <p className="label-caps mb-5">PETUNJUK SEBELUM MEMULAI</p>
            <ul className="space-y-3.5 text-sm">
              <Bullet>{t.tryout.rule2}</Bullet>
              <Bullet>{t.tryout.rule3}</Bullet>
              <Bullet>{t.tryout.rule4}</Bullet>
              <Bullet>
                Skor SKD CPNS: TWK ≥ 65 · TIU ≥ 80 · TKP ≥ 156. Untuk mode Tryout Singkat, ambang batas diskala proporsional.
              </Bullet>
            </ul>

            <p className="mt-6 pt-5 border-t border-border text-center text-xs text-muted-foreground leading-relaxed">
              {t.tryout.legalNote}{" "}
              <Link
                href="/terms"
                className="text-foreground underline underline-offset-2 hover:no-underline"
              >
                {t.footer.terms}
              </Link>{" "}
              {t.tryout.and}{" "}
              <Link
                href="/privacy"
                className="text-foreground underline underline-offset-2 hover:no-underline"
              >
                {t.footer.privacy}
              </Link>{" "}
              Cita.
            </p>
          </div>

          <p className="mt-10 text-center text-xs text-muted-foreground/80 max-w-md mx-auto leading-relaxed">
            {t.footer.disclaimer}
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

interface ModeCardProps {
  mode: "MINI" | "FULL";
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  tagline: string;
  soal: number;
  durasi: number;
  perCat: { TWK: number; TIU: number; TKP: number };
  ctaPrimary?: boolean;
  note: string;
}

function ModeCard({
  mode,
  icon,
  eyebrow,
  title,
  tagline,
  soal,
  durasi,
  perCat,
  ctaPrimary,
  note,
}: ModeCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-7 flex flex-col",
        ctaPrimary ? "border-foreground/20" : "border-border",
      )}
    >
      <div className="flex items-center gap-2 mb-4 text-foreground">
        {icon}
        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          {eyebrow}
        </span>
      </div>

      <h2 className="serif text-2xl text-foreground tracking-tight">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
        {tagline}
      </p>

      <dl className="mt-5 grid grid-cols-2 gap-4 border-y border-border py-4 text-sm">
        <div>
          <dt className="label-caps mb-1">TOTAL SOAL</dt>
          <dd className="serif text-3xl tabular-nums">{soal}</dd>
        </div>
        <div>
          <dt className="label-caps mb-1">DURASI</dt>
          <dd className="serif text-3xl tabular-nums">
            {durasi}
            <span className="text-base font-normal text-muted-foreground ml-1">
              menit
            </span>
          </dd>
        </div>
      </dl>

      <ul className="mt-4 space-y-1.5 text-xs text-muted-foreground">
        <li className="flex justify-between">
          <span>TWK</span>
          <span className="tabular-nums">{perCat.TWK} soal</span>
        </li>
        <li className="flex justify-between">
          <span>TIU</span>
          <span className="tabular-nums">{perCat.TIU} soal</span>
        </li>
        <li className="flex justify-between">
          <span>TKP</span>
          <span className="tabular-nums">{perCat.TKP} soal</span>
        </li>
      </ul>

      <p className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground leading-relaxed">
        {note}
      </p>

      <form action={startTryout} className="mt-6">
        <input type="hidden" name="mode" value={mode} />
        <PendingButton
          className={cn(
            "w-full",
            !ctaPrimary &&
              "!bg-card !text-foreground !border !border-foreground hover:!bg-foreground hover:!text-card",
          )}
          loadingLabel="Memulai…"
        >
          {mode === "MINI" ? "Mulai Tryout Singkat" : "Mulai Tryout Penuh"}
        </PendingButton>
      </form>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span
        aria-hidden="true"
        className="mt-2 size-1.5 rounded-full bg-[var(--gold)] shrink-0"
      />
      <span className="text-foreground/85 leading-relaxed">{children}</span>
    </li>
  );
}
