-- Add missing artist column to exhibitions table
ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS artist VARCHAR(300);