-- 사용자 좋아요/취향 추적 테이블
CREATE TABLE IF NOT EXISTS user_artwork_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  artwork_id TEXT NOT NULL,
  
  -- 상호작용 타입
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('like', 'save', 'view', 'share')),
  
  -- 상호작용 메타데이터
  view_duration INTEGER, -- 초 단위
  zoom_used BOOLEAN DEFAULT FALSE,
  detail_modal_opened BOOLEAN DEFAULT FALSE,
  
  -- 작품 정보 (분석용)
  artwork_title TEXT,
  artwork_artist TEXT,
  artwork_year TEXT,
  artwork_style TEXT,
  artwork_sayu_type TEXT, -- 작품의 sayuType
  
  -- 사용자 정보 (분석용)
  user_apt_type TEXT, -- 사용자의 APT 타입
  
  -- 타임스탬프
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 복합 유니크 키 (한 작품에 대한 중복 좋아요 방지)
  UNIQUE(user_id, artwork_id, interaction_type)
);

-- 인덱스 생성
CREATE INDEX idx_preferences_user_id ON user_artwork_preferences(user_id);
CREATE INDEX idx_preferences_artwork_id ON user_artwork_preferences(artwork_id);
CREATE INDEX idx_preferences_user_apt ON user_artwork_preferences(user_apt_type);
CREATE INDEX idx_preferences_artwork_sayu ON user_artwork_preferences(artwork_sayu_type);
CREATE INDEX idx_preferences_created_at ON user_artwork_preferences(created_at DESC);

-- APT 유형별 취향 패턴 집계 뷰
CREATE OR REPLACE VIEW apt_preference_patterns AS
SELECT 
  user_apt_type,
  artwork_sayu_type,
  artwork_artist,
  artwork_style,
  COUNT(*) as interaction_count,
  COUNT(DISTINCT user_id) as unique_users,
  AVG(CASE WHEN interaction_type = 'like' THEN 1 ELSE 0 END) as like_rate,
  AVG(view_duration) as avg_view_duration
FROM user_artwork_preferences
WHERE user_apt_type IS NOT NULL
GROUP BY user_apt_type, artwork_sayu_type, artwork_artist, artwork_style;

-- 개인별 취향 벡터 테이블
CREATE TABLE IF NOT EXISTS user_preference_vectors (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  apt_type TEXT,
  
  -- 취향 벡터 (0-1 정규화)
  color_intensity_pref FLOAT DEFAULT 0.5,
  emotional_tone_pref FLOAT DEFAULT 0.5,
  complexity_pref FLOAT DEFAULT 0.5,
  abstract_level_pref FLOAT DEFAULT 0.5,
  human_presence_pref FLOAT DEFAULT 0.5,
  nature_element_pref FLOAT DEFAULT 0.5,
  
  -- 선호 작가/스타일
  preferred_artists TEXT[],
  preferred_styles TEXT[],
  preferred_sayu_types TEXT[],
  
  -- 통계
  total_likes INTEGER DEFAULT 0,
  total_saves INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  avg_view_duration FLOAT,
  
  -- 업데이트 시간
  last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 정책
ALTER TABLE user_artwork_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preference_vectors ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 선호도만 관리 가능
CREATE POLICY "Users can manage own preferences" ON user_artwork_preferences
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own preference vectors" ON user_preference_vectors
  FOR SELECT USING (auth.uid() = user_id);

-- 트리거: 선호도 변경 시 벡터 업데이트 플래그
CREATE OR REPLACE FUNCTION flag_vector_update()
RETURNS TRIGGER AS $$
BEGIN
  -- 벡터 업데이트가 필요함을 표시
  UPDATE user_preference_vectors 
  SET updated_at = NOW()
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_preference_change
  AFTER INSERT OR UPDATE ON user_artwork_preferences
  FOR EACH ROW
  EXECUTE FUNCTION flag_vector_update();