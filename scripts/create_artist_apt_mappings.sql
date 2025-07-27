CREATE TABLE IF NOT EXISTS artist_apt_mappings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID,
  mapping_method VARCHAR(50) NOT NULL,
  apt_profile JSONB NOT NULL,
  confidence_score DECIMAL,
  mapped_by VARCHAR(100),
  mapping_notes TEXT,
  created_at timestamp with time zone DEFAULT NOW(),
  updated_at timestamp with time zone DEFAULT NOW()
);