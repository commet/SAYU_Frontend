-- ========================================
-- SAYU Venues 테이블 정리 및 통합 스크립트
-- 작업 내용:
-- 1. venues 테이블의 이상한 코드 제거
-- 2. venues_simple 데이터를 venues로 병합
-- 3. exhibitions_master의 venue_id 참조 업데이트
-- ========================================

-- Step 1: venues 테이블의 이름에서 코드 제거
UPDATE venues
SET 
  name = TRIM(SPLIT_PART(name, '(', 1)),
  name_en = CASE 
    WHEN name_en IS NULL OR name_en = '' 
    THEN TRIM(SPLIT_PART(name, '(', 1))
    ELSE name_en
  END,
  updated_at = CURRENT_TIMESTAMP
WHERE name LIKE '%(%' 
  AND name LIKE '%)%';

-- Step 2: venues_simple의 데이터를 venues로 병합
-- 먼저 이미 존재하는 장소는 업데이트
UPDATE venues v
SET 
  name = COALESCE(vs.name_ko, v.name),
  name_en = COALESCE(vs.name_en, v.name_en),
  district = COALESCE(vs.district, v.district),
  type = COALESCE(
    CASE vs.venue_type
      WHEN 'museum' THEN 'museum'
      WHEN 'gallery' THEN 'gallery'
      WHEN 'art_center' THEN 'art_center'
      WHEN 'alternative' THEN 'alternative'
      WHEN 'auction' THEN 'auction'
      ELSE v.type
    END,
    v.type
  ),
  phone = COALESCE(vs.phone, v.phone),
  website = COALESCE(vs.website, v.website),
  address = COALESCE(vs.address_ko, v.address),
  tier = CASE 
    WHEN vs.is_major = true THEN 1
    WHEN vs.is_major = false THEN 2
    ELSE v.tier
  END,
  updated_at = CURRENT_TIMESTAMP
FROM venues_simple vs
WHERE v.name = vs.name_ko
   OR v.name = vs.name_en
   OR v.name LIKE vs.name_ko || '%'
   OR v.name_en = vs.name_en;

-- Step 3: venues_simple에만 있는 새로운 장소들을 venues에 추가
INSERT INTO venues (
  id,
  name,
  name_en,
  type,
  tier,
  city,
  country,
  district,
  address,
  phone,
  website,
  is_active,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),
  vs.name_ko,
  vs.name_en,
  CASE vs.venue_type
    WHEN 'museum' THEN 'museum'
    WHEN 'gallery' THEN 'gallery'
    WHEN 'art_center' THEN 'art_center'
    WHEN 'alternative' THEN 'alternative'
    WHEN 'auction' THEN 'auction'
    ELSE 'gallery'
  END,
  CASE 
    WHEN vs.is_major = true THEN 1
    ELSE 2
  END,
  vs.city,
  '한국',
  vs.district,
  vs.address_ko,
  vs.phone,
  vs.website,
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM venues_simple vs
WHERE NOT EXISTS (
  SELECT 1 FROM venues v 
  WHERE v.name = vs.name_ko
     OR v.name = vs.name_en
     OR v.name_en = vs.name_en
);

-- Step 4: exhibitions_master의 venue_id 매핑 테이블 생성
CREATE TEMP TABLE venue_mapping AS
SELECT 
  vs.id as old_id,
  v.id as new_id
FROM venues_simple vs
JOIN venues v ON (
  v.name = vs.name_ko
  OR v.name_en = vs.name_en
);

-- Step 5: exhibitions_master의 venue_id 업데이트
UPDATE exhibitions_master em
SET venue_id = vm.new_id
FROM venue_mapping vm
WHERE em.venue_id = vm.old_id;

-- Step 6: 통계 확인
SELECT 
  'Original venues count' as description,
  COUNT(*) as count
FROM venues
UNION ALL
SELECT 
  'venues_simple count' as description,
  COUNT(*) as count
FROM venues_simple
UNION ALL
SELECT 
  'exhibitions with venue_id' as description,
  COUNT(*) as count
FROM exhibitions_master
WHERE venue_id IS NOT NULL;