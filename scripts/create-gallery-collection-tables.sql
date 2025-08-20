-- SAYU Gallery Collection Tables Setup
-- This script ensures all necessary tables exist for gallery collection functionality

-- 1. Create artworks table if it doesn't exist
CREATE TABLE IF NOT EXISTS artworks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255),
    year_created VARCHAR(50),
    medium VARCHAR(255),
    style VARCHAR(255),
    genre VARCHAR(255),
    tags TEXT[],
    emotion_tags TEXT[],
    image_url TEXT,
    description TEXT,
    museum VARCHAR(255),
    is_public_domain BOOLEAN DEFAULT true,
    license VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create artwork_interactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS artwork_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    artwork_id UUID REFERENCES artworks(id) ON DELETE CASCADE,
    interaction_type VARCHAR(50) NOT NULL CHECK (interaction_type IN ('view', 'like', 'save', 'share')),
    duration_seconds INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create users table if it doesn't exist (minimal for gallery functionality)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE,
    username VARCHAR(100),
    full_name VARCHAR(255),
    personality_type VARCHAR(20),
    quiz_completed BOOLEAN DEFAULT false,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create exhibition-related tables
CREATE TABLE IF NOT EXISTS venues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    type VARCHAR(100),
    address TEXT,
    city VARCHAR(100),
    region VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    website TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exhibitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES venues(id),
    title VARCHAR(255) NOT NULL,
    title_en VARCHAR(255),
    description TEXT,
    start_date DATE,
    end_date DATE,
    curator VARCHAR(255),
    artists TEXT[],
    tags TEXT[],
    image_url TEXT,
    status VARCHAR(50) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'ended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exhibition_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    exhibition_id UUID REFERENCES exhibitions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, exhibition_id)
);

CREATE TABLE IF NOT EXISTS exhibition_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    exhibition_id UUID REFERENCES exhibitions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, exhibition_id)
);

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_artwork_interactions_user_id ON artwork_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_artwork_interactions_artwork_id ON artwork_interactions(artwork_id);
CREATE INDEX IF NOT EXISTS idx_artwork_interactions_type ON artwork_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_artwork_interactions_created_at ON artwork_interactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_artworks_artist ON artworks(artist);
CREATE INDEX IF NOT EXISTS idx_artworks_style ON artworks(style);
CREATE INDEX IF NOT EXISTS idx_exhibitions_dates ON exhibitions(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_exhibitions_status ON exhibitions(status);

-- 6. Insert sample artworks for testing (only if table is empty)
INSERT INTO artworks (id, title, artist, year_created, medium, style, genre, tags, emotion_tags, image_url)
SELECT * FROM (VALUES 
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
     'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg/800px-Edvard_Munch.jpg')
) AS sample_data (id, title, artist, year_created, medium, style, genre, tags, emotion_tags, image_url)
WHERE NOT EXISTS (SELECT 1 FROM artworks LIMIT 1);

-- 7. Create or update materialized view for dashboard stats
DROP MATERIALIZED VIEW IF EXISTS dashboard_stats;

CREATE MATERIALIZED VIEW dashboard_stats AS
SELECT 
    u.id as user_id,
    COUNT(DISTINCT ai.artwork_id) FILTER (WHERE ai.interaction_type = 'view') as artworks_viewed,
    COUNT(DISTINCT a.artist) as artists_discovered,
    COUNT(DISTINCT ev.exhibition_id) as exhibitions_visited,
    COUNT(DISTINCT ai.artwork_id) FILTER (WHERE ai.interaction_type = 'save') as saved_artworks,
    COUNT(DISTINCT ai.artwork_id) FILTER (WHERE ai.interaction_type = 'like') as liked_artworks
FROM users u
LEFT JOIN artwork_interactions ai ON u.id = ai.user_id
LEFT JOIN artworks a ON ai.artwork_id = a.id
LEFT JOIN exhibition_views ev ON u.id = ev.user_id
GROUP BY u.id;

-- Create a unique index on the materialized view for CONCURRENTLY refresh
CREATE UNIQUE INDEX IF NOT EXISTS idx_dashboard_stats_user_id ON dashboard_stats(user_id);

-- 8. Create function to refresh dashboard stats
CREATE OR REPLACE FUNCTION refresh_dashboard_stats()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_stats;
END;
$$ LANGUAGE plpgsql;

-- 9. Enable Row Level Security (RLS) for Supabase
ALTER TABLE artwork_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibition_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibition_likes ENABLE ROW LEVEL SECURITY;

-- 10. Create RLS policies for artwork_interactions
CREATE POLICY "Users can view their own interactions" ON artwork_interactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own interactions" ON artwork_interactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interactions" ON artwork_interactions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own interactions" ON artwork_interactions
    FOR DELETE USING (auth.uid() = user_id);

-- 11. Create RLS policies for artworks (public read)
CREATE POLICY "Anyone can view artworks" ON artworks
    FOR SELECT USING (true);

-- 12. Create RLS policies for exhibitions (public read)
CREATE POLICY "Anyone can view exhibition views" ON exhibition_views
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own exhibition views" ON exhibition_views
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view exhibition likes" ON exhibition_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own exhibition likes" ON exhibition_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exhibition likes" ON exhibition_likes
    FOR DELETE USING (auth.uid() = user_id);

-- 13. Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT SELECT ON dashboard_stats TO authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Gallery collection tables setup completed!';
    RAISE NOTICE '📊 Created tables:';
    RAISE NOTICE '   - artworks (with sample data)';
    RAISE NOTICE '   - artwork_interactions';
    RAISE NOTICE '   - users (basic structure)';
    RAISE NOTICE '   - exhibitions, venues';
    RAISE NOTICE '   - exhibition_views, exhibition_likes';
    RAISE NOTICE '   - dashboard_stats materialized view';
    RAISE NOTICE '🔒 RLS policies enabled for security';
    RAISE NOTICE '📈 Indexes created for performance';
END $$;