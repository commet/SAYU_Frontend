-- Create missing critical tables in Supabase

-- 1. Artists table
CREATE TABLE IF NOT EXISTS artists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(300) NOT NULL,
  name_en VARCHAR(300),
  birth_year INTEGER,
  death_year INTEGER,
  nationality VARCHAR(100),
  bio TEXT,
  style VARCHAR(100),
  movement VARCHAR(100),
  website TEXT,
  image_url TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Global venues table
CREATE TABLE IF NOT EXISTS global_venues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(300) NOT NULL,
  name_en VARCHAR(300),
  city VARCHAR(100),
  country VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  type VARCHAR(100),
  website TEXT,
  metadata JSONB,
  railway_id INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Artvee artworks table
CREATE TABLE IF NOT EXISTS artvee_artworks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  artist VARCHAR(300),
  year INTEGER,
  medium VARCHAR(200),
  description TEXT,
  image_url TEXT,
  source_url TEXT,
  tags TEXT[],
  metadata JSONB,
  railway_id INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. APT profiles table (if not exists)
CREATE TABLE IF NOT EXISTS apt_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  profile_data JSONB,
  animal_type VARCHAR(50),
  mbti_type VARCHAR(4),
  traits JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE artvee_artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE apt_profiles ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies
CREATE POLICY "Enable read access for all users" ON artists FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON global_venues FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON artvee_artworks FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON apt_profiles FOR SELECT USING (true);