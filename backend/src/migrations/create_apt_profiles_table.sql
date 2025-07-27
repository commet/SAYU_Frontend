-- APT 프로필 테이블 생성
-- 작가별 APT 성향 매칭 정보 저장

CREATE TABLE IF NOT EXISTS apt_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    primary_apt VARCHAR(4) NOT NULL CHECK (primary_apt ~ '^[A-Z]{4}$'),
    secondary_apt VARCHAR(4) CHECK (secondary_apt ~ '^[A-Z]{4}$'),
    tertiary_apt VARCHAR(4) CHECK (tertiary_apt ~ '^[A-Z]{4}$'),
    matching_reasoning TEXT,
    confidence_score DECIMAL(3,2) DEFAULT 0.5 CHECK (confidence_score >= 0 AND confidence_score <= 1),
    data_sources JSONB DEFAULT '{}',
    classification_method VARCHAR(50) DEFAULT 'manual',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(artist_id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_apt_profiles_artist_id ON apt_profiles(artist_id);
CREATE INDEX IF NOT EXISTS idx_apt_profiles_primary_apt ON apt_profiles(primary_apt);
CREATE INDEX IF NOT EXISTS idx_apt_profiles_is_verified ON apt_profiles(is_verified);

-- 트리거: updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_apt_profiles_updated_at BEFORE UPDATE
    ON apt_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 시스템 통계 테이블이 없으면 생성
CREATE TABLE IF NOT EXISTS system_stats (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- APT 프로필 총 개수 통계 초기화
INSERT INTO system_stats (key, value) 
VALUES ('total_apt_profiles', '0')
ON CONFLICT (key) DO NOTHING;

-- 코멘트 추가
COMMENT ON TABLE apt_profiles IS 'Artist APT personality type matching profiles';
COMMENT ON COLUMN apt_profiles.primary_apt IS 'Primary APT type (e.g., VNRT, HSRT)';
COMMENT ON COLUMN apt_profiles.secondary_apt IS 'Secondary APT type';
COMMENT ON COLUMN apt_profiles.tertiary_apt IS 'Tertiary APT type';
COMMENT ON COLUMN apt_profiles.confidence_score IS 'Matching confidence score (0-1)';
COMMENT ON COLUMN apt_profiles.classification_method IS 'Method used: manual, ai_based, logical_data_based, etc.';