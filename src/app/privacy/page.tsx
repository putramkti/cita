import Link from "next/link"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"

export const metadata = {
  title: "Kebijakan Privasi · Cita",
  description:
    "Bagaimana Cita mengumpulkan, menggunakan, dan melindungi data lo selama berlatih SKD CPNS.",
}

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 px-4 py-12 sm:py-16">
        <article className="mx-auto max-w-2xl prose-cita">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Kebijakan Privasi</h1>
          <p className="text-sm text-muted-foreground mb-8">
            Berlaku efektif: 20 Mei 2026 · Update terakhir: 20 Mei 2026
          </p>

          <div className="space-y-6 text-[15px] leading-relaxed text-foreground/90">
            <section>
              <h2 className="text-lg font-semibold mb-2">Ringkasan singkat</h2>
              <p>
                Cita adalah aplikasi web untuk latihan tryout SKD CPNS. Kami sengaja merancang
                Cita supaya bisa dipakai tanpa daftar akun. Kalau lo cuma mau tryout dan
                lihat hasil, kami nggak butuh data pribadi lo sama sekali.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">Data yang kami simpan</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Anonymous ID</strong> — saat lo mulai tryout, kami bikin ID acak
                  (contoh: <code className="text-xs bg-muted px-1.5 py-0.5 rounded">anon_xxxxxxxx</code>)
                  yang disimpan di cookie browser lo. Dipakai untuk mengaitkan jawaban dengan
                  satu sesi tryout. Cookie berlaku 1 tahun, bisa lo hapus kapan saja lewat
                  pengaturan browser.
                </li>
                <li>
                  <strong>Jawaban tryout</strong> — pilihan jawaban tiap soal, durasi, dan skor.
                  Kami pakai untuk menampilkan hasil dan agregat statistik (misal soal mana yang
                  paling sering salah).
                </li>
                <li>
                  <strong>Email</strong> — opsional. Hanya disimpan kalau lo daftar untuk
                  menyimpan riwayat lintas perangkat. Bisa dihapus kapan saja.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">Yang TIDAK kami lakukan</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Kami tidak menjual data lo ke pihak ketiga.</li>
                <li>Kami tidak menjalankan iklan tracking di Cita.</li>
                <li>Kami tidak melacak aktivitas lo di luar Cita.</li>
                <li>
                  Kami tidak mengaitkan ID anonim lo ke identitas asli, kecuali lo sendiri yang
                  daftar dengan email.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">Pihak ketiga yang kami pakai</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Supabase</strong> — penyedia database & auth. Data tersimpan di server
                  AWS region Asia Tenggara. Ringkas: <a href="https://supabase.com/privacy" target="_blank" rel="noreferrer" className="text-primary underline">supabase.com/privacy</a>.
                </li>
                <li>
                  <strong>Vercel</strong> — hosting aplikasi. Mungkin mencatat log akses (IP,
                  user-agent) untuk diagnostik infrastruktur. Ringkas: <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noreferrer" className="text-primary underline">vercel.com/legal/privacy-policy</a>.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">Hak lo</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Hapus data</strong> — kalau lo nggak daftar email, lo cukup hapus
                  cookie <code className="text-xs bg-muted px-1.5 py-0.5 rounded">cita_anon_id</code>
                  di browser lo. Setelah itu kami nggak bisa lagi mengaitkan data lama dengan lo.
                </li>
                <li>
                  <strong>Akses & koreksi</strong> — kalau lo daftar email dan mau lihat / hapus
                  data lo, kontak kami di email yang tertera di bawah.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">Kontak</h2>
              <p>
                Pertanyaan atau permintaan terkait privasi:{" "}
                <a href="mailto:hello@cita.example" className="text-primary underline">hello@cita.example</a>
                . Saat ini Cita masih MVP — fitur penghapusan otomatis akan ditambahkan di
                rilis berikutnya.
              </p>
            </section>

            <p className="pt-6 border-t border-border/40 text-xs text-muted-foreground">
              Kebijakan ini bisa berubah seiring perkembangan Cita. Versi terbaru selalu
              tersedia di halaman ini.
            </p>
          </div>

          <div className="mt-10 flex gap-4 text-sm">
            <Link href="/terms" className="text-primary hover:underline">Ketentuan Layanan</Link>
            <Link href="/" className="text-primary hover:underline">Kembali ke beranda</Link>
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  )
}
