-- 🎨 DDP 스펙트럴 크로싱스 전시 데이터 업데이트 SQL
-- 실행일: 2025-08-31
-- 목적: DDP의 "스펙트럴 크로싱스" 전시 정보를 exhibitions_master와 exhibitions_translations 테이블에 업데이트

-- ========================================
-- 1단계: exhibitions_master 테이블 업데이트
-- ========================================

-- 먼저 해당 전시의 exhibition_id를 찾기
-- (DDP에서 스펙트럴이 포함된 전시 제목을 가진 전시)

-- 업데이트 실행
UPDATE exhibitions_master
SET
  ticket_price_adult = 0,
  ticket_price_student = 0,
  genre = 'media',
  exhibition_type = 'group',
  updated_at = CURRENT_TIMESTAMP
WHERE id = (
  SELECT exhibition_id FROM exhibitions_translations
  WHERE venue_name = 'DDP'
  AND exhibition_title ILIKE '%스펙트럴%'
  AND language_code = 'ko'
  LIMIT 1
);

-- 결과 확인
SELECT 
  em.*,
  et.exhibition_title,
  et.venue_name
FROM exhibitions_master em
JOIN exhibitions_translations et ON em.id = et.exhibition_id
WHERE et.venue_name = 'DDP'
  AND et.exhibition_title ILIKE '%스펙트럴%'
  AND et.language_code = 'ko';

-- ========================================
-- 2단계: exhibitions_translations 한글 데이터 업데이트
-- ========================================

UPDATE exhibitions_translations
SET
  exhibition_title = '스펙트럴 크로싱스',
  subtitle = 'Spectral Crossings',
  artists = ARRAY['더 스웨이(THE SWAY)'],
  description = 'AI가 만든 얼굴과 형체 없는 감정의 흐름이 빛을 따라 움직이며 관객과 교차해 만나는 순간을 담아낸 미디어아트 전시. 144개의 크리스탈과 아나몰픽 미디어아트를 통해 감정의 빛이 현실 공간에 물리적으로 드러나는 몰입형 설치작품이다. 빛과 움직임으로 가득한 공간에서 관객은 타인의 감정 속에서 자신의 내면을 비추며 새로운 지각의 확장을 경험하게 된다.',
  operating_hours = '10:00~20:00',
  ticket_info = '무료',
  phone_number = '02-2153-0086',
  address = 'DDP 디자인랩 3층',
  website_url = 'http://www.the-sway.com/',
  updated_at = CURRENT_TIMESTAMP
WHERE exhibition_id = (
  SELECT em.id FROM exhibitions_master em
  JOIN exhibitions_translations et ON em.id = et.exhibition_id
  WHERE et.venue_name = 'DDP'
  AND et.exhibition_title ILIKE '%스펙트럴%'
  AND et.language_code = 'ko'
  LIMIT 1
)
AND language_code = 'ko';

-- 한글 업데이트 결과 확인
SELECT 
  exhibition_id,
  exhibition_title,
  artists,
  ticket_info,
  operating_hours
FROM exhibitions_translations
WHERE venue_name = 'DDP'
  AND exhibition_title = '스펙트럴 크로싱스'
  AND language_code = 'ko';

-- ========================================
-- 3단계: 영문 번역 추가 또는 업데이트
-- ========================================

-- 먼저 영문 번역이 존재하는지 확인하고 처리
INSERT INTO exhibitions_translations (
  exhibition_id,
  language_code,
  exhibition_title,
  artists,
  description,
  venue_name,
  city,
  operating_hours,
  ticket_info,
  created_at,
  updated_at
)
SELECT
  exhibition_id,
  'en' as language_code,
  'Spectral Crossings' as exhibition_title,
  ARRAY['THE SWAY'] as artists,
  'An immersive media art exhibition where AI-generated faces and formless emotional flows move along with light, creating moments of intersection with viewers. Through 144 crystals and anamorphic media art, emotional light physically manifests in real space. In this light-filled environment, viewers reflect on their inner selves through others'' emotions, experiencing an expansion of perception.' as description,
  'DDP' as venue_name,
  'Seoul' as city,
  '10:00~20:00' as operating_hours,
  'Free' as ticket_info,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM exhibitions_translations
WHERE venue_name = 'DDP'
AND exhibition_title = '스펙트럴 크로싱스'
AND language_code = 'ko'
ON CONFLICT (exhibition_id, language_code) DO UPDATE
SET
  exhibition_title = EXCLUDED.exhibition_title,
  description = EXCLUDED.description,
  artists = EXCLUDED.artists,
  operating_hours = EXCLUDED.operating_hours,
  ticket_info = EXCLUDED.ticket_info,
  updated_at = CURRENT_TIMESTAMP;

-- ========================================
-- 4단계: 최종 결과 확인
-- ========================================

-- 업데이트된 전시 정보 전체 확인
SELECT 
  et.exhibition_id,
  et.language_code,
  et.exhibition_title,
  et.artists,
  et.venue_name,
  et.ticket_info,
  et.operating_hours,
  em.genre,
  em.exhibition_type,
  em.ticket_price_adult,
  em.ticket_price_student
FROM exhibitions_translations et
JOIN exhibitions_master em ON et.exhibition_id = em.id
WHERE et.venue_name = 'DDP'
  AND et.exhibition_title ILIKE '%스펙트럴%'
ORDER BY et.language_code;

-- ========================================
-- 백업용: 현재 DDP 전시 목록 확인
-- ========================================

-- DDP의 모든 전시 확인 (문제 해결용)
SELECT 
  et.exhibition_id,
  et.language_code,
  et.exhibition_title,
  et.venue_name,
  et.artists
FROM exhibitions_translations et
WHERE et.venue_name = 'DDP'
ORDER BY et.exhibition_title, et.language_code;

-- ========================================
-- 수동 실행용 쿼리 (전시 ID가 명확할 때)
-- ========================================

-- 만약 exhibition_id를 직접 알고 있다면 이 쿼리들을 사용:
-- (위의 쿼리로 ID를 찾은 후 아래 주석을 해제하고 실행)

/*
-- exhibition_id를 직접 지정하여 업데이트 (예: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee')
UPDATE exhibitions_master
SET
  ticket_price_adult = 0,
  ticket_price_student = 0,
  genre = 'media',
  exhibition_type = 'group',
  updated_at = CURRENT_TIMESTAMP
WHERE id = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

UPDATE exhibitions_translations
SET
  exhibition_title = '스펙트럴 크로싱스',
  subtitle = 'Spectral Crossings',
  artists = ARRAY['더 스웨이(THE SWAY)'],
  description = 'AI가 만든 얼굴과 형체 없는 감정의 흐름이 빛을 따라 움직이며 관객과 교차해 만나는 순간을 담아낸 미디어아트 전시. 144개의 크리스탈과 아나몰픽 미디어아트를 통해 감정의 빛이 현실 공간에 물리적으로 드러나는 몰입형 설치작품이다. 빛과 움직임으로 가득한 공간에서 관객은 타인의 감정 속에서 자신의 내면을 비추며 새로운 지각의 확장을 경험하게 된다.',
  operating_hours = '10:00~20:00',
  ticket_info = '무료',
  phone_number = '02-2153-0086',
  address = 'DDP 디자인랩 3층',
  website_url = 'http://www.the-sway.com/',
  updated_at = CURRENT_TIMESTAMP
WHERE exhibition_id = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'
AND language_code = 'ko';
*/