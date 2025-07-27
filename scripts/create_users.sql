CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  username VARCHAR(50),
  password_hash VARCHAR(255),
  personality_type VARCHAR(10),
  is_premium BOOLEAN DEFAULT false,
  profile_image TEXT,
  created_at timestamp with time zone DEFAULT NOW(),
  updated_at timestamp with time zone DEFAULT NOW(),
  subscription_type VARCHAR(50) DEFAULT 'free'::character varying,
  subscription_start_date timestamp with time zone,
  subscription_end_date timestamp with time zone,
  subscription_status VARCHAR(20) DEFAULT 'inactive'::character varying,
  user_purpose VARCHAR(50) DEFAULT 'exploring'::character varying,
  pioneer_number INTEGER
);