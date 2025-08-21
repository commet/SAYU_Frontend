-- ====================================
-- SAYU Exhibition Visits Table Creation
-- ====================================
-- Execute this SQL in your Supabase Dashboard → SQL Editor

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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_exhibition_visits_user_id ON exhibition_visits(user_id);
CREATE INDEX IF NOT EXISTS idx_exhibition_visits_visit_date ON exhibition_visits(visit_date);
CREATE INDEX IF NOT EXISTS idx_exhibition_visits_museum ON exhibition_visits(museum);
CREATE INDEX IF NOT EXISTS idx_exhibition_visits_rating ON exhibition_visits(rating);
CREATE INDEX IF NOT EXISTS idx_exhibition_visits_created_at ON exhibition_visits(created_at);
CREATE INDEX IF NOT EXISTS idx_exhibition_visits_user_date ON exhibition_visits(user_id, visit_date DESC);

-- Add trigger for automatic updated_at timestamp
CREATE OR REPLACE FUNCTION update_exhibition_visits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_exhibition_visits_updated_at ON exhibition_visits;
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

-- Enable Row Level Security (RLS)
ALTER TABLE exhibition_visits ENABLE ROW LEVEL SECURITY;

-- Create RLS policy: Users can only access their own visit records
CREATE POLICY "Users can view own visits" ON exhibition_visits
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own visits" ON exhibition_visits
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own visits" ON exhibition_visits
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own visits" ON exhibition_visits
    FOR DELETE USING (auth.uid() = user_id);

-- Test data (optional - remove after testing)
-- INSERT INTO exhibition_visits (
--     user_id,
--     exhibition_title,
--     museum,
--     visit_date,
--     duration,
--     rating,
--     notes,
--     artworks,
--     points
-- ) VALUES (
--     (SELECT id FROM auth.users LIMIT 1), -- Uses first user
--     '테스트 전시',
--     '테스트 미술관',
--     '2025-01-20',
--     90,
--     5,
--     'API 테스트를 위한 샘플 기록입니다.',
--     '[{"id": "artwork1", "title": "테스트 작품", "artist": "테스트 작가", "liked": true}]'::jsonb,
--     120
-- );

-- Verify table creation
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable 
FROM information_schema.columns 
WHERE table_name = 'exhibition_visits' 
ORDER BY ordinal_position;