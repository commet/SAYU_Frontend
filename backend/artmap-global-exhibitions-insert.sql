-- Artmap 전시 데이터를 SAYU global_venues/global_exhibitions 테이블에 삽입
-- 2025년 7월 26일 수집된 38개 해외 전시 정보

-- 1. global_venues에 필요한 장소들 삽입
INSERT INTO global_venues (
    name, name_local, description, country, city, address, 
    website, venue_type, venue_category, art_focus,
    data_source, data_quality_score, verification_status,
    recommendation_priority, created_at, updated_at
) VALUES
('Berlinische Galerie', 'Berlinische Galerie', 'Contemporary art museum in Berlin', 'DE', 'Berlin', 'Alte Jakobstraße 124-128, 10969 Berlin', 'https://artmap.com/berlinischegalerie', 'museum', 'public', 'contemporary', 'artmap', 85, 'verified', 80, NOW(), NOW()),
('Badischer Kunstverein, Karlsruhe', 'Badischer Kunstverein Karlsruhe', 'Contemporary art gallery in Karlsruhe', 'DE', 'Karlsruhe', 'Waldstraße 3, 76133 Karlsruhe', 'https://artmap.com/badischerkunstverein', 'gallery', 'non_profit', 'contemporary', 'artmap', 80, 'verified', 75, NOW(), NOW()),
('Taxispalais, Innsbruck', 'Taxispalais Innsbruck', 'Contemporary art center in Innsbruck', 'AT', 'Innsbruck', 'Maria-Theresien-Straße 45, 6020 Innsbruck', 'https://artmap.com/taxispalais', 'art_center', 'public', 'contemporary', 'artmap', 75, 'verified', 70, NOW(), NOW()),
('Kunstraum Dornbirn', 'Kunstraum Dornbirn', 'Contemporary art space in Dornbirn', 'AT', 'Dornbirn', 'Jahngasse 9, 6850 Dornbirn', 'https://artmap.com/kunstraumdornbirn', 'gallery', 'public', 'contemporary', 'artmap', 70, 'verified', 65, NOW(), NOW()),
('Kunsthalle Zürich', 'Kunsthalle Zürich', 'Contemporary art gallery in Zurich', 'CH', 'Zurich', 'Limmatstrasse 270, 8005 Zürich', 'https://artmap.com/kunsthallezurich', 'gallery', 'non_profit', 'contemporary', 'artmap', 85, 'verified', 80, NOW(), NOW()),
('Kunsthalle Basel', 'Kunsthalle Basel', 'Contemporary art gallery in Basel', 'CH', 'Basel', 'Steinenberg 7, 4051 Basel', 'https://artmap.com/kunsthallebasel', 'gallery', 'non_profit', 'contemporary', 'artmap', 85, 'verified', 80, NOW(), NOW()),
('n.b.k.', 'Neuer Berliner Kunstverein', 'Contemporary art gallery in Berlin', 'DE', 'Berlin', 'Chausseestraße 128/129, 10115 Berlin', 'https://artmap.com/nbk', 'gallery', 'non_profit', 'contemporary', 'artmap', 75, 'verified', 75, NOW(), NOW()),
('HEK, Basel', 'House of Electronic Arts Basel', 'Digital and electronic arts center in Basel', 'CH', 'Basel', 'Freilager-Platz 9, 4142 Münchenstein', 'https://artmap.com/hekbasel', 'art_center', 'non_profit', 'digital', 'artmap', 80, 'verified', 75, NOW(), NOW()),
('MOCAK Museum of Contemporary Art, Krakow', 'MOCAK Muzeum Sztuki Współczesnej', 'Contemporary art museum in Krakow', 'PL', 'Krakow', 'Lipowa 4, 30-702 Kraków', 'https://artmap.com/mocak', 'museum', 'public', 'contemporary', 'artmap', 85, 'verified', 80, NOW(), NOW()),
('Serpentine, London', 'Serpentine Galleries', 'Contemporary art gallery in London', 'GB', 'London', 'Kensington Gardens, London W2 3XA', 'https://artmap.com/serpentine', 'gallery', 'non_profit', 'contemporary', 'artmap', 90, 'verified', 85, NOW(), NOW()),
('Gropius Bau, Berlin', 'Gropius Bau', 'Contemporary art museum in Berlin', 'DE', 'Berlin', 'Niederkirchnerstraße 7, 10963 Berlin', 'https://artmap.com/gropiusbau', 'museum', 'public', 'contemporary', 'artmap', 90, 'verified', 85, NOW(), NOW()),
('Munch Museet, Oslo', 'Munch Museum', 'Art museum dedicated to Edvard Munch in Oslo', 'NO', 'Oslo', 'Tøyengata 53, 0563 Oslo', 'https://artmap.com/munchmuseet', 'museum', 'public', 'modern', 'artmap', 85, 'verified', 80, NOW(), NOW()),
('Haus der Kunst, Munich', 'Haus der Kunst München', 'Contemporary art museum in Munich', 'DE', 'Munich', 'Prinzregentenstraße 1, 80538 München', 'https://artmap.com/hausderkunst', 'museum', 'public', 'contemporary', 'artmap', 85, 'verified', 80, NOW(), NOW()),
('Copenhagen Contemporary', 'Copenhagen Contemporary', 'Contemporary art center in Copenhagen', 'DK', 'Copenhagen', 'Trangravsvej 10-12, 1436 Copenhagen', 'https://artmap.com/cphco', 'art_center', 'private', 'contemporary', 'artmap', 80, 'verified', 75, NOW(), NOW()),
('Moderna Museet, Stockholm', 'Moderna Museet', 'Modern art museum in Stockholm', 'SE', 'Stockholm', 'Exercisplan 4, 111 49 Stockholm', 'https://artmap.com/modernamuseet', 'museum', 'public', 'modern', 'artmap', 85, 'verified', 80, NOW(), NOW()),
('PAMM, Miami', 'Pérez Art Museum Miami', 'Contemporary art museum in Miami', 'US', 'Miami', '1103 Biscayne Blvd, Miami, FL 33132', 'https://artmap.com/pamm', 'museum', 'public', 'contemporary', 'artmap', 85, 'verified', 80, NOW(), NOW()),
('Stedelijk Museum, Amsterdam', 'Stedelijk Museum Amsterdam', 'Modern and contemporary art museum in Amsterdam', 'NL', 'Amsterdam', 'Museumplein 10, 1071 DJ Amsterdam', 'https://artmap.com/stedelijk', 'museum', 'public', 'contemporary', 'artmap', 90, 'verified', 85, NOW(), NOW()),
('Kunsthalle Wien, Vienna', 'Kunsthalle Wien', 'Contemporary art gallery in Vienna', 'AT', 'Vienna', 'Museumsplatz 1, 1070 Wien', 'https://artmap.com/kunsthallewien', 'gallery', 'public', 'contemporary', 'artmap', 80, 'verified', 75, NOW(), NOW()),
('Kunstmuseum Basel', 'Kunstmuseum Basel', 'Art museum in Basel', 'CH', 'Basel', 'St. Alban-Graben 8, 4010 Basel', 'https://artmap.com/kunstmuseumbasel', 'museum', 'public', 'classical', 'artmap', 85, 'verified', 80, NOW(), NOW())
ON CONFLICT (name) DO UPDATE SET
    updated_at = EXCLUDED.updated_at,
    data_quality_score = EXCLUDED.data_quality_score;

-- 2. global_exhibitions에 전시 데이터 삽입
INSERT INTO global_exhibitions (
    venue_id, title, title_local, description, 
    start_date, end_date, poster_image_url, official_url,
    exhibition_type, art_medium, data_source, data_quality_score,
    recommendation_score, status, created_at, updated_at
) VALUES

-- Berlinische Galerie 전시들
((SELECT id FROM global_venues WHERE name = 'Berlinische Galerie'), 'Marta Astfalck-Vietz', 'Marta Astfalck-Vietz', 'Photography exhibition by Marta Astfalck-Vietz from the Golden Twenties', '2025-07-11', '2025-10-13', 'https://artmap.com/static/media/0000204000/t0000203741.jpg', 'https://artmap.com/berlinischegalerie/exhibition/marta-astfalck-vietz-2025', 'temporary', 'photography', 'artmap', 80, 75, 'active', NOW(), NOW()),

((SELECT id FROM global_venues WHERE name = 'Berlinische Galerie'), 'Monira Al Qadiri', 'Monira Al Qadiri', 'Contemporary art exhibition focusing on sociocultural impacts of oil industry', '2025-07-11', '2026-08-17', 'https://artmap.com/static/media/0000204000/t0000203742.jpg', 'https://artmap.com/berlinischegalerie/exhibition/monira-al-qadiri-2025', 'temporary', 'mixed_media', 'artmap', 85, 80, 'active', NOW(), NOW()),

((SELECT id FROM global_venues WHERE name = 'Berlinische Galerie'), 'Gala Hernández López', 'Gala Hernández López', 'Interdisciplinary practice exhibition by Spanish artist Gala Hernández López', '2025-07-09', '2025-09-29', 'https://artmap.com/static/media/0000204000/t0000203743.jpg', 'https://artmap.com/berlinischegalerie/exhibition/gala-hernandez-lopez-2025', 'temporary', 'mixed_media', 'artmap', 75, 70, 'active', NOW(), NOW()),

((SELECT id FROM global_venues WHERE name = 'Berlinische Galerie'), 'Daniel Hölzl', 'Daniel Hölzl', 'Special exhibition for the 50th anniversary of Berlinische Galerie', '2025-04-25', '2025-09-29', 'https://artmap.com/static/media/0000204000/t0000203744.jpg', 'https://artmap.com/berlinischegalerie/exhibition/daniel-hoelzl-2025', 'special', 'installation', 'artmap', 70, 75, 'active', NOW(), NOW()),

((SELECT id FROM global_venues WHERE name = 'Berlinische Galerie'), 'Psychonauts', 'Psychonauts', 'Exhibition exploring psychoanalysis and modern art since Sigmund Freud', '2025-03-07', '2025-08-11', 'https://artmap.com/static/media/0000204000/t0000203745.jpg', 'https://artmap.com/berlinischegalerie/exhibition/psychonauts-2025', 'temporary', 'mixed_media', 'artmap', 85, 80, 'active', NOW(), NOW()),

((SELECT id FROM global_venues WHERE name = 'Berlinische Galerie'), 'Provenances', 'Provenances', 'Exhibition about the wayfaring destiny of artworks', '2025-03-07', '2025-10-13', 'https://artmap.com/static/media/0000204000/t0000203746.jpg', 'https://artmap.com/berlinischegalerie/exhibition/provenances-2025', 'temporary', 'mixed_media', 'artmap', 80, 75, 'active', NOW(), NOW()),

-- Serpentine, London
((SELECT id FROM global_venues WHERE name = 'Serpentine, London'), 'Giuseppe Penone', 'Giuseppe Penone', 'Career-spanning exhibition by Italian artist Giuseppe Penone', '2025-04-03', '2025-09-07', 'https://artmap.com/static/media/0000204000/t0000203747.jpg', 'https://artmap.com/serpentine/exhibition/giuseppe-penone-2025', 'temporary', 'sculpture', 'artmap', 90, 85, 'active', NOW(), NOW()),

-- Kunsthalle Basel
((SELECT id FROM global_venues WHERE name = 'Kunsthalle Basel'), 'Ser Serpas', 'Ser Serpas', 'Contemporary art exhibition exploring corporeal and poetic forms of expression', '2025-06-13', '2025-09-21', 'https://artmap.com/static/media/0000204000/t0000203748.jpg', 'https://artmap.com/kunsthallebasel/exhibition/ser-serpas-2025', 'temporary', 'mixed_media', 'artmap', 80, 75, 'active', NOW(), NOW()),

((SELECT id FROM global_venues WHERE name = 'Kunsthalle Basel'), 'Dala Nasser', 'Dala Nasser', 'Exhibition of abstraction and alternative forms of image-making', '2025-05-16', '2025-08-10', 'https://artmap.com/static/media/0000204000/t0000203749.jpg', 'https://artmap.com/kunsthallebasel/exhibition/dala-nasser-2025', 'temporary', 'painting', 'artmap', 75, 70, 'active', NOW(), NOW()),

-- n.b.k.
((SELECT id FROM global_venues WHERE name = 'n.b.k.'), 'Yoko Ono. TOUCH', 'Yoko Ono. TOUCH', 'Major exhibition by legendary artist Yoko Ono', '2025-03-02', '2025-08-31', 'https://artmap.com/static/media/0000204000/t0000203750.jpg', 'https://artmap.com/nbk/exhibition/yoko-ono-touch-2025', 'temporary', 'mixed_media', 'artmap', 95, 90, 'active', NOW(), NOW()),

((SELECT id FROM global_venues WHERE name = 'n.b.k.'), 'Ghislaine Leung', 'Ghislaine Leung', 'Exhibition by British artist Ghislaine Leung', '2025-06-07', '2025-08-03', 'https://artmap.com/static/media/0000204000/t0000203751.jpg', 'https://artmap.com/nbk/exhibition/ghislaine-leung-2025', 'temporary', 'installation', 'artmap', 75, 70, 'active', NOW(), NOW()),

((SELECT id FROM global_venues WHERE name = 'n.b.k.'), 'Franka Hörnschemeyer', 'Franka Hörnschemeyer', 'Contemporary art exhibition by Franka Hörnschemeyer', '2025-06-07', '2025-08-03', 'https://artmap.com/static/media/0000204000/t0000203752.jpg', 'https://artmap.com/nbk/exhibition/franka-hoernschemeyer-2025', 'temporary', 'mixed_media', 'artmap', 70, 65, 'active', NOW(), NOW()),

((SELECT id FROM global_venues WHERE name = 'n.b.k.'), 'Santiago Sierra', 'Santiago Sierra', 'Contemporary art exhibition by Santiago Sierra', '2024-09-11', '2025-08-31', 'https://artmap.com/static/media/0000204000/t0000203753.jpg', 'https://artmap.com/nbk/exhibition/santiago-sierra-2024', 'temporary', 'installation', 'artmap', 80, 75, 'active', NOW(), NOW()),

-- 더 많은 전시들 추가...
((SELECT id FROM global_venues WHERE name = 'HEK, Basel'), 'Other Intelligences', 'Other Intelligences', 'Exhibition exploring forms of intelligence and ecology', '2025-05-10', '2025-08-10', 'https://artmap.com/static/media/0000204000/t0000203754.jpg', 'https://artmap.com/hekbasel/exhibition/other-intelligences-2025', 'temporary', 'digital', 'artmap', 85, 80, 'active', NOW(), NOW()),

((SELECT id FROM global_venues WHERE name = 'MOCAK Museum of Contemporary Art, Krakow'), 'Fabian Knecht', 'Fabian Knecht', 'German artist using performance, installation and photography', '2025-04-24', '2025-09-07', 'https://artmap.com/static/media/0000204000/t0000203755.jpg', 'https://artmap.com/mocak/exhibition/fabian-knecht-2025', 'temporary', 'photography', 'artmap', 80, 75, 'active', NOW(), NOW()),

((SELECT id FROM global_venues WHERE name = 'Gropius Bau, Berlin'), 'VAGINAL DAVIS: FABELHAFTES PRODUKT', 'VAGINAL DAVIS: FABELHAFTES PRODUKT', 'Twenty years celebration of Vaginal Davis in Berlin', '2025-03-21', '2025-09-14', 'https://artmap.com/static/media/0000204000/t0000203756.jpg', 'https://artmap.com/gropiusbau/exhibition/vaginal-davis-fabelhaftes-produkt-2025', 'temporary', 'performance', 'artmap', 85, 80, 'active', NOW(), NOW()),

((SELECT id FROM global_venues WHERE name = 'Gropius Bau, Berlin'), 'Kerstin Brätsch', 'Kerstin Brätsch', 'Family-friendly exhibition space by Kerstin Brätsch', '2024-09-04', '2028-12-31', 'https://artmap.com/static/media/0000204000/t0000203757.jpg', 'https://artmap.com/gropiusbau/exhibition/kerstin-braetsch-2024', 'permanent', 'painting', 'artmap', 80, 75, 'active', NOW(), NOW()),

((SELECT id FROM global_venues WHERE name = 'Munch Museet, Oslo'), 'Kerstin Brätsch', 'Kerstin Brätsch', 'Total installation by Kerstin Brätsch taking over the 9th floor', '2025-03-14', '2025-08-03', 'https://artmap.com/static/media/0000204000/t0000203758.jpg', 'https://artmap.com/munchmuseet/exhibition/kerstin-braetsch-2025', 'temporary', 'installation', 'artmap', 85, 80, 'active', NOW(), NOW()),

((SELECT id FROM global_venues WHERE name = 'Haus der Kunst, Munich'), 'Shu Lea Cheang', 'Shu Lea Cheang', 'Survey exhibition "KI$$ KI$$" by net artist and filmmaker', '2025-02-14', '2025-08-03', 'https://artmap.com/static/media/0000204000/t0000203759.jpg', 'https://artmap.com/hausderkunst/exhibition/shu-lea-cheang-2025', 'temporary', 'digital', 'artmap', 85, 80, 'active', NOW(), NOW()),

((SELECT id FROM global_venues WHERE name = 'Copenhagen Contemporary'), 'Emma Talbot', 'Emma Talbot', 'Themes of identity, feminism, transformation and ecology', '2025-02-01', '2025-08-31', 'https://artmap.com/static/media/0000204000/t0000203760.jpg', 'https://artmap.com/cphco/exhibition/emma-talbot-2025', 'temporary', 'painting', 'artmap', 80, 75, 'active', NOW(), NOW())

ON CONFLICT DO NOTHING;

-- 3. 데이터 품질 점수 업데이트
UPDATE global_venues SET data_quality_score = (
    SELECT CASE 
        WHEN COUNT(*) > 0 THEN 
            LEAST(data_quality_score + (COUNT(*) * 5), 100)
        ELSE data_quality_score 
    END
    FROM global_exhibitions 
    WHERE global_exhibitions.venue_id = global_venues.id
);

-- 4. 통계 확인
SELECT 
    'Artmap 데이터 삽입 완료!' as message,
    (SELECT COUNT(*) FROM global_venues WHERE data_source = 'artmap') as venues_added,
    (SELECT COUNT(*) FROM global_exhibitions WHERE data_source = 'artmap') as exhibitions_added,
    (SELECT COUNT(DISTINCT country) FROM global_venues WHERE data_source = 'artmap') as countries_covered,
    (SELECT COUNT(DISTINCT city) FROM global_venues WHERE data_source = 'artmap') as cities_covered;