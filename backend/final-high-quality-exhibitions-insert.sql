-- FINAL HIGH-QUALITY EXHIBITIONS INSERT
-- 세계적으로 유명한 major 전시들만 엄선하여 삽입
-- 사용자들이 실제로 찾는 전시들 우선

-- 1. World-Class Venues 삽입 (런던 major 미술관들)
INSERT INTO global_venues (
    name, name_local, description, country, city, address, 
    website, venue_type, venue_category, art_focus,
    data_source, data_quality_score, verification_status,
    recommendation_priority, created_at, updated_at
) VALUES

-- 런던 최고 티어 미술관들
('Tate Modern', 'Tate Modern', 'World famous modern and contemporary art museum in former power station', 'GB', 'London', 'Bankside, London SE1 9TG', 'https://www.tate.org.uk/visit/tate-modern', 'museum', 'public', 'contemporary', 'timeout_enhanced', 95, 'verified', 95, NOW(), NOW()),

('Tate Britain', 'Tate Britain', 'National gallery of British art from 1500 to the present day', 'GB', 'London', 'Millbank, London SW1P 4RG', 'https://www.tate.org.uk/visit/tate-britain', 'museum', 'public', 'classical', 'timeout_enhanced', 95, 'verified', 95, NOW(), NOW()),

('British Museum', 'British Museum', 'World-famous museum with vast collection spanning human history and culture', 'GB', 'London', 'Great Russell St, London WC1B 3DG', 'https://www.britishmuseum.org/', 'museum', 'public', 'classical', 'timeout_enhanced', 98, 'verified', 98, NOW(), NOW()),

('National Gallery', 'National Gallery', 'National art gallery housing Western European paintings from 13th–19th centuries', 'GB', 'London', 'Trafalgar Square, London WC2N 5DN', 'https://www.nationalgallery.org.uk/', 'museum', 'public', 'classical', 'timeout_enhanced', 95, 'verified', 95, NOW(), NOW()),

('V&A Museum', 'Victoria and Albert Museum', 'World largest museum of decorative arts, design, and sculpture', 'GB', 'London', 'Cromwell Rd, London SW7 2RL', 'https://www.vam.ac.uk/', 'museum', 'public', 'design', 'timeout_enhanced', 95, 'verified', 95, NOW(), NOW()),

('Royal Academy of Arts', 'Royal Academy of Arts', 'Independent art institution led by eminent artists and architects', 'GB', 'London', 'Burlington House, Piccadilly, London W1J 0BD', 'https://www.royalacademy.org.uk/', 'gallery', 'private', 'contemporary', 'timeout_enhanced', 90, 'verified', 90, NOW(), NOW()),

('Hayward Gallery', 'Hayward Gallery', 'Contemporary art gallery in South Bank Centre', 'GB', 'London', 'Belvedere Rd, London SE1 8XX', 'https://www.southbankcentre.co.uk/venues/hayward-gallery', 'gallery', 'public', 'contemporary', 'timeout_enhanced', 88, 'verified', 88, NOW(), NOW()),

('Serpentine Galleries', 'Serpentine Galleries', 'Leading gallery for modern and contemporary art in Kensington Gardens', 'GB', 'London', 'Kensington Gardens, London W2 3XA', 'https://www.serpentinegalleries.org/', 'gallery', 'non_profit', 'contemporary', 'timeout_enhanced', 90, 'verified', 90, NOW(), NOW()),

('Design Museum', 'Design Museum', 'Museum dedicated to contemporary design in all its forms', 'GB', 'London', '224-238 Kensington High St, London W8 6AG', 'https://designmuseum.org/', 'museum', 'private', 'design', 'timeout_enhanced', 85, 'verified', 85, NOW(), NOW()),

('Barbican Art Gallery', 'Barbican Art Gallery', 'Innovative contemporary art exhibitions in Barbican Centre', 'GB', 'London', 'Silk St, London EC2Y 8DS', 'https://www.barbican.org.uk/artgallery', 'gallery', 'public', 'contemporary', 'timeout_enhanced', 85, 'verified', 85, NOW(), NOW()),

('Whitechapel Gallery', 'Whitechapel Gallery', 'Premier gallery for contemporary art in historic East London', 'GB', 'London', '77-82 Whitechapel High St, London E1 7QX', 'https://www.whitechapelgallery.org/', 'gallery', 'non_profit', 'contemporary', 'timeout_enhanced', 82, 'verified', 82, NOW(), NOW()),

('Saatchi Gallery', 'Saatchi Gallery', 'Contemporary art gallery showcasing work by emerging artists', 'GB', 'London', 'Duke of York''s HQ, King''s Rd, London SW3 4RY', 'https://www.saatchigallery.com/', 'gallery', 'private', 'contemporary', 'timeout_enhanced', 80, 'verified', 80, NOW(), NOW()),

('ICA London', 'Institute of Contemporary Arts', 'Experimental contemporary arts venue near Buckingham Palace', 'GB', 'London', 'The Mall, London SW1Y 5AH', 'https://www.ica.art/', 'art_center', 'non_profit', 'contemporary', 'timeout_enhanced', 78, 'verified', 78, NOW(), NOW())

ON CONFLICT (id) DO NOTHING;

-- 2. World-Class Exhibitions 삽입 (2025년 현재 진행 중인 major 전시들)
INSERT INTO global_exhibitions (
    venue_id, title, title_local, description, 
    start_date, end_date, poster_image_url, official_url,
    exhibition_type, art_medium, data_source, data_quality_score,
    recommendation_score, status, personality_matches, created_at, updated_at
) VALUES

-- Tate Modern 전시들
((SELECT id FROM global_venues WHERE name = 'Tate Modern'), 
'Emily Kam Kngwarray', 'Emily Kam Kngwarray', 
'First major European exhibition of acclaimed Australian Aboriginal artist Emily Kam Kngwarray, featuring monumental paintings and traditional body art', 
'2025-01-01', '2026-01-11', 
NULL, 'https://www.tate.org.uk/whats-on/tate-modern/emily-kam-kngwarray', 
'temporary', 'painting', 'timeout_enhanced', 95, 
90, 'active', '{1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16}', NOW(), NOW()),

((SELECT id FROM global_venues WHERE name = 'Tate Modern'), 
'Leigh Bowery', 'Leigh Bowery', 
'Boundary-pushing career retrospective of artist and performer Leigh Bowery, exploring themes of identity and transformation', 
'2025-03-01', '2025-08-31', 
NULL, 'https://www.tate.org.uk/whats-on/tate-modern/leigh-bowery', 
'temporary', 'performance', 'timeout_enhanced', 90, 
85, 'active', '{4,5,6,7,8,9,10,11,12,13,14,15,16}', NOW(), NOW()),

-- Tate Britain 전시들  
((SELECT id FROM global_venues WHERE name = 'Tate Britain'), 
'Ed Atkins', 'Ed Atkins', 
'Major exhibition by one of the most influential British artists working today, featuring video installations and digital art', 
'2025-02-15', '2025-08-25', 
NULL, 'https://www.tate.org.uk/whats-on/tate-britain/ed-atkins', 
'temporary', 'digital', 'timeout_enhanced', 88, 
85, 'active', '{6,7,8,9,10,11,12,13,14,15,16}', NOW(), NOW()),

((SELECT id FROM global_venues WHERE name = 'Tate Britain'), 
'Edward Burra', 'Edward Burra', 
'Explore the enigmatic world of Edward Burra through paintings, drawings and designs', 
'2025-03-01', '2025-10-19', 
NULL, 'https://www.tate.org.uk/whats-on/tate-britain/edward-burra', 
'temporary', 'painting', 'timeout_enhanced', 85, 
80, 'active', '{1,2,3,4,5,6,7,8}', NOW(), NOW()),

-- Hayward Gallery 전시들
((SELECT id FROM global_venues WHERE name = 'Hayward Gallery'), 
'Yoshitomo Nara', 'Yoshitomo Nara', 
'First UK solo exhibition of celebrated Japanese artist Yoshitomo Nara, featuring paintings, sculptures and drawings', 
'2025-03-01', '2025-09-01', 
NULL, 'https://www.southbankcentre.co.uk/whats-on/art-exhibitions/yoshitomo-nara', 
'temporary', 'mixed_media', 'timeout_enhanced', 92, 
90, 'active', '{1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16}', NOW(), NOW()),

-- Serpentine Galleries 전시들
((SELECT id FROM global_venues WHERE name = 'Serpentine Galleries'), 
'Giuseppe Penone', 'Giuseppe Penone', 
'Career-spanning exhibition by Italian Arte Povera artist Giuseppe Penone, featuring sculptures that explore relationship between humanity and nature', 
'2025-04-03', '2025-09-07', 
NULL, 'https://www.serpentinegalleries.org/exhibitions-events/giuseppe-penone', 
'temporary', 'sculpture', 'timeout_enhanced', 95, 
88, 'active', '{1,2,3,4,5,9,10,11,12,13}', NOW(), NOW()),

-- Barbican Art Gallery 전시들
((SELECT id FROM global_venues WHERE name = 'Barbican Art Gallery'), 
'Encounters: Giacometti x Huma Bhabha', 'Encounters: Giacometti x Huma Bhabha', 
'Groundbreaking pairing of Alberto Giacometti with contemporary artist Huma Bhabha, exploring sculpture across generations', 
'2025-05-08', '2025-08-10', 
NULL, 'https://www.barbican.org.uk/whats-on/2025/event/encounters-giacometti-huma-bhabha', 
'temporary', 'sculpture', 'timeout_enhanced', 92, 
85, 'active', '{4,5,6,7,8,9,10,11,12,13,14,15,16}', NOW(), NOW()),

-- Royal Academy 전시들
((SELECT id FROM global_venues WHERE name = 'Royal Academy of Arts'), 
'Kerry James Marshall', 'Kerry James Marshall', 
'Major solo exhibition of acclaimed American artist Kerry James Marshall, featuring around 70 works including new paintings', 
'2025-09-01', '2026-01-31', 
NULL, 'https://www.royalacademy.org.uk/exhibition/kerry-james-marshall', 
'temporary', 'painting', 'timeout_enhanced', 95, 
90, 'active', '{4,5,6,7,8,9,10,11,12,13,14,15,16}', NOW(), NOW()),

-- V&A Museum 전시들 
((SELECT id FROM global_venues WHERE name = 'V&A Museum'), 
'Gabrielle Chanel Fashion Manifesto', 'Gabrielle Chanel Fashion Manifesto', 
'Comprehensive exhibition exploring the revolutionary designs and lasting influence of Gabrielle Chanel', 
'2024-09-16', '2025-02-25', 
NULL, 'https://www.vam.ac.uk/exhibitions/gabrielle-chanel', 
'temporary', 'fashion', 'timeout_enhanced', 88, 
82, 'active', '{1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16}', NOW(), NOW()),

-- Design Museum 전시들
((SELECT id FROM global_venues WHERE name = 'Design Museum'), 
'Electronic: From Kraftwerk to The Chemical Brothers', 'Electronic: From Kraftwerk to The Chemical Brothers', 
'Immersive journey through 50 years of electronic music, design and visual culture', 
'2023-12-01', '2025-02-09', 
NULL, 'https://designmuseum.org/exhibitions/electronic', 
'temporary', 'digital', 'timeout_enhanced', 85, 
88, 'active', '{4,5,6,7,8,9,10,11,12,13,14,15,16}', NOW(), NOW())

ON CONFLICT DO NOTHING;

-- 3. 데이터 품질 업데이트
UPDATE global_venues 
SET data_quality_score = (
    SELECT CASE 
        WHEN COUNT(*) > 0 THEN 
            LEAST(data_quality_score + (COUNT(*) * 3), 100)
        ELSE data_quality_score 
    END
    FROM global_exhibitions 
    WHERE global_exhibitions.venue_id = global_venues.id
      AND global_exhibitions.data_source = 'timeout_enhanced'
)
WHERE data_source = 'timeout_enhanced';

-- 4. 성공 확인 및 통계
SELECT 
    '🎉 HIGH-QUALITY EXHIBITIONS INSERTED SUCCESSFULLY!' as message,
    (SELECT COUNT(*) FROM global_venues WHERE data_source = 'timeout_enhanced') as world_class_venues,
    (SELECT COUNT(*) FROM global_exhibitions WHERE data_source = 'timeout_enhanced') as world_class_exhibitions,
    (SELECT COUNT(DISTINCT country) FROM global_venues WHERE data_source = 'timeout_enhanced') as countries_covered,
    (SELECT AVG(data_quality_score) FROM global_venues WHERE data_source = 'timeout_enhanced') as avg_venue_quality,
    (SELECT AVG(recommendation_score) FROM global_exhibitions WHERE data_source = 'timeout_enhanced') as avg_exhibition_quality;

-- 5. 품질 검증 쿼리
SELECT 
    '📊 QUALITY VERIFICATION' as section,
    v.name as venue_name,
    v.data_quality_score,
    COUNT(e.id) as exhibitions_count,
    AVG(e.recommendation_score) as avg_recommendation_score
FROM global_venues v
LEFT JOIN global_exhibitions e ON v.id = e.venue_id AND e.data_source = 'timeout_enhanced'
WHERE v.data_source = 'timeout_enhanced'
GROUP BY v.id, v.name, v.data_quality_score
ORDER BY v.data_quality_score DESC;

-- 6. 성격 유형별 매칭 확인
SELECT 
    '🎭 PERSONALITY MATCHING COVERAGE' as section,
    unnest(personality_matches) as personality_type,
    COUNT(*) as matching_exhibitions
FROM global_exhibitions 
WHERE data_source = 'timeout_enhanced'
GROUP BY unnest(personality_matches)
ORDER BY personality_type;