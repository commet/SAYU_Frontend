-- Global Venues Schema for International Museum Collection
-- This schema extends the existing venues system to support global art institutions

-- Create global_venues table for international museums and galleries
CREATE TABLE IF NOT EXISTS global_venues (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_local VARCHAR(255), -- Local language name
    description TEXT,
    description_local TEXT, -- Local language description
    
    -- Location Information
    country VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    address TEXT,
    address_local TEXT, -- Local language address
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Contact Information
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(500),
    social_media JSONB, -- Instagram, Twitter, etc.
    
    -- Venue Type and Category
    venue_type VARCHAR(50) NOT NULL, -- 'museum', 'gallery', 'art_center', 'cultural_center'
    venue_category VARCHAR(50), -- 'public', 'private', 'commercial', 'non_profit'
    art_focus VARCHAR(100), -- 'contemporary', 'classical', 'modern', 'photography', 'sculpture'
    
    -- Operating Information
    opening_hours JSONB, -- Store structured hours per day
    admission_info JSONB, -- Pricing, free days, etc.
    accessibility_info TEXT,
    languages_supported TEXT[], -- Array of language codes
    
    -- External API Information
    google_place_id VARCHAR(255),
    foursquare_venue_id VARCHAR(255),
    tripadvisor_id VARCHAR(255),
    facebook_page_id VARCHAR(255),
    
    -- Data Quality and Management
    data_source VARCHAR(50) NOT NULL, -- 'google_places', 'foursquare', 'web_scraping', 'manual'
    data_quality_score INTEGER DEFAULT 0, -- 0-100 score based on completeness
    verification_status VARCHAR(20) DEFAULT 'unverified', -- 'verified', 'unverified', 'flagged'
    last_verified TIMESTAMP,
    
    -- SAYU Integration
    personality_matches INTEGER[] DEFAULT '{}', -- Array of personality type IDs (1-16)
    emotion_signatures JSONB, -- Emotional characteristics for matching
    recommendation_priority INTEGER DEFAULT 50, -- 1-100, higher = more likely to recommend
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50) DEFAULT 'system',
    
    -- Constraints
    CONSTRAINT unique_google_place UNIQUE(google_place_id),
    CONSTRAINT unique_foursquare_venue UNIQUE(foursquare_venue_id),
    CONSTRAINT check_data_quality CHECK (data_quality_score >= 0 AND data_quality_score <= 100),
    CONSTRAINT check_priority CHECK (recommendation_priority >= 1 AND recommendation_priority <= 100)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_global_venues_location ON global_venues(country, city);
CREATE INDEX IF NOT EXISTS idx_global_venues_type ON global_venues(venue_type, venue_category);
CREATE INDEX IF NOT EXISTS idx_global_venues_coordinates ON global_venues(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_global_venues_quality ON global_venues(data_quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_global_venues_source ON global_venues(data_source);
CREATE INDEX IF NOT EXISTS idx_global_venues_updated ON global_venues(updated_at DESC);

-- GIN index for JSONB fields
CREATE INDEX IF NOT EXISTS idx_global_venues_social_media ON global_venues USING GIN(social_media);
CREATE INDEX IF NOT EXISTS idx_global_venues_opening_hours ON global_venues USING GIN(opening_hours);
CREATE INDEX IF NOT EXISTS idx_global_venues_emotion_signatures ON global_venues USING GIN(emotion_signatures);

-- GIN index for array fields
CREATE INDEX IF NOT EXISTS idx_global_venues_personality_matches ON global_venues USING GIN(personality_matches);
CREATE INDEX IF NOT EXISTS idx_global_venues_languages ON global_venues USING GIN(languages_supported);

-- Create global_exhibitions table for international exhibitions
CREATE TABLE IF NOT EXISTS global_exhibitions (
    id SERIAL PRIMARY KEY,
    venue_id INTEGER REFERENCES global_venues(id) ON DELETE CASCADE,
    
    -- Exhibition Information
    title VARCHAR(255) NOT NULL,
    title_local VARCHAR(255), -- Local language title
    subtitle TEXT,
    description TEXT,
    description_local TEXT,
    
    -- Artist Information
    artists JSONB, -- Array of artist objects with names, bios, etc.
    curator VARCHAR(255),
    curator_local VARCHAR(255),
    
    -- Dates and Timing
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    opening_reception TIMESTAMP,
    
    -- Ticketing and Access
    ticket_required BOOLEAN DEFAULT false,
    ticket_price JSONB, -- Different price categories
    booking_url VARCHAR(500),
    booking_required BOOLEAN DEFAULT false,
    
    -- Exhibition Details
    exhibition_type VARCHAR(50), -- 'permanent', 'temporary', 'traveling', 'special'
    art_medium VARCHAR(100), -- 'painting', 'sculpture', 'photography', 'mixed_media'
    themes TEXT[], -- Array of themes/tags
    featured_artworks JSONB, -- Key artworks with details
    
    -- External Links
    official_url VARCHAR(500),
    catalog_url VARCHAR(500),
    press_kit_url VARCHAR(500),
    virtual_tour_url VARCHAR(500),
    
    -- Images and Media
    poster_image_url VARCHAR(500),
    gallery_images JSONB, -- Array of image URLs
    promotional_video_url VARCHAR(500),
    
    -- Data Management
    data_source VARCHAR(50) NOT NULL,
    data_quality_score INTEGER DEFAULT 0,
    external_exhibition_id VARCHAR(255),
    
    -- SAYU Integration
    personality_matches INTEGER[] DEFAULT '{}',
    emotion_signatures JSONB,
    ai_generated_description TEXT, -- AI-enhanced description for personalization
    recommendation_score INTEGER DEFAULT 50,
    
    -- Status and Visibility
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'cancelled', 'postponed'
    visibility VARCHAR(20) DEFAULT 'public', -- 'public', 'private', 'members_only'
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT check_exhibition_dates CHECK (end_date >= start_date),
    CONSTRAINT check_exhibition_quality CHECK (data_quality_score >= 0 AND data_quality_score <= 100),
    CONSTRAINT check_exhibition_score CHECK (recommendation_score >= 1 AND recommendation_score <= 100)
);

-- Indexes for global_exhibitions
CREATE INDEX IF NOT EXISTS idx_global_exhibitions_venue ON global_exhibitions(venue_id);
CREATE INDEX IF NOT EXISTS idx_global_exhibitions_dates ON global_exhibitions(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_global_exhibitions_type ON global_exhibitions(exhibition_type);
CREATE INDEX IF NOT EXISTS idx_global_exhibitions_status ON global_exhibitions(status);
-- Partial index for current exhibitions (removed CURRENT_DATE from WHERE clause)
CREATE INDEX IF NOT EXISTS idx_global_exhibitions_current ON global_exhibitions(start_date, end_date) 
    WHERE status = 'active';

-- GIN indexes for JSONB and array fields
CREATE INDEX IF NOT EXISTS idx_global_exhibitions_artists ON global_exhibitions USING GIN(artists);
CREATE INDEX IF NOT EXISTS idx_global_exhibitions_themes ON global_exhibitions USING GIN(themes);
CREATE INDEX IF NOT EXISTS idx_global_exhibitions_personality ON global_exhibitions USING GIN(personality_matches);

-- Create collection_logs table for tracking data collection activities
CREATE TABLE IF NOT EXISTS global_collection_logs (
    id SERIAL PRIMARY KEY,
    collection_type VARCHAR(50) NOT NULL, -- 'venues', 'exhibitions', 'artists'
    data_source VARCHAR(50) NOT NULL, -- 'google_places', 'foursquare', 'web_scraping'
    
    -- Collection Details
    target_city VARCHAR(100),
    target_country VARCHAR(100),
    records_attempted INTEGER DEFAULT 0,
    records_successful INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    records_duplicate INTEGER DEFAULT 0,
    
    -- Performance Metrics
    duration_seconds INTEGER,
    api_calls_made INTEGER DEFAULT 0,
    api_quota_remaining INTEGER,
    
    -- Status and Results
    status VARCHAR(20) NOT NULL, -- 'running', 'completed', 'failed', 'partial'
    error_message TEXT,
    warnings TEXT[],
    success_rate DECIMAL(5,2),
    
    -- Timing
    started_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    
    -- Additional Context
    configuration JSONB, -- Store collection parameters
    results_summary JSONB, -- Store detailed results
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for collection_logs
CREATE INDEX IF NOT EXISTS idx_collection_logs_type_source ON global_collection_logs(collection_type, data_source);
CREATE INDEX IF NOT EXISTS idx_collection_logs_city ON global_collection_logs(target_city, target_country);
CREATE INDEX IF NOT EXISTS idx_collection_logs_status ON global_collection_logs(status);
CREATE INDEX IF NOT EXISTS idx_collection_logs_started ON global_collection_logs(started_at DESC);

-- Create data_quality_metrics table for monitoring system health
CREATE TABLE IF NOT EXISTS global_data_quality_metrics (
    id SERIAL PRIMARY KEY,
    metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Venue Metrics
    total_venues INTEGER DEFAULT 0,
    verified_venues INTEGER DEFAULT 0,
    venues_with_coordinates INTEGER DEFAULT 0,
    venues_with_contact_info INTEGER DEFAULT 0,
    venues_with_opening_hours INTEGER DEFAULT 0,
    venues_with_social_media INTEGER DEFAULT 0,
    average_venue_quality_score DECIMAL(5,2),
    
    -- Exhibition Metrics
    total_exhibitions INTEGER DEFAULT 0,
    active_exhibitions INTEGER DEFAULT 0,
    exhibitions_with_images INTEGER DEFAULT 0,
    exhibitions_with_booking_info INTEGER DEFAULT 0,
    average_exhibition_quality_score DECIMAL(5,2),
    
    -- Data Source Distribution
    google_places_venues INTEGER DEFAULT 0,
    foursquare_venues INTEGER DEFAULT 0,
    web_scraped_venues INTEGER DEFAULT 0,
    manual_venues INTEGER DEFAULT 0,
    
    -- Geographic Coverage
    countries_covered INTEGER DEFAULT 0,
    cities_covered INTEGER DEFAULT 0,
    
    -- Collection Performance
    daily_venues_collected INTEGER DEFAULT 0,
    daily_exhibitions_collected INTEGER DEFAULT 0,
    collection_success_rate DECIMAL(5,2),
    average_collection_duration_minutes DECIMAL(8,2),
    
    -- System Health
    duplicate_detection_rate DECIMAL(5,2),
    api_error_rate DECIMAL(5,2),
    data_freshness_days DECIMAL(5,2),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT unique_daily_metrics UNIQUE(metric_date)
);

-- Create function to update venue quality score
CREATE OR REPLACE FUNCTION calculate_venue_quality_score(venue_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
    score INTEGER := 0;
    venue_record RECORD;
BEGIN
    SELECT * INTO venue_record FROM global_venues WHERE id = venue_id;
    
    IF NOT FOUND THEN
        RETURN 0;
    END IF;
    
    -- Basic information (30 points)
    IF venue_record.name IS NOT NULL AND LENGTH(venue_record.name) > 0 THEN
        score := score + 10;
    END IF;
    
    IF venue_record.description IS NOT NULL AND LENGTH(venue_record.description) > 50 THEN
        score := score + 10;
    END IF;
    
    IF venue_record.venue_type IS NOT NULL THEN
        score := score + 10;
    END IF;
    
    -- Location information (25 points)
    IF venue_record.address IS NOT NULL AND LENGTH(venue_record.address) > 0 THEN
        score := score + 10;
    END IF;
    
    IF venue_record.latitude IS NOT NULL AND venue_record.longitude IS NOT NULL THEN
        score := score + 15;
    END IF;
    
    -- Contact information (20 points)
    IF venue_record.phone IS NOT NULL OR venue_record.email IS NOT NULL THEN
        score := score + 5;
    END IF;
    
    IF venue_record.website IS NOT NULL AND LENGTH(venue_record.website) > 0 THEN
        score := score + 10;
    END IF;
    
    IF venue_record.social_media IS NOT NULL AND jsonb_array_length(venue_record.social_media) > 0 THEN
        score := score + 5;
    END IF;
    
    -- Operating information (15 points)
    IF venue_record.opening_hours IS NOT NULL THEN
        score := score + 10;
    END IF;
    
    IF venue_record.admission_info IS NOT NULL THEN
        score := score + 5;
    END IF;
    
    -- External verification (10 points)
    IF venue_record.google_place_id IS NOT NULL OR venue_record.foursquare_venue_id IS NOT NULL THEN
        score := score + 5;
    END IF;
    
    IF venue_record.verification_status = 'verified' THEN
        score := score + 5;
    END IF;
    
    RETURN LEAST(score, 100); -- Cap at 100
END;
$$ LANGUAGE plpgsql;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic updated_at updates
CREATE TRIGGER update_global_venues_updated_at 
    BEFORE UPDATE ON global_venues 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_global_exhibitions_updated_at 
    BEFORE UPDATE ON global_exhibitions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial data quality metrics record
INSERT INTO global_data_quality_metrics (metric_date) 
VALUES (CURRENT_DATE) 
ON CONFLICT (metric_date) DO NOTHING;

-- Create view for current exhibitions
CREATE OR REPLACE VIEW current_global_exhibitions AS
SELECT 
    e.*,
    v.name as venue_name,
    v.city,
    v.country,
    v.website as venue_website,
    v.latitude,
    v.longitude
FROM global_exhibitions e
JOIN global_venues v ON e.venue_id = v.id
WHERE e.status = 'active'
    AND e.start_date <= CURRENT_DATE 
    AND e.end_date >= CURRENT_DATE;

-- Create view for venue statistics by city
CREATE OR REPLACE VIEW global_venues_by_city AS
SELECT 
    country,
    city,
    COUNT(*) as total_venues,
    COUNT(CASE WHEN venue_type = 'museum' THEN 1 END) as museums,
    COUNT(CASE WHEN venue_type = 'gallery' THEN 1 END) as galleries,
    COUNT(CASE WHEN venue_type = 'art_center' THEN 1 END) as art_centers,
    AVG(data_quality_score) as avg_quality_score,
    COUNT(CASE WHEN verification_status = 'verified' THEN 1 END) as verified_venues
FROM global_venues
GROUP BY country, city
ORDER BY country, city;

-- Grant permissions (adjust user as needed)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON global_venues TO sayu_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON global_exhibitions TO sayu_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON global_collection_logs TO sayu_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON global_data_quality_metrics TO sayu_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO sayu_user;

COMMENT ON TABLE global_venues IS 'International museums, galleries, and art institutions';
COMMENT ON TABLE global_exhibitions IS 'Exhibitions and shows at global venues';
COMMENT ON TABLE global_collection_logs IS 'Logs of data collection activities';
COMMENT ON TABLE global_data_quality_metrics IS 'Daily metrics for monitoring data quality and system health';