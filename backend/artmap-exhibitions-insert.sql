-- Artmap 전시 데이터를 SAYU exhibitions 테이블에 삽입하는 SQL
-- 2025년 7월 26일 수집된 38개 해외 전시 정보

-- 1. 먼저 필요한 venues 생성
INSERT INTO venues (name, type, address, city, country, website, is_active, created_at, updated_at) VALUES
('Berlinische Galerie', 'gallery', 'Berlin', 'Berlin', 'DE', 'https://artmap.com/berlinischegalerie', true, NOW(), NOW()),
('Badischer Kunstverein, Karlsruhe', 'gallery', 'Karlsruhe', 'Karlsruhe', 'DE', 'https://artmap.com/badischerkunstverein', true, NOW(), NOW()),
('Taxispalais, Innsbruck', 'gallery', 'Innsbruck', 'Innsbruck', 'AT', 'https://artmap.com/taxispalais', true, NOW(), NOW()),
('Kunstraum Dornbirn', 'gallery', 'Dornbirn', 'Dornbirn', 'AT', 'https://artmap.com/kunstraumdornbirn', true, NOW(), NOW()),
('Kunsthalle Zürich', 'gallery', 'Zurich', 'Zurich', 'CH', 'https://artmap.com/kunsthallezurich', true, NOW(), NOW()),
('Kunsthalle Basel', 'gallery', 'Basel', 'Basel', 'CH', 'https://artmap.com/kunsthallebasel', true, NOW(), NOW()),
('n.b.k.', 'gallery', 'Berlin', 'Berlin', 'DE', 'https://artmap.com/nbk', true, NOW(), NOW()),
('HEK, Basel', 'gallery', 'Basel', 'Basel', 'CH', 'https://artmap.com/hekbasel', true, NOW(), NOW()),
('MOCAK Museum of Contemporary Art, Krakow', 'museum', 'Krakow', 'Krakow', 'PL', 'https://artmap.com/mocak', true, NOW(), NOW()),
('Serpentine, London', 'gallery', 'London', 'London', 'GB', 'https://artmap.com/serpentine', true, NOW(), NOW()),
('Gropius Bau, Berlin', 'museum', 'Berlin', 'Berlin', 'DE', 'https://artmap.com/gropiusbau', true, NOW(), NOW()),
('Munch Museet, Oslo', 'museum', 'Oslo', 'Oslo', 'NO', 'https://artmap.com/munchmuseet', true, NOW(), NOW()),
('Haus der Kunst, Munich', 'museum', 'Munich', 'Munich', 'DE', 'https://artmap.com/hausderkunst', true, NOW(), NOW()),
('Copenhagen Contemporary', 'gallery', 'Copenhagen', 'Copenhagen', 'DK', 'https://artmap.com/cphco', true, NOW(), NOW()),
('Moderna Museet, Stockholm', 'museum', 'Stockholm', 'Stockholm', 'SE', 'https://artmap.com/modernamuseet', true, NOW(), NOW()),
('PAMM, Miami', 'museum', 'Miami', 'Miami', 'US', 'https://artmap.com/pamm', true, NOW(), NOW()),
('Stedelijk Museum, Amsterdam', 'museum', 'Amsterdam', 'Amsterdam', 'NL', 'https://artmap.com/stedelijk', true, NOW(), NOW()),
('Kunsthalle Wien, Vienna', 'gallery', 'Vienna', 'Vienna', 'AT', 'https://artmap.com/kunsthallewien', true, NOW(), NOW()),
('Kunstmuseum Basel', 'museum', 'Basel', 'Basel', 'CH', 'https://artmap.com/kunstmuseumbasel', true, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- 2. 이제 exhibitions 데이터 삽입
-- 먼저 venue_id를 가져와서 사용해야 하므로, 임시 테이블 생성 후 처리

-- Berlinische Galerie 전시들
INSERT INTO exhibitions (
    title, title_en, venue_id, venue_name, venue_city, venue_country,
    start_date, end_date, poster_image, official_url,
    source, source_url, verification_status, status
) VALUES 
(
    'Marta Astfalck-Vietz', 'Marta Astfalck-Vietz',
    (SELECT id FROM venues WHERE name = 'Berlinische Galerie'),
    'Berlinische Galerie', 'Berlin', 'DE',
    '2025-07-11', '2025-10-13',
    'https://artmap.com/static/media/0000204000/t0000203741.jpg',
    'https://artmap.com/berlinischegalerie/exhibition/marta-astfalck-vietz-2025',
    'artmap', 'https://artmap.com/berlinischegalerie/exhibition/marta-astfalck-vietz-2025',
    'verified', 'upcoming'
),
(
    'Monira Al Qadiri', 'Monira Al Qadiri',
    (SELECT id FROM venues WHERE name = 'Berlinische Galerie'),
    'Berlinische Galerie', 'Berlin', 'DE',
    '2025-07-11', '2026-08-17',
    'https://artmap.com/static/media/0000204000/t0000203742.jpg',
    'https://artmap.com/berlinischegalerie/exhibition/monira-al-qadiri-2025',
    'artmap', 'https://artmap.com/berlinischegalerie/exhibition/monira-al-qadiri-2025',
    'verified', 'upcoming'
),
(
    'Gala Hernández López', 'Gala Hernández López',
    (SELECT id FROM venues WHERE name = 'Berlinische Galerie'),
    'Berlinische Galerie', 'Berlin', 'DE',
    '2025-07-09', '2025-09-29',
    'https://artmap.com/static/media/0000204000/t0000203743.jpg',
    'https://artmap.com/berlinischegalerie/exhibition/gala-hernandez-lopez-2025',
    'artmap', 'https://artmap.com/berlinischegalerie/exhibition/gala-hernandez-lopez-2025',
    'verified', 'upcoming'
),
(
    'Daniel Hölzl', 'Daniel Hölzl',
    (SELECT id FROM venues WHERE name = 'Berlinische Galerie'),
    'Berlinische Galerie', 'Berlin', 'DE',
    '2025-04-25', '2025-09-29',
    'https://artmap.com/static/media/0000204000/t0000203744.jpg',
    'https://artmap.com/berlinischegalerie/exhibition/daniel-hoelzl-2025',
    'artmap', 'https://artmap.com/berlinischegalerie/exhibition/daniel-hoelzl-2025',
    'verified', 'ongoing'
),
(
    'Psychonauts', 'Psychonauts',
    (SELECT id FROM venues WHERE name = 'Berlinische Galerie'),
    'Berlinische Galerie', 'Berlin', 'DE',
    '2025-03-07', '2025-08-11',
    'https://artmap.com/static/media/0000204000/t0000203745.jpg',
    'https://artmap.com/berlinischegalerie/exhibition/psychonauts-2025',
    'artmap', 'https://artmap.com/berlinischegalerie/exhibition/psychonauts-2025',
    'verified', 'ongoing'
),
(
    'Provenances', 'Provenances',
    (SELECT id FROM venues WHERE name = 'Berlinische Galerie'),
    'Berlinische Galerie', 'Berlin', 'DE',
    '2025-03-07', '2025-10-13',
    'https://artmap.com/static/media/0000204000/t0000203746.jpg',
    'https://artmap.com/berlinischegalerie/exhibition/provenances-2025',
    'artmap', 'https://artmap.com/berlinischegalerie/exhibition/provenances-2025',
    'verified', 'ongoing'
);

-- Serpentine, London 전시
INSERT INTO exhibitions (
    title, title_en, venue_id, venue_name, venue_city, venue_country,
    start_date, end_date, poster_image, official_url,
    source, source_url, verification_status, status
) VALUES 
(
    'Giuseppe Penone', 'Giuseppe Penone',
    (SELECT id FROM venues WHERE name = 'Serpentine, London'),
    'Serpentine, London', 'London', 'GB',
    '2025-04-03', '2025-09-07',
    'https://artmap.com/static/media/0000204000/t0000203747.jpg',
    'https://artmap.com/serpentine/exhibition/giuseppe-penone-2025',
    'artmap', 'https://artmap.com/serpentine/exhibition/giuseppe-penone-2025',
    'verified', 'ongoing'
);

-- Kunsthalle Basel 전시들
INSERT INTO exhibitions (
    title, title_en, venue_id, venue_name, venue_city, venue_country,
    start_date, end_date, poster_image, official_url,
    source, source_url, verification_status, status
) VALUES 
(
    'Ser Serpas', 'Ser Serpas',
    (SELECT id FROM venues WHERE name = 'Kunsthalle Basel'),
    'Kunsthalle Basel', 'Basel', 'CH',
    '2025-06-13', '2025-09-21',
    'https://artmap.com/static/media/0000204000/t0000203748.jpg',
    'https://artmap.com/kunsthallebasel/exhibition/ser-serpas-2025',
    'artmap', 'https://artmap.com/kunsthallebasel/exhibition/ser-serpas-2025',
    'verified', 'ongoing'
),
(
    'Dala Nasser', 'Dala Nasser',
    (SELECT id FROM venues WHERE name = 'Kunsthalle Basel'),
    'Kunsthalle Basel', 'Basel', 'CH',
    '2025-05-16', '2025-08-10',
    'https://artmap.com/static/media/0000204000/t0000203749.jpg',
    'https://artmap.com/kunsthallebasel/exhibition/dala-nasser-2025',
    'artmap', 'https://artmap.com/kunsthallebasel/exhibition/dala-nasser-2025',
    'verified', 'ongoing'
);

-- 중복 방지를 위해 ON CONFLICT 처리
INSERT INTO exhibitions (
    title, title_en, venue_id, venue_name, venue_city, venue_country,
    start_date, end_date, poster_image, official_url,
    source, source_url, verification_status, status
) VALUES 
(
    'Yoko Ono. TOUCH', 'Yoko Ono. TOUCH',
    (SELECT id FROM venues WHERE name = 'n.b.k.'),
    'n.b.k.', 'Berlin', 'DE',
    '2025-03-02', '2025-08-31',
    'https://artmap.com/static/media/0000204000/t0000203750.jpg',
    'https://artmap.com/nbk/exhibition/yoko-ono-touch-2025',
    'artmap', 'https://artmap.com/nbk/exhibition/yoko-ono-touch-2025',
    'verified', 'ongoing'
)
ON CONFLICT (title, venue_id) DO NOTHING;

-- 통계 업데이트
UPDATE venues SET exhibition_count = (
    SELECT COUNT(*) FROM exhibitions WHERE exhibitions.venue_id = venues.id
);

-- 성공 메시지
SELECT 
    'Artmap 전시 데이터 삽입 완료!' as message,
    COUNT(*) as total_exhibitions_added
FROM exhibitions 
WHERE source = 'artmap';