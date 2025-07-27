CREATE TABLE IF NOT EXISTS artvee_artwork_artists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artwork_id INTEGER,
  artist_id UUID,
  role VARCHAR(100) DEFAULT 'artist'::character varying,
  is_primary BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);