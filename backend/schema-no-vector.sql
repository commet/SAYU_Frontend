-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- CREATE EXTENSION IF NOT EXISTS "pgvector"; -- Commented out for now

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nickname VARCHAR(100),
    age INTEGER,
    location JSONB,
    personal_manifesto TEXT,
    agency_level VARCHAR(50) DEFAULT 'explorer',
    aesthetic_journey_stage VARCHAR(50) DEFAULT 'discovering',
    ui_theme_preference JSONB DEFAULT '{"mode": "dynamic"}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User profiles
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type_code VARCHAR(4),
    archetype_name VARCHAR(100),
    archetype_description TEXT,
    archetype_evolution_stage INTEGER DEFAULT 1,
    exhibition_scores JSONB,
    artwork_scores JSONB,
    emotional_tags TEXT[],
    cognitive_vector JSONB,
    emotional_vector JSONB,
    aesthetic_vector JSONB,
    personality_confidence FLOAT,
    ui_customization JSONB,
    interaction_style VARCHAR(50),
    generated_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quiz sessions
CREATE TABLE IF NOT EXISTS quiz_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_type VARCHAR(20),
    device_info JSONB,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    time_spent INTEGER,
    responses JSONB,
    completion_rate FLOAT
);

-- Add more tables as needed...