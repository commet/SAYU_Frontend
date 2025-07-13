-- AI 추천 시스템 데이터베이스 스키마

-- 사용자 추천 기록
CREATE TABLE IF NOT EXISTS user_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- 추천 정보
  recommendation_type VARCHAR(50) NOT NULL, -- 'exhibition', 'artwork', 'artist'
  item_id UUID NOT NULL, -- 추천된 아이템의 ID
  recommendation_algorithm VARCHAR(50) NOT NULL, -- 'content_based', 'collaborative', 'knowledge_based', 'hybrid'
  
  -- 점수 및 순위
  relevance_score FLOAT DEFAULT 0,
  final_score FLOAT DEFAULT 0,
  rank_position INTEGER DEFAULT 0,
  
  -- 추천 이유
  recommendation_reason TEXT,
  explanation_tags TEXT[],
  
  -- 사용자 반응
  was_viewed BOOLEAN DEFAULT FALSE,
  was_liked BOOLEAN DEFAULT FALSE,
  was_bookmarked BOOLEAN DEFAULT FALSE,
  was_clicked BOOLEAN DEFAULT FALSE,
  
  -- 메타데이터
  recommendation_context JSONB DEFAULT '{}', -- 추천 당시 컨텍스트
  created_at TIMESTAMPTZ DEFAULT NOW(),
  viewed_at TIMESTAMPTZ,
  interacted_at TIMESTAMPTZ
);

-- 사용자 선호도 프로필
CREATE TABLE IF NOT EXISTS user_preference_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  
  -- 명시적 선호도
  preferred_genres TEXT[] DEFAULT '{}',
  preferred_artists TEXT[] DEFAULT '{}',
  preferred_periods TEXT[] DEFAULT '{}',
  preferred_locations TEXT[] DEFAULT '{}',
  
  -- 암시적 선호도 (행동 기반)
  implicit_genres JSONB DEFAULT '{}', -- {"contemporary": 0.8, "classical": 0.6}
  implicit_artists JSONB DEFAULT '{}',
  implicit_moods JSONB DEFAULT '{}',
  implicit_styles JSONB DEFAULT '{}',
  
  -- 행동 패턴
  avg_viewing_duration INTEGER DEFAULT 0, -- 분 단위
  preferred_time_slots TEXT[] DEFAULT '{}', -- ['morning', 'afternoon', 'evening']
  weekend_preference FLOAT DEFAULT 0.5, -- 0=weekday, 1=weekend
  price_sensitivity FLOAT DEFAULT 0.5, -- 0=price-sensitive, 1=price-insensitive
  
  -- 성격 기반 가중치
  personality_weights JSONB DEFAULT '{}',
  
  -- 업데이트 정보
  profile_completeness FLOAT DEFAULT 0.0, -- 0.0 to 1.0
  last_activity_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 추천 피드백
CREATE TABLE IF NOT EXISTS recommendation_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recommendation_id UUID NOT NULL REFERENCES user_recommendations(id) ON DELETE CASCADE,
  
  -- 피드백 유형
  feedback_type VARCHAR(50) NOT NULL, -- 'like', 'dislike', 'not_interested', 'report'
  feedback_value FLOAT, -- 1.0 = positive, -1.0 = negative, 0.5 = neutral
  
  -- 상세 피드백
  feedback_reason VARCHAR(100), -- 'not_my_taste', 'too_far', 'already_visited', etc.
  feedback_text TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 아이템 유사도 매트릭스 (전시회)
CREATE TABLE IF NOT EXISTS exhibition_similarities (
  exhibition_a_id UUID NOT NULL,
  exhibition_b_id UUID NOT NULL,
  
  -- 유사도 점수
  content_similarity FLOAT DEFAULT 0, -- 장르, 작가, 테마 기반
  collaborative_similarity FLOAT DEFAULT 0, -- 사용자 행동 기반
  overall_similarity FLOAT DEFAULT 0,
  
  -- 계산 메타데이터
  similarity_factors JSONB DEFAULT '{}',
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  
  PRIMARY KEY (exhibition_a_id, exhibition_b_id),
  FOREIGN KEY (exhibition_a_id) REFERENCES exhibitions(id) ON DELETE CASCADE,
  FOREIGN KEY (exhibition_b_id) REFERENCES exhibitions(id) ON DELETE CASCADE
);

-- 사용자 유사도 매트릭스
CREATE TABLE IF NOT EXISTS user_similarities (
  user_a_id UUID NOT NULL,
  user_b_id UUID NOT NULL,
  
  -- 유사도 점수
  taste_similarity FLOAT DEFAULT 0, -- 취향 유사도
  behavior_similarity FLOAT DEFAULT 0, -- 행동 패턴 유사도
  demographic_similarity FLOAT DEFAULT 0, -- 인구통계학적 유사도
  overall_similarity FLOAT DEFAULT 0,
  
  -- 공통 관심사
  common_exhibitions INTEGER DEFAULT 0,
  common_artists INTEGER DEFAULT 0,
  common_genres INTEGER DEFAULT 0,
  
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  
  PRIMARY KEY (user_a_id, user_b_id),
  FOREIGN KEY (user_a_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (user_b_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 추천 성능 메트릭
CREATE TABLE IF NOT EXISTS recommendation_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 메트릭 정보
  metric_date DATE NOT NULL,
  recommendation_type VARCHAR(50) NOT NULL,
  algorithm_type VARCHAR(50) NOT NULL,
  
  -- 성능 지표
  total_recommendations INTEGER DEFAULT 0,
  click_through_rate FLOAT DEFAULT 0,
  conversion_rate FLOAT DEFAULT 0,
  avg_relevance_score FLOAT DEFAULT 0,
  
  -- 다양성 지표
  diversity_score FLOAT DEFAULT 0,
  coverage_percentage FLOAT DEFAULT 0,
  novelty_score FLOAT DEFAULT 0,
  
  -- 세부 메트릭
  top_1_accuracy FLOAT DEFAULT 0,
  top_5_accuracy FLOAT DEFAULT 0,
  top_10_accuracy FLOAT DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 개인화 규칙
CREATE TABLE IF NOT EXISTS personalization_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 규칙 정보
  rule_name VARCHAR(200) NOT NULL,
  rule_type VARCHAR(50) NOT NULL, -- 'boost', 'filter', 'rerank'
  priority INTEGER DEFAULT 0,
  
  -- 조건
  conditions JSONB NOT NULL, -- {"personality_type": "LAEF", "user_level": "> 10"}
  
  -- 액션
  actions JSONB NOT NULL, -- {"boost_genres": ["contemporary"], "boost_factor": 1.5}
  
  -- 메타데이터
  is_active BOOLEAN DEFAULT TRUE,
  effective_from DATE,
  effective_until DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_user_recommendations_user_id ON user_recommendations(user_id);
CREATE INDEX idx_user_recommendations_type ON user_recommendations(recommendation_type);
CREATE INDEX idx_user_recommendations_created_at ON user_recommendations(created_at DESC);
CREATE INDEX idx_user_recommendations_score ON user_recommendations(final_score DESC);

CREATE INDEX idx_recommendation_feedback_user_id ON recommendation_feedback(user_id);
CREATE INDEX idx_recommendation_feedback_recommendation_id ON recommendation_feedback(recommendation_id);
CREATE INDEX idx_recommendation_feedback_type ON recommendation_feedback(feedback_type);

CREATE INDEX idx_exhibition_similarities_a ON exhibition_similarities(exhibition_a_id);
CREATE INDEX idx_exhibition_similarities_b ON exhibition_similarities(exhibition_b_id);
CREATE INDEX idx_exhibition_similarities_score ON exhibition_similarities(overall_similarity DESC);

CREATE INDEX idx_user_similarities_a ON user_similarities(user_a_id);
CREATE INDEX idx_user_similarities_b ON user_similarities(user_b_id);
CREATE INDEX idx_user_similarities_score ON user_similarities(overall_similarity DESC);

CREATE INDEX idx_personalization_rules_active ON personalization_rules(is_active);
CREATE INDEX idx_personalization_rules_priority ON personalization_rules(priority DESC);

-- 뷰: 사용자 추천 요약
CREATE OR REPLACE VIEW user_recommendation_summary AS
SELECT 
    up.user_id,
    u.personality_type,
    up.profile_completeness,
    up.last_activity_at,
    COUNT(DISTINCT ur.id) as total_recommendations,
    COUNT(DISTINCT CASE WHEN ur.was_viewed THEN ur.id END) as viewed_recommendations,
    COUNT(DISTINCT CASE WHEN ur.was_liked THEN ur.id END) as liked_recommendations,
    AVG(ur.final_score) as avg_recommendation_score,
    COUNT(DISTINCT rf.id) as total_feedback
FROM user_preference_profiles up
JOIN users u ON up.user_id = u.id
LEFT JOIN user_recommendations ur ON up.user_id = ur.user_id 
    AND ur.created_at > CURRENT_DATE - INTERVAL '30 days'
LEFT JOIN recommendation_feedback rf ON up.user_id = rf.user_id
    AND rf.created_at > CURRENT_DATE - INTERVAL '30 days'
GROUP BY up.user_id, u.personality_type, up.profile_completeness, up.last_activity_at;

-- 함수: 추천 점수 계산
CREATE OR REPLACE FUNCTION calculate_recommendation_score(
    content_score FLOAT,
    collaborative_score FLOAT,
    knowledge_score FLOAT,
    user_profile JSONB
) RETURNS FLOAT AS $$
DECLARE
    final_score FLOAT;
    content_weight FLOAT := 0.4;
    collaborative_weight FLOAT := 0.4;
    knowledge_weight FLOAT := 0.2;
    personality_boost FLOAT := 1.0;
BEGIN
    -- 성격 유형별 가중치 조정
    IF user_profile->>'personality_type' = 'LAEF' THEN
        content_weight := 0.5;
        collaborative_weight := 0.3;
    ELSIF user_profile->>'personality_type' = 'SRMC' THEN
        knowledge_weight := 0.3;
        content_weight := 0.5;
    END IF;
    
    -- 가중 평균 계산
    final_score := (
        content_score * content_weight +
        collaborative_score * collaborative_weight +
        knowledge_score * knowledge_weight
    ) * personality_boost;
    
    RETURN GREATEST(0, LEAST(100, final_score));
END;
$$ LANGUAGE plpgsql;

-- 트리거: 사용자 선호도 프로필 자동 업데이트
CREATE OR REPLACE FUNCTION update_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
    -- 추천 피드백이 생성될 때 사용자 선호도 업데이트
    IF TG_TABLE_NAME = 'recommendation_feedback' THEN
        UPDATE user_preference_profiles
        SET 
            last_activity_at = NOW(),
            updated_at = NOW()
        WHERE user_id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_preferences
AFTER INSERT ON recommendation_feedback
FOR EACH ROW
EXECUTE FUNCTION update_user_preferences();

-- 트리거: 타임스탬프 자동 업데이트
CREATE TRIGGER update_user_preference_profiles_updated_at
BEFORE UPDATE ON user_preference_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_personalization_rules_updated_at
BEFORE UPDATE ON personalization_rules
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();