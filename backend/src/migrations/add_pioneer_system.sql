-- Pioneer 번호 시스템 마이그레이션
-- 사용자 가입 순서별 특별 번호 부여

-- users 테이블에 pioneer_number 컬럼 추가
ALTER TABLE users 
ADD COLUMN pioneer_number INTEGER UNIQUE;

-- 기존 사용자들에게 가입 순서대로 번호 부여
WITH numbered_users AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) as rn
  FROM users
  WHERE pioneer_number IS NULL
)
UPDATE users 
SET pioneer_number = numbered_users.rn
FROM numbered_users 
WHERE users.id = numbered_users.id;

-- 새 사용자 가입 시 자동으로 다음 번호 부여하는 함수
CREATE OR REPLACE FUNCTION assign_pioneer_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.pioneer_number IS NULL THEN
    SELECT COALESCE(MAX(pioneer_number), 0) + 1 
    INTO NEW.pioneer_number 
    FROM users;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
DROP TRIGGER IF EXISTS assign_pioneer_number_trigger ON users;
CREATE TRIGGER assign_pioneer_number_trigger
  BEFORE INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION assign_pioneer_number();

-- 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_users_pioneer_number 
ON users(pioneer_number);

-- 7일 여정 시스템을 위한 테이블
CREATE TABLE IF NOT EXISTS journey_nudges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL CHECK (day_number >= 1 AND day_number <= 7),
  nudge_type VARCHAR(50) NOT NULL, -- 'welcome', 'art_discovery', 'community', etc.
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  cta_text VARCHAR(100),
  cta_link VARCHAR(500),
  sent_at TIMESTAMP WITH TIME ZONE,
  viewed_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, day_number)
);

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_journey_nudges_user_day 
ON journey_nudges(user_id, day_number);

CREATE INDEX IF NOT EXISTS idx_journey_nudges_sent_at 
ON journey_nudges(sent_at) WHERE sent_at IS NOT NULL;

-- 7일 여정 템플릿 테이블
CREATE TABLE IF NOT EXISTS journey_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_number INTEGER NOT NULL CHECK (day_number >= 1 AND day_number <= 7),
  nudge_type VARCHAR(50) NOT NULL,
  title_ko VARCHAR(200) NOT NULL,
  title_en VARCHAR(200) NOT NULL,
  message_ko TEXT NOT NULL,
  message_en TEXT NOT NULL,
  cta_text_ko VARCHAR(100),
  cta_text_en VARCHAR(100),
  cta_link VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7일 여정 기본 템플릿 데이터
INSERT INTO journey_templates (day_number, nudge_type, title_ko, title_en, message_ko, message_en, cta_text_ko, cta_text_en, cta_link) VALUES
(1, 'welcome', '환영합니다, Pioneer!', 'Welcome, Pioneer!', '축하합니다! SAYU의 새로운 Pioneer가 되어주셔서 감사합니다. 당신의 예술 여정이 시작되었습니다.', 'Congratulations! Thank you for becoming a new SAYU Pioneer. Your art journey has begun.', '프로필 확인하기', 'View Profile', '/profile'),

(2, 'first_art', '첫 작품 감상', 'First Artwork', '어제 발견한 당신의 성향을 바탕으로 특별한 작품을 준비했어요. 오늘의 작품을 감상해보세요.', 'Based on your personality discovered yesterday, we''ve prepared special artworks for you. Explore today''s selection.', '작품 보러가기', 'View Artworks', '/gallery'),

(3, 'community', '다른 Pioneer들', 'Other Pioneers', '비슷한 취향을 가진 Pioneer들을 발견했어요! 다른 분들은 어떤 작품을 좋아할까요?', 'We found Pioneers with similar tastes! What artworks do others enjoy?', '커뮤니티 둘러보기', 'Explore Community', '/community'),

(4, 'deep_dive', '깊이 있는 감상', 'Deep Appreciation', '오늘은 작품을 좀 더 깊이 감상해보는 건 어떨까요? 당신만의 해석을 남겨보세요.', 'How about appreciating artworks more deeply today? Share your unique interpretation.', '감상 남기기', 'Share Thoughts', '/gallery'),

(5, 'discovery', '새로운 발견', 'New Discovery', '5일째네요! 당신의 취향이 조금씩 변화하고 있는 것 같아요. 새로운 스타일도 탐험해보세요.', 'Day 5! Your taste seems to be evolving. Explore some new styles.', '새 작품 탐험', 'Explore New Art', '/discover'),

(6, 'reflection', '일주일의 기록', 'Week Reflection', '벌써 6일이 지났네요. 이번 주 가장 인상 깊었던 작품은 무엇인가요?', 'Six days have passed already. What was the most impressive artwork this week?', '주간 기록 보기', 'View Weekly Log', '/insights'),

(7, 'celebration', '첫 주 완성!', 'First Week Complete!', '축하합니다! SAYU와 함께한 첫 일주일을 완성하셨네요. 이제 본격적인 예술 여정의 시작입니다.', 'Congratulations! You''ve completed your first week with SAYU. Now begins your true art journey.', '다음 단계 보기', 'Next Steps', '/journey');

-- 통계를 위한 뷰 생성
CREATE OR REPLACE VIEW pioneer_stats AS
SELECT 
  COUNT(*) as total_pioneers,
  MAX(pioneer_number) as latest_pioneer_number,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') as new_today,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as new_this_week
FROM users 
WHERE pioneer_number IS NOT NULL;