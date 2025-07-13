-- Add premium subscription fields to users table (Railway)

-- For Railway Database
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS subscription_type VARCHAR(50) DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'inactive';

-- Create index for faster premium status checks
CREATE INDEX IF NOT EXISTS idx_users_subscription_end_date 
ON users(subscription_end_date);

-- Add subscription types enum (optional)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_type_enum') THEN
        CREATE TYPE subscription_type_enum AS ENUM ('free', 'basic', 'pro', 'enterprise');
    END IF;
END$$;

-- Update existing users to have free subscription
UPDATE users 
SET subscription_type = 'free', 
    subscription_status = 'inactive'
WHERE subscription_type IS NULL;