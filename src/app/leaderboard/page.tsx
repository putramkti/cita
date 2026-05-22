import Link from "next/link"
import { Trophy, Medal, Award, Clock } from "lucide-react"
import { getServiceClient } from "@/utils/supabase/admin"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { formatDuration } from "@/lib/tryout"
import { cn } from "@/lib/utils"

export const metadata = {
  title: "Peringkat · Cita",
  description: "Top 10 skor tryout SKD CPNS di Cita.",
}

export const dynamic = "force-dynamic"
export const revalidate = 0

interface LeaderRow {
  id: string
  userId: string
  totalScore: number | null
  scoreTWK: number | null
  scoreTIU: number | null
  scoreTKP: number | null
  durationSec: number | null
  finishedAt: string | null
  passingStatus: string | null
}

export default async function LeaderboardPage() {
  const sb = getServiceClient()

  const { data, error } = await sb
    .from("attempts")
    .select(
      "id, userId, totalScore, scoreTWK, scoreTIU, scoreTKP, durationSec, finishedAt, passingStatus",
    )
    .eq("status", "SUBMITTED")
    .order("totalScore", { ascending: false, nullsFirst: false })
    .order("durationSec", { ascending: true, nullsFirst: false })
    .limit(10)

  const rows: LeaderRow[] = (data ?? []) as LeaderRow[]
  const hasError = !!error

  return (
    <>
      <SiteHeader />
      <main className="flex-1 px-4 sm:px-8 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl space-y-12">
          {/* Header */}
          <header className="text-center">
            <p className="label-caps mb-4">CITA · LEADERBOARD</p>
            <h1 className="serif text-4xl sm:text-5xl tracking-tight text-foreground">
              Peringkat skor tertinggi
            </h1>
            <p className="text-base text-muted-foreground mt-5 leading-relaxed text-balance max-w-prose mx-auto">
              Sepuluh skor tryout SKD CPNS tertinggi di Cita. Apabila skor
              imbang, peserta yang menyelesaikan lebih cepat berada lebih
              tinggi.
            </p>
          </header>

          {/* Leaderboard */}
          {hasError ? (
            <div className="rounded-xl border border-destructive/40 bg-[var(--error-soft)] p-6 text-center">
              <p className="text-sm text-[var(--error-fg)]">
                Gagal memuat peringkat. Silakan muat ulang halaman.
              </p>
            </div>
          ) : rows.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-12 text-center">
              <p className="serif text-xl text-foreground mb-2">
                Belum ada peserta yang menyelesaikan tryout
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Jadi yang pertama. Pastikan menekan tombol Submit hingga skor
                tercatat.
              </p>
              <Link
                href="/tryout"
                className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-medium px-5 py-2.5 hover:bg-primary/90 transition-colors"
              >
                Mulai tryout
              </Link>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <table className="w-full">
                <thead className="bg-secondary/60">
                  <tr>
                    <th className="text-left px-5 py-3.5 label-caps">#</th>
                    <th className="text-left px-5 py-3.5 label-caps">
                      Peserta
                    </th>
                    <th className="text-right px-5 py-3.5 label-caps">Skor</th>
                    <th className="text-right px-5 py-3.5 label-caps hidden sm:table-cell">
                      Waktu
                    </th>
                    <th className="text-right px-5 py-3.5 label-caps hidden md:table-cell">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((r, idx) => (
                    <Row key={r.id} rank={idx + 1} r={r} />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* CTA */}
          {rows.length > 0 && (
            <section className="text-center">
              <p className="serif text-2xl text-foreground mb-5">
                Tertarik bergabung di daftar ini?
              </p>
              <Link
                href="/tryout"
                className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-medium px-6 py-3 hover:bg-primary/90 transition-colors"
              >
                Mulai tryout
              </Link>
            </section>
          )}

          {/* Notes */}
          <section className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
            <p className="label-caps text-foreground mb-3">Catatan</p>
            <ul className="space-y-2">
              <li className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="mt-2 size-1.5 rounded-full bg-[var(--gold)] shrink-0"
                />
                <span>
                  Skor maksimum adalah 150 (TWK 50 + TIU 50 + TKP 50).
                </span>
              </li>
              <li className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="mt-2 size-1.5 rounded-full bg-[var(--gold)] shrink-0"
                />
                <span>
                  Ambang batas resmi BKN: TWK ≥ 65, TIU ≥ 80, TKP ≥ 166. Karena
                  Cita versi MVP hanya berisi 30 soal, label &ldquo;lulus&rdquo;
                  pada Cita mengikuti aturan internal proporsional.
                </span>
              </li>
              <li className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="mt-2 size-1.5 rounded-full bg-[var(--gold)] shrink-0"
                />
                <span>
                  Peringkat di-reset secara berkala agar kompetisi tetap
                  dinamis.
                </span>
              </li>
            </ul>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}

function Row({ rank, r }: { rank: number; r: LeaderRow }) {
  const display = displayName(r.userId)
  const lulus = r.passingStatus === "lulus"

  return (
    <tr className="hover:bg-secondary/40 transition-colors">
      <td className="px-5 py-4">
        <RankBadge rank={rank} />
      </td>
      <td className="px-5 py-4">
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{display}</span>
          <span className="text-xs text-muted-foreground sm:hidden">
            <Clock
              className="inline size-3 -mt-0.5 mr-1"
              strokeWidth={1.5}
            />
            {formatDuration((r.durationSec ?? 0) * 1000)}
          </span>
        </div>
      </td>
      <td className="px-5 py-4 text-right">
        <div className="flex flex-col items-end">
          <span className="serif text-xl tabular-nums text-foreground">
            {r.totalScore ?? 0}
          </span>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {r.scoreTWK ?? 0} · {r.scoreTIU ?? 0} · {r.scoreTKP ?? 0}
          </span>
        </div>
      </td>
      <td className="px-5 py-4 text-right text-sm text-muted-foreground hidden sm:table-cell">
        <Clock className="inline size-3.5 -mt-0.5 mr-1" strokeWidth={1.5} />
        {formatDuration((r.durationSec ?? 0) * 1000)}
      </td>
      <td className="px-5 py-4 text-right hidden md:table-cell">
        <span
          className={cn(
            "inline-flex items-center rounded-md border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em]",
            lulus
              ? "bg-[var(--success-soft)] text-[var(--success-fg)] border-[var(--success-fg)]/20"
              : "bg-secondary text-muted-foreground border-border",
          )}
        >
          {lulus ? "Lulus" : "Belum"}
        </span>
      </td>
    </tr>
  )
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="inline-flex items-center justify-center size-9 rounded-full bg-[var(--review-amber)] text-[var(--review-amber-fg)] border border-[var(--gold)]/40">
        <Trophy className="size-4" strokeWidth={1.5} />
      </span>
    )
  }
  if (rank === 2) {
    return (
      <span className="inline-flex items-center justify-center size-9 rounded-full bg-secondary text-foreground border border-border">
        <Medal className="size-4" strokeWidth={1.5} />
      </span>
    )
  }
  if (rank === 3) {
    return (
      <span className="inline-flex items-center justify-center size-9 rounded-full bg-secondary/60 text-foreground/80 border border-border">
        <Award className="size-4" strokeWidth={1.5} />
      </span>
    )
  }
  return (
    <span className="inline-flex items-center justify-center size-9 rounded-full bg-card text-muted-foreground border border-border serif text-sm tabular-nums">
      {rank}
    </span>
  )
}

function displayName(userId: string): string {
  if (!userId.startsWith("anon_")) return userId.slice(0, 16)
  const adjectives = [
    "Tenang",
    "Fokus",
    "Tekun",
    "Cermat",
    "Teliti",
    "Sabar",
    "Pantang",
    "Lapang",
    "Cermat",
    "Tegar",
    "Rajin",
    "Damai",
  ]
  const animals = [
    "Garuda",
    "Rajawali",
    "Kancil",
    "Merak",
    "Jalak",
    "Kakatua",
    "Cendrawasih",
    "Banteng",
    "Anoa",
    "Komodo",
    "Harimau",
    "Beruang",
  ]
  const tail = userId.replace("anon_", "")
  let h = 0
  for (let i = 0; i < tail.length; i++) h = (h * 31 + tail.charCodeAt(i)) >>> 0
  const adj = adjectives[h % adjectives.length]
  const animal = animals[(h >> 8) % animals.length]
  const num = (h % 900) + 100
  return `${adj} ${animal} ${num}`
}
