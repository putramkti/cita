import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { migrateAnonToUser, ensureUser } from "@/lib/db/users";

const ANON_COOKIE = "cita_anon_id";

/**
 * OAuth + magic link callback.
 *
 * Supabase redirects here after the user completes Google OAuth or
 * clicks the magic link in their email. We exchange the `code` query
 * param for a session, then:
 *   1. Ensure the authenticated User row exists in our DB.
 *   2. If a `cita_anon_id` cookie exists, migrate any prior anonymous
 *      attempts to the authenticated user, then clear the cookie.
 *   3. Redirect to the originally requested path (passed via `next`)
 *      or `/`.
 *
 * On error, redirect back to /auth/login with the error message.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";
  const errorParam = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");

  // Provider returned an error directly (user denied, etc.)
  if (errorParam) {
    const msg = errorDescription || errorParam;
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent(msg)}`, url.origin),
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL(
        `/auth/login?error=${encodeURIComponent("Kode autentikasi tidak ditemukan.")}`,
        url.origin,
      ),
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(
      new URL(
        `/auth/login?error=${encodeURIComponent(error?.message ?? "Login gagal.")}`,
        url.origin,
      ),
    );
  }

  // Validate `next` is a relative path (prevent open-redirect)
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";
  const redirectResponse = NextResponse.redirect(
    new URL(safeNext, url.origin),
  );

  // Persist user record + migrate anon attempts (best-effort; auth must
  // not fail just because DB is temporarily unreachable).
  try {
    const anonId = request.cookies.get(ANON_COOKIE)?.value ?? null;
    const meta = (data.user.user_metadata ?? {}) as Record<string, unknown>;
    const displayName =
      (meta.full_name as string | undefined) ??
      (meta.name as string | undefined) ??
      null;

    await ensureUser({ anonId: null });

    if (anonId && anonId !== data.user.id) {
      await migrateAnonToUser({
        anonId,
        authenticatedUserId: data.user.id,
        email: data.user.email ?? null,
        displayName,
      });
      // Clear stale anon cookie — visitor is now identified.
      redirectResponse.cookies.set(ANON_COOKIE, "", {
        path: "/",
        maxAge: 0,
      });
    }
  } catch (e) {
    // Log but don't block login — DB sync can be retried lazily.
    console.error("[auth/callback] post-login DB sync failed:", e);
  }

  return redirectResponse;
}
