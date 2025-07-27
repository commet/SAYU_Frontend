CREATE TABLE IF NOT EXISTS artist_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  artist_name VARCHAR(200) NOT NULL,
  bio TEXT,
  website_url VARCHAR(500),
  social_links JSONB DEFAULT '{}'::jsonb,
  contact_email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  specialties TEXT[] DEFAULT '{}'::text[],
  profile_image_url VARCHAR(500),
  banner_image_url VARCHAR(500),
  status VARCHAR(20) DEFAULT 'pending'::character varying,
  verified BOOLEAN DEFAULT false,
  created_at timestamp with time zone DEFAULT NOW(),
  updated_at timestamp with time zone DEFAULT NOW()
);