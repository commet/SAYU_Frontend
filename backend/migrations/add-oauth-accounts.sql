-- Create OAuth accounts table
CREATE TABLE IF NOT EXISTS user_oauth_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  provider_id VARCHAR(255) NOT NULL,
  profile_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(provider, provider_id),
  UNIQUE(user_id, provider)
);

-- Create indexes for OAuth lookups
CREATE INDEX idx_oauth_provider_id ON user_oauth_accounts(provider, provider_id);
CREATE INDEX idx_oauth_user_id ON user_oauth_accounts(user_id);

-- Add OAuth-related columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS oauth_profile_image TEXT,
ADD COLUMN IF NOT EXISTS last_login_provider VARCHAR(50);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for OAuth accounts
DROP TRIGGER IF EXISTS update_user_oauth_accounts_updated_at ON user_oauth_accounts;
CREATE TRIGGER update_user_oauth_accounts_updated_at
    BEFORE UPDATE ON user_oauth_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();