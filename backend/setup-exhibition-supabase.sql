-- SAYU Exhibition System - Supabase Schema
-- Run this in Supabase SQL Editor

-- 1. Create venues table
CREATE TABLE IF NOT EXISTS venues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    name_en VARCHAR(255),
    type VARCHAR(50) CHECK (type IN ('museum', 'gallery', 'alternative_space', 'art_center', 'fair_venue')),
    tier VARCHAR(1) CHECK (tier IN ('1', '2', '3')) DEFAULT '2',
    city VARCHAR(100) NOT NULL,
    country VARCHAR(2) DEFAULT 'KR',
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(500),
    instagram VARCHAR(100),
    operating_hours JSONB DEFAULT '{}',
    features JSONB DEFAULT '[]',
    logo_image VARCHAR(500),
    cover_image VARCHAR(500),
    description TEXT,
    description_en TEXT,
    is_active BOOLEAN DEFAULT true,
    follower_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create exhibitions table
CREATE TABLE IF NOT EXISTS exhibitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    title_en VARCHAR(500),
    description TEXT,
    venue_name VARCHAR(255) NOT NULL,
    venue_city VARCHAR(100) NOT NULL,
    venue_country VARCHAR(2) DEFAULT 'KR',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    artists JSONB DEFAULT '[]',
    type VARCHAR(20) CHECK (type IN ('solo', 'group', 'collection', 'special', 'fair')) DEFAULT 'group',
    poster_image VARCHAR(500),
    images JSONB DEFAULT '[]',
    official_url VARCHAR(500),
    ticket_url VARCHAR(500),
    admission_fee INTEGER DEFAULT 0,
    admission_note VARCHAR(255),
    source VARCHAR(50) DEFAULT 'manual',
    source_url VARCHAR(500),
    submitted_by UUID,
    verification_status VARCHAR(20) DEFAULT 'pending',
    verified_by UUID,
    verified_at TIMESTAMP WITH TIME ZONE,
    tags JSONB DEFAULT '[]',
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    status VARCHAR(20) CHECK (status IN ('draft', 'upcoming', 'ongoing', 'ended', 'cancelled')) DEFAULT 'upcoming',
    featured BOOLEAN DEFAULT false,
    opening_date TIMESTAMP WITH TIME ZONE,
    opening_time VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create exhibition_submissions table
CREATE TABLE IF NOT EXISTS exhibition_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    exhibition_data JSONB NOT NULL,
    status VARCHAR(20) CHECK (status IN ('pending', 'reviewing', 'approved', 'rejected', 'duplicate')) DEFAULT 'pending',
    review_note TEXT,
    reviewed_by UUID,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    exhibition_id UUID REFERENCES exhibitions(id) ON DELETE SET NULL,
    points_awarded INTEGER DEFAULT 0,
    source VARCHAR(20) DEFAULT 'web',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create exhibition_likes table
CREATE TABLE IF NOT EXISTS exhibition_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exhibition_id UUID REFERENCES exhibitions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(exhibition_id, user_id)
);

-- 5. Create exhibition_views table
CREATE TABLE IF NOT EXISTS exhibition_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exhibition_id UUID REFERENCES exhibitions(id) ON DELETE CASCADE,
    user_id UUID,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create indexes
CREATE INDEX idx_venues_city_country ON venues(city, country);
CREATE INDEX idx_venues_type ON venues(type);
CREATE INDEX idx_venues_is_active ON venues(is_active);

CREATE INDEX idx_exhibitions_venue_id ON exhibitions(venue_id);
CREATE INDEX idx_exhibitions_dates ON exhibitions(start_date, end_date);
CREATE INDEX idx_exhibitions_status ON exhibitions(status);
CREATE INDEX idx_exhibitions_verification ON exhibitions(verification_status);
CREATE INDEX idx_exhibitions_featured ON exhibitions(featured);

CREATE INDEX idx_submissions_user_id ON exhibition_submissions(user_id);
CREATE INDEX idx_submissions_status ON exhibition_submissions(status);

CREATE INDEX idx_likes_exhibition ON exhibition_likes(exhibition_id);
CREATE INDEX idx_likes_user ON exhibition_likes(user_id);

CREATE INDEX idx_views_exhibition ON exhibition_views(exhibition_id);
CREATE INDEX idx_views_created ON exhibition_views(created_at);

-- 7. Enable Row Level Security
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibition_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibition_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibition_views ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS Policies

-- Venues: Public read
CREATE POLICY "Public can view venues" ON venues
    FOR SELECT USING (is_active = true);

-- Exhibitions: Public read for verified
CREATE POLICY "Public can view verified exhibitions" ON exhibitions
    FOR SELECT USING (verification_status = 'verified');

-- Admin can manage exhibitions
CREATE POLICY "Admins can manage exhibitions" ON exhibitions
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM auth.users 
            WHERE raw_user_meta_data->>'role' IN ('admin', 'moderator')
        )
    );

-- Exhibition submissions: Users can create
CREATE POLICY "Authenticated users can submit exhibitions" ON exhibition_submissions
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Users can view own submissions
CREATE POLICY "Users can view own submissions" ON exhibition_submissions
    FOR SELECT USING (auth.uid() = user_id);

-- Exhibition likes: Authenticated users can like
CREATE POLICY "Authenticated users can like exhibitions" ON exhibition_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view all likes" ON exhibition_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can unlike own likes" ON exhibition_likes
    FOR DELETE USING (auth.uid() = user_id);

-- Exhibition views: Anyone can log views
CREATE POLICY "Anyone can log views" ON exhibition_views
    FOR INSERT WITH CHECK (true);

-- 9. Create functions for automatic updates

-- Update exhibition status based on dates
CREATE OR REPLACE FUNCTION update_exhibition_status()
RETURNS void AS $$
BEGIN
    -- Mark as ended
    UPDATE exhibitions 
    SET status = 'ended', updated_at = NOW()
    WHERE end_date < CURRENT_DATE 
    AND status != 'ended';
    
    -- Mark as ongoing
    UPDATE exhibitions 
    SET status = 'ongoing', updated_at = NOW()
    WHERE start_date <= CURRENT_DATE 
    AND end_date >= CURRENT_DATE 
    AND status NOT IN ('ongoing', 'cancelled');
    
    -- Mark as upcoming
    UPDATE exhibitions 
    SET status = 'upcoming', updated_at = NOW()
    WHERE start_date > CURRENT_DATE 
    AND status NOT IN ('upcoming', 'cancelled');
END;
$$ LANGUAGE plpgsql;

-- Increment view count
CREATE OR REPLACE FUNCTION increment_view_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE exhibitions 
    SET view_count = view_count + 1 
    WHERE id = NEW.exhibition_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_exhibition_views
AFTER INSERT ON exhibition_views
FOR EACH ROW EXECUTE FUNCTION increment_view_count();

-- Update like count
CREATE OR REPLACE FUNCTION update_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE exhibitions 
        SET like_count = like_count + 1 
        WHERE id = NEW.exhibition_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE exhibitions 
        SET like_count = like_count - 1 
        WHERE id = OLD.exhibition_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_exhibition_likes
AFTER INSERT OR DELETE ON exhibition_likes
FOR EACH ROW EXECUTE FUNCTION update_like_count();

-- 10. Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_venues_updated_at
BEFORE UPDATE ON venues
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_exhibitions_updated_at
BEFORE UPDATE ON exhibitions
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_submissions_updated_at
BEFORE UPDATE ON exhibition_submissions
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 11. Create cron job for status updates (requires pg_cron extension)
-- Run this if pg_cron is enabled in Supabase
-- SELECT cron.schedule('update-exhibition-status', '0 0 * * *', 'SELECT update_exhibition_status()');

COMMENT ON TABLE venues IS 'Art venues including museums, galleries, and art centers';
COMMENT ON TABLE exhibitions IS 'Exhibition information with verification status';
COMMENT ON TABLE exhibition_submissions IS 'User-submitted exhibition information pending review';
COMMENT ON TABLE exhibition_likes IS 'User likes for exhibitions';
COMMENT ON TABLE exhibition_views IS 'Exhibition view tracking';