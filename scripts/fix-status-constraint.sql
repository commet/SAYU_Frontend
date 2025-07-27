-- Remove status check constraint to allow all values
ALTER TABLE exhibitions DROP CONSTRAINT IF EXISTS exhibitions_status_check;