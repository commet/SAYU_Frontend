CREATE TABLE IF NOT EXISTS waitlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  referralCode VARCHAR(255) NOT NULL,
  referredBy UUID,
  referralCount INTEGER DEFAULT 0,
  aptTestCompleted BOOLEAN DEFAULT false,
  aptScore json,
  position INTEGER,
  accessGranted BOOLEAN DEFAULT false,
  accessGrantedAt timestamp with time zone,
  metadata json DEFAULT '{}'::json,
  createdAt timestamp with time zone,
  updatedAt timestamp with time zone
);