import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";

/**
 * OAuth + magic link callback.
 *
 * Supabase redirects here after the user completes Google OAuth or
 * clicks the magic link in their email. We exchange the `code` query
 * param for a session, then redirect to the originally requested path
 * (passed via `next`) or `/`.
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
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL(
        `/auth/login?error=${encodeURIComponent(error.message)}`,
        url.origin,
      ),
    );
  }

  // Validate `next` is a relative path (prevent open-redirect)
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";

  return NextResponse.redirect(new URL(safeNext, url.origin));
}
