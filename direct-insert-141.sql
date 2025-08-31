-- 🎯 141개 전시 데이터 직접 삽입 (새 구조)
-- exhibitions_clean 거치지 않고 바로 master + translations에 삽입
-- 생성일: 2025-08-31

-- ========================================
-- 1. exhibitions_master 직접 삽입
-- ========================================
INSERT INTO exhibitions_master (
  start_date, end_date, status, exhibition_type, genre, 
  is_featured, priority_order, view_count
) VALUES
-- 8월 전시들
('2025-08-01', '2025-08-20', 'ended', 'group', 'contemporary', false, 50, 312),
('2025-08-01', '2025-08-20', 'ended', 'group', 'contemporary', false, 50, 245),
('2025-08-01', '2025-08-20', 'ended', 'group', 'contemporary', false, 50, 187),
-- ... (나머지 138개)
;

-- ========================================
-- 2. exhibitions_translations 직접 삽입 (한글)
-- ========================================
-- 위에서 생성된 master ID를 참조해야 하므로
-- WITH 절 사용하여 한번에 처리

WITH master_data AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM exhibitions_master
  WHERE created_at >= NOW() - INTERVAL '1 minute'
),
translation_data AS (
  SELECT 
    ROW_NUMBER() OVER (ORDER BY 1) as rn,
    *
  FROM (VALUES
    ('8월 메이저 경매', '케이옥션', ARRAY[]::TEXT[], '서울'),
    ('김민조·오주안·홍세진', '상업화랑 을지로', ARRAY['김민조','오주안','홍세진'], '서울'),
    ('김기정·로지은', '눈 컨템포러리', ARRAY['김기정','로지은'], '서울')
    -- ... (나머지 138개)
  ) AS t(title, venue, artists, city)
)
INSERT INTO exhibitions_translations (
  exhibition_id, language_code, exhibition_title, 
  venue_name, artists, city
)
SELECT 
  m.id, 'ko', t.title, t.venue, t.artists, t.city
FROM master_data m
JOIN translation_data t ON m.rn = t.rn;

-- ========================================
-- 3. venue_id 연결
-- ========================================
UPDATE exhibitions_master em
SET venue_id = v.id
FROM exhibitions_translations et, venues_simple v
WHERE em.id = et.exhibition_id
AND et.venue_name = v.name_ko;

-- ========================================
-- 4. 검증
-- ========================================
SELECT COUNT(*) as total FROM exhibitions_master;
SELECT COUNT(*) as translations FROM exhibitions_translations WHERE language_code = 'ko';