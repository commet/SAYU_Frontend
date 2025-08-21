-- Create exhibition_visits table for storing user visit records
CREATE TABLE IF NOT EXISTS exhibition_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    exhibition_id VARCHAR(255),
    exhibition_title VARCHAR(500) NOT NULL,
    museum VARCHAR(500) NOT NULL,
    visit_date DATE NOT NULL,
    duration INTEGER DEFAULT 0, -- in minutes
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    notes TEXT,
    artworks JSONB DEFAULT '[]'::jsonb, -- Array of artwork objects with liked status
    photos JSONB DEFAULT '[]'::jsonb, -- Array of photo URLs/IDs
    badges JSONB DEFAULT '[]'::jsonb, -- Array of badge names/IDs earned from this visit
    points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraints (assuming users table exists)
    CONSTRAINT fk_exhibition_visits_user 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_exhibition_visits_user_id ON exhibition_visits(user_id);
CREATE INDEX IF NOT EXISTS idx_exhibition_visits_visit_date ON exhibition_visits(visit_date);
CREATE INDEX IF NOT EXISTS idx_exhibition_visits_museum ON exhibition_visits(museum);
CREATE INDEX IF NOT EXISTS idx_exhibition_visits_rating ON exhibition_visits(rating);
CREATE INDEX IF NOT EXISTS idx_exhibition_visits_created_at ON exhibition_visits(created_at);

-- Create a composite index for user visits ordered by date
CREATE INDEX IF NOT EXISTS idx_exhibition_visits_user_date ON exhibition_visits(user_id, visit_date DESC);

-- Add trigger for automatic updated_at timestamp
CREATE OR REPLACE FUNCTION update_exhibition_visits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_exhibition_visits_updated_at
    BEFORE UPDATE ON exhibition_visits
    FOR EACH ROW
    EXECUTE FUNCTION update_exhibition_visits_updated_at();

-- Add comments for documentation
COMMENT ON TABLE exhibition_visits IS 'Stores user exhibition visit records and experiences';
COMMENT ON COLUMN exhibition_visits.exhibition_id IS 'Optional external exhibition identifier';
COMMENT ON COLUMN exhibition_visits.exhibition_title IS 'Name of the exhibition visited';
COMMENT ON COLUMN exhibition_visits.museum IS 'Museum or gallery name';
COMMENT ON COLUMN exhibition_visits.visit_date IS 'Date when the visit occurred';
COMMENT ON COLUMN exhibition_visits.duration IS 'Visit duration in minutes';
COMMENT ON COLUMN exhibition_visits.rating IS 'User rating from 1 to 5 stars';
COMMENT ON COLUMN exhibition_visits.notes IS 'User notes and impressions about the visit';
COMMENT ON COLUMN exhibition_visits.artworks IS 'JSON array of artworks with liked status and details';
COMMENT ON COLUMN exhibition_visits.photos IS 'JSON array of photo URLs or identifiers from the visit';
COMMENT ON COLUMN exhibition_visits.badges IS 'JSON array of badges earned from this visit';
COMMENT ON COLUMN exhibition_visits.points IS 'Points earned from this visit';