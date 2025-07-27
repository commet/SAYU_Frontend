-- Create additional missing tables for data migration

-- artist_profiles table
CREATE TABLE IF NOT EXISTS artist_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  profile_data JSONB,
  social_media JSONB,
  exhibitions_count INTEGER DEFAULT 0,
  followers_count INTEGER DEFAULT 0,
  verification_status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- artist_apt_mappings table
CREATE TABLE IF NOT EXISTS artist_apt_mappings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  apt_type VARCHAR(50),
  confidence_score DECIMAL(3,2),
  mapping_source VARCHAR(100),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- artvee_artist_mappings table
CREATE TABLE IF NOT EXISTS artvee_artist_mappings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artvee_artist_name VARCHAR(300),
  mapped_artist_id UUID REFERENCES artists(id),
  confidence_score DECIMAL(3,2),
  mapping_method VARCHAR(100),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- artvee_artwork_artists table
CREATE TABLE IF NOT EXISTS artvee_artwork_artists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artwork_id UUID REFERENCES artvee_artworks(id) ON DELETE CASCADE,
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  role VARCHAR(100) DEFAULT 'creator',
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- city_translations table
CREATE TABLE IF NOT EXISTS city_translations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  city_name VARCHAR(200) NOT NULL,
  country VARCHAR(100),
  translations JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- institutions table
CREATE TABLE IF NOT EXISTS institutions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(300) NOT NULL,
  type VARCHAR(100),
  country VARCHAR(100),
  website TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- importance_tiers table
CREATE TABLE IF NOT EXISTS importance_tiers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tier_name VARCHAR(100) NOT NULL,
  tier_level INTEGER,
  description TEXT,
  criteria JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- journey_nudges table
CREATE TABLE IF NOT EXISTS journey_nudges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT,
  target_audience JSONB,
  trigger_conditions JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- journey_templates table
CREATE TABLE IF NOT EXISTS journey_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  template_data JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- titles table
CREATE TABLE IF NOT EXISTS titles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title_name VARCHAR(200) NOT NULL,
  description TEXT,
  requirements JSONB,
  rewards JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- waitlists table
CREATE TABLE IF NOT EXISTS waitlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(200),
  interests JSONB,
  source VARCHAR(100),
  status VARCHAR(50) DEFAULT 'active',
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE artist_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_apt_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE artvee_artist_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE artvee_artwork_artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE city_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE importance_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_nudges ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlists ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies for read access
CREATE POLICY "Enable read access for all users" ON artist_profiles FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON artist_apt_mappings FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON artvee_artist_mappings FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON artvee_artwork_artists FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON city_translations FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON institutions FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON importance_tiers FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON journey_nudges FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON journey_templates FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON titles FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON waitlists FOR SELECT USING (true);