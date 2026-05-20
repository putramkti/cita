import type { Metadata, Viewport } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import { getLocale, getDictByLocale } from "@/lib/i18n"
import "./globals.css"

const titles = {
  id: "Cita — Tryout SKD CPNS dengan AI Explainer",
  en: "Cita — AI-powered Indonesian Civil Service Exam Mock Test",
}
const descriptions = {
  id: "Latihan SKD CPNS dengan penjelasan AI per soal. TWK, TIU, TKP. Tenang, fokus, akurat.",
  en: "Indonesian Civil Service Exam (SKD CPNS) prep with per-question AI explanations and an AI tutor. Calm, focused, accurate.",
}

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
    icons: { icon: "/favicon.svg" },
    openGraph: {
      title: titles[locale],
      description: descriptions[locale],
      type: "website",
      locale: locale === "id" ? "id_ID" : "en_US",
    },
    robots: { index: true, follow: true },
    other: {
      "cita-tagline": t.header.tagline,
    },
  }
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0c1220" },
    { media: "(prefers-color-scheme: light)", color: "#fafafc" },
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
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
