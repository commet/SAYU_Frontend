-- Artists table to store artist information
CREATE TABLE IF NOT EXISTS artists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    name_ko VARCHAR(255),
    birth_year INTEGER,
    death_year INTEGER,
    nationality VARCHAR(100),
    nationality_ko VARCHAR(100),
    bio TEXT,
    bio_ko TEXT,
    copyright_status VARCHAR(50) NOT NULL DEFAULT 'unknown',
    follow_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    era VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- JSON fields for complex data
    images JSONB DEFAULT '{}',
    sources JSONB DEFAULT '{}',
    license_info JSONB DEFAULT '{}',
    official_links JSONB DEFAULT '{}',
    representation JSONB DEFAULT '{}',
    recent_exhibitions JSONB DEFAULT '[]',
    media_links JSONB DEFAULT '{}',
    
    -- Verification fields
    is_verified BOOLEAN DEFAULT false,
    verification_date TIMESTAMP,
    verification_method VARCHAR(50),
    
    -- Artist-managed profiles
    artist_managed JSONB DEFAULT '{}',
    permissions JSONB DEFAULT '{}',
    purchase_links JSONB DEFAULT '{}'
);

-- Artist follows table for user-artist relationships
CREATE TABLE IF NOT EXISTS artist_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    followed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, artist_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_artists_name ON artists(name);
CREATE INDEX IF NOT EXISTS idx_artists_nationality ON artists(nationality);
CREATE INDEX IF NOT EXISTS idx_artists_copyright_status ON artists(copyright_status);
CREATE INDEX IF NOT EXISTS idx_artists_birth_year ON artists(birth_year);
CREATE INDEX IF NOT EXISTS idx_artists_follow_count ON artists(follow_count);
CREATE INDEX IF NOT EXISTS idx_artists_is_featured ON artists(is_featured);
CREATE INDEX IF NOT EXISTS idx_artists_created_at ON artists(created_at);

CREATE INDEX IF NOT EXISTS idx_artist_follows_user_id ON artist_follows(user_id);
CREATE INDEX IF NOT EXISTS idx_artist_follows_artist_id ON artist_follows(artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_follows_followed_at ON artist_follows(followed_at);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_artists_search ON artists USING gin(
    to_tsvector('english', name || ' ' || COALESCE(bio, ''))
);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_artists_updated_at
    BEFORE UPDATE ON artists
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();