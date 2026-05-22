import { type NextRequest } from "next/server"
import { updateSession } from "@/utils/supabase/middleware"

/**
 * Edge proxy — Next 16 successor to middleware.ts.
 *
 * Runs on every request matched by `config.matcher` below; refreshes
 * the Supabase session cookie via the helper and forwards the
 * mutated response. Renamed from `middleware` to `proxy` per the
 * Next 16 deprecation: https://nextjs.org/docs/messages/middleware-to-proxy
 */
export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static, _next/image, favicon.ico
     * - public files (svg|png|jpg|jpeg|gif|webp)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
