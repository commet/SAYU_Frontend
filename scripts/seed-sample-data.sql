-- SAYU Sample Data Seed Script
-- This script populates the database with sample data for development and testing

-- Clear existing sample data (be careful in production!)
TRUNCATE TABLE 
    perception_exchange_reactions,
    perception_exchange_replies,
    perception_exchanges,
    exhibition_companions,
    user_following,
    daily_challenges,
    user_badges,
    artwork_interactions,
    artwork_personality_tags,
    artworks,
    exhibition_likes,
    exhibition_views,
    exhibitions,
    venues,
    quiz_results,
    quiz_answers,
    quiz_sessions,
    art_profiles,
    users
CASCADE;

-- 1. Create sample users
INSERT INTO users (id, email, username, full_name, personality_type, quiz_completed, avatar_url, bio) VALUES
    ('11111111-1111-1111-1111-111111111111', 'test1@sayu.art', 'artlover1', '김예술', 'INFP', true, 'https://api.dicebear.com/7.x/avataaars/svg?seed=artlover1', '예술을 사랑하는 INFP입니다. 인상주의와 추상화를 좋아해요.'),
    ('22222222-2222-2222-2222-222222222222', 'test2@sayu.art', 'painter2', '이화가', 'ENFJ', true, 'https://api.dicebear.com/7.x/avataaars/svg?seed=painter2', '현대미술과 설치예술에 관심이 많습니다.'),
    ('33333333-3333-3333-3333-333333333333', 'test3@sayu.art', 'curator3', '박큐레이터', 'INTJ', true, 'https://api.dicebear.com/7.x/avataaars/svg?seed=curator3', '미술관 큐레이터로 일하고 있습니다.'),
    ('44444444-4444-4444-4444-444444444444', 'test4@sayu.art', 'collector4', '최수집가', 'ESTP', false, 'https://api.dicebear.com/7.x/avataaars/svg?seed=collector4', '신진 작가들의 작품을 수집하고 있어요.'),
    ('55555555-5555-5555-5555-555555555555', 'test5@sayu.art', 'student5', '정학생', 'ISFP', true, 'https://api.dicebear.com/7.x/avataaars/svg?seed=student5', '미술대학 재학중입니다.');

-- 2. Create sample venues
INSERT INTO venues (id, name, name_en, type, address, city, region, latitude, longitude, website) VALUES
    ('a1111111-1111-1111-1111-111111111111', '국립현대미술관 서울', 'MMCA Seoul', '국립미술관', '서울특별시 종로구 삼청로 30', '서울', '서울특별시', 37.5785, 126.9799, 'https://www.mmca.go.kr'),
    ('a2222222-2222-2222-2222-222222222222', '리움미술관', 'Leeum Museum', '사립미술관', '서울특별시 용산구 이태원로55길 60', '서울', '서울특별시', 37.5384, 126.9995, 'https://www.leeum.org'),
    ('a3333333-3333-3333-3333-333333333333', '서울시립미술관', 'SeMA', '시립미술관', '서울특별시 중구 덕수궁길 61', '서울', '서울특별시', 37.5640, 126.9738, 'https://sema.seoul.go.kr'),
    ('a4444444-4444-4444-4444-444444444444', '아모레퍼시픽미술관', 'APMA', '기업미술관', '서울특별시 용산구 한강대로 100', '서울', '서울특별시', 37.5275, 126.9724, 'https://apma.amorepacific.com'),
    ('a5555555-5555-5555-5555-555555555555', '대림미술관', 'Daelim Museum', '사립미술관', '서울특별시 종로구 자하문로4길 21', '서울', '서울특별시', 37.5798, 126.9687, 'https://daelimmuseum.org');

-- 3. Create sample exhibitions
INSERT INTO exhibitions (id, venue_id, title, title_en, description, start_date, end_date, curator, artists, tags, image_url, status) VALUES
    ('e1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 
     '한국 현대미술의 흐름', 'Flow of Korean Contemporary Art', 
     '한국 현대미술 100년의 역사를 돌아보는 대규모 기획전시입니다.', 
     '2024-03-01', '2024-06-30', '김큐레이터', 
     ARRAY['박수근', '이중섭', '김환기', '천경자'], 
     ARRAY['현대미술', '한국미술', '회화', '조각'],
     'https://example.com/exhibition1.jpg', 'ongoing'),
    
    ('e2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', 
     '모네와 인상주의', 'Monet and Impressionism', 
     '클로드 모네를 중심으로 한 인상주의 거장들의 작품전입니다.', 
     '2024-02-15', '2024-05-31', '이큐레이터', 
     ARRAY['클로드 모네', '피에르 오귀스트 르누아르', '에드가 드가'], 
     ARRAY['인상주의', '프랑스', '19세기', '회화'],
     'https://example.com/exhibition2.jpg', 'ongoing'),
    
    ('e3333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', 
     '미디어 아트의 현재', 'Media Art Now', 
     '최신 기술을 활용한 미디어 아트 작품들을 선보입니다.', 
     '2024-04-01', '2024-07-15', '박큐레이터', 
     ARRAY['팀랩', '라파엘 로자노헤머', '류이치 사카모토'], 
     ARRAY['미디어아트', '설치미술', '인터랙티브', '디지털'],
     'https://example.com/exhibition3.jpg', 'ongoing'),
    
    ('e4444444-4444-4444-4444-444444444444', 'a4444444-4444-4444-4444-444444444444', 
     '젊은 작가전', 'Young Artists Exhibition', 
     '주목받는 신진 작가들의 실험적인 작품을 소개합니다.', 
     '2024-05-01', '2024-08-31', '최큐레이터', 
     ARRAY['김작가', '이작가', '박작가'], 
     ARRAY['신진작가', '실험미술', '현대미술'],
     'https://example.com/exhibition4.jpg', 'upcoming'),
    
    ('e5555555-5555-5555-5555-555555555555', 'a5555555-5555-5555-5555-555555555555', 
     '팝아트의 세계', 'World of Pop Art', 
     '앤디 워홀을 비롯한 팝아트 작가들의 작품전입니다.', 
     '2024-01-15', '2024-04-30', '정큐레이터', 
     ARRAY['앤디 워홀', '로이 리히텐슈타인', '키스 해링'], 
     ARRAY['팝아트', '미국', '20세기', '판화'],
     'https://example.com/exhibition5.jpg', 'ongoing');

-- 4. Create sample artworks
INSERT INTO artworks (id, title, artist, year_created, medium, style, genre, tags, emotion_tags, image_url) VALUES
    ('w1111111-1111-1111-1111-111111111111', '수련', '클로드 모네', '1916', '유화', '인상주의', '풍경화', 
     ARRAY['인상주의', '프랑스', '풍경', '자연'], ARRAY['평화로운', '고요한', '아름다운'],
     'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg/800px-Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg'),
    
    ('w2222222-2222-2222-2222-222222222222', '별이 빛나는 밤', '빈센트 반 고흐', '1889', '유화', '후기인상주의', '풍경화', 
     ARRAY['후기인상주의', '네덜란드', '밤', '풍경'], ARRAY['몽환적인', '신비로운', '역동적인'],
     'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/800px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg'),
    
    ('w3333333-3333-3333-3333-333333333333', '게르니카', '파블로 피카소', '1937', '유화', '큐비즘', '역사화', 
     ARRAY['큐비즘', '스페인', '전쟁', '역사'], ARRAY['비극적인', '강렬한', '충격적인'],
     'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Mural_del_Gernika.jpg/800px-Mural_del_Gernika.jpg'),
    
    ('w4444444-4444-4444-4444-444444444444', '진주 귀걸이를 한 소녀', '요하네스 베르메르', '1665', '유화', '바로크', '초상화', 
     ARRAY['바로크', '네덜란드', '초상', '여성'], ARRAY['우아한', '신비로운', '섬세한'],
     'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Meisje_met_de_parel.jpg/800px-Meisje_met_de_parel.jpg'),
    
    ('w5555555-5555-5555-5555-555555555555', '절규', '에드바르트 뭉크', '1893', '유화', '표현주의', '인물화', 
     ARRAY['표현주의', '노르웨이', '감정', '인물'], ARRAY['불안한', '고통스러운', '절망적인'],
     'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg/800px-Edvard_Munch.jpg');

-- 5. Create artwork personality tags
INSERT INTO artwork_personality_tags (artwork_id, personality_type, relevance_score, tag_source) VALUES
    ('w1111111-1111-1111-1111-111111111111', 'INFP', 0.9, 'ai'),
    ('w1111111-1111-1111-1111-111111111111', 'ISFP', 0.8, 'ai'),
    ('w2222222-2222-2222-2222-222222222222', 'INFJ', 0.85, 'ai'),
    ('w2222222-2222-2222-2222-222222222222', 'ENFP', 0.75, 'ai'),
    ('w3333333-3333-3333-3333-333333333333', 'ENTJ', 0.8, 'ai'),
    ('w3333333-3333-3333-3333-333333333333', 'INTJ', 0.7, 'ai'),
    ('w4444444-4444-4444-4444-444444444444', 'ISFJ', 0.85, 'ai'),
    ('w4444444-4444-4444-4444-444444444444', 'ISTJ', 0.75, 'ai'),
    ('w5555555-5555-5555-5555-555555555555', 'INFP', 0.7, 'ai'),
    ('w5555555-5555-5555-5555-555555555555', 'ENFP', 0.8, 'ai');

-- 6. Create sample artwork interactions
INSERT INTO artwork_interactions (user_id, artwork_id, interaction_type, duration_seconds, created_at) VALUES
    ('11111111-1111-1111-1111-111111111111', 'w1111111-1111-1111-1111-111111111111', 'view', 45, NOW() - INTERVAL '2 hours'),
    ('11111111-1111-1111-1111-111111111111', 'w1111111-1111-1111-1111-111111111111', 'like', null, NOW() - INTERVAL '2 hours'),
    ('11111111-1111-1111-1111-111111111111', 'w2222222-2222-2222-2222-222222222222', 'view', 120, NOW() - INTERVAL '1 day'),
    ('11111111-1111-1111-1111-111111111111', 'w3333333-3333-3333-3333-333333333333', 'save', null, NOW() - INTERVAL '3 days'),
    ('22222222-2222-2222-2222-222222222222', 'w2222222-2222-2222-2222-222222222222', 'view', 90, NOW() - INTERVAL '4 hours'),
    ('22222222-2222-2222-2222-222222222222', 'w4444444-4444-4444-4444-444444444444', 'like', null, NOW() - INTERVAL '1 day'),
    ('33333333-3333-3333-3333-333333333333', 'w5555555-5555-5555-5555-555555555555', 'view', 60, NOW() - INTERVAL '6 hours'),
    ('33333333-3333-3333-3333-333333333333', 'w1111111-1111-1111-1111-111111111111', 'save', null, NOW() - INTERVAL '2 days');

-- 7. Create sample exhibition interactions
INSERT INTO exhibition_views (user_id, exhibition_id, created_at) VALUES
    ('11111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', NOW() - INTERVAL '1 day'),
    ('11111111-1111-1111-1111-111111111111', 'e2222222-2222-2222-2222-222222222222', NOW() - INTERVAL '3 days'),
    ('22222222-2222-2222-2222-222222222222', 'e3333333-3333-3333-3333-333333333333', NOW() - INTERVAL '2 days'),
    ('33333333-3333-3333-3333-333333333333', 'e1111111-1111-1111-1111-111111111111', NOW() - INTERVAL '5 days');

INSERT INTO exhibition_likes (user_id, exhibition_id, created_at) VALUES
    ('11111111-1111-1111-1111-111111111111', 'e2222222-2222-2222-2222-222222222222', NOW() - INTERVAL '3 days'),
    ('22222222-2222-2222-2222-222222222222', 'e3333333-3333-3333-3333-333333333333', NOW() - INTERVAL '2 days'),
    ('33333333-3333-3333-3333-333333333333', 'e1111111-1111-1111-1111-111111111111', NOW() - INTERVAL '5 days');

-- 8. Create sample perception exchanges
INSERT INTO perception_exchanges (id, user_id, exhibition_id, artwork_id, content, emotion_tags, visibility, resonance_count) VALUES
    ('p1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'e2222222-2222-2222-2222-222222222222', 
     'w1111111-1111-1111-1111-111111111111', 
     '모네의 수련을 보면서 마치 시간이 멈춘 것 같은 평온함을 느꼈어요. 물에 비친 하늘과 구름이 현실과 환상의 경계를 모호하게 만드는 것 같아요.',
     ARRAY['평화로운', '몽환적인', '고요한'], 'public', 12),
    
    ('p2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'e3333333-3333-3333-3333-333333333333', 
     null, 
     '미디어 아트 전시를 보고 왔는데, 기술과 예술의 경계가 점점 모호해지는 것 같아요. 관객이 작품의 일부가 되는 경험이 정말 신선했습니다.',
     ARRAY['신선한', '혁신적인', '흥미로운'], 'public', 8),
    
    ('p3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', null, 
     'w5555555-5555-5555-5555-555555555555', 
     '뭉크의 절규를 직접 보니 화면에서 보던 것과는 완전히 다른 충격이었어요. 붓질 하나하나에서 작가의 불안과 고뇌가 느껴졌습니다.',
     ARRAY['충격적인', '강렬한', '불안한'], 'public', 15);

-- 9. Create sample quiz results
INSERT INTO quiz_results (user_id, session_id, personality_type, animal_type, scores, art_preferences, recommended_artists, recommended_styles) VALUES
    ('11111111-1111-1111-1111-111111111111', 'session-001', 'INFP', 'deer', 
     '{"IE": -3, "SN": 2, "TF": -4, "JP": 1}'::jsonb,
     '{"colors": ["blue", "purple"], "themes": ["nature", "emotion"]}'::jsonb,
     ARRAY['클로드 모네', '빈센트 반 고흐', '칸딘스키'],
     ARRAY['인상주의', '표현주의', '추상표현주의']),
    
    ('22222222-2222-2222-2222-222222222222', 'session-002', 'ENFJ', 'dolphin', 
     '{"IE": 2, "SN": 1, "TF": -3, "JP": -2}'::jsonb,
     '{"colors": ["warm", "bright"], "themes": ["people", "connection"]}'::jsonb,
     ARRAY['르누아르', '마티스', '샤갈'],
     ARRAY['인상주의', '야수파', '초현실주의']),
    
    ('33333333-3333-3333-3333-333333333333', 'session-003', 'INTJ', 'owl', 
     '{"IE": -2, "SN": 3, "TF": 4, "JP": 3}'::jsonb,
     '{"colors": ["monochrome", "dark"], "themes": ["structure", "concept"]}'::jsonb,
     ARRAY['피카소', '몬드리안', '칸딘스키'],
     ARRAY['큐비즘', '추상주의', '미니멀리즘']);

-- 10. Create sample following relationships
INSERT INTO user_following (follower_id, following_id) VALUES
    ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222'),
    ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333'),
    ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111'),
    ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_artwork_interactions_user_id ON artwork_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_artwork_interactions_created_at ON artwork_interactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_exhibitions_dates ON exhibitions(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_perception_exchanges_user_id ON perception_exchanges(user_id);
CREATE INDEX IF NOT EXISTS idx_perception_exchanges_created_at ON perception_exchanges(created_at DESC);

-- Create materialized view for dashboard stats (optional but recommended for performance)
CREATE MATERIALIZED VIEW IF NOT EXISTS dashboard_stats AS
SELECT 
    u.id as user_id,
    COUNT(DISTINCT ai.artwork_id) as artworks_viewed,
    COUNT(DISTINCT a.artist) as artists_discovered,
    COUNT(DISTINCT ev.exhibition_id) as exhibitions_visited,
    COUNT(DISTINCT CASE WHEN ai.interaction_type = 'save' THEN ai.artwork_id END) as saved_artworks
FROM users u
LEFT JOIN artwork_interactions ai ON u.id = ai.user_id
LEFT JOIN artworks a ON ai.artwork_id = a.id
LEFT JOIN exhibition_views ev ON u.id = ev.user_id
GROUP BY u.id;

-- Refresh the materialized view
REFRESH MATERIALIZED VIEW dashboard_stats;

-- Create a function to refresh the materialized view periodically
CREATE OR REPLACE FUNCTION refresh_dashboard_stats()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_stats;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions (adjust based on your Supabase setup)
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Sample data seeded successfully!';
    RAISE NOTICE '📊 Created:';
    RAISE NOTICE '   - 5 users';
    RAISE NOTICE '   - 5 venues';
    RAISE NOTICE '   - 5 exhibitions';
    RAISE NOTICE '   - 5 artworks';
    RAISE NOTICE '   - Multiple interactions and relationships';
    RAISE NOTICE '   - Dashboard stats materialized view';
END $$;