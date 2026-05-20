import Link from "next/link"
import { Brain, Compass, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { Logo } from "@/components/brand/logo"

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative px-4 pt-16 sm:pt-24 pb-16">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              Latihan SKD CPNS dengan AI explainer
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-balance leading-[1.05]">
              Cita-cita jadi ASN,
              <br />
              <span className="bg-gradient-to-br from-primary to-sky-300 bg-clip-text text-transparent">
                dimulai dari latihan tenang.
              </span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground text-balance">
              30 soal SKD original (TWK · TIU · TKP). Timer 30 menit. Penjelasan
              AI per soal. Tanpa drama, tanpa iklan, tanpa typo.
            </p>
            <div className="mt-9 flex items-center justify-center gap-3 flex-wrap">
              <Button asChild size="lg" className="px-7">
                <Link href="/tryout">Mulai Tryout Gratis</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="#fitur">Lihat fitur</Link>
              </Button>
            </div>
            <p className="mt-5 text-xs text-muted-foreground">
              Tanpa daftar dulu juga bisa. Login opsional untuk simpan riwayat.
            </p>
          </div>

          {/* Subtle logo glow underneath hero */}
          <div className="pointer-events-none absolute inset-x-0 -bottom-6 flex justify-center opacity-10">
            <Logo className="size-72" />
          </div>
        </section>

        {/* Fitur */}
        <section id="fitur" className="px-4 py-16 border-t border-border/40">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-center mb-12">
              Tiga hal yang bikin Cita beda
            </h2>
            <div className="grid sm:grid-cols-3 gap-5">
              <FeatureCard
                icon={<Compass className="size-5" />}
                title="Soal original"
                desc="Disusun dari kerangka materi SKD resmi. Bukan scrape bank soal acak. Setiap soal punya difficulty, kategori, dan subtema yang jelas."
              />
              <FeatureCard
                icon={<Brain className="size-5" />}
                title="AI explainer"
                desc="Salah jawaban gak cuma dapet kunci. Setiap soal punya penjelasan kenapa jawaban itu paling tepat — singkat, padat, mudah diingat."
              />
              <FeatureCard
                icon={<Sparkles className="size-5" />}
                title="Fokus, bukan ramai"
                desc="UI tenang. Tanpa iklan, tanpa popup, tanpa countdown drama. Saat tes butuh konsentrasi, bukan distraksi."
              />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 py-16">
          <div className="mx-auto max-w-2xl rounded-2xl border border-border/60 bg-card/50 p-8 sm:p-10 text-center backdrop-blur">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Siap latihan 30 menit?
            </h2>
            <p className="mt-3 text-muted-foreground">
              30 soal · timer 30 menit · skor instan · penjelasan AI per soal.
            </p>
            <Button asChild size="lg" className="mt-7 px-7">
              <Link href="/tryout">Mulai sekarang</Link>
            </Button>
            <p className="mt-3 text-xs text-muted-foreground">
              Tidak perlu kartu kredit. Tidak perlu instal apapun.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode
  title: string
  desc: string
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/40 p-6 backdrop-blur transition-colors hover:border-border">
      <div className="inline-flex items-center justify-center size-10 rounded-lg bg-primary/10 text-primary mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-base mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  )
}
