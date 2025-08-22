-- Fix quiz_results table RLS policies

-- Check if quiz_results table exists, if not create it
CREATE TABLE IF NOT EXISTS public.quiz_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    personality_type VARCHAR(10) NOT NULL,
    responses JSONB,
    confidence_score DECIMAL(3,2),
    quiz_type VARCHAR(50) DEFAULT 'personality',
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS if not already enabled
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own quiz results" ON public.quiz_results;
DROP POLICY IF EXISTS "Users can insert own quiz results" ON public.quiz_results;
DROP POLICY IF EXISTS "Users can update own quiz results" ON public.quiz_results;
DROP POLICY IF EXISTS "Users can delete own quiz results" ON public.quiz_results;

-- Create proper RLS policies
CREATE POLICY "Users can view own quiz results" ON public.quiz_results
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz results" ON public.quiz_results
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quiz results" ON public.quiz_results
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own quiz results" ON public.quiz_results
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON public.quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_completed_at ON public.quiz_results(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_results_personality_type ON public.quiz_results(personality_type);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_quiz_results_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_quiz_results_updated_at ON public.quiz_results;
CREATE TRIGGER update_quiz_results_updated_at 
    BEFORE UPDATE ON public.quiz_results 
    FOR EACH ROW 
    EXECUTE FUNCTION update_quiz_results_updated_at();