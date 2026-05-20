import Link from "next/link"
import { startTryout } from "./actions"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"

export const metadata = {
  title: "Mulai Tryout SKD CPNS",
}

export default function TryoutLandingPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 px-4 py-12 sm:py-20">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
              Tryout SKD
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Siap untuk 30 menit fokus?
            </h1>
            <p className="mt-3 text-muted-foreground text-balance">
              30 soal SKD original — TWK, TIU, dan TKP. Sekali mulai, timer
              berjalan terus sampai selesai atau habis.
            </p>
          </div>

          {/* Briefing card */}
          <div className="rounded-2xl border border-border/60 bg-card/40 p-6 sm:p-8 backdrop-blur space-y-5">
            <h2 className="text-lg font-semibold">Yang perlu lo tau</h2>
            <ul className="space-y-3 text-sm">
              <Bullet>
                <strong className="text-foreground">30 soal · 30 menit.</strong>{" "}
                10 TWK + 10 TIU + 10 TKP. Boleh skip dan balik lagi.
              </Bullet>
              <Bullet>
                <strong className="text-foreground">Skor instan.</strong>{" "}
                Begitu lo submit (atau timer habis), nilai per kategori &
                kelulusan langsung muncul.
              </Bullet>
              <Bullet>
                <strong className="text-foreground">AI explainer.</strong>{" "}
                Setiap soal punya penjelasan kenapa jawaban itu paling tepat.
              </Bullet>
              <Bullet>
                <strong className="text-foreground">Tanpa daftar.</strong>{" "}
                Sesi dibuat anonim. Kalau mau simpan riwayat, login email pas
                selesai.
              </Bullet>
            </ul>

            <form action={startTryout} className="pt-3">
              <Button type="submit" size="lg" className="w-full px-7">
                Mulai sekarang
              </Button>
            </form>
            <p className="text-center text-xs text-muted-foreground">
              Dengan memulai, lo setuju dengan{" "}
              <Link href="/terms" className="underline hover:text-foreground">
                Ketentuan
              </Link>{" "}
              &{" "}
              <Link href="/privacy" className="underline hover:text-foreground">
                Privasi
              </Link>{" "}
              Cita.
            </p>
          </div>

          {/* Disclaimer */}
          <p className="mt-8 text-center text-xs text-muted-foreground/70">
            Cita adalah platform persiapan SKD CPNS independen.
            <br />
            Tidak berafiliasi dengan BKN, BKPSDM, atau lembaga resmi manapun.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="mt-1.5 size-1.5 rounded-full bg-primary shrink-0" />
      <span className="text-muted-foreground leading-relaxed">{children}</span>
    </li>
  )
}
