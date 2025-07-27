-- Fix venue_name constraint to allow NULL values
ALTER TABLE exhibitions ALTER COLUMN venue_name DROP NOT NULL;