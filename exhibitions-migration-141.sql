-- 🔄 기존 141개 전시 데이터 마이그레이션
-- exhibitions_clean (기존 테이블) → exhibitions_master + translations (새 구조)
-- 생성일: 2025-08-31
-- 주의: exhibitions_clean 테이블이 이미 존재해야 함!

-- ========================================
-- 1. exhibitions_master 데이터 삽입
-- ========================================
INSERT INTO exhibitions_master (
  id,
  venue_id,
  start_date,
  end_date,
  status,
  exhibition_type,
  genre,
  view_count,
  is_featured,
  priority_order,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid() as id,
  v.id as venue_id,
  e.start_date,
  e.end_date,
  e.status,
  e.exhibition_type,
  e.genre,
  e.view_count,
  e.is_featured,
  e.priority_order,
  e.created_at,
  e.updated_at
FROM exhibitions_clean e
LEFT JOIN venues_simple v ON e.venue_name = v.name_ko;

-- ========================================
-- 2. exhibitions_translations 한글 데이터 삽입
-- ========================================
INSERT INTO exhibitions_translations (
  exhibition_id,
  language_code,
  exhibition_title,
  artists,
  venue_name,
  city,
  created_at,
  updated_at
)
SELECT 
  em.id,
  'ko' as language_code,
  e.exhibition_title,
  e.artists,
  e.venue_name,
  e.city,
  e.created_at,
  e.updated_at
FROM exhibitions_clean e
JOIN exhibitions_master em ON 
  em.start_date = e.start_date AND 
  em.end_date = e.end_date AND
  COALESCE(em.venue_id, gen_random_uuid()) = COALESCE((SELECT id FROM venues_simple WHERE name_ko = e.venue_name), gen_random_uuid());

-- ========================================
-- 3. 데이터 검증
-- ========================================
DO $$
DECLARE
  master_count INTEGER;
  translation_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO master_count FROM exhibitions_master;
  SELECT COUNT(*) INTO translation_count FROM exhibitions_translations WHERE language_code = 'ko';
  
  RAISE NOTICE '마이그레이션 완료!';
  RAISE NOTICE 'exhibitions_master: % 개', master_count;
  RAISE NOTICE 'exhibitions_translations (ko): % 개', translation_count;
  
  IF master_count = 141 AND translation_count = 141 THEN
    RAISE NOTICE '성공: 141개 전시 완벽 이전!';
  ELSE
    RAISE WARNING '확인 필요: 예상 141개, 실제 % 개', master_count;
  END IF;
END $$;

-- ========================================
-- 4. 샘플 데이터 확인
-- ========================================
SELECT 
  et.exhibition_title as "전시명",
  et.venue_name as "미술관",
  em.start_date || ' ~ ' || em.end_date as "기간",
  em.status as "상태"
FROM exhibitions_master em
JOIN exhibitions_translations et ON em.id = et.exhibition_id
WHERE et.language_code = 'ko'
ORDER BY em.priority_order
LIMIT 10;