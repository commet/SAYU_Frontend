-- 작가 중요도 점수 시스템 추가
-- 미술사적 중요도와 대중적 인지도를 반영한 우선순위 시스템

-- 1. 중요도 관련 필드 추가
ALTER TABLE artists 
ADD COLUMN IF NOT EXISTS importance_score INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS importance_tier INTEGER DEFAULT 4,
ADD COLUMN IF NOT EXISTS updated_by_system BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS popularity_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS educational_value INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS market_influence INTEGER DEFAULT 0;

-- 2. 인덱스 추가 (빠른 조회를 위해)
CREATE INDEX IF NOT EXISTS idx_artists_importance 
ON artists(importance_score DESC, name);

CREATE INDEX IF NOT EXISTS idx_artists_tier 
ON artists(importance_tier, importance_score DESC);

-- 3. 중요도 설명 테이블
CREATE TABLE IF NOT EXISTS importance_tiers (
  tier INTEGER PRIMARY KEY,
  name VARCHAR(50),
  score_range VARCHAR(20),
  description TEXT
);

INSERT INTO importance_tiers (tier, name, score_range, description) VALUES
(1, '거장 (Masters)', '90-100', '미술사의 핵심 인물, 대중적 인지도 최상위'),
(2, '매우 중요 (Very Important)', '70-89', '미술사적으로 중요하고 영향력 있는 작가'),
(3, '중요 (Important)', '50-69', '특정 시대나 운동을 대표하는 작가'),
(4, '일반 (General)', '30-49', '전문가들에게 알려진 작가'),
(5, '기타 (Others)', '0-29', '지역적이거나 특수한 중요성을 가진 작가')
ON CONFLICT (tier) DO NOTHING;