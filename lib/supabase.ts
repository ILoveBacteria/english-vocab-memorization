import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0

export const supabase = createClientComponentClient()

export type Word = {
  id: string
  user_id: string
  english_word: string
  persian_meaning: string
  example_sentences: string[]
  total_attempts: number
  correct_answers: number
  created_at: string
  updated_at: string
}

export type QuizAttempt = {
  id: string
  user_id: string
  word_id: string
  is_correct: boolean
  attempt_type: "flashcard" | "quiz"
  created_at: string
}
