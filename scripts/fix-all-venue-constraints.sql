-- Fix all venue-related NOT NULL constraints in exhibitions table
ALTER TABLE exhibitions ALTER COLUMN venue_name DROP NOT NULL;
ALTER TABLE exhibitions ALTER COLUMN venue_city DROP NOT NULL;
ALTER TABLE exhibitions ALTER COLUMN venue_country DROP NOT NULL;
ALTER TABLE exhibitions ALTER COLUMN venue_address DROP NOT NULL;