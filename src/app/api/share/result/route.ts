import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/get-user";
import {
  getOrCreateResultShare,
  updateResultShareName,
  revokeResultShare,
} from "@/lib/share/result-share";
import { cookies } from "next/headers";

const ANON_COOKIE = "cita_anon_id";

interface ParsedOk {
  ok: true;
  data: { attemptId: string; showName: boolean };
}
interface ParsedFail {
  ok: false;
  error: string;
}

function parseCreate(body: unknown): ParsedOk | ParsedFail {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Body must be a JSON object" };
  }
  const obj = body as Record<string, unknown>;
  const attemptId = obj.attemptId;
  if (typeof attemptId !== "string" || attemptId.length === 0) {
    return { ok: false, error: "attemptId required" };
  }
  const rawShowName = obj.showName;
  const showName =
    typeof rawShowName === "boolean" ? rawShowName : false;
  return { ok: true, data: { attemptId, showName } };
}

/**
 * POST — create or update a share for an attempt.
 *
 * Auth model: same as result page itself. Owner of the attempt
 * (auth user OR anon cookie holder) can share. Anonymous users
 * are allowed; the public share page nudges them to register.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "BAD_JSON" },
      { status: 400 },
    );
  }

  const parsed = parseCreate(body);
  if (!parsed.ok) {
    return NextResponse.json(
      { error: "BAD_INPUT", details: parsed.error },
      { status: 400 },
    );
  }

  const { attemptId, showName } = parsed.data;

  const supabaseUser = await getCurrentUser();
  const cookieStore = await cookies();
  const anonId = cookieStore.get(ANON_COOKIE)?.value ?? null;
  const viewerId = supabaseUser?.id ?? anonId;
  if (!viewerId) {
    return NextResponse.json({ error: "NO_VIEWER" }, { status: 401 });
  }

  // Verify ownership + completion
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    select: { userId: true, status: true },
  });
  if (!attempt) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  if (attempt.userId !== viewerId) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  if (attempt.status !== "SUBMITTED" && attempt.status !== "EXPIRED") {
    return NextResponse.json(
      { error: "ATTEMPT_NOT_DONE" },
      { status: 409 },
    );
  }

  // Anonymous users can't show a name (there is none).
  const safeShowName = supabaseUser ? showName : false;

  const share = await getOrCreateResultShare({
    attemptId,
    showName: safeShowName,
  });

  // If existing share had a different showName, sync it
  if (share.showName !== safeShowName) {
    const updated = await updateResultShareName(attemptId, safeShowName);
    return NextResponse.json({
      shareId: updated.shareId,
      showName: updated.showName,
    });
  }

  return NextResponse.json({
    shareId: share.shareId,
    showName: share.showName,
  });
}

/**
 * DELETE — revoke a share by attempt id.
 */
export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const attemptId = url.searchParams.get("attemptId");
  if (!attemptId) {
    return NextResponse.json({ error: "MISSING_ATTEMPT_ID" }, { status: 400 });
  }

  const supabaseUser = await getCurrentUser();
  const cookieStore = await cookies();
  const anonId = cookieStore.get(ANON_COOKIE)?.value ?? null;
  const viewerId = supabaseUser?.id ?? anonId;
  if (!viewerId) {
    return NextResponse.json({ error: "NO_VIEWER" }, { status: 401 });
  }

  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    select: { userId: true },
  });
  if (!attempt) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  if (attempt.userId !== viewerId) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  try {
    await revokeResultShare(attemptId);
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === "P2025") {
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }
    throw err;
  }

  return NextResponse.json({ ok: true });
}
