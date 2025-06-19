-- SAYU Living Identity System Migration
-- This migration adds support for evolving art personalities

-- 1. Add evolving identity fields to users table
ALTER TABLE users
    ADD COLUMN current_identity_type VARCHAR(4),
    ADD COLUMN evolution_stage INTEGER DEFAULT 1,
    ADD COLUMN evolution_points INTEGER DEFAULT 0,
    ADD COLUMN quiz_tokens DECIMAL(4,1) DEFAULT 3.0,
    ADD COLUMN last_quiz_date TIMESTAMPTZ,
    ADD COLUMN identity_evolved_at TIMESTAMPTZ;

-- 2. Identity history tracking
CREATE TABLE identity_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    identity_type VARCHAR(4) NOT NULL,
    start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    evolution_points_at_change INTEGER,
    reason_for_change VARCHAR(100),
    confidence_score FLOAT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enhanced quiz sessions for evolution tracking
ALTER TABLE quiz_sessions
    ADD COLUMN questions_asked JSONB,
    ADD COLUMN result_type VARCHAR(4),
    ADD COLUMN confidence_score FLOAT,
    ADD COLUMN token_cost DECIMAL(4,1) DEFAULT 0,
    ADD COLUMN is_evolution_quiz BOOLEAN DEFAULT false;

-- 4. Village/Community system
CREATE TABLE villages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    village_code VARCHAR(4) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    korean_name VARCHAR(100),
    description TEXT,
    theme JSONB NOT NULL,
    community_features TEXT[],
    special_events JSONB,
    village_perks TEXT[],
    member_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Village memberships
CREATE TABLE village_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    village_code VARCHAR(4) NOT NULL REFERENCES villages(village_code),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    left_at TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'active',
    contribution_points INTEGER DEFAULT 0,
    role VARCHAR(50) DEFAULT 'member',
    badges_earned TEXT[],
    UNIQUE(user_id, village_code, status)
);

-- 6. Card exchange system
CREATE TABLE card_exchanges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exchange_date TIMESTAMPTZ DEFAULT NOW(),
    location_context VARCHAR(100),
    mutual_badges_earned TEXT[],
    exchange_message TEXT,
    CHECK(user1_id != user2_id)
);

-- 7. Evolution tracking
CREATE TABLE evolution_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    points_earned INTEGER NOT NULL,
    activity_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Token transactions
CREATE TABLE token_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(4,1) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    reason VARCHAR(200),
    balance_after DECIMAL(4,1),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Identity cards customization
CREATE TABLE identity_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    card_theme VARCHAR(50) DEFAULT 'default',
    motto VARCHAR(100),
    favorite_artwork_id UUID,
    custom_colors JSONB,
    badges_display TEXT[],
    journey_visibility VARCHAR(20) DEFAULT 'public',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Village events
CREATE TABLE village_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    village_code VARCHAR(4) REFERENCES villages(village_code),
    event_name VARCHAR(200) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    recurring_pattern JSONB,
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    rewards JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Event participation
CREATE TABLE event_participations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES village_events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    participation_type VARCHAR(50) DEFAULT 'attendee',
    points_earned INTEGER DEFAULT 0,
    badges_earned TEXT[],
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- Create indexes for performance
CREATE INDEX idx_identity_history_user_id ON identity_history(user_id);
CREATE INDEX idx_identity_history_dates ON identity_history(start_date, end_date);
CREATE INDEX idx_village_memberships_user ON village_memberships(user_id);
CREATE INDEX idx_village_memberships_village ON village_memberships(village_code);
CREATE INDEX idx_card_exchanges_user1 ON card_exchanges(user1_id);
CREATE INDEX idx_card_exchanges_user2 ON card_exchanges(user2_id);
CREATE INDEX idx_card_exchanges_date ON card_exchanges(exchange_date DESC);
CREATE INDEX idx_evolution_activities_user ON evolution_activities(user_id);
CREATE INDEX idx_evolution_activities_date ON evolution_activities(created_at DESC);
CREATE INDEX idx_token_transactions_user ON token_transactions(user_id);
CREATE INDEX idx_token_transactions_date ON token_transactions(created_at DESC);
CREATE INDEX idx_village_events_village ON village_events(village_code);
CREATE INDEX idx_village_events_time ON village_events(start_time);
CREATE INDEX idx_event_participations_event ON event_participations(event_id);
CREATE INDEX idx_event_participations_user ON event_participations(user_id);

-- Insert initial villages
INSERT INTO villages (village_code, name, korean_name, description, theme, community_features, village_perks) VALUES
('LAEF', 'Dreamweaver Haven', '몽상가의 안식처', 'A misty sanctuary for contemplative art lovers', 
 '{"architecture": "floating_ethereal", "ambiance": "misty_twilight", "soundtrack": "ambient_whispers", "colors": ["#667eea", "#764ba2"]}',
 ARRAY['Meditation Gardens', 'Solo Exhibition Spaces', 'Dream Journal Library'],
 ARRAY['Access to quiet viewing hours', 'Personal art interpretation guides', 'Exclusive introvert-friendly exhibitions']),

('SRMC', 'Scholar''s Symposium', '학자의 광장', 'A bright forum for analytical art enthusiasts',
 '{"architecture": "classical_columns", "ambiance": "bright_scholarly", "soundtrack": "baroque_discussions", "colors": ["#f093fb", "#f5576c"]}',
 ARRAY['Debate Halls', 'Research Libraries', 'Lecture Amphitheaters'],
 ARRAY['Early access to educational content', 'Peer review networks', 'Museum partnership programs']),

('SAEF', 'Social Dreamscape', '사교적 몽상가의 집', 'Where social butterflies meet artistic dreams',
 '{"architecture": "open_flowing", "ambiance": "warm_vibrant", "soundtrack": "jazz_conversations", "colors": ["#4facfe", "#00f2fe"]}',
 ARRAY['Networking Lounges', 'Group Gallery Tours', 'Art Café Discussions'],
 ARRAY['Group exhibition tickets', 'Social event invitations', 'Collaborative art projects']),

('LRMC', 'Methodical Observers', '체계적 관찰자의 탑', 'For those who find patterns in art',
 '{"architecture": "geometric_precise", "ambiance": "clean_organized", "soundtrack": "minimal_focus", "colors": ["#43e97b", "#38f9d7"]}',
 ARRAY['Analysis Workshops', 'Pattern Libraries', 'Systematic Tours'],
 ARRAY['Art cataloging tools', 'Exclusive analytical content', 'Data-driven recommendations']);

-- Add trigger to update user's current village when identity changes
CREATE OR REPLACE FUNCTION update_village_membership()
RETURNS TRIGGER AS $$
BEGIN
    -- End previous membership
    UPDATE village_memberships 
    SET status = 'alumni', left_at = NOW()
    WHERE user_id = NEW.user_id AND status = 'active';
    
    -- Create new membership
    INSERT INTO village_memberships (user_id, village_code, status)
    VALUES (NEW.user_id, NEW.current_identity_type, 'active');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER identity_change_village_update
AFTER UPDATE OF current_identity_type ON users
FOR EACH ROW
WHEN (OLD.current_identity_type IS DISTINCT FROM NEW.current_identity_type)
EXECUTE FUNCTION update_village_membership();