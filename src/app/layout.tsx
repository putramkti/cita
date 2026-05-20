import type { Metadata, Viewport } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "Cita — Tryout SKD CPNS dengan AI Explainer",
    template: "%s · Cita",
  },
  description:
    "Latihan SKD CPNS dengan penjelasan AI per soal. TWK, TIU, TKP. Tenang, fokus, akurat.",
  keywords: [
    "tryout cpns",
    "skd",
    "twk tiu tkp",
    "latihan cpns",
    "cpns 2026",
    "ai cpns",
  ],
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Cita — Tryout SKD CPNS dengan AI Explainer",
    description:
      "Latihan SKD dengan penjelasan AI. Tenang, fokus, akurat.",
    type: "website",
    locale: "id_ID",
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: "#0c1220",
  colorScheme: "dark",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="id"
      className="dark h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
