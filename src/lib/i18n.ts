/**
 * Lightweight i18n for Cita.
 *
 * Scope: UI chrome (navigation, page copy, buttons, labels).
 * Out of scope: SKD question content (always Indonesian — that's the actual
 * exam material; reviewers see the "Indonesian Civil Service Exam Question"
 * label that signals authenticity).
 *
 * Usage:
 *   const t = await getDict()        // server component
 *   t.landing.heroTitle              // typed string
 *
 * Locale flow:
 *   1. Cookie `cita_locale` = "id" | "en" -> use that
 *   2. Otherwise default "id"
 *   3. Toggle = client-side cookie write, then router.refresh()
 */

import { cookies } from "next/headers"

export const SUPPORTED_LOCALES = ["id", "en"] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]
export const DEFAULT_LOCALE: Locale = "id"
export const LOCALE_COOKIE = "cita_locale"

const dictionaries = {
  id: {
    locale: "id" as const,
    nav: {
      tryout: "Tryout",
      leaderboard: "Peringkat",
      start: "Mulai",
      backHome: "Kembali ke beranda",
    },
    header: {
      tagline: "Tenang, fokus, akurat",
    },
    footer: {
      tagline: "Tenang, fokus, akurat",
      privacy: "Privasi",
      terms: "Ketentuan",
      about: "Tentang",
      disclaimer: "Cita tidak berafiliasi dengan BKN, FHCI, atau lembaga pemerintah lainnya.",
    },
    landing: {
      heroEyebrow: "Tryout SKD CPNS dengan AI",
      heroTitle: "Cita-cita jadi ASN, dimulai dari sini.",
      heroSubtitle:
        "Latihan SKD 30 soal dalam 30 menit. Tiap soal punya pembahasan AI mendalam — Anda bisa tanya lebih lanjut sampai paham.",
      ctaStart: "Mulai Tryout Gratis",
      ctaLeaderboard: "Lihat Peringkat",
      featuresTitle: "Apa yang Anda dapatkan",
      feat1Title: "30 soal kurasi AI",
      feat1Desc: "Soal TWK, TIU, TKP yang dirancang merepresentasikan tipe soal SKD asli.",
      feat2Title: "Pembahasan AI per soal",
      feat2Desc: "Tiap soal punya pembahasan dari Claude Opus 4.7. Bingung? Tanya tutor AI.",
      feat3Title: "Peringkat anonim",
      feat3Desc: "Tanpa daftar akun. Ikut tryout, langsung tampil di peringkat.",
      bottomCtaTitle: "Siap mulai?",
      bottomCtaSubtitle: "Tanpa daftar. Tanpa biaya. Langsung kerjakan.",
    },
    tryout: {
      briefingTitle: "Siap untuk 30 menit fokus?",
      briefingSubtitle: "Sebelum mulai, baca poin-poin berikut:",
      rule1: "30 soal dalam 30 menit (10 TWK, 10 TIU, 10 TKP).",
      rule2: "Anda bisa lompat antar soal dan mengubah jawaban kapan saja sebelum waktu habis.",
      rule3: "Jawaban tersimpan otomatis. Tutup tab? Tenang, lanjut nanti masih bisa.",
      rule4: "Setelah selesai, Anda bisa tanya tutor AI per soal (5 pertanyaan/soal).",
      startNow: "Mulai sekarang",
      legalNote: "Dengan memulai, Anda menyetujui",
      and: "dan",
    },
    result: {
      title: "Hasil tryout Anda",
      totalScore: "Skor total",
      passingHint: "Ambang batas resmi BKN: TWK 65, TIU 80, TKP 166.",
      reviewTitle: "Review per soal",
      askTutor: "Tanya Cita Tutor",
      backToHome: "Kembali ke beranda",
      shareScore: "Bagikan hasil",
      explanationLabel: "Penjelasan AI",
      disclaimer:
        "Pembahasan AI di-generate oleh Claude Opus 4.7 saat soal disusun, divalidasi tim Cita.",
      yourAnswer: "Jawaban Anda",
      correctAnswer: "Kunci",
      notAnswered: "Tidak dijawab",
    },
    study: {
      backToResult: "Kembali ke hasil",
      prevQuestion: "Soal sebelumnya",
      nextQuestion: "Soal selanjutnya",
      tutorName: "Cita Tutor",
      tutorTagline: "Diskusi soal ini dengan AI",
      remaining: (n: number, max: number) => `${n}/${max} pertanyaan tersisa`,
      thinking: "Tutor sedang menyusun jawaban...",
      placeholder: "Tanya apa saja... (Enter untuk kirim, Shift+Enter untuk baris baru)",
      placeholderLimit: "Batas pertanyaan tercapai. Lanjut ke soal lain.",
      send: "Kirim",
      suggestionsTitle: "Saran pertanyaan",
      closeSuggestions: "Tutup saran pertanyaan",
      emptyTitle: "Tanya apa saja tentang soal ini.",
      emptySubtitle:
        "Tutor sudah tahu soal, kunci jawaban, dan jawaban Anda. Mulai dari saran cepat di bawah, atau ketik pertanyaan sendiri.",
      youLabel: "Anda",
      explanationLabel: "Penjelasan dasar",
      quickPrompts: {
        analogy: "Beri analogi sehari-hari",
        eli5: "Jelaskan untuk pemula",
        whyWrong: "Mengapa opsi lain salah?",
        realCase: "Berikan contoh kasus nyata",
      },
      quickPromptTexts: {
        analogy:
          "Tolong berikan analogi dari kehidupan sehari-hari agar konsep ini lebih mudah saya pahami.",
        eli5:
          "Mohon jelaskan ulang dengan bahasa yang lebih sederhana, seolah-olah sedang menjelaskan kepada siswa SMP.",
        whyWrong: "Mohon bahas satu per satu mengapa opsi-opsi yang salah itu kurang tepat.",
        realCase:
          "Mohon berikan satu sampai dua contoh kasus nyata di Indonesia yang mencerminkan jawaban yang benar.",
      },
    },
    leaderboard: {
      title: "Peringkat",
      subtitle: "10 skor tertinggi sepanjang masa",
      empty: "Belum ada peringkat. Jadi yang pertama!",
      rank: "Peringkat",
      participant: "Peserta",
      score: "Skor",
      duration: "Waktu",
      status: "Status",
      passed: "Lulus",
      notPassed: "Belum",
      ctaStart: "Mulai tryout",
      passingNote:
        "Catatan: status 'Lulus' mengikuti ambang batas BKN (TWK 65, TIU 80, TKP 166).",
    },
    common: {
      darkMode: "Mode gelap",
      lightMode: "Mode terang",
      languageToggle: "Bahasa",
    },
    meta: {
      examLabel: "Tipe soal", // shown next to question category for clarity
    },
  },
  en: {
    locale: "en" as const,
    nav: {
      tryout: "Mock test",
      leaderboard: "Leaderboard",
      start: "Start",
      backHome: "Back to home",
    },
    header: {
      tagline: "Calm, focused, accurate",
    },
    footer: {
      tagline: "Calm, focused, accurate",
      privacy: "Privacy",
      terms: "Terms",
      about: "About",
      disclaimer:
        "Cita is not affiliated with BKN, FHCI, or any Indonesian government agency.",
    },
    landing: {
      heroEyebrow: "AI-powered Indonesian Civil Service Exam prep",
      heroTitle: "Become a public servant — start your prep here.",
      heroSubtitle:
        "30 questions in 30 minutes. Each question comes with a deep AI explanation — chat with our AI tutor until every concept clicks.",
      ctaStart: "Start free mock test",
      ctaLeaderboard: "View leaderboard",
      featuresTitle: "What you get",
      feat1Title: "30 AI-curated questions",
      feat1Desc:
        "TWK (national values), TIU (logical), TKP (personality) — designed to mirror the real SKD exam.",
      feat2Title: "AI explanation per question",
      feat2Desc:
        "Every question ships with a Claude Opus 4.7 explanation. Confused? Chat with the AI tutor.",
      feat3Title: "Anonymous leaderboard",
      feat3Desc: "No signup needed. Take the test, your score lands on the leaderboard.",
      bottomCtaTitle: "Ready to start?",
      bottomCtaSubtitle: "No signup. No payment. Just start.",
    },
    tryout: {
      briefingTitle: "Ready to focus for 30 minutes?",
      briefingSubtitle: "Before you begin, please read the following:",
      rule1: "30 questions in 30 minutes (10 TWK, 10 TIU, 10 TKP).",
      rule2:
        "You can jump between questions and change answers anytime before the timer ends.",
      rule3:
        "Answers auto-save. Closed the tab? No worries, you can resume later.",
      rule4:
        "After submitting, you can chat with the AI tutor on each question (5 questions per problem).",
      startNow: "Start now",
      legalNote: "By starting, you agree to our",
      and: "and",
    },
    result: {
      title: "Your mock test results",
      totalScore: "Total score",
      passingHint: "Official BKN passing thresholds: TWK 65, TIU 80, TKP 166.",
      reviewTitle: "Per-question review",
      askTutor: "Ask Cita Tutor",
      backToHome: "Back to home",
      shareScore: "Share results",
      explanationLabel: "AI explanation",
      disclaimer:
        "AI explanations were generated by Claude Opus 4.7 during question authoring and reviewed by the Cita team.",
      yourAnswer: "Your answer",
      correctAnswer: "Correct",
      notAnswered: "Not answered",
    },
    study: {
      backToResult: "Back to results",
      prevQuestion: "Previous question",
      nextQuestion: "Next question",
      tutorName: "Cita Tutor",
      tutorTagline: "Discuss this question with AI",
      remaining: (n: number, max: number) => `${n}/${max} questions left`,
      thinking: "Tutor is thinking...",
      placeholder: "Ask anything... (Enter to send, Shift+Enter for new line)",
      placeholderLimit: "Question limit reached. Try a different question.",
      send: "Send",
      suggestionsTitle: "Quick prompts",
      closeSuggestions: "Hide quick prompts",
      emptyTitle: "Ask anything about this question.",
      emptySubtitle:
        "The tutor knows the question, the correct answer, and what you picked. Try a quick prompt below or write your own.",
      youLabel: "You",
      explanationLabel: "Base explanation",
      quickPrompts: {
        analogy: "Give a real-world analogy",
        eli5: "Explain it simply",
        whyWrong: "Why are the other options wrong?",
        realCase: "Give a real-world example",
      },
      quickPromptTexts: {
        analogy:
          "Please give me an analogy from everyday life so this concept is easier to understand.",
        eli5:
          "Please explain again in simpler terms, as if you were teaching a middle-school student.",
        whyWrong: "Please walk me through why each wrong option is incorrect, one by one.",
        realCase:
          "Please give one or two real-world examples in Indonesia that illustrate the correct answer.",
      },
    },
    leaderboard: {
      title: "Leaderboard",
      subtitle: "Top 10 all-time scores",
      empty: "No scores yet. Be the first!",
      rank: "Rank",
      participant: "Participant",
      score: "Score",
      duration: "Time",
      status: "Status",
      passed: "Passed",
      notPassed: "Not yet",
      ctaStart: "Start mock test",
      passingNote:
        "Note: 'Passed' uses BKN's official thresholds (TWK 65, TIU 80, TKP 166).",
    },
    common: {
      darkMode: "Dark mode",
      lightMode: "Light mode",
      languageToggle: "Language",
    },
    meta: {
      examLabel: "Question type",
    },
  },
}

export type Dict = (typeof dictionaries)[Locale]

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  const v = cookieStore.get(LOCALE_COOKIE)?.value
  if (v && (SUPPORTED_LOCALES as readonly string[]).includes(v)) {
    return v as Locale
  }
  return DEFAULT_LOCALE
}

export async function getDict(): Promise<Dict> {
  const locale = await getLocale()
  return dictionaries[locale] as Dict
}

export function getDictByLocale(locale: Locale): Dict {
  return dictionaries[locale] as Dict
}
