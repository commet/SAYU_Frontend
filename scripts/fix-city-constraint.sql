-- Remove city NOT NULL constraint in venues table
ALTER TABLE venues ALTER COLUMN city DROP NOT NULL;