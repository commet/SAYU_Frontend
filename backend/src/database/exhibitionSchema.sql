-- Exhibition System Database Schema

-- Create enum types
CREATE TYPE venue_type AS ENUM ('museum', 'gallery', 'alternative_space', 'art_center', 'fair_venue');
CREATE TYPE venue_tier AS ENUM ('1', '2', '3');
CREATE TYPE exhibition_type AS ENUM ('solo', 'group', 'collection', 'special', 'fair');
CREATE TYPE exhibition_status AS ENUM ('draft', 'upcoming', 'ongoing', 'ended', 'cancelled');
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE submission_verification_status AS ENUM ('pending', 'reviewing', 'approved', 'rejected', 'duplicate');
CREATE TYPE submission_source AS ENUM ('web', 'mobile', 'kakao', 'email', 'api');
CREATE TYPE exhibition_source AS ENUM ('manual', 'naver', 'scraping', 'user_submission', 'api', 'instagram');
CREATE TYPE crawl_frequency AS ENUM ('daily', 'twice_weekly', 'weekly', 'manual');
CREATE TYPE submitter_type AS ENUM ('user', 'artist', 'gallery', 'anonymous');

-- Create Venues table
CREATE TABLE IF NOT EXISTS venues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    name_en VARCHAR(255),
    type venue_type NOT NULL,
    tier venue_tier DEFAULT '2',
    
    -- Location
    address VARCHAR(500) NOT NULL,
    address_detail VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    region VARCHAR(100),
    country VARCHAR(2) NOT NULL DEFAULT 'KR',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Contact
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(500),
    instagram VARCHAR(100),
    facebook VARCHAR(100),
    
    -- Operating info
    operating_hours JSONB DEFAULT '{}',
    closed_days JSONB DEFAULT '[]',
    features JSONB DEFAULT '[]',
    
    -- Images
    logo_image VARCHAR(500),
    cover_image VARCHAR(500),
    images JSONB DEFAULT '[]',
    
    -- Description
    description TEXT,
    description_en TEXT,
    
    -- Crawling info
    crawl_url VARCHAR(500),
    crawl_selector JSONB DEFAULT '{}',
    last_crawled_at TIMESTAMP,
    crawl_frequency crawl_frequency DEFAULT 'weekly',
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_premium BOOLEAN DEFAULT false,
    
    -- Statistics
    exhibition_count INTEGER DEFAULT 0,
    follower_count INTEGER DEFAULT 0,
    average_rating DECIMAL(3, 2) DEFAULT 0,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Exhibitions table
CREATE TABLE IF NOT EXISTS exhibitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    title_en VARCHAR(500),
    description TEXT,
    
    -- Venue info
    venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    venue_name VARCHAR(255) NOT NULL,
    venue_city VARCHAR(100) NOT NULL,
    venue_country VARCHAR(2) NOT NULL DEFAULT 'KR',
    
    -- Dates
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    opening_date TIMESTAMP,
    opening_time VARCHAR(50),
    
    -- Artists
    artists JSONB DEFAULT '[]',
    type exhibition_type DEFAULT 'group',
    
    -- Images
    poster_image VARCHAR(500),
    images JSONB DEFAULT '[]',
    
    -- Links
    official_url VARCHAR(500),
    ticket_url VARCHAR(500),
    
    -- Pricing
    admission_fee INTEGER DEFAULT 0,
    admission_note VARCHAR(255),
    
    -- Source
    source exhibition_source DEFAULT 'manual',
    source_url VARCHAR(500),
    submitted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Verification
    verification_status verification_status DEFAULT 'pending',
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMP,
    
    -- Metadata
    tags JSONB DEFAULT '[]',
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    status exhibition_status DEFAULT 'upcoming',
    featured BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Exhibition Submissions table
CREATE TABLE IF NOT EXISTS exhibition_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Submitter info
    submitter_id UUID REFERENCES users(id) ON DELETE SET NULL,
    submitter_type submitter_type DEFAULT 'user',
    submitter_email VARCHAR(255) NOT NULL,
    submitter_name VARCHAR(100),
    submitter_phone VARCHAR(50),
    
    -- Exhibition info
    exhibition_title VARCHAR(500) NOT NULL,
    venue_name VARCHAR(255) NOT NULL,
    venue_address VARCHAR(500),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    artists TEXT,
    description TEXT,
    
    -- Links and images
    official_url VARCHAR(500),
    poster_image_url VARCHAR(500),
    uploaded_images JSONB DEFAULT '[]',
    
    -- Additional info
    admission_fee VARCHAR(100),
    opening_event JSONB,
    
    -- Verification
    verification_status submission_verification_status DEFAULT 'pending',
    verification_note TEXT,
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMP,
    
    -- Converted exhibition
    exhibition_id UUID REFERENCES exhibitions(id) ON DELETE SET NULL,
    
    -- Rewards
    points_awarded INTEGER DEFAULT 0,
    
    -- Metadata
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    source submission_source DEFAULT 'web',
    spam_score DECIMAL(3, 2) DEFAULT 0,
    duplicate_checksum VARCHAR(32),
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_venues_city_country ON venues(city, country);
CREATE INDEX idx_venues_type ON venues(type);
CREATE INDEX idx_venues_tier ON venues(tier);
CREATE INDEX idx_venues_is_active ON venues(is_active);

CREATE INDEX idx_exhibitions_venue_id ON exhibitions(venue_id);
CREATE INDEX idx_exhibitions_start_date ON exhibitions(start_date);
CREATE INDEX idx_exhibitions_end_date ON exhibitions(end_date);
CREATE INDEX idx_exhibitions_status ON exhibitions(status);
CREATE INDEX idx_exhibitions_verification_status ON exhibitions(verification_status);
CREATE INDEX idx_exhibitions_submitted_by ON exhibitions(submitted_by);
CREATE INDEX idx_exhibitions_venue_city_country ON exhibitions(venue_city, venue_country);

CREATE INDEX idx_submissions_submitter_id ON exhibition_submissions(submitter_id);
CREATE INDEX idx_submissions_verification_status ON exhibition_submissions(verification_status);
CREATE INDEX idx_submissions_exhibition_id ON exhibition_submissions(exhibition_id);
CREATE INDEX idx_submissions_created_at ON exhibition_submissions(created_at);
CREATE INDEX idx_submissions_duplicate_checksum ON exhibition_submissions(duplicate_checksum);

-- Create update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_venues_updated_at BEFORE UPDATE ON venues
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_exhibitions_updated_at BEFORE UPDATE ON exhibitions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON exhibition_submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();