import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

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
  attempt_type: 'flashcard' | 'quiz'
  created_at: string
}
