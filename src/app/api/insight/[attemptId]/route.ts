import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/get-user";
import { getCurrentPlan } from "@/lib/billing/get-plan";
import { can } from "@/lib/billing/entitlements";
import {
  getInsight,
  generateAndSaveInsight,
} from "@/lib/insight/generate";
import type { InsightPayload } from "@/lib/insight/schema";

/**
 * Personalized tryout insight endpoint.
 *
 *   GET  /api/insight/[attemptId]   — read cached payload + status
 *   POST /api/insight/[attemptId]   — trigger background generation
 *
 * Auth:
 *   Owner-only. The attempt must belong to the authenticated user.
 *
 * Entitlement:
 *   Insight is a Premium feature in MVP. The route still allows FREE
 *   plan users to read their cached payload (e.g. if they upgraded then
 *   downgraded), but only PREMIUM can trigger generation.
 */

export const dynamic = "force-dynamic";

interface Params {
  params: Promise<{ attemptId: string }>;
}

async function loadOwnedAttempt(attemptId: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: NextResponse.json({ error: "no_session" }, { status: 401 }) };
  }
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    select: { id: true, userId: true, status: true },
  });
  if (!attempt) {
    return { error: NextResponse.json({ error: "not_found" }, { status: 404 }) };
  }
  if (attempt.userId !== user.id) {
    return { error: NextResponse.json({ error: "forbidden" }, { status: 403 }) };
  }
  return { attempt, user };
}

export async function GET(_request: NextRequest, ctx: Params) {
  const { attemptId } = await ctx.params;
  const owned = await loadOwnedAttempt(attemptId);
  if ("error" in owned) return owned.error;

  const { payload, status } = await getInsight(attemptId);
  return NextResponse.json({
    status: status ?? null,
    payload: payload as InsightPayload | null,
  });
}

export async function POST(_request: NextRequest, ctx: Params) {
  const { attemptId } = await ctx.params;
  const owned = await loadOwnedAttempt(attemptId);
  if ("error" in owned) return owned.error;
  const { attempt, user } = owned;

  if (attempt.status === "IN_PROGRESS") {
    return NextResponse.json(
      { error: "attempt_not_submitted" },
      { status: 400 },
    );
  }

  // Entitlement gate — only PREMIUM can trigger generation.
  const plan = await getCurrentPlan(user.id);
  if (!can(plan, "aiInsightPersonalized")) {
    return NextResponse.json(
      { error: "premium_required" },
      { status: 402 },
    );
  }

  // If already READY, return cached without re-calling LLM.
  const cached = await getInsight(attemptId);
  if (cached.status === "READY" && cached.payload) {
    return NextResponse.json({ status: "READY", payload: cached.payload });
  }

  // Fire-and-forget — caller polls GET. We still wait briefly so first
  // call returns READY when LLM is fast (<5s); otherwise the client
  // sees PENDING and polls.
  const locale: "id" | "en" = "id"; // Result copy is ID-first; en variant follows site lang later.

  // Don't `await` — let it run in background. Use `Promise.race` with a
  // short timeout so we can return PENDING quickly if it's slow.
  const work = generateAndSaveInsight({
    attemptId,
    locale,
  }).catch((e) => {
    console.error("[insight] background gen error", e);
    return null;
  });

  // Best-effort: try for 4s. If done in time, return READY; otherwise
  // tell client to poll.
  const timeout = new Promise<null>((resolve) =>
    setTimeout(() => resolve(null), 4000),
  );
  const result = await Promise.race([work, timeout]);

  if (result) {
    return NextResponse.json({ status: "READY", payload: result });
  }

  return NextResponse.json({ status: "PENDING" });
}
