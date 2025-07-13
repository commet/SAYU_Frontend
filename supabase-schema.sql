-- SAYU Supabase 데이터베이스 스키마
-- 이 파일을 Supabase SQL Editor에서 실행하세요

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for text search
CREATE EXTENSION IF NOT EXISTS "vector"; -- for pgvector functionality

-- Users 테이블 (Supabase Auth와 연동)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    personality_type VARCHAR(10),
    animal_type VARCHAR(50),
    is_premium BOOLEAN DEFAULT false,
    is_admin BOOLEAN DEFAULT false,
    profile_image TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles 정책
CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- Art Profiles
CREATE TABLE art_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    original_image TEXT NOT NULL,
    transformed_image TEXT NOT NULL,
    style_id VARCHAR(50) NOT NULL,
    style_name VARCHAR(100),
    settings JSONB DEFAULT '{}',
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Art Profiles RLS
ALTER TABLE art_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public art profiles are viewable" 
ON art_profiles FOR SELECT 
USING (is_public = true);

CREATE POLICY "Users can create own art profiles" 
ON art_profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own art profiles" 
ON art_profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own art profiles" 
ON art_profiles FOR DELETE 
USING (auth.uid() = user_id);

-- Quiz Results
CREATE TABLE quiz_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    quiz_type VARCHAR(50) NOT NULL,
    personality_type VARCHAR(10),
    animal_type VARCHAR(50),
    scores JSONB NOT NULL,
    analysis JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quiz Results RLS
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quiz results" 
ON quiz_results FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own quiz results" 
ON quiz_results FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Follows (소셜 기능)
CREATE TABLE follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

-- Follows RLS
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view follows" 
ON follows FOR SELECT 
USING (true);

CREATE POLICY "Users can create follows" 
ON follows FOR INSERT 
WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete own follows" 
ON follows FOR DELETE 
USING (auth.uid() = follower_id);

-- Artworks (미술 작품)
CREATE TABLE artworks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    artist VARCHAR(255),
    description TEXT,
    image_url TEXT,
    museum_source VARCHAR(100),
    museum_id VARCHAR(255),
    year_created VARCHAR(100),
    medium VARCHAR(255),
    dimensions VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    embedding vector(1536), -- OpenAI embeddings
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Artworks RLS
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view artworks" 
ON artworks FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage artworks" 
ON artworks FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.is_admin = true
    )
);

-- User Artwork Interactions
CREATE TABLE user_artwork_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    artwork_id UUID REFERENCES artworks(id) ON DELETE CASCADE,
    interaction_type VARCHAR(50) NOT NULL, -- 'like', 'save', 'view'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, artwork_id, interaction_type)
);

-- Gamification: User Points
CREATE TABLE user_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    total_points INTEGER DEFAULT 0,
    quiz_points INTEGER DEFAULT 0,
    social_points INTEGER DEFAULT 0,
    artwork_points INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gamification: Achievements
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(100),
    points_required INTEGER,
    category VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gamification: User Achievements
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- Functions
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email)
    VALUES (new.id, new.email);
    
    -- Initialize user points
    INSERT INTO public.user_points (user_id)
    VALUES (new.id);
    
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_art_profiles_updated_at 
    BEFORE UPDATE ON art_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artworks_updated_at 
    BEFORE UPDATE ON artworks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_points_updated_at 
    BEFORE UPDATE ON user_points 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_profiles_personality_type ON profiles(personality_type);
CREATE INDEX idx_quiz_results_user_id ON quiz_results(user_id);
CREATE INDEX idx_art_profiles_user_id ON art_profiles(user_id);
CREATE INDEX idx_follows_follower_id ON follows(follower_id);
CREATE INDEX idx_follows_following_id ON follows(following_id);
CREATE INDEX idx_artworks_museum_source ON artworks(museum_source);
CREATE INDEX idx_user_artwork_interactions_user_id ON user_artwork_interactions(user_id);
CREATE INDEX idx_user_points_user_id ON user_points(user_id);

-- Initial achievements data
INSERT INTO achievements (name, description, icon, points_required, category) VALUES
('첫 걸음', '첫 퀴즈 완료', 'trophy', 0, 'quiz'),
('탐험가', '10개의 작품 감상', 'search', 100, 'artwork'),
('소셜 나비', '5명 팔로우', 'users', 50, 'social'),
('아트 마스터', '100개의 작품 감상', 'star', 1000, 'artwork'),
('퀴즈 왕', '모든 퀴즈 완료', 'crown', 500, 'quiz');

-- Storage bucket policies will be set up through Supabase dashboard