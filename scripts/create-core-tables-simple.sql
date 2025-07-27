-- Create core missing tables (simplified)

-- Drop foreign key constraints temporarily
CREATE TABLE IF NOT EXISTS artist_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id INTEGER,
  profile_data JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS artist_apt_mappings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id INTEGER,
  apt_type VARCHAR(50),
  confidence_score DECIMAL(3,2),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS artvee_artist_mappings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artvee_artist_name VARCHAR(300),
  mapped_artist_id INTEGER,
  confidence_score DECIMAL(3,2),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS artvee_artwork_artists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artwork_id INTEGER,
  artist_id INTEGER,
  role VARCHAR(100),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE artist_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_apt_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE artvee_artist_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE artvee_artwork_artists ENABLE ROW LEVEL SECURITY;

-- Basic policies
CREATE POLICY "Enable read access" ON artist_profiles FOR SELECT USING (true);
CREATE POLICY "Enable read access" ON artist_apt_mappings FOR SELECT USING (true);
CREATE POLICY "Enable read access" ON artvee_artist_mappings FOR SELECT USING (true);
CREATE POLICY "Enable read access" ON artvee_artwork_artists FOR SELECT USING (true);