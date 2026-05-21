import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { loadAllBatches, loadBatch } from "@/lib/lab/loader";
import { Badge } from "@/components/ui/badge";
import { LabQuestionCard } from "./lab-question-card";

type Props = {
  params: Promise<{ batch: string }>;
};

export const dynamic = "force-static";
export const revalidate = false;

export async function generateStaticParams() {
  const batches = await loadAllBatches();
  return batches.map((b) => ({ batch: b.batch_id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { batch } = await params;
  const data = await loadBatch(batch);
  if (!data) return { title: "Lab batch", robots: { index: false } };
  return {
    title: `${data.topic} · Lab`,
    description: `Lab preview ${data.batch_id} — ${data.stats.total_soal} soal.`,
    robots: { index: false, follow: false },
  };
}

export default async function LabBatchPage({ params }: Props) {
  const { batch } = await params;
  const data = await loadBatch(batch);
  if (!data) notFound();

  const generatedDate = new Date(data.generated_at).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  });

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-8">
      <nav className="mb-6 text-sm">
        <Link
          href="/lab"
          className="text-muted-foreground hover:text-foreground"
        >
          ← Lab
        </Link>
      </nav>

      <header className="mb-8 border-b border-border/60 pb-6">
        <div className="flex items-start justify-between gap-3">
          <h1 className="serif text-3xl font-medium tracking-tight">
            {data.topic}
          </h1>
          <Badge variant="outline" className="font-mono text-xs">
            {data.batch_id}
          </Badge>
        </div>
        <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <div>
            <dt className="inline">Total: </dt>
            <dd className="inline font-medium text-foreground">
              {data.stats.total_soal} soal
            </dd>
          </div>
          <div>
            <dt className="inline">Generated: </dt>
            <dd className="inline font-mono text-xs">{generatedDate}</dd>
          </div>
          <div>
            <dt className="inline">Source: </dt>
            <dd className="inline font-mono text-xs">{data.source_file}</dd>
          </div>
        </dl>
      </header>

      <section>
        {data.questions.map((q, i) => (
          <LabQuestionCard key={q.id} question={q} index={i} />
        ))}
      </section>

      <footer className="mt-12 border-t border-border/60 pt-6 text-xs text-muted-foreground">
        <Link href="/lab" className="hover:text-foreground">
          ← Kembali ke daftar batch
        </Link>
      </footer>
    </main>
  );
}
