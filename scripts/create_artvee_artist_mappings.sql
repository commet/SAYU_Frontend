CREATE TABLE IF NOT EXISTS artvee_artist_mappings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artvee_artist VARCHAR(255) NOT NULL,
  artist_id UUID,
  confidence_score double precision NOT NULL,
  mapping_method VARCHAR(50) NOT NULL,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);