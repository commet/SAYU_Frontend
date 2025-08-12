-- Supabase 최적화된 스키마
-- auth.users와 public.profiles를 연결하는 구조로 단순화

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Drop existing tables if they exist (for clean migration)
DROP TABLE IF EXISTS follows CASCADE;
DROP TABLE IF EXISTS art_profiles CASCADE;
DROP TABLE IF EXISTS apt_results CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Main profiles table (extends auth.users)
-- auth.users의 id는 UUID이므로 이를 직접 참조
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    username TEXT,
    
    -- 기본 프로필 정보
    avatar_url TEXT,
    bio TEXT,
    
    -- ProfileCompleteModal에서 수집하는 정보
    gender TEXT,
    age_range TEXT,
    region TEXT,
    companion_type TEXT,
    profile_completed BOOLEAN DEFAULT FALSE,
    profile_completed_at TIMESTAMPTZ,
    
    -- 시스템 필드
    language VARCHAR(10) DEFAULT 'ko',
    preferences JSONB DEFAULT '{}',
    points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    
    -- APT 관련 (단일 최신 결과만 저장)
    personality_type VARCHAR(4), -- SAYU 16타입 코드 (예: LAEF)
    animal_type VARCHAR(50),     -- 동물명 (예: "여우")
    apt_scores JSONB,           -- APT 점수 상세
    apt_completed_at TIMESTAMPTZ,
    
    -- AI 생성 아트 프로필
    art_preferences JSONB,
    personality_traits JSONB,
    ai_generated_image_url TEXT,
    generated_prompt TEXT,
    style_description TEXT,
    color_palette JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- APT 결과 히스토리 (선택적 - 분석용)
CREATE TABLE apt_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    apt_type VARCHAR(4) NOT NULL,
    animal_type VARCHAR(50) NOT NULL,
    scores JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 팔로우 관계
CREATE TABLE follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

-- 성능 최적화 인덱스
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_personality_type ON profiles(personality_type);
CREATE INDEX idx_profiles_region ON profiles(region);
CREATE INDEX idx_profiles_age_range ON profiles(age_range);
CREATE INDEX idx_profiles_profile_completed ON profiles(profile_completed);

-- 복합 인덱스 (매칭 쿼리 최적화)
CREATE INDEX idx_profiles_matching ON profiles(personality_type, region, age_range) 
WHERE profile_completed = true;

-- 팔로우 관계 인덱스
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);

-- APT 히스토리 인덱스
CREATE INDEX idx_apt_history_user_id ON apt_history(user_id);
CREATE INDEX idx_apt_history_created_at ON apt_history(created_at DESC);

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at 트리거
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 신규 사용자 자동 프로필 생성 함수
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, username)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name', 
            NEW.raw_user_meta_data->>'username',
            split_part(NEW.email, '@', 1)
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 새 사용자 등록 시 자동 프로필 생성 트리거
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Row Level Security 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE apt_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- RLS 정책들
-- 프로필 읽기 (공개)
CREATE POLICY "Profiles are public for reading" ON profiles
    FOR SELECT USING (true);

-- 프로필 업데이트 (본인만)
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- 프로필 삽입 (본인만 - 트리거가 처리하지만 안전장치)
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- APT 히스토리 읽기 (본인만)
CREATE POLICY "Users can read own APT history" ON apt_history
    FOR SELECT USING (auth.uid() = user_id);

-- APT 히스토리 삽입 (본인만)
CREATE POLICY "Users can insert own APT history" ON apt_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 팔로우 읽기 (공개)
CREATE POLICY "Follows are public for reading" ON follows
    FOR SELECT USING (true);

-- 팔로우 관리 (본인이 팔로우하는 관계만)
CREATE POLICY "Users can manage own follows" ON follows
    FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete own follows" ON follows
    FOR DELETE USING (auth.uid() = follower_id);

-- 성능 통계 수집
ANALYZE profiles;
ANALYZE apt_history;
ANALYZE follows;