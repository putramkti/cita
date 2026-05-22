"use client";

import { useEffect, useState } from "react";
import {
  Sparkles,
  Bot,
  Loader2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import type { InsightPayload } from "@/lib/insight/schema";

type Status = "PENDING" | "READY" | "FAILED" | "NOT_REQUESTED";

interface PersonalizedInsightProps {
  attemptId: string;
  initialStatus: Status;
  initialPayload: InsightPayload | null;
  /** Caller plan, used to choose between Premium real insight vs static template. */
  isPremium: boolean;
  locale: "id" | "en";
  /** First wrong question for fallback CTA. */
  firstWrong: { id: string; category: string; subcategory: string } | null;
}

const POLL_INTERVAL_MS = 4000;
const MAX_POLLS = 15; // 60 sec ceiling.

export function PersonalizedInsight({
  attemptId,
  initialStatus,
  initialPayload,
  isPremium,
  locale,
  firstWrong,
}: PersonalizedInsightProps) {
  const [status, setStatus] = useState<Status>(initialStatus);
  const [payload, setPayload] = useState<InsightPayload | null>(initialPayload);
  const [error, setError] = useState<string | null>(null);

  // FREE plan: never trigger generation, render static template upsell.
  // Premium with no payload yet: trigger generation in background.
  useEffect(() => {
    if (!isPremium) return;
    if (status === "READY") return;
    if (status === "FAILED") return; // user can retry manually.

    let cancelled = false;
    let polls = 0;

    async function ensure() {
      // Kick off generation if never requested or pending.
      try {
        const resp = await fetch(`/api/insight/${attemptId}`, {
          method: "POST",
        });
        if (!resp.ok) {
          if (resp.status === 402) {
            setStatus("NOT_REQUESTED");
            return;
          }
          throw new Error(`http_${resp.status}`);
        }
        const data = (await resp.json()) as {
          status: Status;
          payload?: InsightPayload | null;
        };
        if (cancelled) return;
        if (data.status === "READY" && data.payload) {
          setPayload(data.payload);
          setStatus("READY");
          return;
        }
        // Still PENDING — start poll loop.
        setStatus("PENDING");
        const tick = setInterval(async () => {
          if (cancelled) return clearInterval(tick);
          polls += 1;
          if (polls > MAX_POLLS) {
            clearInterval(tick);
            setError("timeout");
            setStatus("FAILED");
            return;
          }
          try {
            const r = await fetch(`/api/insight/${attemptId}`);
            if (!r.ok) return;
            const d = (await r.json()) as {
              status: Status;
              payload?: InsightPayload | null;
            };
            if (d.status === "READY" && d.payload) {
              setPayload(d.payload);
              setStatus("READY");
              clearInterval(tick);
            } else if (d.status === "FAILED") {
              setStatus("FAILED");
              setError("generation_failed");
              clearInterval(tick);
            }
          } catch {
            // swallow transient errors, keep polling.
          }
        }, POLL_INTERVAL_MS);
      } catch (e) {
        if (cancelled) return;
        setError((e as Error).message);
        setStatus("FAILED");
      }
    }

    ensure();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptId, isPremium]);

  // FREE plan upsell card.
  if (!isPremium) {
    return <FreePlanInsightTeaser locale={locale} firstWrong={firstWrong} />;
  }

  // Premium states.
  if (status === "READY" && payload) {
    return <ReadyInsight payload={payload} locale={locale} />;
  }

  if (status === "FAILED") {
    return (
      <FailedInsight
        attemptId={attemptId}
        errorKey={error}
        locale={locale}
        onRetry={() => {
          setStatus("PENDING");
          setError(null);
          fetch(`/api/insight/${attemptId}`, { method: "POST" });
        }}
      />
    );
  }

  return <LoadingInsight locale={locale} />;
}

/* -------------------------------------------------------------------------- */
/*  Subviews                                                                  */
/* -------------------------------------------------------------------------- */

function ReadyInsight({
  payload,
  locale,
}: {
  payload: InsightPayload;
  locale: "id" | "en";
}) {
  const isId = locale === "id";
  return (
    <section className="rounded-xl border border-[#1f2a3a] bg-[#0c1018] text-[#e7e8e9] px-7 py-8 sm:px-10 sm:py-10 relative overflow-hidden">
      <div className="flex items-start gap-3 mb-5">
        <Sparkles
          className="size-5 text-[var(--gold-soft)]"
          strokeWidth={1.5}
        />
        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/60">
          {isId ? "ANALISA PERSONAL" : "PERSONAL INSIGHT"}
        </span>
      </div>

      {/* Summary */}
      <p className="serif text-xl sm:text-2xl leading-relaxed text-white/90 max-w-3xl">
        {payload.summary}
      </p>

      {/* Strengths + Weaknesses */}
      <div className="grid sm:grid-cols-2 gap-4 mt-8">
        {payload.strengths.length > 0 && (
          <div className="rounded-lg border border-[#1f2a3a] bg-[#11161e] p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp
                className="size-4 text-[var(--gold-soft)]"
                strokeWidth={1.5}
              />
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/70">
                {isId ? "KEKUATAN ANDA" : "YOUR STRENGTHS"}
              </span>
            </div>
            <ul className="space-y-2.5">
              {payload.strengths.map((s, i) => (
                <li key={i} className="text-sm text-white/85 flex items-start gap-2">
                  <span className="text-[var(--gold-soft)] mt-0.5">✓</span>
                  <span className="flex-1">
                    <span className="text-white/95">{s.label}</span>
                    <span className="text-white/55 tabular-nums ml-2">
                      ({s.correct}/{s.attempted})
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {payload.weaknesses.length > 0 && (
          <div className="rounded-lg border border-[#1f2a3a] bg-[#11161e] p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown
                className="size-4 text-amber-300"
                strokeWidth={1.5}
              />
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/70">
                {isId ? "AREA YANG PERLU DILATIH" : "AREAS TO IMPROVE"}
              </span>
            </div>
            <ul className="space-y-3">
              {payload.weaknesses.map((w, i) => (
                <li key={i} className="text-sm">
                  <div className="flex items-baseline gap-2">
                    <span className="text-white/95">{w.label}</span>
                    <span className="text-white/55 tabular-nums">
                      ({w.correct}/{w.attempted})
                    </span>
                  </div>
                  {w.suggestion && (
                    <p className="text-white/65 text-xs mt-1 leading-relaxed">
                      {w.suggestion}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Recommendations */}
      {payload.recommendations.length > 0 && (
        <div className="mt-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/60 mb-3">
            {isId ? "LANGKAH BERIKUTNYA" : "NEXT STEPS"}
          </p>
          <ul className="space-y-2">
            {payload.recommendations.map((r, i) => (
              <li
                key={i}
                className="text-sm text-white/80 flex items-start gap-2 leading-relaxed"
              >
                <span className="text-[var(--gold-soft)] mt-0.5">•</span>
                <span className="flex-1">{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Decorative accent */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 -right-20 size-60 rounded-full bg-[var(--gold)]/10 blur-3xl"
      />
    </section>
  );
}

function LoadingInsight({ locale }: { locale: "id" | "en" }) {
  const isId = locale === "id";
  return (
    <section className="rounded-xl border border-[#1f2a3a] bg-[#0c1018] text-[#e7e8e9] px-7 py-8 sm:px-10 sm:py-10 relative overflow-hidden">
      <div className="flex items-start gap-3 mb-5">
        <Sparkles
          className="size-5 text-[var(--gold-soft)]"
          strokeWidth={1.5}
        />
        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/60">
          {isId ? "ANALISA PERSONAL" : "PERSONAL INSIGHT"}
        </span>
      </div>
      <div className="flex items-start gap-3">
        <Loader2
          className="size-5 text-white/60 animate-spin flex-shrink-0 mt-1"
          strokeWidth={1.5}
        />
        <div>
          <p className="serif text-xl text-white/90">
            {isId ? "Sedang menganalisa hasil Anda" : "Analyzing your result"}
          </p>
          <p className="text-sm text-white/60 mt-1.5 leading-relaxed">
            {isId
              ? "Proses ini biasanya memakan waktu kurang dari satu menit."
              : "This usually takes less than a minute."}
          </p>
        </div>
      </div>
    </section>
  );
}

function FailedInsight({
  errorKey,
  locale,
  onRetry,
}: {
  attemptId: string;
  errorKey: string | null;
  locale: "id" | "en";
  onRetry: () => void;
}) {
  const isId = locale === "id";
  return (
    <section className="rounded-xl border border-amber-300/30 bg-amber-50/50 px-7 py-8 sm:px-10 sm:py-10">
      <div className="flex items-start gap-3 mb-3">
        <AlertCircle
          className="size-5 text-amber-700 flex-shrink-0 mt-0.5"
          strokeWidth={1.5}
        />
        <div className="flex-1">
          <p className="text-sm font-medium text-amber-900">
            {isId
              ? "Analisa belum dapat dibuat"
              : "Analysis is unavailable"}
          </p>
          <p className="text-sm text-amber-800/80 mt-1 leading-relaxed">
            {isId
              ? "Layanan analisa sedang sibuk. Silakan coba lagi sebentar."
              : "The analysis service is busy. Please try again shortly."}
            {errorKey ? (
              <span className="text-xs text-amber-700/60 ml-2">
                ({errorKey})
              </span>
            ) : null}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-amber-300/50 bg-white/60 px-4 py-2 text-sm text-amber-900 hover:bg-white"
      >
        {isId ? "Coba lagi" : "Retry"}
      </button>
    </section>
  );
}

function FreePlanInsightTeaser({
  locale,
  firstWrong,
}: {
  locale: "id" | "en";
  firstWrong: { id: string; category: string; subcategory: string } | null;
}) {
  const isId = locale === "id";
  return (
    <section className="rounded-xl border border-[#1f2a3a] bg-[#0c1018] text-[#e7e8e9] px-7 py-8 sm:px-10 sm:py-10 relative overflow-hidden">
      <div className="flex items-start gap-3 mb-5">
        <Sparkles
          className="size-5 text-[var(--gold-soft)]"
          strokeWidth={1.5}
        />
        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/60">
          {isId ? "ANALISA PERSONAL" : "PERSONAL INSIGHT"}
        </span>
      </div>
      <p className="serif text-xl sm:text-2xl leading-relaxed text-white/90 max-w-3xl">
        {firstWrong
          ? isId
            ? `Topik ${firstWrong.subcategory} (${firstWrong.category}) layak Anda dalami terlebih dulu. Buka langganan Premium untuk analisa lengkap kekuatan, kelemahan, dan rekomendasi belajar yang dipersonalisasi.`
            : `${firstWrong.subcategory} (${firstWrong.category}) is the first topic worth revisiting. Unlock a full personalized breakdown — strengths, weaknesses, and study recommendations — with Premium.`
          : isId
          ? "Premium membuka analisa lengkap untuk setiap tryout: kekuatan utama, area yang perlu dilatih, dan rekomendasi belajar yang dipersonalisasi."
          : "Premium unlocks a full per-tryout analysis: strengths, weak areas, and personalized study recommendations."}
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Link
          href="/pricing"
          className="inline-flex items-center gap-1.5 rounded-md bg-[var(--gold)] text-black px-4 py-2 text-sm font-medium hover:opacity-90"
        >
          {isId ? "Lihat paket Premium" : "See Premium plans"}
          <ArrowRight className="size-3.5" strokeWidth={2} />
        </Link>
        {firstWrong && (
          <Link
            href={`/study/${firstWrong.id}`}
            className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white"
          >
            <Bot className="size-4" strokeWidth={1.5} />
            {isId ? "Tanya Cita Tutor" : "Ask Cita Tutor"}
          </Link>
        )}
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 -right-20 size-60 rounded-full bg-[var(--gold)]/10 blur-3xl"
      />
    </section>
  );
}
