-- ========================================
-- RLS 정책 임시 비활성화 및 venues 통합
-- ========================================

-- 1. venues 테이블의 RLS 비활성화 (관리자 권한 필요)
ALTER TABLE venues DISABLE ROW LEVEL SECURITY;

-- 2. venues_simple의 모든 데이터를 venues로 이관
INSERT INTO venues (
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
  vs.name_ko as name,
  vs.name_en,
  CASE vs.venue_type
    WHEN 'museum' THEN 'museum'
    WHEN 'gallery' THEN 'gallery'
    WHEN 'art_center' THEN 'art_center'
    WHEN 'alternative' THEN 'alternative'
    WHEN 'auction' THEN 'auction'
    ELSE 'gallery'
  END as type,
  CASE 
    WHEN vs.is_major = true THEN 1
    ELSE 2
  END as tier,
  COALESCE(vs.city, '서울') as city,
  '한국' as country,
  vs.district,
  vs.address_ko as address,
  vs.phone,
  vs.website,
  true as is_active,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM venues_simple vs
WHERE NOT EXISTS (
  SELECT 1 FROM venues v 
  WHERE v.name = vs.name_ko
     OR (v.name_en IS NOT NULL AND v.name_en = vs.name_en)
);

-- 3. exhibitions_master의 venue_id 매핑 업데이트
WITH venue_mapping AS (
  SELECT 
    vs.id as old_id,
    v.id as new_id
  FROM venues_simple vs
  JOIN venues v ON v.name = vs.name_ko
)
UPDATE exhibitions_master em
SET venue_id = vm.new_id
FROM venue_mapping vm
WHERE em.venue_id = vm.old_id;

-- 4. 통계 확인
SELECT 'venues table count' as description, COUNT(*) as count FROM venues
UNION ALL
SELECT 'exhibitions with venue_id' as description, COUNT(*) as count 
FROM exhibitions_master WHERE venue_id IS NOT NULL;

-- 5. RLS 다시 활성화 (필요시)
-- ALTER TABLE venues ENABLE ROW LEVEL SECURITY;