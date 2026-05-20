import Link from "next/link"
import { Compass, Heart, ShieldCheck, Sparkles } from "lucide-react"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"

export const metadata = {
  title: "Tentang Cita · Latihan SKD CPNS yang tenang, fokus, akurat",
  description:
    "Tentang Cita: produk independen untuk latihan tryout SKD CPNS, dibangun supaya proses persiapan terasa tenang dan terukur.",
}

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 px-4 py-12 sm:py-16">
        <article className="mx-auto max-w-2xl space-y-10">
          <header>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
              Tentang Cita
            </h1>
            <p className="text-muted-foreground text-balance">
              Latihan SKD CPNS yang tenang, fokus, akurat. Dibangun untuk lo yang
              cita-citanya jadi ASN, dan butuh teman latihan yang bisa diandalkan tanpa
              membuat panik.
            </p>
          </header>

          <section className="space-y-3 text-[15px] leading-relaxed text-foreground/90">
            <h2 className="text-lg font-semibold">Kenapa Cita ada</h2>
            <p>
              Persiapan SKD itu berat. Soalnya banyak, materinya luas, dan nggak semua orang
              punya akses bimbel. Sebagian aplikasi tryout di luar sana penuh iklan,
              memaksa daftar akun sebelum lo bisa ngerasain produknya, atau ngasih
              pembahasan yang asal.
            </p>
            <p>
              Cita dibangun atas premis sederhana: lo harus bisa langsung nyoba 30 soal
              dalam 30 menit, dapet skor jujur, dan baca pembahasan yang masuk akal.
              Tanpa wajib daftar, tanpa iklan, tanpa drama.
            </p>
          </section>

          <section className="grid sm:grid-cols-3 gap-4">
            <Card icon={<Compass className="size-5" />} title="Tenang">
              UI sengaja dibikin minim distraksi. Dark mode default, tipografi yang nyaman
              dibaca lama, animasi yang nggak rame.
            </Card>
            <Card icon={<Sparkles className="size-5" />} title="Fokus">
              Satu sesi tryout = 30 soal × 30 menit. Cukup pendek buat dilakuin tiap hari,
              cukup panjang buat melatih ritme ujian beneran.
            </Card>
            <Card icon={<ShieldCheck className="size-5" />} title="Akurat">
              Soal disusun mengikuti pola SKD terkini (Permen PANRB), pembahasan
              di-generate Claude Opus 4.7 dan divalidasi tim Cita.
            </Card>
          </section>

          <section className="space-y-3 text-[15px] leading-relaxed text-foreground/90">
            <h2 className="text-lg font-semibold">Yang membedakan Cita</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Anonymous-first.</strong> Lo bisa langsung tryout tanpa daftar.
                Kalau mau simpan riwayat lintas perangkat, baru daftar email — opsional.
              </li>
              <li>
                <strong>AI-powered explainer.</strong> Tiap soal punya pembahasan yang
                disusun bersama Claude Opus 4.7, jadi lo nggak cuma tau jawaban benar
                tapi juga <em>kenapa</em> jawabannya begitu.
              </li>
              <li>
                <strong>Skoring sesuai aturan resmi.</strong> TWK & TIU pakai sistem
                benar = 5, salah = 0. TKP pakai bobot 1–5 sesuai pola SKD CPNS resmi.
              </li>
              <li>
                <strong>Open & transparan.</strong> Cita open-source di GitHub. Lo bisa
                ikut review soal, lapor bug, atau bikin pull request.
              </li>
            </ul>
          </section>

          <section className="space-y-3 text-[15px] leading-relaxed text-foreground/90">
            <h2 className="text-lg font-semibold">Disclaimer</h2>
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
              Cita adalah produk independen dan{" "}
              <strong>tidak berafiliasi dengan BKN, Kementerian PANRB, atau instansi
              pemerintah Republik Indonesia manapun.</strong>{" "}
              Soal di Cita disusun untuk latihan dan tidak mencerminkan soal resmi
              seleksi CPNS. Skor di Cita bukan jaminan kelulusan tes resmi.
            </div>
          </section>

          <section className="space-y-3 text-[15px] leading-relaxed text-foreground/90">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Heart className="size-4 text-rose-400" />
              Tim
            </h2>
            <p>
              Cita dibangun oleh founder solo, didukung agen kecerdasan buatan untuk
              produksi konten dan pembahasan. Kami percaya tools yang bagus bisa
              membantu lo siap lebih cepat dengan ongkos belajar yang lebih wajar.
            </p>
            <p>
              Punya saran, laporan soal yang janggal, atau mau kolaborasi?{" "}
              <a
                href="mailto:hello@cita.example"
                className="text-primary underline"
              >
                hello@cita.example
              </a>
              .
            </p>
          </section>

          <div className="mt-6 flex gap-4 text-sm">
            <Link href="/" className="text-primary hover:underline">
              Kembali ke beranda
            </Link>
            <Link href="/privacy" className="text-primary hover:underline">
              Privasi
            </Link>
            <Link href="/terms" className="text-primary hover:underline">
              Ketentuan
            </Link>
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  )
}

function Card({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/30 p-5 backdrop-blur">
      <div className="text-primary mb-3">{icon}</div>
      <h3 className="font-semibold mb-1.5">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{children}</p>
    </div>
  )
}
