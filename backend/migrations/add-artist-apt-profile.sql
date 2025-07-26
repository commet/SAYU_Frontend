-- APT 프로필 시스템을 위한 artists 테이블 확장
-- 2025-01-26: SAYU APT-아티스트 매칭 시스템 구축

-- 1. artists 테이블에 APT 프로필 컬럼 추가
ALTER TABLE artists ADD COLUMN IF NOT EXISTS apt_profile JSONB;

-- 2. APT 관련 인덱스 생성 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_artists_apt_profile ON artists USING GIN (apt_profile);
CREATE INDEX IF NOT EXISTS idx_artists_apt_primary_type ON artists USING GIN ((apt_profile->'primary_types'));

-- 3. APT 매핑 로그 테이블 생성
CREATE TABLE IF NOT EXISTS artist_apt_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
    mapping_method VARCHAR(50) NOT NULL, -- 'manual', 'ai_analysis', 'expert_review'
    apt_profile JSONB NOT NULL,
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    mapped_by VARCHAR(100), -- 매핑 수행자/시스템
    mapping_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. APT 차원별 통계 뷰 생성
CREATE OR REPLACE VIEW apt_dimension_stats AS
SELECT 
    -- L/S 차원 분포
    COUNT(CASE WHEN (apt_profile->'dimensions'->>'L')::int > (apt_profile->'dimensions'->>'S')::int THEN 1 END) as lone_dominant,
    COUNT(CASE WHEN (apt_profile->'dimensions'->>'S')::int > (apt_profile->'dimensions'->>'L')::int THEN 1 END) as shared_dominant,
    
    -- A/R 차원 분포  
    COUNT(CASE WHEN (apt_profile->'dimensions'->>'A')::int > (apt_profile->'dimensions'->>'R')::int THEN 1 END) as abstract_dominant,
    COUNT(CASE WHEN (apt_profile->'dimensions'->>'R')::int > (apt_profile->'dimensions'->>'A')::int THEN 1 END) as representational_dominant,
    
    -- E/M 차원 분포
    COUNT(CASE WHEN (apt_profile->'dimensions'->>'E')::int > (apt_profile->'dimensions'->>'M')::int THEN 1 END) as emotional_dominant,
    COUNT(CASE WHEN (apt_profile->'dimensions'->>'M')::int > (apt_profile->'dimensions'->>'E')::int THEN 1 END) as meaning_dominant,
    
    -- F/C 차원 분포
    COUNT(CASE WHEN (apt_profile->'dimensions'->>'F')::int > (apt_profile->'dimensions'->>'C')::int THEN 1 END) as flow_dominant,
    COUNT(CASE WHEN (apt_profile->'dimensions'->>'C')::int > (apt_profile->'dimensions'->>'F')::int THEN 1 END) as constructive_dominant,
    
    COUNT(*) as total_mapped
FROM artists 
WHERE apt_profile IS NOT NULL;

-- 5. APT 타입별 아티스트 수 뷰
CREATE OR REPLACE VIEW apt_type_distribution AS
SELECT 
    primary_type->>'type' as apt_type,
    COUNT(*) as artist_count,
    AVG((primary_type->>'weight')::decimal) as avg_weight,
    STRING_AGG(name, ', ' ORDER BY (primary_type->>'weight')::decimal DESC) as top_artists
FROM artists,
     LATERAL jsonb_array_elements(apt_profile->'primary_types') as primary_type
WHERE apt_profile IS NOT NULL
GROUP BY primary_type->>'type'
ORDER BY artist_count DESC;

-- 6. 매핑 품질 체크 함수
CREATE OR REPLACE FUNCTION validate_apt_profile(profile JSONB) 
RETURNS BOOLEAN AS $$
BEGIN
    -- 필수 필드 확인
    IF NOT (profile ? 'dimensions' AND profile ? 'primary_types' AND profile ? 'meta') THEN
        RETURN FALSE;
    END IF;
    
    -- 차원 점수 유효성 확인 (0-100)
    IF NOT (
        (profile->'dimensions'->>'L')::int BETWEEN 0 AND 100 AND
        (profile->'dimensions'->>'S')::int BETWEEN 0 AND 100 AND
        (profile->'dimensions'->>'A')::int BETWEEN 0 AND 100 AND
        (profile->'dimensions'->>'R')::int BETWEEN 0 AND 100 AND
        (profile->'dimensions'->>'E')::int BETWEEN 0 AND 100 AND
        (profile->'dimensions'->>'M')::int BETWEEN 0 AND 100 AND
        (profile->'dimensions'->>'F')::int BETWEEN 0 AND 100 AND
        (profile->'dimensions'->>'C')::int BETWEEN 0 AND 100
    ) THEN
        RETURN FALSE;
    END IF;
    
    -- 대립 차원 합계 확인 (L+S, A+R, E+M, F+C = 100)
    IF NOT (
        (profile->'dimensions'->>'L')::int + (profile->'dimensions'->>'S')::int = 100 AND
        (profile->'dimensions'->>'A')::int + (profile->'dimensions'->>'R')::int = 100 AND
        (profile->'dimensions'->>'E')::int + (profile->'dimensions'->>'M')::int = 100 AND
        (profile->'dimensions'->>'F')::int + (profile->'dimensions'->>'C')::int = 100
    ) THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 7. APT 프로필 업데이트 트리거
CREATE OR REPLACE FUNCTION update_apt_profile_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    
    -- APT 프로필 유효성 검증
    IF NEW.apt_profile IS NOT NULL AND NOT validate_apt_profile(NEW.apt_profile) THEN
        RAISE EXCEPTION 'Invalid APT profile format';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER artist_apt_profile_update
    BEFORE UPDATE ON artists
    FOR EACH ROW
    EXECUTE FUNCTION update_apt_profile_timestamp();

-- 8. 샘플 APT 프로필 구조 (주석으로 문서화)
/*
APT Profile JSON Structure:
{
  "dimensions": {
    "L": 85, "S": 15,  // Lone vs Shared (합계 100)
    "A": 90, "R": 10,  // Abstract vs Representational  
    "E": 95, "M": 5,   // Emotional vs Meaning-driven
    "F": 80, "C": 20   // Flow vs Constructive
  },
  "primary_types": [
    {"type": "LAEF", "weight": 0.7},  // 주 성향
    {"type": "LAEC", "weight": 0.2},  // 부 성향
    {"type": "SREF", "weight": 0.1}   // 미약한 성향
  ],
  "periods": {
    "early": {"dominant_type": "LREC", "years": "1881-1886"},
    "paris": {"dominant_type": "SAEF", "years": "1886-1888"},
    "arles": {"dominant_type": "LAEF", "years": "1888-1889"}
  },
  "meta": {
    "confidence": 0.85,
    "source": "expert_analysis",
    "keywords": ["열정", "고독", "표현주의", "색채"],
    "emotion_tags": ["melancholy", "intensity", "passion"],
    "art_movements": ["Post-Impressionism", "Expressionism"]
  }
}
*/

COMMENT ON COLUMN artists.apt_profile IS 'SAYU APT (Art Persona Type) 프로필 - 성격 매칭을 위한 4차원 성향 데이터';
COMMENT ON TABLE artist_apt_mappings IS 'APT 매핑 히스토리 및 메타데이터 추적';
COMMENT ON VIEW apt_dimension_stats IS 'APT 4차원별 아티스트 분포 통계';
COMMENT ON VIEW apt_type_distribution IS '16가지 APT 타입별 아티스트 분포';