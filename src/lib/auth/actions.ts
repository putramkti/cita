"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";

/**
 * Auth server actions.
 *
 * Used by /auth/login form. All actions return either a redirect or
 * { error: string } so the client form can surface validation errors.
 */

export type AuthActionResult = { error: string } | undefined;

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.VERCEL_URL ??
  "http://localhost:3000";

async function originFromHeaders(): Promise<string> {
  // Prefer forwarded origin so callbacks land on the same host the user opened.
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (host) return `${proto}://${host}`;
  return SITE_URL.startsWith("http") ? SITE_URL : `https://${SITE_URL}`;
}

/**
 * Send magic link to email. Returns nothing on success — UI redirects
 * to /auth/check-email; surfaces { error } string on failure.
 */
export async function sendMagicLink(
  formData: FormData,
): Promise<AuthActionResult> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Format email tidak valid." };
  }

  const supabase = await createClient();
  const origin = await originFromHeaders();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      shouldCreateUser: true,
    },
  });

  if (error) {
    return { error: error.message };
  }

  redirect(`/auth/check-email?email=${encodeURIComponent(email)}`);
}

/**
 * Initiate Google OAuth flow. Redirects to Google, returns to /auth/callback.
 * Errors out gracefully if provider not enabled in Supabase project.
 */
export async function signInWithGoogle(): Promise<AuthActionResult> {
  const supabase = await createClient();
  const origin = await originFromHeaders();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error || !data?.url) {
    return {
      error:
        error?.message ??
        "Google sign-in belum aktif. Hubungi admin atau pakai magic link.",
    };
  }

  redirect(data.url);
}

/**
 * Sign out current user. Always redirects to /, regardless of state.
 */
export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
