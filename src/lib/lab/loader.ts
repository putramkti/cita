import "server-only";
import { promises as fs } from "node:fs";
import * as path from "node:path";
import type { LabBatch, BatchSummary, Category } from "./types";

// In dev: re-read on each call. In prod: read once, cache in module scope.
const DATA_DIR = path.join(process.cwd(), "src/data/lab");

let _cache: { batches: LabBatch[]; mtime: number } | null = null;

export async function loadAllBatches(): Promise<LabBatch[]> {
  if (process.env.NODE_ENV === "production" && _cache) {
    return _cache.batches;
  }

  const files = (await fs.readdir(DATA_DIR))
    .filter((f) => f.endsWith(".json"))
    .sort();

  const batches: LabBatch[] = await Promise.all(
    files.map(async (f) => {
      const raw = await fs.readFile(path.join(DATA_DIR, f), "utf-8");
      return JSON.parse(raw) as LabBatch;
    })
  );

  if (process.env.NODE_ENV === "production") {
    _cache = { batches, mtime: Date.now() };
  }

  return batches;
}

export async function loadBatch(batchId: string): Promise<LabBatch | null> {
  const all = await loadAllBatches();
  return all.find((b) => b.batch_id === batchId) ?? null;
}

export async function loadBatchSummaries(): Promise<BatchSummary[]> {
  const batches = await loadAllBatches();
  return batches.map((b) => {
    const cats = Array.from(new Set<Category>(b.questions.map((q) => q.category)));
    const category: BatchSummary["category"] =
      cats.length === 1 ? cats[0] : "MIXED";
    const difficulty_avg =
      b.questions.reduce((sum, q) => sum + q.difficulty, 0) /
      Math.max(b.questions.length, 1);
    return {
      batch_id: b.batch_id,
      topic: b.topic,
      category,
      total_soal: b.stats.total_soal,
      difficulty_avg: Math.round(difficulty_avg * 10) / 10,
      warnings: b.stats.warnings_total,
    };
  });
}

export async function getStats() {
  const batches = await loadAllBatches();
  const total = batches.reduce((s, b) => s + b.stats.total_soal, 0);
  const byCategory: Record<Category, number> = { TWK: 0, TIU: 0, TKP: 0 };
  for (const b of batches) {
    for (const q of b.questions) {
      byCategory[q.category]++;
    }
  }
  return {
    batches_count: batches.length,
    total_soal: total,
    by_category: byCategory,
  };
}
