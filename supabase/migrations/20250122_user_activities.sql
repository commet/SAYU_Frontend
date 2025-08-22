-- User Activities Tracking System for SAYU
-- 사용자의 모든 활동을 추적하는 통합 테이블

-- Create user_activities table
CREATE TABLE IF NOT EXISTS public.user_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Activity type and target
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'view_artwork',      -- 작품 조회
    'save_artwork',      -- 작품 저장
    'like_artwork',      -- 작품 좋아요
    'view_exhibition',   -- 전시 조회
    'save_exhibition',   -- 전시 저장
    'record_exhibition', -- 전시 기록
    'write_comment',     -- 댓글 작성
    'follow_user',       -- 사용자 팔로우
    'create_collection', -- 컬렉션 생성
    'join_community',    -- 커뮤니티 참여
    'complete_quiz',     -- 퀴즈 완료
    'profile_visit'      -- 프로필 방문
  )),
  
  -- Target information (저장해서 조인 최소화)
  target_id TEXT,           -- 대상 ID (artwork_id, exhibition_id, user_id 등)
  target_type TEXT,         -- 대상 타입 (artwork, exhibition, user, post 등)
  target_title TEXT,        -- 표시용 제목 (조인 방지)
  target_subtitle TEXT,     -- 부제목 (작가명, 전시관명 등)
  target_image_url TEXT,    -- 썸네일 URL (조인 방지)
  
  -- Additional metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_user_activity UNIQUE(user_id, activity_type, target_id, created_at)
);

-- Indexes for performance
CREATE INDEX idx_user_activities_user_time 
  ON public.user_activities(user_id, created_at DESC);

CREATE INDEX idx_user_activities_type 
  ON public.user_activities(activity_type, created_at DESC);

CREATE INDEX idx_user_activities_target 
  ON public.user_activities(target_type, target_id);

-- RLS Policies
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

-- Users can only see their own activities
CREATE POLICY "Users can view own activities" 
  ON public.user_activities 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can insert their own activities
CREATE POLICY "Users can insert own activities" 
  ON public.user_activities 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users cannot update activities (immutable log)
-- No UPDATE policy

-- Users can delete their own old activities
CREATE POLICY "Users can delete own old activities" 
  ON public.user_activities 
  FOR DELETE 
  USING (
    auth.uid() = user_id 
    AND created_at < NOW() - INTERVAL '30 days'
  );

-- Function to automatically clean old activities (optional)
CREATE OR REPLACE FUNCTION public.clean_old_activities()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.user_activities
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$;

-- Function to get user's recent activities with formatted output
CREATE OR REPLACE FUNCTION public.get_recent_activities(
  p_user_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  activity_type TEXT,
  target_id TEXT,
  target_title TEXT,
  target_subtitle TEXT,
  target_image_url TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ,
  formatted_time TEXT,
  activity_icon TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ua.id,
    ua.activity_type,
    ua.target_id,
    ua.target_title,
    ua.target_subtitle,
    ua.target_image_url,
    ua.metadata,
    ua.created_at,
    -- Formatted relative time
    CASE 
      WHEN ua.created_at > NOW() - INTERVAL '1 hour' THEN 
        EXTRACT(MINUTE FROM NOW() - ua.created_at)::TEXT || '분 전'
      WHEN ua.created_at > NOW() - INTERVAL '1 day' THEN 
        EXTRACT(HOUR FROM NOW() - ua.created_at)::TEXT || '시간 전'
      WHEN ua.created_at > NOW() - INTERVAL '7 days' THEN 
        EXTRACT(DAY FROM NOW() - ua.created_at)::TEXT || '일 전'
      ELSE 
        TO_CHAR(ua.created_at, 'MM월 DD일')
    END AS formatted_time,
    -- Activity icon mapping
    CASE ua.activity_type
      WHEN 'view_artwork' THEN '👁️'
      WHEN 'save_artwork' THEN '💾'
      WHEN 'like_artwork' THEN '❤️'
      WHEN 'view_exhibition' THEN '🏛️'
      WHEN 'save_exhibition' THEN '📌'
      WHEN 'record_exhibition' THEN '📝'
      WHEN 'write_comment' THEN '💬'
      WHEN 'follow_user' THEN '👥'
      WHEN 'create_collection' THEN '📁'
      WHEN 'join_community' THEN '🌐'
      WHEN 'complete_quiz' THEN '✅'
      WHEN 'profile_visit' THEN '👤'
      ELSE '📍'
    END AS activity_icon
  FROM public.user_activities ua
  WHERE ua.user_id = COALESCE(p_user_id, auth.uid())
  ORDER BY ua.created_at DESC
  LIMIT p_limit;
END;
$$;

-- Function to track activity (with duplicate prevention)
CREATE OR REPLACE FUNCTION public.track_activity(
  p_activity_type TEXT,
  p_target_id TEXT DEFAULT NULL,
  p_target_type TEXT DEFAULT NULL,
  p_target_title TEXT DEFAULT NULL,
  p_target_subtitle TEXT DEFAULT NULL,
  p_target_image_url TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_activity_id UUID;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  -- Check for duplicate activity in last 5 minutes
  SELECT id INTO v_activity_id
  FROM public.user_activities
  WHERE user_id = v_user_id
    AND activity_type = p_activity_type
    AND target_id = p_target_id
    AND created_at > NOW() - INTERVAL '5 minutes'
  LIMIT 1;
  
  -- If duplicate found, return existing ID
  IF v_activity_id IS NOT NULL THEN
    RETURN v_activity_id;
  END IF;
  
  -- Insert new activity
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
  )
  RETURNING id INTO v_activity_id;
  
  RETURN v_activity_id;
END;
$$;

-- Grant necessary permissions
GRANT ALL ON public.user_activities TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_recent_activities TO authenticated;
GRANT EXECUTE ON FUNCTION public.track_activity TO authenticated;

-- Create scheduled job to clean old activities (if pg_cron is available)
-- Note: This requires pg_cron extension to be enabled
-- SELECT cron.schedule('clean-old-activities', '0 3 * * *', 'SELECT public.clean_old_activities();');