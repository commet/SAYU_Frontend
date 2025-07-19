-- Migration: Add SAYU personality type system fields
-- Date: 2025-01-13

-- Add SAYU-specific columns to user_profiles table
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS sayu_type_code VARCHAR(4),
ADD COLUMN IF NOT EXISTS sayu_animal_archetype VARCHAR(100),
ADD COLUMN IF NOT EXISTS sayu_type_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS sayu_dominant_function VARCHAR(2),
ADD COLUMN IF NOT EXISTS sayu_inferior_function VARCHAR(2),
ADD COLUMN IF NOT EXISTS sayu_growth_areas JSONB,
ADD COLUMN IF NOT EXISTS sayu_visual_scene TEXT,
ADD COLUMN IF NOT EXISTS sayu_gallery_behavior TEXT,
ADD COLUMN IF NOT EXISTS sayu_data JSONB DEFAULT '{}';

-- Add index for SAYU type lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_sayu_type ON user_profiles(sayu_type_code);

-- Update quiz_sessions to support SAYU quiz type
ALTER TABLE quiz_sessions
ADD COLUMN IF NOT EXISTS quiz_version VARCHAR(20) DEFAULT 'apt',
ADD COLUMN IF NOT EXISTS sayu_dimensions JSONB,
ADD COLUMN IF NOT EXISTS result_data JSONB;

-- Create SAYU personality types reference table
CREATE TABLE IF NOT EXISTS sayu_personality_types (
    code VARCHAR(4) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    animal_archetype VARCHAR(100) NOT NULL,
    description TEXT,
    characteristics TEXT[],
    visual_scene TEXT,
    gallery_behavior TEXT,
    dominant_function VARCHAR(2),
    auxiliary_function VARCHAR(2),
    tertiary_function VARCHAR(2),
    inferior_function VARCHAR(2),
    conscious_functions VARCHAR(2)[],
    unconscious_functions VARCHAR(2)[],
    preferences JSONB,
    recommendations JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert SAYU 16 personality types
INSERT INTO sayu_personality_types (code, name, animal_archetype, description, characteristics, dominant_function, inferior_function, conscious_functions, unconscious_functions) VALUES
('LAEF', '몽환적 방랑자', 'Dreamy Wanderer', '혼자서 추상 작품을 감정적으로 자유롭게 감상', ARRAY['독립적', '감성적', '자유로운', '직관적'], 'Le', 'Ci', ARRAY['Le', 'Ai', 'Ee', 'Ci'], ARRAY['Li', 'Ae', 'Ei', 'Fe']),
('LAEC', '감성 큐레이터', 'Emotional Curator', '혼자서 추상 작품을 감정적으로 체계적으로 감상', ARRAY['섬세한', '체계적', '감성적', '분석적'], 'Le', 'Fi', ARRAY['Le', 'Ai', 'Ee', 'Fi'], ARRAY['Li', 'Ae', 'Ei', 'Ce']),
('LAMF', '직관적 탐구자', 'Intuitive Explorer', '혼자서 추상 작품의 의미를 자유롭게 탐구', ARRAY['탐구적', '자유로운', '철학적', '개방적'], 'Le', 'Ci', ARRAY['Le', 'Ai', 'Me', 'Ci'], ARRAY['Li', 'Ae', 'Mi', 'Fe']),
('LAMC', '철학적 수집가', 'Philosophical Collector', '혼자서 추상 작품의 의미를 체계적으로 정리', ARRAY['체계적', '철학적', '수집가', '분석적'], 'Le', 'Fi', ARRAY['Le', 'Ai', 'Me', 'Fi'], ARRAY['Li', 'Ae', 'Mi', 'Ce']),
('LREF', '고독한 관찰자', 'Solitary Observer', '혼자서 구상 작품을 감정적으로 자유롭게 관찰', ARRAY['관찰력', '감성적', '독립적', '자유로운'], 'Le', 'Ci', ARRAY['Le', 'Ri', 'Ee', 'Ci'], ARRAY['Li', 'Re', 'Ei', 'Fe']),
('LREC', '섬세한 감정가', 'Delicate Connoisseur', '혼자서 구상 작품을 감정적으로 체계적으로 음미', ARRAY['섬세한', '체계적', '감상적', '깊이있는'], 'Le', 'Fi', ARRAY['Le', 'Ri', 'Ee', 'Fi'], ARRAY['Li', 'Re', 'Ei', 'Ce']),
('LRMF', '디지털 탐험가', 'Digital Explorer', '혼자서 구상 작품의 의미를 자유롭게 분석', ARRAY['분석적', '탐험적', '기술적', '자유로운'], 'Le', 'Ci', ARRAY['Le', 'Ri', 'Me', 'Ci'], ARRAY['Li', 'Re', 'Mi', 'Fe']),
('LRMC', '학구적 연구자', 'Academic Researcher', '혼자서 구상 작품의 의미를 체계적으로 연구', ARRAY['학구적', '체계적', '연구적', '정밀한'], 'Le', 'Fi', ARRAY['Le', 'Ri', 'Me', 'Fi'], ARRAY['Li', 'Re', 'Mi', 'Ce']),
('SAEF', '감성 나눔이', 'Emotional Sharer', '함께 추상 작품의 감정을 자유롭게 나눔', ARRAY['사교적', '감성적', '나눔', '자유로운'], 'Se', 'Ci', ARRAY['Se', 'Ai', 'Ee', 'Ci'], ARRAY['Si', 'Ae', 'Ei', 'Fe']),
('SAEC', '예술 네트워커', 'Art Networker', '함께 추상 작품의 감정을 체계적으로 공유', ARRAY['네트워킹', '체계적', '감성적', '연결'], 'Se', 'Fi', ARRAY['Se', 'Ai', 'Ee', 'Fi'], ARRAY['Si', 'Ae', 'Ei', 'Ce']),
('SAMF', '영감 전도사', 'Inspiration Evangelist', '함께 추상 작품의 의미를 자유롭게 전파', ARRAY['전파력', '영감적', '자유로운', '열정적'], 'Se', 'Ci', ARRAY['Se', 'Ai', 'Me', 'Ci'], ARRAY['Si', 'Ae', 'Mi', 'Fe']),
('SAMC', '문화 기획자', 'Cultural Planner', '함께 추상 작품의 의미를 체계적으로 기획', ARRAY['기획력', '체계적', '문화적', '조직적'], 'Se', 'Fi', ARRAY['Se', 'Ai', 'Me', 'Fi'], ARRAY['Si', 'Ae', 'Mi', 'Ce']),
('SREF', '열정적 관람자', 'Passionate Viewer', '함께 구상 작품을 감정적으로 자유롭게 즐김', ARRAY['열정적', '사교적', '즐거운', '자유로운'], 'Se', 'Ci', ARRAY['Se', 'Ri', 'Ee', 'Ci'], ARRAY['Si', 'Re', 'Ei', 'Fe']),
('SREC', '따뜻한 안내자', 'Warm Guide', '함께 구상 작품을 감정적으로 체계적으로 안내', ARRAY['안내력', '따뜻한', '체계적', '배려'], 'Se', 'Fi', ARRAY['Se', 'Ri', 'Ee', 'Fi'], ARRAY['Si', 'Re', 'Ei', 'Ce']),
('SRMF', '지식 멘토', 'Knowledge Mentor', '함께 구상 작품의 의미를 자유롭게 가르침', ARRAY['가르침', '지식', '자유로운', '멘토링'], 'Se', 'Ci', ARRAY['Se', 'Ri', 'Me', 'Ci'], ARRAY['Si', 'Re', 'Mi', 'Fe']),
('SRMC', '체계적 교육자', 'Systematic Educator', '함께 구상 작품의 의미를 체계적으로 교육', ARRAY['교육적', '체계적', '조직적', '전문적'], 'Se', 'Fi', ARRAY['Se', 'Ri', 'Me', 'Fi'], ARRAY['Si', 'Re', 'Mi', 'Ce']);

-- Create SAYU function definitions table
CREATE TABLE IF NOT EXISTS sayu_functions (
    code VARCHAR(2) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    axis VARCHAR(3) NOT NULL,
    description TEXT
);

INSERT INTO sayu_functions (code, name, axis, description) VALUES
('Le', '혼자 외부관찰', 'L/S', '작품을 개인적으로 관찰하며 객관적 특성 파악'),
('Li', '혼자 내면탐구', 'L/S', '작품과의 내적 대화를 통한 성찰'),
('Se', '함께 외부교류', 'L/S', '타인과 작품에 대한 의견 교환'),
('Si', '함께 내면공유', 'L/S', '타인과 감정적 공명 추구'),
('Ae', '추상 추구', 'A/R', '추상적 작품을 적극적으로 찾고 선호'),
('Ai', '추상 음미', 'A/R', '추상적 작품의 모호함 속에서 개인적 의미 발견'),
('Re', '구상 추구', 'A/R', '명확한 형태의 작품을 적극 탐색'),
('Ri', '구상 음미', 'A/R', '세밀한 묘사와 현실적 표현을 조용히 감상'),
('Ee', '감정 표현', 'E/M', '즉각적 감정의 외부 표출'),
('Ei', '감정 수용', 'E/M', '작품의 감정을 내면으로 흡수'),
('Me', '의미 전달', 'E/M', '해석과 의미를 타인에게 설명'),
('Mi', '의미 탐구', 'E/M', '심층적 의미를 내적으로 탐색'),
('Fe', '경로 창조', 'F/C', '즉흥적으로 동선을 만들며 자유롭게 관람'),
('Fi', '흐름 따르기', 'F/C', '전시의 자연스러운 흐름이나 직관을 따라 관람'),
('Ce', '체계 설계', 'F/C', '효율적 관람 순서를 미리 계획하고 실행'),
('Ci', '순서 준수', 'F/C', '정해진 순서나 추천 경로를 충실히 따라 관람');

-- Create SAYU type relationships table
CREATE TABLE IF NOT EXISTS sayu_type_relationships (
    type1 VARCHAR(4) NOT NULL,
    type2 VARCHAR(4) NOT NULL,
    compatibility FLOAT,
    growth_potential FLOAT,
    conflict_potential FLOAT,
    synergy_description TEXT,
    PRIMARY KEY (type1, type2),
    FOREIGN KEY (type1) REFERENCES sayu_personality_types(code),
    FOREIGN KEY (type2) REFERENCES sayu_personality_types(code)
);

-- Add SAYU compatibility data will be populated by the application

-- Create view for user SAYU profiles
CREATE OR REPLACE VIEW user_sayu_profiles AS
SELECT 
    u.id as user_id,
    u.email,
    u.nickname,
    up.sayu_type_code,
    spt.name as sayu_type_name,
    spt.animal_archetype,
    spt.description,
    spt.characteristics,
    spt.visual_scene,
    spt.gallery_behavior,
    up.sayu_data,
    up.personality_confidence,
    up.created_at as profile_created_at
FROM users u
LEFT JOIN user_profiles up ON u.id = up.user_id
LEFT JOIN sayu_personality_types spt ON up.sayu_type_code = spt.code
WHERE up.sayu_type_code IS NOT NULL;

-- Add comments
COMMENT ON COLUMN user_profiles.sayu_type_code IS 'SAYU 16 personality type code (e.g., LAEF, SRMC)';
COMMENT ON COLUMN user_profiles.sayu_animal_archetype IS 'Animal archetype name for the SAYU type';
COMMENT ON COLUMN user_profiles.sayu_dominant_function IS 'Dominant cognitive function in SAYU system';
COMMENT ON COLUMN user_profiles.sayu_data IS 'Complete SAYU personality analysis data';
COMMENT ON TABLE sayu_personality_types IS 'Reference table for all 16 SAYU personality types';
COMMENT ON TABLE sayu_functions IS 'Reference table for 16 SAYU cognitive functions';
COMMENT ON TABLE sayu_type_relationships IS 'Compatibility matrix between SAYU types';