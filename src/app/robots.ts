import type { MetadataRoute } from "next"

/**
 * robots.txt generator — App Router native API.
 *
 * Allows everything public, disallows session-scoped routes (tryout
 * attempts, study pages, result pages) since indexing those would
 * be both meaningless and a privacy concern. API routes are also
 * disallowed.
 */
const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://cita-nu.vercel.app"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/tryout/", // attempt routes — disallow children, /tryout itself stays via sitemap
          "/study/",
        ],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE.replace(/^https?:\/\//, ""),
  }
}
