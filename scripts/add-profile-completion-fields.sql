-- Add profile completion fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS gender VARCHAR(20),
ADD COLUMN IF NOT EXISTS age_group VARCHAR(20),
ADD COLUMN IF NOT EXISTS region VARCHAR(100),
ADD COLUMN IF NOT EXISTS viewing_styles TEXT[],
ADD COLUMN IF NOT EXISTS profile_completed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS profile_completion_version INTEGER DEFAULT 1;

-- Update the updated_at column to have a default value
ALTER TABLE profiles 
ALTER COLUMN updated_at SET DEFAULT NOW();

-- Create index for faster profile completion queries
CREATE INDEX IF NOT EXISTS idx_profiles_completion ON profiles(profile_completed_at) WHERE profile_completed_at IS NOT NULL;

-- Add constraints for gender and age_group
ALTER TABLE profiles 
ADD CONSTRAINT check_gender CHECK (gender IN ('male', 'female', 'non_binary', 'prefer_not_to_say'));

ALTER TABLE profiles 
ADD CONSTRAINT check_age_group CHECK (age_group IN ('teens', '20s', '30s', '40s', '50s', '60_plus', 'prefer_not_to_say'));

COMMENT ON COLUMN profiles.gender IS 'User gender selection for profile completion';
COMMENT ON COLUMN profiles.age_group IS 'User age group selection for profile completion';
COMMENT ON COLUMN profiles.region IS 'User region/location for personalized recommendations';
COMMENT ON COLUMN profiles.viewing_styles IS 'Array of user preferred art viewing styles';
COMMENT ON COLUMN profiles.profile_completed_at IS 'Timestamp when user completed their profile';
COMMENT ON COLUMN profiles.profile_completion_version IS 'Version of profile completion form used';