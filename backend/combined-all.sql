-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nickname VARCHAR(100),
    age INTEGER,
    location JSONB,
    personal_manifesto TEXT,
    agency_level VARCHAR(50) DEFAULT 'explorer',
    aesthetic_journey_stage VARCHAR(50) DEFAULT 'discovering',
    ui_theme_preference JSONB DEFAULT '{"mode": "dynamic"}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User profiles
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type_code VARCHAR(4),
    archetype_name VARCHAR(100),
    archetype_description TEXT,
    archetype_evolution_stage INTEGER DEFAULT 1,
    exhibition_scores JSONB,
    artwork_scores JSONB,
    emotional_tags TEXT[],
    cognitive_vector JSONB,
    emotional_vector JSONB,
    aesthetic_vector JSONB,
    personality_confidence FLOAT,
    ui_customization JSONB,
    interaction_style VARCHAR(50),
    generated_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add performance indexes for user_profiles
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_type_code ON user_profiles(type_code);
CREATE INDEX idx_user_profiles_created_at ON user_profiles(created_at DESC);

-- Quiz sessions
CREATE TABLE quiz_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_type VARCHAR(20),
    device_info JSONB,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    time_spent INTEGER,
    responses JSONB,
    completion_rate FLOAT
);

-- Add performance indexes for quiz_sessions
CREATE INDEX idx_quiz_sessions_user_id ON quiz_sessions(user_id);
CREATE INDEX idx_quiz_sessions_type ON quiz_sessions(session_type);
CREATE INDEX idx_quiz_sessions_started_at ON quiz_sessions(started_at DESC);
CREATE INDEX idx_quiz_sessions_completed_at ON quiz_sessions(completed_at DESC);

-- Community features
CREATE TABLE forums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    slug VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50) DEFAULT 'general',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE forum_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    forum_id UUID NOT NULL REFERENCES forums(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT false,
    is_locked BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    last_reply_at TIMESTAMPTZ DEFAULT NOW(),
    last_reply_user_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE forum_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID NOT NULL REFERENCES forum_topics(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_reply_id UUID REFERENCES forum_replies(id),
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    followed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CHECK(follower_id != following_id)
);

CREATE TABLE post_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES forum_topics(id) ON DELETE CASCADE,
    reply_id UUID REFERENCES forum_replies(id) ON DELETE CASCADE,
    liked_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK((topic_id IS NOT NULL AND reply_id IS NULL) OR (topic_id IS NULL AND reply_id IS NOT NULL))
);

CREATE TABLE user_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reported_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES forum_topics(id) ON DELETE CASCADE,
    reply_id UUID REFERENCES forum_replies(id) ON DELETE CASCADE,
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_type VARCHAR(50) NOT NULL,
    badge_name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(20) DEFAULT 'blue',
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, badge_type)
);

-- Community indexes for performance
CREATE INDEX idx_forum_topics_forum_id ON forum_topics(forum_id);
CREATE INDEX idx_forum_topics_user_id ON forum_topics(user_id);
CREATE INDEX idx_forum_topics_last_reply ON forum_topics(last_reply_at DESC);
CREATE INDEX idx_forum_replies_topic_id ON forum_replies(topic_id);
CREATE INDEX idx_forum_replies_user_id ON forum_replies(user_id);
CREATE INDEX idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX idx_user_follows_following ON user_follows(following_id);
CREATE INDEX idx_post_likes_user_topic ON post_likes(user_id, topic_id);
CREATE INDEX idx_post_likes_user_reply ON post_likes(user_id, reply_id);

-- Social sharing tracking
CREATE TABLE social_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_type VARCHAR(50) NOT NULL,
    content_id UUID NOT NULL,
    platform VARCHAR(50) NOT NULL,
    shared_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_social_shares_user_id ON social_shares(user_id);
CREATE INDEX idx_social_shares_content ON social_shares(content_type, content_id);
CREATE INDEX idx_social_shares_platform ON social_shares(platform);
CREATE INDEX idx_social_shares_date ON social_shares(shared_at DESC);

-- Artist/Gallery portal
CREATE TABLE artist_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    artist_name VARCHAR(200) NOT NULL,
    bio TEXT,
    website_url VARCHAR(500),
    social_links JSONB DEFAULT '{}',
    contact_email VARCHAR(255),
    phone VARCHAR(50),
    address JSONB,
    specialties TEXT[],
    verified BOOLEAN DEFAULT false,
    verification_documents JSONB DEFAULT '{}',
    profile_image_url TEXT,
    banner_image_url TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE gallery_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    gallery_name VARCHAR(200) NOT NULL,
    description TEXT,
    website_url VARCHAR(500),
    contact_email VARCHAR(255),
    phone VARCHAR(50),
    address JSONB NOT NULL,
    opening_hours JSONB,
    gallery_type VARCHAR(50) DEFAULT 'independent',
    established_year INTEGER,
    specializations TEXT[],
    verified BOOLEAN DEFAULT false,
    verification_documents JSONB DEFAULT '{}',
    profile_image_url TEXT,
    banner_image_url TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE submitted_artworks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_profile_id UUID REFERENCES artist_profiles(id) ON DELETE CASCADE,
    gallery_profile_id UUID REFERENCES gallery_profiles(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    artist_display_name VARCHAR(200),
    creation_date VARCHAR(100),
    medium VARCHAR(500),
    dimensions VARCHAR(200),
    description TEXT,
    technique TEXT,
    style VARCHAR(100),
    subject_matter TEXT[],
    color_palette TEXT[],
    primary_image_url TEXT NOT NULL,
    additional_images JSONB DEFAULT '[]',
    price_range VARCHAR(100),
    availability_status VARCHAR(50) DEFAULT 'available',
    exhibition_history TEXT,
    provenance TEXT,
    condition_report TEXT,
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    submission_status VARCHAR(20) DEFAULT 'pending',
    review_notes TEXT,
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK((artist_profile_id IS NOT NULL AND gallery_profile_id IS NULL) OR 
          (artist_profile_id IS NULL AND gallery_profile_id IS NOT NULL))
);

CREATE TABLE submitted_exhibitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gallery_profile_id UUID NOT NULL REFERENCES gallery_profiles(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    curator_name VARCHAR(200),
    start_date DATE,
    end_date DATE,
    opening_reception TIMESTAMPTZ,
    exhibition_type VARCHAR(50) DEFAULT 'group',
    theme VARCHAR(200),
    featured_artists TEXT[],
    artwork_ids UUID[],
    poster_image_url TEXT,
    gallery_images JSONB DEFAULT '[]',
    press_release TEXT,
    catalog_url TEXT,
    ticket_info JSONB,
    accessibility_info TEXT,
    special_events JSONB DEFAULT '[]',
    tags TEXT[],
    submission_status VARCHAR(20) DEFAULT 'pending',
    review_notes TEXT,
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE submission_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_type VARCHAR(20) NOT NULL,
    submission_id UUID NOT NULL,
    reviewer_id UUID NOT NULL REFERENCES users(id),
    status VARCHAR(20) NOT NULL,
    review_notes TEXT,
    quality_score INTEGER CHECK (quality_score >= 1 AND quality_score <= 10),
    feedback JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for artist/gallery portal
CREATE INDEX idx_artist_profiles_user_id ON artist_profiles(user_id);
CREATE INDEX idx_artist_profiles_status ON artist_profiles(status);
CREATE INDEX idx_artist_profiles_verified ON artist_profiles(verified);
CREATE INDEX idx_gallery_profiles_user_id ON gallery_profiles(user_id);
CREATE INDEX idx_gallery_profiles_status ON gallery_profiles(status);
CREATE INDEX idx_gallery_profiles_verified ON gallery_profiles(verified);
CREATE INDEX idx_submitted_artworks_artist ON submitted_artworks(artist_profile_id);
CREATE INDEX idx_submitted_artworks_gallery ON submitted_artworks(gallery_profile_id);
CREATE INDEX idx_submitted_artworks_status ON submitted_artworks(submission_status);
CREATE INDEX idx_submitted_exhibitions_gallery ON submitted_exhibitions(gallery_profile_id);
CREATE INDEX idx_submitted_exhibitions_status ON submitted_exhibitions(submission_status);
CREATE INDEX idx_submission_reviews_submission ON submission_reviews(submission_type, submission_id);

-- Extended museum/exhibition database
CREATE TABLE museums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(500) NOT NULL,
    short_name VARCHAR(100),
    description TEXT,
    location JSONB NOT NULL,
    website_url VARCHAR(500),
    api_source VARCHAR(50),
    api_id VARCHAR(100),
    contact_info JSONB DEFAULT '{}',
    opening_hours JSONB DEFAULT '{}',
    admission_info JSONB DEFAULT '{}',
    accessibility_info TEXT,
    facilities TEXT[],
    image_url TEXT,
    logo_url TEXT,
    verified BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(api_source, api_id)
);

CREATE TABLE exhibitions_extended (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    museum_id UUID REFERENCES museums(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    subtitle VARCHAR(500),
    description TEXT,
    curator_name VARCHAR(200),
    start_date DATE,
    end_date DATE,
    exhibition_type VARCHAR(50) DEFAULT 'temporary',
    status VARCHAR(20) DEFAULT 'upcoming',
    featured_artists TEXT[],
    artwork_count INTEGER DEFAULT 0,
    themes TEXT[],
    periods TEXT[],
    movements TEXT[],
    media_types TEXT[],
    primary_image_url TEXT,
    gallery_images JSONB DEFAULT '[]',
    ticket_info JSONB DEFAULT '{}',
    special_events JSONB DEFAULT '[]',
    accessibility_features TEXT[],
    audio_guide_available BOOLEAN DEFAULT false,
    virtual_tour_url TEXT,
    catalog_url TEXT,
    press_release_url TEXT,
    reviews JSONB DEFAULT '[]',
    visitor_rating DECIMAL(3,2),
    visitor_count INTEGER DEFAULT 0,
    api_source VARCHAR(50),
    api_id VARCHAR(100),
    external_url TEXT,
    metadata JSONB DEFAULT '{}',
    last_synced TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(api_source, api_id)
);

CREATE TABLE artworks_extended (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    museum_id UUID REFERENCES museums(id) ON DELETE CASCADE,
    exhibition_id UUID REFERENCES exhibitions_extended(id) ON DELETE SET NULL,
    title VARCHAR(500) NOT NULL,
    artist_display_name VARCHAR(500),
    artist_nationality VARCHAR(100),
    artist_birth_year INTEGER,
    artist_death_year INTEGER,
    creation_date VARCHAR(100),
    period VARCHAR(100),
    movement VARCHAR(100),
    medium VARCHAR(500),
    dimensions VARCHAR(200),
    description TEXT,
    provenance TEXT,
    exhibition_history TEXT,
    literature TEXT,
    culture VARCHAR(100),
    classification VARCHAR(100),
    department VARCHAR(200),
    object_number VARCHAR(100),
    accession_year INTEGER,
    is_highlight BOOLEAN DEFAULT false,
    is_public_domain BOOLEAN DEFAULT false,
    rights_reproduction TEXT,
    primary_image_url TEXT,
    additional_images JSONB DEFAULT '[]',
    color_palette JSONB DEFAULT '[]',
    tags TEXT[],
    location_gallery VARCHAR(200),
    on_view BOOLEAN DEFAULT false,
    api_source VARCHAR(50) NOT NULL,
    api_id VARCHAR(100) NOT NULL,
    external_url TEXT,
    metadata JSONB DEFAULT '{}',
    last_synced TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(api_source, api_id)
);

CREATE TABLE api_sync_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_source VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    last_sync_start TIMESTAMPTZ,
    last_sync_complete TIMESTAMPTZ,
    last_sync_status VARCHAR(20) DEFAULT 'pending',
    total_records INTEGER DEFAULT 0,
    processed_records INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    error_log JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    UNIQUE(api_source, resource_type)
);

-- Indexes for extended museum database
CREATE INDEX idx_museums_api_source ON museums(api_source);
CREATE INDEX idx_museums_location ON museums USING gin(location);
CREATE INDEX idx_museums_status ON museums(status);
CREATE INDEX idx_exhibitions_extended_museum ON exhibitions_extended(museum_id);
CREATE INDEX idx_exhibitions_extended_dates ON exhibitions_extended(start_date, end_date);
CREATE INDEX idx_exhibitions_extended_status ON exhibitions_extended(status);
CREATE INDEX idx_exhibitions_extended_api ON exhibitions_extended(api_source, api_id);
CREATE INDEX idx_artworks_extended_museum ON artworks_extended(museum_id);
CREATE INDEX idx_artworks_extended_exhibition ON artworks_extended(exhibition_id);
CREATE INDEX idx_artworks_extended_artist ON artworks_extended(artist_display_name);
CREATE INDEX idx_artworks_extended_api ON artworks_extended(api_source, api_id);
CREATE INDEX idx_artworks_extended_tags ON artworks_extended USING gin(tags);
CREATE INDEX idx_artworks_extended_on_view ON artworks_extended(on_view);
CREATE INDEX idx_api_sync_status_source ON api_sync_status(api_source, resource_type);

-- Exhibition reservation and ticketing system
CREATE TABLE reservation_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    provider_type VARCHAR(50) NOT NULL, -- 'direct', 'eventbrite', 'timed_entry', 'third_party'
    api_endpoint VARCHAR(500),
    api_key_required BOOLEAN DEFAULT false,
    booking_url_template VARCHAR(500),
    metadata JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE exhibition_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exhibition_id UUID REFERENCES exhibitions_extended(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES reservation_providers(id),
    reservation_type VARCHAR(50) NOT NULL, -- 'free', 'paid', 'timed', 'member_only'
    booking_url VARCHAR(500),
    pricing_info JSONB DEFAULT '{}',
    availability_info JSONB DEFAULT '{}',
    time_slots JSONB DEFAULT '[]',
    requirements JSONB DEFAULT '{}', -- age restrictions, group size, etc.
    advance_booking_required BOOLEAN DEFAULT false,
    cancellation_policy TEXT,
    contact_info JSONB DEFAULT '{}',
    special_instructions TEXT,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exhibition_id UUID NOT NULL REFERENCES exhibitions_extended(id) ON DELETE CASCADE,
    reservation_provider_id UUID REFERENCES reservation_providers(id),
    external_reservation_id VARCHAR(200),
    reservation_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled', 'completed'
    visit_date DATE,
    visit_time TIME,
    party_size INTEGER DEFAULT 1,
    ticket_type VARCHAR(100),
    total_cost DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    confirmation_code VARCHAR(100),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    special_requests TEXT,
    booking_reference JSONB DEFAULT '{}',
    reminder_sent BOOLEAN DEFAULT false,
    feedback_collected BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE reservation_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_reservation_id UUID NOT NULL REFERENCES user_reservations(id) ON DELETE CASCADE,
    reminder_type VARCHAR(50) NOT NULL, -- 'booking_confirmation', 'pre_visit', 'day_of', 'follow_up'
    scheduled_for TIMESTAMPTZ NOT NULL,
    sent_at TIMESTAMPTZ,
    delivery_method VARCHAR(20) DEFAULT 'email', -- 'email', 'sms', 'push'
    content JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'pending' -- 'pending', 'sent', 'failed'
);

CREATE TABLE exhibition_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exhibition_id UUID NOT NULL REFERENCES exhibitions_extended(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time_slot TIME,
    capacity INTEGER DEFAULT 0,
    available_spots INTEGER DEFAULT 0,
    price DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    booking_url VARCHAR(500),
    notes TEXT,
    last_sync TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(exhibition_id, date, time_slot)
);

CREATE TABLE reservation_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_reservation_id UUID NOT NULL REFERENCES user_reservations(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    experience_rating INTEGER CHECK (experience_rating >= 1 AND experience_rating <= 5),
    recommendation_score INTEGER CHECK (recommendation_score >= 1 AND recommendation_score <= 10),
    feedback_text TEXT,
    liked_aspects TEXT[],
    improvement_suggestions TEXT,
    would_visit_again BOOLEAN,
    would_recommend BOOLEAN,
    accessibility_rating INTEGER CHECK (accessibility_rating >= 1 AND accessibility_rating <= 5),
    value_for_money INTEGER CHECK (value_for_money >= 1 AND value_for_money <= 5),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for reservation system
CREATE INDEX idx_exhibition_reservations_exhibition ON exhibition_reservations(exhibition_id);
CREATE INDEX idx_exhibition_reservations_provider ON exhibition_reservations(provider_id);
CREATE INDEX idx_user_reservations_user ON user_reservations(user_id);
CREATE INDEX idx_user_reservations_exhibition ON user_reservations(exhibition_id);
CREATE INDEX idx_user_reservations_date ON user_reservations(visit_date);
CREATE INDEX idx_user_reservations_status ON user_reservations(reservation_status);
CREATE INDEX idx_reservation_reminders_scheduled ON reservation_reminders(scheduled_for);
CREATE INDEX idx_reservation_reminders_status ON reservation_reminders(status);
CREATE INDEX idx_exhibition_availability_exhibition ON exhibition_availability(exhibition_id);
CREATE INDEX idx_exhibition_availability_date ON exhibition_availability(date);
CREATE INDEX idx_reservation_feedback_reservation ON reservation_feedback(user_reservation_id);
-- Create OAuth accounts table
CREATE TABLE IF NOT EXISTS user_oauth_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  provider_id VARCHAR(255) NOT NULL,
  profile_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(provider, provider_id),
  UNIQUE(user_id, provider)
);

-- Create indexes for OAuth lookups
CREATE INDEX idx_oauth_provider_id ON user_oauth_accounts(provider, provider_id);
CREATE INDEX idx_oauth_user_id ON user_oauth_accounts(user_id);

-- Add OAuth-related columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS oauth_profile_image TEXT,
ADD COLUMN IF NOT EXISTS last_login_provider VARCHAR(50);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for OAuth accounts
DROP TRIGGER IF EXISTS update_user_oauth_accounts_updated_at ON user_oauth_accounts;
CREATE TRIGGER update_user_oauth_accounts_updated_at
    BEFORE UPDATE ON user_oauth_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();-- Add role column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';

-- Create index on role for performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Update any existing admin users (optional)
-- UPDATE users SET role = 'admin' WHERE email = 'admin@yourdomain.com';-- Community features migration
-- Run this after the main schema to add community tables

-- Community features
CREATE TABLE IF NOT EXISTS forums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    slug VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50) DEFAULT 'general',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS forum_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    forum_id UUID NOT NULL REFERENCES forums(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT false,
    is_locked BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    last_reply_at TIMESTAMPTZ DEFAULT NOW(),
    last_reply_user_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS forum_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID NOT NULL REFERENCES forum_topics(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_reply_id UUID REFERENCES forum_replies(id),
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    followed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CHECK(follower_id != following_id)
);

CREATE TABLE IF NOT EXISTS post_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES forum_topics(id) ON DELETE CASCADE,
    reply_id UUID REFERENCES forum_replies(id) ON DELETE CASCADE,
    liked_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK((topic_id IS NOT NULL AND reply_id IS NULL) OR (topic_id IS NULL AND reply_id IS NOT NULL))
);

CREATE TABLE IF NOT EXISTS user_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reported_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES forum_topics(id) ON DELETE CASCADE,
    reply_id UUID REFERENCES forum_replies(id) ON DELETE CASCADE,
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_type VARCHAR(50) NOT NULL,
    badge_name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(20) DEFAULT 'blue',
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, badge_type)
);

-- Community indexes for performance
CREATE INDEX IF NOT EXISTS idx_forum_topics_forum_id ON forum_topics(forum_id);
CREATE INDEX IF NOT EXISTS idx_forum_topics_user_id ON forum_topics(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_topics_last_reply ON forum_topics(last_reply_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_replies_topic_id ON forum_replies(topic_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_user_id ON forum_replies(user_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_topic ON post_likes(user_id, topic_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_reply ON post_likes(user_id, reply_id);

-- Insert default forums
INSERT INTO forums (name, description, slug, category) VALUES
('General Discussion', 'General conversations about art, culture, and aesthetic experiences', 'general-discussion', 'general'),
('Artwork Discoveries', 'Share and discuss interesting artworks you''ve discovered', 'artwork-discoveries', 'artwork'),
('Exhibition Reviews', 'Reviews and discussions about museum exhibitions', 'exhibition-reviews', 'exhibition'),
('Aesthetic Philosophy', 'Deep discussions about aesthetic theory and philosophy', 'aesthetic-philosophy', 'discussion'),
('Community Feedback', 'Suggestions and feedback for the SAYU platform', 'community-feedback', 'general')
ON CONFLICT (slug) DO NOTHING;-- Email logs table for tracking sent emails
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email_type VARCHAR(50) NOT NULL,
  template_name VARCHAR(100),
  subject TEXT,
  status VARCHAR(20) DEFAULT 'sent',
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT
);

-- Email preferences table for user preferences
CREATE TABLE IF NOT EXISTS email_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  welcome_series BOOLEAN DEFAULT true,
  weekly_insights BOOLEAN DEFAULT true,
  achievement_notifications BOOLEAN DEFAULT true,
  re_engagement BOOLEAN DEFAULT true,
  profile_reminders BOOLEAN DEFAULT true,
  curators_pick BOOLEAN DEFAULT true,
  marketing BOOLEAN DEFAULT false,
  frequency_preference VARCHAR(20) DEFAULT 'normal', -- 'minimal', 'normal', 'frequent'
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User artwork interactions for analytics
CREATE TABLE IF NOT EXISTS user_artwork_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  artwork_id VARCHAR(255) NOT NULL,
  interaction_type VARCHAR(50) NOT NULL, -- 'view', 'like', 'share', 'save'
  time_spent INTEGER DEFAULT 0, -- in seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Agent conversations for email insights
CREATE TABLE IF NOT EXISTS agent_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  conversation_id VARCHAR(255),
  message_count INTEGER DEFAULT 0,
  topics TEXT[], -- array of discussed topics
  sentiment VARCHAR(20), -- 'positive', 'neutral', 'negative'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Email verification tokens
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add email preferences column to users table if not exists
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email_preferences JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_type_date ON email_logs(email_type, sent_at);
CREATE INDEX IF NOT EXISTS idx_email_preferences_user_id ON email_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_artwork ON user_artwork_interactions(user_id, artwork_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_date ON user_artwork_interactions(created_at);
CREATE INDEX IF NOT EXISTS idx_agent_conversations_user_id ON agent_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_conversations_date ON agent_conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_email_verification_token ON email_verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login);
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to email_preferences table
DROP TRIGGER IF EXISTS update_email_preferences_updated_at ON email_preferences;
CREATE TRIGGER update_email_preferences_updated_at
    BEFORE UPDATE ON email_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default email preferences for existing users
INSERT INTO email_preferences (user_id)
SELECT id FROM users 
WHERE id NOT IN (SELECT user_id FROM email_preferences)
ON CONFLICT (user_id) DO NOTHING;-- Performance optimization indexes for SAYU platform
-- Run after main schema is applied

-- User profiles indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_type_code ON user_profiles(type_code);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON user_profiles(created_at DESC);

-- Quiz sessions indexes
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_id ON quiz_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_type ON quiz_sessions(session_type);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_started_at ON quiz_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_completed_at ON quiz_sessions(completed_at DESC);

-- Forum performance indexes
CREATE INDEX IF NOT EXISTS idx_forum_topics_forum_id ON forum_topics(forum_id);
CREATE INDEX IF NOT EXISTS idx_forum_topics_user_id ON forum_topics(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_topics_created_at ON forum_topics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_topics_last_reply_at ON forum_topics(last_reply_at DESC);

CREATE INDEX IF NOT EXISTS idx_forum_replies_topic_id ON forum_replies(topic_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_user_id ON forum_replies(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_created_at ON forum_replies(created_at DESC);

-- Achievements indexes
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_earned_at ON user_achievements(earned_at DESC);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_interaction_type ON user_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_user_interactions_created_at ON user_interactions(created_at DESC);

-- Reservations indexes
CREATE INDEX IF NOT EXISTS idx_user_reservations_user_id ON user_reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_reservations_exhibition_id ON user_reservations(exhibition_id);
CREATE INDEX IF NOT EXISTS idx_user_reservations_visit_date ON user_reservations(visit_date);
CREATE INDEX IF NOT EXISTS idx_user_reservations_status ON user_reservations(status);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_type ON quiz_sessions(user_id, session_type);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_earned ON user_achievements(user_id, earned_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_topics_forum_last_reply ON forum_topics(forum_id, last_reply_at DESC);

-- Email verification index
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);

-- JSONB indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_exhibition_scores ON user_profiles USING GIN (exhibition_scores);
CREATE INDEX IF NOT EXISTS idx_user_profiles_artwork_scores ON user_profiles USING GIN (artwork_scores);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_responses ON quiz_sessions USING GIN (responses);