import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/db/prisma";

const ANON_COOKIE = "cita_anon_id";

/**
 * Debug endpoint: returns the exact auth/cookie/db state the
 * result page sees. Hit this RIGHT AFTER the bounce to confirm
 * hypothesis (cookie loss, ownership mismatch, etc).
 *
 * GET /api/debug/auth?attemptId=at_xxx
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const attemptId = url.searchParams.get("attemptId");

  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll().map((c) => ({
    name: c.name,
    valuePreview: c.value.slice(0, 24) + (c.value.length > 24 ? "…" : ""),
    valueLen: c.value.length,
  }));

  let supabaseUser: { id: string; email?: string | null } | null = null;
  let supabaseError: string | null = null;
  try {
    const u = await getCurrentUser();
    if (u) supabaseUser = { id: u.id, email: u.email };
  } catch (e) {
    supabaseError = String(e);
  }

  const anonCookie = cookieStore.get(ANON_COOKIE)?.value ?? null;
  const viewerId = supabaseUser?.id ?? anonCookie;

  let attempt: Record<string, unknown> | null = null;
  let attemptError: string | null = null;
  if (attemptId) {
    try {
      const a = await prisma.attempt.findUnique({
        where: { id: attemptId },
        select: {
          id: true,
          userId: true,
          status: true,
          mode: true,
          totalScore: true,
          startedAt: true,
          finishedAt: true,
        },
      });
      attempt = a;
    } catch (e) {
      attemptError = String(e);
    }
  }

  const ownershipMatch =
    attempt && viewerId
      ? attempt.userId === viewerId
      : null;

  return NextResponse.json(
    {
      timestamp: new Date().toISOString(),
      cookies: allCookies,
      anonCookie: anonCookie
        ? anonCookie.slice(0, 20) + "…"
        : null,
      anonCookieFull: anonCookie,
      supabaseUser,
      supabaseError,
      viewerId,
      attempt,
      attemptError,
      ownershipMatch,
      diagnosis: !viewerId
        ? "❌ NO VIEWER ID — result page would redirect to /lab-tryout"
        : !attempt
          ? "❌ ATTEMPT NOT FOUND — result page would 404"
          : ownershipMatch === false
            ? `❌ OWNERSHIP FAIL — attempt.userId (${attempt.userId}) ≠ viewerId (${viewerId}). Result page would 404.`
            : attempt && attempt.status === "IN_PROGRESS"
              ? "⚠️ Status IN_PROGRESS — result page would redirect to attempt page"
              : "✅ Should render result page",
    },
    { headers: { "cache-control": "no-store" } },
  );
}
