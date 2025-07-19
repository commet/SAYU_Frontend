-- Evolution System Tables Migration
-- 진화 시스템을 위한 데이터베이스 테이블 생성

-- 1. 진화 통계 테이블
CREATE TABLE IF NOT EXISTS evolution_statistics (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_evolution_points INTEGER DEFAULT 0,
  weekly_points INTEGER DEFAULT 0,
  monthly_points INTEGER DEFAULT 0,
  last_point_earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  week_start_date DATE DEFAULT CURRENT_DATE,
  month_start_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- 2. 사용자 뱃지 테이블
CREATE TABLE IF NOT EXISTS user_badges (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_icon VARCHAR(10) NOT NULL, -- 이모지 저장
  badge_type VARCHAR(50) NOT NULL, -- milestone, special, event 등
  badge_name VARCHAR(100),
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, badge_icon)
);

-- 3. 사용자 칭호 테이블
CREATE TABLE IF NOT EXISTS user_titles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  title_type VARCHAR(50) DEFAULT 'achievement', -- achievement, special, apt_specific
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT FALSE, -- 현재 표시 중인 칭호
  UNIQUE(user_id, title)
);

-- 4. 기능 언락 테이블
CREATE TABLE IF NOT EXISTS user_unlocks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  feature_key VARCHAR(100) NOT NULL, -- basic_frame, style_analyzer, expert_insights 등
  feature_type VARCHAR(50) DEFAULT 'evolution', -- evolution, purchase, special_event
  unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, feature_key)
);

-- 5. 진화 마일스톤 달성 기록
CREATE TABLE IF NOT EXISTS milestone_achievements (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  milestone_id VARCHAR(100) NOT NULL, -- first_step, hundred_artworks 등
  achieved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  points_earned INTEGER DEFAULT 0,
  celebration_shown BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, milestone_id)
);

-- 6. 일일 방문 기록 (연속 방문 추적용)
CREATE TABLE IF NOT EXISTS daily_visits (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  visit_date DATE NOT NULL,
  points_earned INTEGER DEFAULT 0,
  is_streak_day BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, visit_date)
);

-- 7. 사용자 행동 로그 (포인트 계산용)
CREATE TABLE IF NOT EXISTS user_action_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL, -- artwork_view, artwork_like, exhibition_visit 등
  action_target_id INTEGER, -- artwork_id, exhibition_id 등
  action_target_type VARCHAR(50), -- artwork, exhibition, user 등
  points_earned INTEGER DEFAULT 0,
  bonus_multiplier DECIMAL(3,2) DEFAULT 1.0,
  bonus_reason VARCHAR(100), -- style_expansion, new_artist, deep_engagement 등
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. 진화 이력 (단계 변화 추적)
CREATE TABLE IF NOT EXISTS evolution_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  from_stage INTEGER NOT NULL,
  to_stage INTEGER NOT NULL,
  evolved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total_points_at_evolution INTEGER,
  special_effect_played BOOLEAN DEFAULT FALSE
);

-- 9. 리더보드 캐시 (성능 최적화)
CREATE TABLE IF NOT EXISTS leaderboard_cache (
  id SERIAL PRIMARY KEY,
  period_type VARCHAR(20) NOT NULL, -- weekly, monthly
  apt_type VARCHAR(4), -- NULL이면 전체, 아니면 특정 APT
  rank INTEGER NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(period_type, apt_type, rank)
);

-- sayu_profiles 테이블에 진화 관련 컬럼 추가
ALTER TABLE sayu_profiles
ADD COLUMN IF NOT EXISTS evolution_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS evolution_stage INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS animal_accessories TEXT[], -- 액세서리 목록
ADD COLUMN IF NOT EXISTS animal_effects TEXT[], -- 효과 목록
ADD COLUMN IF NOT EXISTS last_evolution_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS taste_diversity DECIMAL(3,2) DEFAULT 0.5, -- 0-1 사이 값
ADD COLUMN IF NOT EXISTS consistency_score DECIMAL(3,2) DEFAULT 0.5; -- 0-1 사이 값

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_evolution_stats_user_id ON evolution_statistics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_titles_user_id_active ON user_titles(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_milestone_achievements_user_id ON milestone_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_visits_user_date ON daily_visits(user_id, visit_date);
CREATE INDEX IF NOT EXISTS idx_action_logs_user_created ON user_action_logs(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_leaderboard_cache_lookup ON leaderboard_cache(period_type, apt_type, rank);

-- 트리거: evolution_statistics 업데이트 시간 자동 갱신
CREATE OR REPLACE FUNCTION update_evolution_statistics_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_evolution_statistics_timestamp
BEFORE UPDATE ON evolution_statistics
FOR EACH ROW
EXECUTE FUNCTION update_evolution_statistics_timestamp();

-- 트리거: 주간/월간 포인트 자동 리셋
CREATE OR REPLACE FUNCTION reset_periodic_points()
RETURNS TRIGGER AS $$
BEGIN
  -- 주간 리셋 체크 (월요일 기준)
  IF NEW.week_start_date < date_trunc('week', CURRENT_DATE) THEN
    NEW.weekly_points = 0;
    NEW.week_start_date = date_trunc('week', CURRENT_DATE);
  END IF;
  
  -- 월간 리셋 체크
  IF NEW.month_start_date < date_trunc('month', CURRENT_DATE) THEN
    NEW.monthly_points = 0;
    NEW.month_start_date = date_trunc('month', CURRENT_DATE);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_periodic_reset
BEFORE UPDATE ON evolution_statistics
FOR EACH ROW
EXECUTE FUNCTION reset_periodic_points();

-- 뷰: 사용자 진화 현황 대시보드
CREATE OR REPLACE VIEW user_evolution_dashboard AS
SELECT 
  u.id as user_id,
  u.name,
  sp.type_code as apt_type,
  sp.evolution_stage,
  sp.evolution_points,
  es.weekly_points,
  es.monthly_points,
  COUNT(DISTINCT ub.badge_icon) as badge_count,
  COUNT(DISTINCT ut.title) as title_count,
  MAX(dv.visit_date) as last_visit,
  COUNT(DISTINCT dv.visit_date) as total_visit_days
FROM users u
LEFT JOIN sayu_profiles sp ON u.id = sp.user_id
LEFT JOIN evolution_statistics es ON u.id = es.user_id
LEFT JOIN user_badges ub ON u.id = ub.user_id
LEFT JOIN user_titles ut ON u.id = ut.user_id
LEFT JOIN daily_visits dv ON u.id = dv.user_id
GROUP BY u.id, u.name, sp.type_code, sp.evolution_stage, sp.evolution_points, es.weekly_points, es.monthly_points;

-- 샘플 데이터 (개발 환경용)
-- INSERT INTO evolution_statistics (user_id, total_evolution_points, weekly_points, monthly_points)
-- SELECT id, 0, 0, 0 FROM users WHERE NOT EXISTS (
--   SELECT 1 FROM evolution_statistics WHERE user_id = users.id
-- );