-- 🔍 SAYU Gallery 데이터베이스 현재 상태 확인
-- 이 쿼리들을 Supabase SQL Editor에서 하나씩 실행해주세요

-- ============================================
-- 1. artworks 테이블 구조 확인
-- ============================================
SELECT 
    column_name as "컬럼명",
    data_type as "데이터타입",
    is_nullable as "NULL허용",
    column_default as "기본값"
FROM information_schema.columns 
WHERE table_name = 'artworks'
ORDER BY ordinal_position;

-- ============================================
-- 2. external_id 컬럼이 이미 있는지 확인
-- ============================================
SELECT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'artworks' 
    AND column_name = 'external_id'
) as "external_id_exists";

-- ============================================
-- 3. 현재 저장된 artwork 데이터 샘플 확인
-- ============================================
SELECT 
    id,
    title,
    artist,
    created_at
FROM artworks
LIMIT 5;

-- ============================================
-- 4. artwork_interactions 테이블 구조 확인
-- ============================================
SELECT 
    column_name as "컬럼명",
    data_type as "데이터타입",
    is_nullable as "NULL허용"
FROM information_schema.columns 
WHERE table_name = 'artwork_interactions'
ORDER BY ordinal_position;

-- ============================================
-- 5. 외래키 관계 확인
-- ============================================
SELECT
    tc.constraint_name as "제약조건명",
    tc.table_name as "테이블",
    kcu.column_name as "컬럼",
    ccu.table_name AS "참조테이블",
    ccu.column_name AS "참조컬럼"
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND (tc.table_name = 'artwork_interactions' OR tc.table_name = 'artworks');

-- ============================================
-- 6. 현재 인덱스 확인
-- ============================================
SELECT 
    indexname as "인덱스명",
    indexdef as "정의"
FROM pg_indexes 
WHERE tablename IN ('artworks', 'artwork_interactions');

-- ============================================
-- 7. 데이터 통계
-- ============================================
SELECT 
    'artworks' as "테이블",
    COUNT(*) as "레코드수"
FROM artworks
UNION ALL
SELECT 
    'artwork_interactions',
    COUNT(*)
FROM artwork_interactions;

-- ============================================
-- 📌 결과를 복사해서 알려주세요!
-- ============================================