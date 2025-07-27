CREATE TABLE IF NOT EXISTS journey_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  day_number INTEGER NOT NULL,
  nudge_type VARCHAR(50) NOT NULL,
  title_ko VARCHAR(200) NOT NULL,
  title_en VARCHAR(200) NOT NULL,
  message_ko TEXT NOT NULL,
  message_en TEXT NOT NULL,
  cta_text_ko VARCHAR(100),
  cta_text_en VARCHAR(100),
  cta_link VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at timestamp with time zone DEFAULT NOW()
);