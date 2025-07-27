CREATE TABLE IF NOT EXISTS apt_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID NOT NULL,
  primary_apt VARCHAR(4) NOT NULL,
  secondary_apt VARCHAR(4),
  tertiary_apt VARCHAR(4),
  matching_reasoning TEXT,
  confidence_score DECIMAL DEFAULT 0.5,
  data_sources JSONB DEFAULT '{}'::jsonb,
  classification_method VARCHAR(50) DEFAULT 'manual'::character varying,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);