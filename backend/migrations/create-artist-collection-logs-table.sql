-- 아티스트 수집 로그 테이블 생성
CREATE TABLE IF NOT EXISTS artist_collection_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- 배치 정보
    batch_id VARCHAR(255),
    method VARCHAR(50) NOT NULL, -- 'enhanced', 'python', 'hybrid'
    
    -- 수집 통계
    artist_count INTEGER NOT NULL DEFAULT 0,
    success_count INTEGER NOT NULL DEFAULT 0,
    fail_count INTEGER NOT NULL DEFAULT 0,
    
    -- 처리 시간
    duration_seconds INTEGER,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- 상세 결과
    results JSONB DEFAULT '{}',
    
    -- 오류 정보
    error_message TEXT,
    error_details JSONB,
    
    -- 설정 정보
    batch_size INTEGER,
    delay_ms INTEGER,
    force_update BOOLEAN DEFAULT FALSE,
    
    -- 품질 지표
    avg_data_quality FLOAT,
    
    -- 메타데이터
    user_id UUID REFERENCES users(id),
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_artist_collection_logs_method ON artist_collection_logs(method);
CREATE INDEX IF NOT EXISTS idx_artist_collection_logs_created_at ON artist_collection_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_artist_collection_logs_user_id ON artist_collection_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_artist_collection_logs_batch_id ON artist_collection_logs(batch_id);
CREATE INDEX IF NOT EXISTS idx_artist_collection_logs_success_rate ON artist_collection_logs((success_count::float / NULLIF(artist_count, 0)));

-- 아티스트 데이터 품질 점수 테이블
CREATE TABLE IF NOT EXISTS artist_data_quality (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    
    -- 품질 점수 (0-100)
    overall_score INTEGER NOT NULL DEFAULT 0,
    completeness_score INTEGER NOT NULL DEFAULT 0,
    accuracy_score INTEGER NOT NULL DEFAULT 0,
    freshness_score INTEGER NOT NULL DEFAULT 0,
    source_diversity_score INTEGER NOT NULL DEFAULT 0,
    
    -- 세부 점수
    has_biography BOOLEAN DEFAULT FALSE,
    has_birth_year BOOLEAN DEFAULT FALSE,
    has_death_year BOOLEAN DEFAULT FALSE,
    has_nationality BOOLEAN DEFAULT FALSE,
    has_images BOOLEAN DEFAULT FALSE,
    has_multiple_sources BOOLEAN DEFAULT FALSE,
    
    -- 품질 이슈
    quality_issues TEXT[],
    improvement_suggestions TEXT[],
    
    -- 평가 메타데이터
    evaluated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    evaluation_method VARCHAR(50) DEFAULT 'automatic', -- 'automatic', 'manual', 'hybrid'
    evaluator_id UUID REFERENCES users(id),
    
    -- 자동 업데이트 트리거용
    last_artist_update TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(artist_id)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_artist_data_quality_overall_score ON artist_data_quality(overall_score DESC);
CREATE INDEX IF NOT EXISTS idx_artist_data_quality_evaluated_at ON artist_data_quality(evaluated_at DESC);
CREATE INDEX IF NOT EXISTS idx_artist_data_quality_artist_id ON artist_data_quality(artist_id);

-- 아티스트 소스 추적 테이블
CREATE TABLE IF NOT EXISTS artist_source_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    
    -- 소스 정보
    source_type VARCHAR(50) NOT NULL, -- 'wikipedia', 'wikidata', 'museum_api', 'manual'
    source_url TEXT,
    source_api_version VARCHAR(50),
    
    -- 수집된 데이터
    collected_fields TEXT[], -- ['name', 'biography', 'birth_year', ...]
    data_snapshot JSONB,
    
    -- 신뢰도 및 품질
    confidence_score FLOAT DEFAULT 0.5, -- 0.0 to 1.0
    data_quality_score INTEGER DEFAULT 0, -- 0-100
    
    -- 수집 메타데이터
    collection_method VARCHAR(50), -- 'enhanced', 'python', 'hybrid'
    collection_batch_id VARCHAR(255),
    
    -- 검증 정보
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMPTZ,
    
    -- 상태
    is_active BOOLEAN DEFAULT TRUE,
    is_primary_source BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_artist_source_tracking_artist_id ON artist_source_tracking(artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_source_tracking_source_type ON artist_source_tracking(source_type);
CREATE INDEX IF NOT EXISTS idx_artist_source_tracking_confidence ON artist_source_tracking(confidence_score DESC);
CREATE INDEX IF NOT EXISTS idx_artist_source_tracking_active ON artist_source_tracking(is_active);

-- 아티스트 수집 대기열 테이블
CREATE TABLE IF NOT EXISTS artist_collection_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- 대기열 정보
    artist_name VARCHAR(255) NOT NULL,
    normalized_name VARCHAR(255), -- 정규화된 이름 (검색용)
    
    -- 우선순위 및 상태
    priority INTEGER DEFAULT 5, -- 1 (highest) to 10 (lowest)
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed', 'cancelled'
    
    -- 수집 설정
    preferred_method VARCHAR(50) DEFAULT 'enhanced', -- 'enhanced', 'python', 'hybrid'
    force_update BOOLEAN DEFAULT FALSE,
    
    -- 요청 정보
    requested_by UUID REFERENCES users(id),
    request_reason VARCHAR(255), -- 'user_search', 'batch_import', 'recommendation', 'manual'
    
    -- 처리 정보
    assigned_to VARCHAR(100), -- 처리 워커 식별자
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    
    -- 결과
    result_artist_id UUID REFERENCES artists(id),
    error_message TEXT,
    
    -- 스케줄링
    scheduled_for TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP + INTERVAL '7 days',
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_artist_collection_queue_status ON artist_collection_queue(status);
CREATE INDEX IF NOT EXISTS idx_artist_collection_queue_priority ON artist_collection_queue(priority ASC, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_artist_collection_queue_scheduled ON artist_collection_queue(scheduled_for) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_artist_collection_queue_name ON artist_collection_queue(normalized_name);

-- 함수: 아티스트 데이터 품질 점수 계산
CREATE OR REPLACE FUNCTION calculate_artist_quality_score(artist_id_param UUID)
RETURNS INTEGER AS $$
DECLARE
    artist_record RECORD;
    completeness_score INTEGER := 0;
    accuracy_score INTEGER := 100; -- 기본값
    freshness_score INTEGER := 100; -- 기본값
    source_diversity_score INTEGER := 0;
    overall_score INTEGER;
    quality_issues TEXT[] := '{}';
    suggestions TEXT[] := '{}';
BEGIN
    -- 아티스트 정보 조회
    SELECT * INTO artist_record FROM artists WHERE id = artist_id_param;
    
    IF NOT FOUND THEN
        RETURN 0;
    END IF;
    
    -- 완성도 점수 계산 (60점 만점)
    IF artist_record.name IS NOT NULL THEN
        completeness_score := completeness_score + 10;
    ELSE
        quality_issues := array_append(quality_issues, 'Missing name');
    END IF;
    
    IF artist_record.bio IS NOT NULL AND length(artist_record.bio) > 100 THEN
        completeness_score := completeness_score + 20;
    ELSE
        quality_issues := array_append(quality_issues, 'Missing or short biography');
        suggestions := array_append(suggestions, 'Collect detailed biographical information');
    END IF;
    
    IF artist_record.birth_year IS NOT NULL THEN
        completeness_score := completeness_score + 10;
    ELSE
        quality_issues := array_append(quality_issues, 'Missing birth year');
    END IF;
    
    IF artist_record.nationality IS NOT NULL THEN
        completeness_score := completeness_score + 10;
    ELSE
        quality_issues := array_append(quality_issues, 'Missing nationality');
    END IF;
    
    IF artist_record.images IS NOT NULL AND artist_record.images != '{}' THEN
        completeness_score := completeness_score + 10;
    ELSE
        quality_issues := array_append(quality_issues, 'Missing images');
        suggestions := array_append(suggestions, 'Add portrait or artwork images');
    END IF;
    
    -- 신선도 점수 계산 (25점 만점)
    IF artist_record.updated_at > NOW() - INTERVAL '7 days' THEN
        freshness_score := 25;
    ELSIF artist_record.updated_at > NOW() - INTERVAL '30 days' THEN
        freshness_score := 20;
    ELSIF artist_record.updated_at > NOW() - INTERVAL '90 days' THEN
        freshness_score := 15;
    ELSE
        freshness_score := 10;
        suggestions := array_append(suggestions, 'Update stale information');
    END IF;
    
    -- 소스 다양성 점수 계산 (15점 만점)
    IF artist_record.sources IS NOT NULL THEN
        source_diversity_score := LEAST(15, jsonb_array_length(jsonb_object_keys(artist_record.sources)) * 5);
    END IF;
    
    IF source_diversity_score < 10 THEN
        suggestions := array_append(suggestions, 'Collect from multiple sources for better accuracy');
    END IF;
    
    -- 전체 점수 계산
    overall_score := completeness_score + accuracy_score + freshness_score + source_diversity_score;
    overall_score := LEAST(100, overall_score); -- 최대 100점
    
    -- 품질 점수 저장
    INSERT INTO artist_data_quality (
        artist_id, overall_score, completeness_score, accuracy_score, 
        freshness_score, source_diversity_score,
        has_biography, has_birth_year, has_nationality, has_images, has_multiple_sources,
        quality_issues, improvement_suggestions, last_artist_update
    ) VALUES (
        artist_id_param, overall_score, completeness_score, accuracy_score,
        freshness_score, source_diversity_score,
        (artist_record.bio IS NOT NULL AND length(artist_record.bio) > 100),
        (artist_record.birth_year IS NOT NULL),
        (artist_record.nationality IS NOT NULL),
        (artist_record.images IS NOT NULL AND artist_record.images != '{}'),
        (source_diversity_score > 5),
        quality_issues, suggestions, artist_record.updated_at
    )
    ON CONFLICT (artist_id) DO UPDATE SET
        overall_score = EXCLUDED.overall_score,
        completeness_score = EXCLUDED.completeness_score,
        accuracy_score = EXCLUDED.accuracy_score,
        freshness_score = EXCLUDED.freshness_score,
        source_diversity_score = EXCLUDED.source_diversity_score,
        has_biography = EXCLUDED.has_biography,
        has_birth_year = EXCLUDED.has_birth_year,
        has_nationality = EXCLUDED.has_nationality,
        has_images = EXCLUDED.has_images,
        has_multiple_sources = EXCLUDED.has_multiple_sources,
        quality_issues = EXCLUDED.quality_issues,
        improvement_suggestions = EXCLUDED.improvement_suggestions,
        last_artist_update = EXCLUDED.last_artist_update,
        updated_at = CURRENT_TIMESTAMP;
    
    RETURN overall_score;
END;
$$ LANGUAGE plpgsql;

-- 함수: 대기열에서 다음 작업 가져오기
CREATE OR REPLACE FUNCTION get_next_collection_task(worker_id VARCHAR(100))
RETURNS UUID AS $$
DECLARE
    task_id UUID;
BEGIN
    -- 우선순위가 높고 가장 오래된 대기 중인 작업 선택
    SELECT id INTO task_id
    FROM artist_collection_queue
    WHERE status = 'pending' 
      AND scheduled_for <= CURRENT_TIMESTAMP
      AND expires_at > CURRENT_TIMESTAMP
      AND attempts < max_attempts
    ORDER BY priority ASC, created_at ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED; -- 동시성 처리
    
    IF task_id IS NOT NULL THEN
        -- 작업 상태 업데이트
        UPDATE artist_collection_queue
        SET 
            status = 'processing',
            assigned_to = worker_id,
            started_at = CURRENT_TIMESTAMP,
            attempts = attempts + 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = task_id;
    END IF;
    
    RETURN task_id;
END;
$$ LANGUAGE plpgsql;

-- 트리거: 아티스트 정보 업데이트 시 품질 점수 자동 재계산
CREATE OR REPLACE FUNCTION trigger_recalculate_artist_quality()
RETURNS TRIGGER AS $$
BEGIN
    -- 비동기로 품질 점수 재계산 (성능 고려)
    PERFORM calculate_artist_quality_score(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER artist_quality_recalculation
    AFTER UPDATE ON artists
    FOR EACH ROW
    WHEN (OLD.bio IS DISTINCT FROM NEW.bio OR 
          OLD.birth_year IS DISTINCT FROM NEW.birth_year OR
          OLD.nationality IS DISTINCT FROM NEW.nationality OR
          OLD.images IS DISTINCT FROM NEW.images OR
          OLD.sources IS DISTINCT FROM NEW.sources)
    EXECUTE FUNCTION trigger_recalculate_artist_quality();

-- 업데이트 타임스탬프 트리거
CREATE TRIGGER update_artist_collection_logs_updated_at
    BEFORE UPDATE ON artist_collection_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artist_data_quality_updated_at
    BEFORE UPDATE ON artist_data_quality
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artist_source_tracking_updated_at
    BEFORE UPDATE ON artist_source_tracking
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artist_collection_queue_updated_at
    BEFORE UPDATE ON artist_collection_queue
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 초기 데이터: 인기 아티스트들을 수집 대기열에 추가
INSERT INTO artist_collection_queue (artist_name, normalized_name, priority, request_reason) VALUES
('Pablo Picasso', 'pablo picasso', 1, 'initial_setup'),
('Vincent van Gogh', 'vincent van gogh', 1, 'initial_setup'),
('Leonardo da Vinci', 'leonardo da vinci', 1, 'initial_setup'),
('Frida Kahlo', 'frida kahlo', 1, 'initial_setup'),
('Claude Monet', 'claude monet', 1, 'initial_setup'),
('Salvador Dalí', 'salvador dali', 2, 'initial_setup'),
('Andy Warhol', 'andy warhol', 2, 'initial_setup'),
('Georgia O''Keeffe', 'georgia okeefe', 2, 'initial_setup'),
('Henri Matisse', 'henri matisse', 2, 'initial_setup'),
('Jackson Pollock', 'jackson pollock', 2, 'initial_setup'),
('Yayoi Kusama', 'yayoi kusama', 3, 'initial_setup'),
('Banksy', 'banksy', 3, 'initial_setup'),
('백남준', 'baek namjune', 3, 'initial_setup'),
('이중섭', 'lee jungseop', 3, 'initial_setup'),
('박수근', 'park sugeun', 3, 'initial_setup')
ON CONFLICT DO NOTHING;

-- 뷰: 수집 대시보드
CREATE OR REPLACE VIEW artist_collection_dashboard AS
SELECT 
    -- 전체 통계
    (SELECT COUNT(*) FROM artists) as total_artists,
    (SELECT COUNT(*) FROM artist_collection_queue WHERE status = 'pending') as pending_collections,
    (SELECT COUNT(*) FROM artist_collection_queue WHERE status = 'processing') as active_collections,
    
    -- 품질 통계
    (SELECT AVG(overall_score) FROM artist_data_quality) as avg_quality_score,
    (SELECT COUNT(*) FROM artist_data_quality WHERE overall_score >= 80) as high_quality_artists,
    (SELECT COUNT(*) FROM artist_data_quality WHERE overall_score < 50) as low_quality_artists,
    
    -- 최근 활동
    (SELECT COUNT(*) FROM artists WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as artists_added_week,
    (SELECT COUNT(*) FROM artist_collection_logs WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as collections_run_week,
    
    -- 소스 다양성
    (SELECT COUNT(DISTINCT jsonb_object_keys(sources)) FROM artists WHERE sources IS NOT NULL) as unique_sources,
    
    -- 마지막 업데이트
    (SELECT MAX(created_at) FROM artists) as last_artist_added,
    (SELECT MAX(created_at) FROM artist_collection_logs) as last_collection_run;

-- 설명 추가
COMMENT ON TABLE artist_collection_logs IS '아티스트 수집 작업의 로그 및 통계를 저장';
COMMENT ON TABLE artist_data_quality IS '각 아티스트의 데이터 품질 점수와 개선 사항을 추적';
COMMENT ON TABLE artist_source_tracking IS '아티스트 정보의 출처와 수집 이력을 추적';
COMMENT ON TABLE artist_collection_queue IS '아티스트 수집 작업의 대기열을 관리';

COMMENT ON FUNCTION calculate_artist_quality_score(UUID) IS '아티스트의 데이터 품질 점수를 계산하고 개선 사항을 제안';
COMMENT ON FUNCTION get_next_collection_task(VARCHAR) IS '워커가 처리할 다음 수집 작업을 안전하게 가져옴';

COMMENT ON VIEW artist_collection_dashboard IS '아티스트 수집 시스템의 전반적인 상태를 보여주는 대시보드 뷰';