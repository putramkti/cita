import Link from "next/link"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"

export const metadata = {
  title: "Ketentuan Layanan · Cita",
  description: "Aturan main pakai Cita untuk latihan tryout SKD CPNS.",
}

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 px-4 py-12 sm:py-16">
        <article className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Ketentuan Layanan</h1>
          <p className="text-sm text-muted-foreground mb-8">
            Berlaku efektif: 20 Mei 2026 · Update terakhir: 20 Mei 2026
          </p>

          <div className="space-y-6 text-[15px] leading-relaxed text-foreground/90">
            <section className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
              <h2 className="text-sm font-semibold text-amber-300 uppercase tracking-widest mb-2">
                Penting — disclaimer afiliasi
              </h2>
              <p className="text-sm">
                Cita adalah produk independen.{" "}
                <strong>
                  TIDAK berafiliasi, tidak disponsori, dan tidak diendors oleh Badan Kepegawaian
                  Negara (BKN), Kementerian PANRB, atau lembaga pemerintah Republik Indonesia
                  manapun.
                </strong>{" "}
                Soal di Cita disusun oleh tim Cita untuk tujuan latihan, dan tidak mencerminkan
                soal resmi seleksi CPNS atau dokumen rahasia negara.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">1. Tentang Cita</h2>
              <p>
                Cita adalah platform latihan online untuk Seleksi Kompetensi Dasar (SKD) CPNS.
                Materi soal mencakup TWK, TIU, dan TKP, disusun mengikuti pola umum SKD
                berdasarkan literatur publik dan sumber terbuka.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">2. Penggunaan yang dibolehkan</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Latihan pribadi untuk persiapan tes SKD CPNS.</li>
                <li>Berbagi tautan tryout atau hasil latihan ke teman / komunitas belajar.</li>
                <li>Memberi feedback ke kami soal soal yang tidak akurat.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">3. Yang tidak boleh dilakukan</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  Menyalin, menyebarluaskan, atau menjual ulang konten Cita (soal, pembahasan,
                  desain) untuk keperluan komersial tanpa izin tertulis.
                </li>
                <li>
                  Memodifikasi atau mengakses sistem Cita di luar antarmuka publik (scraping
                  agresif, brute-force, exploit).
                </li>
                <li>
                  Mengaku-ngaku produk Cita berafiliasi dengan BKN, instansi pemerintah, atau
                  lembaga lain yang sebenarnya tidak terkait.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">4. Akurasi konten</h2>
              <p>
                Kami berusaha menyediakan soal dan pembahasan seakurat mungkin, tapi:
              </p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>
                  Soal di Cita tidak menjamin lo lulus seleksi CPNS resmi. Pola dan bobot
                  soal SKD bisa berubah sewaktu-waktu sesuai kebijakan BKN.
                </li>
                <li>
                  Pembahasan dibantu kecerdasan buatan (Claude Opus 4.7) dan divalidasi tim
                  Cita. Kalau lo nemu yang salah, mohon laporkan.
                </li>
                <li>
                  Konten Cita disediakan apa adanya (<em>as-is</em>). Kami tidak bertanggung
                  jawab atas keputusan lo terkait persiapan ujian, hasil ujian, atau dampak
                  lain dari penggunaan Cita.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">5. Layanan & ketersediaan</h2>
              <p>
                Cita masih dalam fase awal. Kami bisa mengubah, menambah, atau menghapus fitur
                tanpa pemberitahuan. Layanan disediakan tanpa SLA tertulis. Kalau ada gangguan,
                kami akan memperbaikinya secepat yang kami bisa.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">6. Penghentian akses</h2>
              <p>
                Kami berhak membatasi atau menghentikan akses pengguna yang melanggar ketentuan
                ini, tanpa pemberitahuan terlebih dahulu, demi keamanan pengguna lain.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">7. Hukum yang berlaku</h2>
              <p>
                Ketentuan ini tunduk pada hukum Republik Indonesia. Sengketa diselesaikan secara
                musyawarah; jika tidak tercapai, melalui jalur hukum yang berlaku.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">8. Perubahan ketentuan</h2>
              <p>
                Ketentuan ini bisa diperbarui. Versi terbaru akan selalu tersedia di halaman
                ini. Tanggal "Update terakhir" di atas mencerminkan revisi paling baru.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">Kontak</h2>
              <p>
                Pertanyaan terkait ketentuan layanan:{" "}
                <a href="mailto:hello@cita.example" className="text-primary underline">
                  hello@cita.example
                </a>
                .
              </p>
            </section>
          </div>

          <div className="mt-10 flex gap-4 text-sm">
            <Link href="/privacy" className="text-primary hover:underline">
              Kebijakan Privasi
            </Link>
            <Link href="/" className="text-primary hover:underline">
              Kembali ke beranda
            </Link>
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  )
}
