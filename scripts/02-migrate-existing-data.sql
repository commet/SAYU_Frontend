-- 🔄 Step 2: 기존 데이터 마이그레이션 (필요한 경우만)
-- 이 스크립트는 기존 artwork가 있을 때만 실행하세요

-- ============================================
-- 현재 상황 확인
-- ============================================
SELECT 
    '현재 상태' as "구분",
    COUNT(*) as "전체 artwork",
    COUNT(external_id) as "external_id 있음",
    COUNT(*) - COUNT(external_id) as "external_id 없음"
FROM artworks;

-- ============================================
-- 마이그레이션 전략 선택
-- ============================================
-- 옵션 1: UUID를 그대로 external_id로 사용 (가장 안전)
-- 옵션 2: 특정 패턴이 있다면 그에 맞게 변환
-- 옵션 3: 수동으로 매핑

-- ============================================
-- 🔍 먼저 데이터 패턴 분석
-- ============================================
SELECT 
    id,
    title,
    artist,
    museum,
    image_url,
    created_at
FROM artworks
WHERE external_id IS NULL
LIMIT 10;

-- ============================================
-- 💡 옵션 1: UUID를 external_id로 복사 (가장 안전)
-- ============================================
-- 주의: 이 작업은 되돌릴 수 있습니다
BEGIN; -- 트랜잭션 시작

-- 백업용 임시 테이블 생성
CREATE TEMP TABLE artworks_backup AS
SELECT id, external_id
FROM artworks
WHERE external_id IS NULL;

-- 마이그레이션 실행
UPDATE artworks
SET external_id = id::text
WHERE external_id IS NULL;

-- 결과 확인
SELECT 
    '마이그레이션 결과' as "상태",
    COUNT(*) as "업데이트된 레코드"
FROM artworks
WHERE external_id = id::text;

-- 문제가 없다면 COMMIT, 문제가 있다면 ROLLBACK
-- COMMIT; -- 확정하려면 주석 해제
-- ROLLBACK; -- 취소하려면 주석 해제

-- ============================================
-- 💡 옵션 2: image_url 기반 external_id 생성 (특정 패턴이 있을 때)
-- ============================================
-- 예: image_url이 'https://met.museum/api/collection/436533.jpg' 형태라면

/*
BEGIN;

UPDATE artworks
SET external_id = 
    CASE 
        WHEN image_url LIKE '%met.museum%' THEN 
            'met-' || regexp_replace(image_url, '.*collection/(\d+)\..*', '\1')
        WHEN image_url LIKE '%artvee.com%' THEN
            regexp_replace(image_url, '.*/([^/]+)\.(jpg|png)$', '\1')
        ELSE 
            id::text -- 패턴이 없으면 UUID 사용
    END
WHERE external_id IS NULL;

-- 결과 확인
SELECT 
    external_id,
    image_url,
    COUNT(*)
FROM artworks
GROUP BY external_id, image_url
LIMIT 10;

-- COMMIT 또는 ROLLBACK
*/

-- ============================================
-- 💡 옵션 3: 수동 매핑 (특정 작품만)
-- ============================================
/*
UPDATE artworks
SET external_id = 'peasant-woman'
WHERE title = 'Peasant Woman' 
  AND artist = 'Vincent van Gogh'
  AND external_id IS NULL;

UPDATE artworks
SET external_id = 'starry-night'  
WHERE title = 'The Starry Night'
  AND artist = 'Vincent van Gogh'
  AND external_id IS NULL;
*/

-- ============================================
-- 최종 검증
-- ============================================
-- 1. 중복 확인
SELECT 
    external_id,
    COUNT(*) as count
FROM artworks
WHERE external_id IS NOT NULL
GROUP BY external_id
HAVING COUNT(*) > 1;

-- 2. NULL 체크
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ 모든 artwork에 external_id 있음'
        ELSE '⚠️ ' || COUNT(*) || '개의 artwork에 external_id 없음'
    END as "상태"
FROM artworks
WHERE external_id IS NULL;

-- 3. 데이터 품질 확인
SELECT 
    'external_id 품질' as "체크항목",
    COUNT(DISTINCT external_id) as "고유값 수",
    COUNT(*) as "전체 레코드",
    CASE 
        WHEN COUNT(DISTINCT external_id) = COUNT(*) THEN '✅ 모두 고유함'
        ELSE '⚠️ 중복 있음'
    END as "결과"
FROM artworks
WHERE external_id IS NOT NULL;