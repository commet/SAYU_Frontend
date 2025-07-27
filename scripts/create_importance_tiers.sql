CREATE TABLE IF NOT EXISTS importance_tiers (
  tier INTEGER NOT NULL,
  name VARCHAR(50),
  score_range VARCHAR(20),
  description TEXT
);