-- Migration: Add Behavioral Insights Tables
-- Description: Add tables for tracking user viewing behavior and emotional journey

-- Artwork viewing behavior tracking
CREATE TABLE IF NOT EXISTS artwork_viewing_behavior (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    artwork_id INTEGER REFERENCES artworks(id),
    session_id UUID DEFAULT gen_random_uuid(),
    personality_type VARCHAR(50),
    time_spent INTEGER, -- seconds
    interactions JSONB DEFAULT '{}', -- clicks, zooms, shares, etc.
    emotional_response VARCHAR(50),
    scroll_depth DECIMAL(3,2) DEFAULT 0.00, -- 0.00 to 1.00
    zoom_level DECIMAL(3,2) DEFAULT 1.00, -- 1.00 = normal, >1 = zoomed in
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Social interactions tracking
CREATE TABLE IF NOT EXISTS social_interactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    interaction_type VARCHAR(50) NOT NULL, -- share, comment, like, follow
    interaction_user_id INTEGER REFERENCES users(id),
    shared_artwork_id INTEGER REFERENCES artworks(id),
    content TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User session tracking for path analysis
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    session_metadata JSONB DEFAULT '{}',
    total_artworks_viewed INTEGER DEFAULT 0,
    total_time_spent INTEGER DEFAULT 0
);

-- Emotional journey milestones
CREATE TABLE IF NOT EXISTS emotional_milestones (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    milestone_type VARCHAR(50) NOT NULL, -- first_emotion, emotion_diversity, dominant_shift
    milestone_data JSONB NOT NULL,
    achieved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Growth tracking milestones
CREATE TABLE IF NOT EXISTS growth_milestones (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    milestone_type VARCHAR(50) NOT NULL, -- styles_discovered, artists_explored, social_shares
    milestone_value INTEGER,
    milestone_data JSONB DEFAULT '{}',
    achieved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_viewing_behavior_user_date 
    ON artwork_viewing_behavior(user_id, viewed_at);

CREATE INDEX IF NOT EXISTS idx_viewing_behavior_personality 
    ON artwork_viewing_behavior(personality_type, viewed_at);

CREATE INDEX IF NOT EXISTS idx_viewing_behavior_session 
    ON artwork_viewing_behavior(session_id, viewed_at);

CREATE INDEX IF NOT EXISTS idx_social_interactions_user 
    ON social_interactions(user_id, created_at);

CREATE INDEX IF NOT EXISTS idx_social_interactions_type 
    ON social_interactions(interaction_type, created_at);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user 
    ON user_sessions(user_id, started_at);

CREATE INDEX IF NOT EXISTS idx_emotional_milestones_user 
    ON emotional_milestones(user_id, achieved_at);

CREATE INDEX IF NOT EXISTS idx_growth_milestones_user 
    ON growth_milestones(user_id, achieved_at);

-- Add session_id to existing tables if they don't have it
DO $$ 
BEGIN
    -- Add session tracking to quiz results if column doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quiz_results' AND column_name = 'session_id'
    ) THEN
        ALTER TABLE quiz_results ADD COLUMN session_id UUID;
    END IF;

    -- Add emotional response tracking to artwork interactions
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'artwork_interactions' AND column_name = 'emotional_response'
    ) THEN
        ALTER TABLE artwork_interactions ADD COLUMN emotional_response VARCHAR(50);
    END IF;
    
    -- Add time spent tracking to artwork interactions
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'artwork_interactions' AND column_name = 'time_spent'
    ) THEN
        ALTER TABLE artwork_interactions ADD COLUMN time_spent INTEGER DEFAULT 0;
    END IF;
END $$;

-- Create view for comprehensive user insights
CREATE OR REPLACE VIEW user_insights_summary AS
SELECT 
    u.id as user_id,
    u.username,
    u.personality_type,
    
    -- Viewing behavior stats
    COUNT(DISTINCT avb.artwork_id) as total_artworks_viewed,
    AVG(avb.time_spent) as avg_time_per_artwork,
    AVG(avb.scroll_depth) as avg_scroll_depth,
    AVG(avb.zoom_level) as avg_zoom_level,
    
    -- Emotional journey stats
    COUNT(DISTINCT avb.emotional_response) as unique_emotions_experienced,
    mode() WITHIN GROUP (ORDER BY avb.emotional_response) as dominant_emotion,
    
    -- Social engagement stats
    COUNT(DISTINCT si.id) as total_social_interactions,
    COUNT(DISTINCT si.shared_artwork_id) as artworks_shared,
    COUNT(DISTINCT si.interaction_user_id) as unique_social_connections,
    
    -- Growth metrics
    COUNT(DISTINCT EXTRACT(MONTH FROM avb.viewed_at)) as active_months,
    MIN(avb.viewed_at) as journey_start,
    MAX(avb.viewed_at) as last_activity,
    
    -- Engagement patterns
    CASE 
        WHEN AVG(avb.time_spent) > 180 THEN 'Deep Contemplator'
        WHEN AVG(avb.time_spent) > 90 THEN 'Thoughtful Observer'
        WHEN AVG(avb.time_spent) > 30 THEN 'Casual Browser'
        ELSE 'Quick Scanner'
    END as viewing_style,
    
    CASE 
        WHEN COUNT(DISTINCT si.id) > 50 THEN 'Social Curator'
        WHEN COUNT(DISTINCT si.id) > 20 THEN 'Active Sharer'
        WHEN COUNT(DISTINCT si.id) > 5 THEN 'Occasional Connector'
        ELSE 'Private Appreciator'
    END as social_style

FROM users u
LEFT JOIN artwork_viewing_behavior avb ON u.id = avb.user_id
LEFT JOIN social_interactions si ON u.id = si.user_id
WHERE u.created_at >= NOW() - INTERVAL '1 year' -- Active users only
GROUP BY u.id, u.username, u.personality_type;

-- Create function to calculate emotional stability
CREATE OR REPLACE FUNCTION calculate_emotional_stability(user_id_param INTEGER, days_back INTEGER DEFAULT 30)
RETURNS DECIMAL(3,2) AS $$
DECLARE
    total_transitions INTEGER;
    same_emotion_transitions INTEGER;
    stability_score DECIMAL(3,2);
BEGIN
    -- Count total emotional transitions
    SELECT COUNT(*) INTO total_transitions
    FROM (
        SELECT 
            emotional_response,
            LAG(emotional_response) OVER (ORDER BY viewed_at) as prev_emotion
        FROM artwork_viewing_behavior
        WHERE user_id = user_id_param
            AND viewed_at >= NOW() - INTERVAL '1 day' * days_back
            AND emotional_response IS NOT NULL
    ) transitions
    WHERE prev_emotion IS NOT NULL;
    
    -- Count transitions where emotion stayed the same
    SELECT COUNT(*) INTO same_emotion_transitions
    FROM (
        SELECT 
            emotional_response,
            LAG(emotional_response) OVER (ORDER BY viewed_at) as prev_emotion
        FROM artwork_viewing_behavior
        WHERE user_id = user_id_param
            AND viewed_at >= NOW() - INTERVAL '1 day' * days_back
            AND emotional_response IS NOT NULL
    ) transitions
    WHERE prev_emotion = emotional_response;
    
    -- Calculate stability (percentage of same-emotion transitions)
    IF total_transitions > 0 THEN
        stability_score := same_emotion_transitions::DECIMAL / total_transitions::DECIMAL;
    ELSE
        stability_score := 0.00;
    END IF;
    
    RETURN stability_score;
END;
$$ LANGUAGE plpgsql;

-- Create function to identify growth patterns
CREATE OR REPLACE FUNCTION identify_growth_pattern(user_id_param INTEGER)
RETURNS VARCHAR(50) AS $$
DECLARE
    recent_styles INTEGER;
    recent_social INTEGER;
    total_months INTEGER;
    growth_pattern VARCHAR(50);
BEGIN
    -- Get metrics from last 3 months
    SELECT 
        COUNT(DISTINCT a.style),
        COUNT(DISTINCT si.id),
        COUNT(DISTINCT EXTRACT(MONTH FROM avb.viewed_at))
    INTO recent_styles, recent_social, total_months
    FROM artwork_viewing_behavior avb
    LEFT JOIN artworks a ON avb.artwork_id = a.id
    LEFT JOIN social_interactions si ON avb.user_id = si.user_id 
        AND si.created_at >= NOW() - INTERVAL '3 months'
    WHERE avb.user_id = user_id_param
        AND avb.viewed_at >= NOW() - INTERVAL '3 months';
    
    -- Determine pattern based on metrics
    IF recent_styles > 10 THEN
        growth_pattern := 'rapidly_expanding';
    ELSIF recent_styles > 5 THEN
        growth_pattern := 'steadily_exploring';
    ELSIF recent_social > 20 THEN
        growth_pattern := 'socially_active';
    ELSE
        growth_pattern := 'focused_appreciation';
    END IF;
    
    RETURN growth_pattern;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for automatic milestone tracking
CREATE OR REPLACE FUNCTION trigger_milestone_check()
RETURNS TRIGGER AS $$
BEGIN
    -- Check for style discovery milestones
    INSERT INTO growth_milestones (user_id, milestone_type, milestone_value, milestone_data)
    SELECT 
        NEW.user_id,
        'styles_discovered',
        COUNT(DISTINCT a.style),
        json_build_object('latest_style', a.style, 'artwork_id', NEW.artwork_id)
    FROM artwork_viewing_behavior avb
    JOIN artworks a ON avb.artwork_id = a.id
    WHERE avb.user_id = NEW.user_id
    GROUP BY a.style
    HAVING COUNT(DISTINCT a.style) IN (5, 10, 25, 50, 100); -- Milestone thresholds
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for milestone tracking
DROP TRIGGER IF EXISTS milestone_tracker ON artwork_viewing_behavior;
CREATE TRIGGER milestone_tracker
    AFTER INSERT ON artwork_viewing_behavior
    FOR EACH ROW
    EXECUTE FUNCTION trigger_milestone_check();

-- Insert sample emotional responses for testing
INSERT INTO artwork_viewing_behavior (user_id, artwork_id, emotional_response, time_spent, scroll_depth, zoom_level)
SELECT 
    1, -- Replace with actual user ID
    (RANDOM() * 100 + 1)::INTEGER, -- Random artwork ID
    (ARRAY['joy', 'awe', 'peace', 'curiosity', 'melancholy', 'contemplation'])[FLOOR(RANDOM() * 6 + 1)],
    (RANDOM() * 300 + 30)::INTEGER, -- 30-330 seconds
    RANDOM()::DECIMAL(3,2), -- 0.00 to 1.00
    (1 + RANDOM())::DECIMAL(3,2) -- 1.00 to 2.00
FROM generate_series(1, 20) -- Generate 20 sample records
WHERE EXISTS (SELECT 1 FROM users WHERE id = 1); -- Only if user exists

COMMENT ON TABLE artwork_viewing_behavior IS 'Tracks detailed user viewing behavior for behavioral insights';
COMMENT ON TABLE social_interactions IS 'Tracks social engagement and sharing behavior';
COMMENT ON TABLE emotional_milestones IS 'Tracks emotional journey milestones';
COMMENT ON TABLE growth_milestones IS 'Tracks artistic growth and discovery milestones';