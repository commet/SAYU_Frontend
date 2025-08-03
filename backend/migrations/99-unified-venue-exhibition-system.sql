-- =============================================================================
-- SAYU Unified Venue & Exhibition System
-- 모든 venue/exhibition 테이블을 하나의 simple하고 통합된 구조로 정리
-- =============================================================================

-- 1. 백업 테이블 생성 (안전장치)
CREATE TABLE IF NOT EXISTS venues_backup AS SELECT * FROM venues WHERE 1=1;
CREATE TABLE IF NOT EXISTS exhibitions_backup AS SELECT * FROM exhibitions WHERE 1=1;
CREATE TABLE IF NOT EXISTS global_venues_backup AS SELECT * FROM global_venues WHERE 1=1;
CREATE TABLE IF NOT EXISTS global_exhibitions_backup AS SELECT * FROM global_exhibitions WHERE 1=1;

-- 2. 새로운 통합 venues 테이블 생성
CREATE TABLE IF NOT EXISTS venues_unified (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Info (한국어/영어/현지어 통합)
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    name_ko VARCHAR(255),
    name_local VARCHAR(255),
    
    -- Type & Category
    type VARCHAR(50) NOT NULL DEFAULT 'gallery', -- museum, gallery, alternative_space, art_center, fair_venue
    category VARCHAR(50) DEFAULT 'commercial', -- commercial, non_profit, public, private
    tier INTEGER DEFAULT 2, -- 1: Major, 2: Important, 3: Small
    
    -- Location (통합)
    address TEXT NOT NULL,
    address_en TEXT,
    address_ko TEXT,
    district VARCHAR(100),
    city VARCHAR(100) NOT NULL,
    city_en VARCHAR(100),
    city_ko VARCHAR(100),
    region VARCHAR(100),
    country VARCHAR(2) NOT NULL DEFAULT 'KR',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Contact
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(500),
    
    -- Social Media (통합 JSONB)
    social_media JSONB DEFAULT '{}', -- {"instagram": "@handle", "facebook": "page", "twitter": "@handle"}
    
    -- Operating Info
    operating_hours JSONB DEFAULT '{}',
    closed_days JSONB DEFAULT '[]',
    admission_info TEXT,
    features JSONB DEFAULT '[]', -- ["parking", "cafe", "gift_shop", "wheelchair_accessible", "audio_guide"]
    
    -- Images
    logo_image VARCHAR(500),
    cover_image VARCHAR(500),
    images JSONB DEFAULT '[]',
    
    -- Description
    description TEXT,
    description_en TEXT,
    description_ko TEXT,
    
    -- External IDs
    google_place_id VARCHAR(255),
    data_source VARCHAR(50) DEFAULT 'manual',
    
    -- Status & Stats
    is_active BOOLEAN DEFAULT true,
    is_premium BOOLEAN DEFAULT false,
    exhibition_count INTEGER DEFAULT 0,
    follower_count INTEGER DEFAULT 0,
    rating DECIMAL(3, 2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    data_quality_score INTEGER DEFAULT 50,
    
    -- Crawling Info
    crawl_url VARCHAR(500),
    crawl_selector JSONB DEFAULT '{}',
    last_crawled_at TIMESTAMP,
    crawl_frequency VARCHAR(20) DEFAULT 'weekly', -- daily, twice_weekly, weekly, manual
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50) DEFAULT 'system'
);

-- 3. 새로운 통합 exhibitions 테이블 생성
CREATE TABLE IF NOT EXISTS exhibitions_unified (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Info (다국어 지원)
    title VARCHAR(500) NOT NULL,
    title_en VARCHAR(500),
    title_ko VARCHAR(500),
    subtitle TEXT,
    description TEXT,
    description_en TEXT,
    description_ko TEXT,
    
    -- Venue Reference (Foreign Key)
    venue_id UUID NOT NULL REFERENCES venues_unified(id) ON DELETE CASCADE,
    venue_name VARCHAR(255) NOT NULL, -- 데이터 중복이지만 성능을 위해 유지
    venue_city VARCHAR(100) NOT NULL,
    venue_country VARCHAR(2) NOT NULL DEFAULT 'KR',
    
    -- Dates
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    opening_date TIMESTAMP,
    opening_time VARCHAR(50),
    
    -- Artists & Curator
    artists JSONB DEFAULT '[]', -- [{"name": "Artist", "name_en": "Artist EN", "id": "uuid"}]
    curator VARCHAR(255),
    curator_en VARCHAR(255),
    
    -- Exhibition Details
    type VARCHAR(50) DEFAULT 'group', -- solo, group, collection, special, fair
    art_medium VARCHAR(100),
    themes TEXT[],
    
    -- Images & Media
    poster_image VARCHAR(500),
    images JSONB DEFAULT '[]',
    gallery_images JSONB DEFAULT '[]',
    promotional_video_url VARCHAR(500),
    virtual_tour_url VARCHAR(500),
    
    -- Links
    official_url VARCHAR(500),
    ticket_url VARCHAR(500),
    booking_url VARCHAR(500),
    catalog_url VARCHAR(500),
    press_kit_url VARCHAR(500),
    
    -- Pricing & Booking
    admission_fee INTEGER DEFAULT 0, -- 0 means free
    admission_note VARCHAR(255),
    ticket_price JSONB, -- {"adult": 15000, "student": 10000, "child": 5000}
    ticket_required BOOLEAN DEFAULT false,
    booking_required BOOLEAN DEFAULT false,
    
    -- Source & Verification
    source VARCHAR(50) DEFAULT 'manual', -- manual, naver, scraping, user_submission, api, instagram
    source_url VARCHAR(500),
    data_source VARCHAR(50) DEFAULT 'manual',
    data_quality_score INTEGER DEFAULT 50,
    external_exhibition_id VARCHAR(255),
    
    -- User Submission
    submitted_by UUID, -- REFERENCES users(id) - 옵셔널
    verification_status VARCHAR(20) DEFAULT 'pending', -- pending, verified, rejected
    verified_by UUID, -- REFERENCES users(id) - 옵셔널
    verified_at TIMESTAMP,
    
    -- Status & Metadata
    status VARCHAR(20) DEFAULT 'upcoming', -- draft, upcoming, ongoing, ended, cancelled
    visibility VARCHAR(20) DEFAULT 'public', -- public, private, draft
    featured BOOLEAN DEFAULT false,
    tags JSONB DEFAULT '[]',
    
    -- Analytics
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    
    -- AI & Personalization
    personality_matches TEXT[] DEFAULT '{}',
    emotion_signatures JSONB,
    ai_generated_description TEXT,
    recommendation_score INTEGER DEFAULT 50,
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. 데이터 마이그레이션 (기존 venues 테이블에서)
INSERT INTO venues_unified (
    id, name, name_en, type, tier, address, district, city, region, country,
    latitude, longitude, phone, email, website, 
    operating_hours, closed_days, features, logo_image, cover_image, images,
    description, description_en, is_active, is_premium, exhibition_count,
    follower_count, rating, crawl_url, crawl_selector, last_crawled_at,
    crawl_frequency, created_at, updated_at
)
SELECT 
    id, name, name_en, type::text, 
    CASE 
        WHEN tier = '1' THEN 1
        WHEN tier = '2' THEN 2
        WHEN tier = '3' THEN 3
        ELSE 2
    END,
    address, NULL as district, city, region, country,
    latitude, longitude, phone, email, website,
    operating_hours, closed_days, features, logo_image, cover_image, images,
    description, description_en, is_active, is_premium, exhibition_count,
    follower_count, average_rating, crawl_url, crawl_selector, last_crawled_at,
    crawl_frequency::text, created_at, updated_at
FROM venues
WHERE NOT EXISTS (SELECT 1 FROM venues_unified WHERE venues_unified.id = venues.id);

-- 5. 기존 exhibitions 테이블에서 데이터 마이그레이션
INSERT INTO exhibitions_unified (
    id, title, title_en, description, venue_id, venue_name, venue_city, venue_country,
    start_date, end_date, opening_date, opening_time, artists, type, poster_image,
    images, official_url, ticket_url, admission_fee, admission_note, source,
    source_url, submitted_by, verification_status, verified_by, verified_at,
    tags, view_count, like_count, status, featured, created_at, updated_at
)
SELECT 
    id, title, title_en, description, venue_id, venue_name, venue_city, venue_country,
    start_date, end_date, opening_date, opening_time, artists, type::text, poster_image,
    images, official_url, ticket_url, admission_fee, admission_note, source::text,
    source_url, submitted_by, verification_status::text, verified_by, verified_at,
    tags, view_count, like_count, status::text, featured, created_at, updated_at
FROM exhibitions
WHERE NOT EXISTS (SELECT 1 FROM exhibitions_unified WHERE exhibitions_unified.id = exhibitions.id);

-- 6. global_venues에서 추가 데이터 마이그레이션 (중복 방지)
INSERT INTO venues_unified (
    name, name_en, name_ko, name_local, type, category, tier, address, address_en, address_ko,
    district, city, city_en, city_ko, region, country, latitude, longitude,
    phone, email, website, social_media, operating_hours, admission_info, features,
    description, description_en, description_ko, google_place_id, data_source,
    is_active, rating, review_count, data_quality_score, created_at, updated_at, created_by
)
SELECT 
    name, name_en, name_ko, name_local, 
    COALESCE(venue_type, 'gallery'), 
    COALESCE(venue_category, 'commercial'), 
    COALESCE(tier, 2),
    address, address_en, address_ko, district, city, city_en, city_ko, province, country,
    latitude, longitude, phone, email, website, social_media, opening_hours,
    admission_info, features, description, description_en, description_ko,
    google_place_id, COALESCE(data_source, 'manual'), 
    COALESCE(is_active, true), rating, review_count, COALESCE(data_quality_score, 50),
    COALESCE(created_at, NOW()), COALESCE(updated_at, NOW()), COALESCE(created_by, 'system')
FROM global_venues
WHERE NOT EXISTS (
    SELECT 1 FROM venues_unified 
    WHERE venues_unified.name = global_venues.name 
    AND venues_unified.city = global_venues.city
);

-- 7. global_exhibitions에서 추가 데이터 마이그레이션
INSERT INTO exhibitions_unified (
    title, title_ko, title_en, subtitle, description, description_ko, description_en,
    venue_id, venue_name, venue_city, venue_country, start_date, end_date, opening_date,
    artists, curator, curator_en, type, art_medium, themes, poster_image, images,
    gallery_images, promotional_video_url, virtual_tour_url, official_url, ticket_url,
    booking_url, catalog_url, press_kit_url, admission_fee, ticket_price, ticket_required,
    booking_required, source, data_source, data_quality_score, external_exhibition_id,
    personality_matches, emotion_signatures, ai_generated_description, recommendation_score,
    status, visibility, created_at, updated_at
)
SELECT 
    title, title_local, title, subtitle, description, description_local, description,
    -- venue_id를 매칭해야 함 (global_exhibitions의 venue_id는 integer이므로 이름으로 매칭)
    (SELECT id FROM venues_unified WHERE name = 
        CASE 
            WHEN ge.venue_id IS NOT NULL THEN (SELECT name FROM global_venues WHERE id = ge.venue_id::uuid)
            ELSE 'Unknown Venue'
        END
     LIMIT 1),
    'Unknown Venue', -- venue_name은 나중에 업데이트
    'Seoul', 'KR', -- 기본값
    start_date, end_date, opening_reception, artists, curator, curator_local,
    COALESCE(exhibition_type, 'group'), art_medium, themes, poster_image_url, gallery_images,
    gallery_images, promotional_video_url, virtual_tour_url, official_url, ticket_url,
    booking_url, catalog_url, press_kit_url, 0, ticket_price, ticket_required,
    booking_required, COALESCE(data_source, 'manual'), COALESCE(data_source, 'manual'),
    COALESCE(data_quality_score, 50), external_exhibition_id, personality_matches,
    emotion_signatures, ai_generated_description, COALESCE(recommendation_score, 50),
    COALESCE(status, 'upcoming'), COALESCE(visibility, 'public'),
    COALESCE(created_at, NOW()), COALESCE(updated_at, NOW())
FROM global_exhibitions ge
WHERE NOT EXISTS (
    SELECT 1 FROM exhibitions_unified 
    WHERE exhibitions_unified.title = ge.title 
    AND exhibitions_unified.start_date = ge.start_date
);

-- 8. venue_name 필드 업데이트 (FK를 통해)
UPDATE exhibitions_unified e
SET venue_name = v.name, venue_city = v.city, venue_country = v.country
FROM venues_unified v
WHERE e.venue_id = v.id AND (e.venue_name = 'Unknown Venue' OR e.venue_name IS NULL);

-- 9. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_venues_unified_city_country ON venues_unified(city, country);
CREATE INDEX IF NOT EXISTS idx_venues_unified_type ON venues_unified(type);
CREATE INDEX IF NOT EXISTS idx_venues_unified_tier ON venues_unified(tier);
CREATE INDEX IF NOT EXISTS idx_venues_unified_is_active ON venues_unified(is_active);
CREATE INDEX IF NOT EXISTS idx_venues_unified_name ON venues_unified(name);
CREATE INDEX IF NOT EXISTS idx_venues_unified_google_place_id ON venues_unified(google_place_id);

CREATE INDEX IF NOT EXISTS idx_exhibitions_unified_venue_id ON exhibitions_unified(venue_id);
CREATE INDEX IF NOT EXISTS idx_exhibitions_unified_start_date ON exhibitions_unified(start_date);
CREATE INDEX IF NOT EXISTS idx_exhibitions_unified_end_date ON exhibitions_unified(end_date);
CREATE INDEX IF NOT EXISTS idx_exhibitions_unified_status ON exhibitions_unified(status);
CREATE INDEX IF NOT EXISTS idx_exhibitions_unified_verification ON exhibitions_unified(verification_status);
CREATE INDEX IF NOT EXISTS idx_exhibitions_unified_venue_city_country ON exhibitions_unified(venue_city, venue_country);
CREATE INDEX IF NOT EXISTS idx_exhibitions_unified_featured ON exhibitions_unified(featured);

-- 10. 트리거 생성 (updated_at 자동 업데이트)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_venues_unified_updated_at 
    BEFORE UPDATE ON venues_unified 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exhibitions_unified_updated_at 
    BEFORE UPDATE ON exhibitions_unified 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 11. 뷰 생성 (기존 API 호환성 유지)
CREATE OR REPLACE VIEW venues AS 
SELECT 
    id, name, name_en as name_en, type::venue_type, 
    tier::venue_tier, address, district as address_detail, 
    city, region, country, latitude, longitude, phone, email, website,
    social_media->>'instagram' as instagram, social_media->>'facebook' as facebook,
    operating_hours, closed_days, features, logo_image, cover_image, images,
    description, description_en, crawl_url, crawl_selector, last_crawled_at,
    crawl_frequency::crawl_frequency, is_active, is_premium,
    exhibition_count, follower_count, rating as average_rating, created_at, updated_at
FROM venues_unified;

CREATE OR REPLACE VIEW exhibitions AS
SELECT 
    id, title, title_en, description, venue_id, venue_name, venue_city, venue_country,
    start_date, end_date, opening_date, opening_time, artists, type::exhibition_type,
    poster_image, images, official_url, ticket_url, admission_fee, admission_note,
    source::exhibition_source, source_url, submitted_by, 
    verification_status::verification_status, verified_by, verified_at,
    tags, view_count, like_count, status::exhibition_status, featured, created_at, updated_at
FROM exhibitions_unified;

-- 12. 통계 업데이트
UPDATE venues_unified SET exhibition_count = (
    SELECT COUNT(*) FROM exhibitions_unified 
    WHERE venue_id = venues_unified.id
);

-- 13. 데이터 정합성 검증
DO $$
DECLARE
    venues_count INTEGER;
    exhibitions_count INTEGER;
    orphaned_exhibitions INTEGER;
BEGIN
    SELECT COUNT(*) INTO venues_count FROM venues_unified;
    SELECT COUNT(*) INTO exhibitions_count FROM exhibitions_unified;
    SELECT COUNT(*) INTO orphaned_exhibitions 
    FROM exhibitions_unified e 
    WHERE NOT EXISTS (SELECT 1 FROM venues_unified v WHERE v.id = e.venue_id);
    
    RAISE NOTICE '=== MIGRATION COMPLETE ===';
    RAISE NOTICE 'Total venues: %', venues_count;
    RAISE NOTICE 'Total exhibitions: %', exhibitions_count;
    RAISE NOTICE 'Orphaned exhibitions: %', orphaned_exhibitions;
    
    IF orphaned_exhibitions > 0 THEN
        RAISE WARNING 'Found % orphaned exhibitions without valid venue_id', orphaned_exhibitions;
    END IF;
END $$;

-- 14. 권한 설정 (필요시)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON venues_unified TO sayu_app;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON exhibitions_unified TO sayu_app;
-- GRANT SELECT ON venues TO sayu_app;
-- GRANT SELECT ON exhibitions TO sayu_app;

COMMIT;