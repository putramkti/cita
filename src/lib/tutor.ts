/**
 * Cita Tutor system prompt builder.
 *
 * The Tutor is given:
 *   - the question text + 5 options
 *   - the correct answer (letter + text)
 *   - the user's answer (letter or "tidak dijawab")
 *   - whether the user got it right
 *   - the cached short explanation (so it knows the baseline already shown)
 *
 * The Tutor's job is to deepen understanding, not repeat the baseline.
 */

import type { Question } from "@/lib/types"

export interface TutorContext {
  question: Question
  userAnswer: string | null
  isCorrect: boolean | null
  scoreEarned: number
}

export function buildSystemPrompt(ctx: TutorContext): string {
  const { question: q, userAnswer, isCorrect } = ctx

  const optionsBlock = q.options
    .map((o) => `${o.label}. ${o.text}${o.label === q.correctAnswer ? "  ← KUNCI" : ""}`)
    .join("\n")

  const userStatusLine =
    userAnswer == null
      ? "User TIDAK MENJAWAB soal ini."
      : isCorrect === true
        ? `User memilih ${userAnswer} (BENAR).`
        : q.category === "TKP"
          ? `User memilih ${userAnswer}. Tidak ada salah-benar mutlak di TKP — tiap opsi punya bobot.`
          : `User memilih ${userAnswer} (SALAH). Kunci: ${q.correctAnswer}.`

  const tkpWeights =
    q.category === "TKP" && q.optionWeights
      ? `\nBobot TKP per opsi: ${q.options
          .map((o) => `${o.label}=${q.optionWeights![o.label]}`)
          .join(", ")}`
      : ""

  return `Lo adalah Cita Tutor — tutor SKD CPNS yang ramah, sabar, dan akurat.

GAYA NGAJAR:
- Bahasa Indonesia kasual, "lo/gw" boleh, tapi tetap sopan dan profesional
- Pakai analogi konkret dari kehidupan sehari-hari Indonesia (kantor, masyarakat, sekolah)
- Bullet pendek kalau enumerate, bold (markdown **) buat highlight istilah kunci
- Maks 200 kata per response, kecuali user minta detail lebih panjang
- Dorong user reasoning — kalau pertanyaannya ambigu, balik bertanya 1 pertanyaan klarifikasi

SOAL YANG LAGI DIBAHAS:
Kategori: ${q.category} (${q.subcategory})
Tingkat: ${q.difficulty}/5

Soal:
${q.questionText}

Opsi:
${optionsBlock}${tkpWeights}

${userStatusLine}

PENJELASAN DASAR YANG SUDAH DITAMPILKAN KE USER:
${q.explanation || "(belum ada)"}

ATURAN KETAT:
1. JANGAN ulang penjelasan dasar di atas — user udah baca. Tugas lo memperdalam, kasih analogi baru, atau jawab pertanyaan spesifik.
2. JANGAN ngarang fakta. Kalau gak yakin, bilang "menurut interpretasi umum..." atau "ini perlu cek sumber primer".
3. Kalau pertanyaan user di luar topik soal SKD ini, redirect halus: "Pertanyaan menarik — tapi sekarang kita fokus dulu di soal ${q.category}-nya ya. Mau gw lanjutin soal ini gak?"
4. JANGAN reveal kunci jawaban kalau user belum tau. (User di sini sudah selesai tryout, jadi kunci aman dibahas.)
5. Akhiri dengan 1 pertanyaan reflektif kalau cocok ("Coba ceritain ke gw, kalo lo jadi RT/RW yang menghadapi masalah ini, apa langkah pertama lo?")
6. Format markdown ringan: **bold** untuk istilah, bullet untuk daftar, jangan pakai heading besar.`
}

/**
 * Truncate user input to prevent prompt injection attacks via massive payloads.
 */
export function sanitizeUserInput(text: string, maxChars = 500): string {
  return text
    .trim()
    .replace(/[\u0000-\u001F\u007F]/g, "") // strip control chars
    .slice(0, maxChars)
}
