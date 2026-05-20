import { ImageResponse } from "next/og"

/**
 * Dynamic Open Graph image — `/api/og`.
 *
 * Renders a 1200x630 share card on demand. Falls back to a generic
 * tagline when no `?title` query is supplied. Used by the root
 * layout's `openGraph.images` and any per-page metadata that wants
 * a custom title in the share card.
 *
 * Honors the Academic Zen palette (parchment surface, ink-blue type,
 * gold accent) so links shared on Twitter / LinkedIn / Telegram
 * carry consistent brand presence.
 *
 * IMPORTANT: this route is edge-runtime by Next 16 default for
 * ImageResponse. We don't fetch external fonts here so the build
 * stays hermetic and the route works without internet access.
 */
export const runtime = "edge"
export const contentType = "image/png"
export const size = { width: 1200, height: 630 }

export async function GET(req: Request) {
  const url = new URL(req.url)
  const title = url.searchParams.get("title") ?? "Tryout SKD CPNS"
  const subtitle =
    url.searchParams.get("subtitle") ??
    "Dengan AI Tutor & insight per soal — fokus, akurat, terukur."

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#F8F9FA",
          backgroundImage:
            "radial-gradient(1200px 600px at 0% 0%, rgba(181, 147, 91, 0.08), transparent 60%), radial-gradient(900px 500px at 100% 100%, rgba(15, 23, 42, 0.06), transparent 70%)",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          padding: "72px 88px",
          position: "relative",
        }}
      >
        {/* Brand row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          {/* Logo SVG inlined as flex children — circle arc + clock hand + pin */}
          <svg width="56" height="56" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="9" fill="#FFFFFF" />
            <path
              d="M20 5C11.7157 5 5 11.7157 5 20C5 28.2843 11.7157 35 20 35C28.2843 35 35 28.2843 35 20"
              stroke="#0F172A"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M20 12V20L25 23"
              stroke="#B5935B"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="32" cy="12" r="3" fill="#B5935B" />
          </svg>
          <div
            style={{
              fontSize: 38,
              fontWeight: 600,
              color: "#0F172A",
              letterSpacing: "-0.01em",
            }}
          >
            Cita
          </div>
          <div
            style={{
              marginLeft: "auto",
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#64748B",
            }}
          >
            CITA · TRYOUT CPNS · AI TUTOR
          </div>
        </div>

        {/* Spacer */}
        <div style={{ display: "flex", flex: 1 }} />

        {/* Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          <h1
            style={{
              fontSize: 96,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              fontWeight: 500,
              color: "#0F172A",
              margin: 0,
              maxWidth: 940,
            }}
          >
            {title}
          </h1>
          <p
            style={{
              fontSize: 30,
              lineHeight: 1.4,
              color: "#64748B",
              margin: 0,
              maxWidth: 880,
            }}
          >
            {subtitle}
          </p>
        </div>

        {/* Bottom hairline + tagline */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginTop: 48,
            paddingTop: 28,
            borderTop: "1px solid #E2E8F0",
            color: "#475569",
            fontSize: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 16px",
              borderRadius: 999,
              border: "1px solid #B5935B40",
              backgroundColor: "#B5935B14",
              color: "#85622E",
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            ★ AI-POWERED INSIGHT
          </div>
          <div style={{ marginLeft: "auto" }}>cita-nu.vercel.app</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  )
}
