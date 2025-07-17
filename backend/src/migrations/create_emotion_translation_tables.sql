-- 감정 번역 세션 테이블
CREATE TABLE IF NOT EXISTS emotion_translation_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    emotion_input JSONB NOT NULL,
    interpretation JSONB NOT NULL,
    matches JSONB NOT NULL,
    user_feedback JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스 추가
CREATE INDEX idx_emotion_sessions_user_id ON emotion_translation_sessions(user_id);
CREATE INDEX idx_emotion_sessions_created_at ON emotion_translation_sessions(created_at DESC);
CREATE INDEX idx_emotion_sessions_emotion_hue ON emotion_translation_sessions((emotion_input->'color'->'primary'->>'hue'));

-- 작품 테이블에 감정 관련 컬럼 추가
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS emotion_vector vector(16);
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS emotional_tags TEXT[];
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS dominant_colors JSONB;
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS composition_type VARCHAR(50);
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS movement_type VARCHAR(50);
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS texture_type VARCHAR(50);
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS emotional_valence FLOAT;
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS energy_level FLOAT;

-- 감정 벡터 인덱스 (벡터 유사도 검색용)
CREATE INDEX IF NOT EXISTS idx_artworks_emotion_vector ON artworks USING ivfflat (emotion_vector vector_cosine_ops);

-- 감정 태그 인덱스
CREATE INDEX IF NOT EXISTS idx_artworks_emotional_tags ON artworks USING GIN(emotional_tags);

-- 샘플 데이터: 작품에 감정 데이터 추가 (예시)
UPDATE artworks 
SET 
    emotional_tags = ARRAY['peaceful', 'contemplative', 'serene'],
    dominant_colors = '{"primary": "blue", "secondary": "white", "palette": "cool"}',
    composition_type = 'centered',
    movement_type = 'flowing',
    texture_type = 'smooth',
    emotional_valence = 0.6,
    energy_level = 0.3
WHERE title ILIKE '%water lilies%';

UPDATE artworks 
SET 
    emotional_tags = ARRAY['turbulent', 'dynamic', 'mysterious'],
    dominant_colors = '{"primary": "blue", "secondary": "yellow", "palette": "contrasting"}',
    composition_type = 'dynamic',
    movement_type = 'flowing',
    texture_type = 'rough',
    emotional_valence = 0.2,
    energy_level = 0.8
WHERE title ILIKE '%starry night%';

-- 감정 번역 통계 뷰
CREATE OR REPLACE VIEW emotion_translation_stats AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    COUNT(*) as total_translations,
    COUNT(DISTINCT user_id) as unique_users,
    AVG((interpretation->'dimensions'->>'complexity')::float) as avg_complexity,
    MODE() WITHIN GROUP (ORDER BY emotion_input->'color'->'primary'->>'hue') as most_common_hue
FROM emotion_translation_sessions
GROUP BY DATE_TRUNC('day', created_at);

-- 함수: 감정 벡터 생성 (예시)
CREATE OR REPLACE FUNCTION generate_emotion_vector(
    valence FLOAT,
    arousal FLOAT,
    dominance FLOAT,
    complexity FLOAT,
    color_warmth FLOAT,
    composition_dynamics FLOAT,
    texture_roughness FLOAT,
    movement_energy FLOAT
) RETURNS vector AS $$
BEGIN
    -- 8차원 기본 벡터 + 8차원 스타일 벡터 = 16차원
    RETURN ARRAY[
        valence, arousal, dominance, complexity,
        color_warmth, composition_dynamics, texture_roughness, movement_energy,
        0, 0, 0, 0, 0, 0, 0, 0  -- 스타일 차원 (추후 확장)
    ]::vector;
END;
$$ LANGUAGE plpgsql;