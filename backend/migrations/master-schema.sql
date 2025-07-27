-- SAYU Master Database Schema
-- This file combines all necessary tables for initial deployment
-- Run this file to set up the complete database structure

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================
-- 1. CORE TABLES
-- ====================================

-- Users table (core authentication)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255),
    profile_image_url TEXT,
    bio TEXT,
    personality_type VARCHAR(20),
    personality_subtype VARCHAR(20),
    onboarding_completed BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    is_premium BOOLEAN DEFAULT false,
    premium_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login_at TIMESTAMP,
    email_verified BOOLEAN DEFAULT false,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP
);

-- User profiles (extended information)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    display_name VARCHAR(255),
    birth_year INTEGER,
    gender VARCHAR(20),
    location VARCHAR(255),
    interests TEXT[],
    favorite_artists TEXT[],
    favorite_styles TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ====================================
-- 2. APT (ART PERSONALITY TEST) SYSTEM
-- ====================================

-- Personality types definition
CREATE TABLE IF NOT EXISTS personality_types (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    animal VARCHAR(50),
    animal_en VARCHAR(50),
    description TEXT,
    description_en TEXT,
    traits JSONB,
    color_scheme JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Quiz questions
CREATE TABLE IF NOT EXISTS quiz_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_text TEXT NOT NULL,
    question_text_en TEXT,
    question_type VARCHAR(50) DEFAULT 'single_choice',
    category VARCHAR(50),
    order_index INTEGER,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Quiz answers
CREATE TABLE IF NOT EXISTS quiz_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
    answer_text TEXT NOT NULL,
    answer_text_en TEXT,
    personality_weights JSONB,
    order_index INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- User quiz responses
CREATE TABLE IF NOT EXISTS user_quiz_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES quiz_questions(id),
    answer_id UUID NOT NULL REFERENCES quiz_answers(id),
    session_id UUID,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Quiz results
CREATE TABLE IF NOT EXISTS quiz_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID,
    personality_type VARCHAR(20) NOT NULL,
    personality_scores JSONB,
    detailed_analysis JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ====================================
-- 3. ARTWORK & ARTIST SYSTEM
-- ====================================

-- Artists table
CREATE TABLE IF NOT EXISTS artists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    name_ko VARCHAR(255),
    birth_year INTEGER,
    death_year INTEGER,
    nationality VARCHAR(100),
    art_movements TEXT[],
    biography TEXT,
    biography_ko TEXT,
    image_url TEXT,
    wikipedia_url TEXT,
    importance_score INTEGER DEFAULT 50,
    apt_profile JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Artworks table
CREATE TABLE IF NOT EXISTS artworks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    api_source VARCHAR(50),
    api_id VARCHAR(255),
    title VARCHAR(500),
    title_ko VARCHAR(500),
    artist_id UUID REFERENCES artists(id),
    artist_display_name VARCHAR(500),
    creation_year INTEGER,
    medium VARCHAR(255),
    dimensions VARCHAR(255),
    image_url TEXT,
    thumbnail_url TEXT,
    description TEXT,
    description_ko TEXT,
    tags TEXT[],
    is_public_domain BOOLEAN DEFAULT false,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ====================================
-- 4. EXHIBITION & VENUE SYSTEM
-- ====================================

-- Global venues table
CREATE TABLE IF NOT EXISTS global_venues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    name_ko VARCHAR(255),
    name_en VARCHAR(255),
    venue_type VARCHAR(50),
    description TEXT,
    address VARCHAR(500),
    city VARCHAR(100),
    state_province VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    website_url VARCHAR(500),
    phone VARCHAR(50),
    email VARCHAR(255),
    opening_hours JSONB,
    admission_fee JSONB,
    amenities TEXT[],
    social_media JSONB,
    images JSONB,
    google_place_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Exhibitions table
CREATE TABLE IF NOT EXISTS exhibitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venue_id UUID REFERENCES global_venues(id),
    title VARCHAR(500) NOT NULL,
    title_ko VARCHAR(500),
    title_en VARCHAR(500),
    description TEXT,
    description_ko TEXT,
    start_date DATE,
    end_date DATE,
    admission_fee VARCHAR(255),
    opening_hours TEXT,
    curator VARCHAR(255),
    artists TEXT[],
    tags TEXT[],
    image_url TEXT,
    website_url VARCHAR(500),
    is_featured BOOLEAN DEFAULT false,
    visitor_count INTEGER DEFAULT 0,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ====================================
-- 5. USER INTERACTION TABLES
-- ====================================

-- User collections
CREATE TABLE IF NOT EXISTS user_collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Collection items
CREATE TABLE IF NOT EXISTS collection_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    collection_id UUID NOT NULL REFERENCES user_collections(id) ON DELETE CASCADE,
    artwork_id UUID REFERENCES artworks(id),
    exhibition_id UUID REFERENCES exhibitions(id),
    notes TEXT,
    tags TEXT[],
    created_at TIMESTAMP DEFAULT NOW()
);

-- User follows
CREATE TABLE IF NOT EXISTS user_follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

-- Art profiles (AI generated)
CREATE TABLE IF NOT EXISTS art_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    personality_type VARCHAR(20) NOT NULL,
    style_keywords TEXT[],
    color_palette JSONB,
    prompt_template TEXT,
    generated_image_url TEXT,
    cloudinary_public_id VARCHAR(255),
    generation_params JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ====================================
-- 6. GAMIFICATION SYSTEM
-- ====================================

-- User achievements
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_type VARCHAR(50) NOT NULL,
    achievement_name VARCHAR(255) NOT NULL,
    progress INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- User points
CREATE TABLE IF NOT EXISTS user_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ====================================
-- 7. PERCEPTION EXCHANGE SYSTEM
-- ====================================

-- Perception exchange sessions
CREATE TABLE IF NOT EXISTS perception_exchange_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    initiator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    partner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    artwork_id VARCHAR(255) NOT NULL,
    museum_source VARCHAR(100),
    artwork_data JSONB,
    status VARCHAR(20) DEFAULT 'pending',
    current_phase INTEGER DEFAULT 1,
    initiated_at TIMESTAMP DEFAULT NOW(),
    accepted_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Perception messages
CREATE TABLE IF NOT EXISTS perception_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES perception_exchange_sessions(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    emotion_tags TEXT[],
    phase INTEGER NOT NULL,
    word_count INTEGER DEFAULT 0,
    reaction VARCHAR(20),
    sent_at TIMESTAMP DEFAULT NOW(),
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ====================================
-- 8. INDEXES FOR PERFORMANCE
-- ====================================

-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_personality_type ON users(personality_type);

-- Artwork indexes
CREATE INDEX idx_artworks_artist ON artworks(artist_id);
CREATE INDEX idx_artworks_tags ON artworks USING GIN(tags);

-- Exhibition indexes
CREATE INDEX idx_exhibitions_venue ON exhibitions(venue_id);
CREATE INDEX idx_exhibitions_dates ON exhibitions(start_date, end_date);
CREATE INDEX idx_exhibitions_tags ON exhibitions USING GIN(tags);

-- Collection indexes
CREATE INDEX idx_collection_items_collection ON collection_items(collection_id);
CREATE INDEX idx_collection_items_artwork ON collection_items(artwork_id);

-- Perception exchange indexes
CREATE INDEX idx_perception_sessions_users ON perception_exchange_sessions(initiator_id, partner_id);
CREATE INDEX idx_perception_sessions_artwork ON perception_exchange_sessions(artwork_id);
CREATE INDEX idx_perception_messages_session ON perception_messages(session_id);

-- ====================================
-- 9. TRIGGERS FOR UPDATED_AT
-- ====================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artists_updated_at BEFORE UPDATE ON artists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artworks_updated_at BEFORE UPDATE ON artworks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_global_venues_updated_at BEFORE UPDATE ON global_venues
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exhibitions_updated_at BEFORE UPDATE ON exhibitions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====================================
-- 10. INITIAL DATA
-- ====================================

-- Insert default personality types
INSERT INTO personality_types (code, name, name_en, animal, animal_en, description) VALUES
('LAEF', '몽환적 방랑자', 'Dreamy Wanderer', '여우', 'Fox', '창의적이고 독립적인 예술 탐험가'),
('LAEC', '감각적 큐레이터', 'Sensory Curator', '고양이', 'Cat', '섬세하고 직관적인 미학 추구자'),
('LAMC', '서정적 수집가', 'Lyrical Collector', '사슴', 'Deer', '감성적이고 조화로운 예술 애호가'),
('LAMF', '낭만적 몽상가', 'Romantic Dreamer', '백조', 'Swan', '우아하고 이상주의적인 미의 추구자')
ON CONFLICT (code) DO NOTHING;

-- Create admin user (password: admin123)
INSERT INTO users (email, username, password_hash, is_active, email_verified)
VALUES ('admin@sayu.art', 'admin', '$2b$10$YourHashedPasswordHere', true, true)
ON CONFLICT (email) DO NOTHING;