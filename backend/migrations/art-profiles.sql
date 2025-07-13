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
CREATE INDEX idx_art_profiles_user_id ON art_profiles(user_id);
CREATE INDEX idx_art_profiles_style_id ON art_profiles(style_id);
CREATE INDEX idx_art_profiles_created_at ON art_profiles(created_at DESC);
CREATE INDEX idx_art_profiles_public_created ON art_profiles(is_public, created_at DESC) WHERE is_public = true;

CREATE INDEX idx_art_profile_likes_profile_id ON art_profile_likes(art_profile_id);
CREATE INDEX idx_art_profile_likes_user_id ON art_profile_likes(user_id);

-- Users 테이블에 프리미엄 컬럼 추가 (없으면)
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image TEXT;

-- 월별 생성 통계를 위한 뷰
CREATE OR REPLACE VIEW user_art_profile_monthly_stats AS
SELECT 
    u.id as user_id,
    u.is_premium,
    DATE_TRUNC('month', ap.created_at) as month,
    COUNT(ap.id) as count
FROM users u
LEFT JOIN art_profiles ap ON u.id = ap.user_id
GROUP BY u.id, u.is_premium, DATE_TRUNC('month', ap.created_at);

-- 인기 스타일 통계를 위한 뷰
CREATE OR REPLACE VIEW popular_art_styles AS
SELECT 
    style_id,
    COUNT(*) as usage_count,
    COUNT(DISTINCT user_id) as unique_users
FROM art_profiles
GROUP BY style_id
ORDER BY usage_count DESC;