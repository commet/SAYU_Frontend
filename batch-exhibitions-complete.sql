-- 🎨 SAYU 전시 데이터 완전 업데이트 SQL
-- 실행일: 2025-08-31
-- 전시 목록: 총 31개 전시 (스키마 구조 준수)

-- ========================================
-- VENUES_SIMPLE 테이블 데이터
-- ========================================
-- ON CONFLICT DO NOTHING으로 중복 시 무시
INSERT INTO venues_simple (name_ko, name_en, city, district, venue_type, is_major, priority_order) VALUES
('케이옥션', 'K Auction', '서울', '강남구', 'auction', false, 50),
('상업화랑 을지로', 'Sangup Gallery Euljiro', '서울', '중구', 'gallery', false, 55),
('눈 컨템포러리', 'Noon Contemporary', '서울', '종로구', 'gallery', false, 60),
('링크서울', 'Link Seoul', '서울', '성동구', 'gallery', false, 60),
('스페이스 카다로그', 'Space Catalog', '서울', '종로구', 'gallery', false, 60),
('코소', 'Koso', '서울', '용산구', 'gallery', false, 60),
('모두미술공간', 'Modu Art Space', '서울', '서대문구', 'alternative', false, 65),
('성곡미술관', 'Sungkok Art Museum', '서울', '종로구', 'museum', true, 25),
('가나아트센터', 'Gana Art Center', '서울', '종로구', 'art_center', true, 30),
('가나아트 한남', 'Gana Art Hannam', '서울', '용산구', 'gallery', false, 45),
('스페이스 수퍼노말', 'Space Supernormal', '서울', '마포구', 'alternative', false, 65),
('DDP', 'DDP', '서울', '중구', 'art_center', true, 20),
('갤러리조선', 'Gallery Chosun', '서울', '종로구', 'gallery', false, 50),
('국립현대미술관 서울', 'MMCA Seoul', '서울', '종로구', 'museum', true, 10),
('송은', 'SongEun', '서울', '강남구', 'art_center', true, 35),
('환기미술관', 'Whanki Museum', '서울', '종로구', 'museum', true, 30),
('일민미술관', 'Ilmin Museum of Art', '서울', '종로구', 'museum', true, 30),
('페로탕 서울', 'Perrotin Seoul', '서울', '강남구', 'gallery', true, 40),
('서울시립미술관', 'Seoul Museum of Art', '서울', '중구', 'museum', true, 15),
('아르코미술관', 'ARKO Art Center', '서울', '종로구', 'art_center', true, 35),
('PS CENTER', 'PS CENTER', '서울', '강남구', 'gallery', false, 55),
('서울공예박물관', 'Seoul Museum of Craft Art', '서울', '종로구', 'museum', true, 30),
('갤러리현대', 'Gallery Hyundai', '서울', '종로구', 'gallery', true, 35),
('백아트', 'Baik Art', '서울', '종로구', 'gallery', false, 50),
('리만머핀 서울', 'Lehmann Maupin Seoul', '서울', '용산구', 'gallery', true, 40),
('스페이스776', 'SPACE776', '서울', '강남구', 'gallery', false, 55),
('G Gallery', 'G Gallery', '서울', '강남구', 'gallery', false, 60),
('뮤지엄멋', 'Museum Mot', '서울', '중구', 'gallery', false, 60),
('프로젝트 스페이스 사루비아', 'Project Space SARUBIA', '서울', '종로구', 'alternative', false, 65),
('호리아트스페이스', 'Hori Art Space', '서울', '종로구', 'gallery', false, 60),
('갤러리제이원 서울', 'Gallery J1 Seoul', '서울', '종로구', 'gallery', false, 55),
('상업화랑', 'Sahng-up Gallery', '서울', '중구', 'gallery', false, 50),
('갤러리조은', 'Gallery Joeun', '서울', '용산구', 'gallery', false, 55),
('리안갤러리 서울', 'LEEAHN Gallery Seoul', '서울', '종로구', 'gallery', false, 50),
('갤러리 나우', 'Gallery NoW', '서울', '강남구', 'gallery', false, 60),
('갤러리 키체', 'Gallery Kiche', '서울', '성북구', 'gallery', false, 60),
('누크갤러리', 'nook gallery', '서울', '종로구', 'gallery', false, 60),
('토탈미술관', 'Total Museum', '서울', '종로구', 'museum', false, 45)
ON CONFLICT (name_ko) DO NOTHING;

-- ========================================
-- 1. DDP - 스펙트럴 크로싱스
-- ========================================

INSERT INTO exhibitions_master (
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student,
  genre, exhibition_type,
  created_at, updated_at
) VALUES (
  '2025-08-14', '2025-11-16', 'ongoing',
  0, 0,
  'media', 'group',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists, description,
  venue_name, city,
  operating_hours, ticket_info,
  phone_number, address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-14' AND end_date = '2025-11-16' ORDER BY created_at DESC LIMIT 1),
  'ko',
  '스펙트럴 크로싱스',
  ARRAY['더 스웨이(THE SWAY)'],
  'AI가 만든 얼굴과 형체 없는 감정의 흐름이 빛을 따라 움직이며 관객과 교차해 만나는 순간을 담아낸 미디어아트 전시. 144개의 크리스탈과 아나몰픽 미디어아트를 통해 감정의 빛이 현실 공간에 물리적으로 드러나는 몰입형 설치작품이다.',
  'DDP', '서울',
  '10:00~20:00',
  '무료',
  '02-2153-0086',
  'DDP 디자인랩 3층'
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title, artists,
  description,
  venue_name, city,
  operating_hours, ticket_info
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-14' AND end_date = '2025-11-16' ORDER BY created_at DESC LIMIT 1),
  'en',
  'Spectral Crossings',
  ARRAY['THE SWAY'],
  'An immersive media art exhibition where AI-generated faces and formless emotional flows move along with light, creating moments of intersection with viewers.',
  'DDP', 'Seoul',
  '10:00~20:00',
  'Free'
);

-- ========================================
-- 2. 갤러리조선 - 파편의 흐름
-- ========================================

INSERT INTO exhibitions_master (
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student,
  genre, exhibition_type,
  created_at, updated_at
) VALUES (
  '2025-08-16', '2025-10-26', 'upcoming',
  0, 0,
  'contemporary', 'solo',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title, subtitle,
  artists,
  description,
  venue_name, city,
  operating_hours, ticket_info,
  phone_number, address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-16' AND end_date = '2025-10-26' ORDER BY created_at DESC LIMIT 1),
  'ko',
  '파편의 흐름', 'Flow of Debris',
  ARRAY['민성홍'],
  '《파편의 흐름》은 정지하지 못한 채 이동하는 것, 혹은 흘러가다 이내 쌓여버린 것들에 관해 이야기한다. 작가 민성홍은 사회적 제도나 시스템에 의해 개인이 통제할 수 없는 환경적 변화 앞에서 감각되는 불안과 그 정동이 서려있는 사물에 집중한다.',
  '갤러리조선', '서울',
  '화-일 10:30~18:30',
  '무료',
  '02-723-7133',
  '서울시 종로구 북촌로5길 64'
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  operating_hours, ticket_info
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-16' AND end_date = '2025-10-26' ORDER BY created_at DESC LIMIT 1),
  'en',
  'Flow of Debris',
  ARRAY['Min Sunghong'],
  '《Flow of Debris》 explores things that move without stopping, or things that flow and eventually accumulate.',
  'Gallery Chosun', 'Seoul',
  'Tue-Sun 10:30~18:30',
  'Free'
);

-- ========================================
-- 3. 국립현대미술관 서울 - 김창열
-- ========================================

INSERT INTO exhibitions_master (
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student,
  genre, exhibition_type,
  created_at, updated_at
) VALUES (
  '2025-08-22', '2025-12-21', 'upcoming',
  2000, 1000,
  'contemporary', 'solo',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  operating_hours, ticket_info,
  address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-22' AND end_date = '2025-12-21' ORDER BY created_at DESC LIMIT 1),
  'ko',
  '김창열',
  ARRAY['김창열'],
  '작가 작고 이후 작품세계를 총망라하여 재조명하는 회고전. 전시는 물방울의 시각적 아름다움 이면에 자리한 상흔의 기억과 근원적 미의식에 주목한다.',
  '국립현대미술관 서울', '서울',
  '월,화,목,금,일 10:00~18:00 / 수,토 10:00~21:00',
  '2,000원',
  '서울 지하1층 6, 7 전시실 / 2층, 8전시실'
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  ticket_info
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-22' AND end_date = '2025-12-21' ORDER BY created_at DESC LIMIT 1),
  'en',
  'Kim Tschang-Yeul',
  ARRAY['Kim Tschang-Yeul'],
  'A retrospective exhibition comprehensively re-examining the artist''s oeuvre after his passing.',
  'MMCA Seoul', 'Seoul',
  '2,000 won'
);

-- ========================================
-- 4. 송은 - 파노라마
-- ========================================

INSERT INTO exhibitions_master (
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student,
  genre, exhibition_type,
  created_at, updated_at
) VALUES (
  '2025-08-22', '2025-10-16', 'ongoing',
  0, 0,
  'contemporary', 'group',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  operating_hours, ticket_info,
  phone_number, address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-22' AND end_date = '2025-10-16' ORDER BY created_at DESC LIMIT 1),
  'ko',
  '파노라마',
  ARRAY['권병준', '김민애', '박민하', '이끼바위쿠르르', '이주요', '최고은', '한선우', '아프로아시아 컬렉티브(최원준, 문선아)'],
  '(재)예술경영지원센터의 ''한국작가 해외집중 프로모션'' 사업의 일환으로 동시대 미술 실천을 확장해온 작가들을 형식과 내용의 제한 없이 선정해 해외 프로모션의 출발점으로 삼는 전시.',
  '송은', '서울',
  '월-토 11:00~18:30 (일요일, 공휴일 휴관)',
  '무료',
  '02-3448-0100',
  '서울 강남구 도산대로 441'
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  operating_hours, ticket_info
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-22' AND end_date = '2025-10-16' ORDER BY created_at DESC LIMIT 1),
  'en',
  'PANORAMA',
  ARRAY['Byungjun Kwon', 'Minae Kim', 'Minha Park', 'ikkibawiKrrr', 'Jewyo Rhii', 'Goen Choi', 'Sun Woo', 'AfroAsia Collective'],
  'An exhibition showcasing eight artists and collectives whose practices expand the possibilities of contemporary art.',
  'SONGEUN', 'Seoul',
  'Mon-Sat 11:00~18:30 (Closed on Sundays and Holidays)',
  'Free'
);

-- ========================================
-- 5. 환기미술관 - 김환기와 브라질
-- ========================================

INSERT INTO exhibitions_master (
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student,
  genre, exhibition_type,
  created_at, updated_at
) VALUES (
  '2025-08-22', '2025-12-31', 'upcoming',
  18000, 9000,
  'painting', 'solo',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title, subtitle,
  artists,
  description,
  venue_name, city,
  ticket_info,
  address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-22' AND end_date = '2025-12-31' ORDER BY created_at DESC LIMIT 1),
  'ko',
  '김환기와 브라질_새로운 우리의 노래로...', 'Whanki in Brazil, Where a New Song Begins...',
  ARRAY['김환기'],
  '2025년 여름, 김환기 뉴욕 시기에 ''특별한 제자''로 인연을 맺고 이후 부인 김향안과 오랜 우정을 이어온 이베트 모레노가 소장했던 작품 한 점이 브라질 리우데자네이루로부터 환기미술관으로 돌아왔다.',
  '환기미술관', '서울',
  '일반(성인) 18,000원 / 경로 9,000원 / 청소년 9,000원',
  '환기미술관 수향산방'
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  ticket_info
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-22' AND end_date = '2025-12-31' ORDER BY created_at DESC LIMIT 1),
  'en',
  'Whanki in Brazil, Where a New Song Begins...',
  ARRAY['Kim Whanki'],
  'In summer 2025, a work once owned by Yvette Moreno, Kim Whanki''s ''special student'' during his New York period, returned to Whanki Museum from Rio de Janeiro, Brazil.',
  'Whanki Museum', 'Seoul',
  'Adult 18,000 won / Senior 9,000 won / Youth 9,000 won'
);

-- ========================================
-- 6. DDP - 헤리티지: 더 퓨처 판타지
-- ========================================

INSERT INTO exhibitions_master (
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student,
  genre, exhibition_type,
  created_at, updated_at
) VALUES (
  '2025-08-23', '2025-09-17', 'ongoing',
  0, 0,
  'media', 'group',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  description,
  venue_name, city,
  operating_hours, ticket_info,
  address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-23' AND end_date = '2025-09-17' ORDER BY created_at DESC LIMIT 1),
  'ko',
  '헤리티지: 더 퓨처 판타지',
  '디지털 콘텐츠의 원형이 되는 유형 유산과 한국 고유의 미감을 탐구한 현대 작가들의 예술작품이 어우러져 이제까지 접해보지 못했던 새로운 형태의 몰입형 경험을 체험하는 전시.',
  'DDP', '서울',
  '10:00~20:00 (입장마감 19:00) / 월요일 휴관',
  '무료',
  '뮤지엄 전시2관 및 디자인둘레길B'
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  description,
  venue_name, city,
  operating_hours, ticket_info
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-23' AND end_date = '2025-09-17' ORDER BY created_at DESC LIMIT 1),
  'en',
  'Heritage: The Future Fantasy',
  'An exhibition where tangible heritage serving as the prototype for digital content meets contemporary artists'' works exploring Korea''s unique aesthetic sensibility.',
  'DDP', 'Seoul',
  '10:00~20:00 (Last entry 19:00) / Closed on Mondays',
  'Free'
);

-- ========================================
-- 7. 일민미술관 - 형상 회로
-- ========================================

INSERT INTO exhibitions_master (
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student,
  genre, exhibition_type,
  created_at, updated_at
) VALUES (
  '2025-08-22', '2025-10-26', 'ongoing',
  9000, 7000,
  'contemporary', 'group',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  operating_hours, ticket_info,
  phone_number
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-22' AND end_date = '2025-10-26' ORDER BY created_at DESC LIMIT 1),
  'ko',
  '형상 회로',
  ARRAY['공성훈', '곽정명', '김시은', '김현진', '마르쿠스 뤼페르츠', '게오르그 바젤리츠', '박광수', '박장년', '변종곤', '심현빈', '이승택', '이제', '정강자', '정석희', '나디아 지와', '한운성', '호상근'],
  '오늘날 현실이 이미지의 결과가 아니라 이미지가 현실의 결과가 된 세계에서, ''형상 충동''은 현실에 직접적인 충격을 가하려는 예술적 시도다.',
  '일민미술관', '서울',
  '화-일 11:00~19:00 (매주 월요일 및 추석 당일 휴관)',
  '일반 9,000원 / 학생 7,000원',
  '02-2020-2050'
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  ticket_info
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-22' AND end_date = '2025-10-26' ORDER BY created_at DESC LIMIT 1),
  'en',
  'Figuration Circuits',
  ARRAY['Kong Sung Hun', 'Kwack Jung-myung', 'Kim Seeun', 'Kim Hyunjin', 'Markus Lüpertz', 'Georg Baselitz', 'Park Gwangsoo', 'Park Jang Nyun', 'Byun Chong Gon', 'Shim Hyeonbeen', 'Lee Seung-taek', 'Leeje', 'Jung Kangja', 'Jung Seokhee', 'Nadya Jiwa', 'Han Unsung', 'Ho Sangun'],
  'In today''s world, where reality has become the result of images rather than images the result of reality, the ''figurative impulse'' is an artistic attempt to deliver a direct impact on reality.',
  'Ilmin Museum of Art', 'Seoul',
  'General 9,000 won / Student 7,000 won'
);

-- ========================================
-- 8. 페로탕 - 이즈미 카토
-- ========================================

INSERT INTO exhibitions_master (
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student,
  genre, exhibition_type,
  created_at, updated_at
) VALUES (
  '2025-08-26', '2025-10-25', 'ongoing',
  0, 0,
  'contemporary', 'solo',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  operating_hours, ticket_info,
  phone_number, address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-26' AND end_date = '2025-10-25' ORDER BY created_at DESC LIMIT 1),
  'ko',
  '이즈미 카토 개인전',
  ARRAY['이즈미 카토'],
  '페로탕 서울은 일본 현대미술 작가 이즈미 카토의 개인전을 개최한다. 이번 전시는 2018년 페로탕 서울에서 열린 첫 개인전에 이어 두 번째로 선보이는 개인전이다.',
  '페로탕 서울', '서울',
  '화-토 10:00~18:00',
  '무료',
  '02-545-7978',
  '서울 강남구 도산대로 45길 10'
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  operating_hours, ticket_info
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-26' AND end_date = '2025-10-25' ORDER BY created_at DESC LIMIT 1),
  'en',
  'Izumi KATO solo show',
  ARRAY['Izumi Kato'],
  'Perrotin Seoul presents a solo exhibition by Japanese contemporary artist Izumi Kato, marking his second solo show at the gallery following his first in 2018.',
  'Perrotin Seoul', 'Seoul',
  'Tue-Sat 10:00~18:00',
  'Free'
);

-- ========================================
-- 9. 서울미디어시티비엔날레
-- ========================================

INSERT INTO exhibitions_master (
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student,
  genre, exhibition_type,
  created_at, updated_at
) VALUES (
  '2025-08-26', '2025-11-23', 'ongoing',
  0, 0,
  'media', 'group',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  description,
  venue_name, city,
  operating_hours, ticket_info,
  phone_number, address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-26' AND end_date = '2025-11-23' ORDER BY created_at DESC LIMIT 1),
  'ko',
  '제13회 서울미디어시티비엔날레 《강령: 영혼의 기술》',
  '오컬트, 신비주의, 영적 전통에서 영감을 받은 세계 각지의 예술가들의 커미션 신작, 재제작 및 기존 작품을 다양하게 선보인다.',
  '서울시립미술관 외 3곳', '서울',
  '평일(화-금) 10:00~20:00 / 토·일·공휴일 10:00~19:00 / 매주 금요일 10:00~21:00',
  '무료',
  '02-2124-8800',
  '서울시립미술관 서소문본관, 낙원상가, 시네마테크 서울아트시네마, 청년예술청'
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  description,
  venue_name, city,
  ticket_info
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-26' AND end_date = '2025-11-23' ORDER BY created_at DESC LIMIT 1),
  'en',
  '13th Seoul Mediacity Biennale: Spell: Technology of the Spirit',
  'The biennale presents commissioned new works, reproductions, and existing works by artists from around the world inspired by occult, mysticism, and spiritual traditions.',
  'Seoul Museum of Art and 3 other venues', 'Seoul',
  'Free'
);

-- ========================================
-- 10. 아르코미술관 - 아르코데이
-- ========================================

INSERT INTO exhibitions_master (
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student,
  genre, exhibition_type,
  created_at, updated_at
) VALUES (
  '2025-08-26', '2025-11-16', 'ongoing',
  0, 0,
  'contemporary', 'group',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  ticket_info
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-26' AND end_date = '2025-11-16' ORDER BY created_at DESC LIMIT 1),
  'ko',
  '2025 아르코데이 《긴 꼬리》',
  ARRAY['이정', '이해반', '이호수', '전다화', 'Kaliens(박민정&안예윤)', 'Sulme&Jae-Nder Fluid(강예슬미&백재화)'],
  '2025 아르코데이는 낯설고 어색한 네트워킹의 순간들을 새로운 시선으로 바라보는 퍼포먼스형 파티를 포함한 전시다.',
  '아르코미술관', '서울',
  '무료'
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  ticket_info
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-26' AND end_date = '2025-11-16' ORDER BY created_at DESC LIMIT 1),
  'en',
  '2025 ARKO DAY: The Long Tail',
  ARRAY['Lee Jung', 'Lee Haeban', 'Lee Hosu', 'Jeon Dahwa', 'Kaliens', 'Sulme&Jae-Nder Fluid'],
  '2025 ARKO DAY presents a performance-style party that views unfamiliar and awkward networking moments from a new perspective.',
  'ARKO Art Center', 'Seoul',
  'Free'
);

-- ========================================
-- 11. PS CENTER - March to March
-- ========================================

INSERT INTO exhibitions_master (
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student,
  genre, exhibition_type,
  created_at, updated_at
) VALUES (
  '2025-08-26', '2025-09-13', 'ongoing',
  0, 0,
  'contemporary', 'solo',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  operating_hours, ticket_info,
  address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-26' AND end_date = '2025-09-13' ORDER BY created_at DESC LIMIT 1),
  'ko',
  'March to March',
  ARRAY['나래쉬 쿠마르'],
  '《March to March》는 반복, 의식, 그리고 연결되어 있으면서도 갈등하는 세계의 긴장에 대한 송가이다.',
  'PS CENTER', '서울',
  '11:00~18:00 (일요일, 월요일, 공휴일 휴무)',
  '무료',
  '서울 중구 창경궁로5다길 18, 3층'
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  operating_hours, ticket_info
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-26' AND end_date = '2025-09-13' ORDER BY created_at DESC LIMIT 1),
  'en',
  'March to March',
  ARRAY['Naresh Kumar'],
  'March to March is an ode to repetition, ritual, and the tensions of a connected yet conflicted world.',
  'PS CENTER', 'Seoul',
  '11:00~18:00 (Closed on Sundays, Mondays, and Holidays)',
  'Free'
);

-- ========================================
-- 12. 서울공예박물관 - 집, 옷을 입다
-- ========================================

INSERT INTO exhibitions_master (
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student,
  genre, exhibition_type,
  created_at, updated_at
) VALUES (
  '2025-08-26', '2025-10-19', 'ongoing',
  0, 0,
  'craft', 'group',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  description,
  venue_name, city,
  operating_hours, ticket_info,
  phone_number, address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-26' AND end_date = '2025-10-19' ORDER BY created_at DESC LIMIT 1),
  'ko',
  '집, 옷을 입다',
  '서울공예박물관과 폴란드 아담 미츠키에비츠 문화원이 함께하는 전시로, 양국의 전통 섬유문화를 통해 계절의 감각과 삶의 지혜를 되돌아본다.',
  '서울공예박물관', '서울',
  '10:00~18:00 (금요일 21:00까지) / 매주 월요일 휴관',
  '무료',
  '02-6450-7000',
  '서울특별시 종로구 율곡로 3길 4(안국동) 전시1동 1층 및 안내동'
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  description,
  venue_name, city,
  ticket_info
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-26' AND end_date = '2025-10-19' ORDER BY created_at DESC LIMIT 1),
  'en',
  'Home, Dressed in Cloth',
  'A collaborative exhibition between Seoul Museum of Craft Art and Adam Mickiewicz Institute Poland, exploring seasonal senses and life wisdom through traditional textile cultures of both nations.',
  'Seoul Museum of Craft Art', 'Seoul',
  'Free'
);

-- ========================================
-- 13. 서울공예박물관 - 물질-실천
-- ========================================

INSERT INTO exhibitions_master (
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student,
  genre, exhibition_type,
  created_at, updated_at
) VALUES (
  '2025-08-26', '2025-11-23', 'ongoing',
  0, 0,
  'craft', 'group',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  description,
  venue_name, city,
  operating_hours, ticket_info,
  phone_number, address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-26' AND end_date = '2025-11-23' AND genre = 'craft' ORDER BY created_at DESC LIMIT 1),
  'ko',
  '물질-실천',
  '현대공예 전시로 도자, 금속, 섬유, 가죽과 털 등 다양한 재료를 활용한 작품들을 선보인다.',
  '서울공예박물관', '서울',
  '10:00~18:00 (금요일 21:00까지) / 매주 월요일 휴관',
  '무료',
  '02-6450-7000',
  '서울특별시 종로구 율곡로 3길 4(안국동) 전시1동 3층 기획전시실'
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  description,
  venue_name, city,
  ticket_info
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-26' AND end_date = '2025-11-23' AND genre = 'craft' ORDER BY created_at DESC LIMIT 1),
  'en',
  'Material-Practice',
  'A contemporary craft exhibition showcasing works utilizing various materials including ceramics, metal, textiles, leather and fur.',
  'Seoul Museum of Craft Art', 'Seoul',
  'Free'
);

-- ========================================
-- 14. 갤러리현대 - 김민정
-- ========================================

INSERT INTO exhibitions_master (
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student,
  genre, exhibition_type,
  created_at, updated_at
) VALUES (
  '2025-08-27', '2025-10-19', 'ongoing',
  0, 0,
  'contemporary', 'solo',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title, subtitle,
  artists,
  description,
  venue_name, city,
  ticket_info,
  address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-27' AND end_date = '2025-10-19' ORDER BY created_at DESC LIMIT 1),
  'ko',
  '김민정: One after the Other', 'One after the Other',
  ARRAY['김민정'],
  '김민정은 동아시아의 서예와 수묵화 전통 그리고 동양 철학을 탐구하며 현대 추상화의 구성 어휘를 확장하는 작업을 30여 년 동안 지속해 오고 있다.',
  '갤러리현대', '서울',
  '무료',
  '갤러리현대 신관'
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  ticket_info
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-27' AND end_date = '2025-10-19' ORDER BY created_at DESC LIMIT 1),
  'en',
  'Minjung Kim: One after the Other',
  ARRAY['Minjung Kim'],
  'For over thirty years, Minjung Kim has explored the traditions of East Asian calligraphy and ink painting alongside Eastern philosophy.',
  'Gallery Hyundai', 'Seoul',
  'Free'
);

-- ========================================
-- 15. 백아트 - 성능경
-- ========================================

INSERT INTO exhibitions_master (
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student,
  genre, exhibition_type,
  created_at, updated_at
) VALUES (
  '2025-08-27', '2025-10-18', 'ongoing',
  0, 0,
  'contemporary', 'solo',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title, subtitle,
  artists,
  description,
  venue_name, city,
  ticket_info,
  phone_number, address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-27' AND end_date = '2025-10-18' ORDER BY created_at DESC LIMIT 1),
  'ko',
  '성능경: 쌩~휙!', 'As If Nothing… The Artistic Meandering of Sung Neung Kyung',
  ARRAY['성능경'],
  '이번 전시는 1980년대 초창기 작업부터 2025년 신작까지, 작가의 50여 년간 실험을 집대성한 자리다.',
  '백아트', '서울',
  '무료',
  '010-2174-2598',
  '서울 종로구 율곡로 3길 74-13'
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  ticket_info
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-27' AND end_date = '2025-10-18' ORDER BY created_at DESC LIMIT 1),
  'en',
  'Sung Neung Kyung: As If Nothing…',
  ARRAY['Sung Neung Kyung'],
  'This exhibition encompasses approximately 80 works from the early 1980s to new pieces from 2025, spanning the artist''s 50-year experimental practice.',
  'Baik Art', 'Seoul',
  'Free'
);

-- ========================================
-- 16. 갤러리현대 - 이강승, 캔디스 린
-- ========================================

INSERT INTO exhibitions_master (
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student,
  genre, exhibition_type,
  created_at, updated_at
) VALUES (
  '2025-08-27', '2025-10-05', 'ongoing',
  0, 0,
  'contemporary', 'group',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title, subtitle,
  artists,
  description,
  venue_name, city,
  ticket_info,
  address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-27' AND end_date = '2025-10-05' ORDER BY created_at DESC LIMIT 1),
  'ko',
  '나 아닌, 내가 아닌, 나를 통해 부는 바람', 'Not I, not I, but the wind that blows through me',
  ARRAY['이강승', '캔디스 린'],
  '이강승과 캔디스 린은 서로 다른 문화적 배경과 조형 언어를 바탕으로 사회적 제도에 의해 배제되거나 역사 속에서 지워지고 잊힌 인물과 공동체, 그리고 그들의 서사를 지속적으로 조명해 왔다.',
  '갤러리현대', '서울',
  '무료',
  '서울 삼청로 8 (본관)'
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  ticket_info
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-27' AND end_date = '2025-10-05' ORDER BY created_at DESC LIMIT 1),
  'en',
  'Not I, not I, but the wind that blows through me',
  ARRAY['Kang Seung Lee', 'Candice Lin'],
  'Building upon distinct cultural backgrounds and formal languages, Kang Seung Lee and Candice Lin shed light on marginalized or erased histories.',
  'Gallery Hyundai', 'Seoul',
  'Free'
);

-- ========================================
-- 17. 리만머핀 - 테레시타 페르난데스
-- ========================================

INSERT INTO exhibitions_master (
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student,
  genre, exhibition_type,
  created_at, updated_at
) VALUES (
  '2025-08-27', '2025-10-25', 'ongoing',
  0, 0,
  'contemporary', 'solo',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  ticket_info,
  phone_number, address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-27' AND end_date = '2025-10-25' ORDER BY created_at DESC LIMIT 1),
  'ko',
  '지층의 바다',
  ARRAY['테레시타 페르난데스'],
  '페르난데스는 지난 30년 이상 풍경에 내재된 복잡성과 역설을 지속적으로 탐구해 왔다.',
  '리만머핀 서울', '서울',
  '무료',
  '02-725-0094',
  '서울 용산구 이태원로 213'
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  ticket_info
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-27' AND end_date = '2025-10-25' ORDER BY created_at DESC LIMIT 1),
  'en',
  'Stratigraphic Sea',
  ARRAY['Teresita Fernández'],
  'For over 30 years, Fernández has continuously explored the complexities and paradoxes inherent in landscapes.',
  'Lehmann Maupin Seoul', 'Seoul',
  'Free'
);

-- ========================================
-- 18. 스페이스776 - Pop reconstructed Seoul to NY
-- ========================================

INSERT INTO exhibitions_master (
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student,
  genre, exhibition_type,
  created_at, updated_at
) VALUES (
  '2025-08-28', '2025-09-28', 'ongoing',
  0, 0,
  'contemporary', 'group',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  operating_hours, ticket_info,
  address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-28' AND end_date = '2025-09-28' ORDER BY created_at DESC LIMIT 1),
  'ko',
  'Pop reconstructed Seoul to NY',
  ARRAY['조영남', '조조 아나빔'],
  '한국 대중문화의 아이콘을 회화로 재해석해온 조영남과 현대 소비문화와 브랜드 이미지를 예술 언어로 전환하는 조조 아나빔의 2인전.',
  '스페이스776', '서울',
  '수-일 12:00-18:00',
  '무료',
  '서울 강남구 압구정로79길 62, 1층'
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  operating_hours, ticket_info
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-28' AND end_date = '2025-09-28' ORDER BY created_at DESC LIMIT 1),
  'en',
  'Pop reconstructed Seoul to NY',
  ARRAY['Youngnam Cho', 'Jojo Anavim'],
  'A duo exhibition bringing together Cho Youngnam and Jojo Anavim, who transform contemporary consumer culture and brand imagery into artistic language.',
  'SPACE776', 'Seoul',
  'Wed-Sun 12:00-18:00',
  'Free'
);

-- ========================================
-- 19. G Gallery - POOMSAE 품새
-- ========================================

INSERT INTO exhibitions_master (
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student,
  genre, exhibition_type,
  created_at, updated_at
) VALUES (
  '2025-08-27', '2025-09-27', 'ongoing',
  0, 0,
  'contemporary', 'solo',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  operating_hours, ticket_info,
  phone_number, address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-27' AND end_date = '2025-09-27' ORDER BY created_at DESC LIMIT 1),
  'ko',
  'POOMSAE 품새',
  ARRAY['우한나'],
  '《POOMSAE 품새》는 작가 우한나가 생애적 전환의 과정에서 만든 작품들로 구성되었으며, 그 과정에서 겪은 치열하고 처연하지만 의연한 생애의 아름다운 순간을 담고 있다.',
  'G Gallery', '서울',
  '월-토 10:00-18:00',
  '무료',
  '02-790-4921',
  '서울 강남구 삼성로 748 지하 1층'
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  operating_hours, ticket_info
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-27' AND end_date = '2025-09-27' ORDER BY created_at DESC LIMIT 1),
  'en',
  'POOMSAE',
  ARRAY['Woo Hannah'],
  'POOMSAE brings together works created by Woo Hannah during a transformative period, embodying intense, sorrowful, yet dignified and beautiful moments of life.',
  'G Gallery', 'Seoul',
  'Mon-Sat 10:00-18:00',
  'Free'
);

-- ========================================
-- 20. 뮤지엄멋 - 물, 쌀, 풀
-- ========================================

INSERT INTO exhibitions_master (
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student,
  genre, exhibition_type,
  created_at, updated_at
) VALUES (
  '2025-08-27', '2025-09-28', 'ongoing',
  0, 0,
  'contemporary', 'group',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  operating_hours, ticket_info,
  address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-27' AND end_date = '2025-09-28' AND genre = 'contemporary' ORDER BY created_at DESC LIMIT 1),
  'ko',
  '물, 쌀, 풀',
  ARRAY['서다솜', '금벌레', '임상완'],
  '《물, 쌀, 풀》은 교류와 환대의 매개가 되는 방식을 보여준다.',
  '뮤지엄멋', '서울',
  '12:00-20:00 (월요일 휴무)',
  '무료',
  '서울 중구 퇴계로 411'
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  operating_hours, ticket_info
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-27' AND end_date = '2025-09-28' AND genre = 'contemporary' ORDER BY created_at DESC LIMIT 1),
  'en',
  'Water, Rice, Grass',
  ARRAY['Seo Dasom', 'Geumbeolle', 'Lim Sangwan'],
  'The exhibition demonstrates how water, rice, and grass become mediums of exchange and hospitality.',
  'Museum Mot', 'Seoul',
  '12:00-20:00 (Closed Mondays)',
  'Free'
);

-- ========================================
-- 21. 코소 - 페이퍼 스트릿
-- ========================================

INSERT INTO exhibitions_master (
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student,
  genre, exhibition_type,
  created_at, updated_at
) VALUES (
  '2025-08-27', '2025-09-14', 'ongoing',
  0, 0,
  'contemporary', 'solo',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  operating_hours, ticket_info,
  address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-27' AND end_date = '2025-09-14' ORDER BY created_at DESC LIMIT 1),
  'ko',
  '페이퍼 스트릿',
  ARRAY['김연홍'],
  '김연홍은 투명한 중첩과 우연한 연결을 통해 풍경의 조각들을 연결하고 보이지 않는 길을 화면에 펼쳐낸다.',
  '코소', '서울',
  '13:00-19:00 (월, 화 휴무)',
  '무료',
  '서울시 중구 창경궁로5길 32, 3층'
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  operating_hours, ticket_info
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-27' AND end_date = '2025-09-14' ORDER BY created_at DESC LIMIT 1),
  'en',
  'Paper Street',
  ARRAY['Kim Yeonhong'],
  'Kim Yeonhong connects fragments of landscapes through transparent overlaps and accidental connections.',
  'COSO', 'Seoul',
  '13:00-19:00 (Closed Mon, Tue)',
  'Free'
);

-- ========================================
-- 22. 프로젝트 스페이스 사루비아 - Noir
-- ========================================

INSERT INTO exhibitions_master (
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student,
  genre, exhibition_type,
  created_at, updated_at
) VALUES (
  '2025-08-27', '2025-09-26', 'ongoing',
  0, 0,
  'contemporary', 'solo',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  operating_hours, ticket_info,
  address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-27' AND end_date = '2025-09-26' ORDER BY created_at DESC LIMIT 1),
  'ko',
  'Noir',
  ARRAY['김상소'],
  '《누아르》는 형용사처럼 부유하는 이미지들이, 보임과 이해의 사이에서 어떻게 확장되고 연장될 수 있는지 탐구한다.',
  '프로젝트 스페이스 사루비아', '서울',
  '수-일 12:00-19:00 (월, 화 휴관)',
  '무료',
  '서울시 종로구 자하문로 16길 4 지하'
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  operating_hours, ticket_info
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-27' AND end_date = '2025-09-26' ORDER BY created_at DESC LIMIT 1),
  'en',
  'Noir',
  ARRAY['Sangso Kim'],
  'Noir explores how images that float like adjectives can expand and extend between visibility and understanding.',
  'Project Space SARUBIA', 'Seoul',
  'Wed-Sun 12:00-19:00 (Closed Mon, Tue)',
  'Free'
);

-- ========================================
-- 23. 호리아트스페이스 - 풍뎅이의 복화술
-- ========================================

INSERT INTO exhibitions_master (
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student,
  genre, exhibition_type,
  created_at, updated_at
) VALUES (
  '2025-08-27', '2025-09-27', 'ongoing',
  0, 0,
  'contemporary', 'solo',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  operating_hours, ticket_info,
  address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-27' AND end_date = '2025-09-27' AND genre = 'contemporary' ORDER BY created_at DESC LIMIT 1),
  'ko',
  '풍뎅이의 복화술',
  ARRAY['한의도'],
  '한의도의 작업을 설명하는 핵심 키워드는 ''자기분열(self-fragmentation)''이다.',
  '호리아트스페이스', '서울',
  '화-토 11:00-18:00',
  '무료',
  '서울시 종로구 삼청로 7길 11'
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  operating_hours, ticket_info
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-27' AND end_date = '2025-09-27' AND genre = 'contemporary' ORDER BY created_at DESC LIMIT 1),
  'en',
  'Ventriloquism of Beetle',
  ARRAY['Han Euido'],
  'The key keyword explaining Han Euido''s work is ''self-fragmentation''.',
  'Hori Art Space', 'Seoul',
  'Tue-Sat 11:00-18:00',
  'Free'
);

-- ========================================
-- 24. 갤러리제이원 서울 - 윤형재 개인전
-- ========================================

INSERT INTO exhibitions_master (
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student,
  genre, exhibition_type,
  created_at, updated_at
) VALUES (
  '2025-08-27', '2025-09-28', 'ongoing',
  0, 0,
  'contemporary', 'solo',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  operating_hours, ticket_info,
  phone_number, address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-27' AND end_date = '2025-09-28' AND genre = 'contemporary' ORDER BY created_at DESC LIMIT 1),
  'ko',
  '윤형재 개인전',
  ARRAY['윤형재'],
  '회화와 조각 작업을 통해 자연의 힘과 생명력을 탐구하는 윤형재의 개인전.',
  '갤러리제이원 서울', '서울',
  '화-토 10:00-18:00',
  '무료',
  '02-737-3638',
  '서울시 종로구 삼청로 48'
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  operating_hours, ticket_info
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-27' AND end_date = '2025-09-28' AND genre = 'contemporary' ORDER BY created_at DESC LIMIT 1),
  'en',
  'Yoon Hyung-Jae Solo Exhibition',
  ARRAY['Yoon Hyung-Jae'],
  'A solo exhibition by Yoon Hyung-Jae exploring the power and vitality of nature through painting and sculpture.',
  'Gallery J1 Seoul', 'Seoul',
  'Tue-Sat 10:00-18:00',
  'Free'
);

-- ========================================
-- 25. 상업화랑 - Poetic Forensic
-- ========================================

INSERT INTO exhibitions_master (
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student,
  genre, exhibition_type,
  created_at, updated_at
) VALUES (
  '2025-08-27', '2025-09-28', 'ongoing',
  0, 0,
  'contemporary', 'group',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  operating_hours, ticket_info,
  address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-27' AND end_date = '2025-09-28' AND genre = 'contemporary' ORDER BY created_at DESC LIMIT 1),
  'ko',
  'Poetic Forensic',
  ARRAY['정문경', '최선'],
  '시적 감수성과 분석적 접근을 결합한 작품들을 선보이는 그룹전.',
  '상업화랑', '서울',
  '화-토 10:00-18:00',
  '무료',
  '서울시 중구 을지로 11길 8'
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  operating_hours, ticket_info
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-27' AND end_date = '2025-09-28' AND genre = 'contemporary' ORDER BY created_at DESC LIMIT 1),
  'en',
  'Poetic Forensic',
  ARRAY['Jung Mun-kyung', 'Choi Sun'],
  'A group exhibition presenting works that combine poetic sensibility with analytical approaches.',
  'Sahng-up Gallery', 'Seoul',
  'Tue-Sat 10:00-18:00',
  'Free'
);

-- ========================================
-- 26. 갤러리조은 - 오세열: Since 1965
-- ========================================

INSERT INTO exhibitions_master (
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student,
  genre, exhibition_type,
  created_at, updated_at
) VALUES (
  '2025-08-27', '2025-10-05', 'ongoing',
  0, 0,
  'contemporary', 'solo',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  operating_hours, ticket_info,
  phone_number, address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-27' AND end_date = '2025-10-05' ORDER BY created_at DESC LIMIT 1),
  'ko',
  '오세열: Since 1965',
  ARRAY['오세열'],
  '1965년부터 현재까지 이어온 오세열 작가의 작품 세계를 조망하는 회고전.',
  '갤러리조은', '서울',
  '화-토 10:00-18:00',
  '무료',
  '02-543-5577',
  '서울시 용산구 회나무로 13길 8'
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  operating_hours, ticket_info
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-27' AND end_date = '2025-10-05' ORDER BY created_at DESC LIMIT 1),
  'en',
  'Oh Se-Yeol: Since 1965',
  ARRAY['Oh Se-Yeol'],
  'A retrospective exhibition exploring Oh Se-Yeol''s artistic world from 1965 to the present.',
  'Gallery Joeun', 'Seoul',
  'Tue-Sat 10:00-18:00',
  'Free'
);

-- ========================================
-- 27. 리안갤러리 서울 - 남춘모: From the lines
-- ========================================

INSERT INTO exhibitions_master (
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student,
  genre, exhibition_type,
  created_at, updated_at
) VALUES (
  '2025-08-27', '2025-10-12', 'ongoing',
  0, 0,
  'contemporary', 'solo',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  operating_hours, ticket_info,
  phone_number, address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-27' AND end_date = '2025-10-12' ORDER BY created_at DESC LIMIT 1),
  'ko',
  '남춘모: From the lines',
  ARRAY['남춘모'],
  '선의 반복과 중첩을 통해 공간과 시간을 탐구하는 남춘모의 개인전.',
  '리안갤러리 서울', '서울',
  '화-토 10:00-18:00',
  '무료',
  '02-730-2776',
  '서울시 종로구 팔판길 42'
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  operating_hours, ticket_info
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-27' AND end_date = '2025-10-12' ORDER BY created_at DESC LIMIT 1),
  'en',
  'Nam Tchun-Mo: From the lines',
  ARRAY['Nam Tchun-Mo'],
  'A solo exhibition by Nam Tchun-Mo exploring space and time through the repetition and overlapping of lines.',
  'LEEAHN Gallery Seoul', 'Seoul',
  'Tue-Sat 10:00-18:00',
  'Free'
);

-- ========================================
-- 28. 갤러리 나우 - 소리 없는 노래
-- ========================================

INSERT INTO exhibitions_master (
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student,
  genre, exhibition_type,
  created_at, updated_at
) VALUES (
  '2025-08-27', '2025-09-28', 'ongoing',
  0, 0,
  'contemporary', 'group',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  operating_hours, ticket_info,
  phone_number, address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-27' AND end_date = '2025-09-28' AND genre = 'contemporary' ORDER BY created_at DESC LIMIT 1),
  'ko',
  '소리 없는 노래',
  ARRAY['김지수', '박소영', '이민호'],
  '침묵과 소통의 경계를 탐구하는 그룹전.',
  '갤러리 나우', '서울',
  '화-토 11:00-18:00',
  '무료',
  '02-725-2930',
  '서울시 강남구 압구정로 165'
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  operating_hours, ticket_info
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-27' AND end_date = '2025-09-28' AND genre = 'contemporary' ORDER BY created_at DESC LIMIT 1),
  'en',
  'Silent Song',
  ARRAY['Kim Ji-soo', 'Park So-young', 'Lee Min-ho'],
  'A group exhibition exploring the boundaries between silence and communication.',
  'Gallery NoW', 'Seoul',
  'Tue-Sat 11:00-18:00',
  'Free'
);

-- ========================================
-- 29. 갤러리 키체 - Scattered Words
-- ========================================

INSERT INTO exhibitions_master (
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student,
  genre, exhibition_type,
  created_at, updated_at
) VALUES (
  '2025-08-27', '2025-09-27', 'ongoing',
  0, 0,
  'contemporary', 'solo',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  operating_hours, ticket_info,
  address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-27' AND end_date = '2025-09-27' AND genre = 'contemporary' ORDER BY created_at DESC LIMIT 1),
  'ko',
  'Scattered Words',
  ARRAY['정재호'],
  '언어와 이미지의 관계를 탐구하는 정재호의 개인전.',
  '갤러리 키체', '서울',
  '화-토 11:00-18:00',
  '무료',
  '서울시 성북구 성북로 23길 157'
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  operating_hours, ticket_info
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-27' AND end_date = '2025-09-27' AND genre = 'contemporary' ORDER BY created_at DESC LIMIT 1),
  'en',
  'Scattered Words',
  ARRAY['Jung Jae-ho'],
  'A solo exhibition by Jung Jae-ho exploring the relationship between language and image.',
  'Gallery Kiche', 'Seoul',
  'Tue-Sat 11:00-18:00',
  'Free'
);

-- ========================================
-- 30. 누크갤러리 - 회화의 이름_풍경의 두께
-- ========================================

INSERT INTO exhibitions_master (
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student,
  genre, exhibition_type,
  created_at, updated_at
) VALUES (
  '2025-08-27', '2025-10-05', 'ongoing',
  0, 0,
  'painting', 'group',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  operating_hours, ticket_info,
  phone_number, address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-27' AND end_date = '2025-10-05' ORDER BY created_at DESC LIMIT 1),
  'ko',
  '회화의 이름_풍경의 두께',
  ARRAY['김동유', '박미나', '신철'],
  '풍경화의 전통과 현대적 해석을 보여주는 그룹전.',
  '누크갤러리', '서울',
  '화-토 11:00-18:00',
  '무료',
  '02-732-7241',
  '서울시 종로구 북촌로11나길 53'
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  operating_hours, ticket_info
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-27' AND end_date = '2025-10-05' ORDER BY created_at DESC LIMIT 1),
  'en',
  'Name of Painting_Thickness of Landscape',
  ARRAY['Kim Dong-yu', 'Park Mi-na', 'Shin Chul'],
  'A group exhibition showing the tradition of landscape painting and its contemporary interpretation.',
  'nook gallery', 'Seoul',
  'Tue-Sat 11:00-18:00',
  'Free'
);

-- ========================================
-- 31. 토탈미술관 - 유니 폼: 브로큰 트윌
-- ========================================

INSERT INTO exhibitions_master (
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student,
  genre, exhibition_type,
  created_at, updated_at
) VALUES (
  '2025-08-27', '2025-10-19', 'ongoing',
  5000, 3000,
  'contemporary', 'solo',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  operating_hours, ticket_info,
  phone_number, address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-27' AND end_date = '2025-10-19' ORDER BY created_at DESC LIMIT 1),
  'ko',
  '유니 폼: 브로큰 트윌',
  ARRAY['유니 폼'],
  '정체성과 유니폼의 관계를 탐구하는 유니 폼의 개인전.',
  '토탈미술관', '서울',
  '화-일 11:00-18:00',
  '일반 5,000원 / 학생 3,000원',
  '02-379-3994',
  '서울시 종로구 평창32길 8'
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  operating_hours, ticket_info
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-27' AND end_date = '2025-10-19' ORDER BY created_at DESC LIMIT 1),
  'en',
  'Uni Form: Broken Twill',
  ARRAY['Uni Form'],
  'A solo exhibition by Uni Form exploring the relationship between identity and uniforms.',
  'Total Museum', 'Seoul',
  'Tue-Sun 11:00-18:00',
  'Adult 5,000 won / Student 3,000 won'
);

-- ========================================
-- 인덱스 생성
-- ========================================
CREATE INDEX IF NOT EXISTS idx_exhibitions_master_dates ON exhibitions_master(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_exhibitions_master_status ON exhibitions_master(status);
CREATE INDEX IF NOT EXISTS idx_exhibitions_master_genre ON exhibitions_master(genre);
CREATE INDEX IF NOT EXISTS idx_exhibitions_translations_exhibition_id ON exhibitions_translations(exhibition_id);
CREATE INDEX IF NOT EXISTS idx_exhibitions_translations_language ON exhibitions_translations(language_code);
CREATE INDEX IF NOT EXISTS idx_venues_simple_name ON venues_simple(name_ko);