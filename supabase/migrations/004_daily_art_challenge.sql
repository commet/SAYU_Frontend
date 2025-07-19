-- 데일리 아트 챌린지 시스템 (APT 기반 정교한 매칭)

-- 1. 데일리 챌린지 작품
CREATE TABLE daily_challenge_artworks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL UNIQUE,
  artwork_id text NOT NULL,
  museum_source text NOT NULL,
  artwork_data jsonb NOT NULL,
  -- 작품 특성 분류 (매칭에 활용)
  artwork_vector jsonb DEFAULT '{}', -- {시대, 색감, 주제, 감정톤}
  theme text, -- 오늘의 테마
  curator_note text,
  created_at timestamp with time zone DEFAULT now()
);

-- 2. 사용자 챌린지 응답
CREATE TABLE daily_challenge_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_date date NOT NULL REFERENCES daily_challenge_artworks(date),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  user_apt_type text NOT NULL, -- 응답 시점의 APT 타입 기록
  
  -- 감정 반응 데이터
  emotion_tags text[] NOT NULL CHECK (array_length(emotion_tags, 1) = 3),
  emotion_selection_time integer, -- 선택까지 걸린 시간(초)
  emotion_changed boolean DEFAULT false, -- 선택을 바꿨는지 여부
  
  -- 선택적 텍스트 감상
  personal_note text,
  
  responded_at timestamp with time zone DEFAULT now(),
  UNIQUE(challenge_date, user_id)
);

-- 3. APT별 작품 반응 패턴 (누적 학습)
CREATE TABLE apt_artwork_patterns (
  apt_type text NOT NULL,
  artwork_characteristics jsonb NOT NULL, -- 작품 특성
  common_emotions text[], -- 자주 선택되는 감정들
  response_count integer DEFAULT 0,
  confidence_score numeric(3,2), -- 패턴의 신뢰도 0-1
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (apt_type, artwork_characteristics)
);

-- 4. 사용자 취향 프로필 (동적 업데이트)
CREATE TABLE user_taste_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id),
  apt_type text NOT NULL,
  
  -- 취향 벡터 (0-1 스케일)
  preference_vector jsonb DEFAULT '{}', -- {고전:0.7, 현대:0.3, ...}
  
  -- 반응 패턴
  avg_response_time integer, -- 평균 응답 시간
  consistency_score numeric(3,2), -- 선택의 일관성 0-1
  exploration_score numeric(3,2), -- 다양성 추구 성향 0-1
  
  -- 누적 통계
  total_challenges integer DEFAULT 0,
  artworks_by_era jsonb DEFAULT '{}', -- {고전: 10, 근대: 5, ...}
  artworks_by_style jsonb DEFAULT '{}', -- {추상: 8, 인물: 12, ...}
  emotion_frequency jsonb DEFAULT '{}', -- {평온함: 20, 설렘: 15, ...}
  
  updated_at timestamp with time zone DEFAULT now()
);

-- 5. 정교한 매칭 (APT + 취향 패턴 기반)
CREATE TABLE daily_challenge_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_date date NOT NULL,
  user1_id uuid NOT NULL REFERENCES auth.users(id),
  user2_id uuid NOT NULL REFERENCES auth.users(id),
  
  -- 매칭 점수 구성요소
  apt_compatibility_score numeric(3,2), -- APT 궁합도 (0-1)
  taste_similarity_score numeric(3,2), -- 취향 유사도 (0-1)
  emotion_match_score numeric(3,2), -- 오늘의 감정 일치도 (0-1)
  
  -- 종합 매칭 점수
  total_match_score numeric(3,2), -- 가중평균
  match_rank integer, -- 당일 매칭 순위
  
  -- 상호작용
  notification_sent boolean DEFAULT false,
  interaction_started boolean DEFAULT false,
  
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(challenge_date, user1_id, user2_id)
);

-- 6. 연속 참여 및 리워드 (기존 구조 활용)
-- user_challenges 테이블 이미 존재
-- achievements, user_achievements 테이블 이미 존재

-- RLS 정책
ALTER TABLE daily_challenge_artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_challenge_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE apt_artwork_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_taste_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_challenge_matches ENABLE ROW LEVEL SECURITY;

-- 정책 설정
CREATE POLICY "챌린지 작품은 공개" ON daily_challenge_artworks
  FOR SELECT USING (true);

CREATE POLICY "자신의 응답만 관리" ON daily_challenge_responses
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "APT 패턴은 읽기 전용" ON apt_artwork_patterns
  FOR SELECT USING (true);

CREATE POLICY "자신의 취향 프로필만 조회" ON user_taste_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "자신이 포함된 매칭만 조회" ON daily_challenge_matches
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- 인덱스
CREATE INDEX idx_challenge_date ON daily_challenge_artworks(date);
CREATE INDEX idx_response_date_user ON daily_challenge_responses(challenge_date, user_id);
CREATE INDEX idx_response_apt ON daily_challenge_responses(user_apt_type);
CREATE INDEX idx_taste_profile_apt ON user_taste_profiles(apt_type);
CREATE INDEX idx_matches_date ON daily_challenge_matches(challenge_date);
CREATE INDEX idx_matches_score ON daily_challenge_matches(total_match_score DESC);

-- 함수: 취향 프로필 업데이트
CREATE OR REPLACE FUNCTION update_user_taste_profile()
RETURNS TRIGGER AS $$
DECLARE
  artwork_data jsonb;
  current_profile jsonb;
  emotion text;
BEGIN
  -- 작품 정보 가져오기
  SELECT artwork_vector INTO artwork_data
  FROM daily_challenge_artworks
  WHERE date = NEW.challenge_date;
  
  -- 사용자 취향 프로필 업데이트 또는 생성
  INSERT INTO user_taste_profiles (user_id, apt_type)
  VALUES (NEW.user_id, NEW.user_apt_type)
  ON CONFLICT (user_id) DO UPDATE
  SET 
    apt_type = NEW.user_apt_type,
    total_challenges = user_taste_profiles.total_challenges + 1,
    updated_at = now();
  
  -- 감정 빈도 업데이트
  FOREACH emotion IN ARRAY NEW.emotion_tags
  LOOP
    UPDATE user_taste_profiles
    SET emotion_frequency = 
      jsonb_set(
        COALESCE(emotion_frequency, '{}'::jsonb),
        ARRAY[emotion],
        to_jsonb(COALESCE((emotion_frequency->>emotion)::integer, 0) + 1)
      )
    WHERE user_id = NEW.user_id;
  END LOOP;
  
  -- APT별 작품 반응 패턴 업데이트
  INSERT INTO apt_artwork_patterns (apt_type, artwork_characteristics, common_emotions, response_count)
  VALUES (NEW.user_apt_type, artwork_data, NEW.emotion_tags, 1)
  ON CONFLICT (apt_type, artwork_characteristics) 
  DO UPDATE SET
    response_count = apt_artwork_patterns.response_count + 1,
    updated_at = now();
  
  -- 기존 활동 추적 업데이트
  UPDATE user_art_activities
  SET 
    daily_challenges_completed = daily_challenges_completed + 1,
    last_activity_at = now()
  WHERE user_id = NEW.user_id;
  
  -- 기존 user_challenges 테이블 업데이트 (게이미피케이션)
  INSERT INTO user_challenges (user_id, challenge_id, completed_at, points_earned)
  SELECT 
    NEW.user_id,
    c.id,
    now(),
    c.points
  FROM challenges c
  WHERE c.type = 'daily_art'
    AND c.is_active = true
  ON CONFLICT DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_taste_profile_on_response
  AFTER INSERT ON daily_challenge_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_user_taste_profile();

-- 함수: 정교한 매칭 계산
CREATE OR REPLACE FUNCTION calculate_daily_matches(p_date date)
RETURNS void AS $$
DECLARE
  user1 RECORD;
  user2 RECORD;
  apt_compat numeric;
  taste_sim numeric;
  emotion_match numeric;
  total_score numeric;
BEGIN
  -- 해당 날짜의 모든 응답자 쌍에 대해 매칭 계산
  FOR user1 IN 
    SELECT DISTINCT 
      r.user_id,
      r.user_apt_type,
      r.emotion_tags,
      tp.preference_vector,
      tp.consistency_score
    FROM daily_challenge_responses r
    JOIN user_taste_profiles tp ON tp.user_id = r.user_id
    WHERE r.challenge_date = p_date
  LOOP
    FOR user2 IN 
      SELECT DISTINCT 
        r.user_id,
        r.user_apt_type,
        r.emotion_tags,
        tp.preference_vector,
        tp.consistency_score
      FROM daily_challenge_responses r
      JOIN user_taste_profiles tp ON tp.user_id = r.user_id
      WHERE r.challenge_date = p_date
        AND r.user_id > user1.user_id -- 중복 방지
    LOOP
      -- 1. APT 궁합도 계산 (compatibility_scores 테이블 참조)
      SELECT score INTO apt_compat
      FROM compatibility_scores
      WHERE (type1 = user1.user_apt_type AND type2 = user2.user_apt_type)
         OR (type1 = user2.user_apt_type AND type2 = user1.user_apt_type);
      
      IF apt_compat IS NULL THEN apt_compat := 0.5; END IF;
      
      -- 2. 취향 유사도 계산 (preference_vector 코사인 유사도)
      -- 여기서는 간단히 구현
      taste_sim := 0.7; -- TODO: 실제 벡터 계산 구현
      
      -- 3. 오늘의 감정 일치도
      emotion_match := (
        SELECT COUNT(*)::numeric / 3.0
        FROM unnest(user1.emotion_tags) AS e1
        WHERE e1 = ANY(user2.emotion_tags)
      );
      
      -- 4. 종합 점수 계산 (가중평균)
      total_score := (apt_compat * 0.4) + (taste_sim * 0.3) + (emotion_match * 0.3);
      
      -- 5. 매칭 기록 (점수가 0.7 이상인 경우만)
      IF total_score >= 0.7 THEN
        INSERT INTO daily_challenge_matches (
          challenge_date,
          user1_id,
          user2_id,
          apt_compatibility_score,
          taste_similarity_score,
          emotion_match_score,
          total_match_score
        ) VALUES (
          p_date,
          user1.user_id,
          user2.user_id,
          apt_compat,
          taste_sim,
          emotion_match,
          total_score
        )
        ON CONFLICT DO NOTHING;
      END IF;
    END LOOP;
  END LOOP;
  
  -- 매칭 순위 업데이트
  WITH ranked_matches AS (
    SELECT 
      id,
      ROW_NUMBER() OVER (PARTITION BY challenge_date ORDER BY total_match_score DESC) as rank
    FROM daily_challenge_matches
    WHERE challenge_date = p_date
  )
  UPDATE daily_challenge_matches m
  SET match_rank = r.rank
  FROM ranked_matches r
  WHERE m.id = r.id;
  
END;
$$ LANGUAGE plpgsql;

-- 매일 자정에 실행할 함수: 새로운 챌린지 생성
CREATE OR REPLACE FUNCTION create_daily_challenge()
RETURNS void AS $$
DECLARE
  selected_artwork jsonb;
  artwork_vector jsonb;
BEGIN
  -- TODO: 실제로는 큐레이션 알고리즘으로 선택
  -- 여기서는 예시로 하드코딩
  
  INSERT INTO daily_challenge_artworks (
    date,
    artwork_id,
    museum_source,
    artwork_data,
    artwork_vector,
    theme,
    curator_note
  ) VALUES (
    CURRENT_DATE,
    'sample_artwork_id',
    'met',
    '{"title": "Sample Artwork", "artist": "Sample Artist"}'::jsonb,
    '{"era": "modern", "color": "warm", "subject": "portrait", "emotion": "calm"}'::jsonb,
    '평온 속의 열정',
    '오늘은 고요한 표면 아래 숨겨진 감정을 탐색해보세요.'
  )
  ON CONFLICT (date) DO NOTHING;
END;
$$ LANGUAGE plpgsql;