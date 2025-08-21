-- SAYU Gallery Artwork Schema Optimization
-- 백엔드 전문가 관점에서 설계한 최적화된 스키마

-- 1. artworks 테이블 최적화
ALTER TABLE artworks 
ADD COLUMN IF NOT EXISTS external_id VARCHAR(255) UNIQUE;

ALTER TABLE artworks
ADD COLUMN IF NOT EXISTS department VARCHAR(255);

ALTER TABLE artworks
ADD COLUMN IF NOT EXISTS source_type VARCHAR(50); -- 'met', 'artvee', 'cleveland', etc.

ALTER TABLE artworks
ADD COLUMN IF NOT EXISTS source_url TEXT; -- 원본 미술관 URL

ALTER TABLE artworks
ADD COLUMN IF NOT EXISTS metadata JSONB; -- 유연한 추가 데이터 저장

-- 2. 인덱스 최적화 (조회 성능 극대화)
CREATE UNIQUE INDEX IF NOT EXISTS idx_artworks_external_id 
ON artworks(external_id) 
WHERE external_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_artworks_source_type 
ON artworks(source_type);

CREATE INDEX IF NOT EXISTS idx_artworks_artist 
ON artworks(artist);

CREATE INDEX IF NOT EXISTS idx_artworks_created_at 
ON artworks(created_at DESC);

-- GIN 인덱스 for JSONB 검색
CREATE INDEX IF NOT EXISTS idx_artworks_metadata 
ON artworks USING gin(metadata);

-- 텍스트 검색을 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_artworks_title_trgm 
ON artworks USING gin(title gin_trgm_ops);

-- 3. artwork_interactions 테이블 최적화
CREATE INDEX IF NOT EXISTS idx_interactions_user_artwork 
ON artwork_interactions(user_id, artwork_id, interaction_type);

CREATE INDEX IF NOT EXISTS idx_interactions_created_desc 
ON artwork_interactions(created_at DESC);

-- 4. 통계 뷰 생성 (자주 사용되는 쿼리 최적화)
CREATE OR REPLACE VIEW artwork_save_counts AS
SELECT 
    a.id,
    a.external_id,
    a.title,
    a.artist,
    COUNT(DISTINCT ai.user_id) as save_count,
    MAX(ai.created_at) as last_saved_at
FROM artworks a
LEFT JOIN artwork_interactions ai ON a.id = ai.artwork_id AND ai.interaction_type = 'save'
GROUP BY a.id, a.external_id, a.title, a.artist;

-- 5. 사용자별 저장 작품 뷰 (빠른 조회)
CREATE OR REPLACE VIEW user_saved_artworks AS
SELECT 
    ai.user_id,
    a.external_id,
    a.title,
    a.artist,
    a.year_created,
    a.image_url,
    a.medium,
    a.museum,
    a.department,
    ai.created_at as saved_at
FROM artwork_interactions ai
JOIN artworks a ON ai.artwork_id = a.id
WHERE ai.interaction_type = 'save'
ORDER BY ai.created_at DESC;

-- 6. 데이터 일관성을 위한 제약조건
ALTER TABLE artworks
ADD CONSTRAINT check_external_id_format 
CHECK (external_id ~ '^[a-z0-9-]+$');

-- 7. 트리거로 updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_artworks_updated_at 
BEFORE UPDATE ON artworks 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- 8. 성능 모니터링을 위한 통계 테이블
CREATE TABLE IF NOT EXISTS artwork_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artwork_id UUID REFERENCES artworks(id) ON DELETE CASCADE,
    stat_date DATE NOT NULL,
    view_count INTEGER DEFAULT 0,
    save_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    UNIQUE(artwork_id, stat_date)
);

CREATE INDEX idx_artwork_stats_date ON artwork_stats(stat_date DESC);

-- 9. 캐시 무효화를 위한 이벤트 테이블
CREATE TABLE IF NOT EXISTS cache_invalidation_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(255) NOT NULL,
    action VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_cache_events_created ON cache_invalidation_events(created_at DESC);

-- 10. 함수: external_id로 artwork 조회 (성능 최적화)
CREATE OR REPLACE FUNCTION get_artwork_by_external_id(p_external_id VARCHAR)
RETURNS artworks AS $$
DECLARE
    v_artwork artworks;
BEGIN
    SELECT * INTO v_artwork
    FROM artworks
    WHERE external_id = p_external_id;
    
    RETURN v_artwork;
END;
$$ LANGUAGE plpgsql STABLE;

-- 11. 함수: 작품 저장 또는 업데이트 (UPSERT)
CREATE OR REPLACE FUNCTION upsert_artwork(
    p_external_id VARCHAR,
    p_title VARCHAR,
    p_artist VARCHAR,
    p_year VARCHAR,
    p_image_url TEXT,
    p_medium VARCHAR,
    p_museum VARCHAR,
    p_department VARCHAR,
    p_source_type VARCHAR,
    p_metadata JSONB
)
RETURNS UUID AS $$
DECLARE
    v_artwork_id UUID;
BEGIN
    INSERT INTO artworks (
        external_id, title, artist, year_created, 
        image_url, medium, museum, department, 
        source_type, metadata
    ) VALUES (
        p_external_id, p_title, p_artist, p_year,
        p_image_url, p_medium, p_museum, p_department,
        p_source_type, p_metadata
    )
    ON CONFLICT (external_id) 
    DO UPDATE SET
        title = EXCLUDED.title,
        artist = EXCLUDED.artist,
        year_created = EXCLUDED.year_created,
        image_url = EXCLUDED.image_url,
        medium = EXCLUDED.medium,
        museum = EXCLUDED.museum,
        department = EXCLUDED.department,
        source_type = EXCLUDED.source_type,
        metadata = EXCLUDED.metadata,
        updated_at = NOW()
    RETURNING id INTO v_artwork_id;
    
    RETURN v_artwork_id;
END;
$$ LANGUAGE plpgsql;

-- Enable trigram extension for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

COMMENT ON TABLE artworks IS 'Core artwork data with dual ID system for flexibility';
COMMENT ON COLUMN artworks.id IS 'Internal UUID for database relationships';
COMMENT ON COLUMN artworks.external_id IS 'External ID from source (museum API, custom ID)';
COMMENT ON COLUMN artworks.metadata IS 'Flexible JSONB field for source-specific data';