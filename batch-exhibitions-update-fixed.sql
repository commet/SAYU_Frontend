-- 🎨 SAYU 전시 데이터 일괄 업데이트 SQL (수정본)
-- 실행일: 2025-08-31
-- 전시 목록: exhibitions-final-141.js의 1-19번 전시
-- 수정: exhibitions_translations 테이블 컬럼 불일치 문제 해결

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
('PS CENTER', 'PS CENTER', '서울', '강남구', 'gallery', false, 55),
('G Gallery', 'G Gallery', '서울', '강남구', 'gallery', false, 60),
('스페이스776', 'SPACE776', '서울', '강남구', 'gallery', false, 55),
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
('토탈미술관', 'Total Museum', '서울', '종로구', 'museum', false, 45),
('페로탕 서울', 'Perrotin Seoul', '서울', '강남구', 'gallery', true, 40)
ON CONFLICT (name_ko) DO NOTHING;

-- ========================================
-- 1. DDP - 스펙트럴 크로싱스
-- ========================================

-- exhibitions_master 업데이트
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
) RETURNING id AS spectral_id;

-- exhibitions_translations (한글)
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
  'AI가 만든 얼굴과 형체 없는 감정의 흐름이 빛을 따라 움직이며 관객과 교차해 만나는 순간을 담아낸 미디어아트 전시. 144개의 크리스탈과 아나몰픽 미디어아트를 통해 감정의 빛이 현실 공간에 물리적으로 드러나는 몰입형 설치작품이다. 빛과 움직임으로 가득한 공간에서 관객은 타인의 감정 속에서 자신의 내면을 비추며 새로운 지각의 확장을 경험하게 된다.',
  'DDP', '서울',
  '10:00~20:00',
  '무료',
  '02-2153-0086',
  'DDP 디자인랩 3층'
);

-- exhibitions_translations (영문)
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
  'An immersive media art exhibition where AI-generated faces and formless emotional flows move along with light, creating moments of intersection with viewers. Through 144 crystals and anamorphic media art, emotional light physically manifests in real space. In this light-filled environment, viewers reflect on their inner selves through others'' emotions, experiencing an expansion of perception.',
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
  artists, curator,
  description,
  venue_name, city,
  operating_hours, ticket_info,
  phone_number, email, address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-16' AND end_date = '2025-10-26' ORDER BY created_at DESC LIMIT 1),
  'ko',
  '파편의 흐름', 'Flow of Debris',
  ARRAY['민성홍'], '권미성',
  '《파편의 흐름》은 정지하지 못한 채 이동하는 것, 혹은 흘러가다 이내 쌓여버린 것들에 관해 이야기한다. 작가 민성홍은 사회적 제도나 시스템에 의해 개인이 통제할 수 없는 환경적 변화 앞에서 감각되는 불안과 그 정동이 서려있는 사물에 집중하는데, 주로 사람들이 살던 곳을 떠난 뒤 아무런 기능도 하지 않는 가구, 사물, 집기를 수집하는 것에서 출발한다. 전시의 주요 작품인 <순환하는 신체_안테나 새>(2025)는 전력을 사용하지 않고도 주변에 떠도는 미세한 전파를 포착해 소리로 변환하는 ''크리스탈 라디오''를 결합한 설치 작업으로, 어디선가 발산되었지만 분명히 감지되지 않는 흐름과 감각의 여백에 머무는 신호를 매개하는 은유적 장치로 작동한다.',
  '갤러리조선', '서울',
  '화-일 10:30~18:30',
  '무료',
  '02-723-7133',
  'info@gallerychosun.com',
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
  '《Flow of Debris》 explores things that move without stopping, or things that flow and eventually accumulate. Artist Min Sunghong focuses on objects imbued with anxiety and affect sensed in the face of environmental changes beyond individual control due to social systems, primarily starting from collecting furniture and household items that no longer function after people have left their homes. The exhibition''s main work, <Circulating Body_Antenna Bird>(2025), is an installation combining ''crystal radio'' that captures ambient radio waves and converts them to sound without using electricity, operating as a metaphorical device mediating flows emitted from somewhere but not clearly detected and signals remaining in sensory margins.',
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
  '작가 작고 이후 작품세계를 총망라하여 재조명하는 회고전. 전시는 물방울의 시각적 아름다움 이면에 자리한 상흔의 기억과 근원적 미의식에 주목하며, 작업 초기 및 뉴욕 시기의 미공개 작품과 귀중한 기록 자료를 통해 작가의 창작 여정을 보다 입체적으로 조망한다. 물방울이라는 형식 속에 스며든 다양한 조형 언어를 새롭게 발견하고, 한국 현대미술이 지닌 고유한 정신성과 그 미술사적 의의를 다시금 되새기는 뜻깊은 자리가 될 것이다.',
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
  'A retrospective exhibition comprehensively re-examining the artist''s oeuvre after his passing. The exhibition focuses on the memories of trauma and fundamental aesthetics behind the visual beauty of water droplets, presenting unpublished works from his early career and New York period along with valuable archival materials to provide a more dimensional view of his creative journey. It will be an opportunity to discover various formative languages embedded in the form of water droplets and reconsider the unique spirituality and art historical significance of Korean contemporary art.',
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
  '(재)예술경영지원센터의 ''한국작가 해외집중 프로모션'' 사업의 일환으로 동시대 미술 실천을 확장해온 작가들을 형식과 내용의 제한 없이 선정해 해외 프로모션의 출발점으로 삼는 전시. «PANORAMA»는 공통된 주제 아래 작가를 묶는 대신 개별 작가의 작업 세계를 응축된 형태로 보여주는 데 중점을 두며, 8팀의 작가들이 외부 세계를 감각하고 그로부터 생기는 간극을 회화, 조각, 설치, 사진, 영상 등 다양한 조형 언어로 풀어낸다.',
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
  ARRAY['Byungjun Kwon', 'Minae Kim', 'Minha Park', 'ikkibawiKrrr', 'Jewyo Rhii', 'Goen Choi', 'Sun Woo', 'AfroAsia Collective (Onejoon Che, Sun A Moon)'],
  'An exhibition showcasing eight artists and collectives whose practices expand the possibilities of contemporary art, serving as a platform for long-term international engagement. Rather than adhering to a set theme, PANORAMA highlights each artist''s distinct voice as they explore the world through individual frameworks of perception, translating its gaps and frictions into painting, sculpture, installation, photography, and video.',
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
  '2025년 여름, 김환기 뉴욕 시기에 ''특별한 제자''로 인연을 맺고 이후 부인 김향안과 오랜 우정을 이어온 이베트 모레노(Yvette Moreno)가 소장했던 작품 한 점이 브라질 리우데자네이루로부터 환기미술관으로 돌아왔다. 1963년 제7회 상파울루 비엔날레는 김환기를 당시 현대미술의 중심지였던 뉴욕으로 이끌어 새로운 표현 방법을 모색하게 하는 계기가 되었으며, 그곳에서 제작한 작품 중 14점이 1965년 제8회 상파울루 비엔날레 특별실에 전시되었다.',
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
  'In summer 2025, a work once owned by Yvette Moreno, Kim Whanki''s ''special student'' during his New York period who maintained a long friendship with his wife Kim Hyang-an, returned to Whanki Museum from Rio de Janeiro, Brazil. The 7th São Paulo Biennial in 1963 led Kim Whanki to New York, the center of contemporary art at the time, where he explored new methods of expression, and 14 of his works created there were exhibited in a special room at the 8th São Paulo Biennial in 1965.',
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
  '디지털 콘텐츠의 원형이 되는 유형 유산과 한국 고유의 미감을 탐구한 현대 작가들의 예술작품이 어우러져 이제까지 접해보지 못했던 새로운 형태의 몰입형 경험을 체험하는 전시. 유형과 무형, 물질과 비물질, 테크놀로지와 수공예가 한 자리에 모여 국가유산과 현대 예술이 만나 활용과 확장의 가능성을 확인한다.',
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
  'An exhibition where tangible heritage serving as the prototype for digital content meets contemporary artists'' works exploring Korea''s unique aesthetic sensibility, creating an unprecedented immersive experience. The exhibition brings together tangible and intangible, material and immaterial, technology and craftsmanship, confirming the possibilities of utilizing and expanding national heritage through contemporary art.',
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
  phone_number, email
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-22' AND end_date = '2025-10-26' ORDER BY created_at DESC LIMIT 1),
  'ko',
  '형상 회로',
  ARRAY['공성훈', '곽정명', '김시은', '김현진', '마르쿠스 뤼페르츠', '게오르그 바젤리츠', '박광수', '박장년', '변종곤', '심현빈', '이승택', '이제', '정강자', '정석희', '나디아 지와', '한운성', '호상근'],
  '오늘날 현실이 이미지의 결과가 아니라 이미지가 현실의 결과가 된 세계에서, ''형상 충동''은 현실에 직접적인 충격을 가하려는 예술적 시도다. 《형상 회로》는 각자의 거리와 시간적 탈구로부터 빛나는 작가들의 실천을 제시하며, 무겁고 느린 이미지를 생산하는 예술 고유의 힘과 맞닿아 있다.',
  '일민미술관', '서울',
  '화-일 11:00~19:00 (매주 월요일 및 추석 당일 휴관)',
  '일반 9,000원 / 학생 7,000원',
  '02-2020-2050',
  'info@ilmin.org'
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
  'In today''s world, where reality has become the result of images rather than images the result of reality, the ''figurative impulse'' is an artistic attempt to deliver a direct impact on reality. Figuration Circuits presents the practices of artists that shine forth from their own distances and temporal dislocations, aligning with the inherent power of art to produce heavy and slow images.',
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

-- 주의: 페로탕 서울이 venues_simple에 추가되어야 함
INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  operating_hours, ticket_info
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-26' AND end_date = '2025-10-25' ORDER BY created_at DESC LIMIT 1),
  'ko',
  '이즈미 카토 개인전',
  ARRAY['이즈미 카토'],
  '페로탕 서울은 일본 현대미술 작가 이즈미 카토의 개인전을 개최한다. 이번 전시는 2018년 페로탕 서울에서 열린 첫 개인전에 이어 두 번째로 선보이는 개인전이다. 작가가 불러내는 존재들은 불안한 얼굴을 한 아이들, 완전히 발달한 신체를 지닌 배아, 불명확한 형태의 몸에 갇힌 영혼들로 매혹적이면서도 수수께끼 같은 미묘한 느낌을 준다.',
  '페로탕 서울', '서울',
  '화-토 10:00~18:00',
  '무료'
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
  'Perrotin Seoul presents a solo exhibition by Japanese contemporary artist Izumi Kato, marking his second solo show at the gallery following his first in 2018. His work challenges conventional notions of painting and sculpture, creating primitive and totemic forms that invite contemplation on the essential and conscious dimensions of art.',
  'Perrotin Seoul', 'Seoul',
  'Tue-Sat 10:00~18:00',
  'Free'
);

-- 필요시 추가 contact 정보는 exhibitions_contacts 테이블에 별도 삽입
INSERT INTO exhibitions_contacts (
  exhibition_id,
  phone_number, email, address, website_url
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-26' AND end_date = '2025-10-25' ORDER BY created_at DESC LIMIT 1),
  '02-545-7978',
  'seoul@perrotin.com',
  '서울 강남구 도산대로 45길 10',
  NULL
) ON CONFLICT (exhibition_id) DO NOTHING;

-- 계속해서 나머지 전시들도 동일한 패턴으로 수정...