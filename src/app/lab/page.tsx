import Link from "next/link";
import type { Metadata } from "next";
import { loadBatchSummaries, getStats } from "@/lib/lab/loader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Lab — Preview Soal CPNS",
  description: "Preview internal: 200 soal CPNS Cita (TWK + TIU + TKP) untuk QA & review.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-static";
export const revalidate = false;

const categoryColor: Record<string, string> = {
  TWK: "bg-blue-100 text-blue-900 dark:bg-blue-950/40 dark:text-blue-200",
  TIU: "bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
  TKP: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200",
  MIXED: "bg-muted text-foreground",
};

export default async function LabIndexPage() {
  const [summaries, stats] = await Promise.all([
    loadBatchSummaries(),
    getStats(),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-8">
      <header className="mb-10 border-b border-border/60 pb-6">
        <div className="flex items-baseline justify-between gap-4">
          <h1 className="serif text-4xl font-medium tracking-tight">
            Cita Lab
          </h1>
          <Badge variant="outline" className="font-mono text-xs">
            internal preview · noindex
          </Badge>
        </div>
        <p className="mt-3 text-muted-foreground">
          Preview 200 soal CPNS draft sebelum masuk DB. Tujuan: QA, review konten, & uji UX rendering.
        </p>
        <dl className="mt-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-muted-foreground">Batches</dt>
            <dd className="serif text-2xl">{stats.batches_count}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Total soal</dt>
            <dd className="serif text-2xl">{stats.total_soal}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">TWK · TIU · TKP</dt>
            <dd className="serif text-lg font-mono">
              {stats.by_category.TWK} · {stats.by_category.TIU} · {stats.by_category.TKP}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Status</dt>
            <dd className="serif text-2xl text-emerald-600 dark:text-emerald-400">
              ready
            </dd>
          </div>
        </dl>
      </header>

      <section>
        <h2 className="serif mb-4 text-2xl">Batch list</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {summaries.map((s) => (
            <Link
              key={s.batch_id}
              href={`/lab/${s.batch_id}`}
              className="group focus-visible:outline-none"
            >
              <Card className="h-full transition-colors group-hover:border-foreground/40 group-focus-visible:border-foreground">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-base leading-snug">
                      {s.topic}
                    </CardTitle>
                    <Badge className={categoryColor[s.category]}>
                      {s.category}
                    </Badge>
                  </div>
                  <CardDescription className="font-mono text-xs">
                    {s.batch_id}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <dt className="text-muted-foreground text-xs">Soal</dt>
                      <dd className="font-medium">{s.total_soal}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground text-xs">Avg diff</dt>
                      <dd className="font-medium">{s.difficulty_avg.toFixed(1)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground text-xs">Warn</dt>
                      <dd
                        className={
                          s.warnings > 0
                            ? "font-medium text-amber-600 dark:text-amber-400"
                            : "font-medium text-muted-foreground"
                        }
                      >
                        {s.warnings}
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <footer className="mt-12 border-t border-border/60 pt-6 text-xs text-muted-foreground">
        <p>
          Lab preview · static read dari <code className="rounded bg-muted px-1 py-0.5">src/data/lab/*.json</code> · regenerate via{" "}
          <code className="rounded bg-muted px-1 py-0.5">pnpm tsx scripts/content-to-json.ts</code>
        </p>
      </footer>
    </main>
  );
}
