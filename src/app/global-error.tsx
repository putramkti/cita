"use client"

/**
 * Global error boundary — fallback when even the root layout itself
 * crashes. Must be self-contained: no SiteHeader / SiteFooter, no
 * external font CSS, no theme provider. Inline styling only.
 *
 * Next.js requires this file to render its own <html> and <body>.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F8F9FA",
          color: "#0F172A",
          fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif",
          padding: "2rem",
        }}
      >
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <p
            style={{
              fontSize: 11,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontWeight: 600,
              color: "#DC2626",
              marginBottom: 16,
            }}
          >
            ★ Critical error
          </p>
          <h1
            style={{
              fontFamily:
                "'Instrument Serif', Georgia, ui-serif, serif",
              fontSize: 36,
              lineHeight: 1.1,
              margin: 0,
              fontWeight: 400,
            }}
          >
            Something went wrong at the root.
          </h1>
          <p
            style={{
              marginTop: 16,
              fontSize: 15,
              lineHeight: 1.6,
              color: "#64748B",
            }}
          >
            The application failed to load. Please try refreshing the
            page.
          </p>
          {error?.digest && (
            <p
              style={{
                marginTop: 12,
                fontSize: 12,
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                color: "#94A3B8",
              }}
            >
              ref: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 32,
              padding: "12px 24px",
              borderRadius: 6,
              border: 0,
              background: "#0F172A",
              color: "#FFFFFF",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  )
}
