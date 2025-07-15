-- Critical Performance Indexes for Exhibition System
-- Addresses missing indexes for exhibition-related queries
-- Expected improvement: 60-80% query response time reduction

-- 1. EXHIBITION STATUS INDEX (High Priority)
-- Used for filtering exhibitions by status (ongoing, upcoming, ended)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exhibitions_status 
ON exhibitions(status);

-- 2. EXHIBITION CITY INDEX (High Priority)
-- Used for location-based exhibition filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exhibitions_venue_city 
ON exhibitions(venue_city);

-- 3. EXHIBITION DATE RANGE INDEX (High Priority)
-- Used for date-based filtering and sorting
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exhibitions_date_range 
ON exhibitions(start_date, end_date);

-- 4. EXHIBITION VENUE INDEX (High Priority)
-- Foreign key index for JOIN operations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exhibitions_venue_id 
ON exhibitions(venue_id);

-- 5. EXHIBITION SEARCH INDEX (High Priority)
-- Full-text search for exhibition titles and descriptions
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exhibitions_search 
ON exhibitions USING gin(to_tsvector('korean', title || ' ' || description));

-- 6. EXHIBITION POPULARITY INDEX (Medium Priority)
-- Used for sorting by popularity (view_count, like_count)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exhibitions_popularity 
ON exhibitions(view_count DESC, like_count DESC);

-- 7. EXHIBITION TAGS INDEX (Medium Priority)
-- GIN index for JSONB array queries on tags
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exhibitions_tags 
ON exhibitions USING gin(tags);

-- 8. EXHIBITION SUBMISSION STATUS INDEX (Medium Priority)
-- Used for admin dashboard filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exhibition_submissions_status 
ON exhibition_submissions(status);

-- 9. EXHIBITION LIKES USER INDEX (Medium Priority)
-- Composite index for user-specific like queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exhibition_likes_user 
ON exhibition_likes(user_id, exhibition_id);

-- 10. EXHIBITION VIEWS USER INDEX (Medium Priority)
-- Composite index for user-specific view tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exhibition_views_user 
ON exhibition_views(user_id, exhibition_id);

-- 11. VENUE LOCATION INDEX (Medium Priority)
-- Used for venue-based queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_venues_location 
ON venues(city, country);

-- 12. EXHIBITION CREATED_AT INDEX (Low Priority)
-- Used for recent exhibitions and sorting
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exhibitions_created_at 
ON exhibitions(created_at DESC);

-- 13. EXHIBITION FEATURED INDEX (Low Priority)
-- Used for featured exhibitions filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exhibitions_featured 
ON exhibitions(featured) WHERE featured = true;

-- Add foreign key constraints for data integrity
ALTER TABLE exhibitions 
ADD CONSTRAINT fk_exhibitions_venue_id 
FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE;

ALTER TABLE exhibition_likes 
ADD CONSTRAINT fk_exhibition_likes_exhibition_id 
FOREIGN KEY (exhibition_id) REFERENCES exhibitions(id) ON DELETE CASCADE;

ALTER TABLE exhibition_likes 
ADD CONSTRAINT fk_exhibition_likes_user_id 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE exhibition_views 
ADD CONSTRAINT fk_exhibition_views_exhibition_id 
FOREIGN KEY (exhibition_id) REFERENCES exhibitions(id) ON DELETE CASCADE;

ALTER TABLE exhibition_views 
ADD CONSTRAINT fk_exhibition_views_user_id 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE exhibition_submissions 
ADD CONSTRAINT fk_exhibition_submissions_submitter_id 
FOREIGN KEY (submitter_id) REFERENCES users(id) ON DELETE SET NULL;

-- Add check constraints for data validation
ALTER TABLE exhibitions 
ADD CONSTRAINT chk_exhibitions_status 
CHECK (status IN ('ongoing', 'upcoming', 'ended'));

ALTER TABLE exhibitions 
ADD CONSTRAINT chk_exhibitions_dates 
CHECK (start_date <= end_date);

ALTER TABLE exhibitions 
ADD CONSTRAINT chk_exhibitions_admission_fee 
CHECK (admission_fee >= 0);

ALTER TABLE exhibition_submissions 
ADD CONSTRAINT chk_exhibition_submissions_status 
CHECK (status IN ('pending', 'approved', 'rejected'));

-- Performance monitoring queries
-- Check index usage after creation:
/*
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as "Index Scans",
    idx_tup_read as "Tuples Read",
    idx_tup_fetch as "Tuples Fetched"
FROM pg_stat_user_indexes 
WHERE tablename IN ('exhibitions', 'venues', 'exhibition_likes', 'exhibition_views', 'exhibition_submissions')
AND idx_scan > 0
ORDER BY idx_scan DESC;
*/

-- Verify index creation:
/*
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('exhibitions', 'venues', 'exhibition_likes', 'exhibition_views', 'exhibition_submissions')
ORDER BY indexname;
*/