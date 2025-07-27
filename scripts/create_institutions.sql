CREATE TABLE IF NOT EXISTS institutions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name_en VARCHAR(200) NOT NULL,
  name_local VARCHAR(200),
  type VARCHAR(50) DEFAULT 'museum'::character varying,
  category VARCHAR(50) DEFAULT 'public'::character varying,
  country VARCHAR(100),
  city VARCHAR(100),
  address TEXT,
  coordinates point,
  website VARCHAR(500),
  email VARCHAR(200),
  phone VARCHAR(50),
  opening_hours JSONB DEFAULT '{}'::jsonb,
  description TEXT,
  created_at timestamp with time zone DEFAULT NOW(),
  updated_at timestamp with time zone DEFAULT NOW()
);