-- Remove venue type check constraint to allow all venue types
ALTER TABLE venues DROP CONSTRAINT IF EXISTS venues_type_check;