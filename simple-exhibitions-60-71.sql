-- 🎨 SAYU 전시 데이터 60-71번
-- 실행일: 2025-08-31
-- 간단 버전 - Supabase Dashboard에서 바로 실행 가능

-- ========================================
-- 새로운 Venue 추가 (이미 있으면 무시)
-- ========================================
INSERT INTO venues_simple (name_ko, name_en, city, venue_type) VALUES
('더 월로', 'The WilloW', '서울', 'gallery'),
('아뜰리에 아키', 'ATELIER AKI', '서울', 'gallery'),
('바라캇 컨템포러리', 'Barakat Contemporary', '서울', 'gallery'),
('서울시립 미술아카이브', 'Seoul Museum of Art Archive', '서울', 'museum'),
('상히읗', 'sangheeut', '서울', 'gallery'),
('세화미술관', 'Sehwa Museum of Art', '서울', 'museum'),
('화이트스톤갤러리', 'Whitestone Gallery', '서울', 'gallery'),
('글래드스톤갤러리', 'Gladstone Gallery', '서울', 'gallery'),
('아름지기', 'Arumjigi', '서울', 'gallery'),
('대림미술관', 'Daelim Museum', '서울', 'museum'),
('국립현대미술관 서울', 'MMCA Seoul', '서울', 'museum'),
('토탈미술관', 'Total Museum', '서울', 'museum')
ON CONFLICT (name_ko) DO NOTHING;

-- ========================================
-- 60번: 더 월로 - 패치워크!
-- ========================================
WITH new_exhibition_60 AS (
  INSERT INTO exhibitions_master (
    start_date, end_date, status,
    ticket_price_adult, genre, exhibition_type
  ) VALUES (
    '2025-08-28', '2025-09-28', 'ongoing',
    0, 'contemporary', 'group'
  ) RETURNING id
)
INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title, artists, description,
  venue_name, city, operating_hours
) 
SELECT id, 'ko',
  '패치워크!',
  ARRAY['박선호', '사토 토모코', '아오야기 나츠미', '임지지'],
  '이미지 조각들과 파편적 말들로 비가시적인 감각과 비선형적 서사의 가능성을 길어올린다.',
  '더 월로', '서울', '화-일 11:00-18:00'
FROM new_exhibition_60;

-- ========================================
-- 61번: 아뜰리에 아키 - 임현정
-- ========================================
WITH new_exhibition_61 AS (
  INSERT INTO exhibitions_master (
    start_date, end_date, status,
    ticket_price_adult, genre, exhibition_type
  ) VALUES (
    '2025-08-28', '2025-10-04', 'ongoing',
    0, 'contemporary', 'solo'
  ) RETURNING id
)
INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title, artists, description,
  venue_name, city, operating_hours
) 
SELECT id, 'ko',
  '마음의 아카이브: 태평양을 건너며',
  ARRAY['임현정'],
  '계속해서 흐르고 확장되는 임현정의 마음의 풍경을 보여주며, 삶과 예술, 현실과 상상, 자신과 타인이 만나는 지점에서 진정한 회화적 소통의 가능성을 탐구한다.',
  '아뜰리에 아키', '서울', '월-토 10:00-19:00'
FROM new_exhibition_61;

-- ========================================
-- 62번: 바라캇 컨템포러리 - 지미 로버트
-- ========================================
WITH new_exhibition_62 AS (
  INSERT INTO exhibitions_master (
    start_date, end_date, status,
    ticket_price_adult, genre, exhibition_type
  ) VALUES (
    '2025-08-28', '2025-10-26', 'ongoing',
    0, 'contemporary', 'solo'
  ) RETURNING id
)
INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title, artists, description,
  venue_name, city, operating_hours
) 
SELECT id, 'ko',
  '에클립세',
  ARRAY['지미 로버트'],
  '지미 로버트의 국내 첫 개인전. 가려지는 순간 드러나는 새로운 형상과 리듬, 보이지 않는 틈에서 발생하는 또 다른 가능성을 내포합니다.',
  '바라캇 컨템포러리', '서울', '화-일 10:00-18:00'
FROM new_exhibition_62;

-- ========================================
-- 63번: 서울시립 미술아카이브 - 다시, 지구
-- ========================================
WITH new_exhibition_63 AS (
  INSERT INTO exhibitions_master (
    start_date, end_date, status,
    ticket_price_adult, genre, exhibition_type
  ) VALUES (
    '2025-08-28', '2026-02-22', 'ongoing',
    0, 'contemporary', 'group'
  ) RETURNING id
)
INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title, artists, description,
  venue_name, city, operating_hours
) 
SELECT id, 'ko',
  '다시, 지구: 다른 감각으로 응답하기',
  ARRAY['김준', '김해심', '송민규', '이르완 아멧&티타 살리나', '장한나', '최장원', '최찬숙'],
  '인류세라는 시대적 문제에 대해 미술은 무엇을 어떻게 다루고 실천할 수 있는지를 질문하고 시도한다.',
  '서울시립 미술아카이브', '서울', '화-금 10:00-20:00'
FROM new_exhibition_63;

-- ========================================
-- 64번: 상히읗 - 이지수
-- ========================================
WITH new_exhibition_64 AS (
  INSERT INTO exhibitions_master (
    start_date, end_date, status,
    ticket_price_adult, genre, exhibition_type
  ) VALUES (
    '2025-08-28', '2025-09-27', 'ongoing',
    0, 'contemporary', 'solo'
  ) RETURNING id
)
INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title, artists, description,
  venue_name, city, operating_hours
) 
SELECT id, 'ko',
  'Doorstep',
  ARRAY['이지수'],
  '타인에 의해 침범당한 사적 공간의 경계를 탐구하는 신작을 소개하는 전시.',
  '상히읗', '서울', '화-토 11:00-18:00'
FROM new_exhibition_64;

-- ========================================
-- 65번: 세화미술관 - 노노탁 스튜디오
-- ========================================
WITH new_exhibition_65 AS (
  INSERT INTO exhibitions_master (
    start_date, end_date, status,
    ticket_price_adult, genre, exhibition_type
  ) VALUES (
    '2025-08-30', '2025-12-31', 'ongoing',
    15000, 'media', 'solo'
  ) RETURNING id
)
INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title, artists, description,
  venue_name, city, operating_hours
) 
SELECT id, 'ko',
  '노노탁',
  ARRAY['노노탁 스튜디오'],
  '시각, 청각, 공간 지각을 넘나드는 대규모 몰입형 작품을 선보인다.',
  '세화미술관', '서울', '화-일 10:00-18:00'
FROM new_exhibition_65;

-- ========================================
-- 66번: 세화미술관 - 쿠사마 야요이
-- ========================================
WITH new_exhibition_66 AS (
  INSERT INTO exhibitions_master (
    start_date, end_date, status,
    ticket_price_adult, genre, exhibition_type
  ) VALUES (
    '2025-08-30', '2025-11-30', 'ongoing',
    15000, 'installation', 'solo'
  ) RETURNING id
)
INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title, artists, description,
  venue_name, city, operating_hours
) 
SELECT id, 'ko',
  '세화 컬렉션: 새로운 세계를 향한 이정표',
  ARRAY['쿠사마 야요이'],
  '빨간 물방울 모양의 여러 조각이 모여 하나를 이룹니다. 쿠사마의 트레이드 마크 점(dot) 무늬가 돋보입니다.',
  '세화미술관', '서울', '화-일 10:00-18:00'
FROM new_exhibition_66;

-- ========================================
-- 67번: 화이트스톤갤러리 - 헨릭 울달렌
-- ========================================
WITH new_exhibition_67 AS (
  INSERT INTO exhibitions_master (
    start_date, end_date, status,
    ticket_price_adult, genre, exhibition_type
  ) VALUES (
    '2025-08-30', '2025-10-19', 'ongoing',
    0, 'painting', 'solo'
  ) RETURNING id
)
INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title, artists, description,
  venue_name, city, operating_hours
) 
SELECT id, 'ko',
  'LOST/FOUND',
  ARRAY['헨릭 울달렌'],
  '한국에서 태어나 노르웨이로 입양된 경험을 가진 작가의 한국 첫 개인전.',
  '화이트스톤갤러리', '서울', '화-일 11:00-19:00'
FROM new_exhibition_67;

-- ========================================
-- 68번: 글래드스톤갤러리 - 우고 론디노네
-- ========================================
WITH new_exhibition_68 AS (
  INSERT INTO exhibitions_master (
    start_date, end_date, status,
    ticket_price_adult, genre, exhibition_type
  ) VALUES (
    '2025-08-29', '2025-10-18', 'ongoing',
    0, 'painting', 'solo'
  ) RETURNING id
)
INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title, artists, description,
  venue_name, city, operating_hours
) 
SELECT id, 'ko',
  'in beauty bright',
  ARRAY['우고 론디노네'],
  '다양한 크기의 13점의 새로운 풍경화. 분홍, 파랑, 노랑, 보라, 초록의 파스텔 색조로 구성.',
  '글래드스톤갤러리', '서울', '화-토 10:00-18:00'
FROM new_exhibition_68;

-- ========================================
-- 69번: 아름지기 - 장, 식탁으로 이어진 풍경
-- ========================================
WITH new_exhibition_69 AS (
  INSERT INTO exhibitions_master (
    start_date, end_date, status,
    ticket_price_adult, genre, exhibition_type
  ) VALUES (
    '2025-08-29', '2025-11-15', 'ongoing',
    10000, 'craft', 'group'
  ) RETURNING id
)
INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title, artists, description,
  venue_name, city, operating_hours
) 
SELECT id, 'ko',
  '장, 식탁으로 이어진 풍경',
  ARRAY['김경찬', '김동준', '김민욱', '박선민', '백경원'],
  '사람의 정성과 자연의 시간을 담은 장(醬)이 음식, 도구, 공간과 만나 하나의 풍경이 됩니다.',
  '아름지기', '서울', '화-토 10:00-18:00'
FROM new_exhibition_69;

-- ========================================
-- 70번: 대림미술관 - 페트라 콜린스
-- ========================================
WITH new_exhibition_70 AS (
  INSERT INTO exhibitions_master (
    start_date, end_date, status,
    ticket_price_adult, genre, exhibition_type
  ) VALUES (
    '2025-08-29', '2025-12-31', 'ongoing',
    0, 'photography', 'solo'
  ) RETURNING id
)
INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title, artists, description,
  venue_name, city, operating_hours
) 
SELECT id, 'ko',
  '페트라 콜린스: fangirl',
  ARRAY['페트라 콜린스'],
  '특유의 색감과 몽환적인 분위기로 페트라 콜린스 스타일을 만들어낸 아티스트의 국내 최초 최대 규모 전시.',
  '대림미술관', '서울', '화-일 10:00-18:00'
FROM new_exhibition_70;

-- ========================================
-- 71번: 국립현대미술관 서울 - 올해의 작가상 2025
-- ========================================
WITH new_exhibition_71 AS (
  INSERT INTO exhibitions_master (
    start_date, end_date, status,
    ticket_price_adult, genre, exhibition_type
  ) VALUES (
    '2025-08-29', '2026-02-01', 'ongoing',
    2000, 'contemporary', 'group'
  ) RETURNING id
)
INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title, artists, description,
  venue_name, city, operating_hours
) 
SELECT id, 'ko',
  '올해의 작가상 2025',
  ARRAY['김영은', '김지평', '언메이크랩', '임영주'],
  '국립현대미술관과 SBS문화재단이 공동 주최하는 대표적인 현대미술 작가 후원 프로그램.',
  '국립현대미술관 서울', '서울', '화-일 10:00-18:00, 수·토 10:00-21:00'
FROM new_exhibition_71;