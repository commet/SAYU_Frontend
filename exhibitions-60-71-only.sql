-- 🎨 SAYU 전시 데이터 업데이트 (60-71번 전시만)
-- 실행일: 2025-08-31
-- 주의: venues_simple은 이미 존재한다고 가정

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