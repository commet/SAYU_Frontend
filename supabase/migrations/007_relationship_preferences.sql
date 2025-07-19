-- 관계 유형 설정 기능

-- 1. 사용자 관계 선호도 설정 (user_profiles 테이블 확장)
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS relationship_preferences jsonb DEFAULT '{}';

-- relationship_preferences 구조:
-- {
--   "seeking_types": ["art_friend", "conversation", "romance_open"],
--   "romance_openness": 0.7, -- 0-1 scale
--   "age_preference": [25, 35],
--   "gender_preference": "any",
--   "location_range": 10, -- km
--   "updated_at": "2024-01-01T00:00:00Z"
-- }

-- 2. 관계 유형 정의
CREATE TABLE IF NOT EXISTS relationship_types (
  code text PRIMARY KEY,
  name_ko text NOT NULL,
  name_en text NOT NULL,
  description text,
  icon text, -- 이모지 또는 아이콘 클래스
  sort_order integer DEFAULT 0
);

-- 기본 관계 유형 삽입
INSERT INTO relationship_types (code, name_ko, name_en, description, icon, sort_order) VALUES
('art_friend', '취향 친구', 'Art Friend', '예술 취향을 공유하는 친구', '🎨', 1),
('conversation', '대화 상대', 'Conversation Partner', '깊이 있는 대화를 나누는 상대', '💬', 2),
('romance_open', '로맨스 가능', 'Open to Romance', '친구로 시작하되 로맨스 발전 가능', '💖', 3),
('mentor', '멘토/멘티', 'Mentor/Mentee', '예술적 성장을 돕는 관계', '🌱', 4),
('companion', '전시 동행', 'Exhibition Companion', '함께 전시를 관람하는 동반자', '🏛️', 5)
ON CONFLICT (code) DO NOTHING;

-- 3. 관계 발전 추적
CREATE TABLE relationship_progression (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id uuid NOT NULL REFERENCES auth.users(id),
  user2_id uuid NOT NULL REFERENCES auth.users(id),
  
  -- 관계 시작
  initial_connection_type text NOT NULL, -- 첫 연결 방식 (daily_challenge, perception_exchange, exhibition_companion)
  initial_connection_date timestamp with time zone DEFAULT now(),
  
  -- 현재 관계 상태
  current_relationship_type text REFERENCES relationship_types(code),
  relationship_level integer DEFAULT 1 CHECK (relationship_level BETWEEN 1 AND 5),
  
  -- 상호작용 통계
  total_interactions integer DEFAULT 0,
  last_interaction_at timestamp with time zone,
  
  -- 관계 품질 지표
  communication_quality numeric(3,2), -- 0-1
  shared_interests_score numeric(3,2), -- 0-1
  emotional_resonance numeric(3,2), -- 0-1
  
  -- 특별한 순간들
  milestones jsonb DEFAULT '[]', -- [{type: "first_exhibition", date: "...", details: {...}}]
  
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  UNIQUE(user1_id, user2_id)
);

-- 4. 관계 유형별 매칭 가중치
CREATE TABLE relationship_matching_weights (
  seeking_type text REFERENCES relationship_types(code),
  factor text NOT NULL, -- apt_compatibility, taste_similarity, activity_overlap, etc.
  weight numeric(3,2) NOT NULL DEFAULT 0.5,
  PRIMARY KEY (seeking_type, factor)
);

-- 기본 가중치 설정
INSERT INTO relationship_matching_weights (seeking_type, factor, weight) VALUES
-- 취향 친구: 취향 유사도 중시
('art_friend', 'taste_similarity', 0.5),
('art_friend', 'apt_compatibility', 0.3),
('art_friend', 'activity_overlap', 0.2),

-- 대화 상대: APT 호환성과 커뮤니케이션 중시
('conversation', 'apt_compatibility', 0.4),
('conversation', 'communication_style', 0.4),
('conversation', 'taste_similarity', 0.2),

-- 로맨스 가능: 균형잡힌 매칭
('romance_open', 'apt_compatibility', 0.35),
('romance_open', 'taste_similarity', 0.35),
('romance_open', 'lifestyle_match', 0.3),

-- 멘토/멘티: 경험 차이와 성장 가능성
('mentor', 'experience_gap', 0.4),
('mentor', 'growth_potential', 0.3),
('mentor', 'communication_style', 0.3),

-- 전시 동행: 일정과 관람 스타일
('companion', 'schedule_flexibility', 0.4),
('companion', 'viewing_style_match', 0.3),
('companion', 'location_proximity', 0.3)
ON CONFLICT DO NOTHING;

-- 5. 관계 경계 설정
CREATE TABLE relationship_boundaries (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id),
  
  -- 프라이버시 설정
  show_real_name_after text DEFAULT 'mutual_agreement' 
    CHECK (show_real_name_after IN ('never', 'match', 'first_meeting', 'mutual_agreement')),
  share_contact_after text DEFAULT 'first_meeting'
    CHECK (share_contact_after IN ('never', 'match', 'first_meeting', 'mutual_agreement')),
  
  -- 매칭 제한
  block_list uuid[] DEFAULT '{}', -- 차단한 사용자들
  pause_matching boolean DEFAULT false,
  pause_until timestamp with time zone,
  
  -- 자동 응답 설정
  auto_decline_if_no_photo boolean DEFAULT false,
  auto_decline_incomplete_profiles boolean DEFAULT false,
  
  updated_at timestamp with time zone DEFAULT now()
);

-- RLS 정책
ALTER TABLE relationship_progression ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationship_boundaries ENABLE ROW LEVEL SECURITY;

-- 관계 진행은 당사자만 조회
CREATE POLICY "관계 진행 당사자만 조회" ON relationship_progression
  FOR ALL USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- 경계 설정은 본인만
CREATE POLICY "본인의 경계 설정만 관리" ON relationship_boundaries
  FOR ALL USING (auth.uid() = user_id);

-- 인덱스
CREATE INDEX idx_progression_users ON relationship_progression(user1_id, user2_id);
CREATE INDEX idx_progression_type ON relationship_progression(current_relationship_type);
CREATE INDEX idx_boundaries_user ON relationship_boundaries(user_id);

-- 함수: 관계 선호도 업데이트
CREATE OR REPLACE FUNCTION update_relationship_preferences(
  p_seeking_types text[],
  p_romance_openness numeric DEFAULT NULL,
  p_age_preference int[] DEFAULT NULL,
  p_gender_preference text DEFAULT NULL,
  p_location_range integer DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  v_preferences jsonb;
BEGIN
  -- 현재 설정 가져오기
  SELECT COALESCE(relationship_preferences, '{}'::jsonb)
  INTO v_preferences
  FROM user_profiles
  WHERE user_id = auth.uid();
  
  -- 업데이트할 필드들 설정
  IF p_seeking_types IS NOT NULL THEN
    v_preferences := jsonb_set(v_preferences, '{seeking_types}', to_jsonb(p_seeking_types));
  END IF;
  
  IF p_romance_openness IS NOT NULL THEN
    v_preferences := jsonb_set(v_preferences, '{romance_openness}', to_jsonb(p_romance_openness));
  END IF;
  
  IF p_age_preference IS NOT NULL AND array_length(p_age_preference, 1) = 2 THEN
    v_preferences := jsonb_set(v_preferences, '{age_preference}', to_jsonb(p_age_preference));
  END IF;
  
  IF p_gender_preference IS NOT NULL THEN
    v_preferences := jsonb_set(v_preferences, '{gender_preference}', to_jsonb(p_gender_preference));
  END IF;
  
  IF p_location_range IS NOT NULL THEN
    v_preferences := jsonb_set(v_preferences, '{location_range}', to_jsonb(p_location_range));
  END IF;
  
  -- 업데이트 시간 추가
  v_preferences := jsonb_set(v_preferences, '{updated_at}', to_jsonb(now()));
  
  -- 프로필 업데이트
  UPDATE user_profiles
  SET 
    relationship_preferences = v_preferences,
    updated_at = now()
  WHERE user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 함수: 관계 유형별 최적 매칭 계산
CREATE OR REPLACE FUNCTION calculate_relationship_match(
  p_user_id uuid,
  p_candidate_id uuid,
  p_relationship_type text
)
RETURNS numeric AS $$
DECLARE
  v_weights RECORD;
  v_score numeric := 0;
  v_factor_score numeric;
  v_total_weight numeric := 0;
BEGIN
  -- 관계 유형별 가중치 가져오기
  FOR v_weights IN
    SELECT factor, weight
    FROM relationship_matching_weights
    WHERE seeking_type = p_relationship_type
  LOOP
    -- 각 요소별 점수 계산
    CASE v_weights.factor
      WHEN 'apt_compatibility' THEN
        -- APT 호환성 점수
        SELECT score INTO v_factor_score
        FROM compatibility_scores cs
        JOIN user_profiles up1 ON up1.user_id = p_user_id
        JOIN user_profiles up2 ON up2.user_id = p_candidate_id
        WHERE (cs.type1 = up1.personality_type AND cs.type2 = up2.personality_type)
           OR (cs.type1 = up2.personality_type AND cs.type2 = up1.personality_type);
        
      WHEN 'taste_similarity' THEN
        -- 취향 유사도 (작품 컬렉션 기반)
        v_factor_score := 0.7; -- TODO: 실제 계산 구현
        
      WHEN 'communication_style' THEN
        -- 소통 스타일 (메시지 길이, 빈도 등)
        v_factor_score := 0.6; -- TODO: 실제 계산 구현
        
      ELSE
        v_factor_score := 0.5; -- 기본값
    END CASE;
    
    IF v_factor_score IS NOT NULL THEN
      v_score := v_score + (v_factor_score * v_weights.weight);
      v_total_weight := v_total_weight + v_weights.weight;
    END IF;
  END LOOP;
  
  -- 정규화
  IF v_total_weight > 0 THEN
    RETURN v_score / v_total_weight;
  ELSE
    RETURN 0.5;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 트리거: 관계 진행 상황 자동 업데이트
CREATE OR REPLACE FUNCTION update_relationship_progression()
RETURNS TRIGGER AS $$
BEGIN
  -- 상호작용 카운트 증가
  UPDATE relationship_progression
  SET 
    total_interactions = total_interactions + 1,
    last_interaction_at = now(),
    updated_at = now()
  WHERE (user1_id = NEW.user_id AND user2_id = NEW.partner_id)
     OR (user1_id = NEW.partner_id AND user2_id = NEW.user_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 다양한 상호작용 테이블에 트리거 연결 가능
-- 예: perception_messages, exhibition_companions 등