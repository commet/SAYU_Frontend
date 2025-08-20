-- artworks 테이블에 누락된 컬럼 추가
-- department와 metadata 컬럼 추가

DO $$ 
BEGIN
    -- department 컬럼 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'artworks' AND column_name = 'department'
    ) THEN
        ALTER TABLE artworks ADD COLUMN department VARCHAR(255);
        RAISE NOTICE '✅ department 컬럼 추가됨';
    ELSE
        RAISE NOTICE '✓ department 컬럼이 이미 존재합니다';
    END IF;

    -- metadata 컬럼 추가 (JSONB 타입)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'artworks' AND column_name = 'metadata'
    ) THEN
        ALTER TABLE artworks ADD COLUMN metadata JSONB;
        RAISE NOTICE '✅ metadata 컬럼 추가됨';
    ELSE
        RAISE NOTICE '✓ metadata 컬럼이 이미 존재합니다';
    END IF;
END $$;

-- metadata 컬럼에 대한 인덱스 추가 (JSON 검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_artworks_metadata ON artworks USING GIN (metadata);

-- 테이블 구조 확인
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'artworks' 
ORDER BY ordinal_position;

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '===== 컬럼 추가 완료 =====';
    RAISE NOTICE '✅ department, metadata 컬럼 확인 완료';
    RAISE NOTICE '✅ JSON 인덱스 생성 완료';
    RAISE NOTICE '';
    RAISE NOTICE '이제 갤러리 컬렉션 기능이 정상 작동할 것입니다!';
END $$;