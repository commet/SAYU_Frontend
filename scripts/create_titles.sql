CREATE TABLE IF NOT EXISTS titles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  name_ko VARCHAR(100) NOT NULL,
  description TEXT,
  description_ko TEXT,
  icon VARCHAR(10),
  rarity VARCHAR(20) DEFAULT 'common'::character varying,
  sort_order INTEGER DEFAULT 0
);