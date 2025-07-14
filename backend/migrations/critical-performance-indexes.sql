-- Critical Performance Indexes for SAYU Platform
-- Addresses missing indexes identified in performance analysis
-- Expected improvement: 60-70% query response time reduction

-- 1. PERSONALITY TYPE INDEX (High Priority)
-- Used in recommendation engine and user matching
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_personality_type 
ON users(personality_type);

-- 2. ARTIST SEARCH INDEX (High Priority) 
-- Full-text search for artist names
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_artworks_artist_search 
ON artworks_extended USING gin(to_tsvector('english', artist_display_name));

-- Alternative trigram index for fuzzy matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_artworks_artist_trigram 
ON artworks_extended USING gin(artist_display_name gin_trgm_ops);

-- 3. EXHIBITION ANALYTICS INDEX (High Priority)
-- Used for user behavior analytics and insights
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exhibition_visits_analytics 
ON exhibition_visits(user_id, visit_date);

-- 4. GAMIFICATION LEVEL INDEX (High Priority)
-- Used for user level queries and leaderboards  
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_points_level 
ON user_points(level DESC, points DESC);

-- 5. JSONB EXHIBITION SCORES INDEX (Medium Priority)
-- GIN index for JSONB queries on exhibition preferences
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_profiles_exhibition_scores 
ON user_profiles USING gin(exhibition_scores);

-- 6. JSONB ARTWORK SCORES INDEX (Medium Priority) 
-- GIN index for JSONB queries on artwork preferences
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_profiles_artwork_scores 
ON user_profiles USING gin(artwork_scores);

-- 7. QUIZ RESPONSES INDEX (Medium Priority)
-- For quiz analytics and user behavior analysis
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quiz_sessions_responses 
ON quiz_sessions USING gin(responses);

-- 8. METADATA SEARCH INDEX (Medium Priority)
-- For exhibition metadata searches
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exhibitions_metadata 
ON exhibitions_extended USING gin(metadata);

-- 9. COMPOSITE INDEX FOR USER ACTIVITY (Medium Priority)
-- Optimizes queries that filter by user and date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_point_activities_user_date 
ON point_activities(user_id, created_at DESC);

-- 10. RESERVATION DATE INDEX (Medium Priority)
-- For date-based reservation queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_reservations_date 
ON user_reservations(reservation_date, status);

-- 11. ART PROFILE LIKES INDEX (Low Priority)
-- For social features and popularity ranking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_art_profile_likes_count 
ON art_profile_likes(art_profile_id, created_at DESC);

-- 12. USER FOLLOW RELATIONSHIPS INDEX (Low Priority)
-- For social network features
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_follows_activity 
ON user_follows(follower_id, created_at DESC);

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
WHERE idx_scan > 0
ORDER BY idx_scan DESC;
*/

-- Verify index creation:
/*
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('users', 'artworks_extended', 'exhibition_visits', 'user_points', 'user_profiles')
ORDER BY indexname;
*/