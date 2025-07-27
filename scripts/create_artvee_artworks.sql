CREATE TABLE IF NOT EXISTS artvee_artworks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artvee_id VARCHAR(255) NOT NULL,
  title VARCHAR(500) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  artist_slug VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  full_image_url TEXT,
  sayu_type VARCHAR(10) NOT NULL,
  personality_tags TEXT[] DEFAULT ARRAY[]::text[],
  emotion_tags TEXT[] DEFAULT ARRAY[]::text[],
  usage_tags TEXT[] DEFAULT ARRAY[]::text[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);