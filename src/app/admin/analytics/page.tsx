import {
  getFunnelStats,
  getMrrSeries,
  getCategoryAccuracy,
  getHardestQuestions,
} from "@/lib/admin/analytics";
import { formatIdr } from "@/lib/admin/format";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminAnalyticsPage() {
  const [funnel, mrr, categoryAcc, hardest] = await Promise.all([
    getFunnelStats(),
    getMrrSeries(30),
    getCategoryAccuracy(),
    getHardestQuestions(),
  ]);

  const totalRevenue = mrr.reduce((acc, p) => acc + p.revenueIdr, 0);
  const maxDayRevenue = Math.max(1, ...mrr.map((p) => p.revenueIdr));

  return (
    <div className="space-y-10">
      <header>
        <h1 className="serif text-3xl text-foreground leading-tight">
          Analytics
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Funnel, MRR 30 hari, akurasi per kategori, soal tersulit.
        </p>
      </header>

      {/* Funnel */}
      <section>
        <h2 className="text-sm font-medium text-foreground mb-3">
          Conversion funnel
        </h2>
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <FunnelStep
            label="Signup"
            count={funnel.totalSignups}
            pctOfPrev={100}
            pctOfFirst={100}
          />
          <FunnelStep
            label="Tried tryout"
            count={funnel.triedTryout}
            pctOfPrev={funnel.signupToTryoutPct}
            pctOfFirst={funnel.signupToTryoutPct}
          />
          <FunnelStep
            label="Paid Premium"
            count={funnel.paidPremium}
            pctOfPrev={funnel.tryoutToPaidPct}
            pctOfFirst={funnel.signupToPaidPct}
          />
        </div>
      </section>

      {/* MRR */}
      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-sm font-medium text-foreground">
            MRR 30 hari terakhir
          </h2>
          <p className="text-xs text-muted-foreground tabular-nums">
            Total: {formatIdr(totalRevenue)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="grid grid-cols-30 gap-[2px] h-24 items-end">
            {mrr.map((p) => {
              const h = Math.max(2, Math.round((p.revenueIdr / maxDayRevenue) * 100));
              return (
                <div
                  key={p.date}
                  className="relative group"
                  title={`${p.date} · ${p.paidOrders} order · ${formatIdr(p.revenueIdr)}`}
                >
                  <div
                    className="w-full rounded-sm bg-[var(--gold)] opacity-80 hover:opacity-100 transition-opacity"
                    style={{ height: `${h}%`, minHeight: 2 }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-muted-foreground tabular-nums">
            <span>{mrr[0]?.date}</span>
            <span>{mrr[Math.floor(mrr.length / 2)]?.date}</span>
            <span>{mrr[mrr.length - 1]?.date}</span>
          </div>
        </div>
      </section>

      {/* Category accuracy */}
      <section>
        <h2 className="text-sm font-medium text-foreground mb-3">
          Akurasi per kategori (semua attempts)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {categoryAcc.map((c) => (
            <div
              key={c.category}
              className="rounded-xl border border-border bg-card p-5"
            >
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                {c.category}
              </p>
              <p className="serif text-2xl text-foreground mt-2 tabular-nums">
                {c.pctCorrect.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground mt-1.5">
                {c.correctItems}/{c.attemptsAnsweredItems} jawaban benar
              </p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
          TKP tidak ada satu jawaban benar — TKP biasanya 0% (skor weighted).
          Fokuskan analisa di TWK + TIU.
        </p>
      </section>

      {/* Hardest questions */}
      <section>
        <h2 className="text-sm font-medium text-foreground mb-3">
          10 soal tersulit (TWK/TIU, ≥5 attempts)
        </h2>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary text-xs text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Question ID</th>
                  <th className="text-left px-4 py-3 font-medium">Category</th>
                  <th className="text-left px-4 py-3 font-medium">Topic</th>
                  <th className="text-right px-4 py-3 font-medium">Attempts</th>
                  <th className="text-right px-4 py-3 font-medium">% Correct</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {hardest.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                      Belum cukup data attempt untuk hitung soal tersulit.
                    </td>
                  </tr>
                )}
                {hardest.map((q) => (
                  <tr key={q.questionId}>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {q.questionId}
                    </td>
                    <td className="px-4 py-3">{q.category}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {q.subcategory} · {q.topic}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {q.attempts}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {q.correctRate.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

function FunnelStep({
  label,
  count,
  pctOfPrev,
  pctOfFirst,
}: {
  label: string;
  count: number;
  pctOfPrev: number;
  pctOfFirst: number;
}) {
  const widthPct = Math.max(2, Math.min(100, pctOfFirst));
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5 text-sm">
        <span className="text-foreground">{label}</span>
        <span className="text-muted-foreground tabular-nums">
          {count} · {pctOfPrev.toFixed(1)}%
        </span>
      </div>
      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-foreground rounded-full transition-all"
          style={{ width: `${widthPct}%` }}
        />
      </div>
    </div>
  );
}
