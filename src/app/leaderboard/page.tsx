import Link from "next/link"
import { Trophy, Medal, Award, Clock } from "lucide-react"
import { getServiceClient } from "@/utils/supabase/admin"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDuration } from "@/lib/tryout"
import { cn } from "@/lib/utils"

export const metadata = {
  title: "Peringkat · Cita",
  description: "Top 10 skor tryout SKD CPNS di Cita.",
}

// Don't cache — always show fresh top scores
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
      <main className="flex-1 px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl space-y-10">
          {/* Header */}
          <header className="text-center">
            <div className="inline-flex items-center justify-center size-14 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <Trophy className="size-7 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Peringkat skor tertinggi
            </h1>
            <p className="text-muted-foreground mt-3 text-balance max-w-prose mx-auto">
              Top 10 skor tryout SKD di Cita, urut dari skor tertinggi. Kalau imbang,
              yang lebih cepat selesai unggul.
            </p>
          </header>

          {/* Leaderboard table */}
          {hasError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
              <p className="text-sm">Gagal memuat peringkat. Coba refresh sebentar lagi.</p>
            </div>
          ) : rows.length === 0 ? (
            <div className="rounded-xl border border-border/60 bg-card/30 p-10 text-center">
              <p className="text-base font-medium">Belum ada yang menyelesaikan tryout</p>
              <p className="text-sm text-muted-foreground mt-2 mb-6">
                Jadi yang pertama. Jangan lupa selesai sampai tombol Submit.
              </p>
              <Button asChild>
                <Link href="/tryout">Mulai tryout</Link>
              </Button>
            </div>
          ) : (
            <div className="rounded-2xl border border-border/60 bg-card/30 overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">#</th>
                    <th className="text-left px-4 py-3 font-semibold">Peserta</th>
                    <th className="text-right px-4 py-3 font-semibold">Skor</th>
                    <th className="text-right px-4 py-3 font-semibold hidden sm:table-cell">
                      Waktu
                    </th>
                    <th className="text-right px-4 py-3 font-semibold hidden md:table-cell">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {rows.map((r, idx) => (
                    <Row key={r.id} rank={idx + 1} r={r} />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* CTA */}
          <section className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Mau gabung ke daftar ini?
            </p>
            <Button asChild size="lg">
              <Link href="/tryout">Mulai tryout</Link>
            </Button>
          </section>

          {/* Notes */}
          <section className="rounded-xl border border-border/60 bg-card/30 p-5 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground/90 mb-2">Catatan</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Skor maksimal 150 (TWK 50 + TIU 50 + TKP 50).</li>
              <li>
                Lulus passing grade SKD: TWK ≥ 65, TIU ≥ 80, TKP ≥ 166. Karena Cita versi
                MVP cuma 30 soal, badge "lulus" Cita pakai aturan internal proporsional.
              </li>
              <li>Peringkat di-reset berkala biar latihan terasa segar.</li>
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
  const isPodium = rank <= 3
  const lulus = r.passingStatus === "lulus"

  return (
    <tr
      className={cn(
        "transition-colors",
        isPodium ? "bg-primary/5" : "hover:bg-muted/30",
      )}
    >
      <td className="px-4 py-3">
        <RankBadge rank={rank} />
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-col">
          <span className="font-medium">{display}</span>
          <span className="text-xs text-muted-foreground sm:hidden">
            <Clock className="inline size-3 -mt-0.5 mr-1" />
            {formatDuration((r.durationSec ?? 0) * 1000)}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex flex-col items-end">
          <span className="font-bold text-base">{r.totalScore ?? 0}</span>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {r.scoreTWK ?? 0} · {r.scoreTIU ?? 0} · {r.scoreTKP ?? 0}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 text-right text-muted-foreground hidden sm:table-cell">
        <Clock className="inline size-3.5 -mt-0.5 mr-1" />
        {formatDuration((r.durationSec ?? 0) * 1000)}
      </td>
      <td className="px-4 py-3 text-right hidden md:table-cell">
        <Badge
          variant="outline"
          className={cn(
            "text-[10px] uppercase tracking-wider",
            lulus
              ? "border-emerald-500/40 text-emerald-300"
              : "border-amber-500/40 text-amber-300",
          )}
        >
          {lulus ? "Lulus" : "Belum"}
        </Badge>
      </td>
    </tr>
  )
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="inline-flex items-center justify-center size-8 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
        <Trophy className="size-4" />
      </span>
    )
  }
  if (rank === 2) {
    return (
      <span className="inline-flex items-center justify-center size-8 rounded-full bg-slate-400/20 text-slate-300 border border-slate-400/40">
        <Medal className="size-4" />
      </span>
    )
  }
  if (rank === 3) {
    return (
      <span className="inline-flex items-center justify-center size-8 rounded-full bg-orange-700/20 text-orange-300 border border-orange-700/40">
        <Award className="size-4" />
      </span>
    )
  }
  return (
    <span className="inline-flex items-center justify-center size-8 rounded-full bg-muted/40 text-muted-foreground text-sm font-semibold">
      {rank}
    </span>
  )
}

/**
 * Turn a userId like "anon_mpdy6rg9liwui44" into a display handle.
 * Anonymous users get a friendly randomized display name based on their id hash,
 * so the leaderboard feels alive without exposing raw ids.
 */
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
