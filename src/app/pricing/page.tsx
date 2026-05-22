import {
  Check,
  Sparkles,
  Target,
  Repeat2,
  Flame,
  BookOpenCheck,
  TrendingUp,
  Bot,
} from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { getDict } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/auth/get-user";
import { getCurrentPlan } from "@/lib/billing/get-plan";
import { PricingSection } from "@/components/billing/pricing-section";

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const t = await getDict();
  const user = await getCurrentUser();
  const currentPlan = await getCurrentPlan(user?.id ?? null);
  const isEn = t.locale === "en";

  // Premium roadmap — what's already shipped + what's coming. Used for
  // the "what you get with Premium" deep-dive that lives on the dedicated
  // pricing page (and not on the embedded landing section).
  const shipped = isEn
    ? [
        {
          icon: Bot,
          title: "Cita Tutor — 50 messages per day",
          body: "Premium-grade AI tutor with full context of every question, your answer, and the explanation. Ask for daily-life analogies, beginner explanations, or counter-examples without rationing.",
        },
        {
          icon: Sparkles,
          title: "Personalized AI Insight on every result",
          body: "Each tryout result page gets a written analysis: a 2-3 sentence summary, your top three strengths, your top three weak topics with study suggestions, and concrete next steps tailored to that attempt.",
        },
        {
          icon: TrendingUp,
          title: "Premium badge across Cita",
          body: "Premium tag visible on your account, leaderboard, and history — a small reminder that you're investing in your prep.",
        },
      ]
    : [
        {
          icon: Bot,
          title: "Cita Tutor — 50 pesan per hari",
          body: "Tutor AI dengan konteks penuh setiap soal, jawaban Anda, dan kunci jawaban. Minta analogi sehari-hari, penjelasan pemula, atau contoh kasus tanpa khawatir kehabisan kuota.",
        },
        {
          icon: Sparkles,
          title: "AI Insight personal di setiap hasil",
          body: "Setiap halaman hasil tryout dilengkapi analisa tertulis: ringkasan 2-3 kalimat, tiga kekuatan utama, tiga area yang perlu dilatih beserta saran belajarnya, dan langkah berikutnya yang disesuaikan dengan hasil Anda.",
        },
        {
          icon: TrendingUp,
          title: "Premium badge di seluruh Cita",
          body: "Tanda Premium tampil di akun, leaderboard, dan riwayat — pengingat kecil bahwa Anda serius mempersiapkan SKD.",
        },
      ];

  const coming = isEn
    ? [
        {
          icon: Target,
          title: "Targeted drill",
          body: "Practice a single topic at a time — generated from your weakest subcategories, refreshed after every attempt.",
        },
        {
          icon: Repeat2,
          title: "Spaced repetition reminders",
          body: "Soal that you got wrong come back at the right interval, so you actually remember the answer the next time.",
        },
        {
          icon: Flame,
          title: "Daily streak rewards",
          body: "Show up daily, unlock streak milestones, and keep your prep momentum stable in the weeks before the test.",
        },
        {
          icon: BookOpenCheck,
          title: "Expert-curated soal pack",
          body: "New soal packs curated by SKD instructors, released regularly and included in your subscription with no extra charge.",
        },
      ]
    : [
        {
          icon: Target,
          title: "Targeted drill",
          body: "Latih satu topik tertentu — dibangun dari subkategori terlemah Anda, diperbarui setelah setiap tryout.",
        },
        {
          icon: Repeat2,
          title: "Pengingat spaced repetition",
          body: "Soal yang Anda jawab salah akan muncul kembali di interval yang tepat, supaya benar-benar diingat di SKD.",
        },
        {
          icon: Flame,
          title: "Reward streak harian",
          body: "Tampilkan komitmen harian Anda, buka pencapaian streak, dan jaga momentum belajar stabil menjelang ujian.",
        },
        {
          icon: BookOpenCheck,
          title: "Soal pilihan kurator",
          body: "Paket soal baru dari pengajar SKD, dirilis berkala dan termasuk di langganan Anda tanpa biaya tambahan.",
        },
      ];

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 px-4 sm:px-8 py-12 sm:py-16">
        <div className="mx-auto max-w-5xl space-y-16 sm:space-y-20">
          {/* Tier cards (shared with landing) */}
          <PricingSection
            locale={t.locale as "id" | "en"}
            currentPlan={currentPlan}
            authed={Boolean(user)}
            variant="page"
          />

          {/* What you get with Premium — shipped features */}
          <section className="rounded-xl border border-border bg-card p-7 sm:p-10">
            <p className="label-caps mb-4">
              {isEn ? "WHAT YOU GET WITH PREMIUM" : "YANG ANDA DAPATKAN DENGAN PREMIUM"}
            </p>
            <h2 className="serif text-3xl sm:text-4xl tracking-tight text-foreground leading-tight mb-4">
              {isEn
                ? "Real value, available today."
                : "Nilai nyata, tersedia hari ini."}
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed max-w-2xl mb-9">
              {isEn
                ? "Premium isn't a placeholder. These three features are live for every Premium user right now and form the daily core of how serious candidates use Cita."
                : "Premium bukan janji kosong. Tiga fitur berikut sudah aktif untuk semua pengguna Premium saat ini dan menjadi inti penggunaan harian Cita bagi peserta yang serius."}
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {shipped.map(({ icon: Icon, title, body }) => (
                <li
                  key={title}
                  className="rounded-lg border border-border bg-background p-5"
                >
                  <Icon
                    className="size-5 text-foreground mb-3"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                  <p className="text-sm font-semibold text-foreground mb-2 leading-snug">
                    {title}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {body}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          {/* Roadmap — coming soon */}
          <section className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-7 sm:p-10">
            <p className="label-caps mb-4">
              {isEn ? "COMING SOON FOR PREMIUM" : "AKAN HADIR UNTUK PREMIUM"}
            </p>
            <h2 className="serif text-3xl sm:text-4xl tracking-tight text-foreground leading-tight mb-4">
              {isEn
                ? "Premium grows with your prep."
                : "Premium berkembang seiring persiapan Anda."}
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed max-w-2xl mb-9">
              {isEn
                ? "Subscribe today and you get every feature on this list as it ships — no extra charge, no re-subscription."
                : "Berlangganan sekarang, Anda otomatis mendapatkan setiap fitur di daftar ini saat dirilis — tanpa biaya tambahan, tanpa langganan ulang."}
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {coming.map(({ icon: Icon, title, body }) => (
                <li
                  key={title}
                  className="rounded-lg border border-border/70 bg-background p-5"
                >
                  <Icon
                    className="size-5 text-foreground/70 mb-3"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                  <p className="text-sm font-semibold text-foreground mb-2 leading-snug">
                    {title}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {body}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          {/* FAQ + footer note */}
          <div className="text-center text-sm text-muted-foreground space-y-2">
            <p>
              {isEn
                ? "Payment via Midtrans — QRIS, GoPay, OVO, DANA, ShopeePay, bank transfer, credit card."
                : "Pembayaran via Midtrans — QRIS, GoPay, OVO, DANA, ShopeePay, transfer bank, kartu kredit."}
            </p>
            <p>
              {isEn
                ? "Cancel anytime. Access continues until the end of your billing period."
                : "Bisa dibatalkan kapan saja. Akses tetap aktif hingga akhir periode."}
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

// Keep used icons referenced by lints (some bundlers tree-shake unused icon
// imports from local files even though the JSX above uses them all).
void Check;
