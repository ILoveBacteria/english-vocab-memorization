-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create words table
CREATE TABLE IF NOT EXISTS public.words (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  english_word TEXT NOT NULL,
  persian_meaning TEXT NOT NULL,
  example_sentences TEXT[],
  total_attempts INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quiz_attempts table for detailed tracking
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  word_id UUID REFERENCES public.words(id) ON DELETE CASCADE,
  is_correct BOOLEAN NOT NULL,
  attempt_type TEXT NOT NULL, -- 'flashcard' or 'quiz'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.words ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own words" ON public.words
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own words" ON public.words
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own words" ON public.words
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own words" ON public.words
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own quiz attempts" ON public.quiz_attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz attempts" ON public.quiz_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS words_user_id_idx ON public.words(user_id);
CREATE INDEX IF NOT EXISTS quiz_attempts_user_id_idx ON public.quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS quiz_attempts_word_id_idx ON public.quiz_attempts(word_id);
