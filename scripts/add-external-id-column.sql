-- SAYU Gallery Collection 최적화
-- Dual ID 시스템: UUID (내부 관계) + external_id (외부 시스템)
-- 백엔드 전문가 관점 최적 설계

-- 1. artworks 테이블 구조 최적화
ALTER TABLE artworks 
ADD COLUMN IF NOT EXISTS external_id VARCHAR(255) UNIQUE;

ALTER TABLE artworks
ADD COLUMN IF NOT EXISTS department VARCHAR(255);

ALTER TABLE artworks 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- 2. 고성능 인덱스 전략
-- Primary lookup index
CREATE UNIQUE INDEX IF NOT EXISTS idx_artworks_external_id 
ON artworks(external_id) 
WHERE external_id IS NOT NULL;

-- Composite index for sorted queries
CREATE INDEX IF NOT EXISTS idx_artworks_created_external 
ON artworks(created_at DESC, external_id);

-- Department filtering
CREATE INDEX IF NOT EXISTS idx_artworks_department 
ON artworks(department) 
WHERE department IS NOT NULL;

-- JSONB search optimization
CREATE INDEX IF NOT EXISTS idx_artworks_metadata 
ON artworks USING GIN (metadata);

-- 3. artwork_interactions 테이블 최적화
CREATE INDEX IF NOT EXISTS idx_interactions_user_artwork 
ON artwork_interactions(user_id, artwork_id, interaction_type);

CREATE INDEX IF NOT EXISTS idx_interactions_created 
ON artwork_interactions(created_at DESC);

-- 4. 통계용 Materialized View (선택적 - 대용량 데이터 시)
CREATE MATERIALIZED VIEW IF NOT EXISTS artwork_stats AS
SELECT 
    a.id,
    a.external_id,
    COUNT(DISTINCT ai.user_id) as unique_users,
    COUNT(CASE WHEN ai.interaction_type = 'like' THEN 1 END) as total_likes,
    COUNT(CASE WHEN ai.interaction_type = 'save' THEN 1 END) as total_saves,
    MAX(ai.created_at) as last_interaction
FROM artworks a
LEFT JOIN artwork_interactions ai ON a.id = ai.artwork_id
GROUP BY a.id, a.external_id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_artwork_stats_id ON artwork_stats(id);
CREATE INDEX IF NOT EXISTS idx_artwork_stats_external ON artwork_stats(external_id);

-- 5. Row Level Security (RLS) 정책
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE artwork_interactions ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 interactions만 조회/수정
CREATE POLICY IF NOT EXISTS "Users can manage own interactions" 
ON artwork_interactions FOR ALL 
USING (auth.uid() = user_id);

-- Artworks는 모두 조회 가능
CREATE POLICY IF NOT EXISTS "Artworks are public" 
ON artworks FOR SELECT 
USING (true);

-- 6. 기존 데이터 마이그레이션
UPDATE artworks 
SET external_id = id::text 
WHERE external_id IS NULL;

-- 7. 설명 추가
COMMENT ON COLUMN artworks.external_id IS '외부 시스템 ID (MET, Artvee, Cleveland Museum 등)';
COMMENT ON COLUMN artworks.id IS '내부 UUID - 데이터베이스 관계용';
COMMENT ON COLUMN artworks.metadata IS '작품 추가 정보 (artist, year, medium, dimensions 등)';
COMMENT ON INDEX idx_artworks_external_id IS '외부 ID 빠른 조회 - O(log n) 성능';