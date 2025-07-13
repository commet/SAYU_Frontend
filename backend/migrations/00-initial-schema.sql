-- UUID 확장 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users 테이블 (기본)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE,
    password_hash VARCHAR(255),
    personality_type VARCHAR(10),
    is_premium BOOLEAN DEFAULT false,
    profile_image TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Art Profiles 테이블
CREATE TABLE IF NOT EXISTS art_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    original_image TEXT NOT NULL,
    transformed_image TEXT NOT NULL,
    style_id VARCHAR(50) NOT NULL,
    settings JSONB DEFAULT '{}',
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Art Profile Likes 테이블
CREATE TABLE IF NOT EXISTS art_profile_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    art_profile_id UUID NOT NULL REFERENCES art_profiles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(art_profile_id, user_id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_art_profiles_user_id ON art_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_art_profiles_style_id ON art_profiles(style_id);
CREATE INDEX IF NOT EXISTS idx_art_profiles_created_at ON art_profiles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_art_profile_likes_profile_id ON art_profile_likes(art_profile_id);
CREATE INDEX IF NOT EXISTS idx_art_profile_likes_user_id ON art_profile_likes(user_id);