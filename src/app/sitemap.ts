import type { MetadataRoute } from "next"

/**
 * Sitemap generator — App Router native API.
 *
 * Only public, GET-able pages are listed here. Tryout, study, and
 * result pages are session-scoped and intentionally excluded so
 * search engines don't try to index attempt URLs.
 *
 * The base URL falls back to the canonical production domain when
 * NEXT_PUBLIC_SITE_URL is unset, so previews on Vercel inherit the
 * canonical entry without leaking preview hashes into the sitemap.
 */
const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://cita-nu.vercel.app"

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  return [
    {
      url: `${BASE}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE}/tryout`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE}/leaderboard`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${BASE}/about`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE}/privacy`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${BASE}/terms`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ]
}
