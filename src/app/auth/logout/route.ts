import { redirect } from "next/navigation";
import { signOut } from "@/lib/auth/actions";

/**
 * Logout route — POST or GET both supported.
 *
 * Pattern: POST from form (CSRF-safe), GET for direct link convenience.
 * Both invoke server action signOut() which clears Supabase cookies
 * and revalidates the layout.
 */
export async function GET() {
  await signOut();
  redirect("/");
}

export async function POST() {
  await signOut();
  redirect("/");
}
