-- 매칭 지원 테이블들 (기존 create_matching_tables.sql에 추가)

-- 매칭 거절 로그 테이블
CREATE TABLE IF NOT EXISTS matching_rejections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_request_id UUID NOT NULL REFERENCES exhibition_matches(id),
  candidate_user_id UUID NOT NULL REFERENCES users(id),
  rejecting_user_id UUID NOT NULL REFERENCES users(id),
  reason VARCHAR(50) DEFAULT 'user_rejection',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 매칭 성공 로그 테이블
CREATE TABLE IF NOT EXISTS matching_success_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_user_id UUID NOT NULL REFERENCES users(id),
  matched_user_id UUID NOT NULL REFERENCES users(id),
  match_request_id UUID NOT NULL REFERENCES exhibition_matches(id),
  success_factors JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 매칭 피드백 테이블
CREATE TABLE IF NOT EXISTS match_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES exhibition_matches(id),
  reviewer_user_id UUID NOT NULL REFERENCES users(id),
  target_user_id UUID NOT NULL REFERENCES users(id),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  feedback_text TEXT,
  tags JSONB DEFAULT '[]',
  is_anonymous BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 알림 이력 테이블
CREATE TABLE IF NOT EXISTS notification_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  type VARCHAR(50) NOT NULL,
  title TEXT,
  body TEXT,
  data JSONB DEFAULT '{}',
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 사용자 상호작용 테이블 (관심사 분석용)
CREATE TABLE IF NOT EXISTS user_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  target_id VARCHAR(255) NOT NULL, -- artwork_id, exhibition_id 등
  target_type VARCHAR(50) NOT NULL, -- 'artwork', 'exhibition', 'user' 등
  interaction_type VARCHAR(50) NOT NULL, -- 'like', 'comment', 'share', 'view' 등
  metadata JSONB DEFAULT '{}',
  artwork_category VARCHAR(100), -- 작품 카테고리 (관심사 분석용)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 사용자 FCM 토큰 테이블 (푸시 알림용)
CREATE TABLE IF NOT EXISTS user_fcm_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  token TEXT NOT NULL UNIQUE,
  device_type VARCHAR(20) CHECK (device_type IN ('ios', 'android', 'web')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 위치 기반 검색을 위한 확장
DO $$ 
BEGIN
  -- PostGIS 확장이 있는지 확인하고 활성화
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'postgis') THEN
    CREATE EXTENSION IF NOT EXISTS postgis;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- PostGIS가 없어도 계속 진행
    RAISE NOTICE 'PostGIS 확장을 사용할 수 없습니다. 기본 위치 계산을 사용합니다.';
END $$;

-- 사용자 테이블에 위치 정보 추가 (없는 경우)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8),
ADD COLUMN IF NOT EXISTS location_updated_at TIMESTAMP;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_matching_rejections_request ON matching_rejections(match_request_id);
CREATE INDEX IF NOT EXISTS idx_matching_rejections_candidate ON matching_rejections(candidate_user_id);

CREATE INDEX IF NOT EXISTS idx_matching_success_host ON matching_success_logs(host_user_id);
CREATE INDEX IF NOT EXISTS idx_matching_success_matched ON matching_success_logs(matched_user_id);

CREATE INDEX IF NOT EXISTS idx_match_feedback_target ON match_feedback(target_user_id);
CREATE INDEX IF NOT EXISTS idx_match_feedback_rating ON match_feedback(rating);

CREATE INDEX IF NOT EXISTS idx_notification_history_user ON notification_history(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_history_read ON notification_history(read_at);
CREATE INDEX IF NOT EXISTS idx_notification_history_type ON notification_history(type);

CREATE INDEX IF NOT EXISTS idx_user_interactions_user ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_target ON user_interactions(target_id, target_type);
CREATE INDEX IF NOT EXISTS idx_user_interactions_type ON user_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_user_interactions_category ON user_interactions(artwork_category);

CREATE INDEX IF NOT EXISTS idx_user_fcm_tokens_user ON user_fcm_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_user_fcm_tokens_active ON user_fcm_tokens(is_active);

-- 사용자 위치 인덱스 (위치 기반 검색용)
CREATE INDEX IF NOT EXISTS idx_users_location ON users(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- 전시 매칭에 만료된 요청 자동 정리를 위한 부분 인덱스
CREATE INDEX IF NOT EXISTS idx_exhibition_matches_expired ON exhibition_matches(expires_at, status) WHERE status = 'open';

-- 매칭 성능 최적화를 위한 복합 인덱스
CREATE INDEX IF NOT EXISTS idx_exhibition_matches_active_lookup ON exhibition_matches(exhibition_id, status, preferred_date) WHERE status = 'open';

-- 사용자 프로필에 필요한 컬럼 추가
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS matching_preferences JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS privacy_settings JSONB DEFAULT '{}';

-- 전시 매칭 요청에 추가 메타데이터
ALTER TABLE exhibition_matches
ADD COLUMN IF NOT EXISTS request_metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS match_quality_score INTEGER CHECK (match_quality_score BETWEEN 0 AND 100);

-- 매칭 통계를 위한 뷰
CREATE OR REPLACE VIEW matching_statistics AS
SELECT 
  DATE_TRUNC('day', em.created_at) as match_date,
  COUNT(*) as total_requests,
  COUNT(CASE WHEN em.status = 'matched' THEN 1 END) as successful_matches,
  COUNT(CASE WHEN em.status = 'completed' THEN 1 END) as completed_matches,
  COUNT(CASE WHEN em.status = 'cancelled' THEN 1 END) as cancelled_matches,
  AVG(CASE WHEN em.matched_at IS NOT NULL THEN 
    EXTRACT(EPOCH FROM (em.matched_at - em.created_at))/3600 
  END) as avg_match_time_hours
FROM exhibition_matches em
WHERE em.created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', em.created_at)
ORDER BY match_date DESC;

-- APT 타입별 매칭 성공률 뷰
CREATE OR REPLACE VIEW apt_matching_success_rates AS
SELECT 
  up.type_code,
  COUNT(em.*) as total_requests,
  COUNT(CASE WHEN em.status IN ('matched', 'completed') THEN 1 END) as successful_matches,
  ROUND(
    COUNT(CASE WHEN em.status IN ('matched', 'completed') THEN 1 END) * 100.0 / 
    NULLIF(COUNT(em.*), 0), 2
  ) as success_rate_percent,
  AVG(em.match_quality_score) as avg_match_quality
FROM exhibition_matches em
JOIN users u ON em.host_user_id = u.id
JOIN user_profiles up ON u.id = up.user_id
WHERE em.created_at >= NOW() - INTERVAL '90 days'
AND up.type_code IS NOT NULL
GROUP BY up.type_code
ORDER BY success_rate_percent DESC;

-- 매칭 품질 개선을 위한 트리거
CREATE OR REPLACE FUNCTION update_match_quality_score()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'matched' AND OLD.status = 'open' THEN
    -- 매칭 성공 시 품질 점수 계산 (간단한 예시)
    NEW.match_quality_score = LEAST(100, 
      50 + -- 기본 점수
      (CASE WHEN EXTRACT(EPOCH FROM (NEW.matched_at - NEW.created_at)) < 3600 THEN 20 ELSE 0 END) + -- 빠른 매칭 보너스
      (CASE WHEN NEW.request_metadata ? 'preferred_apt_types' THEN 15 ELSE 0 END) + -- 선호도 설정 보너스
      (RANDOM() * 15)::INTEGER -- 기타 요인들 (실제로는 더 정교한 계산)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER match_quality_trigger
  BEFORE UPDATE ON exhibition_matches
  FOR EACH ROW
  EXECUTE FUNCTION update_match_quality_score();

-- 만료된 매칭 요청 자동 정리 함수
CREATE OR REPLACE FUNCTION cleanup_expired_matches()
RETURNS INTEGER AS $$
DECLARE
  cleaned_count INTEGER;
BEGIN
  UPDATE exhibition_matches 
  SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
  WHERE status = 'open' 
  AND expires_at < CURRENT_TIMESTAMP;
  
  GET DIAGNOSTICS cleaned_count = ROW_COUNT;
  
  -- 로그 기록
  INSERT INTO system_logs (operation, details, created_at)
  VALUES ('cleanup_expired_matches', 
          jsonb_build_object('cleaned_count', cleaned_count),
          CURRENT_TIMESTAMP);
  
  RETURN cleaned_count;
END;
$$ LANGUAGE plpgsql;

-- 시스템 로그 테이블 (필요한 경우)
CREATE TABLE IF NOT EXISTS system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operation VARCHAR(100) NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 매칭 성능 모니터링을 위한 함수
CREATE OR REPLACE FUNCTION get_matching_performance_metrics(days_back INTEGER DEFAULT 7)
RETURNS TABLE (
  metric_name TEXT,
  metric_value NUMERIC,
  metric_unit TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'total_requests'::TEXT,
    COUNT(*)::NUMERIC,
    'count'::TEXT
  FROM exhibition_matches 
  WHERE created_at >= NOW() - (days_back || ' days')::INTERVAL
  
  UNION ALL
  
  SELECT 
    'success_rate'::TEXT,
    ROUND(
      COUNT(CASE WHEN status IN ('matched', 'completed') THEN 1 END) * 100.0 / 
      NULLIF(COUNT(*), 0), 2
    ),
    'percent'::TEXT
  FROM exhibition_matches 
  WHERE created_at >= NOW() - (days_back || ' days')::INTERVAL
  
  UNION ALL
  
  SELECT 
    'avg_match_time'::TEXT,
    ROUND(
      AVG(EXTRACT(EPOCH FROM (matched_at - created_at))/3600)::NUMERIC, 2
    ),
    'hours'::TEXT
  FROM exhibition_matches 
  WHERE matched_at IS NOT NULL 
  AND created_at >= NOW() - (days_back || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE matching_rejections IS '매칭 거절 로그 - 사용자 선호도 학습용';
COMMENT ON TABLE matching_success_logs IS '매칭 성공 로그 - 성공 요인 분석용';  
COMMENT ON TABLE match_feedback IS '매칭 후 상호 평가 - 매칭 품질 개선용';
COMMENT ON TABLE notification_history IS '알림 이력 - 사용자 알림 관리용';
COMMENT ON TABLE user_interactions IS '사용자 상호작용 - 관심사 분석 및 추천 개선용';
COMMENT ON TABLE user_fcm_tokens IS 'FCM 토큰 관리 - 푸시 알림용';

COMMENT ON FUNCTION cleanup_expired_matches() IS '만료된 매칭 요청 자동 정리 - 크론 잡에서 호출';
COMMENT ON FUNCTION get_matching_performance_metrics(INTEGER) IS '매칭 시스템 성능 지표 조회';