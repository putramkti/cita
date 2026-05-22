import "server-only";
import { prisma } from "@/lib/db/prisma";

export interface FunnelStats {
  totalSignups: number;
  triedTryout: number; // signed-up users with >=1 attempt
  paidPremium: number; // signed-up users with >=1 PAID order
  signupToTryoutPct: number;
  tryoutToPaidPct: number;
  signupToPaidPct: number;
}

export async function getFunnelStats(): Promise<FunnelStats> {
  // Use raw SQL for the conditional rollup — cheaper than 3 round-trips.
  const rows = await prisma.$queryRaw<
    Array<{
      total_signups: bigint;
      tried_tryout: bigint;
      paid_premium: bigint;
    }>
  >`
    SELECT
      COUNT(DISTINCT u.id) AS total_signups,
      COUNT(DISTINCT a."userId") FILTER (WHERE a."userId" IS NOT NULL) AS tried_tryout,
      COUNT(DISTINCT o."userId") FILTER (WHERE o."userId" IS NOT NULL) AS paid_premium
    FROM users u
    LEFT JOIN attempts a ON a."userId" = u.id
    LEFT JOIN orders o ON o."userId" = u.id AND o.status = 'PAID'
    WHERE u."isAnonymous" = false
  `;

  const r = rows[0];
  const totalSignups = Number(r?.total_signups ?? 0);
  const triedTryout = Number(r?.tried_tryout ?? 0);
  const paidPremium = Number(r?.paid_premium ?? 0);

  return {
    totalSignups,
    triedTryout,
    paidPremium,
    signupToTryoutPct: pct(triedTryout, totalSignups),
    tryoutToPaidPct: pct(paidPremium, triedTryout),
    signupToPaidPct: pct(paidPremium, totalSignups),
  };
}

function pct(num: number, denom: number): number {
  if (denom <= 0) return 0;
  return Math.round((num / denom) * 1000) / 10;
}

export interface MrrPoint {
  date: string;
  paidOrders: number;
  revenueIdr: number;
  cumulativeIdr: number;
}

/**
 * Daily MRR trend over the last N days.
 *
 * MRR per-day here = sum of paid order amount that day (since
 * subscriptions are 30-day single-buy, this approximates incremental
 * revenue rather than running ARR). cumulativeIdr is running sum.
 */
export async function getMrrSeries(days = 30): Promise<MrrPoint[]> {
  const start = dayStart(days - 1);

  const orders = await prisma.order.findMany({
    where: { status: "PAID", paidAt: { gte: start, not: null } },
    select: { paidAt: true, amount: true },
    orderBy: { paidAt: "asc" },
  });

  const buckets = new Map<string, MrrPoint>();
  for (let i = 0; i < days; i++) {
    const d = dayStart(days - 1 - i);
    const key = d.toISOString().slice(0, 10);
    buckets.set(key, {
      date: key,
      paidOrders: 0,
      revenueIdr: 0,
      cumulativeIdr: 0,
    });
  }

  for (const o of orders) {
    if (!o.paidAt) continue;
    const k = o.paidAt.toISOString().slice(0, 10);
    const b = buckets.get(k);
    if (b) {
      b.paidOrders += 1;
      b.revenueIdr += o.amount;
    }
  }

  let running = 0;
  const out = Array.from(buckets.values());
  for (const p of out) {
    running += p.revenueIdr;
    p.cumulativeIdr = running;
  }
  return out;
}

export interface CategoryUsage {
  category: "TWK" | "TIU" | "TKP";
  attemptsAnsweredItems: number;
  correctItems: number;
  pctCorrect: number;
}

/** Aggregate accuracy per kategori across all submitted attempts. */
export async function getCategoryAccuracy(): Promise<CategoryUsage[]> {
  const rows = await prisma.$queryRaw<
    Array<{
      category: "TWK" | "TIU" | "TKP";
      total: bigint;
      correct: bigint;
    }>
  >`
    SELECT
      q.category,
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE ai."isCorrect" = true) AS correct
    FROM attempt_items ai
    JOIN questions q ON q.id = ai."questionId"
    WHERE ai."userAnswer" IS NOT NULL
    GROUP BY q.category
  `;

  const all: CategoryUsage[] = (["TWK", "TIU", "TKP"] as const).map((cat) => {
    const r = rows.find((row) => row.category === cat);
    const total = Number(r?.total ?? 0);
    const correct = Number(r?.correct ?? 0);
    return {
      category: cat,
      attemptsAnsweredItems: total,
      correctItems: correct,
      pctCorrect: pct(correct, total),
    };
  });

  return all;
}

export interface TopQuestion {
  questionId: string;
  category: string;
  subcategory: string;
  topic: string;
  attempts: number;
  correctRate: number; // 0-100
}

/**
 * 10 questions with the worst correct rate (where TWK/TIU only — TKP
 * doesn't have a single correct answer). Helps content team identify
 * weak items.
 */
export async function getHardestQuestions(): Promise<TopQuestion[]> {
  const rows = await prisma.$queryRaw<
    Array<{
      question_id: string;
      category: string;
      subcategory: string;
      topic: string;
      total: bigint;
      correct: bigint;
    }>
  >`
    SELECT
      q.id AS question_id,
      q.category::text AS category,
      q.subcategory,
      q.topic,
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE ai."isCorrect" = true) AS correct
    FROM attempt_items ai
    JOIN questions q ON q.id = ai."questionId"
    WHERE ai."userAnswer" IS NOT NULL AND q.category IN ('TWK', 'TIU')
    GROUP BY q.id, q.category, q.subcategory, q.topic
    HAVING COUNT(*) >= 5
    ORDER BY (COUNT(*) FILTER (WHERE ai."isCorrect" = true))::float / COUNT(*) ASC,
             COUNT(*) DESC
    LIMIT 10
  `;

  return rows.map((r) => {
    const total = Number(r.total);
    const correct = Number(r.correct);
    return {
      questionId: r.question_id,
      category: r.category,
      subcategory: r.subcategory,
      topic: r.topic,
      attempts: total,
      correctRate: pct(correct, total),
    };
  });
}

function dayStart(daysAgo: number): Date {
  const now = new Date();
  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() - daysAgo,
    ),
  );
}
