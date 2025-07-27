-- external_data 컬럼 추가 (Wikipedia 등 외부 데이터 저장용)

-- artists 테이블에 external_data 컬럼 추가
ALTER TABLE artists 
ADD COLUMN IF NOT EXISTS external_data JSONB DEFAULT '{}';

-- 인덱스 추가 (JSON 데이터 검색 최적화)
CREATE INDEX IF NOT EXISTS idx_artists_external_data 
ON artists USING GIN (external_data);

-- 코멘트 추가
COMMENT ON COLUMN artists.external_data IS 'External data sources (Wikipedia, museum APIs, etc.)';

-- 기존 데이터 마이그레이션 (필요한 경우)
UPDATE artists 
SET external_data = '{}'::jsonb 
WHERE external_data IS NULL;