-- Artvee 통합 시스템 데이터베이스 스키마

-- Artvee 아트웍 컬렉션
CREATE TABLE IF NOT EXISTS artvee_artworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 기본 정보
  artvee_id VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(500) NOT NULL,
  artist VARCHAR(200),
  year_created VARCHAR(50),
  
  -- 분류
  period VARCHAR(100), -- 'Renaissance', 'Impressionism', etc.
  style VARCHAR(100),
  genre VARCHAR(100), -- 'Portrait', 'Landscape', 'Still Life'
  medium VARCHAR(200), -- 'Oil on canvas', etc.
  
  -- 이미지 URL
  artvee_url TEXT NOT NULL,
  cdn_url TEXT,
  thumbnail_url TEXT,
  medium_url TEXT,
  
  -- SAYU 맞춤 태그
  personality_tags TEXT[] DEFAULT '{}', -- ['LAEF', 'SRMC', ...]
  emotion_tags TEXT[] DEFAULT '{}', -- ['serene', 'dramatic', 'joyful']
  color_palette JSONB, -- 주요 색상 정보
  usage_tags TEXT[] DEFAULT '{}', -- ['quiz_bg', 'card', 'loading']
  
  -- 메타데이터
  source_museum VARCHAR(200),
  dimensions VARCHAR(100),
  description TEXT,
  
  -- 품질 및 상태
  image_quality_score FLOAT DEFAULT 0.0,
  processing_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processed', 'failed'
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SAYU 이미지 사용 기록
CREATE TABLE IF NOT EXISTS image_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artwork_id UUID REFERENCES artvee_artworks(id) ON DELETE CASCADE,
  
  -- 사용 정보
  usage_type VARCHAR(50) NOT NULL, -- 'quiz', 'exhibition_card', 'personality_result', 'background'
  usage_context JSONB DEFAULT '{}', -- 사용 컨텍스트 정보
  
  -- 사용자 정보
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id VARCHAR(100),
  
  -- 통계
  view_count INTEGER DEFAULT 0,
  interaction_count INTEGER DEFAULT 0, -- 클릭, 좋아요 등
  
  -- 성능 메트릭
  load_time_ms INTEGER,
  was_cached BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 성격 유형별 아트웍 매핑
CREATE TABLE IF NOT EXISTS personality_artwork_mapping (
  personality_type VARCHAR(4) PRIMARY KEY,
  
  -- 대표 작품들
  primary_artworks UUID[] DEFAULT '{}', -- 대표 작품 ID들
  secondary_artworks UUID[] DEFAULT '{}', -- 보조 작품 ID들
  
  -- 선호도 설정
  style_preferences JSONB DEFAULT '{}', -- 선호 스타일
  color_preferences JSONB DEFAULT '{}', -- 선호 색상
  genre_preferences JSONB DEFAULT '{}', -- 선호 장르
  period_preferences JSONB DEFAULT '{}', -- 선호 시대
  
  -- 매핑 품질
  mapping_confidence FLOAT DEFAULT 0.0, -- 매핑 신뢰도
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 아트웍 수집 작업 로그
CREATE TABLE IF NOT EXISTS artvee_collection_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 작업 정보
  job_type VARCHAR(50) NOT NULL, -- 'category_collection', 'artwork_detail', 'image_processing'
  category VARCHAR(100), -- 수집 카테고리
  job_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
  
  -- 수집 설정
  collection_config JSONB DEFAULT '{}',
  target_count INTEGER,
  
  -- 진행 상황
  items_processed INTEGER DEFAULT 0,
  items_successful INTEGER DEFAULT 0,
  items_failed INTEGER DEFAULT 0,
  
  -- 오류 정보
  error_messages TEXT[],
  last_error TEXT,
  
  -- 시간 정보
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 색상 분석 캐시
CREATE TABLE IF NOT EXISTS artwork_color_analysis (
  artwork_id UUID PRIMARY KEY REFERENCES artvee_artworks(id) ON DELETE CASCADE,
  
  -- 색상 정보
  dominant_color VARCHAR(7), -- hex color
  color_palette JSONB, -- 주요 색상들
  brightness_score FLOAT, -- 0.0 (dark) to 1.0 (bright)
  saturation_score FLOAT, -- 0.0 (grayscale) to 1.0 (vivid)
  warmth_score FLOAT, -- 0.0 (cool) to 1.0 (warm)
  
  -- 색상 분포
  color_distribution JSONB, -- 색상별 비율
  color_harmony_type VARCHAR(50), -- 'monochromatic', 'complementary', 'triadic'
  
  -- 분석 메타데이터
  analysis_method VARCHAR(50), -- 'sharp', 'colorthief', 'custom'
  analysis_version VARCHAR(20),
  confidence_score FLOAT DEFAULT 0.0,
  
  analyzed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 아트웍 유사도 매트릭스
CREATE TABLE IF NOT EXISTS artwork_similarities (
  artwork_a_id UUID NOT NULL REFERENCES artvee_artworks(id) ON DELETE CASCADE,
  artwork_b_id UUID NOT NULL REFERENCES artvee_artworks(id) ON DELETE CASCADE,
  
  -- 유사도 점수
  visual_similarity FLOAT DEFAULT 0.0, -- 시각적 유사도
  style_similarity FLOAT DEFAULT 0.0, -- 스타일 유사도
  color_similarity FLOAT DEFAULT 0.0, -- 색상 유사도
  period_similarity FLOAT DEFAULT 0.0, -- 시대 유사도
  overall_similarity FLOAT DEFAULT 0.0,
  
  -- 계산 정보
  similarity_method VARCHAR(50), -- 'feature_vector', 'deep_learning', 'metadata'
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  
  PRIMARY KEY (artwork_a_id, artwork_b_id),
  CHECK (artwork_a_id < artwork_b_id) -- 중복 방지
);

-- 아트웍 추천 캐시
CREATE TABLE IF NOT EXISTS artwork_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 추천 대상
  context_type VARCHAR(50) NOT NULL, -- 'personality', 'exhibition', 'mood', 'random'
  context_value VARCHAR(100), -- 'LAEF', 'modern_art', 'serene'
  
  -- 추천 결과
  recommended_artworks UUID[] NOT NULL,
  recommendation_scores FLOAT[] DEFAULT '{}',
  
  -- 추천 설정
  recommendation_algorithm VARCHAR(50), -- 'content_based', 'collaborative', 'hybrid'
  max_recommendations INTEGER DEFAULT 10,
  
  -- 캐시 정보
  cache_key VARCHAR(200) UNIQUE,
  cache_expires_at TIMESTAMPTZ,
  hit_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 이미지 최적화 큐
CREATE TABLE IF NOT EXISTS image_optimization_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artwork_id UUID NOT NULL REFERENCES artvee_artworks(id) ON DELETE CASCADE,
  
  -- 최적화 작업 정보
  optimization_type VARCHAR(50) NOT NULL, -- 'resize', 'format_conversion', 'compression'
  priority INTEGER DEFAULT 0, -- 우선순위 (높은 수가 우선)
  
  -- 최적화 설정
  target_sizes JSONB, -- [{"width": 300, "height": 300, "name": "thumbnail"}]
  target_formats TEXT[] DEFAULT '{}', -- ['webp', 'jpg']
  quality_settings JSONB DEFAULT '{}',
  
  -- 상태
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  
  -- 결과
  optimized_urls JSONB DEFAULT '{}',
  original_size_bytes BIGINT,
  optimized_size_bytes BIGINT,
  compression_ratio FLOAT,
  
  -- 오류 정보
  error_message TEXT,
  
  -- 시간 정보
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- 아트웍 메타데이터 보강
CREATE TABLE IF NOT EXISTS artwork_enrichments (
  artwork_id UUID PRIMARY KEY REFERENCES artvee_artworks(id) ON DELETE CASCADE,
  
  -- 외부 데이터 소스
  wikidata_id VARCHAR(50),
  wikipedia_url TEXT,
  dbpedia_url TEXT,
  
  -- 보강된 정보
  detailed_description TEXT,
  art_movement_tags TEXT[] DEFAULT '{}',
  influence_tags TEXT[] DEFAULT '{}', -- 영향을 받은/준 작가들
  technique_tags TEXT[] DEFAULT '{}',
  
  -- 맥락 정보
  historical_context TEXT,
  cultural_significance TEXT,
  creation_story TEXT,
  
  -- 보강 상태
  enrichment_status VARCHAR(50) DEFAULT 'pending',
  enrichment_sources TEXT[] DEFAULT '{}',
  confidence_scores JSONB DEFAULT '{}',
  
  last_enriched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_artvee_artworks_artvee_id ON artvee_artworks(artvee_id);
CREATE INDEX idx_artvee_artworks_artist ON artvee_artworks(artist);
CREATE INDEX idx_artvee_artworks_period ON artvee_artworks(period);
CREATE INDEX idx_artvee_artworks_genre ON artvee_artworks(genre);
CREATE INDEX idx_artvee_artworks_personality_tags ON artvee_artworks USING GIN(personality_tags);
CREATE INDEX idx_artvee_artworks_emotion_tags ON artvee_artworks USING GIN(emotion_tags);
CREATE INDEX idx_artvee_artworks_usage_tags ON artvee_artworks USING GIN(usage_tags);
CREATE INDEX idx_artvee_artworks_active ON artvee_artworks(is_active);
CREATE INDEX idx_artvee_artworks_quality ON artvee_artworks(image_quality_score DESC);

CREATE INDEX idx_image_usage_log_artwork_id ON image_usage_log(artwork_id);
CREATE INDEX idx_image_usage_log_usage_type ON image_usage_log(usage_type);
CREATE INDEX idx_image_usage_log_user_id ON image_usage_log(user_id);
CREATE INDEX idx_image_usage_log_created_at ON image_usage_log(created_at DESC);

CREATE INDEX idx_artvee_collection_jobs_status ON artvee_collection_jobs(job_status);
CREATE INDEX idx_artvee_collection_jobs_type ON artvee_collection_jobs(job_type);
CREATE INDEX idx_artvee_collection_jobs_created_at ON artvee_collection_jobs(created_at DESC);

CREATE INDEX idx_artwork_similarities_a ON artwork_similarities(artwork_a_id);
CREATE INDEX idx_artwork_similarities_b ON artwork_similarities(artwork_b_id);
CREATE INDEX idx_artwork_similarities_overall ON artwork_similarities(overall_similarity DESC);

CREATE INDEX idx_artwork_recommendations_context ON artwork_recommendations(context_type, context_value);
CREATE INDEX idx_artwork_recommendations_cache_key ON artwork_recommendations(cache_key);
CREATE INDEX idx_artwork_recommendations_expires ON artwork_recommendations(cache_expires_at);

CREATE INDEX idx_image_optimization_queue_status ON image_optimization_queue(status);
CREATE INDEX idx_image_optimization_queue_priority ON image_optimization_queue(priority DESC);
CREATE INDEX idx_image_optimization_queue_created_at ON image_optimization_queue(created_at);

-- 뷰: 아트웍 통계 요약
CREATE OR REPLACE VIEW artvee_artwork_stats AS
SELECT 
    COUNT(*) as total_artworks,
    COUNT(CASE WHEN is_active THEN 1 END) as active_artworks,
    COUNT(CASE WHEN processing_status = 'processed' THEN 1 END) as processed_artworks,
    COUNT(CASE WHEN cdn_url IS NOT NULL THEN 1 END) as artworks_with_cdn,
    COUNT(CASE WHEN array_length(personality_tags, 1) > 0 THEN 1 END) as tagged_artworks,
    AVG(image_quality_score) as avg_quality_score,
    COUNT(DISTINCT artist) as unique_artists,
    COUNT(DISTINCT period) as unique_periods,
    COUNT(DISTINCT genre) as unique_genres
FROM artvee_artworks;

-- 뷰: 성격 유형별 아트웍 분포
CREATE OR REPLACE VIEW personality_artwork_distribution AS
SELECT 
    unnest(personality_tags) as personality_type,
    COUNT(*) as artwork_count,
    COUNT(DISTINCT artist) as unique_artists,
    COUNT(DISTINCT period) as unique_periods,
    AVG(image_quality_score) as avg_quality
FROM artvee_artworks
WHERE array_length(personality_tags, 1) > 0
GROUP BY personality_type
ORDER BY artwork_count DESC;

-- 뷰: 인기 아트웍 랭킹
CREATE OR REPLACE VIEW popular_artworks AS
SELECT 
    a.*,
    COALESCE(SUM(iul.view_count), 0) as total_views,
    COALESCE(SUM(iul.interaction_count), 0) as total_interactions,
    COUNT(DISTINCT iul.user_id) as unique_viewers,
    AVG(aca.brightness_score) as brightness,
    AVG(aca.saturation_score) as saturation
FROM artvee_artworks a
LEFT JOIN image_usage_log iul ON a.id = iul.artwork_id
LEFT JOIN artwork_color_analysis aca ON a.id = aca.artwork_id
WHERE a.is_active = true
GROUP BY a.id
ORDER BY total_views DESC, total_interactions DESC;

-- 함수: 성격 유형별 아트웍 추천
CREATE OR REPLACE FUNCTION get_personality_artworks(
    p_personality_type VARCHAR(4),
    p_limit INTEGER DEFAULT 10,
    p_usage_type VARCHAR(50) DEFAULT NULL
)
RETURNS TABLE(
    artwork_id UUID,
    title VARCHAR(500),
    artist VARCHAR(200),
    cdn_url TEXT,
    relevance_score FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.title,
        a.artist,
        a.cdn_url,
        (
            CASE WHEN p_personality_type = ANY(a.personality_tags) THEN 1.0 ELSE 0.0 END +
            a.image_quality_score * 0.3 +
            COALESCE(aca.confidence_score, 0.0) * 0.2
        ) as relevance_score
    FROM artvee_artworks a
    LEFT JOIN artwork_color_analysis aca ON a.id = aca.artwork_id
    WHERE a.is_active = true
      AND (p_usage_type IS NULL OR p_usage_type = ANY(a.usage_tags))
      AND (p_personality_type = ANY(a.personality_tags) OR array_length(a.personality_tags, 1) = 0)
    ORDER BY relevance_score DESC, a.image_quality_score DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- 함수: 아트웍 색상 분석
CREATE OR REPLACE FUNCTION analyze_artwork_colors(p_artwork_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    artwork_record RECORD;
    color_analysis JSONB;
BEGIN
    -- 아트웍 정보 조회
    SELECT * INTO artwork_record FROM artvee_artworks WHERE id = p_artwork_id;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- 실제 구현에서는 이미지 분석 라이브러리 사용
    -- 여기서는 더미 데이터 생성
    color_analysis := jsonb_build_object(
        'dominant_color', '#' || lpad(to_hex((random() * 16777215)::int), 6, '0'),
        'brightness_score', random(),
        'saturation_score', random(),
        'warmth_score', random()
    );
    
    -- 색상 분석 결과 저장
    INSERT INTO artwork_color_analysis (
        artwork_id, dominant_color, brightness_score, 
        saturation_score, warmth_score, analysis_method
    ) VALUES (
        p_artwork_id,
        color_analysis->>'dominant_color',
        (color_analysis->>'brightness_score')::FLOAT,
        (color_analysis->>'saturation_score')::FLOAT,
        (color_analysis->>'warmth_score')::FLOAT,
        'automated'
    )
    ON CONFLICT (artwork_id) DO UPDATE SET
        dominant_color = EXCLUDED.dominant_color,
        brightness_score = EXCLUDED.brightness_score,
        saturation_score = EXCLUDED.saturation_score,
        warmth_score = EXCLUDED.warmth_score,
        analyzed_at = NOW();
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 함수: 이미지 사용 기록
CREATE OR REPLACE FUNCTION log_image_usage(
    p_artwork_id UUID,
    p_usage_type VARCHAR(50),
    p_user_id UUID DEFAULT NULL,
    p_session_id VARCHAR(100) DEFAULT NULL,
    p_context JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO image_usage_log (
        artwork_id, usage_type, user_id, session_id, 
        usage_context, view_count, created_at
    ) VALUES (
        p_artwork_id, p_usage_type, p_user_id, p_session_id,
        p_context, 1, NOW()
    )
    ON CONFLICT (artwork_id, usage_type, COALESCE(user_id, '00000000-0000-0000-0000-000000000000'::UUID), created_at::date)
    DO UPDATE SET
        view_count = image_usage_log.view_count + 1,
        updated_at = NOW()
    RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- 함수: 아트웍 추천 캐시 갱신
CREATE OR REPLACE FUNCTION refresh_artwork_recommendations()
RETURNS INTEGER AS $$
DECLARE
    personality_type VARCHAR(4);
    recommended_ids UUID[];
    cache_count INTEGER := 0;
BEGIN
    -- 성격 유형별 추천 캐시 갱신
    FOR personality_type IN SELECT DISTINCT unnest(personality_tags) FROM artvee_artworks
    LOOP
        SELECT array_agg(artwork_id) INTO recommended_ids
        FROM get_personality_artworks(personality_type, 20);
        
        INSERT INTO artwork_recommendations (
            context_type, context_value, recommended_artworks,
            cache_key, cache_expires_at
        ) VALUES (
            'personality', personality_type, recommended_ids,
            'personality:' || personality_type,
            NOW() + INTERVAL '6 hours'
        )
        ON CONFLICT (cache_key) DO UPDATE SET
            recommended_artworks = EXCLUDED.recommended_artworks,
            cache_expires_at = EXCLUDED.cache_expires_at,
            updated_at = NOW();
        
        cache_count := cache_count + 1;
    END LOOP;
    
    -- 만료된 캐시 정리
    DELETE FROM artwork_recommendations WHERE cache_expires_at < NOW();
    
    RETURN cache_count;
END;
$$ LANGUAGE plpgsql;

-- 트리거: 아트웍 업데이트 시 추천 캐시 무효화
CREATE OR REPLACE FUNCTION invalidate_artwork_cache()
RETURNS TRIGGER AS $$
BEGIN
    -- 관련 추천 캐시 삭제
    DELETE FROM artwork_recommendations 
    WHERE recommended_artworks @> ARRAY[NEW.id];
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_invalidate_artwork_cache
AFTER UPDATE ON artvee_artworks
FOR EACH ROW
EXECUTE FUNCTION invalidate_artwork_cache();

-- 트리거: 타임스탬프 자동 업데이트
CREATE TRIGGER update_artvee_artworks_updated_at
BEFORE UPDATE ON artvee_artworks
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_image_usage_log_updated_at
BEFORE UPDATE ON image_usage_log
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artwork_recommendations_updated_at
BEFORE UPDATE ON artwork_recommendations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();