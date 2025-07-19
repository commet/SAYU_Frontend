-- SAYU 완전 마이그레이션 스크립트
-- Supabase SQL Editor에서 실행하세요

-- 필요한 확장 프로그램 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

BEGIN;

-- =============================================================================
-- 1. 사용자 프로필 테이블 (기존 확장)
-- =============================================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  email text,
  full_name text,
  profile_image_url text,
  apt_type text, -- APT 성격 유형 (예: 'LAEF')
  apt_dimensions jsonb DEFAULT '{}', -- G/S, A/R, M/E, F/S 점수
  personality_summary text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- =============================================================================
-- 2. 아트워크 컬렉션 시스템
-- =============================================================================

-- 사용자 컬렉션
CREATE TABLE IF NOT EXISTS art_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  is_public boolean DEFAULT true,
  is_shared boolean DEFAULT false,
  cover_image_url text,
  view_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 컬렉션 아이템
CREATE TABLE IF NOT EXISTS collection_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES art_collections(id) ON DELETE CASCADE,
  artwork_id text NOT NULL,
  museum_source text NOT NULL,
  artwork_data jsonb NOT NULL,
  emotion_tags text[] DEFAULT '{}',
  personal_note text,
  added_by uuid REFERENCES auth.users(id),
  added_at timestamp with time zone DEFAULT now(),
  UNIQUE(collection_id, artwork_id)
);

-- 컬렉션 협력자
CREATE TABLE IF NOT EXISTS collection_collaborators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES art_collections(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  role text DEFAULT 'collaborator' CHECK (role IN ('owner', 'collaborator')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'left')),
  invited_at timestamp with time zone DEFAULT now(),
  joined_at timestamp with time zone,
  UNIQUE(collection_id, user_id)
);

-- 컬렉션 좋아요
CREATE TABLE IF NOT EXISTS collection_likes (
  collection_id uuid REFERENCES art_collections(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (collection_id, user_id)
);

-- 컬렉션 댓글
CREATE TABLE IF NOT EXISTS collection_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES art_collections(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  content text NOT NULL,
  parent_id uuid REFERENCES collection_comments(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- =============================================================================
-- 3. 데일리 아트 챌린지 시스템
-- =============================================================================

-- 데일리 챌린지
CREATE TABLE IF NOT EXISTS daily_art_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date UNIQUE NOT NULL,
  artwork_id text NOT NULL,
  museum_source text NOT NULL,
  artwork_data jsonb NOT NULL,
  theme text,
  created_at timestamp with time zone DEFAULT now()
);

-- 사용자 챌린지 참여
CREATE TABLE IF NOT EXISTS user_challenge_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES daily_art_challenges(id),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  emotion_response text NOT NULL,
  personal_reflection text,
  color_choice text,
  mood_rating integer CHECK (mood_rating BETWEEN 1 AND 10),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);

-- 사용자 취향 프로필 (APT 기반)
CREATE TABLE IF NOT EXISTS user_taste_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id),
  apt_type text NOT NULL,
  preference_vector jsonb DEFAULT '{}',
  art_movement_preferences jsonb DEFAULT '{}',
  color_preferences jsonb DEFAULT '{}',
  emotion_associations jsonb DEFAULT '{}',
  consistency_score numeric(3,2) DEFAULT 0.5,
  last_updated timestamp with time zone DEFAULT now()
);

-- 매칭 결과
CREATE TABLE IF NOT EXISTS daily_challenge_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES daily_art_challenges(id),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  matched_users uuid[] DEFAULT '{}',
  compatibility_scores jsonb DEFAULT '{}',
  match_reasoning text,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);

-- =============================================================================
-- 4. 감상 교환 시스템 (4단계 점진적 공개)
-- =============================================================================

-- 감상 교환 세션
CREATE TABLE IF NOT EXISTS perception_exchange_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artwork_id text NOT NULL,
  museum_source text NOT NULL,
  artwork_data jsonb NOT NULL,
  initiator_id uuid NOT NULL REFERENCES auth.users(id),
  participant_id uuid NOT NULL REFERENCES auth.users(id),
  current_phase integer DEFAULT 1 CHECK (current_phase BETWEEN 1 AND 4),
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'discontinued')),
  created_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone
);

-- 각 단계별 응답
CREATE TABLE IF NOT EXISTS perception_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES perception_exchange_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  phase integer NOT NULL CHECK (phase BETWEEN 1 AND 4),
  response_data jsonb NOT NULL,
  submitted_at timestamp with time zone DEFAULT now(),
  UNIQUE(session_id, user_id, phase)
);

-- 교환 품질 평가
CREATE TABLE IF NOT EXISTS exchange_evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES perception_exchange_sessions(id),
  evaluator_id uuid NOT NULL REFERENCES auth.users(id),
  connection_quality integer CHECK (connection_quality BETWEEN 1 AND 5),
  insight_gained integer CHECK (insight_gained BETWEEN 1 AND 5),
  comfort_level integer CHECK (comfort_level BETWEEN 1 AND 5),
  would_continue boolean,
  feedback_text text,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(session_id, evaluator_id)
);

-- =============================================================================
-- 5. 전시 동행 매칭 시스템
-- =============================================================================

-- 전시 정보 (크롤링된 데이터)
CREATE TABLE IF NOT EXISTS exhibitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  venue text NOT NULL,
  description text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  location jsonb, -- 주소, 좌표 등
  ticket_info jsonb,
  images text[] DEFAULT '{}',
  tags text[] DEFAULT '{}',
  source_url text,
  created_at timestamp with time zone DEFAULT now()
);

-- 동행 요청
CREATE TABLE IF NOT EXISTS companion_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exhibition_id uuid NOT NULL REFERENCES exhibitions(id),
  requester_id uuid NOT NULL REFERENCES auth.users(id),
  preferred_date date,
  preferred_time time,
  flexible_scheduling boolean DEFAULT true,
  group_size_preference integer DEFAULT 2,
  interaction_style text[] DEFAULT '{}', -- ['깊은대화', '가벼운관람', '사진촬영', '메모작성']
  companion_preferences jsonb DEFAULT '{}', -- APT 선호도, 나이대 등
  additional_notes text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'matched', 'completed', 'cancelled')),
  created_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone
);

-- 동행 매칭
CREATE TABLE IF NOT EXISTS companion_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES companion_requests(id),
  requester_id uuid NOT NULL REFERENCES auth.users(id),
  companion_id uuid NOT NULL REFERENCES auth.users(id),
  compatibility_score numeric(3,2),
  match_reasoning jsonb,
  agreed_date date,
  agreed_time time,
  meeting_location text,
  status text DEFAULT 'proposed' CHECK (status IN ('proposed', 'accepted', 'confirmed', 'completed', 'cancelled')),
  created_at timestamp with time zone DEFAULT now()
);

-- 동행 후 평가
CREATE TABLE IF NOT EXISTS companion_evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES companion_matches(id),
  evaluator_id uuid NOT NULL REFERENCES auth.users(id),
  companion_rating integer CHECK (companion_rating BETWEEN 1 AND 5),
  exhibition_experience_rating integer CHECK (exhibition_experience_rating BETWEEN 1 AND 5),
  conversation_quality integer CHECK (conversation_quality BETWEEN 1 AND 5),
  would_meet_again boolean,
  feedback_text text,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(match_id, evaluator_id)
);

-- =============================================================================
-- 6. 관계 설정 시스템
-- =============================================================================

-- 사용자 관계 선호도 설정
CREATE TABLE IF NOT EXISTS user_relationship_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id),
  relationship_types text[] DEFAULT '{}', -- ['art_friend', 'conversation', 'romance_open', 'mentor', 'companion']
  age_range_min integer,
  age_range_max integer,
  location_preference jsonb,
  interaction_frequency text, -- 'occasional', 'regular', 'frequent'
  meeting_comfort_level text, -- 'online_only', 'public_places', 'flexible'
  shared_interests text[] DEFAULT '{}',
  privacy_level text DEFAULT 'moderate' CHECK (privacy_level IN ('private', 'moderate', 'open')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- =============================================================================
-- 7. 사용자 활동 및 커뮤니티 잠금해제
-- =============================================================================

-- 사용자 활동 추적
CREATE TABLE IF NOT EXISTS user_art_activities (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  artworks_viewed integer DEFAULT 0,
  collections_created integer DEFAULT 0,
  emotions_tagged integer DEFAULT 0,
  notes_written integer DEFAULT 0,
  daily_challenges_completed integer DEFAULT 0,
  exchange_sessions_completed integer DEFAULT 0,
  companion_meetings_completed integer DEFAULT 0,
  last_activity_at timestamp with time zone DEFAULT now(),
  community_unlocked boolean DEFAULT false,
  community_unlocked_at timestamp with time zone
);

-- 활동 로그
CREATE TABLE IF NOT EXISTS user_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  activity_type text NOT NULL,
  activity_data jsonb DEFAULT '{}',
  activity_date date DEFAULT CURRENT_DATE,
  created_at timestamp with time zone DEFAULT now()
);

-- 커뮤니티 상태
CREATE TABLE IF NOT EXISTS user_community_status (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id),
  is_unlocked boolean DEFAULT false,
  collections_count integer DEFAULT 0,
  items_count integer DEFAULT 0,
  active_days_count integer DEFAULT 0,
  unlocked_at timestamp with time zone,
  updated_at timestamp with time zone DEFAULT now()
);

-- =============================================================================
-- RLS 정책 설정
-- =============================================================================

-- 모든 테이블에 RLS 활성화
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE art_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_art_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenge_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_taste_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_challenge_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE perception_exchange_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE perception_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE companion_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE companion_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE companion_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_relationship_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_art_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_community_status ENABLE ROW LEVEL SECURITY;

-- 기본 정책들
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Public collections are viewable by all" ON art_collections
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can manage their own collections" ON art_collections
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view public collection items" ON collection_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM art_collections 
      WHERE id = collection_items.collection_id 
      AND is_public = true
    )
  );

CREATE POLICY "Collection owners can manage items" ON collection_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM art_collections 
      WHERE id = collection_items.collection_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Daily challenges are public" ON daily_art_challenges
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage their challenge responses" ON user_challenge_responses
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view exhibitions" ON exhibitions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage their requests" ON companion_requests
  FOR ALL USING (auth.uid() = requester_id);

CREATE POLICY "Users can view active requests" ON companion_requests
  FOR SELECT TO authenticated USING (status = 'active');

CREATE POLICY "Users can manage their activities" ON user_art_activities
  FOR ALL USING (auth.uid() = user_id);

-- =============================================================================
-- 인덱스 생성
-- =============================================================================

-- 컬렉션 관련 인덱스
CREATE INDEX IF NOT EXISTS idx_collections_user ON art_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_public ON art_collections(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_collection_items_collection ON collection_items(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_artwork ON collection_items(artwork_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_emotions ON collection_items USING GIN(emotion_tags);

-- 챌린지 관련 인덱스
CREATE INDEX IF NOT EXISTS idx_daily_challenges_date ON daily_art_challenges(date);
CREATE INDEX IF NOT EXISTS idx_challenge_responses_user_date ON user_challenge_responses(user_id, created_at);

-- 교환 및 매칭 인덱스
CREATE INDEX IF NOT EXISTS idx_exchange_sessions_status ON perception_exchange_sessions(status);
CREATE INDEX IF NOT EXISTS idx_companion_requests_exhibition ON companion_requests(exhibition_id);
CREATE INDEX IF NOT EXISTS idx_companion_requests_status ON companion_requests(status);

-- 활동 추적 인덱스
CREATE INDEX IF NOT EXISTS idx_user_activities_date ON user_activities(activity_date);
CREATE INDEX IF NOT EXISTS idx_user_activities_type ON user_activities(activity_type);

-- =============================================================================
-- 트리거 함수들
-- =============================================================================

-- 업데이트 시간 자동 갱신
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 사용자 활동 추적
CREATE OR REPLACE FUNCTION track_user_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- 컬렉션 생성 시
  IF TG_TABLE_NAME = 'art_collections' AND TG_OP = 'INSERT' THEN
    INSERT INTO user_art_activities (user_id, collections_created)
    VALUES (NEW.user_id, 1)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      collections_created = user_art_activities.collections_created + 1,
      last_activity_at = now();
      
    -- 활동 로그 기록
    INSERT INTO user_activities (user_id, activity_type, activity_data)
    VALUES (NEW.user_id, 'collection_created', jsonb_build_object('collection_id', NEW.id));
  
  -- 작품 추가 시
  ELSIF TG_TABLE_NAME = 'collection_items' AND TG_OP = 'INSERT' THEN
    UPDATE user_art_activities 
    SET 
      artworks_viewed = artworks_viewed + 1,
      emotions_tagged = emotions_tagged + CASE WHEN array_length(NEW.emotion_tags, 1) > 0 THEN 1 ELSE 0 END,
      notes_written = notes_written + CASE WHEN NEW.personal_note IS NOT NULL THEN 1 ELSE 0 END,
      last_activity_at = now()
    WHERE user_id = NEW.added_by;
    
    INSERT INTO user_activities (user_id, activity_type, activity_data)
    VALUES (NEW.added_by, 'artwork_collected', jsonb_build_object('artwork_id', NEW.artwork_id));
    
  -- 챌린지 완료 시
  ELSIF TG_TABLE_NAME = 'user_challenge_responses' AND TG_OP = 'INSERT' THEN
    UPDATE user_art_activities 
    SET 
      daily_challenges_completed = daily_challenges_completed + 1,
      last_activity_at = now()
    WHERE user_id = NEW.user_id;
    
    INSERT INTO user_activities (user_id, activity_type, activity_data)
    VALUES (NEW.user_id, 'challenge_completed', jsonb_build_object('challenge_id', NEW.challenge_id));
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 커뮤니티 잠금 해제 확인
CREATE OR REPLACE FUNCTION check_community_unlock()
RETURNS TRIGGER AS $$
DECLARE
  activity_record RECORD;
  unlock_criteria RECORD;
BEGIN
  -- 현재 활동 상황 조회
  SELECT * INTO activity_record 
  FROM user_art_activities 
  WHERE user_id = NEW.user_id;
  
  -- 잠금 해제 기준
  unlock_criteria := ROW(3, 10, 7); -- 컬렉션 3개, 작품 10개, 활동 7일
  
  -- 조건 확인
  IF activity_record.collections_created >= 3 
     AND activity_record.artworks_viewed >= 10
     AND (SELECT COUNT(DISTINCT activity_date) 
          FROM user_activities 
          WHERE user_id = NEW.user_id) >= 7
     AND NOT activity_record.community_unlocked THEN
    
    -- 커뮤니티 잠금 해제
    UPDATE user_art_activities 
    SET 
      community_unlocked = true,
      community_unlocked_at = now()
    WHERE user_id = NEW.user_id;
    
    -- 커뮤니티 상태 업데이트
    INSERT INTO user_community_status (user_id, is_unlocked, unlocked_at)
    VALUES (NEW.user_id, true, now())
    ON CONFLICT (user_id)
    DO UPDATE SET 
      is_unlocked = true,
      unlocked_at = now(),
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 트리거 설정
-- =============================================================================

-- 업데이트 시간 트리거
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_collections_updated_at
  BEFORE UPDATE ON art_collections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_relationship_prefs_updated_at
  BEFORE UPDATE ON user_relationship_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 활동 추적 트리거
CREATE TRIGGER track_collection_creation
  AFTER INSERT ON art_collections
  FOR EACH ROW EXECUTE FUNCTION track_user_activity();

CREATE TRIGGER track_item_addition
  AFTER INSERT ON collection_items
  FOR EACH ROW EXECUTE FUNCTION track_user_activity();

CREATE TRIGGER track_challenge_completion
  AFTER INSERT ON user_challenge_responses
  FOR EACH ROW EXECUTE FUNCTION track_user_activity();

-- 커뮤니티 잠금해제 트리거
CREATE TRIGGER check_community_unlock_trigger
  AFTER INSERT OR UPDATE ON user_activities
  FOR EACH ROW EXECUTE FUNCTION check_community_unlock();

-- =============================================================================
-- 초기 데이터 설정
-- =============================================================================

-- 샘플 전시 데이터 (실제 데이터로 대체 필요)
INSERT INTO exhibitions (title, venue, description, start_date, end_date, location, tags) VALUES
('모네와 인상주의', '국립현대미술관', '클로드 모네의 대표작과 인상주의 화가들의 작품을 만나보세요', '2024-01-01', '2024-03-31', '{"address": "서울특별시 종로구", "coordinates": {"lat": 37.5759, "lng": 126.9768}}', ARRAY['인상주의', '모네', '서양화']),
('한국 현대미술의 흐름', '서울시립미술관', '1970년대부터 현재까지 한국 현대미술의 변화', '2024-02-01', '2024-04-30', '{"address": "서울특별시 중구", "coordinates": {"lat": 37.5662, "lng": 126.9779}}', ARRAY['현대미술', '한국미술', '회화']);

COMMIT;

-- 마이그레이션 완료 확인
SELECT 'Migration completed successfully' as status;