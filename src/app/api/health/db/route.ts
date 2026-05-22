import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * DB health probe.
 *
 * GET /api/health/db
 *
 * Returns:
 *   200 OK   — DB reachable + sample query succeeded
 *   503 SVC  — DB unreachable or query failed
 *
 * Used by:
 *   - Manual smoke tests after deploy
 *   - Cron monitoring (Hermes scheduler can poll this)
 *   - Vercel deployment Pre-prod checks
 *
 * Returns soft-stats (counts) so we know seed integrity without
 * exposing actual question content.
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const startedAt = Date.now();

  try {
    const [questions, users, families, enemyGroups] = await Promise.all([
      prisma.question.count(),
      prisma.user.count(),
      prisma.itemFamily.count(),
      prisma.enemyGroup.count(),
    ]);

    const elapsed = Date.now() - startedAt;

    return NextResponse.json(
      {
        status: "ok",
        elapsed_ms: elapsed,
        counts: {
          questions,
          users,
          item_families: families,
          enemy_groups: enemyGroups,
        },
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    const elapsed = Date.now() - startedAt;
    const message =
      error instanceof Error ? error.message : "Unknown DB error";
    return NextResponse.json(
      {
        status: "error",
        elapsed_ms: elapsed,
        error: message,
        timestamp: new Date().toISOString(),
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
          "Content-Type": "application/json",
        },
      },
    );
  }
}
