-- 글로벌 전시 데이터베이스 스키마

-- 기관 정보 테이블 (기존 institutions 테이블 확장)
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS timezone VARCHAR(50);
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS admission_info JSONB DEFAULT '{}';
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS floor_plan_url VARCHAR(500);
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS annual_visitors INTEGER;
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS established_year INTEGER;
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS data_source VARCHAR(100) DEFAULT 'manual';
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS verified_date DATE;

-- 전시 이미지 관리 테이블
CREATE TABLE IF NOT EXISTS exhibition_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exhibition_id UUID NOT NULL REFERENCES exhibitions(id) ON DELETE CASCADE,
  
  -- 이미지 정보
  image_type VARCHAR(50) NOT NULL, -- 'poster', 'installation', 'artwork', 'gallery'
  source_url TEXT,
  cdn_url TEXT,
  thumbnail_url TEXT,
  
  -- 이미지 메타데이터
  width INTEGER,
  height INTEGER,
  file_size INTEGER,
  file_format VARCHAR(10), -- 'jpg', 'png', 'webp'
  
  -- 저작권 및 라이선스
  rights_status VARCHAR(50) DEFAULT 'unknown', -- 'cc0', 'fair_use', 'licensed', 'restricted'
  credit_line TEXT,
  license_info TEXT,
  copyright_holder VARCHAR(200),
  
  -- 사용 권한
  commercial_use_allowed BOOLEAN DEFAULT FALSE,
  modification_allowed BOOLEAN DEFAULT FALSE,
  attribution_required BOOLEAN DEFAULT TRUE,
  
  -- 품질 및 상태
  quality_score FLOAT DEFAULT 0.0, -- 0.0 to 1.0
  is_primary BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 작가 정보 테이블
CREATE TABLE IF NOT EXISTS artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 기본 정보
  name_en VARCHAR(200) NOT NULL,
  name_local VARCHAR(200),
  name_aliases TEXT[], -- 다른 이름들
  
  -- 생몰년도
  birth_year INTEGER,
  death_year INTEGER,
  birth_date DATE,
  death_date DATE,
  
  -- 출신 정보
  nationality VARCHAR(100),
  birth_place VARCHAR(200),
  
  -- 작가 정보
  biography TEXT,
  art_movement VARCHAR(100), -- 'Impressionism', 'Cubism', etc.
  medium_specialization TEXT[], -- ['oil painting', 'sculpture', 'photography']
  
  -- 웹 정보
  website VARCHAR(500),
  social_media JSONB DEFAULT '{}', -- {instagram: "@artist", twitter: "@artist"}
  
  -- 메타데이터
  data_completeness FLOAT DEFAULT 0.0,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 전시-작가 연결 테이블
CREATE TABLE IF NOT EXISTS exhibition_artists (
  exhibition_id UUID NOT NULL REFERENCES exhibitions(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  artist_name VARCHAR(200), -- 스크래핑된 원본 이름 (매칭 실패 시를 위해)
  
  -- 작가 역할
  role VARCHAR(50) DEFAULT 'artist', -- 'artist', 'curator', 'collaborator', 'featured'
  is_primary BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  
  -- 참여 작품 정보
  artworks_count INTEGER,
  artwork_titles TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  PRIMARY KEY (exhibition_id, artist_id)
);

-- 전시 데이터 수집 로그
CREATE TABLE IF NOT EXISTS exhibition_collection_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 수집 정보
  collection_date DATE NOT NULL,
  collection_type VARCHAR(50) NOT NULL, -- 'manual', 'scraping', 'api'
  source_url TEXT,
  institution_id UUID REFERENCES institutions(id),
  
  -- 수집 결과
  exhibitions_found INTEGER DEFAULT 0,
  exhibitions_new INTEGER DEFAULT 0,
  exhibitions_updated INTEGER DEFAULT 0,
  exhibitions_failed INTEGER DEFAULT 0,
  
  -- 수집 상태
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
  error_message TEXT,
  
  -- 수집 설정
  collection_config JSONB DEFAULT '{}',
  
  -- 처리 시간
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 데이터 품질 평가
CREATE TABLE IF NOT EXISTS data_quality_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 평가 대상
  target_type VARCHAR(50) NOT NULL, -- 'institution', 'exhibition', 'artist'
  target_id UUID NOT NULL,
  
  -- 품질 점수
  completeness_score FLOAT DEFAULT 0.0, -- 필수 필드 완성도
  accuracy_score FLOAT DEFAULT 0.0, -- 데이터 정확성
  freshness_score FLOAT DEFAULT 0.0, -- 데이터 신선도
  consistency_score FLOAT DEFAULT 0.0, -- 일관성
  overall_score FLOAT DEFAULT 0.0,
  
  -- 상세 평가
  missing_fields TEXT[],
  validation_errors TEXT[],
  quality_notes TEXT,
  
  -- 평가 메타데이터
  evaluated_at TIMESTAMPTZ DEFAULT NOW(),
  evaluator VARCHAR(50) DEFAULT 'system', -- 'system', 'manual', 'crowdsource'
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 스크래핑 설정
CREATE TABLE IF NOT EXISTS scraping_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id),
  
  -- 스크래핑 설정
  config_name VARCHAR(200) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- URL 설정
  base_url TEXT NOT NULL,
  exhibitions_path VARCHAR(500), -- '/exhibitions', '/current-shows'
  detail_url_pattern VARCHAR(500), -- 상세 페이지 URL 패턴
  
  -- 셀렉터 설정
  selectors JSONB NOT NULL, -- CSS/XPath 셀렉터들
  
  -- 스크래핑 옵션
  scraping_options JSONB DEFAULT '{
    "delay_ms": 2000,
    "max_pages": 10,
    "timeout_ms": 30000,
    "user_agent": "SAYU-Bot/1.0"
  }',
  
  -- 일정 설정
  schedule_enabled BOOLEAN DEFAULT FALSE,
  schedule_cron VARCHAR(100), -- '0 2 * * *' (매일 새벽 2시)
  
  -- 상태 정보
  last_run_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ,
  success_rate FLOAT DEFAULT 0.0, -- 최근 성공률
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 지역별 데이터 커버리지
CREATE TABLE IF NOT EXISTS regional_coverage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 지역 정보
  region_type VARCHAR(50) NOT NULL, -- 'country', 'city', 'district'
  region_name VARCHAR(200) NOT NULL,
  country_code CHAR(2),
  
  -- 커버리지 통계
  total_institutions INTEGER DEFAULT 0,
  tracked_institutions INTEGER DEFAULT 0,
  total_exhibitions INTEGER DEFAULT 0,
  active_exhibitions INTEGER DEFAULT 0,
  
  -- 품질 지표
  avg_data_quality FLOAT DEFAULT 0.0,
  coverage_percentage FLOAT DEFAULT 0.0,
  
  -- 업데이트 주기
  last_updated TIMESTAMPTZ,
  update_frequency_days INTEGER DEFAULT 7,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(region_type, region_name)
);

-- 외부 API 통합
CREATE TABLE IF NOT EXISTS external_api_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- API 정보
  api_name VARCHAR(100) NOT NULL, -- 'google_places', 'foursquare', 'eventbrite'
  api_type VARCHAR(50) NOT NULL, -- 'museums', 'events', 'reviews'
  
  -- 인증 정보
  api_key_encrypted TEXT,
  api_secret_encrypted TEXT,
  access_token_encrypted TEXT,
  
  -- API 설정
  base_url TEXT NOT NULL,
  rate_limit_per_minute INTEGER DEFAULT 60,
  endpoints JSONB DEFAULT '{}',
  
  -- 사용 통계
  requests_made INTEGER DEFAULT 0,
  successful_requests INTEGER DEFAULT 0,
  last_request_at TIMESTAMPTZ,
  quota_reset_at TIMESTAMPTZ,
  
  -- 상태
  is_active BOOLEAN DEFAULT TRUE,
  health_status VARCHAR(50) DEFAULT 'unknown', -- 'healthy', 'degraded', 'down'
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(api_name)
);

-- 인덱스 생성
CREATE INDEX idx_exhibition_images_exhibition_id ON exhibition_images(exhibition_id);
CREATE INDEX idx_exhibition_images_type ON exhibition_images(image_type);
CREATE INDEX idx_exhibition_images_primary ON exhibition_images(is_primary) WHERE is_primary = true;
CREATE INDEX idx_exhibition_images_active ON exhibition_images(is_active);

CREATE INDEX idx_artists_name_en ON artists(name_en);
CREATE INDEX idx_artists_nationality ON artists(nationality);
CREATE INDEX idx_artists_movement ON artists(art_movement);
CREATE INDEX idx_artists_birth_year ON artists(birth_year);

CREATE INDEX idx_exhibition_artists_exhibition_id ON exhibition_artists(exhibition_id);
CREATE INDEX idx_exhibition_artists_artist_id ON exhibition_artists(artist_id);
CREATE INDEX idx_exhibition_artists_role ON exhibition_artists(role);
CREATE INDEX idx_exhibition_artists_primary ON exhibition_artists(is_primary);

CREATE INDEX idx_collection_logs_date ON exhibition_collection_logs(collection_date DESC);
CREATE INDEX idx_collection_logs_institution ON exhibition_collection_logs(institution_id);
CREATE INDEX idx_collection_logs_status ON exhibition_collection_logs(status);

CREATE INDEX idx_data_quality_target ON data_quality_scores(target_type, target_id);
CREATE INDEX idx_data_quality_overall ON data_quality_scores(overall_score DESC);
CREATE INDEX idx_data_quality_evaluated ON data_quality_scores(evaluated_at DESC);

CREATE INDEX idx_scraping_configs_institution ON scraping_configurations(institution_id);
CREATE INDEX idx_scraping_configs_active ON scraping_configurations(is_active);
CREATE INDEX idx_scraping_configs_schedule ON scraping_configurations(schedule_enabled);

CREATE INDEX idx_regional_coverage_region ON regional_coverage(region_type, region_name);
CREATE INDEX idx_regional_coverage_country ON regional_coverage(country_code);

-- 공간 인덱스 (PostGIS 확장 필요)
-- CREATE INDEX idx_institutions_location ON institutions USING GIST(coordinates);

-- 뷰: 기관별 전시 통계
CREATE OR REPLACE VIEW institution_exhibition_stats AS
SELECT 
    i.id,
    i.name_en,
    i.city,
    i.country,
    COUNT(DISTINCT e.id) as total_exhibitions,
    COUNT(DISTINCT CASE WHEN e.status = 'ongoing' THEN e.id END) as ongoing_exhibitions,
    COUNT(DISTINCT CASE WHEN e.status = 'upcoming' THEN e.id END) as upcoming_exhibitions,
    AVG(dqs.overall_score) as avg_data_quality,
    MAX(e.created_at) as last_exhibition_added,
    COUNT(DISTINCT sc.id) as scraping_configs
FROM institutions i
LEFT JOIN exhibitions e ON i.id = e.institution_id
LEFT JOIN data_quality_scores dqs ON i.id = dqs.target_id AND dqs.target_type = 'institution'
LEFT JOIN scraping_configurations sc ON i.id = sc.institution_id AND sc.is_active = true
GROUP BY i.id, i.name_en, i.city, i.country;

-- 뷰: 작가별 전시 참여 통계
CREATE OR REPLACE VIEW artist_exhibition_stats AS
SELECT 
    a.id,
    a.name_en,
    a.nationality,
    a.art_movement,
    COUNT(DISTINCT ea.exhibition_id) as total_exhibitions,
    COUNT(DISTINCT CASE WHEN ea.is_primary THEN ea.exhibition_id END) as primary_exhibitions,
    COUNT(DISTINCT CASE WHEN e.status = 'ongoing' THEN ea.exhibition_id END) as current_exhibitions,
    AVG(dqs.overall_score) as avg_data_quality,
    MIN(e.start_date) as first_exhibition_date,
    MAX(e.start_date) as latest_exhibition_date
FROM artists a
LEFT JOIN exhibition_artists ea ON a.id = ea.artist_id
LEFT JOIN exhibitions e ON ea.exhibition_id = e.id
LEFT JOIN data_quality_scores dqs ON a.id = dqs.target_id AND dqs.target_type = 'artist'
GROUP BY a.id, a.name_en, a.nationality, a.art_movement;

-- 뷰: 지역별 전시 현황
CREATE OR REPLACE VIEW regional_exhibition_overview AS
SELECT 
    i.country,
    i.city,
    COUNT(DISTINCT i.id) as total_institutions,
    COUNT(DISTINCT e.id) as total_exhibitions,
    COUNT(DISTINCT CASE WHEN e.status = 'ongoing' THEN e.id END) as ongoing_exhibitions,
    COUNT(DISTINCT CASE WHEN e.start_date > CURRENT_DATE THEN e.id END) as upcoming_exhibitions,
    AVG(dqs.overall_score) as avg_exhibition_quality,
    COUNT(DISTINCT CASE WHEN ei.id IS NOT NULL THEN e.id END) as exhibitions_with_images
FROM institutions i
LEFT JOIN exhibitions e ON i.id = e.institution_id AND e.end_date >= CURRENT_DATE - INTERVAL '6 months'
LEFT JOIN data_quality_scores dqs ON e.id = dqs.target_id AND dqs.target_type = 'exhibition'
LEFT JOIN exhibition_images ei ON e.id = ei.exhibition_id AND ei.is_primary = true
GROUP BY i.country, i.city
ORDER BY ongoing_exhibitions DESC;

-- 함수: 데이터 품질 점수 계산
CREATE OR REPLACE FUNCTION calculate_data_quality(
    target_type_param VARCHAR(50),
    target_id_param UUID
) RETURNS FLOAT AS $$
DECLARE
    completeness_score FLOAT := 0.0;
    accuracy_score FLOAT := 1.0; -- 기본값을 1.0으로 설정
    freshness_score FLOAT := 1.0;
    overall_score FLOAT;
    target_record RECORD;
BEGIN
    IF target_type_param = 'institution' THEN
        SELECT * INTO target_record FROM institutions WHERE id = target_id_param;
        
        -- 완성도 점수 계산
        IF target_record.name_en IS NOT NULL THEN completeness_score := completeness_score + 20; END IF;
        IF target_record.city IS NOT NULL THEN completeness_score := completeness_score + 15; END IF;
        IF target_record.country IS NOT NULL THEN completeness_score := completeness_score + 15; END IF;
        IF target_record.address IS NOT NULL THEN completeness_score := completeness_score + 10; END IF;
        IF target_record.website IS NOT NULL THEN completeness_score := completeness_score + 10; END IF;
        IF target_record.coordinates IS NOT NULL THEN completeness_score := completeness_score + 10; END IF;
        IF target_record.opening_hours IS NOT NULL THEN completeness_score := completeness_score + 10; END IF;
        IF target_record.phone IS NOT NULL THEN completeness_score := completeness_score + 5; END IF;
        IF target_record.email IS NOT NULL THEN completeness_score := completeness_score + 5; END IF;
        
        -- 신선도 점수 (데이터 업데이트로부터 경과 시간)
        IF target_record.updated_at > NOW() - INTERVAL '30 days' THEN
            freshness_score := 1.0;
        ELSIF target_record.updated_at > NOW() - INTERVAL '90 days' THEN
            freshness_score := 0.7;
        ELSE
            freshness_score := 0.4;
        END IF;
        
    ELSIF target_type_param = 'exhibition' THEN
        SELECT * INTO target_record FROM exhibitions WHERE id = target_id_param;
        
        -- 완성도 점수 계산
        IF target_record.title_en IS NOT NULL THEN completeness_score := completeness_score + 25; END IF;
        IF target_record.start_date IS NOT NULL THEN completeness_score := completeness_score + 20; END IF;
        IF target_record.end_date IS NOT NULL THEN completeness_score := completeness_score + 20; END IF;
        IF target_record.description IS NOT NULL THEN completeness_score := completeness_score + 15; END IF;
        IF target_record.official_url IS NOT NULL THEN completeness_score := completeness_score + 10; END IF;
        IF target_record.genres IS NOT NULL AND array_length(target_record.genres, 1) > 0 THEN 
            completeness_score := completeness_score + 10; 
        END IF;
        
        -- 신선도 점수
        IF target_record.updated_at > NOW() - INTERVAL '7 days' THEN
            freshness_score := 1.0;
        ELSIF target_record.updated_at > NOW() - INTERVAL '30 days' THEN
            freshness_score := 0.8;
        ELSE
            freshness_score := 0.5;
        END IF;
    END IF;
    
    -- 전체 점수 계산 (가중 평균)
    overall_score := (completeness_score * 0.5) + (accuracy_score * 0.3) + (freshness_score * 0.2);
    
    -- 데이터 품질 점수 저장
    INSERT INTO data_quality_scores (
        target_type, target_id, completeness_score, accuracy_score, 
        freshness_score, overall_score
    ) VALUES (
        target_type_param, target_id_param, completeness_score/100.0, 
        accuracy_score, freshness_score, overall_score/100.0
    )
    ON CONFLICT (target_type, target_id, evaluated_at::date) 
    DO UPDATE SET
        completeness_score = EXCLUDED.completeness_score,
        accuracy_score = EXCLUDED.accuracy_score,
        freshness_score = EXCLUDED.freshness_score,
        overall_score = EXCLUDED.overall_score,
        evaluated_at = NOW();
    
    RETURN overall_score / 100.0;
END;
$$ LANGUAGE plpgsql;

-- 함수: 스크래핑 스케줄 실행
CREATE OR REPLACE FUNCTION execute_scheduled_scraping()
RETURNS INTEGER AS $$
DECLARE
    config_record RECORD;
    jobs_executed INTEGER := 0;
BEGIN
    FOR config_record IN 
        SELECT * FROM scraping_configurations 
        WHERE is_active = true 
          AND schedule_enabled = true
          AND (last_run_at IS NULL OR last_run_at < NOW() - INTERVAL '23 hours')
    LOOP
        -- 스크래핑 작업 실행 로그
        INSERT INTO exhibition_collection_logs (
            collection_type, source_url, institution_id, status, 
            collection_config, started_at
        ) VALUES (
            'scraping', config_record.base_url, config_record.institution_id,
            'pending', row_to_json(config_record)::jsonb, NOW()
        );
        
        -- 실제 스크래핑 작업은 백그라운드 프로세스에서 처리
        
        -- 마지막 실행 시간 업데이트
        UPDATE scraping_configurations
        SET last_run_at = NOW()
        WHERE id = config_record.id;
        
        jobs_executed := jobs_executed + 1;
    END LOOP;
    
    RETURN jobs_executed;
END;
$$ LANGUAGE plpgsql;

-- 트리거: 타임스탬프 자동 업데이트
CREATE TRIGGER update_exhibition_images_updated_at
BEFORE UPDATE ON exhibition_images
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artists_updated_at
BEFORE UPDATE ON artists
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scraping_configurations_updated_at
BEFORE UPDATE ON scraping_configurations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_regional_coverage_updated_at
BEFORE UPDATE ON regional_coverage
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_external_api_configs_updated_at
BEFORE UPDATE ON external_api_configs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();