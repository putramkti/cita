import type { Metadata, Viewport } from "next"
import { Suspense } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { MotionRoot } from "@/components/feedback/motion-root"
import { RouteProgress } from "@/components/feedback/route-progress"
import { MidtransSnapScript } from "@/components/billing/midtrans-snap-script"
import { getLocale, getDictByLocale } from "@/lib/i18n"
import "./globals.css"

const titles = {
  id: "Cita — Tryout SKD CPNS dengan AI Explainer",
  en: "Cita — AI-powered Indonesian Civil Service Exam Tryout",
}
const descriptions = {
  id: "Latihan SKD CPNS dengan penjelasan AI per soal. TWK, TIU, TKP. Tenang, fokus, akurat.",
  en: "Indonesian Civil Service Exam (SKD CPNS) prep with per-question AI explanations and an AI tutor. Calm, focused, accurate.",
}

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://cita-nu.vercel.app"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = getDictByLocale(locale)
  return {
    title: {
      default: titles[locale],
      template: "%s · Cita",
    },
    description: descriptions[locale],
    keywords: [
      "tryout cpns",
      "skd",
      "twk tiu tkp",
      "latihan cpns",
      "cpns 2026",
      "ai cpns",
      "indonesian civil service exam",
      "ASN test prep",
    ],
    icons: {
      icon: [
        { url: "/favicon.svg", type: "image/svg+xml" },
        { url: "/favicon.ico", sizes: "any" },
      ],
      apple: "/apple-touch-icon.png",
    },
    manifest: "/manifest.webmanifest",
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: "/",
      languages: {
        id: "/",
        en: "/",
      },
    },
    openGraph: {
      title: titles[locale],
      description: descriptions[locale],
      type: "website",
      locale: locale === "id" ? "id_ID" : "en_US",
      url: SITE_URL,
      siteName: "Cita",
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(
            locale === "id"
              ? "Tryout SKD CPNS dengan AI Tutor"
              : "AI-powered Indonesian Civil Service Exam Prep",
          )}`,
          width: 1200,
          height: 630,
          alt: titles[locale],
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: titles[locale],
      description: descriptions[locale],
      images: [
        `/api/og?title=${encodeURIComponent(
          locale === "id"
            ? "Tryout SKD CPNS dengan AI Tutor"
            : "AI-powered Indonesian Civil Service Exam Prep",
        )}`,
      ],
    },
    robots: { index: true, follow: true },
    other: {
      "cita-tagline": t.header.tagline,
    },
  }
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f9fa" },
    { media: "(prefers-color-scheme: dark)", color: "#0c1018" },
  ],
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  return (
    <html
      lang={locale}
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <head>
        {/* Editorial typography — Instrument Serif (headings) + Inter (body).
            Loaded via the public Google Fonts CDN at runtime to keep the
            build hermetic on hosts without outbound HTTPS to fonts.gstatic. */}
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <MotionRoot>
            <Suspense fallback={null}>
              <RouteProgress />
            </Suspense>
            <MidtransSnapScript />
            {children}
          </MotionRoot>
        </ThemeProvider>
      </body>
    </html>
  )
}
