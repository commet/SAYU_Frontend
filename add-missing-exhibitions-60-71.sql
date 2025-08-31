-- 🎨 SAYU 전시 데이터 추가 SQL (전시 #60-71)
-- 실행일: 2025-08-31
-- 전시 목록: 12개 전시 추가

-- ========================================
-- 추가 VENUES_SIMPLE 테이블 데이터
-- ========================================
INSERT INTO venues_simple (name_ko, name_en, city, district, venue_type, is_major, priority_order) VALUES
('더 월로', 'The Wollo', '서울', '강남구', 'gallery', false, 60),
('아뜰리에 아키', 'Atelier Aki', '서울', '종로구', 'gallery', false, 60),
('바라캇 컨템포러리', 'Barakat Contemporary', '서울', '종로구', 'gallery', false, 55),
('서울시립 미술아카이브', 'Seoul Art Archive', '서울', '중구', 'museum', true, 35),
('상히읗', 'Sang-Hieut', '서울', '종로구', 'gallery', false, 60),
('세화미술관', 'SAVINA Museum', '서울', '종로구', 'museum', false, 45),
('화이트스톤갤러리', 'Whitestone Gallery', '서울', '강남구', 'gallery', false, 55),
('글래드스톤갤러리', 'Gladstone Gallery', '서울', '강남구', 'gallery', true, 40),
('재단법인 아름지기', 'Arumjigi Culture Keepers Foundation', '서울', '종로구', 'art_center', false, 50),
('대림미술관', 'Daelim Museum', '서울', '종로구', 'museum', true, 35)
ON CONFLICT (name_ko) DO NOTHING;

-- ========================================
-- 60번: 더 월로 - 패치워크!
-- ========================================
DO $
DECLARE
  v_exhibition_id UUID;
BEGIN
INSERT INTO exhibitions_master (
  venue_id, start_date, end_date, status, exhibition_type, genre,
  ticket_price_adult, ticket_price_student, is_featured, priority_order
) VALUES (
  (SELECT id FROM venues_simple WHERE name_ko = '더 월로' LIMIT 1),
  '2025-08-28', '2025-09-28', 'ongoing', 'group', 'contemporary',
  0, 0, false, 60
) RETURNING id INTO v_exhibition_id;

INSERT INTO exhibitions_translations (
  exhibition_id, language_code, exhibition_title, subtitle, artists, description,
  venue_name, city, address, operating_hours, ticket_info, phone_number, website_url
) VALUES (
  v_exhibition_id, 'ko', '패치워크!', NULL,
  ARRAY['박고은', '박이소', '박현기', '조해준', '진기종', '최민화'],
  '1970-90년대 한국 실험미술 작가들의 작품을 통해 당시의 실험적 예술 정신을 재조명하는 전시. 조각 같은 회화, 회화 같은 조각, 그 경계를 넘나드는 작품들이 만들어내는 패치워크적 풍경을 선보인다. 강렬한 시대적 에너지와 예술적 도전을 담은 작품들로 구성되어 있다.',
  '더 월로', '서울',
  '서울 강남구 도산대로 27길 33',
  '화-토 11:00-19:00 (일월 휴관)',
  '무료',
  '02-511-5099',
  'http://thewollo.com'
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code, exhibition_title, subtitle, artists, description,
  venue_name, city, address, operating_hours, ticket_info, phone_number, website_url
) VALUES (
  v_exhibition_id, 'en', 'Patchwork!', NULL,
  ARRAY['Park Go-eun', 'Park Lee-so', 'Park Hyun-ki', 'Cho Hae-jun', 'Jin Ki-jong', 'Choi Min-hwa'],
  'An exhibition re-examining the experimental art spirit through works by Korean experimental artists from the 1970s-90s. Presents a patchwork landscape created by works crossing boundaries between painting-like sculpture and sculpture-like painting. Composed of works containing intense period energy and artistic challenges.',
  'The Wollo', 'Seoul',
  '33 Dosan-daero 27-gil, Gangnam-gu, Seoul',
  'Tue-Sat 11:00-19:00 (Closed Sun-Mon)',
  'Free',
  '02-511-5099',
  'http://thewollo.com'
);
END $;

-- ========================================
-- 61번: 아뜰리에 아키 - 임현정
-- ========================================
DO $
DECLARE
  v_exhibition_id UUID;
BEGIN
INSERT INTO exhibitions_master (
  venue_id, start_date, end_date, status, exhibition_type, genre,
  ticket_price_adult, ticket_price_student, is_featured, priority_order
) VALUES (
  (SELECT id FROM venues_simple WHERE name_ko = '아뜰리에 아키' LIMIT 1),
  '2025-08-28', '2025-09-28', 'ongoing', 'solo', 'contemporary',
  0, 0, false, 61
) RETURNING id INTO v_exhibition_id;

INSERT INTO exhibitions_translations (
  exhibition_id, language_code, exhibition_title, subtitle, artists, description,
  venue_name, city, address, operating_hours, ticket_info, phone_number, website_url
) VALUES (
  v_exhibition_id, 'ko', '임현정 개인전', '몸의 풍경',
  ARRAY['임현정'],
  '몸과 공간, 시간의 관계를 탐구하는 임현정 작가의 개인전. 신체의 움직임과 흔적을 통해 공간을 재해석하고, 보이지 않는 시간의 층위를 드러내는 작업들을 선보인다. 퍼포먼스와 설치, 영상을 넘나들며 몸이 만들어내는 고유한 언어를 포착한다.',
  '아뜰리에 아키', '서울',
  '서울 종로구 북촌로 5가길 14',
  '화-토 11:00-18:00 (일월 휴관)',
  '무료',
  '02-722-5503',
  'http://atelieraki.com'
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code, exhibition_title, subtitle, artists, description,
  venue_name, city, address, operating_hours, ticket_info, phone_number, website_url
) VALUES (
  v_exhibition_id, 'en', 'Lim Hyun-jung Solo Exhibition', 'Landscape of Body',
  ARRAY['Lim Hyun-jung'],
  'Solo exhibition by Lim Hyun-jung exploring relationships between body, space, and time. Presents works reinterpreting space through bodily movements and traces, revealing invisible layers of time. Captures unique language created by the body across performance, installation, and video.',
  'Atelier Aki', 'Seoul',
  '14 Bukchon-ro 5ga-gil, Jongno-gu, Seoul',
  'Tue-Sat 11:00-18:00 (Closed Sun-Mon)',
  'Free',
  '02-722-5503',
  'http://atelieraki.com'
);
END $;

-- ========================================
-- 62번: 바라캇 컨템포러리 - 지미 로버트
-- ========================================
DO $
DECLARE
  v_exhibition_id UUID;
BEGIN
INSERT INTO exhibitions_master (
  venue_id, start_date, end_date, status, exhibition_type, genre,
  ticket_price_adult, ticket_price_student, is_featured, priority_order
) VALUES (
  (SELECT id FROM venues_simple WHERE name_ko = '바라캇 컨템포러리' LIMIT 1),
  '2025-08-28', '2025-10-28', 'ongoing', 'solo', 'contemporary',
  0, 0, false, 62
) RETURNING id INTO v_exhibition_id;

INSERT INTO exhibitions_translations (
  exhibition_id, language_code, exhibition_title, subtitle, artists, description,
  venue_name, city, address, operating_hours, ticket_info, phone_number, website_url
) VALUES (
  v_exhibition_id, 'ko', '지미 로버트', '멜로디의 윤곽',
  ARRAY['지미 로버트'],
  '프랑스 작가 지미 로버트의 아시아 첫 개인전. 몸과 정체성, 인종과 젠더의 경계를 탐구하는 작가의 대표작들을 선보인다. 퍼포먼스, 사진, 영상, 콜라주 등 다양한 매체를 통해 규범과 관습에 대한 질문을 던지며, 몸이 지닌 정치적 의미를 탐색한다.',
  '바라캇 컨템포러리', '서울',
  '서울 종로구 삼청로 7길 36',
  '화-토 10:00-18:00, 일 12:00-18:00 (월 휴관)',
  '무료',
  '02-730-1948',
  'http://barakatcontemporary.com'
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code, exhibition_title, subtitle, artists, description,
  venue_name, city, address, operating_hours, ticket_info, phone_number, website_url
) VALUES (
  v_exhibition_id, 'en', 'Jimmy Robert', 'Contour of Melody',
  ARRAY['Jimmy Robert'],
  'First Asian solo exhibition by French artist Jimmy Robert. Presents representative works exploring boundaries of body and identity, race and gender. Questions norms and conventions through various media including performance, photography, video, and collage, exploring political meanings of the body.',
  'Barakat Contemporary', 'Seoul',
  '36 Samcheong-ro 7-gil, Jongno-gu, Seoul',
  'Tue-Sat 10:00-18:00, Sun 12:00-18:00 (Closed Mon)',
  'Free',
  '02-730-1948',
  'http://barakatcontemporary.com'
);
END $;

-- ========================================
-- 63번: 서울시립 미술아카이브 - 다시, 지구
-- ========================================
DO $
DECLARE
  v_exhibition_id UUID;
BEGIN
INSERT INTO exhibitions_master (
  venue_id, start_date, end_date, status, exhibition_type, genre,
  ticket_price_adult, ticket_price_student, is_featured, priority_order
) VALUES (
  (SELECT id FROM venues_simple WHERE name_ko = '서울시립 미술아카이브' LIMIT 1),
  '2025-08-28', '2025-11-28', 'ongoing', 'group', 'contemporary',
  0, 0, true, 63
) RETURNING id INTO v_exhibition_id;

INSERT INTO exhibitions_translations (
  exhibition_id, language_code, exhibition_title, subtitle, artists, description,
  venue_name, city, address, operating_hours, ticket_info, phone_number, website_url
) VALUES (
  v_exhibition_id, 'ko', '다시, 지구', '기후위기 시대의 예술',
  ARRAY['김아영', '정은영', '이소요', '문경원', '김실비'],
  '기후위기와 생태계 붕괴를 마주한 현재, 예술이 할 수 있는 역할을 모색하는 전시. 아카이브 자료와 현대미술 작품을 통해 인간과 자연의 관계를 재고하고, 지속가능한 미래를 위한 예술적 실천을 제안한다. 다학제적 접근으로 환경 문제를 다각도로 조명한다.',
  '서울시립 미술아카이브', '서울',
  '서울 중구 덕수궁길 15',
  '화-금 10:00-20:00, 주말/공휴일 10:00-18:00 (월 휴관)',
  '무료',
  '02-2124-8800',
  'https://sema.seoul.go.kr'
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code, exhibition_title, subtitle, artists, description,
  venue_name, city, address, operating_hours, ticket_info, phone_number, website_url
) VALUES (
  v_exhibition_id, 'en', 'Again, Earth', 'Art in the Climate Crisis Era',
  ARRAY['Kim Ayoung', 'Jeong Eun Young', 'Lee So-yo', 'Moon Kyungwon', 'Sylbee Kim'],
  'Exhibition exploring the role art can play facing climate crisis and ecosystem collapse. Reconsiders human-nature relationships through archive materials and contemporary artworks, proposing artistic practices for a sustainable future. Illuminates environmental issues from multiple angles through interdisciplinary approaches.',
  'Seoul Art Archive', 'Seoul',
  '15 Deoksugung-gil, Jung-gu, Seoul',
  'Tue-Fri 10:00-20:00, Weekends/Holidays 10:00-18:00 (Closed Mon)',
  'Free',
  '02-2124-8800',
  'https://sema.seoul.go.kr'
);
END $;

-- ========================================
-- 64번: 상히읗 - 이지수
-- ========================================
DO $
DECLARE
  v_exhibition_id UUID;
BEGIN
INSERT INTO exhibitions_master (
  venue_id, start_date, end_date, status, exhibition_type, genre,
  ticket_price_adult, ticket_price_student, is_featured, priority_order
) VALUES (
  (SELECT id FROM venues_simple WHERE name_ko = '상히읗' LIMIT 1),
  '2025-08-28', '2025-09-28', 'ongoing', 'solo', 'painting',
  0, 0, false, 64
) RETURNING id INTO v_exhibition_id;

INSERT INTO exhibitions_translations (
  exhibition_id, language_code, exhibition_title, subtitle, artists, description,
  venue_name, city, address, operating_hours, ticket_info, phone_number, website_url
) VALUES (
  v_exhibition_id, 'ko', '이지수', '빛의 기록',
  ARRAY['이지수'],
  '빛과 그림자의 미묘한 변화를 포착하는 이지수 작가의 개인전. 일상의 순간들을 섬세한 관찰력으로 그려낸 회화 작품들을 선보인다. 시간의 흐름에 따라 변화하는 빛의 표정을 화폭에 담아내며, 평범한 풍경 속에서 특별한 아름다움을 발견한다.',
  '상히읗', '서울',
  '서울 종로구 자하문로 10길 11',
  '화-토 11:00-18:00 (일월 휴관)',
  '무료',
  '070-4239-3991',
  'http://sanghieut.com'
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code, exhibition_title, subtitle, artists, description,
  venue_name, city, address, operating_hours, ticket_info, phone_number, website_url
) VALUES (
  v_exhibition_id, 'en', 'Lee Ji-soo', 'Record of Light',
  ARRAY['Lee Ji-soo'],
  'Solo exhibition by Lee Ji-soo capturing subtle changes of light and shadow. Presents paintings depicting everyday moments with delicate observation. Captures expressions of light changing with time flow on canvas, discovering special beauty in ordinary landscapes.',
  'Sang-Hieut', 'Seoul',
  '11 Jahamun-ro 10-gil, Jongno-gu, Seoul',
  'Tue-Sat 11:00-18:00 (Closed Sun-Mon)',
  'Free',
  '070-4239-3991',
  'http://sanghieut.com'
);
END $;

-- ========================================
-- 65번: 세화미술관 - 노노탁 스튜디오
-- ========================================
DO $
DECLARE
  v_exhibition_id UUID;
BEGIN
INSERT INTO exhibitions_master (
  venue_id, start_date, end_date, status, exhibition_type, genre,
  ticket_price_adult, ticket_price_student, is_featured, priority_order
) VALUES (
  (SELECT id FROM venues_simple WHERE name_ko = '세화미술관' LIMIT 1),
  '2025-08-30', '2025-12-31', 'ongoing', 'group', 'design',
  10000, 8000, false, 65
) RETURNING id INTO v_exhibition_id;

INSERT INTO exhibitions_translations (
  exhibition_id, language_code, exhibition_title, subtitle, artists, description,
  venue_name, city, address, operating_hours, ticket_info, phone_number, website_url
) VALUES (
  v_exhibition_id, 'ko', '노노탁 스튜디오', '놀이와 디자인의 경계',
  ARRAY['노노탁 스튜디오'],
  '놀이와 디자인의 경계를 탐구하는 노노탁 스튜디오의 전시. 인터랙티브한 설치 작품과 실험적인 디자인 오브제를 통해 관객의 참여를 유도한다. 일상의 사물을 재해석하고 유머러스한 시각으로 접근하며, 디자인이 가진 소통의 가능성을 확장한다.',
  '세화미술관', '서울',
  '서울 종로구 새문안로 68',
  '화-일 10:00-18:00 (월 휴관)',
  '성인 10,000원, 학생 8,000원',
  '02-736-7744',
  'http://www.savinamuseum.com'
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code, exhibition_title, subtitle, artists, description,
  venue_name, city, address, operating_hours, ticket_info, phone_number, website_url
) VALUES (
  v_exhibition_id, 'en', 'Nonotak Studio', 'Boundary of Play and Design',
  ARRAY['Nonotak Studio'],
  'Exhibition by Nonotak Studio exploring boundaries between play and design. Induces audience participation through interactive installations and experimental design objects. Reinterprets everyday objects with humorous perspective, expanding communicative possibilities of design.',
  'SAVINA Museum', 'Seoul',
  '68 Saemunan-ro, Jongno-gu, Seoul',
  'Tue-Sun 10:00-18:00 (Closed Mon)',
  'Adults 10,000 KRW, Students 8,000 KRW',
  '02-736-7744',
  'http://www.savinamuseum.com'
);
END $;

-- ========================================
-- 66번: 세화미술관 - 쿠사마 야요이
-- ========================================
DO $
DECLARE
  v_exhibition_id UUID;
BEGIN
INSERT INTO exhibitions_master (
  venue_id, start_date, end_date, status, exhibition_type, genre,
  ticket_price_adult, ticket_price_student, is_featured, priority_order
) VALUES (
  (SELECT id FROM venues_simple WHERE name_ko = '세화미술관' LIMIT 1),
  '2025-08-30', '2025-11-30', 'ongoing', 'solo', 'contemporary',
  15000, 10000, true, 66
) RETURNING id INTO v_exhibition_id;

INSERT INTO exhibitions_translations (
  exhibition_id, language_code, exhibition_title, subtitle, artists, description,
  venue_name, city, address, operating_hours, ticket_info, phone_number, website_url
) VALUES (
  v_exhibition_id, 'ko', '쿠사마 야요이', '무한의 거울',
  ARRAY['쿠사마 야요이'],
  '일본을 대표하는 현대미술가 쿠사마 야요이의 전시. 상징적인 호박 조각과 무한 거울방, 그리고 점무늬 회화 시리즈를 통해 작가 특유의 환각적이고 몽환적인 세계를 선보인다. 반복과 축적, 무한의 개념을 시각화한 작품들로 관객을 압도한다.',
  '세화미술관', '서울',
  '서울 종로구 새문안로 68',
  '화-일 10:00-18:00 (월 휴관)',
  '성인 15,000원, 학생 10,000원',
  '02-736-7744',
  'http://www.savinamuseum.com'
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code, exhibition_title, subtitle, artists, description,
  venue_name, city, address, operating_hours, ticket_info, phone_number, website_url
) VALUES (
  v_exhibition_id, 'en', 'Yayoi Kusama', 'Infinity Mirror',
  ARRAY['Yayoi Kusama'],
  'Exhibition by Yayoi Kusama, representative contemporary artist of Japan. Presents artist''s unique hallucinatory and dreamlike world through iconic pumpkin sculptures, infinity mirror rooms, and dot painting series. Overwhelms audiences with works visualizing concepts of repetition, accumulation, and infinity.',
  'SAVINA Museum', 'Seoul',
  '68 Saemunan-ro, Jongno-gu, Seoul',
  'Tue-Sun 10:00-18:00 (Closed Mon)',
  'Adults 15,000 KRW, Students 10,000 KRW',
  '02-736-7744',
  'http://www.savinamuseum.com'
);
END $;

-- ========================================
-- 67번: 화이트스톤갤러리 - 헨릭 울달렌
-- ========================================
DO $
DECLARE
  v_exhibition_id UUID;
BEGIN
INSERT INTO exhibitions_master (
  venue_id, start_date, end_date, status, exhibition_type, genre,
  ticket_price_adult, ticket_price_student, is_featured, priority_order
) VALUES (
  (SELECT id FROM venues_simple WHERE name_ko = '화이트스톤갤러리' LIMIT 1),
  '2025-08-30', '2025-10-19', 'ongoing', 'solo', 'painting',
  0, 0, false, 67
) RETURNING id INTO v_exhibition_id;

INSERT INTO exhibitions_translations (
  exhibition_id, language_code, exhibition_title, subtitle, artists, description,
  venue_name, city, address, operating_hours, ticket_info, phone_number, website_url
) VALUES (
  v_exhibition_id, 'ko', '헨릭 울달렌', '침묵의 풍경',
  ARRAY['헨릭 울달렌'],
  '노르웨이 작가 헨릭 울달렌의 한국 첫 개인전. 북유럽의 차가운 풍경과 인간의 고독을 그려낸 대형 회화 작품들을 선보인다. 두꺼운 물감 층과 거친 붓질로 완성된 표현주의적 화면은 현대인의 소외와 불안을 강렬하게 전달한다.',
  '화이트스톤갤러리', '서울',
  '서울 강남구 도산대로 45길 6',
  '화-토 10:00-19:00, 일 10:00-18:00 (월 휴관)',
  '무료',
  '02-513-6767',
  'http://www.whitestone-gallery.com'
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code, exhibition_title, subtitle, artists, description,
  venue_name, city, address, operating_hours, ticket_info, phone_number, website_url
) VALUES (
  v_exhibition_id, 'en', 'Henrik Uldalen', 'Silent Landscape',
  ARRAY['Henrik Uldalen'],
  'First Korean solo exhibition by Norwegian artist Henrik Uldalen. Presents large paintings depicting cold Nordic landscapes and human solitude. Expressionist surfaces completed with thick paint layers and rough brushstrokes powerfully convey modern alienation and anxiety.',
  'Whitestone Gallery', 'Seoul',
  '6 Dosan-daero 45-gil, Gangnam-gu, Seoul',
  'Tue-Sat 10:00-19:00, Sun 10:00-18:00 (Closed Mon)',
  'Free',
  '02-513-6767',
  'http://www.whitestone-gallery.com'
);
END $;

-- ========================================
-- 68번: 글래드스톤갤러리 - 우고 론디노네
-- ========================================
DO $
DECLARE
  v_exhibition_id UUID;
BEGIN
INSERT INTO exhibitions_master (
  venue_id, start_date, end_date, status, exhibition_type, genre,
  ticket_price_adult, ticket_price_student, is_featured, priority_order
) VALUES (
  (SELECT id FROM venues_simple WHERE name_ko = '글래드스톤갤러리' LIMIT 1),
  '2025-08-29', '2025-10-30', 'ongoing', 'solo', 'sculpture',
  0, 0, true, 68
) RETURNING id INTO v_exhibition_id;

INSERT INTO exhibitions_translations (
  exhibition_id, language_code, exhibition_title, subtitle, artists, description,
  venue_name, city, address, operating_hours, ticket_info, phone_number, website_url
) VALUES (
  v_exhibition_id, 'ko', '우고 론디노네', '푸른 돌, 하얀 구름',
  ARRAY['우고 론디노네'],
  '스위스 작가 우고 론디노네의 대규모 전시. 자연과 인공, 시간과 영원의 대비를 탐구하는 조각과 회화 작품들을 선보인다. 거대한 돌 조각과 구름 형상의 설치 작품은 명상적이고 시적인 공간을 창출하며, 관객에게 사색의 시간을 제공한다.',
  '글래드스톤갤러리', '서울',
  '서울 강남구 압구정로 75길 5',
  '화-토 10:00-18:00 (일월 휴관)',
  '무료',
  '02-3448-8008',
  'http://www.gladstonegallery.com'
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code, exhibition_title, subtitle, artists, description,
  venue_name, city, address, operating_hours, ticket_info, phone_number, website_url
) VALUES (
  v_exhibition_id, 'en', 'Ugo Rondinone', 'Blue Stone, White Cloud',
  ARRAY['Ugo Rondinone'],
  'Large-scale exhibition by Swiss artist Ugo Rondinone. Presents sculptures and paintings exploring contrasts between nature and artifice, time and eternity. Giant stone sculptures and cloud-shaped installations create meditative and poetic spaces, offering audiences time for contemplation.',
  'Gladstone Gallery', 'Seoul',
  '5 Apgujeong-ro 75-gil, Gangnam-gu, Seoul',
  'Tue-Sat 10:00-18:00 (Closed Sun-Mon)',
  'Free',
  '02-3448-8008',
  'http://www.gladstonegallery.com'
);
END $;

-- ========================================
-- 69번: 재단법인 아름지기 - 장, 식탁으로 이어진 풍경
-- ========================================
DO $
DECLARE
  v_exhibition_id UUID;
BEGIN
INSERT INTO exhibitions_master (
  venue_id, start_date, end_date, status, exhibition_type, genre,
  ticket_price_adult, ticket_price_student, is_featured, priority_order
) VALUES (
  (SELECT id FROM venues_simple WHERE name_ko = '재단법인 아름지기' LIMIT 1),
  '2025-08-29', '2025-10-29', 'ongoing', 'group', 'craft',
  5000, 3000, false, 69
) RETURNING id INTO v_exhibition_id;

INSERT INTO exhibitions_translations (
  exhibition_id, language_code, exhibition_title, subtitle, artists, description,
  venue_name, city, address, operating_hours, ticket_info, phone_number, website_url
) VALUES (
  v_exhibition_id, 'ko', '장, 식탁으로 이어진 풍경', '한국 발효 문화의 미학',
  ARRAY['김덕호', '이헌정', '박성욱'],
  '한국의 전통 발효 문화와 현대 식문화의 만남을 조명하는 전시. 장독대에서 시작된 발효의 지혜가 현대의 식탁으로 이어지는 과정을 공예, 사진, 영상 등 다양한 매체로 표현한다. 시간이 만들어내는 깊은 맛과 아름다움을 시각적으로 재해석한다.',
  '재단법인 아름지기', '서울',
  '서울 종로구 효자로 17',
  '화-일 10:00-18:00 (월 휴관)',
  '성인 5,000원, 학생 3,000원',
  '02-741-8373',
  'http://www.arumjigi.org'
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code, exhibition_title, subtitle, artists, description,
  venue_name, city, address, operating_hours, ticket_info, phone_number, website_url
) VALUES (
  v_exhibition_id, 'en', 'Jang, Landscape Connected to the Table', 'Aesthetics of Korean Fermentation Culture',
  ARRAY['Kim Deok-ho', 'Lee Heon-jeong', 'Park Sung-wook'],
  'Exhibition illuminating the meeting of Korean traditional fermentation culture and contemporary food culture. Expresses through various media including crafts, photography, and video the process of fermentation wisdom from jangdokdae continuing to modern tables. Visually reinterprets deep flavors and beauty created by time.',
  'Arumjigi Culture Keepers Foundation', 'Seoul',
  '17 Hyoja-ro, Jongno-gu, Seoul',
  'Tue-Sun 10:00-18:00 (Closed Mon)',
  'Adults 5,000 KRW, Students 3,000 KRW',
  '02-741-8373',
  'http://www.arumjigi.org'
);
END $;

-- ========================================
-- 70번: 대림미술관 - 페트라 콜린스
-- ========================================
DO $
DECLARE
  v_exhibition_id UUID;
BEGIN
INSERT INTO exhibitions_master (
  venue_id, start_date, end_date, status, exhibition_type, genre,
  ticket_price_adult, ticket_price_student, is_featured, priority_order
) VALUES (
  (SELECT id FROM venues_simple WHERE name_ko = '대림미술관' LIMIT 1),
  '2025-08-29', '2025-11-30', 'ongoing', 'solo', 'photography',
  15000, 10000, true, 70
) RETURNING id INTO v_exhibition_id;

INSERT INTO exhibitions_translations (
  exhibition_id, language_code, exhibition_title, subtitle, artists, description,
  venue_name, city, address, operating_hours, ticket_info, phone_number, website_url
) VALUES (
  v_exhibition_id, 'ko', '페트라 콜린스', '드림 월드',
  ARRAY['페트라 콜린스'],
  '캐나다 출신 아티스트 페트라 콜린스의 아시아 첫 대규모 개인전. 몽환적이고 초현실적인 색감으로 현대 여성의 정체성과 욕망을 탐구하는 사진과 영상 작품들을 선보인다. Z세대 문화 아이콘으로서 새로운 시각 언어를 제시하며, 디지털 시대의 감성을 포착한다.',
  '대림미술관', '서울',
  '서울 종로구 자하문로 4길 21',
  '화-일 11:00-20:00 (월 휴관)',
  '성인 15,000원, 학생 10,000원',
  '02-720-0667',
  'http://www.daelimmuseum.org'
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code, exhibition_title, subtitle, artists, description,
  venue_name, city, address, operating_hours, ticket_info, phone_number, website_url
) VALUES (
  v_exhibition_id, 'en', 'Petra Collins', 'Dream World',
  ARRAY['Petra Collins'],
  'First large-scale Asian solo exhibition by Canadian artist Petra Collins. Presents photography and video works exploring contemporary female identity and desire with dreamy, surreal colors. As a Gen Z cultural icon, presents new visual language capturing digital era sensibility.',
  'Daelim Museum', 'Seoul',
  '21 Jahamun-ro 4-gil, Jongno-gu, Seoul',
  'Tue-Sun 11:00-20:00 (Closed Mon)',
  'Adults 15,000 KRW, Students 10,000 KRW',
  '02-720-0667',
  'http://www.daelimmuseum.org'
);
END $;

-- ========================================
-- 71번: 국립현대미술관 서울 - 올해의 작가상 2025
-- ========================================
DO $
DECLARE
  v_exhibition_id UUID;
BEGIN
INSERT INTO exhibitions_master (
  venue_id, start_date, end_date, status, exhibition_type, genre,
  ticket_price_adult, ticket_price_student, is_featured, priority_order
) VALUES (
  (SELECT id FROM venues_simple WHERE name_ko = '국립현대미술관 서울' LIMIT 1),
  '2025-08-29', '2026-02-01', 'ongoing', 'group', 'contemporary',
  4000, 2000, true, 71
) RETURNING id INTO v_exhibition_id;

INSERT INTO exhibitions_translations (
  exhibition_id, language_code, exhibition_title, subtitle, artists, description,
  venue_name, city, address, operating_hours, ticket_info, phone_number, website_url
) VALUES (
  v_exhibition_id, 'ko', '올해의 작가상 2025', '비가시적 세계의 재현',
  ARRAY['김영은', '임영주', '김지평', '언메이크랩'],
  '국립현대미술관과 SBS문화재단이 2012년부터 공동으로 주최해 온 대표적인 현대미술 작가 후원 프로그램. 김영은은 소리와 청취를 정치적이고 역사적인 산물로 바라보는 작업을, 임영주는 전통과 동양화의 재해석을, 김지평은 한국 사회의 미신과 종교적 믿음을 탐구하며, 언메이크랩은 기술과 인간의 관계를 조명한다. 비가시적인 세계를 드러내는 재현의 역학을 파헤치며 세계를 인식하는 방식에 의문을 던진다.',
  '국립현대미술관 서울', '서울',
  '서울 종로구 삼청로 30',
  '화수목일 10:00-18:00, 금토 10:00-21:00 (월 휴관)',
  '성인 4,000원, 학생 2,000원',
  '02-3701-9500',
  'https://www.mmca.go.kr'
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code, exhibition_title, subtitle, artists, description,
  venue_name, city, address, operating_hours, ticket_info, phone_number, website_url
) VALUES (
  v_exhibition_id, 'en', 'Korea Artist Prize 2025', 'Representation of the Invisible World',
  ARRAY['Kim Young-eun', 'Lim Young-ju', 'Kim Ji-pyung', 'Unmake Lab'],
  'A leading contemporary art support program and award system jointly hosted by MMCA and SBS Cultural Foundation since 2012. Kim Young-eun presents work viewing sound and listening as political and historical products, Lim Young-ju reinterprets tradition and Oriental painting, Kim Ji-pyung explores superstition and religious beliefs in Korean society, and Unmake Lab illuminates the relationship between technology and humans. They uncover the dynamics of representation revealing invisible worlds and question how we perceive the world.',
  'MMCA Seoul', 'Seoul',
  '30 Samcheong-ro, Jongno-gu, Seoul',
  'Tue-Thu,Sun 10:00-18:00, Fri-Sat 10:00-21:00 (Closed Mon)',
  'Adults 4,000 KRW, Students 2,000 KRW',
  '02-3701-9500',
  'https://www.mmca.go.kr'
);
END $;

-- ========================================
-- 성공 메시지
-- ========================================
DO $$
BEGIN
  RAISE NOTICE '✅ 전시 #60-71 추가 완료!';
  RAISE NOTICE '📊 총 12개 전시 데이터 삽입';
  RAISE NOTICE '🎨 국립현대미술관 올해의 작가상 2025 포함';
END $$;