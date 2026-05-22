import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Calendar, ChevronLeft, ChevronRight, ListChecks } from "lucide-react";
import type { AttemptMode } from "@prisma/client";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { getCurrentUser } from "@/lib/auth/get-user";
import { getDict } from "@/lib/i18n";
import { listAttemptHistory, getAttemptSummary } from "@/lib/account/history";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{
    mode?: string;
    from?: string;
    to?: string;
    page?: string;
  }>;
}

export default async function AkunHistoryPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login?next=/akun/history");

  const sp = await searchParams;
  const t = await getDict();
  const isEn = t.locale === "en";

  const mode = sp.mode === "MINI" || sp.mode === "FULL"
    ? (sp.mode as AttemptMode)
    : "ALL";
  const from = sp.from ?? "";
  const to = sp.to ?? "";
  const page = Number(sp.page ?? 1);

  const [summary, list] = await Promise.all([
    getAttemptSummary(user.id),
    listAttemptHistory(user.id, { mode, from, to, page, pageSize: 10 }),
  ]);

  const totalPages = Math.max(1, Math.ceil(list.total / list.pageSize));
  const hasFilter = mode !== "ALL" || from || to;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 px-4 sm:px-8 py-12 sm:py-16">
        <div className="mx-auto max-w-4xl space-y-10">
          {/* Header */}
          <div>
            <p className="label-caps mb-3">
              {isEn ? "ACCOUNT" : "AKUN"}
            </p>
            <h1 className="serif text-4xl tracking-tight text-foreground leading-tight">
              {isEn ? "Attempt history" : "Riwayat tryout"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {isEn
                ? "Review every tryout you have completed and compare your progress over time."
                : "Tinjau seluruh tryout yang pernah Anda kerjakan dan pantau perkembangan Anda."}
            </p>
            <div className="mt-4">
              <Link
                href="/akun"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="size-3" strokeWidth={2} />
                {isEn ? "Back to account" : "Kembali ke akun"}
              </Link>
            </div>
          </div>

          {/* Stats summary */}
          <section>
            <p className="label-caps mb-3">
              {isEn ? "OVERALL" : "RINGKASAN"}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard
                label={isEn ? "Total tryouts" : "Total tryout"}
                value={summary.totalAttempts.toString()}
                hint={
                  summary.totalAttempts > 0
                    ? `${summary.miniCount} MINI · ${summary.fullCount} FULL`
                    : isEn ? "No tryout yet" : "Belum ada tryout"
                }
              />
              <StatCard
                label={isEn ? "Best score" : "Skor terbaik"}
                value={summary.bestScore != null ? summary.bestScore.toString() : "—"}
                hint={
                  summary.averageScore != null
                    ? `${isEn ? "Avg" : "Rata-rata"} ${summary.averageScore}`
                    : isEn ? "Awaiting first score" : "Menunggu skor pertama"
                }
              />
              <StatCard
                label={isEn ? "Pass rate" : "Tingkat lulus"}
                value={summary.passCount + summary.failCount > 0
                  ? `${summary.passRatePct.toFixed(1)}%`
                  : "—"}
                hint={
                  summary.passCount + summary.failCount > 0
                    ? `${summary.passCount} ${isEn ? "pass" : "lulus"} · ${summary.failCount} ${isEn ? "fail" : "gagal"}`
                    : isEn ? "No graded attempt" : "Belum ada penilaian"
                }
              />
              <StatCard
                label={isEn ? "Last activity" : "Aktivitas terakhir"}
                value={summary.lastAttemptDate ?? "—"}
                hint={isEn ? "Most recent submission" : "Tryout terakhir disubmit"}
              />
            </div>
          </section>

          {/* Filters */}
          <section>
            <form
              method="get"
              className="rounded-xl border border-border bg-card p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-4 gap-3"
            >
              <div>
                <label
                  htmlFor="mode"
                  className="block text-xs text-muted-foreground mb-1.5"
                >
                  {isEn ? "Mode" : "Mode"}
                </label>
                <select
                  id="mode"
                  name="mode"
                  defaultValue={mode}
                  className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
                >
                  <option value="ALL">{isEn ? "All modes" : "Semua mode"}</option>
                  <option value="MINI">MINI</option>
                  <option value="FULL">FULL</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="from"
                  className="block text-xs text-muted-foreground mb-1.5"
                >
                  {isEn ? "From" : "Dari"}
                </label>
                <input
                  type="date"
                  id="from"
                  name="from"
                  defaultValue={from}
                  className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-foreground/20"
                />
              </div>
              <div>
                <label
                  htmlFor="to"
                  className="block text-xs text-muted-foreground mb-1.5"
                >
                  {isEn ? "To" : "Sampai"}
                </label>
                <input
                  type="date"
                  id="to"
                  name="to"
                  defaultValue={to}
                  className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-foreground/20"
                />
              </div>
              <div className="flex items-end gap-2">
                <button
                  type="submit"
                  className="rounded-md bg-foreground text-background px-4 py-2 text-sm hover:opacity-90 flex-1"
                >
                  {isEn ? "Apply" : "Terapkan"}
                </button>
                {hasFilter && (
                  <Link
                    href="/akun/history"
                    className="text-sm text-muted-foreground hover:text-foreground px-3 py-2"
                  >
                    {isEn ? "Reset" : "Reset"}
                  </Link>
                )}
              </div>
            </form>
          </section>

          {/* List */}
          <section>
            <p className="label-caps mb-3">
              {isEn ? `RESULTS (${list.total})` : `HASIL (${list.total})`}
            </p>

            {list.rows.length === 0 ? (
              <EmptyState isEn={isEn} hasFilter={Boolean(hasFilter)} />
            ) : (
              <ul className="space-y-3">
                {list.rows.map((a) => (
                  <li
                    key={a.id}
                    className="rounded-xl border border-border bg-card p-4 sm:p-5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs px-2 py-0.5 rounded-full border border-border tabular-nums">
                            {a.mode}
                          </span>
                          {a.passingStatus && (
                            <PassPill status={a.passingStatus} isEn={isEn} />
                          )}
                          {a.status === "EXPIRED" && (
                            <span className="text-xs px-2 py-0.5 rounded-full border border-amber-300/40 text-amber-700 bg-amber-50">
                              {isEn ? "Expired" : "Habis waktu"}
                            </span>
                          )}
                        </div>
                        <p className="serif text-2xl text-foreground mt-2 tabular-nums">
                          {a.totalScore != null ? a.totalScore : "—"}
                          <span className="text-sm text-muted-foreground ml-2">
                            {a.scoreTWK != null && (
                              <>TWK {a.scoreTWK} · TIU {a.scoreTIU ?? "—"} · TKP {a.scoreTKP ?? "—"}</>
                            )}
                          </span>
                        </p>
                        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground tabular-nums">
                          <span className="inline-flex items-center gap-1.5">
                            <Calendar className="size-3" strokeWidth={1.5} />
                            {formatDateTime(a.startedAt, isEn)}
                          </span>
                          {a.durationSec != null && (
                            <span className="inline-flex items-center gap-1.5">
                              <ListChecks className="size-3" strokeWidth={1.5} />
                              {formatDuration(a.durationSec, isEn)}
                            </span>
                          )}
                        </div>
                      </div>
                      <Link
                        href={`/tryout/${a.id}/result`}
                        className="inline-flex items-center justify-center gap-1 rounded-md border border-border bg-background px-4 py-2 text-sm hover:bg-secondary"
                      >
                        {isEn ? "View result" : "Lihat hasil"}
                        <ArrowRight className="size-3" strokeWidth={2} />
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
                <span className="tabular-nums">
                  {isEn
                    ? `Page ${list.page} of ${totalPages}`
                    : `Halaman ${list.page} dari ${totalPages}`}
                </span>
                <div className="flex gap-1">
                  {list.page > 1 && (
                    <Link
                      href={pageHref(sp, list.page - 1)}
                      className="inline-flex items-center gap-1 rounded border border-border px-3 py-1.5 hover:bg-secondary"
                    >
                      <ChevronLeft className="size-3" strokeWidth={2} />
                      {isEn ? "Prev" : "Sebelumnya"}
                    </Link>
                  )}
                  {list.page < totalPages && (
                    <Link
                      href={pageHref(sp, list.page + 1)}
                      className="inline-flex items-center gap-1 rounded border border-border px-3 py-1.5 hover:bg-secondary"
                    >
                      {isEn ? "Next" : "Berikutnya"}
                      <ChevronRight className="size-3" strokeWidth={2} />
                    </Link>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Sub-components                                                             */
/* -------------------------------------------------------------------------- */

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      <p className="serif text-2xl text-foreground mt-2 tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground mt-1.5">{hint}</p>
    </div>
  );
}

function PassPill({ status, isEn }: { status: string; isEn: boolean }) {
  const isPass = status === "PASS";
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full border ${
        isPass
          ? "border-[var(--gold)]/40 text-[var(--gold)] bg-[var(--gold)]/[0.08]"
          : "border-destructive/40 text-destructive bg-destructive/5"
      }`}
    >
      {isPass ? (isEn ? "Pass" : "Lulus") : (isEn ? "Fail" : "Belum lulus")}
    </span>
  );
}

function EmptyState({
  isEn,
  hasFilter,
}: {
  isEn: boolean;
  hasFilter: boolean;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 sm:p-12 text-center">
      <p className="serif text-xl text-foreground">
        {hasFilter
          ? (isEn ? "No tryout matches the filter." : "Tidak ada tryout yang cocok dengan filter.")
          : (isEn ? "You haven't completed a tryout yet." : "Anda belum menyelesaikan tryout.")}
      </p>
      <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-md mx-auto">
        {hasFilter
          ? (isEn
              ? "Try removing some filters to see more results."
              : "Coba hapus sebagian filter untuk melihat lebih banyak hasil.")
          : (isEn
              ? "Start a tryout to track your progress here."
              : "Mulai tryout untuk memantau perkembangan Anda di sini.")}
      </p>
      <div className="mt-5 flex items-center justify-center gap-2">
        {hasFilter ? (
          <Link
            href="/akun/history"
            className="inline-flex items-center gap-1 rounded-md border border-border px-4 py-2 text-sm hover:bg-secondary"
          >
            {isEn ? "Clear filters" : "Hapus filter"}
          </Link>
        ) : (
          <Link
            href="/tryout"
            className="inline-flex items-center gap-1 rounded-md bg-foreground text-background px-4 py-2 text-sm hover:opacity-90"
          >
            {isEn ? "Start tryout" : "Mulai tryout"}
            <ArrowRight className="size-3" strokeWidth={2} />
          </Link>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function pageHref(
  sp: { mode?: string; from?: string; to?: string; page?: string },
  page: number,
): string {
  const params = new URLSearchParams();
  if (sp.mode) params.set("mode", sp.mode);
  if (sp.from) params.set("from", sp.from);
  if (sp.to) params.set("to", sp.to);
  params.set("page", String(page));
  return `/akun/history?${params.toString()}`;
}

function formatDateTime(date: Date, isEn: boolean): string {
  const locale = isEn ? "en-GB" : "id-ID";
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

function formatDuration(sec: number, isEn: boolean): string {
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m < 60) return s > 0 ? `${m}m ${s}s` : `${m}m`;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return isEn
    ? (mm > 0 ? `${h}h ${mm}m` : `${h}h`)
    : (mm > 0 ? `${h}j ${mm}m` : `${h}j`);
}
