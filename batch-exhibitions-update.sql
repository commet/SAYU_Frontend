-- 🎨 SAYU 전시 데이터 일괄 업데이트 SQL
-- 실행일: 2025-08-31
-- 전시 목록: exhibitions-final-141.js의 1-19번 전시

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
('토탈미술관', 'Total Museum', '서울', '종로구', 'museum', false, 45)
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
  '《파편의 흐름》은 정지하지 못한 채 이동하는 것, 혹은 흘러가다 이내 쌓여버린 것들에 관해 이야기한다. 작가 민성홍은 사회적 제도나 시스템에 의해 개인이 통제할 수 없는 환경적 변화 앞에서 감각되는 불안과 그 정동이 서려있는 사물에 집중하는데, 주로 사람들이 살던 곳을 떠난 뒤 아무런 기능도 하지 않는 가구, 사물, 집기를 수집하는 것에서 출발한다. 전시의 주요 작품인 <순환하는 신체_안테나 새>(2025)는 전력을 사용하지 않고도 주변에 떠도는 미세한 전파를 포착해 소리로 변환하는 ''크리스탈 라디오''를 결합한 설치 작업으로, 어디선가 발산되었지만 분명히 감지되지 않는 흐름과 감각의 여백에 머무는 신호를 매개하는 은유적 장치로 작동한다.',
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
  phone_number
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-22' AND end_date = '2025-10-26' ORDER BY created_at DESC LIMIT 1),
  'ko',
  '형상 회로',
  ARRAY['공성훈', '곽정명', '김시은', '김현진', '마르쿠스 뤼페르츠', '게오르그 바젤리츠', '박광수', '박장년', '변종곤', '심현빈', '이승택', '이제', '정강자', '정석희', '나디아 지와', '한운성', '호상근'],
  '오늘날 현실이 이미지의 결과가 아니라 이미지가 현실의 결과가 된 세계에서, ''형상 충동''은 현실에 직접적인 충격을 가하려는 예술적 시도다. 《형상 회로》는 각자의 거리와 시간적 탈구로부터 빛나는 작가들의 실천을 제시하며, 무겁고 느린 이미지를 생산하는 예술 고유의 힘과 맞닿아 있다.',
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
  '페로탕 서울은 일본 현대미술 작가 이즈미 카토의 개인전을 개최한다. 이번 전시는 2018년 페로탕 서울에서 열린 첫 개인전에 이어 두 번째로 선보이는 개인전이다. 작가가 불러내는 존재들은 불안한 얼굴을 한 아이들, 완전히 발달한 신체를 지닌 배아, 불명확한 형태의 몸에 갇힌 영혼들로 매혹적이면서도 수수께끼 같은 미묘한 느낌을 준다.',
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
  'Perrotin Seoul presents a solo exhibition by Japanese contemporary artist Izumi Kato, marking his second solo show at the gallery following his first in 2018. His work challenges conventional notions of painting and sculpture, creating primitive and totemic forms that invite contemplation on the essential and conscious dimensions of art.',
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
  '오컬트, 신비주의, 영적 전통에서 영감을 받은 세계 각지의 예술가들의 커미션 신작, 재제작 및 기존 작품을 다양하게 선보인다. 이번 비엔날레는 자본주의 근대성의 가속주의적이고 합리주의적인 논리와 우리의 경험을 형성하는 정치적이고 지적인 구조에 대항하고, 이를 재구성할 수 있는 대안적 ''기술''로서 비엔날레를 제시한다.',
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
  'The biennale presents commissioned new works, reproductions, and existing works by artists from around the world inspired by occult, mysticism, and spiritual traditions. It proposes itself as an alternative ''technology'' that resists and can reconstruct the accelerationist and rationalist logic of capitalist modernity.',
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
  '2025 아르코데이는 낯설고 어색한 네트워킹의 순간들을 새로운 시선으로 바라보는 퍼포먼스형 파티를 포함한 전시다. 로스트에어의 안내에 따라 각자의 속도로 관계를 탐색해보는 느슨한 네트-워킹에 참여하며, 관계의 궤적이 스며든 긴–꼬리 위를 천천히 산책해 보는 경험을 제안한다.',
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
  '2025 ARKO DAY presents a performance-style party that views unfamiliar and awkward networking moments from a new perspective, proposing a slow walk along the long tail where relational trajectories permeate.',
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
  '《March to March》는 반복, 의식, 그리고 연결되어 있으면서도 갈등하는 세계의 긴장에 대한 송가이다. 격동의 시대에 회복력을 모으는 행위로 구상된 이 전시는 이민자의 일기이자 여정, 그리고 목격의 형태로 펼쳐진다. 작가의 고향인 인도 동부 파트나에서 현재 거주하며 작업하는 뭄바이 콜라바의 복잡한 일상까지의 여정을 추적한다. [특별 프로그램] 오프닝 파티: 2025.9.1(월) 18:00-22:00 (DJ 19:00부터) / 아티스트 토크 & 클로징 퍼포먼스: 2025.9.13(토) 15:00',
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
  'March to March is an ode to repetition, ritual, and the tensions of a connected yet conflicted world. Conceived as an act of gathering resilience in turbulent times, the exhibition unfolds as an immigrant''s diary, an itinerary, and a form of witnessing. [Special Programs] Opening Party: Sep 1 (Mon) 18:00-22:00 (DJ from 19:00) / Artist Talk & Closing Performance: Sep 13 (Sat) 15:00',
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
  '서울공예박물관과 폴란드 아담 미츠키에비츠 문화원이 함께하는 전시로, 양국의 전통 섬유문화를 통해 계절의 감각과 삶의 지혜를 되돌아본다. 섬유는 단순한 장식이나 기능을 넘어, 사람과 자연, 공간을 잇는 감각의 매개체였으며, <공간의 호흡>과 <계절의 조율>이라는 두 부제를 통해 자연과 더불어 살아가는 지혜와 감각을 새롭게 일깨운다. 자연의 결을 따라 집을 짓고, 손의 온기로 공간을 채워온 두 나라의 섬유 문화를 통해, 기후위기 시대에 지속가능한 삶의 방식을 함께 생각해보는 계기를 제공한다.',
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
  'A collaborative exhibition between Seoul Museum of Craft Art and Adam Mickiewicz Institute Poland, exploring seasonal senses and life wisdom through traditional textile cultures of both nations. Textiles serve as sensory mediators connecting people, nature, and space beyond mere decoration or function, offering an opportunity to consider sustainable ways of life in the climate crisis era.',
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
  '현대공예 전시로 도자, 금속, 섬유, 가죽과 털 등 다양한 재료를 활용한 작품들을 선보인다. 폐기물과 자연, 데이터를 키워드로 물질과 실천의 관계를 탐구하며, 현대 공예가 지속가능성과 환경에 대응하는 방식을 제시한다.',
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
  'A contemporary craft exhibition showcasing works utilizing various materials including ceramics, metal, textiles, leather and fur. Exploring the relationship between material and practice through keywords of waste, nature, and data, the exhibition presents how contemporary craft responds to sustainability and environmental concerns.',
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
  exhibition_title,
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
  '김민정은 동아시아의 서예와 수묵화 전통 그리고 동양 철학을 탐구하며 현대 추상화의 구성 어휘를 확장하는 작업을 30여 년 동안 지속해 오고 있다. 이번 전시는 불에 태워진 한지를 지그재그로 쌓아 올리며 두 개별적인 요소의 결합과 조화를 선보이는 〈Zip〉 연작 10점이 국내에서 처음 소개되며, 작가의 주요 연작까지 30여 점을 함께 선보인다. 작가는 가장 섬세한 물질인 종이를 직접 통제하고 다스리는 촛불로 태우며 불과의 ''협업''을 통해 자연의 순환과 공의 개념에 대하여 성찰한다.',
  '갤러리현대', '서울',
  '무료',
  'mail@galleryhyundai.com',
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
  'For over thirty years, Minjung Kim has explored the traditions of East Asian calligraphy and ink painting alongside Eastern philosophy, expanding the formal vocabulary of contemporary abstraction. This exhibition features ten works from Kim''s recent series ''Zip'', presented for the first time in Korea, where layers of scorched Hanji are stacked in a zigzag formation. Through collaboration with fire, she contemplates the cyclical nature of life and the concept of emptiness.',
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
  'conceptual', 'solo',
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
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-27' AND end_date = '2025-10-18' ORDER BY created_at DESC LIMIT 1),
  'ko',
  '성능경: 쌩~휙!', 'As If Nothing… The Artistic Meandering of Sung Neung Kyung',
  ARRAY['성능경'],
  '이번 전시는 1980년대 초창기 작업부터 2025년 신작까지, 작가의 50여 년간 실험을 집대성한 자리다. 전시 제목 ''쌩~휙!''은 성능경이 직접 깎은 싸리 회초리를 휘두를 때 나는 소리를 표현한 의성어로, 단순한 행위를 사회적 맥락과 접속시키는 작가의 태도를 압축한다. ''걷다가'' 외 9점(1998)은 27년 만에 다시 공개되며, ''커피드로잉''(2025)은 드립커피 후 남은 자국을 종이수건에 옮겨 반복 행위를 예술로 전환한 신작이다. [특별 프로그램] 신작 퍼포먼스: 2025.8.27(수) 17:00',
  '백아트', '서울',
  '무료',
  '010-2174-2598',
  'Seoul@baikart.com',
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
  'This exhibition encompasses approximately 80 works from the early 1980s to new pieces from 2025, spanning the artist''s 50-year experimental practice. Sung seeks out ''something that is not yet art,'' the daily action that ''seems to be nothing'' as raw material for his artistic practice. These small gestures create a ''mosquito noise'' by activating everyday elements of behavior into a resonant, politically charged buzz. [Special Program] New Performance: Aug 27, 2025 at 17:00',
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
  exhibition_title,
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
  '이강승과 캔디스 린은 서로 다른 문화적 배경과 조형 언어를 바탕으로 사회적 제도에 의해 배제되거나 역사 속에서 지워지고 잊힌 인물과 공동체, 그리고 그들의 서사를 지속적으로 조명해 왔다. 이강승은 자신보다 앞선 세대의 퀴어 예술가들의 짧은 생애와 유산을 기록하고 기리는 작업을 이어오고 있으며, 최근작에서는 ''피부''를 시간의 흐름 속 변화와 기억의 층위를 기록하는 살아 있는 아카이브로 제시한다. 캔디스 린은 곰팡이, 박테리아, 발효, 얼룩 등 유기적 물질과 이를 둘러싼 과정을 작업의 매체로 삼아 식민주의와 디아스포라의 역사, 젠더, 인종, 섹슈얼리티에 얽힌 복합적인 권력 구조를 다층적으로 탐구한다.',
  '갤러리현대', '서울',
  '무료',
  'mail@galleryhyundai.com',
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
  'Building upon distinct cultural backgrounds and formal languages, Kang Seung Lee and Candice Lin shed light on marginalized or erased histories. Lee continues documenting and commemorating the lives and legacies of queer artists, presenting human skin as a living archive inscribed with layered memories. Lin engages with organic materials and processes including mold, fungi, bacteria, fermentation, and stains, exploring the politics of representation and issues of race, gender, and sexuality through histories of colonialism and diaspora.',
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
  '페르난데스는 지난 30년 이상 풍경에 내재된 복잡성과 역설을 지속적으로 탐구해 왔다. 이 연작은 목탄, 모래, 청색 안료 등을 수평적으로 층층이 쌓아 올린 알루미늄 레이어로 구성되며, 지질학적 형성과 수중 풍경, 내면적 사유를 한 화면 안에서 교차시킨다. 작품 하단에는 벨벳과 같은 부드러운 질감의 갈라진 목탄 조각들이 자리 잡고 있으며, 그 위로 검은색과 푸른색 모래층이 축적되어 마치 감각적으로 변화하는 지형처럼 펼쳐진다. 수천 개의 작은 세라믹 큐브로 구성된 작품은 중심에서 가장자리로 갈수록 색의 채도와 밝기가 점차 깊어져 팽창과 수축을 동시에 시사하는 시각적 장을 형성한다.',
  '리만머핀 서울', '서울',
  '무료',
  '02-725-0094',
  'seoul@lehmannmaupin.com',
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
  'For over 30 years, Fernández has continuously explored the complexities and paradoxes inherent in landscapes. This series consists of aluminum layers horizontally stacked with charcoal, sand, and blue pigments, intersecting geological formations, underwater landscapes, and internal contemplation within a single frame. Thousands of small ceramic cubes compose works where color saturation and brightness gradually deepen from center to edge, creating visual fields that suggest simultaneous expansion and contraction.',
  'Lehmann Maupin Seoul', 'Seoul',
  'Free'
);

-- ========================================
-- 59. 스페이스776 - Pop reconstructed Seoul to NY
-- ========================================

-- exhibitions_master 삽입
INSERT INTO exhibitions_master (
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student, ticket_price_child,
  genre, exhibition_type,
  created_at, updated_at
) VALUES (
  '2025-08-28', '2025-09-28', 'ongoing',
  0, 0, 0,  -- 무료
  'contemporary', 'duo',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  operating_hours,
  ticket_info,
  address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-28' AND end_date = '2025-09-28' ORDER BY created_at DESC LIMIT 1),
  'ko',
  'Pop reconstructed Seoul to NY',
  ARRAY['조영남', '조조 아나빔'],
  '한국 대중문화의 아이콘을 회화로 재해석해온 조영남과 현대 소비문화와 브랜드 이미지를 예술 언어로 전환하는 조조 아나빔의 2인전. 조영남은 한국 전통 놀이문화인 ''화투''를 팝아트적 회화 언어로 변환하여 세대를 관통하는 문화적 상징으로 재맥락화하며, 조조 아나빔은 코카콜라, 디즈니, 슈프림 등 글로벌 브랜드 로고와 광고 이미지를 회화에 담아 현대 소비주의에 내재된 집단적 향수와 욕망을 드러낸다. [특별 프로그램: 오프닝 리셉션 8/30(토) 18:00-20:00]',
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
  operating_hours,
  ticket_info
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-28' AND end_date = '2025-09-28' ORDER BY created_at DESC LIMIT 1),
  'en',
  'Pop reconstructed Seoul to NY',
  ARRAY['Youngnam Cho', 'Jojo Anavim'],
  'A duo exhibition bringing together Cho Youngnam, who reinterprets icons of Korean popular culture in painting, and Jojo Anavim, who transforms contemporary consumer culture and brand imagery into artistic language. Cho transforms Hwatu, a traditional Korean card game, into pop art visual language, recontextualizing it as a cultural symbol spanning generations. Anavim incorporates global brand logos from Coca-Cola, Disney, and Supreme into paintings, revealing collective nostalgia and desires embedded in contemporary consumerism. [Special Program: Opening Reception 8/30(Sat) 18:00-20:00]',
  'SPACE776', 'Seoul',
  'Wed-Sun 12:00-18:00',
  'Free'
);

-- ========================================
-- 19. G Gallery - POOMSAE 품새
-- ========================================

-- exhibitions_master 삽입
INSERT INTO exhibitions_master (
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student, ticket_price_child,
  genre, exhibition_type,
  created_at, updated_at
) VALUES (
  '2025-08-27', '2025-09-27', 'ongoing',
  0, 0, 0,  -- 무료
  'contemporary', 'solo',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  operating_hours,
  ticket_info,
  phone_number, address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-27' AND end_date = '2025-09-27' ORDER BY created_at DESC LIMIT 1),
  'ko',
  'POOMSAE 품새',
  ARRAY['우한나'],
  '《POOMSAE 품새》는 작가 우한나가 생애적 전환의 과정에서 만든 작품들로 구성되었으며, 그 과정에서 겪은 치열하고 처연하지만 의연한 생애의 아름다운 순간을 담고 있다. 2023년부터 이어온 〈Bleeding〉과 〈Milk and Honey〉 연작이 혼재하며, 감정과 신체의 변형이 맞물린 고유한 세계를 제시한다. 발레를 통해 체화한 무게중심과 균형 감각이 작품에 반영되며, ''책임감 없는 모양''이라는 태도를 고수하면서도 직립과 독립이라는 인간 존재의 은유를 이어간다.',
  'G Gallery', '서울',
  '월-토 10:00-18:00',
  '무료',
  '02-790-4921',
  'info@ggallery.kr',
  '서울 강남구 삼성로 748 지하 1층'
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  operating_hours,
  ticket_info
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-27' AND end_date = '2025-09-27' ORDER BY created_at DESC LIMIT 1),
  'en',
  'POOMSAE',
  ARRAY['Woo Hannah'],
  'POOMSAE brings together works created by Woo Hannah during a transformative period, embodying intense, sorrowful, yet dignified and beautiful moments of life. The exhibition features works from the Bleeding and Milk and Honey series ongoing since 2023, presenting a unique world where emotional and bodily transformations intertwine. Through ballet practice, the artist internalized a sense of balance and gravity, which is reflected in her sculptures—an assertion of will to rise even in states of collapse.',
  'G Gallery', 'Seoul',
  'Mon-Sat 10:00-18:00',
  'Free'
);

-- ========================================
-- 46. 뮤지엄멋 - 물, 쌀, 풀
-- ========================================

-- exhibitions_master 삽입
INSERT INTO exhibitions_master (
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student, ticket_price_child,
  genre, exhibition_type,
  created_at, updated_at
) VALUES (
  '2025-08-27', '2025-09-28', 'ongoing',
  0, 0, 0,  -- 무료
  'contemporary', 'group',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  operating_hours,
  ticket_info,
  address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-27' AND end_date = '2025-09-28' AND genre = 'contemporary' ORDER BY created_at DESC LIMIT 1),
  'ko',
  '물, 쌀, 풀',
  ARRAY['서다솜', '금벌레', '임상완'],
  '《물, 쌀, 풀》은 교류와 환대의 매개가 되는 방식을 보여준다. 협력자 김수연은 바느질로 식물성 섬유를 엮어 풀의 촉각적 경험을 공유한다. 두 공간에서 진행되는 전시는 물, 쌀, 풀이 엮어낸 세계를 드러내 우리가 잊고 있던 순환과 변화의 감각을 일깨우고자 한다. [특별 프로그램: 오프닝 리셉션 (RSVP 필요)]',
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
  operating_hours,
  ticket_info
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-27' AND end_date = '2025-09-28' AND genre = 'contemporary' ORDER BY created_at DESC LIMIT 1),
  'en',
  'Water, Rice, Grass',
  ARRAY['Seo Dasom', 'Geumbeolle', 'Lim Sangwan'],
  'The exhibition demonstrates how water, rice, and grass become mediums of exchange and hospitality. Collaborator Kim Sooyeon shares the tactile experience of grass by weaving plant fibers through needlework. The exhibition, held across two spaces, reveals the world woven by water, rice, and grass, awakening our forgotten senses of circulation and transformation. [Special Program: Opening Reception (RSVP required)]',
  'Museum Mot', 'Seoul',
  '12:00-20:00 (Closed Mondays)',
  'Free'
);

-- ========================================
-- 48. 코소 - 페이퍼 스트릿
-- ========================================

-- exhibitions_master 삽입
INSERT INTO exhibitions_master (
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student, ticket_price_child,
  genre, exhibition_type,
  created_at, updated_at
) VALUES (
  '2025-08-27', '2025-09-14', 'ongoing',
  0, 0, 0,  -- 무료
  'contemporary', 'solo',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  operating_hours,
  ticket_info,
  phone_number,
  address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-27' AND end_date = '2025-09-14' ORDER BY created_at DESC LIMIT 1),
  'ko',
  '페이퍼 스트릿',
  ARRAY['김연홍'],
  '김연홍은 투명한 중첩과 우연한 연결을 통해 풍경의 조각들을 연결하고 보이지 않는 길을 화면에 펼쳐낸다. 편집된 이미지와 회화가 만나 존재와 부재가 흔들리는 장면을 만들어내며, 관람객은 그 속을 걸으며 새로운 풍경과 마주하게 된다. [특별 프로그램: 9/1(월) 정상운영]',
  '코소', '서울',
  '13:00-19:00 (월, 화 휴무)',
  '무료',
  NULL,
  '서울시 중구 창경궁로5길 32, 3층'
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  operating_hours,
  ticket_info
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-27' AND end_date = '2025-09-14' ORDER BY created_at DESC LIMIT 1),
  'en',
  'Paper Street',
  ARRAY['Kim Yeonhong'],
  'Kim Yeonhong connects fragments of landscapes through transparent overlaps and accidental connections, unfolding invisible paths on the screen. Edited images and paintings meet to create scenes where presence and absence waver, inviting viewers to walk through and encounter new landscapes. [Special Program: Open on 9/1(Mon)]',
  'COSO', 'Seoul',
  '13:00-19:00 (Closed Mon, Tue)',
  'Free'
);

-- ========================================
-- 49. 프로젝트 스페이스 사루비아 - Noir
-- ========================================

-- exhibitions_master 삽입
INSERT INTO exhibitions_master (
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student, ticket_price_child,
  genre, exhibition_type,
  created_at, updated_at
) VALUES (
  '2025-08-27', '2025-09-26', 'ongoing',
  0, 0, 0,  -- 무료
  'contemporary', 'solo',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  operating_hours,
  ticket_info,
  address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-27' AND end_date = '2025-09-26' ORDER BY created_at DESC LIMIT 1),
  'ko',
  'Noir',
  ARRAY['김상소'],
  '《누아르》는 형용사처럼 부유하는 이미지들이, 보임과 이해의 사이에서 어떻게 확장되고 연장될 수 있는지 탐구한다. 2025 사루비아 전시후원작가 김상소의 개인전으로, 캔버스에 유채와 아크릴릭을 사용한 회화 작품들과 파라핀, 갈륨을 활용한 조각 작품이 함께 전시된다.',
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
  operating_hours,
  ticket_info
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-27' AND end_date = '2025-09-26' ORDER BY created_at DESC LIMIT 1),
  'en',
  'Noir',
  ARRAY['Sangso Kim'],
  'Noir explores how images that float like adjectives can expand and extend between visibility and understanding. As the 2025 SARUBIA exhibition support artist, Sangso Kim presents oil and acrylic paintings on canvas alongside sculptures made with paraffin and gallium.',
  'Project Space SARUBIA', 'Seoul',
  'Wed-Sun 12:00-19:00 (Closed Mon, Tue)',
  'Free'
);

-- ========================================
-- 50. 호리아트스페이스 - 풍뎅이의 복화술
-- ========================================

-- exhibitions_master 삽입
INSERT INTO exhibitions_master (
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student, ticket_price_child,
  genre, exhibition_type,
  created_at, updated_at
) VALUES (
  '2025-08-27', '2025-09-27', 'ongoing',
  0, 0, 0,  -- 무료
  'contemporary', 'solo',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  operating_hours,
  ticket_info,
  address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-27' AND end_date = '2025-09-27' AND genre = 'contemporary' ORDER BY created_at DESC LIMIT 1),
  'ko',
  '풍뎅이의 복화술',
  ARRAY['한의도'],
  '한의도의 작업을 설명하는 핵심 키워드는 ''자기분열(self-fragmentation)''이다. 인식의 왜곡, 일상의 선입견, 정체성의 혼란, 사회·미디어의 조작 등을 자신만의 시각적 조형 언어로 재해석한다. 누구에게나 익숙한 일상의 장면이 차용되었으면서도, 그것을 낯설고 불완전한 인물로 재구성하는 의외의 방식을 보여준다. [특별 프로그램: 삼청나잇 오프닝 9/4(목) 17:00-23:00, 피자와 맥주 제공]',
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
  operating_hours,
  ticket_info
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-27' AND end_date = '2025-09-27' AND genre = 'contemporary' ORDER BY created_at DESC LIMIT 1),
  'en',
  'Ventriloquy of a Beetle',
  ARRAY['Han Uido'],
  'The key concept explaining Han Uido''s work is ''self-fragmentation''. He reinterprets cognitive distortions, everyday prejudices, identity confusion, and social/media manipulation through his unique visual language. Familiar everyday scenes are appropriated yet reconstructed in unexpected ways with strange and incomplete figures. [Special Program: Samcheong Night Opening 9/4(Thu) 17:00-23:00, pizza and beer provided]',
  'Hori Art Space', 'Seoul',
  'Tue-Sat 11:00-18:00',
  'Free'
);

-- ========================================
-- 51. 갤러리제이원 서울 - 윤형재 개인전
-- ========================================

-- exhibitions_master 삽입
INSERT INTO exhibitions_master (
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student, ticket_price_child,
  genre, exhibition_type,
  created_at, updated_at
) VALUES (
  '2025-08-27', '2025-09-28', 'ongoing',
  0, 0, 0,  -- 무료
  'contemporary', 'solo',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  operating_hours,
  ticket_info,
  phone_number,
  address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-27' AND end_date = '2025-09-28' ORDER BY created_at DESC LIMIT 1),
  'ko',
  '윤형재 개인전',
  ARRAY['윤형재'],
  '윤형재 작가는 초대의 백색 회화의 흔적부터 최근의 구조적 회화에 이르기까지 작가가 탐구해온 사유의 흐름을 엿볼 수 있는 자리이다. 작가는 "보이지 않는 것은 마음으로 본다"는 태도로 보편의 가치를 탐색한다. 관람자는 회면 사이사이에 마련된 여백의 간격, 점과 선이 만드는 정력, 색면이 바꾸는 박자를 따라가며 ''보이는 것과 그 사이''를 왕래 된다.',
  '갤러리제이원 서울', '서울',
  '화-토 10:00-18:00',
  '무료',
  '02-733-0101',
  '서울 종로구 북촌로 5가길 24'
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  operating_hours,
  ticket_info
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-27' AND end_date = '2025-09-28' ORDER BY created_at DESC LIMIT 1),
  'en',
  'Yoon Hyungjae Solo Exhibition',
  ARRAY['Yoon Hyungjae'],
  'This exhibition traces the flow of thought that artist Yoon Hyungjae has explored from his early white paintings to recent structural works. The artist explores universal values with the attitude that "what is invisible is seen with the heart." Viewers navigate between "what is visible and what lies between" by following the intervals of empty space between surfaces, the tension created by dots and lines, and the rhythm changed by color planes.',
  'Gallery J1 Seoul', 'Seoul',
  'Tue-Sat 10:00-18:00',
  'Free'
);

-- ========================================
-- 52. 상업화랑 - Poetic Forensic
-- ========================================

-- exhibitions_master 삽입
INSERT INTO exhibitions_master (
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student, ticket_price_child,
  genre, exhibition_type,
  created_at, updated_at
) VALUES (
  '2025-08-27', '2025-09-27', 'ongoing',
  0, 0, 0,  -- 무료
  'contemporary', 'group',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  operating_hours,
  ticket_info,
  address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-27' AND end_date = '2025-09-27' AND exhibition_type = 'group' ORDER BY created_at DESC LIMIT 1),
  'ko',
  'Poetic Forensic',
  ARRAY['김재욱', '김지민', '남민오', '서정우', '송다슬', '신성민', '아하콜렉티브', '이서진', '이영서', '전영현', '정성진', '최우형', '하카손', '황민규'],
  '상업화랑의 2025 차세대 작가 프로모션 전시. 데이터는 세계 속에서 포착된 사실의 단편이자 아직 맥락화 되지 않은 기호의 집합이다. 정보는 이러한 데이터가 해석을 거쳐 의미를 획득한 상태를 가리킨다. 축적된 데이터는 때때로 무의미로 전락하고, 불완전하거나 왜곡된 정보는 역설적으로 세계를 더욱 정밀하게 드러내기도 한다. 중요한 것은 참과 거짓의 단순한 판별이 아니라, 데이터와 정보가 남긴 균열과 공백을 통해 진동을 시적 포렌식으로 들여다본다.',
  '상업화랑 을지로', '서울',
  '화-토 11:00-18:00',
  '무료',
  '서울시 중구 청파동 3가 130-13'
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  operating_hours,
  ticket_info
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-27' AND end_date = '2025-09-27' AND exhibition_type = 'group' ORDER BY created_at DESC LIMIT 1),
  'en',
  'Poetic Forensic',
  ARRAY['Kim Jaewook', 'Kim Jimin', 'Nam Mino', 'Seo Jeongwoo', 'Song Daseul', 'Shin Sungmin', 'Aha Collective', 'Lee Seojin', 'Lee Youngseo', 'Jeon Younghyeon', 'Jung Sungjin', 'Choi Woohyung', 'Hakason', 'Hwang Mingyu'],
  'Sahng-up Gallery''s 2025 next-generation artist promotion exhibition. Data are fragments of facts captured in the world and collections of signs not yet contextualized. Information refers to the state where such data has acquired meaning through interpretation. While data remains at the level of potential possibility, information organizes the world and reconstructs perception through specificity and differentiation. This exhibition looks at the cracks and gaps left by data and information through poetic forensics.',
  'Sahng-up Gallery Euljiro', 'Seoul',
  'Tue-Sat 11:00-18:00',
  'Free'
);

-- ========================================
-- 53. 갤러리조은 - 오세열: Since 1965
-- ========================================

-- exhibitions_master 삽입
INSERT INTO exhibitions_master (
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student, ticket_price_child,
  genre, exhibition_type,
  created_at, updated_at
) VALUES (
  '2025-08-28', '2025-09-20', 'ongoing',
  0, 0, 0,  -- 무료
  'contemporary', 'solo',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  operating_hours,
  ticket_info,
  phone_number, address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-28' AND end_date = '2025-09-20' ORDER BY created_at DESC LIMIT 1),
  'ko',
  '오세열: Since 1965',
  ARRAY['오세열'],
  '한국 현대미술의 거장 오세열의 데뷔 60년을 기념하는 전시. 초기 인물화에서부터 반추상과 기호, 숫자, 오브제를 결합한 근작까지, 60년에 걸친 예술의 여정을 총망라한다. ''잘 그리려는 순간 순수성이 사라진다''는 신념 아래, 단순함 속에서 회화의 본질을 추구해온 오세열의 ''제목 없는 걸작''을 한 자리에서 만날 수 있다. 1990년대 이후 등장한 숫자 연작은 그의 예술 세계의 정수를 보여준다.',
  '갤러리조은', '서울',
  '월-토 10:00-18:00 (일요일, 공휴일 휴무)',
  '무료',
  '02-790-5889',
  'contact@galleryjoeun.com',
  '서울시 용산구 이태원로 55가길 3'
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  operating_hours,
  ticket_info
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-28' AND end_date = '2025-09-20' ORDER BY created_at DESC LIMIT 1),
  'en',
  'Oh Se-yeol: Since 1965',
  ARRAY['Oh Se-yeol'],
  'Commemorating 60 years since the debut of Korean contemporary art master Oh Se-yeol. The exhibition encompasses his artistic journey spanning 60 years, from early portraits to recent works combining semi-abstraction with symbols, numbers, and objects. Guided by his conviction that "the moment one tries to paint well, purity is lost," Oh has consistently pursued the essence of painting through simplicity. Since the 1990s, his number series has epitomized the essence of his artistic world.',
  'Gallery Joeun', 'Seoul',
  'Mon-Sat 10:00-18:00 (Closed Sundays, Holidays)',
  'Free'
);

-- ========================================
-- 54. 리안갤러리 서울 - 남춘모: From the lines
-- ========================================

-- exhibitions_master 삽입
INSERT INTO exhibitions_master (
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student, ticket_price_child,
  genre, exhibition_type,
  created_at, updated_at
) VALUES (
  '2025-08-28', '2025-10-15', 'ongoing',
  0, 0, 0,  -- 무료
  'contemporary', 'solo',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  operating_hours,
  ticket_info,
  phone_number, address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-28' AND end_date = '2025-10-15' ORDER BY created_at DESC LIMIT 1),
  'ko',
  'From the lines',
  ARRAY['남춘모'],
  '남춘모는 경북 영양의 산비탈과 밭고랑, 흙과 비닐, 손끝의 감각 같은 유년기의 기억을 ''선''이라는 조형적 언어로 되살려왔다. 선은 작가에게 감각의 흐름이자 시간을 쌓는 행위이며, 기억과 공간을 연결하는 구조이다. 반복적인 선 긋기는 노동 집약적 수행으로서 감각의 사유를 이끌어내고, 평면과 입체, 구조와 리듬이 교차하는 고유한 회화 세계를 형성한다. 한지라는 전통 재료의 고유한 질감이 더해져 현대적 해석과 전통적 정서가 절묘하게 결합된다.',
  '리안갤러리 서울', '서울',
  '화-토 10:00-18:00 (일, 월 휴무)',
  '무료',
  '02-730-2243',
  'info@leeahngallery.com',
  '서울 종로구 자하문로12길 9'
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  operating_hours,
  ticket_info
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-28' AND end_date = '2025-10-15' ORDER BY created_at DESC LIMIT 1),
  'en',
  'From the lines',
  ARRAY['Nam Tchun-Mo'],
  'Nam Tchun-Mo has revived memories of his childhood—the slopes and furrows of fields in Yeongyang, the soil and plastic sheets, and sensations at his fingertips—through the formative language of "lines." For the artist, the line is a flow of sensation, an act of accumulating time, and a structure connecting memory and space. His repeated line-drawing becomes a labor-intensive practice evoking sensory contemplation, shaping a distinctive painterly world where plane and volume, structure and rhythm intersect. The materiality of Hanji enriches his work, creating subtle harmony between contemporary interpretation and traditional sentiment.',
  'LEEAHN Gallery Seoul', 'Seoul',
  'Tue-Sat 10:00-18:00 (Sun, Mon Closed)',
  'Free'
);

-- ========================================
-- 55. 갤러리 나우 - 소리 없는 노래
-- ========================================

-- exhibitions_master 삽입
INSERT INTO exhibitions_master (
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student, ticket_price_child,
  genre, exhibition_type,
  created_at, updated_at
) VALUES (
  '2025-08-28', '2025-09-27', 'ongoing',
  0, 0, 0,  -- 무료
  'contemporary', 'solo',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  operating_hours,
  ticket_info,
  phone_number, address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-28' AND end_date = '2025-09-27' ORDER BY created_at DESC LIMIT 1),
  'ko',
  '소리 없는 노래',
  ARRAY['정해윤'],
  '정해윤은 이 전시를 통해 언어의 폭력이 일상화된 현대 사회를 성찰한다. ''침묵''은 이 전시에서 중요한 상징이다. 말보다 깊은 언어, 소리보다 강한 울림. 침묵이 결코 무기력이 아닌, 가장 절제된 방식의 저항과 연대가 될 수 있음을 조용히 말한다. 작가는 인조잔디라는 재료를 통해 불안과 인정받고 싶은 마음을 표현하며, "소리가 없다고 해서 노래가 없는 것은 아니다"라고 말한다.',
  '갤러리 나우', '서울',
  '10:00-18:00 (일, 월 휴무)',
  '무료',
  '02-725-2930',
  'gallerynow@hanmail.net',
  '서울 강남구 언주로 152, 16'
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  operating_hours,
  ticket_info
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-28' AND end_date = '2025-09-27' ORDER BY created_at DESC LIMIT 1),
  'en',
  'Silent Song',
  ARRAY['Jung Haeyoon'],
  'Jung Haeyoon reflects on modern society where verbal violence has become normalized. "Silence" is an important symbol in this exhibition - a language deeper than words, a resonance stronger than sound. The artist quietly suggests that silence is not powerlessness, but can be the most restrained form of resistance and solidarity. Using artificial turf as material to express anxiety and the desire for recognition, the artist states "the absence of sound does not mean the absence of song."',
  'Gallery NoW', 'Seoul',
  '10:00-18:00 (Closed Sun, Mon)',
  'Free'
);

-- ========================================
-- 56. 갤러리 키체 - Scattered Words
-- ========================================

-- exhibitions_master 삽입
INSERT INTO exhibitions_master (
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student, ticket_price_child,
  genre, exhibition_type,
  created_at, updated_at
) VALUES (
  '2025-08-28', '2025-09-27', 'ongoing',
  0, 0, 0,  -- 무료
  'contemporary', 'group',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  operating_hours,
  ticket_info,
  address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-28' AND end_date = '2025-09-27' AND exhibition_type = 'group' ORDER BY created_at DESC LIMIT 1),
  'ko',
  'Scattered Words',
  ARRAY['박영민', '유지영', '이은우'],
  '이 전시는 공간 설치, 회화, 오브제, 드로잉 등의 시각적 방법론 안에서 작가들이 "무엇"을 "어떻게" 인식하고 다루는지 탐구한다. 세 작가는 일상생활의 틀이나 그 안의 경험들을 면밀히 살펴보며 고유한 조건을 확립한다. 이 무대 위에서 "시간", "기억", "사물의 표면"이 우리 주변의 "흩어진 단어들"을 엮어내는 이정표가 되어, 관람객들이 자신만의 문장을 구성하고 새롭게 상상하도록 초대한다. [특별 프로그램: 오프닝 리셉션 8/28(목) 17:00]',
  '갤러리 키체', '서울',
  '수-토 12:00-18:00 (일, 월, 화 휴무)',
  '무료',
  '서울 성북구 창경궁로 43길 27'
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  operating_hours,
  ticket_info
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-28' AND end_date = '2025-09-27' AND exhibition_type = 'group' ORDER BY created_at DESC LIMIT 1),
  'en',
  'Scattered Words',
  ARRAY['Youngmin Park', 'Jiyoung Yoo', 'Eunu Lee'],
  'This exhibition explores how the artists perceive and engage with "what" and "how" within their chosen visual methodologies—spatial installation, painting, object, and drawing. The three artists closely examine the framework of everyday life or experiences within it, establishing unique conditions. On this stage, "time," "memory," and "the surface of things" become guideposts that weave together the "scattered words" around us, inviting viewers to construct their own sentences and imagine anew. [Special Program: Opening Reception 8/28(Thu) 17:00]',
  'Gallery Kiche', 'Seoul',
  'Wed-Sat 12:00-18:00 (Closed Sun, Mon, Tue)',
  'Free'
);

-- ========================================
-- 57. 누크갤러리 - 회화의 이름_풍경의 두께
-- ========================================

-- exhibitions_master 삽입
INSERT INTO exhibitions_master (
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student, ticket_price_child,
  genre, exhibition_type,
  created_at, updated_at
) VALUES (
  '2025-08-28', '2025-09-27', 'ongoing',
  0, 0, 0,  -- 무료
  'contemporary', 'duo',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  operating_hours,
  ticket_info,
  phone_number, address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-28' AND end_date = '2025-09-27' AND exhibition_type = 'duo' ORDER BY created_at DESC LIMIT 1),
  'ko',
  '회화의 이름_풍경의 두께',
  ARRAY['유근택', '정용국'],
  '유근택과 정용국은 한국화의 전통적 매체와 방법론을 현대적으로 재해석한다. 유근택은 질감 있는 붓질로 세계의 겹겹이 쌓인 복잡성을 표현하며, 정용국은 문인화의 철학과 방법론에서 출발해 먹의 매체를 재해석하고 빛, 소리, 설치로 확장한다. 반투명한 먹의 층을 통해 자연의 본질을 구축하는 정용국과 달리, 유근택은 텍스처가 있는 붓질로 세계의 밀도 높은 복잡성을 표현한다.',
  '누크갤러리', '서울',
  '화-토 11:00-18:00',
  '무료',
  '02-732-7241',
  'nookgallery1@gmail.com',
  '서울 종로구 평창34길 8-3'
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  operating_hours,
  ticket_info
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-28' AND end_date = '2025-09-27' AND exhibition_type = 'duo' ORDER BY created_at DESC LIMIT 1),
  'en',
  'The Name of the Painting_Layered Landscape',
  ARRAY['Yoo Geun-Taek', 'Jeong Yongkook'],
  'Yoo Geun-Taek and Jeong Yongkook reinterpret traditional Korean painting media and methodologies in contemporary ways. Jeong Yongkook begins with the philosophy and methodology of literati painting, reinterprets the medium of ink wash, and expands it through light, sound, and installation. While Yoo articulates the densely layered complexities of the world through textured brushwork, Jung builds the essence of nature through translucent ink layers.',
  'nook gallery', 'Seoul',
  'Tue-Sat 11:00-18:00',
  'Free'
);

-- ========================================
-- 58. 토탈미술관 - 유니 폼: 브로큰 트윌
-- ========================================

-- exhibitions_master 삽입
INSERT INTO exhibitions_master (
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student, ticket_price_child,
  genre, exhibition_type,
  created_at, updated_at
) VALUES (
  '2025-08-28', '2025-10-28', 'ongoing',
  0, 0, 0,  -- 무료
  'contemporary', 'group',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  operating_hours,
  ticket_info,
  address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-28' AND end_date = '2025-10-28' ORDER BY created_at DESC LIMIT 1),
  'ko',
  '유니 폼: 브로큰 트윌',
  ARRAY['최철용', '히토 슈타이얼', '안톤 셰벳코', '에밀리 브루 & 막심 마리옹', '문형민', '손구용'],
  '패션 디자이너이자 현대미술 작가 최철용의 전시로, 유니폼이라는 제도적 형식을 해체하고 재구성한다. ''유니 폼(uni form)''은 하나(uni)와 형식(form) 사이의 간극을 드러내기 위해 의도적으로 띄어 썼다. 핵심 개념인 ''브로큰 트윌''은 직조 기법에서 비롯된 용어로 반복적인 패턴을 일부러 끊거나 비트는 방식을 뜻한다. 다양한 분야 전문가들과 함께 구성된 코어그룹형 기획 전시.',
  '토탈미술관', '서울',
  '화-일 11:00-18:00 (월 휴관)',
  '무료',
  '서울 종로구 평창32길 8'
);

INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title,
  artists,
  description,
  venue_name, city,
  operating_hours,
  ticket_info
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-28' AND end_date = '2025-10-28' ORDER BY created_at DESC LIMIT 1),
  'en',
  'uni form: Broken Twill',
  ARRAY['Choi Cheol-yong', 'Hito Steyerl', 'Anton Shebetko', 'Émilie Brout & Maxime Marion', 'Moon Hyung-min', 'Son Gu-yong'],
  'An exhibition by fashion designer and contemporary artist Choi Cheol-yong, deconstructing and reconstructing the institutional form of uniforms. "uni form" is intentionally spaced to reveal the gap between one (uni) and form. The core concept "Broken Twill" originates from weaving technique, referring to deliberately breaking or twisting repetitive patterns. A core-group curated exhibition with experts from various fields.',
  'Total Museum', 'Seoul',
  'Tue-Sun 11:00-18:00 (Closed Mon)',
  'Free'
);

-- ========================================
-- 60번: 더 월로 / 패치워크! (8.28-9.28)
-- ========================================
INSERT INTO exhibitions_master (
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student, ticket_price_child,
  genre, exhibition_type,
  created_at, updated_at
) VALUES (
  '2025-08-28', '2025-09-28', 'ongoing',
  0, 0, 0,
  'contemporary', 'group',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

-- 한글 번역
INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title, artists, description,
  venue_name, city,
  operating_hours,
  ticket_info,
  address,
  email
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-28' AND end_date = '2025-09-28' ORDER BY created_at DESC LIMIT 1),
  'ko',
  '패치워크!',
  ARRAY['박선호', '사토 토모코', '아오야기 나츠미', '임지지'],
  '점점 더 단순화하고 정보 중심적으로 변하는 텍스트와 빠르게 소비되는 이미지의 시대에, 이미지 조각들과 파편적 말들로 비가시적인 감각과 비선형적 서사의 가능성을 길어올린다. 각기 다른 방식으로 파편들이 꿰매는 방식으로, 관람자에게 전시를 각자의 서사로 읽는 경험을 만든다. 이때 전시장은 미완의 조각들이 서로를 향해 기우는 장소이며, 관람자의 몸은 그 이야기의 일시적 매듭이 된다.',
  '더 월로', '서울',
  '화-일 11:00-18:00 (월요일 휴일)',
  '무료',
  '서울 동대문구 고산자로 36길 38, 2층',
  'thewillow1955@gmail.com'
);

-- 영문 번역
INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title, artists, description,
  venue_name, city,
  operating_hours,
  ticket_info,
  address,
  email
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-28' AND end_date = '2025-09-28' ORDER BY created_at DESC LIMIT 1),
  'en',
  'Patchwork!',
  ARRAY['Sunho Park', 'Tomoko Sato', 'Natsumi Aoyagi', 'Imzizi'],
  'Foregrounds the possibilities of invisible sensations and nonlinear narratives in an era dominated by efficiency, simplified text, and rapidly consumed images. By stitching fragments together in shifting ways, the exhibition creates a reading experience in which viewers weave their own narratives. The exhibition space becomes a site where unfinished pieces lean toward one another, and the viewers body becomes a temporary knot in the unfolding story.',
  'The WilloW', 'Seoul',
  'Tue-Sun 11:00-18:00 (Closed Mon)',
  'Free',
  '2F, 38, Gosanja-ro 36-gil, Dongdaemun-gu, Seoul',
  'thewillow1955@gmail.com'
);

-- ========================================
-- 61번: 아뜰리에 아키 / 임현정 (8.28-9.28)
-- ========================================
INSERT INTO exhibitions_master (
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student, ticket_price_child,
  genre, exhibition_type,
  created_at, updated_at
) VALUES (
  '2025-08-28', '2025-10-04', 'ongoing',
  0, 0, 0,
  'contemporary', 'solo',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

-- 한글 번역
INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title, artists, description,
  venue_name, city,
  operating_hours,
  ticket_info,
  address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-28' AND end_date = '2025-10-04' ORDER BY created_at DESC LIMIT 1),
  'ko',
  '마음의 아카이브: 태평양을 건너며',
  ARRAY['임현정'],
  '정형화된 기억의 저장소가 아니라, 계속해서 흐르고 확장되는 임현정의 마음의 풍경을 보여주며, 삶과 예술, 현실과 상상, 자신과 타인이 만나는 지점에서 진정한 회화적 소통의 가능성을 탐구한다. 관객들은 이 여정 속에서, 자신만의 감정 지형과 내면의 전이를 새롭게 발견하는 아카이브의 장을 경험하게 될 것이다.',
  '아뜰리에 아키', '서울',
  '월-토 10:00-19:00 (일요일, 공휴일 휴관)',
  '무료',
  '서울 성동구 서울숲2길 32-14, 갤러리아포레 1층'
);

-- 영문 번역
INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title, artists, description,
  venue_name, city,
  operating_hours,
  ticket_info,
  address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-28' AND end_date = '2025-10-04' ORDER BY created_at DESC LIMIT 1),
  'en',
  'Archive of the Mind: Pacific Crossing',
  ARRAY['Hyunjeong Lim'],
  'Rather than a formalized repository of memory, this exhibition presents Hyunjeong Lims continuously flowing and expanding landscape of the mind, exploring the possibility of genuine painterly communication at the intersection of life and art, reality and imagination, self and others. In this journey, audiences will experience an archive where they discover their own emotional terrain and inner transitions anew.',
  'ATELIER AKI', 'Seoul',
  'Mon-Sat 10:00-19:00 (Closed Sun, National Holidays)',
  'Free',
  '1F Galleria Foret, 32-14, Seoulsup 2-gil, Seongdong-gu, Seoul'
);

-- ========================================
-- 62번: 바라캇 컨템포러리 / 지미 로버트 (8.28-10.28)
-- ========================================
INSERT INTO exhibitions_master (
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student, ticket_price_child,
  genre, exhibition_type,
  created_at, updated_at
) VALUES (
  '2025-08-28', '2025-10-26', 'ongoing',
  0, 0, 0,
  'contemporary', 'solo',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

-- 한글 번역
INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title, artists, description,
  venue_name, city,
  operating_hours,
  ticket_info,
  address,
  phone_number,
  email
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-28' AND end_date = '2025-10-26' ORDER BY created_at DESC LIMIT 1),
  'ko',
  '에클립세',
  ARRAY['지미 로버트'],
  '지미 로버트의 국내 첫 개인전. 전시 제목 에클립세(Éclipser)는 프랑스어로 가리다, 식(蝕)을 일으킨다를 뜻합니다. 동사와 명사 사이를 오가고자 하는 것은 지미 로버트의 예술적 태도와 맞닿아 있는 동시에 천체가 가려지는 동선과 나타나는 반영(半影)을 상상해보기 위함입니다. 이는 단순히 사라짐을 의미하는 것이 아니라, 가려지는 순간 드러나는 새로운 형상과 리듬, 보이지 않는 틈에서 발생하는 또 다른 가능성을 내포합니다.',
  '바라캇 컨템포러리', '서울',
  '화-일 10:00-18:00 (월요일 휴관)',
  '무료',
  '서울 종로구 삼청로 58-4',
  '02-780-1949',
  'contemporary@barakat.kr'
);

-- 영문 번역
INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title, artists, description,
  venue_name, city,
  operating_hours,
  ticket_info,
  address,
  phone_number,
  email
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-28' AND end_date = '2025-10-26' ORDER BY created_at DESC LIMIT 1),
  'en',
  'Éclipser',
  ARRAY['Jimmy Robert'],
  'Jimmy Roberts first solo exhibition in Korea. The title Éclipser means to obscure or to cause an eclipse in French. Moving between verb and noun reflects Roberts artistic attitude while imagining the trajectory of celestial obscuration and resulting penumbra. This implies not simply disappearance, but rather the emergence of new forms and rhythms in the act of being obscured, and the latent possibilities arising from unseen intervals.',
  'Barakat Contemporary', 'Seoul',
  'Tue-Sun 10:00-18:00 (Closed Mon)',
  'Free',
  '58-4 Samcheong-ro, Jongno-gu, Seoul',
  '02-780-1949',
  'contemporary@barakat.kr'
);

-- ========================================
-- 63번: 서울시립 미술아카이브 / 다시, 지구 (8.28-11.28)
-- ========================================
INSERT INTO exhibitions_master (
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student, ticket_price_child,
  genre, exhibition_type,
  created_at, updated_at
) VALUES (
  '2025-08-28', '2026-02-22', 'ongoing',
  0, 0, 0,
  'contemporary', 'group',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

-- 한글 번역
INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title, artists, description,
  venue_name, city,
  operating_hours,
  ticket_info,
  address,
  phone_number,
  email
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-28' AND end_date = '2026-02-22' ORDER BY created_at DESC LIMIT 1),
  'ko',
  '다시, 지구: 다른 감각으로 응답하기',
  ARRAY['김준', '김해심', '송민규', '이르완 아멧&티타 살리나', '장한나', '최장원', '최찬숙'],
  '인류세라는 시대적 문제에 대해 미술은 무엇을 어떻게 다루고 실천할 수 있는지를 질문하고 시도한다. 인간 중심주의에서 물러나 다른 관점과 자리에 서려는 의지와 시도 그리고 수행이 필요하다. 우리는 지구에 속하고 기대고 있는 존재이며 지구 상의 비인간 존재와 연결되었다는 사실을 자각하고 화답하며 끊임없이 결론을 다시 써내려 간다.',
  '서울시립 미술아카이브', '서울',
  '화-금 10:00-20:00, 매월 첫째·셋째 금요일 10:00-22:00, 토일공휴일 하절기(3-10월) 10:00-19:00, 동절기(11-2월) 10:00-18:00',
  '무료',
  '서울특별시 종로구 평창문화로 101',
  '02-2124-7400',
  'semaaa@seoul.go.kr'
);

-- 영문 번역
INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title, artists, description,
  venue_name, city,
  operating_hours,
  ticket_info,
  address,
  phone_number,
  email
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-28' AND end_date = '2026-02-22' ORDER BY created_at DESC LIMIT 1),
  'en',
  'Earth, Once More: Responding with a New Sensibility',
  ARRAY['Kim Jun', 'Kim Hae-sim', 'Song Min-gyu', 'Irwan Ahmett & Tita Salina', 'Jang Han-na', 'Choi Jang-won', 'Choi Chan-sook'],
  'The exhibition raises questions about what art can do, what it can deal with, and how, regarding the epochal issue of the Anthropocene. What is most necessary is to withdraw from anthropocentrism, which puts humans in a superior status; to resolve to take a different position and perspective; and to actually attempt to act on the basis of that perspective.',
  'Seoul Museum of Art Archive', 'Seoul',
  'Tue-Fri 10:00-20:00, 1st & 3rd Fri 10:00-22:00, Weekends/Holidays Summer(Mar-Oct) 10:00-19:00, Winter(Nov-Feb) 10:00-18:00',
  'Free',
  '101 Pyeongchang-munhwa-ro, Jongno-gu, Seoul',
  '02-2124-7400',
  'semaaa@seoul.go.kr'
);

-- ========================================
-- 64번: 상히읗 / 이지수 (8.28-9.28)
-- ========================================
INSERT INTO exhibitions_master (
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student, ticket_price_child,
  genre, exhibition_type,
  created_at, updated_at
) VALUES (
  '2025-08-28', '2025-09-27', 'ongoing',
  0, 0, 0,
  'contemporary', 'solo',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

-- 한글 번역
INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title, artists, description,
  venue_name, city,
  operating_hours,
  ticket_info,
  address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-28' AND end_date = '2025-09-27' ORDER BY created_at DESC LIMIT 1),
  'ko',
  'Doorstep',
  ARRAY['이지수'],
  '타인에 의해 침범당한 사적 공간의 경계를 탐구하는 신작을 소개하는 전시. 이질적인 대상들을 병치하거나 혼합한 회화 및 조각 신작을 선보인다. 계란인 척하는 농구공, 농구공인 척하는 계란, 혹은 거미줄을 닮은 접시의 균열같은 일련의 형상들은 언뜻 유사해 보이지만 얇은 막을 걷어내면 전혀 다른 본질이 드러난다.',
  '상히읗', '서울',
  '화-토 11:00-18:00 (일월 휴관)',
  '무료',
  '서울 용산구 신흥로 30'
);

-- 영문 번역
INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title, artists, description,
  venue_name, city,
  operating_hours,
  ticket_info,
  address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-28' AND end_date = '2025-09-27' ORDER BY created_at DESC LIMIT 1),
  'en',
  'Doorstep',
  ARRAY['Jisoo Lee'],
  'Rooted in her personal experience, Lees practice examines the boundaries of private spaces that have been breached or destabilized by external forces. Through painting and installation, she articulates the uneasy tension between visibility and vulnerability within spaces presumed to offer safety and autonomy.',
  'sangheeut', 'Seoul',
  'Tue-Sat 11:00-18:00 (Closed Sun-Mon)',
  'Free',
  '30, Sinheung-ro, Yongsan-gu, Seoul'
);

-- ========================================
-- 65번: 세화미술관 / 노노탁 스튜디오 (8.30-12.31)
-- ========================================
INSERT INTO exhibitions_master (
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student, ticket_price_child,
  genre, exhibition_type,
  created_at, updated_at
) VALUES (
  '2025-08-30', '2025-12-31', 'ongoing',
  15000, 10000, 8000,
  'media', 'solo',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

-- 한글 번역
INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title, artists, description,
  venue_name, city,
  operating_hours,
  ticket_info,
  address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-30' AND end_date = '2025-12-31' ORDER BY created_at DESC LIMIT 1),
  'ko',
  '노노탁',
  ARRAY['노노탁 스튜디오', '노에미 쉬퍼', '타카미 나카모토'],
  '세계적으로 유명한 크리에이티브 듀오 노노탁 스튜디오의 한국 첫 개인전. 시각, 청각, 공간 지각을 넘나드는 대규모 몰입형 작품을 선보인다. 감각을 깨우고 예술 경험에 대한 새로운 질문을 던진다. 정교하게 조율된 빛과 소리가 리듬을 생성하여 시공간을 초월한 몰입을 제공한다.',
  '세화미술관', '서울',
  '화-일 10:00-18:00 (월요일 휴관)',
  '성인 15,000원, 학생 10,000원, 어린이 8,000원',
  '서울특별시 종로구 새문안로 68'
);

-- 영문 번역
INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title, artists, description,
  venue_name, city,
  operating_hours,
  ticket_info,
  address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-30' AND end_date = '2025-12-31' ORDER BY created_at DESC LIMIT 1),
  'en',
  'NONOTAK',
  ARRAY['NONOTAK STUDIO', 'Noemi Schipfer', 'Takami Nakamoto'],
  'The first solo presentation in Korea by the world-renowned creative duo NONOTAK STUDIO, showcasing large-scale immersive works that traverse visual, auditory, and spatial perception. Their practice awakens the senses and poses new questions about the very act of experiencing art. Meticulously orchestrated light and sound generate rhythms that offer an immersion that transcends space and time.',
  'Sehwa Museum of Art', 'Seoul',
  'Tue-Sun 10:00-18:00 (Closed Mon)',
  'Adults 15,000 KRW, Students 10,000 KRW, Children 8,000 KRW',
  '68 Saemunan-ro, Jongno-gu, Seoul'
);

-- ========================================
-- 66번: 세화미술관 / 쿠사마 야요이 (8.30-11.30)
-- ========================================
INSERT INTO exhibitions_master (
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student, ticket_price_child,
  genre, exhibition_type,
  created_at, updated_at
) VALUES (
  '2025-08-30', '2025-11-30', 'ongoing',
  15000, 10000, 8000,
  'installation', 'solo',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

-- 한글 번역
INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title, artists, description,
  venue_name, city,
  operating_hours,
  ticket_info,
  address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-30' AND end_date = '2025-11-30' ORDER BY created_at DESC LIMIT 1),
  'ko',
  '세화 컬렉션: 새로운 세계를 향한 이정표',
  ARRAY['쿠사마 야요이'],
  '야요이 쿠사마의 설치 작업을 만날 수 있는 특별한 전시. 미술관 소장품인 새로운 세계를 향한 이정표는 빨간 물방울 모양의 여러 조각이 모여 하나를 이룹니다. 쿠사마의 트레이드 마크 중 하나인 점(dot) 무늬를 입은 이 작품은 붉은 색채와 하얀 패턴이 돋보입니다. 반짝거리는 사탕처럼 칠해진 조각품은 곡선의 아름다운 형태를 간직하며, 미지로 향하는 길을 안내하는 듯합니다.',
  '세화미술관', '서울',
  '화-일 10:00-18:00 (월요일, 추석 당일, 크리스마스 휴관)',
  '노노탁 전시 통합 관람',
  '서울특별시 종로구 새문안로 68 흥국생명빌딩 2층'
);

-- 영문 번역
INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title, artists, description,
  venue_name, city,
  operating_hours,
  ticket_info,
  address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-30' AND end_date = '2025-11-30' ORDER BY created_at DESC LIMIT 1),
  'en',
  'Sehwa Collection: Guidepost to the New World',
  ARRAY['Yayoi Kusama'],
  'A special exhibition featuring installation work by Yayoi Kusama. The museums collection piece Guidepost to the New World consists of multiple red water droplet-shaped sculptures coming together as one. Adorned with Kusamas trademark dot pattern, this work features striking red colors and white patterns. The candy-like painted sculptures maintain beautiful curved forms while each droplet piece guides viewers toward the unknown.',
  'Sehwa Museum of Art', 'Seoul',
  'Tue-Sun 10:00-18:00 (Closed Mon, Chuseok, Christmas)',
  'Combined ticket with NONOTAK exhibition',
  '2F Heungkuk Life Insurance Building, 68 Saemunan-ro, Jongno-gu, Seoul'
);

-- ========================================
-- 67번: 화이트스톤갤러리 / 헨릭 울달렌 (8.30-10.19)
-- ========================================
INSERT INTO exhibitions_master (
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student, ticket_price_child,
  genre, exhibition_type,
  created_at, updated_at
) VALUES (
  '2025-08-30', '2025-10-19', 'ongoing',
  0, 0, 0,
  'painting', 'solo',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

-- 한글 번역
INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title, artists, description,
  venue_name, city,
  operating_hours,
  ticket_info,
  address,
  phone_number
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-30' AND end_date = '2025-10-19' ORDER BY created_at DESC LIMIT 1),
  'ko',
  'LOST/FOUND',
  ARRAY['헨릭 울달렌'],
  '한국에서 태어나 노르웨이로 입양된 경험을 가진 작가의 한국 첫 개인전. 독학으로 고전적 인물화를 익힌 후 이를 현대적으로 재해석하며 표현주의 작업을 이어오고 있다. 작품 속 흐릿한 시선을 가진 인물들은 외로움과 단절, 존재의 불안을 시각화한다. 1950년대 이후 해외로 입양된 수많은 한국 입양인이 공유하는 상실과 단절의 감정을 진홍빛 바탕 위로 떠오르는 추상적 형상과 두터운 임파스토, 본능적인 제스처로 표현한다.',
  '화이트스톤갤러리', '서울',
  '화-일 11:00-19:00 (월요일 휴관)',
  '무료',
  '서울시 용산구 소월로 70',
  '02-318-1012'
);

-- 영문 번역
INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title, artists, description,
  venue_name, city,
  operating_hours,
  ticket_info,
  address,
  phone_number
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-30' AND end_date = '2025-10-19' ORDER BY created_at DESC LIMIT 1),
  'en',
  'LOST/FOUND',
  ARRAY['Henrik Aa. Uldalen'],
  'The first solo exhibition in Korea by Korean-Norwegian artist Henrik Aa. Uldalen, who was born in Korea and adopted to Norway. Self-taught in classical portraiture, he reinterprets it in a contemporary way through expressionist work. The figures with blurred gazes in his works visualize loneliness, disconnection, and existential anxiety. The artist expresses the feelings of loss and disconnection shared by numerous Korean adoptees sent abroad since the 1950s through abstract forms, thick impasto, and instinctive gestures on crimson backgrounds.',
  'Whitestone Gallery', 'Seoul',
  'Tue-Sun 11:00-19:00 (Closed Mon)',
  'Free',
  '70 Sowol-ro, Yongsan-gu, Seoul',
  '02-318-1012'
);

-- ========================================
-- 68번: 글래드스톤갤러리 / 우고 론디노네 (8.29-10.30)
-- ========================================
INSERT INTO exhibitions_master (
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student, ticket_price_child,
  genre, exhibition_type,
  created_at, updated_at
) VALUES (
  '2025-08-29', '2025-10-18', 'ongoing',
  0, 0, 0,
  'painting', 'solo',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

-- 한글 번역
INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title, artists, description,
  venue_name, city,
  operating_hours,
  ticket_info,
  address,
  phone_number
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-29' AND end_date = '2025-10-18' ORDER BY created_at DESC LIMIT 1),
  'ko',
  'in beauty bright',
  ARRAY['우고 론디노네'],
  '글래드스톤갤러리 서울에서 열리는 우고 론디노네의 첫 개인전. 다양한 크기의 13점의 새로운 풍경화를 선보인다. 각 작품은 캔버스에 수채화로 그려졌으며, 분홍, 파랑, 노랑, 보라, 초록의 같은 다섯 가지 파스텔 색조로 구성되어 있다. 구성은 동일하며, 산중 호수를 묘사하기 위해 단 네 개의 선만을 사용한다. 전시 제목은 윌리엄 블레이크의 1789년 컬렉션 Songs of Innocence 중 자장가 A Cradle Song에서 가져왔다.',
  '글래드스톤갤러리', '서울',
  '화-토 10:00-18:00',
  '무료',
  '서울시 강남구 삼성로 760',
  '02-6218-0760'
);

-- 영문 번역
INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title, artists, description,
  venue_name, city,
  operating_hours,
  ticket_info,
  address,
  phone_number
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-29' AND end_date = '2025-10-18' ORDER BY created_at DESC LIMIT 1),
  'en',
  'in beauty bright',
  ARRAY['Ugo Rondinone'],
  'Gladstone Gallerys first exhibition by Ugo Rondinone in Seoul. Features thirteen new landscapes in various sizes. Each work is a watercolor on canvas in its own arrangement of the same five pastel shades—pink, blue, yellow, purple, and green. The compositions are identical, using only four lines to depict a mountain lake. The exhibition title comes from William Blakes lullaby A Cradle Song from his 1789 collection Songs of Innocence.',
  'Gladstone Gallery', 'Seoul',
  'Tue-Sat 10:00-18:00',
  'Free',
  '760, Samseong-ro, Gangnam-gu, Seoul',
  '02-6218-0760'
);

-- ========================================
-- 69번: 재단법인 아름지기 / 장, 식탁으로 이어진 풍경 (8.29-10.29)
-- ========================================
INSERT INTO exhibitions_master (
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student, ticket_price_child,
  genre, exhibition_type,
  created_at, updated_at
) VALUES (
  '2025-08-29', '2025-11-15', 'ongoing',
  10000, 7000, 5000,
  'craft', 'group',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

-- 한글 번역
INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title, artists, description,
  venue_name, city,
  operating_hours,
  ticket_info,
  address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-29' AND end_date = '2025-11-15' ORDER BY created_at DESC LIMIT 1),
  'ko',
  '장, 식탁으로 이어진 풍경',
  ARRAY['김경찬', '김동준', '김민욱', '박선민', '백경원', '손민정', '안성규', '양유완', '온지음 디자인실', '이석우 SWNA', '이인진', '이지호', '정영균', '한정용', '황경원'],
  '사람의 정성과 자연의 시간을 담은 장(醬)이 음식, 도구, 공간과 만나 하나의 풍경이 됩니다. 전통 장을 단순히 맛을 내는 요소가 아니라, 일상에 담긴 미의식, 삶을 대하는 태도를 포함하는 총체적인 식문화의 관점으로 바라봅니다.',
  '아름지기', '서울',
  '화-토 10:00-18:00',
  '성인 10,000원, 학생 7,000원, 어린이 5,000원',
  '서울 종로구 통의동 아름지기 사옥'
);

-- 영문 번역
INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title, artists, description,
  venue_name, city,
  operating_hours,
  ticket_info,
  address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-29' AND end_date = '2025-11-15' ORDER BY created_at DESC LIMIT 1),
  'en',
  'Jang: Landscape Connected to the Table',
  ARRAY['Kim Gyeong-chan', 'Kim Dong-jun', 'Kim Min-wook', 'Park Seon-min', 'Baek Gyeong-won', 'Son Min-jeong', 'Ahn Seong-gyu', 'Yang Yu-wan', 'Onjium Design Studio', 'Lee Seok-woo SWNA', 'Lee In-jin', 'Lee Ji-ho', 'Jung Young-gyun', 'Han Jung-yong', 'Hwang Gyeong-won'],
  'Jang (fermented sauce) containing human devotion and natures time meets food, tools, and space to become a landscape. Traditional jang is viewed not simply as a flavoring element, but from a comprehensive food culture perspective that includes the aesthetic consciousness in daily life and attitudes toward life.',
  'Arumjigi', 'Seoul',
  'Tue-Sat 10:00-18:00',
  'Adults 10,000 KRW, Students 7,000 KRW, Children 5,000 KRW',
  'Arumjigi Building, Tongui-dong, Jongno-gu, Seoul'
);

-- ========================================
-- 70번: 대림미술관 / 페트라 콜린스 (8.29-11.30)
-- ========================================
INSERT INTO exhibitions_master (
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student, ticket_price_child,
  genre, exhibition_type,
  created_at, updated_at
) VALUES (
  '2025-08-29', '2025-12-31', 'ongoing',
  0, 0, 0,
  'photography', 'solo',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

-- 한글 번역
INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title, artists, description,
  venue_name, city,
  operating_hours,
  ticket_info,
  address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-29' AND end_date = '2025-12-31' ORDER BY created_at DESC LIMIT 1),
  'ko',
  '페트라 콜린스: fangirl',
  ARRAY['페트라 콜린스'],
  '특유의 색감과 몽환적인 분위기로 페트라 콜린스 스타일을 만들어낸 아티스트의 국내 최초·최대 규모 전시. 15살에 독학으로 사진을 시작한 페트라 콜린스는 청춘의 불완전한 감정과 기쁨, 설렘, 지루함, 광기가 공존하는 성장의 순간들을 담는다. 제니, 뉴진스, 젠틀몬스터 등 글로벌 셀럽과 브랜드들과 협업한 작품들을 만날 수 있다.',
  '대림미술관', '서울',
  '화-일 10:00-18:00 (월요일 휴관)',
  '무료 (온라인 회원 예약 필수)',
  '서울시 종로구 자하문로4길 21'
);

-- 영문 번역
INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title, artists, description,
  venue_name, city,
  operating_hours,
  ticket_info,
  address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-29' AND end_date = '2025-12-31' ORDER BY created_at DESC LIMIT 1),
  'en',
  'Petra Collins: fangirl',
  ARRAY['Petra Collins'],
  'The first and largest exhibition in Korea by the artist who created the Petra Collins style with her distinctive colors and dreamy atmosphere. Starting photography self-taught at 15, Petra Collins captures moments of growth where youth imperfect emotions, joy, excitement, boredom, and madness coexist. Features works from collaborations with global celebrities and brands including Jennie, NewJeans, and Gentle Monster.',
  'Daelim Museum', 'Seoul',
  'Tue-Sun 10:00-18:00 (Closed Mon)',
  'Free (Online member reservation required)',
  '21 Jahamun-ro 4-gil, Jongno-gu, Seoul'
);

-- ========================================
-- 71번: 국립현대미술관 서울 / 올해의 작가상 2025 (8.29-2026.2.1)
-- ========================================
INSERT INTO exhibitions_master (
  start_date, end_date, status,
  ticket_price_adult, ticket_price_student, ticket_price_child,
  genre, exhibition_type,
  created_at, updated_at
) VALUES (
  '2025-08-29', '2026-02-01', 'ongoing',
  2000, 1000, 500,
  'contemporary', 'group',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

-- 한글 번역
INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title, artists, description,
  venue_name, city,
  operating_hours,
  ticket_info,
  address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-29' AND end_date = '2026-02-01' ORDER BY created_at DESC LIMIT 1),
  'ko',
  '올해의 작가상 2025',
  ARRAY['김영은', '김지평', '언메이크랩', '임영주'],
  '국립현대미술관과 SBS문화재단이 2012년부터 공동으로 주최해 온 대표적인 현대미술 작가 후원 프로그램. 김영은은 소리와 청취를 정치적이고 역사적인 산물로 바라보는 작업을, 임영주는 전통과 동양화의 재해석을, 김지평은 한국 사회의 미신과 종교적 믿음을 탐구하며, 언메이크랩은 기술과 인간의 관계를 조명한다. 비가시적인 세계를 드러내는 재현의 역학을 파헤치며 세계를 인식하는 방식에 의문을 던진다.',
  '국립현대미술관 서울', '서울',
  '화-일 10:00-18:00, 수·토 10:00-21:00 (월요일 휴관)',
  '2,000원',
  '서울 종로구 삼청로 30'
);

-- 영문 번역
INSERT INTO exhibitions_translations (
  exhibition_id, language_code,
  exhibition_title, artists, description,
  venue_name, city,
  operating_hours,
  ticket_info,
  address
) VALUES (
  (SELECT id FROM exhibitions_master WHERE start_date = '2025-08-29' AND end_date = '2026-02-01' ORDER BY created_at DESC LIMIT 1),
  'en',
  'Korea Artist Prize 2025',
  ARRAY['Kim Young-eun', 'Kim Ji-pyung', 'Unmake Lab', 'Lim Young-ju'],
  'A leading contemporary art support program and award system jointly hosted by MMCA and SBS Cultural Foundation since 2012. Kim Young-eun presents work viewing sound and listening as political and historical products, Lim Young-ju reinterprets tradition and Oriental painting, Kim Ji-pyung explores superstition and religious beliefs in Korean society, and Unmake Lab illuminates the relationship between technology and humans. They uncover the dynamics of representation revealing invisible worlds and question how we perceive the world.',
  'National Museum of Modern and Contemporary Art, Seoul', 'Seoul',
  'Tue-Sun 10:00-18:00, Wed·Sat 10:00-21:00 (Closed Mon)',
  '2,000 KRW',
  '30 Samcheong-ro, Jongno-gu, Seoul'
);

-- ========================================
-- 최종 확인 쿼리
-- ========================================

SELECT 
  em.id,
  em.start_date,
  em.end_date,
  em.genre,
  em.exhibition_type,
  et.exhibition_title,
  et.venue_name,
  et.language_code
FROM exhibitions_master em
JOIN exhibitions_translations et ON em.id = et.exhibition_id
WHERE em.start_date >= '2025-08-14'
ORDER BY em.start_date, et.language_code;