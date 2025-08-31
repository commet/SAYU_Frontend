-- 🎨 새로운 전시 데이터를 기존 exhibitions_ko/exhibitions_en 테이블로 복사
-- 실행일: 2025-08-31
-- exhibitions_master/exhibitions_translations → exhibitions_ko/exhibitions_en

-- ========================================
-- 1. 한글 전시 데이터 복사 (exhibitions_master + translations ko → exhibitions_ko)
-- ========================================
INSERT INTO exhibitions_ko (
  exhibition_title,
  artists,
  description,
  start_date,
  end_date,
  status,
  operating_hours,
  ticket_price,
  phone_number,
  website_url,
  source_url,
  venue_name,
  venue_id,
  city,
  address,
  exhibition_type,
  genre,
  view_count,
  is_featured,
  priority_order
)
SELECT 
  et.exhibition_title,
  et.artists,
  et.description,
  em.start_date,
  em.end_date,
  em.status,
  et.operating_hours,
  CASE 
    WHEN em.ticket_price_adult = 0 THEN '무료'
    WHEN em.ticket_price_adult > 0 AND em.ticket_price_student > 0 THEN 
      CONCAT('성인 ', em.ticket_price_adult, '원, 학생 ', em.ticket_price_student, '원')
    ELSE CONCAT('성인 ', em.ticket_price_adult, '원')
  END as ticket_price,
  et.phone_number,
  et.website_url,
  em.source_url,
  et.venue_name,
  em.venue_id,
  et.city,
  et.address,
  em.exhibition_type,
  em.genre,
  em.view_count,
  em.is_featured,
  em.priority_order
FROM exhibitions_master em
JOIN exhibitions_translations et ON em.id = et.exhibition_id
WHERE et.language_code = 'ko'
  AND NOT EXISTS (
    SELECT 1 FROM exhibitions_ko ek 
    WHERE ek.exhibition_title = et.exhibition_title 
      AND ek.venue_name = et.venue_name 
      AND ek.start_date = em.start_date
  );

-- ========================================
-- 2. 영문 전시 데이터 복사 (exhibitions_master + translations en → exhibitions_en)
-- ========================================
INSERT INTO exhibitions_en (
  exhibition_ko_id,
  exhibition_title,
  artists,
  description,
  start_date,
  end_date,
  status,
  operating_hours,
  ticket_price,
  phone_number,
  website_url,
  source_url,
  venue_name,
  venue_id,
  city,
  address,
  exhibition_type,
  genre,
  view_count,
  is_featured,
  priority_order
)
SELECT 
  ek.id as exhibition_ko_id,
  et_en.exhibition_title,
  et_en.artists,
  et_en.description,
  em.start_date,
  em.end_date,
  em.status,
  et_en.operating_hours,
  CASE 
    WHEN em.ticket_price_adult = 0 THEN 'Free'
    WHEN em.ticket_price_adult > 0 AND em.ticket_price_student > 0 THEN 
      CONCAT('Adults ', em.ticket_price_adult, ' KRW, Students ', em.ticket_price_student, ' KRW')
    ELSE CONCAT('Adults ', em.ticket_price_adult, ' KRW')
  END as ticket_price,
  et_en.phone_number,
  et_en.website_url,
  em.source_url,
  et_en.venue_name,
  em.venue_id,
  et_en.city,
  et_en.address,
  em.exhibition_type,
  em.genre,
  em.view_count,
  em.is_featured,
  em.priority_order
FROM exhibitions_master em
JOIN exhibitions_translations et_ko ON em.id = et_ko.exhibition_id AND et_ko.language_code = 'ko'
JOIN exhibitions_translations et_en ON em.id = et_en.exhibition_id AND et_en.language_code = 'en'
JOIN exhibitions_ko ek ON ek.exhibition_title = et_ko.exhibition_title 
  AND ek.venue_name = et_ko.venue_name 
  AND ek.start_date = em.start_date
WHERE NOT EXISTS (
  SELECT 1 FROM exhibitions_en ee 
  WHERE ee.exhibition_title = et_en.exhibition_title 
    AND ee.venue_name = et_en.venue_name 
    AND ee.start_date = em.start_date
);

-- ========================================
-- 3. venues 테이블에 새로운 미술관/갤러리 추가
-- ========================================
INSERT INTO venues (
  name_ko,
  name_en,
  type,
  city,
  district,
  address_ko,
  address_en,
  phone_number,
  website_url,
  is_major,
  priority_order
)
SELECT DISTINCT
  vs.name_ko,
  vs.name_en,
  CASE 
    WHEN vs.venue_type = 'auction' THEN 'auction_house'
    WHEN vs.venue_type = 'alternative' THEN 'alternative_space'
    ELSE vs.venue_type
  END as type,
  vs.city,
  vs.district,
  NULL as address_ko, -- venues_simple에는 address 필드가 없음
  NULL as address_en,
  NULL as phone_number, -- venues_simple에는 phone 필드가 없음
  vs.website,
  vs.is_major,
  vs.priority_order
FROM venues_simple vs
WHERE NOT EXISTS (
  SELECT 1 FROM venues v 
  WHERE v.name_ko = vs.name_ko
)
-- 새로 추가된 미술관/갤러리만 선택 (기존에 없는 것들)
AND vs.name_ko IN (
  '더 월로', '아뜰리에 아키', '바라캇 컨템포러리', '서울시립 미술아카이브',
  '상히읗', '세화미술관', '화이트스톤갤러리', '글래드스톤갤러리',
  '재단법인 아름지기', '대림미술관'
);

-- ========================================
-- 4. 결과 확인
-- ========================================
-- 한글 전시 개수 확인
SELECT 
  '한글 전시 (exhibitions_ko)' as table_name,
  COUNT(*) as total_count,
  COUNT(CASE WHEN created_at >= CURRENT_DATE THEN 1 END) as today_added
FROM exhibitions_ko;

-- 영문 전시 개수 확인  
SELECT 
  '영문 전시 (exhibitions_en)' as table_name,
  COUNT(*) as total_count,
  COUNT(CASE WHEN created_at >= CURRENT_DATE THEN 1 END) as today_added
FROM exhibitions_en;

-- 국립현대미술관 전시 확인
SELECT 
  '국립현대미술관 전시' as category,
  exhibition_title,
  start_date,
  end_date,
  venue_name
FROM exhibitions_ko
WHERE venue_name LIKE '%국립현대미술관%'
ORDER BY start_date DESC;

-- 미술관/갤러리 개수 확인
SELECT 
  'venues 테이블' as table_name,
  COUNT(*) as total_venues,
  COUNT(CASE WHEN created_at >= CURRENT_DATE THEN 1 END) as today_added
FROM venues;

-- ========================================
-- 성공 메시지
-- ========================================
DO $$
BEGIN
  RAISE NOTICE '✅ 새로운 전시 데이터 복사 완료!';
  RAISE NOTICE '📋 exhibitions_master/translations → exhibitions_ko/en';
  RAISE NOTICE '🏛️ 새로운 미술관/갤러리 venues 테이블에 추가';
  RAISE NOTICE '🎯 국립현대미술관 "올해의 작가상 2025" 포함';
  RAISE NOTICE '🚀 서비스 런칭 준비 완료!';
END $$;