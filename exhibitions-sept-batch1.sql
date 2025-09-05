-- ========================================
-- SAYU 9월 전시 추가 - Batch 1 (1-5)
-- 실행일: 2025-09-05
-- ========================================

-- 먼저 instagram_url 컬럼 추가 (이미 있으면 무시)
ALTER TABLE exhibitions_master 
ADD COLUMN IF NOT EXISTS instagram_url TEXT;

-- ========================================
-- 1. 오수환: 천 개의 대화 (가나아트센터)
-- ========================================

-- exhibitions_master
INSERT INTO exhibitions_master (
  venue_id,
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student,
  genre, exhibition_type,
  source_url, instagram_url,
  created_at, updated_at
) VALUES (
  (SELECT id FROM venues WHERE name = '가나아트센터' LIMIT 1),
  '2025-08-29', '2025-09-21', 'ongoing',
  0, 0,
  'contemporary', 'solo',
  'https://www.ganaart.com/exhibition/oh-sufan-2/',
  'https://www.instagram.com/p/DNpoeQJB5FN/',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

-- 한글 번역
INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title, artists, description,
  venue_name, city,
  operating_hours, ticket_info,
  phone_number, address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE source_url = 'https://www.ganaart.com/exhibition/oh-sufan-2/' ORDER BY created_at DESC LIMIT 1),
  'ko',
  '오수환: 천 개의 대화',
  ARRAY['오수환'],
  '이번 전시는 <곡신>, <적막>, <변화>, <대화>로 이어지는 오수환의 연작 중 <대화> 시리즈 드로잉 40여점을 선보인다. 2000년대 후반 시작해 현재까지 지속하는 <대화>는 자연, 과거의 문명, 인간과의 교감을 주제로 하며, 먹, 과슈, 오일파스텔 등 다양한 재료로 자유롭고 경쾌한 필치가 특징이다.',
  '가나아트센터', '서울',
  '화-일 10:00-19:00',
  '무료',
  '02-720-1020',
  '서울특별시 종로구 평창30길 28'
);

-- 영문 번역
INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title, artists, description,
  venue_name, city,
  operating_hours, ticket_info
) VALUES (
  (SELECT id FROM exhibitions_master WHERE source_url = 'https://www.ganaart.com/exhibition/oh-sufan-2/' ORDER BY created_at DESC LIMIT 1),
  'en',
  'Oh Sufan: A Thousand Dialogues',
  ARRAY['Oh Sufan'],
  'This exhibition presents around 40 drawings from Oh Sufan''s ongoing Dialogue series. Begun in the late 2000s, the series explores themes of communication with nature, ancient civilizations, and humanity through liberated strokes using ink, gouache, and oil pastels.',
  'Gana Art Center', 'Seoul',
  'Tue-Sun 10:00-19:00',
  'Free'
);

-- ========================================
-- 2. 조주현 (페이토 갤러리) - 8/29~9/27
-- [정보 대기중]
-- ========================================

-- ========================================
-- 3. 백경호 (눈 컨템포러리) - 8/29~9/29
-- [정보 대기중]
-- ========================================

-- ========================================
-- 4. 김형대 (금산갤러리) - 8/29~9/30
-- [정보 대기중]
-- ========================================

-- ========================================
-- 5. Nude: Flesh & Love (제이슨함) - 8/30~10/30
-- [정보 대기중]
-- ========================================