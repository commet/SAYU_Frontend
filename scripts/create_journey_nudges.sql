CREATE TABLE IF NOT EXISTS journey_nudges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  day_number INTEGER NOT NULL,
  nudge_type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  cta_text VARCHAR(100),
  cta_link VARCHAR(500),
  sent_at timestamp with time zone,
  viewed_at timestamp with time zone,
  clicked_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT NOW()
);