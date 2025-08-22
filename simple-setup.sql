-- Simple setup for user_activities table
CREATE TABLE IF NOT EXISTS public.user_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL,
  target_id TEXT,
  target_type TEXT,
  target_title TEXT,
  target_subtitle TEXT,
  target_image_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON public.user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON public.user_activities(created_at DESC);

-- Enable RLS
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY IF NOT EXISTS "Users can view own activities" ON public.user_activities
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own activities" ON public.user_activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Simple track activity function
CREATE OR REPLACE FUNCTION public.track_activity(
  p_activity_type TEXT,
  p_target_id TEXT DEFAULT NULL,
  p_target_type TEXT DEFAULT NULL,
  p_target_title TEXT DEFAULT NULL,
  p_target_subtitle TEXT DEFAULT NULL,
  p_target_image_url TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::JSONB
) RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
  v_activity_id UUID;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Insert activity
  INSERT INTO public.user_activities (
    user_id,
    activity_type,
    target_id,
    target_type,
    target_title,
    target_subtitle,
    target_image_url,
    metadata
  ) VALUES (
    v_user_id,
    p_activity_type,
    p_target_id,
    p_target_type,
    p_target_title,
    p_target_subtitle,
    p_target_image_url,
    p_metadata
  ) RETURNING id INTO v_activity_id;
  
  RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.track_activity TO authenticated;