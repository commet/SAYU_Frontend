-- Add user_purpose field to users table
ALTER TABLE users 
ADD COLUMN user_purpose VARCHAR(50) DEFAULT 'exploring';

-- Add index for better query performance
CREATE INDEX idx_users_purpose ON users(user_purpose);

-- Add comments for documentation
COMMENT ON COLUMN users.user_purpose IS 'User primary purpose: dating, family, social, professional, exploring';