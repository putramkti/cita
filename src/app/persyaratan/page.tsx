import Link from "next/link"
import type { Metadata } from "next"
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  BadgeCheck,
  Briefcase,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  FileBadge,
  FileCheck2,
  FileSignature,
  FileText,
  GraduationCap,
  HeartPulse,
  IdCard,
  Image as ImageIcon,
  Info,
  Languages,
  MapPinned,
  PenLine,
  Scale,
  ScrollText,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserCheck,
  Users,
  Volume2,
} from "lucide-react"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { RevealOnView } from "@/components/feedback/reveal-on-view"
import { getDict, getLocale } from "@/lib/i18n"
import { getRequirements } from "@/lib/cpns-requirements"

/**
 * /persyaratan — CPNS requirements & documents reference page.
 *
 * Sections:
 *   1. Hero (eyebrow + serif title + balanced subtitle)
 *   2. Legal basis card (Permenpan-RB anchor)
 *   3. General requirements (9 cards, icon per item)
 *   4. Required documents (12 items, conditional flag)
 *   5. SSCASN flow (8-step numbered timeline)
 *   6. Disqualifying factors (4 alert cards)
 *   7. Closing CTA (tryout + SSCASN)
 *   8. Sources (numbered list)
 *
 * All sections use the same Academic Zen tokens already locked
 * in by the redesign: parchment surface, ink-blue type, gold
 * accent, hairline borders. Animation choreography reuses
 * RevealOnView so it lines up with the rest of the redesign.
 */

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const r = getRequirements(locale)
  return {
    title: `${r.pageTitle} — Cita`,
    description: r.pageSubtitle,
    alternates: { canonical: "/persyaratan" },
    openGraph: {
      title: r.pageTitle,
      description: r.pageSubtitle,
      type: "article",
    },
  }
}

const REQUIREMENT_ICONS: Record<string, typeof Users> = {
  wni: Users,
  "no-pidana": Scale,
  "no-diberhentikan": ShieldCheck,
  "no-aktif": UserCheck,
  "no-partai": Volume2,
  pendidikan: GraduationCap,
  kompetensi: Award,
  sehat: HeartPulse,
  penempatan: MapPinned,
}

const DOCUMENT_ICONS: Record<string, typeof FileText> = {
  ktp: IdCard,
  kk: Users,
  ijazah: GraduationCap,
  transkrip: ScrollText,
  "pas-foto": ImageIcon,
  swafoto: Camera,
  lamaran: FileSignature,
  pernyataan: FileText,
  akreditasi: BadgeCheck,
  toefl: Languages,
  str: Stethoscope,
  khusus: Briefcase,
}

export default async function PersyaratanPage() {
  const t = await getDict()
  const locale = await getLocale()
  const r = getRequirements(locale)

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-border/60 bg-card/30">
          <div className="mx-auto max-w-4xl px-4 sm:px-8 py-16 sm:py-24">
            <RevealOnView>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                <span className="size-1.5 rounded-full bg-accent" />
                {r.pageEyebrow}
              </span>
            </RevealOnView>
            <RevealOnView delay={80}>
              <h1 className="serif mt-5 text-4xl sm:text-5xl leading-[1.05] tracking-tight text-foreground">
                {r.pageTitle}
              </h1>
            </RevealOnView>
            <RevealOnView delay={160}>
              <p className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed text-balance max-w-2xl">
                {r.pageSubtitle}
              </p>
            </RevealOnView>
          </div>
        </section>

        {/* Legal basis */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-4xl px-4 sm:px-8 py-14 sm:py-16">
            <RevealOnView>
              <div className="rounded-lg border border-accent/30 bg-accent/[0.04] p-6 sm:p-8 flex flex-col sm:flex-row gap-5 sm:gap-7">
                <div className="size-12 shrink-0 rounded-lg bg-accent/15 text-accent inline-flex items-center justify-center">
                  <Scale className="size-5" strokeWidth={1.6} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="label-caps text-accent/90">
                    {r.legalEyebrow}
                  </span>
                  <h2 className="serif mt-2 text-2xl sm:text-3xl text-foreground leading-tight tracking-tight">
                    {r.legalTitle}
                  </h2>
                  <p className="mt-3 text-sm sm:text-[15px] text-muted-foreground leading-relaxed">
                    {r.legalBody}
                  </p>
                </div>
              </div>
            </RevealOnView>
          </div>
        </section>

        {/* General requirements — 9-card grid */}
        <section
          aria-labelledby="general-heading"
          className="border-b border-border/60 bg-card/30"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-8 py-16 sm:py-20">
            <RevealOnView>
              <div className="max-w-2xl">
                <span className="label-caps text-muted-foreground">
                  {r.generalEyebrow}
                </span>
                <h2
                  id="general-heading"
                  className="serif mt-3 text-3xl sm:text-4xl text-foreground leading-[1.15] tracking-tight"
                >
                  {r.generalTitle}
                </h2>
                <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {r.generalIntro}
                </p>
              </div>
            </RevealOnView>

            <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {r.generalItems.map((item, i) => {
                const Icon = REQUIREMENT_ICONS[item.id] ?? CheckCircle2
                return (
                  <RevealOnView key={item.id} delay={40 * (i + 1)}>
                    <li className="group h-full rounded-lg border border-border bg-card p-5 sm:p-6 transition-colors hover:border-accent/40 hover:bg-card">
                      <div className="flex items-center gap-3">
                        <span className="size-9 rounded-md bg-secondary text-foreground/80 inline-flex items-center justify-center transition-colors group-hover:bg-accent/15 group-hover:text-accent">
                          <Icon className="size-4" strokeWidth={1.6} />
                        </span>
                        <span className="label-caps text-muted-foreground/80">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <h3 className="mt-4 text-[15px] font-semibold text-foreground leading-snug tracking-tight">
                        {item.title}
                      </h3>
                      {item.detail && (
                        <p className="mt-2 text-[13.5px] text-muted-foreground leading-relaxed">
                          {item.detail}
                        </p>
                      )}
                    </li>
                  </RevealOnView>
                )
              })}
            </ol>
          </div>
        </section>

        {/* Documents — list with conditional badge */}
        <section
          aria-labelledby="documents-heading"
          className="border-b border-border/60"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-8 py-16 sm:py-20">
            <RevealOnView>
              <div className="max-w-2xl">
                <span className="label-caps text-muted-foreground">
                  {r.documentsEyebrow}
                </span>
                <h2
                  id="documents-heading"
                  className="serif mt-3 text-3xl sm:text-4xl text-foreground leading-[1.15] tracking-tight"
                >
                  {r.documentsTitle}
                </h2>
                <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {r.documentsIntro}
                </p>
              </div>
            </RevealOnView>

            <ul className="mt-10 grid gap-3 sm:gap-4 sm:grid-cols-2">
              {r.documentsItems.map((doc, i) => {
                const Icon = DOCUMENT_ICONS[doc.id] ?? FileText
                return (
                  <RevealOnView key={doc.id} delay={30 * (i + 1)}>
                    <li className="group h-full rounded-lg border border-border bg-card p-5 transition-colors hover:border-accent/40">
                      <div className="flex items-start gap-4">
                        <span className="size-10 shrink-0 rounded-md bg-secondary text-foreground/80 inline-flex items-center justify-center transition-colors group-hover:bg-accent/15 group-hover:text-accent">
                          <Icon className="size-4" strokeWidth={1.6} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-[15px] font-semibold text-foreground tracking-tight">
                              {doc.name}
                            </h3>
                            {doc.conditional && (
                              <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-accent rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5">
                                {locale === "id" ? "Kondisional" : "Conditional"}
                              </span>
                            )}
                          </div>
                          {doc.detail && (
                            <p className="mt-1.5 text-[13.5px] text-muted-foreground leading-relaxed">
                              {doc.detail}
                            </p>
                          )}
                        </div>
                      </div>
                    </li>
                  </RevealOnView>
                )
              })}
            </ul>

            <RevealOnView delay={100}>
              <div className="mt-8 rounded-lg border border-border/80 bg-secondary/40 p-5 flex gap-4 items-start">
                <Info
                  className="size-5 shrink-0 text-accent mt-0.5"
                  strokeWidth={1.6}
                />
                <p className="text-[13.5px] text-muted-foreground leading-relaxed">
                  {r.documentsNote}
                </p>
              </div>
            </RevealOnView>
          </div>
        </section>

        {/* Flow — numbered vertical timeline */}
        <section
          aria-labelledby="flow-heading"
          className="border-b border-border/60 bg-card/30"
        >
          <div className="mx-auto max-w-4xl px-4 sm:px-8 py-16 sm:py-20">
            <RevealOnView>
              <div>
                <span className="label-caps text-muted-foreground">
                  {r.flowEyebrow}
                </span>
                <h2
                  id="flow-heading"
                  className="serif mt-3 text-3xl sm:text-4xl text-foreground leading-[1.15] tracking-tight"
                >
                  {r.flowTitle}
                </h2>
                <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
                  {r.flowIntro}
                </p>
              </div>
            </RevealOnView>

            <ol className="mt-10 relative">
              {/* vertical rail */}
              <div
                aria-hidden="true"
                className="absolute left-[15px] top-2 bottom-6 w-px bg-gradient-to-b from-border via-border/60 to-transparent"
              />
              {r.flowSteps.map((step, i) => (
                <RevealOnView key={step.id} delay={40 * (i + 1)}>
                  <li className="relative pl-12 pb-7 last:pb-0">
                    <span className="absolute left-0 top-0 size-8 rounded-full bg-card border border-accent/40 text-accent inline-flex items-center justify-center text-[12px] font-semibold tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-[15.5px] font-semibold text-foreground tracking-tight leading-tight">
                      {step.title}
                    </h3>
                    <p className="mt-1.5 text-[13.5px] text-muted-foreground leading-relaxed">
                      {step.detail}
                    </p>
                  </li>
                </RevealOnView>
              ))}
            </ol>
          </div>
        </section>

        {/* Disqualifying factors */}
        <section
          aria-labelledby="disqualify-heading"
          className="border-b border-border/60"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-8 py-16 sm:py-20">
            <RevealOnView>
              <div className="max-w-2xl">
                <span className="label-caps text-destructive/80">
                  {r.disqualifyEyebrow}
                </span>
                <h2
                  id="disqualify-heading"
                  className="serif mt-3 text-3xl sm:text-4xl text-foreground leading-[1.15] tracking-tight"
                >
                  {r.disqualifyTitle}
                </h2>
              </div>
            </RevealOnView>

            <ul className="mt-10 grid gap-4 sm:grid-cols-2">
              {r.disqualifyItems.map((item, i) => (
                <RevealOnView key={item.id} delay={40 * (i + 1)}>
                  <li className="rounded-lg border border-destructive/20 bg-destructive/[0.03] p-5 sm:p-6">
                    <div className="flex items-start gap-4">
                      <span className="size-10 shrink-0 rounded-md bg-destructive/10 text-destructive inline-flex items-center justify-center">
                        <ShieldAlert className="size-4" strokeWidth={1.6} />
                      </span>
                      <div>
                        <h3 className="text-[15px] font-semibold text-foreground tracking-tight">
                          {item.title}
                        </h3>
                        {item.detail && (
                          <p className="mt-1.5 text-[13.5px] text-muted-foreground leading-relaxed">
                            {item.detail}
                          </p>
                        )}
                      </div>
                    </div>
                  </li>
                </RevealOnView>
              ))}
            </ul>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="border-b border-border/60 bg-card/30">
          <div className="mx-auto max-w-4xl px-4 sm:px-8 py-16 sm:py-20">
            <RevealOnView>
              <div className="rounded-lg border border-border bg-card p-7 sm:p-10 text-center sm:text-left flex flex-col sm:flex-row sm:items-center sm:justify-between gap-7">
                <div className="flex-1">
                  <span className="inline-flex items-center gap-2 label-caps text-muted-foreground">
                    <Sparkles className="size-3.5 text-accent" strokeWidth={1.8} />
                    {r.finalNoteEyebrow}
                  </span>
                  <h2 className="serif mt-3 text-2xl sm:text-3xl text-foreground tracking-tight leading-tight">
                    {r.finalNoteTitle}
                  </h2>
                  <p className="mt-3 text-sm sm:text-[15px] text-muted-foreground leading-relaxed">
                    {r.finalNoteBody}
                  </p>
                </div>
                <div className="flex flex-col sm:items-end gap-3 shrink-0">
                  <Link
                    href="/tryout"
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground text-sm font-medium px-5 py-2.5 hover:bg-primary/90 transition-colors w-full sm:w-auto"
                  >
                    {r.ctaTryout}
                    <ArrowRight className="size-4" strokeWidth={1.6} />
                  </Link>
                  <a
                    href="https://sscasn.bkn.go.id/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-card text-foreground text-sm font-medium px-5 py-2.5 hover:bg-secondary transition-colors w-full sm:w-auto"
                  >
                    {r.ctaSscasn}
                    <ArrowUpRight className="size-4" strokeWidth={1.6} />
                  </a>
                </div>
              </div>
            </RevealOnView>
          </div>
        </section>

        {/* Sources */}
        <section>
          <div className="mx-auto max-w-4xl px-4 sm:px-8 py-12 sm:py-16">
            <RevealOnView>
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3 mb-5">
                <span className="label-caps text-muted-foreground">
                  {r.sourcesTitle}
                </span>
                <p className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground/70">
                  {locale === "id"
                    ? "Diperbarui per 21 Mei 2026"
                    : "Updated 21 May 2026"}
                </p>
              </div>
            </RevealOnView>
            <ol className="space-y-2">
              {r.sources.map((s, i) => (
                <RevealOnView key={s.url} delay={50 * (i + 1)}>
                  <li className="flex items-baseline gap-3 text-sm text-muted-foreground">
                    <span className="font-mono text-[11px] tabular-nums text-muted-foreground/70 w-6 shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-foreground/85 hover:text-foreground hover:underline underline-offset-4 decoration-accent/60"
                    >
                      {s.label}
                      <ExternalLink
                        className="size-3 text-muted-foreground/70"
                        strokeWidth={1.6}
                      />
                    </a>
                  </li>
                </RevealOnView>
              ))}
            </ol>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
