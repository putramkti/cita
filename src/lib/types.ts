// Type definitions matching the Supabase schema.

export type Category = "TWK" | "TIU" | "TKP"

export type AttemptStatus = "IN_PROGRESS" | "SUBMITTED" | "EXPIRED"

export interface QuestionOption {
  label: string
  text: string
}

export interface Question {
  id: string
  category: Category
  subcategory: string
  questionText: string
  options: QuestionOption[]
  correctAnswer: string
  optionWeights: Record<string, number> | null
  difficulty: number
  explanation: string | null
  source: string
  createdAt: string
}

export interface AttemptItem {
  id: string
  attemptId: string
  questionId: string
  userAnswer: string | null
  isCorrect: boolean | null
  scoreEarned: number
  timeSpentMs: number | null
  answeredAt: string | null
  question?: Question
}

export interface Attempt {
  id: string
  userId: string
  status: AttemptStatus
  startedAt: string
  finishedAt: string | null
  durationSec: number | null
  scoreTWK: number | null
  scoreTIU: number | null
  scoreTKP: number | null
  totalScore: number | null
  passingStatus: string | null
  items?: AttemptItem[]
}

export interface User {
  id: string
  email: string | null
  displayName: string | null
  isAnonymous: boolean
  createdAt: string
  updatedAt: string
}

// Tryout config — keep aligned with the docs / plan.
export const TRYOUT_CONFIG = {
  duration_min: 30,
  total_questions: 30,
  per_category: 10,
  // SKD scoring (simplified MVP):
  // TWK & TIU: correct = 5, wrong = 0
  // TKP: option weight 1..5 (no zero)
  scoring: {
    TWK: { correct: 5, wrong: 0 },
    TIU: { correct: 5, wrong: 0 },
  },
  // Passing grade SKD CPNS resmi (per kategori, untuk MVP simplified)
  passing_grade: {
    TWK: 65,
    TIU: 80,
    TKP: 166,
  },
} as const
