import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { getDict } from "@/lib/i18n";
import { getActiveShareByShareId } from "@/lib/share/result-share";
import { MODE_CONFIG } from "@/lib/tryout/config";
import { ShareCtaCopy } from "./share-cta-copy";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ shareId: string }>;
}

/**
 * Public read-only share page for an Attempt result.
 *
 *   - Anyone with the link can view (no auth required).
 *   - Honors per-share `showName` toggle for privacy.
 *   - Robots noindex: searchable only via direct link.
 *   - Includes OG / Twitter metadata so previews render rich cards.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { shareId } = await params;
  const share = await getActiveShareByShareId(shareId);
  if (!share) {
    return {
      title: "Hasil tidak tersedia · Cita",
      robots: { index: false, follow: false },
    };
  }

  const a = share.attempt;
  const cfg = MODE_CONFIG[a.mode];
  const totalQ = cfg.totalSoal;
  const totalScore = a.totalScore ?? 0;
  const scorePct =
    totalQ > 0 ? Math.round((totalScore / totalQ) * 100) : 0;
  const modeLabel = a.mode === "MINI" ? "Tryout Mini" : "Tryout Lengkap";

  const namePart = share.showName && share.attempt.user.displayName
    ? `oleh ${share.attempt.user.displayName} `
    : "";

  const title = `Skor ${scorePct}% · ${modeLabel} SKD CPNS · Cita`;
  const description = `Hasil ${modeLabel} ${namePart}di Cita. TWK ${a.scoreTWK ?? 0} · TIU ${a.scoreTIU ?? 0} · TKP ${a.scoreTKP ?? 0}.`;

  // OG image route
  const ogUrl = `/api/og/result/${shareId}`;

  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: {
      title,
      description,
      type: "article",
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogUrl],
    },
  };
}

export default async function ResultSharePage({ params }: PageProps) {
  const { shareId } = await params;
  const share = await getActiveShareByShareId(shareId);
  if (!share) notFound();

  const t = await getDict();
  const isEn = t.locale === "en";
  const a = share.attempt;
  const cfg = MODE_CONFIG[a.mode];
  const totalQ = cfg.totalSoal;
  const totalScore = a.totalScore ?? 0;
  const scorePct =
    totalQ > 0 ? (totalScore / totalQ) * 100 : 0;

  const modeLabel = a.mode === "MINI"
    ? (isEn ? "Mini Tryout" : "Tryout Mini")
    : (isEn ? "Full Tryout" : "Tryout Lengkap");

  const passedRule = a.passingStatus === "LULUS";
  const dateStr = formatDate(a.startedAt, isEn);
  const displayName =
    share.showName && a.user.displayName ? a.user.displayName : null;

  const subtests = [
    { code: "TWK" as const, score: a.scoreTWK ?? 0, full: cfg.perCategory.TWK * 5 },
    { code: "TIU" as const, score: a.scoreTIU ?? 0, full: cfg.perCategory.TIU * 5 },
    { code: "TKP" as const, score: a.scoreTKP ?? 0, full: cfg.perCategory.TKP * 5 },
  ];

  const SUBTEST_LABEL_ID: Record<"TWK" | "TIU" | "TKP", string> = {
    TWK: isEn ? "Civic knowledge" : "Wawasan kebangsaan",
    TIU: isEn ? "Reasoning" : "Intelegensi umum",
    TKP: isEn ? "Personal characteristics" : "Karakteristik pribadi",
  };

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
          <p className="label-caps mb-4 text-muted-foreground">
            {isEn ? "Public result · read-only" : "Hasil publik · hanya-baca"}
          </p>

          <h1 className="serif text-4xl sm:text-5xl text-foreground leading-tight mb-3">
            {displayName
              ? isEn
                ? `${displayName}'s SKD CPNS result`
                : `Hasil SKD CPNS ${displayName}`
              : isEn
                ? "An SKD CPNS tryout result"
                : "Sebuah hasil tryout SKD CPNS"}
          </h1>
          <p className="text-base text-muted-foreground mb-10">
            {modeLabel} · {dateStr}
          </p>

          {/* Score card */}
          <article className="rounded-2xl border border-border bg-card p-8 sm:p-10 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-8">
              <div>
                <p className="label-caps mb-2 text-muted-foreground">
                  {isEn ? "Total score" : "Skor total"}
                </p>
                <p className="serif text-7xl text-foreground tabular-nums leading-none">
                  {Math.round(scorePct)}
                  <span className="text-3xl text-muted-foreground">%</span>
                </p>
                <p className="mt-2 text-sm text-muted-foreground tabular-nums">
                  {totalScore} / {totalQ * 5}
                </p>
              </div>
              {a.passingStatus && (
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] ${
                    passedRule
                      ? "border-[var(--success-fg)]/30 bg-[var(--success-soft)] text-[var(--success-fg)]"
                      : "border-border bg-secondary text-muted-foreground"
                  }`}
                >
                  {passedRule
                    ? isEn ? "Passed" : "Lulus ambang"
                    : isEn ? "Below threshold" : "Belum lulus"}
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {subtests.map((s) => (
                <div
                  key={s.code}
                  className="rounded-lg border border-border bg-background p-4"
                >
                  <p className="label-caps mb-1.5 text-muted-foreground">
                    {s.code}
                  </p>
                  <p className="serif text-2xl text-foreground tabular-nums">
                    {s.score}
                  </p>
                  <p className="text-xs text-muted-foreground tabular-nums mt-0.5">
                    / {s.full}
                  </p>
                  <p className="mt-2 text-[11px] text-muted-foreground leading-tight">
                    {SUBTEST_LABEL_ID[s.code]}
                  </p>
                </div>
              ))}
            </div>
          </article>

          {/* CTA — try Cita yourself */}
          <article className="rounded-2xl border border-dashed border-border bg-secondary/40 p-8 sm:p-10 mb-8">
            <Sparkles className="size-6 text-foreground mb-4" strokeWidth={1.5} />
            <h2 className="serif text-2xl text-foreground mb-2">
              {isEn
                ? "Want to try the same tryout?"
                : "Mau coba tryout yang sama?"}
            </h2>
            <p className="text-base text-muted-foreground mb-6 leading-relaxed">
              {isEn
                ? "Cita is a free SKD CPNS preparation platform with an AI tutor and personalized analysis. Sign up to save your history and unlock per-question tutoring."
                : "Cita adalah platform persiapan SKD CPNS gratis dengan tutor AI dan analisis personal. Daftar gratis untuk menyimpan riwayat dan membuka tutor per soal."}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/tryout"
                className="inline-flex items-center gap-2 rounded-md bg-foreground text-background px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
              >
                {isEn ? "Start a tryout" : "Mulai tryout"}
                <ArrowRight className="size-4" strokeWidth={1.75} />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
              >
                {isEn ? "Create an account" : "Buat akun"}
              </Link>
            </div>
          </article>

          <ShareCtaCopy
            shareId={share.shareId}
            scorePct={Math.round(scorePct)}
            modeLabel={modeLabel}
            locale={t.locale as "id" | "en"}
          />

          <p className="mt-10 text-center text-xs text-muted-foreground">
            {isEn
              ? "Shared via Cita — cita.id"
              : "Dibagikan melalui Cita — cita.id"}
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function formatDate(d: Date, isEn: boolean): string {
  return d.toLocaleDateString(isEn ? "en-US" : "id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
