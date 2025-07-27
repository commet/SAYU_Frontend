-- SAYU Complete Database Schema for Supabase
-- This migration creates all necessary tables, indexes, and RLS policies

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Drop existing tables if they exist (careful in production!)
DROP TABLE IF EXISTS perception_exchange_reactions CASCADE;
DROP TABLE IF EXISTS perception_exchange_replies CASCADE;
DROP TABLE IF EXISTS perception_exchanges CASCADE;
DROP TABLE IF EXISTS exhibition_companions CASCADE;
DROP TABLE IF EXISTS user_following CASCADE;
DROP TABLE IF EXISTS daily_challenges CASCADE;
DROP TABLE IF EXISTS user_badges CASCADE;
DROP TABLE IF EXISTS gamification_levels CASCADE;
DROP TABLE IF EXISTS gamification_points CASCADE;
DROP TABLE IF EXISTS emotion_vectors CASCADE;
DROP TABLE IF EXISTS art_profile_generations CASCADE;
DROP TABLE IF EXISTS art_profiles CASCADE;
DROP TABLE IF EXISTS quiz_results CASCADE;
DROP TABLE IF EXISTS quiz_answers CASCADE;
DROP TABLE IF EXISTS quiz_sessions CASCADE;
DROP TABLE IF EXISTS artwork_interactions CASCADE;
DROP TABLE IF EXISTS artwork_personality_tags CASCADE;
DROP TABLE IF EXISTS artworks CASCADE;
DROP TABLE IF EXISTS exhibition_likes CASCADE;
DROP TABLE IF EXISTS exhibition_views CASCADE;
DROP TABLE IF EXISTS exhibitions CASCADE;
DROP TABLE IF EXISTS venues CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Users table (Supabase Auth integrated)
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    auth_id UUID UNIQUE, -- Links to Supabase Auth
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE,
    full_name VARCHAR(100),
    avatar_url TEXT,
    bio TEXT,
    personality_type VARCHAR(50),
    quiz_completed BOOLEAN DEFAULT FALSE,
    language VARCHAR(10) DEFAULT 'ko',
    theme_preference VARCHAR(20) DEFAULT 'light',
    notification_settings JSONB DEFAULT '{"email": true, "push": false, "exhibition": true, "social": true}'::jsonb,
    privacy_settings JSONB DEFAULT '{"profile_public": true, "show_activity": true}'::jsonb,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. APT (Art Personality Test) System
CREATE TABLE quiz_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'in_progress',
    current_question_index INTEGER DEFAULT 0,
    personality_scores JSONB DEFAULT '{}'::jsonb,
    language VARCHAR(10) DEFAULT 'ko',
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE TABLE quiz_answers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id VARCHAR(100) REFERENCES quiz_sessions(session_id),
    question_id VARCHAR(50) NOT NULL,
    choice_id VARCHAR(50) NOT NULL,
    dimension VARCHAR(50),
    score_impact JSONB,
    answered_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE quiz_results (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(100) REFERENCES quiz_sessions(session_id),
    personality_type VARCHAR(50) NOT NULL,
    animal_type VARCHAR(50) NOT NULL,
    scores JSONB NOT NULL,
    traits JSONB,
    strengths TEXT[],
    challenges TEXT[],
    art_preferences JSONB,
    recommended_artists TEXT[],
    recommended_styles TEXT[],
    detailed_analysis TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. AI Art Profile System
CREATE TABLE art_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    personality_type VARCHAR(50) NOT NULL,
    profile_image_url TEXT,
    profile_data JSONB,
    generation_prompt TEXT,
    style_attributes JSONB,
    color_palette JSONB,
    artistic_elements JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE art_profile_generations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES art_profiles(id) ON DELETE CASCADE,
    generation_id VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending',
    model_used VARCHAR(100),
    prompt_used TEXT,
    parameters JSONB,
    result_url TEXT,
    error_message TEXT,
    processing_time_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Emotion Vectors (for pgvector similarity search)
CREATE TABLE emotion_vectors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL, -- 'user', 'artwork', 'exhibition'
    entity_id UUID NOT NULL,
    emotion_vector vector(768), -- OpenAI ada-002 embeddings
    emotion_tags TEXT[],
    context JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Artworks and Collections
CREATE TABLE artworks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    external_id VARCHAR(100),
    title VARCHAR(500) NOT NULL,
    artist VARCHAR(300),
    year_created VARCHAR(50),
    medium VARCHAR(200),
    dimensions VARCHAR(200),
    image_url TEXT,
    thumbnail_url TEXT,
    source VARCHAR(50),
    source_url TEXT,
    description TEXT,
    style VARCHAR(100),
    genre VARCHAR(100),
    tags TEXT[],
    emotion_tags TEXT[],
    color_palette JSONB,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE artwork_personality_tags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    artwork_id UUID REFERENCES artworks(id) ON DELETE CASCADE,
    personality_type VARCHAR(50) NOT NULL,
    relevance_score FLOAT DEFAULT 0.5,
    tag_source VARCHAR(50), -- 'ai', 'user', 'curator'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE artwork_interactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    artwork_id UUID REFERENCES artworks(id) ON DELETE CASCADE,
    interaction_type VARCHAR(50), -- 'view', 'like', 'save', 'share'
    duration_seconds INTEGER,
    context JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Exhibitions and Venues
CREATE TABLE venues (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(300) NOT NULL,
    name_en VARCHAR(300),
    type VARCHAR(100),
    address TEXT,
    city VARCHAR(100),
    region VARCHAR(100),
    country VARCHAR(100) DEFAULT 'KR',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    website TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    opening_hours JSONB,
    admission_fee JSONB,
    facilities JSONB,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE exhibitions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    venue_id UUID REFERENCES venues(id),
    title VARCHAR(500) NOT NULL,
    title_en VARCHAR(500),
    artist VARCHAR(300),
    curator VARCHAR(300),
    start_date DATE,
    end_date DATE,
    opening_time TIME,
    closing_time TIME,
    admission_fee VARCHAR(200),
    description TEXT,
    image_url TEXT,
    poster_url TEXT,
    tags TEXT[],
    category VARCHAR(100),
    status VARCHAR(50) DEFAULT 'upcoming', -- 'upcoming', 'ongoing', 'ended'
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    source VARCHAR(50),
    source_url TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE exhibition_views (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    exhibition_id UUID REFERENCES exhibitions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    viewed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE exhibition_likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    exhibition_id UUID REFERENCES exhibitions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(exhibition_id, user_id)
);

-- 7. Gamification System
CREATE TABLE gamification_points (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL,
    points INTEGER NOT NULL,
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE gamification_levels (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    level INTEGER UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    required_points INTEGER NOT NULL,
    perks JSONB,
    badge_url TEXT
);

CREATE TABLE user_badges (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    badge_type VARCHAR(100) NOT NULL,
    badge_data JSONB,
    earned_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE daily_challenges (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    challenge_date DATE NOT NULL,
    challenge_type VARCHAR(100),
    title VARCHAR(200),
    description TEXT,
    requirements JSONB,
    reward_points INTEGER,
    participants INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Social Features
CREATE TABLE user_following (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

CREATE TABLE exhibition_companions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    exhibition_id UUID REFERENCES exhibitions(id) ON DELETE CASCADE,
    creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
    companion_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'cancelled'
    message TEXT,
    preferred_date DATE,
    preferred_time TIME,
    meeting_point TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    responded_at TIMESTAMPTZ
);

-- 9. Perception Exchange System
CREATE TABLE perception_exchanges (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    artwork_id UUID REFERENCES artworks(id) ON DELETE CASCADE,
    creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
    phase INTEGER DEFAULT 1, -- 1-4 phases
    emotion_primary VARCHAR(50),
    emotion_secondary VARCHAR(50),
    emotion_intensity FLOAT,
    perception_text TEXT,
    perception_vector vector(768),
    is_anonymous BOOLEAN DEFAULT TRUE,
    view_count INTEGER DEFAULT 0,
    resonance_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    revealed_at TIMESTAMPTZ
);

CREATE TABLE perception_exchange_replies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    exchange_id UUID REFERENCES perception_exchanges(id) ON DELETE CASCADE,
    replier_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reply_text TEXT,
    emotion_response VARCHAR(50),
    is_anonymous BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE perception_exchange_reactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    exchange_id UUID REFERENCES perception_exchanges(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reaction_type VARCHAR(50), -- 'resonance', 'thoughtful', 'inspiring'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(exchange_id, user_id, reaction_type)
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_personality_type ON users(personality_type);
CREATE INDEX idx_quiz_sessions_user_id ON quiz_sessions(user_id);
CREATE INDEX idx_art_profiles_user_id ON art_profiles(user_id);
CREATE INDEX idx_artworks_tags ON artworks USING GIN(tags);
CREATE INDEX idx_exhibitions_dates ON exhibitions(start_date, end_date);
CREATE INDEX idx_exhibitions_venue ON exhibitions(venue_id);
CREATE INDEX idx_exhibition_likes_exhibition ON exhibition_likes(exhibition_id);
CREATE INDEX idx_exhibition_likes_user ON exhibition_likes(user_id);
CREATE INDEX idx_emotion_vectors_entity ON emotion_vectors(entity_type, entity_id);
CREATE INDEX idx_perception_exchanges_artwork ON perception_exchanges(artwork_id);
CREATE INDEX idx_perception_exchanges_creator ON perception_exchanges(creator_id);

-- Create vector similarity indexes
CREATE INDEX idx_emotion_vectors_vector ON emotion_vectors USING ivfflat (emotion_vector vector_cosine_ops);
CREATE INDEX idx_perception_vector ON perception_exchanges USING ivfflat (perception_vector vector_cosine_ops);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE art_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE art_profile_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE artwork_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibition_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibition_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamification_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_following ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibition_companions ENABLE ROW LEVEL SECURITY;
ALTER TABLE perception_exchanges ENABLE ROW LEVEL SECURITY;
ALTER TABLE perception_exchange_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE perception_exchange_reactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can read all profiles but only update their own
CREATE POLICY "Users can view all profiles" ON users
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = auth_id);

-- Quiz sessions - users can only access their own
CREATE POLICY "Users can view own quiz sessions" ON quiz_sessions
    FOR SELECT USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can create own quiz sessions" ON quiz_sessions
    FOR INSERT WITH CHECK (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Art profiles - users can view all but only modify their own
CREATE POLICY "Anyone can view art profiles" ON art_profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can create own art profiles" ON art_profiles
    FOR INSERT WITH CHECK (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can update own art profiles" ON art_profiles
    FOR UPDATE USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Exhibition likes - users can manage their own
CREATE POLICY "Users can view all likes" ON exhibition_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can create own likes" ON exhibition_likes
    FOR INSERT WITH CHECK (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can delete own likes" ON exhibition_likes
    FOR DELETE USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Following - users can manage their own follows
CREATE POLICY "Users can view all follows" ON user_following
    FOR SELECT USING (true);

CREATE POLICY "Users can create own follows" ON user_following
    FOR INSERT WITH CHECK (follower_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can delete own follows" ON user_following
    FOR DELETE USING (follower_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Perception exchanges - complex policies for phased reveal
CREATE POLICY "Anyone can view non-anonymous exchanges" ON perception_exchanges
    FOR SELECT USING (is_anonymous = false OR creator_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can create exchanges" ON perception_exchanges
    FOR INSERT WITH CHECK (creator_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Create functions for complex operations
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_art_profiles_updated_at BEFORE UPDATE ON art_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_venues_updated_at BEFORE UPDATE ON venues
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_exhibitions_updated_at BEFORE UPDATE ON exhibitions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to calculate user's total points
CREATE OR REPLACE FUNCTION get_user_total_points(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN COALESCE(
        (SELECT SUM(points) FROM gamification_points WHERE user_id = user_uuid),
        0
    );
END;
$$ LANGUAGE plpgsql;

-- Function to find similar artworks by emotion vector
CREATE OR REPLACE FUNCTION find_similar_artworks(
    target_vector vector(768),
    limit_count INTEGER DEFAULT 10
)
RETURNS TABLE(
    artwork_id UUID,
    similarity FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ev.entity_id as artwork_id,
        1 - (ev.emotion_vector <=> target_vector) as similarity
    FROM emotion_vectors ev
    WHERE ev.entity_type = 'artwork'
    ORDER BY ev.emotion_vector <=> target_vector
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Initial data for gamification levels
INSERT INTO gamification_levels (level, name, name_en, required_points, perks, badge_url) VALUES
(1, '예술 새싹', 'Art Seedling', 0, '{"features": ["basic_profile"]}', '/badges/level-1.png'),
(2, '예술 탐험가', 'Art Explorer', 100, '{"features": ["basic_profile", "save_artworks"]}', '/badges/level-2.png'),
(3, '감상 수집가', 'Perception Collector', 300, '{"features": ["basic_profile", "save_artworks", "create_collections"]}', '/badges/level-3.png'),
(4, '큐레이터', 'Curator', 600, '{"features": ["all", "custom_exhibitions"]}', '/badges/level-4.png'),
(5, '예술 마스터', 'Art Master', 1000, '{"features": ["all", "vip_events"]}', '/badges/level-5.png');