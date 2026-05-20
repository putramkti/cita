/**
 * Server-side Supabase admin client.
 *
 * Uses the service-role key (bypasses RLS). NEVER expose to the browser.
 * Use this for trusted server actions / route handlers that need to
 * read/write across user contexts (e.g. seeding, scoring, analytics).
 *
 * Most user-driven queries should use `utils/supabase/server.ts` (anon
 * key + cookie session) instead.
 */
import { createClient as createSb, type SupabaseClient } from "@supabase/supabase-js"

// Typed as `any` — we don't have generated DB types yet (`prisma generate`
// produces Prisma types, not Supabase). Until we wire up `supabase gen types`,
// pass-through any/unknown for query result shapes; runtime is correct.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cached: SupabaseClient<any, "public", any> | null = null

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getServiceClient(): SupabaseClient<any, "public", any> {
  if (cached) return cached
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_URL) missing",
    )
  }
  cached = createSb(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return cached
}
