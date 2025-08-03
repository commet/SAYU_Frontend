-- =============================================================================
-- SAYU Legacy Table Cleanup
-- 통합 완료 후 불필요한 테이블들 정리
-- =============================================================================

-- 안전 확인: 통합 테이블이 존재하고 데이터가 있는지 확인
DO $$
DECLARE
    venues_unified_count INTEGER;
    exhibitions_unified_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO venues_unified_count FROM venues_unified;
    SELECT COUNT(*) INTO exhibitions_unified_count FROM exhibitions_unified;
    
    IF venues_unified_count = 0 OR exhibitions_unified_count = 0 THEN
        RAISE EXCEPTION '통합 테이블에 데이터가 없습니다. 마이그레이션을 먼저 실행하세요.';
    END IF;
    
    RAISE NOTICE '통합 테이블 확인: venues_unified(%), exhibitions_unified(%)', 
                 venues_unified_count, exhibitions_unified_count;
END $$;

-- 1. Sequelize 모델 테이블 삭제 (따옴표 있는 테이블들)
DROP TABLE IF EXISTS "ExhibitionSubmissions" CASCADE;
DROP TABLE IF EXISTS "Exhibitions" CASCADE;
DROP TABLE IF EXISTS "Venues" CASCADE;
DROP TABLE IF EXISTS "SequelizeMeta" CASCADE;

-- 2. 기존 PostgreSQL native 테이블들을 백업으로 이름 변경
ALTER TABLE IF EXISTS venues RENAME TO venues_backup_legacy;
ALTER TABLE IF EXISTS exhibitions RENAME TO exhibitions_backup_legacy;
ALTER TABLE IF EXISTS exhibition_submissions RENAME TO exhibition_submissions_backup_legacy;

-- 3. Global 테이블들을 legacy로 이름 변경
ALTER TABLE IF EXISTS global_venues RENAME TO global_venues_legacy;
ALTER TABLE IF EXISTS global_exhibitions RENAME TO global_exhibitions_legacy;

-- 4. 기존 뷰들 재생성 (호환성을 위해)
CREATE OR REPLACE VIEW venues AS 
SELECT 
    id, name, name_en, type, tier::text::venue_tier, 
    address, district as address_detail, city, region, country, 
    latitude, longitude, phone, email, website,
    social_media->>'instagram' as instagram, 
    social_media->>'facebook' as facebook,
    operating_hours, closed_days, features, 
    logo_image, cover_image, images,
    description, description_en, crawl_url, crawl_selector, 
    last_crawled_at, crawl_frequency, 
    is_active, is_premium, exhibition_count, follower_count, 
    rating as average_rating, created_at, updated_at
FROM venues_unified;

CREATE OR REPLACE VIEW exhibitions AS
SELECT 
    id, title, title_en, description, venue_id, venue_name, venue_city, venue_country,
    start_date, end_date, opening_date, opening_time, artists, type, 
    poster_image, images, official_url, ticket_url, admission_fee, admission_note,
    source, source_url, submitted_by, verification_status, verified_by, verified_at,
    tags, view_count, like_count, status, featured, created_at, updated_at
FROM exhibitions_unified;

-- 5. 인덱스 정리 (기존 인덱스들 삭제 후 새로 생성)
-- 기존 인덱스들이 자동으로 삭제되지 않을 수 있으므로 명시적으로 삭제

-- venues 관련 인덱스
DROP INDEX IF EXISTS idx_venues_city_country;
DROP INDEX IF EXISTS idx_venues_type;
DROP INDEX IF EXISTS idx_venues_tier;
DROP INDEX IF EXISTS idx_venues_is_active;

-- exhibitions 관련 인덱스
DROP INDEX IF EXISTS idx_exhibitions_venue_id;
DROP INDEX IF EXISTS idx_exhibitions_start_date;
DROP INDEX IF EXISTS idx_exhibitions_end_date;
DROP INDEX IF EXISTS idx_exhibitions_status;
DROP INDEX IF EXISTS idx_exhibitions_verification_status;
DROP INDEX IF EXISTS idx_exhibitions_submitted_by;
DROP INDEX IF EXISTS idx_exhibitions_venue_city_country;

-- 6. 새로운 고성능 인덱스 생성
-- Venues 인덱스
CREATE INDEX idx_venues_unified_location_composite ON venues_unified(country, city, district);
CREATE INDEX idx_venues_unified_type_tier ON venues_unified(type, tier);
CREATE INDEX idx_venues_unified_active_rating ON venues_unified(is_active, rating DESC) WHERE is_active = true;
CREATE INDEX idx_venues_unified_name_search ON venues_unified USING gin(to_tsvector('korean', name || ' ' || COALESCE(name_en, '') || ' ' || COALESCE(name_ko, '')));

-- Exhibitions 인덱스
CREATE INDEX idx_exhibitions_unified_venue_dates ON exhibitions_unified(venue_id, start_date, end_date);
CREATE INDEX idx_exhibitions_unified_status_city ON exhibitions_unified(status, venue_city) WHERE visibility = 'public';
CREATE INDEX idx_exhibitions_unified_featured_score ON exhibitions_unified(featured, recommendation_score DESC) WHERE status IN ('ongoing', 'upcoming');
CREATE INDEX idx_exhibitions_unified_personality_gin ON exhibitions_unified USING gin(personality_matches);
CREATE INDEX idx_exhibitions_unified_search ON exhibitions_unified USING gin(to_tsvector('korean', title || ' ' || COALESCE(description, '')));

-- 7. 통계용 materialized view 생성 (캐싱을 위해)
CREATE MATERIALIZED VIEW exhibition_city_stats AS
SELECT 
    venue_city,
    venue_country,
    COUNT(*) as total_exhibitions,
    COUNT(CASE WHEN status = 'ongoing' THEN 1 END) as ongoing,
    COUNT(CASE WHEN status = 'upcoming' THEN 1 END) as upcoming,
    COUNT(CASE WHEN status = 'ended' THEN 1 END) as ended,
    COUNT(CASE WHEN featured = true THEN 1 END) as featured,
    AVG(view_count)::INTEGER as avg_views,
    MAX(end_date) as latest_exhibition
FROM exhibitions_unified 
WHERE visibility = 'public'
GROUP BY venue_city, venue_country
ORDER BY total_exhibitions DESC;

CREATE UNIQUE INDEX ON exhibition_city_stats(venue_city, venue_country);

-- 8. 자동 새로고침 함수 생성
CREATE OR REPLACE FUNCTION refresh_exhibition_stats()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY exhibition_city_stats;
END;
$$ LANGUAGE plpgsql;

-- 9. 데이터 품질 체크 함수
CREATE OR REPLACE FUNCTION check_data_quality()
RETURNS TABLE(
    table_name text,
    issue text,
    count bigint
) AS $$
BEGIN
    -- 고아 exhibitions 체크
    RETURN QUERY
    SELECT 'exhibitions_unified'::text, 'orphaned_exhibitions'::text, 
           COUNT(*) FROM exhibitions_unified e 
           WHERE NOT EXISTS (SELECT 1 FROM venues_unified v WHERE v.id = e.venue_id);
    
    -- 빈 venue 이름 체크
    RETURN QUERY
    SELECT 'venues_unified'::text, 'empty_names'::text,
           COUNT(*) FROM venues_unified WHERE name IS NULL OR name = '';
    
    -- 잘못된 날짜 체크
    RETURN QUERY
    SELECT 'exhibitions_unified'::text, 'invalid_dates'::text,
           COUNT(*) FROM exhibitions_unified WHERE start_date > end_date;
    
    -- 중복 venues 체크
    RETURN QUERY
    SELECT 'venues_unified'::text, 'potential_duplicates'::text,
           COUNT(*) FROM (
               SELECT name, city, COUNT(*) 
               FROM venues_unified 
               GROUP BY name, city 
               HAVING COUNT(*) > 1
           ) duplicates;
END;
$$ LANGUAGE plpgsql;

-- 10. 정리 완료 로그
DO $$
DECLARE
    venues_count INTEGER;
    exhibitions_count INTEGER;
    legacy_tables TEXT[] := ARRAY['venues_backup_legacy', 'exhibitions_backup_legacy', 'global_venues_legacy', 'global_exhibitions_legacy'];
    table_name TEXT;
    table_exists BOOLEAN;
BEGIN
    SELECT COUNT(*) INTO venues_count FROM venues_unified;
    SELECT COUNT(*) INTO exhibitions_count FROM exhibitions_unified;
    
    RAISE NOTICE '=== CLEANUP COMPLETE ===';
    RAISE NOTICE 'Active tables:';
    RAISE NOTICE '  - venues_unified: % rows', venues_count;
    RAISE NOTICE '  - exhibitions_unified: % rows', exhibitions_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Legacy backup tables:';
    
    FOREACH table_name IN ARRAY legacy_tables LOOP
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = table_name
        ) INTO table_exists;
        
        IF table_exists THEN
            RAISE NOTICE '  - % (preserved)', table_name;
        END IF;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE 'Views created for API compatibility:';
    RAISE NOTICE '  - venues (maps to venues_unified)';
    RAISE NOTICE '  - exhibitions (maps to exhibitions_unified)';
    RAISE NOTICE '';
    RAISE NOTICE 'Performance optimizations:';
    RAISE NOTICE '  - Full-text search indexes created';
    RAISE NOTICE '  - Composite indexes for common queries';
    RAISE NOTICE '  - Materialized view for city statistics';
    RAISE NOTICE '';
    RAISE NOTICE 'Data quality check available: SELECT * FROM check_data_quality();';
END $$;