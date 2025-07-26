-- SAYU 듀얼 가치 창출 시스템 데이터베이스 스키마
-- 개인 성장과 집단 지성을 동시에 창출하는 시스템

-- 1. 개인 성장 추적 시스템

-- 감정 어휘 성장 추적
CREATE TABLE emotional_vocabulary_growth (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vocabulary_count INTEGER NOT NULL,
    sophistication_score FLOAT NOT NULL, -- 0-1 사이의 감정 표현 정교함
    unique_emotions_used INTEGER NOT NULL,
    complexity_index FLOAT NOT NULL, -- 복합 감정 표현 능력
    measured_at TIMESTAMPTZ DEFAULT NOW(),
    growth_metrics JSONB -- 세부 성장 지표
);

-- 사유 깊이 발전 추적  
CREATE TABLE contemplative_depth_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    artwork_id UUID NOT NULL,
    reflection_text TEXT NOT NULL,
    depth_score FLOAT NOT NULL, -- AI 분석으로 산출된 사유 깊이
    philosophical_themes TEXT[], -- 추출된 철학적 주제들
    metaphor_usage_count INTEGER DEFAULT 0,
    abstract_thinking_level INTEGER DEFAULT 1, -- 1-5 단계
    cognitive_complexity JSONB, -- 인지적 복잡성 지표
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 예술 이해도 성장 추적
CREATE TABLE art_comprehension_evolution (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    genre VARCHAR(100) NOT NULL,
    understanding_level FLOAT NOT NULL, -- 0-1 사이의 이해도
    technical_knowledge_score FLOAT DEFAULT 0,
    historical_context_score FLOAT DEFAULT 0,
    personal_connection_score FLOAT DEFAULT 0,
    cross_cultural_understanding FLOAT DEFAULT 0,
    progression_rate FLOAT DEFAULT 0, -- 성장 속도
    measured_at TIMESTAMPTZ DEFAULT NOW()
);

-- 공감 능력 향상 추적
CREATE TABLE empathy_development (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    interaction_id UUID, -- 다른 사용자와의 상호작용 ID
    empathy_score FLOAT NOT NULL, -- 0-1 사이의 공감 능력
    perspective_taking_ability FLOAT DEFAULT 0,
    emotional_resonance_score FLOAT DEFAULT 0,
    cultural_sensitivity FLOAT DEFAULT 0,
    feedback_quality FLOAT DEFAULT 0, -- 다른 사용자에게 제공한 피드백 품질
    measured_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 집단 지성 아카이브 시스템

-- 작품별 해석 아카이브
CREATE TABLE artwork_interpretation_archive (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artwork_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    interpretation_text TEXT NOT NULL,
    emotional_tags TEXT[] NOT NULL,
    cultural_perspective VARCHAR(100), -- 문화적 관점
    generation_cohort VARCHAR(50), -- 세대 구분
    personality_type VARCHAR(4), -- SAYU 성격 유형
    interpretation_quality_score FLOAT DEFAULT 0, -- 커뮤니티 평가 점수
    novelty_score FLOAT DEFAULT 0, -- 해석의 독창성
    depth_score FLOAT DEFAULT 0, -- 해석의 깊이
    accessibility_score FLOAT DEFAULT 0, -- 이해하기 쉬운 정도
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 해석에 대한 커뮤니티 피드백
CREATE TABLE interpretation_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interpretation_id UUID NOT NULL REFERENCES artwork_interpretation_archive(id) ON DELETE CASCADE,
    feedback_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    feedback_type VARCHAR(50) NOT NULL, -- 'insightful', 'resonant', 'novel', 'helpful'
    resonance_score INTEGER NOT NULL CHECK (resonance_score >= 1 AND resonance_score <= 5),
    learning_value INTEGER NOT NULL CHECK (learning_value >= 1 AND learning_value <= 5),
    perspective_expansion INTEGER NOT NULL CHECK (perspective_expansion >= 1 AND perspective_expansion <= 5),
    feedback_comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 사용자 큐레이션 전시 경로
CREATE TABLE user_curated_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    curator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    path_title VARCHAR(200) NOT NULL,
    path_description TEXT,
    theme VARCHAR(100),
    emotional_journey TEXT[], -- 감정적 여정 설계
    difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
    estimated_duration INTEGER, -- 분 단위
    artwork_sequence JSONB NOT NULL, -- 작품 순서와 연결 논리
    community_rating FLOAT DEFAULT 0,
    usage_count INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 감정 지도 데이터베이스
CREATE TABLE collective_emotion_mapping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artwork_id UUID NOT NULL,
    emotion_category VARCHAR(100) NOT NULL,
    intensity_distribution JSONB NOT NULL, -- 강도별 분포
    cultural_variations JSONB, -- 문화별 차이
    personality_correlations JSONB, -- 성격 유형별 상관관계
    age_group_patterns JSONB, -- 연령대별 패턴
    temporal_changes JSONB, -- 시간에 따른 변화
    sample_size INTEGER NOT NULL,
    confidence_interval FLOAT,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 가치 교환 및 순환 시스템

-- 기여도 측정 시스템
CREATE TABLE contribution_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    contribution_type VARCHAR(100) NOT NULL, -- 'interpretation', 'feedback', 'curation', 'mentoring'
    quality_score FLOAT NOT NULL,
    impact_score FLOAT NOT NULL, -- 커뮤니티에 미친 영향
    novelty_contribution FLOAT DEFAULT 0,
    learning_facilitation FLOAT DEFAULT 0,
    community_engagement FLOAT DEFAULT 0,
    cultural_bridge_building FLOAT DEFAULT 0, -- 문화 간 이해 증진
    accumulated_points FLOAT DEFAULT 0,
    contribution_streak INTEGER DEFAULT 0, -- 연속 기여 일수
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 상호 학습 추적
CREATE TABLE mutual_learning_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    learning_context UUID, -- 해석, 큐레이션 등의 맥락
    learning_type VARCHAR(100) NOT NULL, -- 'perspective_shift', 'technique_learning', 'cultural_insight'
    learning_depth FLOAT NOT NULL,
    application_evidence TEXT, -- 학습 적용 증거
    mutual_benefit_score FLOAT DEFAULT 0, -- 상호 혜택 정도
    learning_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 지식 재생산 추적
CREATE TABLE knowledge_reproduction_cycle (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_contributor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    knowledge_adopter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    knowledge_element_id UUID NOT NULL, -- 원본 해석/큐레이션 ID
    adaptation_type VARCHAR(100) NOT NULL, -- 'building_upon', 'recontextualizing', 'synthesizing'
    value_added TEXT, -- 추가된 가치
    reproduction_quality FLOAT NOT NULL,
    generational_depth INTEGER DEFAULT 1, -- 몇 단계 파생인지
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 개인 성장 대시보드 데이터

-- 종합 성장 지표
CREATE TABLE personal_growth_dashboard (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- 감정 지능 지표
    emotional_vocabulary_richness FLOAT DEFAULT 0,
    emotional_nuance_ability FLOAT DEFAULT 0,
    emotional_self_awareness FLOAT DEFAULT 0,
    
    -- 사유 능력 지표  
    philosophical_thinking_depth FLOAT DEFAULT 0,
    abstract_reasoning_ability FLOAT DEFAULT 0,
    critical_analysis_skill FLOAT DEFAULT 0,
    
    -- 예술 이해 지표
    genre_comprehension_breadth FLOAT DEFAULT 0,
    cultural_context_understanding FLOAT DEFAULT 0,
    technical_appreciation_level FLOAT DEFAULT 0,
    
    -- 사회적 지능 지표
    empathy_quotient FLOAT DEFAULT 0,
    cultural_sensitivity_score FLOAT DEFAULT 0,
    perspective_taking_ability FLOAT DEFAULT 0,
    
    -- 기여 및 영향력 지표
    community_contribution_score FLOAT DEFAULT 0,
    teaching_effectiveness FLOAT DEFAULT 0,
    knowledge_synthesis_ability FLOAT DEFAULT 0,
    
    overall_growth_trajectory FLOAT DEFAULT 0,
    growth_velocity FLOAT DEFAULT 0,
    personal_mission_alignment FLOAT DEFAULT 0,
    
    calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 성능 최적화를 위한 인덱스

-- 개인 성장 추적 인덱스
CREATE INDEX idx_emotional_vocabulary_user_time ON emotional_vocabulary_growth(user_id, measured_at DESC);
CREATE INDEX idx_contemplative_depth_user_artwork ON contemplative_depth_tracking(user_id, artwork_id);
CREATE INDEX idx_art_comprehension_user_genre ON art_comprehension_evolution(user_id, genre);
CREATE INDEX idx_empathy_development_user_time ON empathy_development(user_id, measured_at DESC);

-- 집단 지성 아카이브 인덱스
CREATE INDEX idx_interpretation_artwork_quality ON artwork_interpretation_archive(artwork_id, interpretation_quality_score DESC);
CREATE INDEX idx_interpretation_personality_type ON artwork_interpretation_archive(personality_type);
CREATE INDEX idx_interpretation_cultural_perspective ON artwork_interpretation_archive(cultural_perspective);
CREATE INDEX idx_feedback_interpretation_type ON interpretation_feedback(interpretation_id, feedback_type);

-- 큐레이션 및 감정 지도 인덱스
CREATE INDEX idx_curated_paths_theme_rating ON user_curated_paths(theme, community_rating DESC);
CREATE INDEX idx_emotion_mapping_artwork_category ON collective_emotion_mapping(artwork_id, emotion_category);

-- 기여도 및 학습 추적 인덱스
CREATE INDEX idx_contribution_user_type_score ON contribution_metrics(user_id, contribution_type, quality_score DESC);
CREATE INDEX idx_mutual_learning_participants ON mutual_learning_tracking(learner_id, teacher_id);
CREATE INDEX idx_knowledge_reproduction_original ON knowledge_reproduction_cycle(original_contributor_id, generational_depth);

-- 성장 대시보드 인덱스
CREATE INDEX idx_growth_dashboard_user_calculated ON personal_growth_dashboard(user_id, calculated_at DESC);

-- 6. 뷰 및 집계 함수

-- 사용자별 종합 성장 리포트 뷰
CREATE OR REPLACE VIEW user_growth_summary AS
SELECT 
    u.id as user_id,
    u.nickname,
    up.type_code,
    pgd.emotional_vocabulary_richness,
    pgd.philosophical_thinking_depth,
    pgd.genre_comprehension_breadth,
    pgd.empathy_quotient,
    pgd.community_contribution_score,
    pgd.overall_growth_trajectory,
    pgd.calculated_at as last_assessment
FROM users u
JOIN user_profiles up ON u.id = up.user_id
LEFT JOIN personal_growth_dashboard pgd ON u.id = pgd.user_id
WHERE pgd.calculated_at = (
    SELECT MAX(calculated_at) 
    FROM personal_growth_dashboard 
    WHERE user_id = u.id
);

-- 작품별 집단 지성 요약 뷰
CREATE OR REPLACE VIEW artwork_collective_intelligence AS
SELECT 
    aia.artwork_id,
    COUNT(DISTINCT aia.user_id) as interpretation_count,
    AVG(aia.interpretation_quality_score) as avg_quality,
    AVG(aia.novelty_score) as avg_novelty,
    AVG(aia.depth_score) as avg_depth,
    ARRAY_AGG(DISTINCT aia.cultural_perspective) as cultural_perspectives,
    ARRAY_AGG(DISTINCT aia.personality_type) as personality_types_represented,
    COUNT(DISTINCT if.feedback_user_id) as community_engagement_count
FROM artwork_interpretation_archive aia
LEFT JOIN interpretation_feedback if ON aia.id = if.interpretation_id
GROUP BY aia.artwork_id;

-- 가치 순환 효율성 분석 뷰
CREATE OR REPLACE VIEW value_circulation_analysis AS
SELECT 
    DATE_TRUNC('month', cm.recorded_at) as month,
    COUNT(DISTINCT cm.user_id) as active_contributors,
    SUM(cm.accumulated_points) as total_value_created,
    AVG(cm.community_engagement) as avg_engagement,
    COUNT(DISTINCT mlt.learner_id) as active_learners,
    COUNT(DISTINCT krc.knowledge_adopter_id) as knowledge_adopters,
    AVG(krc.reproduction_quality) as knowledge_reproduction_quality
FROM contribution_metrics cm
LEFT JOIN mutual_learning_tracking mlt ON DATE_TRUNC('month', mlt.created_at) = DATE_TRUNC('month', cm.recorded_at)
LEFT JOIN knowledge_reproduction_cycle krc ON DATE_TRUNC('month', krc.created_at) = DATE_TRUNC('month', cm.recorded_at)
GROUP BY DATE_TRUNC('month', cm.recorded_at)
ORDER BY month DESC;

COMMENT ON TABLE emotional_vocabulary_growth IS '사용자의 감정 어휘 및 표현 능력 성장 추적';
COMMENT ON TABLE contemplative_depth_tracking IS '예술 작품을 통한 사유 깊이 발전 측정';
COMMENT ON TABLE art_comprehension_evolution IS '장르별 예술 이해도 성장 기록';
COMMENT ON TABLE empathy_development IS '타인과의 공감 및 소통 능력 향상 추적';
COMMENT ON TABLE artwork_interpretation_archive IS '작품별 다층적 해석 집단 지성 아카이브';
COMMENT ON TABLE interpretation_feedback IS '해석에 대한 커뮤니티 피드백 및 학습 촉진';
COMMENT ON TABLE user_curated_paths IS '사용자가 큐레이션한 의미 있는 예술 경험 경로';
COMMENT ON TABLE collective_emotion_mapping IS '작품별 감정 반응 집단 데이터 지도';
COMMENT ON TABLE contribution_metrics IS '개인의 커뮤니티 기여도 정량화 시스템';
COMMENT ON TABLE mutual_learning_tracking IS '사용자 간 상호 학습 과정 추적';
COMMENT ON TABLE knowledge_reproduction_cycle IS '지식의 재생산 및 발전 순환 추적';
COMMENT ON TABLE personal_growth_dashboard IS '개인 성장 종합 대시보드 데이터';