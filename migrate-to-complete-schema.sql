-- 🔄 기존 exhibitions_clean 데이터를 새 스키마로 마이그레이션
-- 2025-08-31

-- ========================================
-- 1. 새 스키마 생성 (위 파일 먼저 실행)
-- ========================================
-- exhibitions-complete-schema.sql 먼저 실행하세요!

-- ========================================
-- 2. 기존 데이터 마이그레이션
-- ========================================

-- exhibitions_clean → exhibitions_ko 데이터 이전
INSERT INTO exhibitions_ko (
  exhibition_title,
  artists,
  start_date,
  end_date,
  status,
  venue_name,
  city,
  exhibition_type,
  genre,
  view_count,
  is_featured,
  priority_order,
  created_at,
  updated_at
)
SELECT 
  exhibition_title,
  artists,
  start_date,
  end_date,
  status,
  venue_name,
  city,
  exhibition_type,
  genre,
  view_count,
  is_featured,
  priority_order,
  created_at,
  updated_at
FROM exhibitions_clean;

-- ========================================
-- 3. 데이터 검증
-- ========================================
SELECT COUNT(*) as migrated_count FROM exhibitions_ko;
SELECT status, COUNT(*) as count FROM exhibitions_ko GROUP BY status;

-- ========================================
-- 4. 기존 테이블 백업 (선택사항)
-- ========================================
-- DROP TABLE exhibitions_clean; -- 주의: 확인 후 실행

-- ========================================
-- 5. 성공 메시지
-- ========================================
DO $$
DECLARE
  ko_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO ko_count FROM exhibitions_ko;
  RAISE NOTICE '✅ 마이그레이션 완료!';
  RAISE NOTICE '📊 마이그레이션된 전시 수: %', ko_count;
  RAISE NOTICE '🔧 다음 단계: frontend 코드에서 exhibitions_ko 테이블 사용';
END $$;