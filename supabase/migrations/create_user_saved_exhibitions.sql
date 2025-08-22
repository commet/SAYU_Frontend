-- Create user_saved_exhibitions table
CREATE TABLE IF NOT EXISTS public.user_saved_exhibitions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    exhibition_id UUID NOT NULL REFERENCES public.exhibitions(id) ON DELETE CASCADE,
    saved_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    reminder_date TIMESTAMPTZ,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, exhibition_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_saved_exhibitions_user_id ON public.user_saved_exhibitions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_saved_exhibitions_exhibition_id ON public.user_saved_exhibitions(exhibition_id);
CREATE INDEX IF NOT EXISTS idx_user_saved_exhibitions_saved_at ON public.user_saved_exhibitions(saved_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE public.user_saved_exhibitions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own saved exhibitions
CREATE POLICY "Users can view own saved exhibitions" ON public.user_saved_exhibitions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can only insert their own saved exhibitions
CREATE POLICY "Users can insert own saved exhibitions" ON public.user_saved_exhibitions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can only update their own saved exhibitions
CREATE POLICY "Users can update own saved exhibitions" ON public.user_saved_exhibitions
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own saved exhibitions
CREATE POLICY "Users can delete own saved exhibitions" ON public.user_saved_exhibitions
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_user_saved_exhibitions_updated_at 
    BEFORE UPDATE ON public.user_saved_exhibitions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();