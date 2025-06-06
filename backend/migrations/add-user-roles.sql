-- Add role column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';

-- Create index on role for performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Update any existing admin users (optional)
-- UPDATE users SET role = 'admin' WHERE email = 'admin@yourdomain.com';