import "server-only";
import { prisma } from "@/lib/db/prisma";
import type { AttemptMode, AttemptStatus, Prisma } from "@prisma/client";

export interface HistoryRow {
  id: string;
  mode: AttemptMode;
  status: AttemptStatus;
  startedAt: Date;
  finishedAt: Date | null;
  durationSec: number | null;
  scoreTWK: number | null;
  scoreTIU: number | null;
  scoreTKP: number | null;
  totalScore: number | null;
  passingStatus: string | null;
}

export interface HistoryListResult {
  rows: HistoryRow[];
  total: number;
  page: number;
  pageSize: number;
}

export interface HistoryFilters {
  mode?: AttemptMode | "ALL";
  /** ISO yyyy-mm-dd inclusive lower bound (UTC start of day). */
  from?: string;
  /** ISO yyyy-mm-dd inclusive upper bound (UTC end of day). */
  to?: string;
  page?: number;
  pageSize?: number;
}

export async function listAttemptHistory(
  userId: string,
  filters: HistoryFilters = {},
): Promise<HistoryListResult> {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(50, Math.max(5, filters.pageSize ?? 10));

  const where: Prisma.AttemptWhereInput = {
    userId,
    // Hide IN_PROGRESS attempts from history — those still belong to /tryout.
    status: { in: ["SUBMITTED", "EXPIRED"] },
  };

  if (filters.mode && filters.mode !== "ALL") {
    where.mode = filters.mode;
  }

  if (filters.from || filters.to) {
    const range: Prisma.DateTimeFilter = {};
    if (filters.from) {
      const d = new Date(`${filters.from}T00:00:00.000Z`);
      if (!Number.isNaN(d.getTime())) range.gte = d;
    }
    if (filters.to) {
      const d = new Date(`${filters.to}T23:59:59.999Z`);
      if (!Number.isNaN(d.getTime())) range.lte = d;
    }
    where.startedAt = range;
  }

  const [total, rows] = await Promise.all([
    prisma.attempt.count({ where }),
    prisma.attempt.findMany({
      where,
      orderBy: { startedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        mode: true,
        status: true,
        startedAt: true,
        finishedAt: true,
        durationSec: true,
        scoreTWK: true,
        scoreTIU: true,
        scoreTKP: true,
        totalScore: true,
        passingStatus: true,
      },
    }),
  ]);

  return { rows, total, page, pageSize };
}

export interface HistorySummary {
  totalAttempts: number;
  bestScore: number | null;
  passCount: number;
  failCount: number;
  passRatePct: number;
  averageScore: number | null;
  miniCount: number;
  fullCount: number;
  /** Date string yyyy-mm-dd of the most recent finished attempt. */
  lastAttemptDate: string | null;
}

/**
 * Lifetime stats for the user's submitted attempts.
 *
 * Pass rate is computed against the PASS/FAIL split, ignoring null
 * passingStatus (e.g. expired without grading).
 */
export async function getAttemptSummary(
  userId: string,
): Promise<HistorySummary> {
  const where: Prisma.AttemptWhereInput = {
    userId,
    status: { in: ["SUBMITTED", "EXPIRED"] },
  };

  const [agg, passCount, failCount, miniCount, fullCount, last] =
    await Promise.all([
      prisma.attempt.aggregate({
        where,
        _count: { _all: true },
        _max: { totalScore: true },
        _avg: { totalScore: true },
      }),
      prisma.attempt.count({ where: { ...where, passingStatus: "PASS" } }),
      prisma.attempt.count({ where: { ...where, passingStatus: "FAIL" } }),
      prisma.attempt.count({ where: { ...where, mode: "MINI" } }),
      prisma.attempt.count({ where: { ...where, mode: "FULL" } }),
      prisma.attempt.findFirst({
        where: { ...where, finishedAt: { not: null } },
        orderBy: { finishedAt: "desc" },
        select: { finishedAt: true },
      }),
    ]);

  const graded = passCount + failCount;
  const passRatePct = graded > 0 ? Math.round((passCount / graded) * 1000) / 10 : 0;
  const averageScore =
    agg._avg.totalScore != null ? Math.round(agg._avg.totalScore) : null;

  return {
    totalAttempts: agg._count._all,
    bestScore: agg._max.totalScore,
    passCount,
    failCount,
    passRatePct,
    averageScore,
    miniCount,
    fullCount,
    lastAttemptDate: last?.finishedAt
      ? last.finishedAt.toISOString().slice(0, 10)
      : null,
  };
}
