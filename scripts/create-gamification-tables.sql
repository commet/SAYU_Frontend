-- SAYU 게이미피케이션 시스템 테이블 스키마
-- 레벨, 포인트, 활동 추적을 위한 테이블 구조

-- 1. 사용자 게임 프로필 테이블
CREATE TABLE IF NOT EXISTS user_game_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  level INTEGER DEFAULT 1,
  current_exp INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 2. 포인트 트랜잭션 테이블 (모든 포인트 획득/사용 기록)
CREATE TABLE IF NOT EXISTS point_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL, -- signup, apt_test, like_artwork, save_artwork, etc.
  points INTEGER NOT NULL,
  description TEXT,
  metadata JSONB, -- 추가 데이터 (artwork_id, exhibition_id 등)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 일일 활동 제한 추적 테이블
CREATE TABLE IF NOT EXISTS daily_activity_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL, -- like_artwork, save_artwork, comment, share
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER DEFAULT 0,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, activity_type, activity_date)
);

-- 4. 레벨 정의 테이블 (레벨별 필요 경험치)
CREATE TABLE IF NOT EXISTS level_definitions (
  level INTEGER PRIMARY KEY,
  required_exp INTEGER NOT NULL,
  title_ko VARCHAR(100),
  title_en VARCHAR(100),
  perks JSONB -- 레벨별 특전
);

-- 5. 포인트 규칙 테이블 (포인트 획득 규칙 정의)
CREATE TABLE IF NOT EXISTS point_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action_type VARCHAR(50) UNIQUE NOT NULL,
  base_points INTEGER NOT NULL,
  daily_limit INTEGER, -- NULL이면 제한 없음
  is_repeatable BOOLEAN DEFAULT true,
  description_ko TEXT,
  description_en TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_point_transactions_user_id ON point_transactions(user_id);
CREATE INDEX idx_point_transactions_created_at ON point_transactions(created_at DESC);
CREATE INDEX idx_daily_activity_user_date ON daily_activity_limits(user_id, activity_date);

-- 레벨 정의 데이터 삽입
INSERT INTO level_definitions (level, required_exp, title_ko, title_en) VALUES
(1, 0, '예술 새싹', 'Art Seedling'),
(2, 1000, '예술 탐험가', 'Art Explorer'),
(3, 3000, '예술 애호가', 'Art Enthusiast'),
(4, 6000, '예술 수집가', 'Art Collector'),
(5, 10000, '예술 감정가', 'Art Connoisseur'),
(6, 15000, '예술 전문가', 'Art Expert'),
(7, 21000, '예술 큐레이터', 'Art Curator'),
(8, 28000, '예술 마스터', 'Art Master'),
(9, 36000, '예술 그랜드마스터', 'Art Grandmaster'),
(10, 45000, '예술 레전드', 'Art Legend')
ON CONFLICT (level) DO NOTHING;

-- 포인트 규칙 데이터 삽입
INSERT INTO point_rules (action_type, base_points, daily_limit, is_repeatable, description_ko, description_en) VALUES
-- 일회성 활동
('signup', 500, NULL, false, '회원가입', 'Sign up'),
('apt_test_complete', 300, NULL, false, 'APT 검사 완료', 'Complete APT test'),
('ai_profile_create', 200, NULL, false, 'AI 프로필 생성', 'Create AI profile'),
('profile_complete', 100, NULL, false, '프로필 완성', 'Complete profile'),

-- 일일 활동
('daily_login', 10, 1, true, '일일 로그인', 'Daily login'),
('like_artwork', 5, 10, true, '작품 좋아요', 'Like artwork'),
('save_artwork', 10, 5, true, '작품 저장', 'Save artwork'),
('post_comment', 10, 3, true, '댓글 작성', 'Post comment'),
('share_profile', 30, 1, true, '프로필 공유', 'Share profile'),

-- 전시 활동
('create_exhibition_record', 100, NULL, true, '전시 기록 작성', 'Create exhibition record'),
('write_detailed_review', 50, NULL, true, '상세 리뷰 작성', 'Write detailed review'),
('upload_exhibition_photo', 20, 5, true, '전시 사진 업로드', 'Upload exhibition photo'),
('rate_exhibition', 30, NULL, true, '전시 평가', 'Rate exhibition'),

-- 소셜 활동
('gain_follower', 20, NULL, true, '팔로워 획득', 'Gain follower'),
('follow_user', 10, NULL, true, '사용자 팔로우', 'Follow user'),
('invite_friend_success', 100, NULL, true, '친구 초대 성공', 'Successful friend invite')
ON CONFLICT (action_type) DO UPDATE
SET base_points = EXCLUDED.base_points,
    daily_limit = EXCLUDED.daily_limit;

-- 포인트 추가 함수
CREATE OR REPLACE FUNCTION add_points(
  p_user_id UUID,
  p_action_type VARCHAR(50),
  p_metadata JSONB DEFAULT NULL
) RETURNS TABLE(
  success BOOLEAN,
  points_added INTEGER,
  new_total_points INTEGER,
  new_level INTEGER,
  message TEXT
) AS $$
DECLARE
  v_rule RECORD;
  v_daily_count INTEGER;
  v_points_to_add INTEGER;
  v_current_profile RECORD;
  v_new_exp INTEGER;
  v_new_level INTEGER;
  v_new_total INTEGER;
BEGIN
  -- 포인트 규칙 조회
  SELECT * INTO v_rule FROM point_rules WHERE action_type = p_action_type;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0, 0, 0, 'Unknown action type'::TEXT;
    RETURN;
  END IF;
  
  -- 일일 제한 확인
  IF v_rule.daily_limit IS NOT NULL THEN
    SELECT count INTO v_daily_count 
    FROM daily_activity_limits 
    WHERE user_id = p_user_id 
      AND activity_type = p_action_type 
      AND activity_date = CURRENT_DATE;
    
    IF v_daily_count >= v_rule.daily_limit THEN
      RETURN QUERY SELECT false, 0, 0, 0, 'Daily limit reached'::TEXT;
      RETURN;
    END IF;
  END IF;
  
  -- 반복 불가능한 활동 확인
  IF NOT v_rule.is_repeatable THEN
    IF EXISTS (
      SELECT 1 FROM point_transactions 
      WHERE user_id = p_user_id AND action_type = p_action_type
    ) THEN
      RETURN QUERY SELECT false, 0, 0, 0, 'Action already completed'::TEXT;
      RETURN;
    END IF;
  END IF;
  
  v_points_to_add := v_rule.base_points;
  
  -- 현재 프로필 조회 또는 생성
  SELECT * INTO v_current_profile 
  FROM user_game_profiles 
  WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    INSERT INTO user_game_profiles (user_id, level, current_exp, total_points)
    VALUES (p_user_id, 1, 0, 0)
    RETURNING * INTO v_current_profile;
  END IF;
  
  -- 새로운 경험치와 레벨 계산
  v_new_exp := v_current_profile.current_exp + v_points_to_add;
  v_new_total := v_current_profile.total_points + v_points_to_add;
  v_new_level := v_current_profile.level;
  
  -- 레벨업 체크
  WHILE v_new_exp >= (v_new_level * 1000) LOOP
    v_new_exp := v_new_exp - (v_new_level * 1000);
    v_new_level := v_new_level + 1;
  END LOOP;
  
  -- 프로필 업데이트
  UPDATE user_game_profiles
  SET current_exp = v_new_exp,
      total_points = v_new_total,
      level = v_new_level,
      updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- 트랜잭션 기록
  INSERT INTO point_transactions (user_id, action_type, points, metadata)
  VALUES (p_user_id, p_action_type, v_points_to_add, p_metadata);
  
  -- 일일 활동 카운트 업데이트
  IF v_rule.daily_limit IS NOT NULL THEN
    INSERT INTO daily_activity_limits (user_id, activity_type, activity_date, count, points_earned)
    VALUES (p_user_id, p_action_type, CURRENT_DATE, 1, v_points_to_add)
    ON CONFLICT (user_id, activity_type, activity_date)
    DO UPDATE SET 
      count = daily_activity_limits.count + 1,
      points_earned = daily_activity_limits.points_earned + v_points_to_add;
  END IF;
  
  RETURN QUERY SELECT 
    true, 
    v_points_to_add, 
    v_new_total, 
    v_new_level,
    CASE 
      WHEN v_new_level > v_current_profile.level THEN 'Level up!'::TEXT
      ELSE 'Points added successfully'::TEXT
    END;
END;
$$ LANGUAGE plpgsql;

-- 사용자 게임 통계 조회 함수
CREATE OR REPLACE FUNCTION get_user_game_stats(p_user_id UUID)
RETURNS TABLE(
  level INTEGER,
  current_exp INTEGER,
  next_level_exp INTEGER,
  total_points INTEGER,
  level_title_ko VARCHAR(100),
  level_title_en VARCHAR(100),
  level_progress_percent NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ugp.level,
    ugp.current_exp,
    ugp.level * 1000 as next_level_exp,
    ugp.total_points,
    ld.title_ko,
    ld.title_en,
    ROUND((ugp.current_exp::NUMERIC / (ugp.level * 1000)) * 100, 2) as level_progress_percent
  FROM user_game_profiles ugp
  LEFT JOIN level_definitions ld ON ld.level = ugp.level
  WHERE ugp.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- RLS 정책 설정
ALTER TABLE user_game_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_activity_limits ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 데이터만 조회 가능
CREATE POLICY "Users can view own game profile" ON user_game_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own point transactions" ON point_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own daily limits" ON daily_activity_limits
  FOR SELECT USING (auth.uid() = user_id);

-- 서비스 역할은 모든 작업 가능
CREATE POLICY "Service role can manage game profiles" ON user_game_profiles
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role can manage point transactions" ON point_transactions
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role can manage daily limits" ON daily_activity_limits
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');