CREATE TABLE IF NOT EXISTS city_translations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  country VARCHAR(100) NOT NULL,
  city_original VARCHAR(100) NOT NULL,
  city_ko VARCHAR(100),
  city_en VARCHAR(100),
  city_ja VARCHAR(100),
  city_zh VARCHAR(100),
  province VARCHAR(100),
  province_ko VARCHAR(100),
  province_en VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);