-- Final Schema Fix for Supabase
-- Add all missing columns based on Railway actual structure

-- Fix users table - add missing columns
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password_hash') THEN
        ALTER TABLE users ADD COLUMN password_hash VARCHAR;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_premium') THEN
        ALTER TABLE users ADD COLUMN is_premium BOOLEAN;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'profile_image') THEN
        ALTER TABLE users ADD COLUMN profile_image TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'subscription_type') THEN
        ALTER TABLE users ADD COLUMN subscription_type VARCHAR;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'subscription_start_date') THEN
        ALTER TABLE users ADD COLUMN subscription_start_date TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'subscription_end_date') THEN
        ALTER TABLE users ADD COLUMN subscription_end_date TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'subscription_status') THEN
        ALTER TABLE users ADD COLUMN subscription_status VARCHAR;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'user_purpose') THEN
        ALTER TABLE users ADD COLUMN user_purpose VARCHAR;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'pioneer_number') THEN
        ALTER TABLE users ADD COLUMN pioneer_number INTEGER;
    END IF;
END $$;

-- Fix venues table - add missing columns
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'venues' AND column_name = 'district') THEN
        ALTER TABLE venues ADD COLUMN district VARCHAR;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'venues' AND column_name = 'tier') THEN
        ALTER TABLE venues ADD COLUMN tier INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'venues' AND column_name = 'instagram') THEN
        ALTER TABLE venues ADD COLUMN instagram VARCHAR;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'venues' AND column_name = 'rating') THEN
        ALTER TABLE venues ADD COLUMN rating NUMERIC;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'venues' AND column_name = 'review_count') THEN
        ALTER TABLE venues ADD COLUMN review_count INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'venues' AND column_name = 'google_place_id') THEN
        ALTER TABLE venues ADD COLUMN google_place_id VARCHAR;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'venues' AND column_name = 'data_completeness') THEN
        ALTER TABLE venues ADD COLUMN data_completeness INTEGER;
    END IF;
END $$;

-- Fix exhibitions table - add missing columns
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitions' AND column_name = 'institution_id') THEN
        ALTER TABLE exhibitions ADD COLUMN institution_id UUID;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitions' AND column_name = 'title_local') THEN
        ALTER TABLE exhibitions ADD COLUMN title_local VARCHAR;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitions' AND column_name = 'subtitle') THEN
        ALTER TABLE exhibitions ADD COLUMN subtitle VARCHAR;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitions' AND column_name = 'artists') THEN
        ALTER TABLE exhibitions ADD COLUMN artists TEXT[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitions' AND column_name = 'artworks_count') THEN
        ALTER TABLE exhibitions ADD COLUMN artworks_count INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitions' AND column_name = 'ticket_price') THEN
        ALTER TABLE exhibitions ADD COLUMN ticket_price JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitions' AND column_name = 'official_url') THEN
        ALTER TABLE exhibitions ADD COLUMN official_url VARCHAR;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitions' AND column_name = 'press_release_url') THEN
        ALTER TABLE exhibitions ADD COLUMN press_release_url VARCHAR;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitions' AND column_name = 'virtual_tour_url') THEN
        ALTER TABLE exhibitions ADD COLUMN virtual_tour_url VARCHAR;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitions' AND column_name = 'exhibition_type') THEN
        ALTER TABLE exhibitions ADD COLUMN exhibition_type VARCHAR;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitions' AND column_name = 'genres') THEN
        ALTER TABLE exhibitions ADD COLUMN genres TEXT[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitions' AND column_name = 'venue_name') THEN
        ALTER TABLE exhibitions ADD COLUMN venue_name VARCHAR;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitions' AND column_name = 'venue_city') THEN
        ALTER TABLE exhibitions ADD COLUMN venue_city VARCHAR;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitions' AND column_name = 'venue_country') THEN
        ALTER TABLE exhibitions ADD COLUMN venue_country VARCHAR;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitions' AND column_name = 'contact_info') THEN
        ALTER TABLE exhibitions ADD COLUMN contact_info VARCHAR;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitions' AND column_name = 'collected_at') THEN
        ALTER TABLE exhibitions ADD COLUMN collected_at TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitions' AND column_name = 'submission_id') THEN
        ALTER TABLE exhibitions ADD COLUMN submission_id INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitions' AND column_name = 'ai_verified') THEN
        ALTER TABLE exhibitions ADD COLUMN ai_verified BOOLEAN;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitions' AND column_name = 'website_url') THEN
        ALTER TABLE exhibitions ADD COLUMN website_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitions' AND column_name = 'venue_address') THEN
        ALTER TABLE exhibitions ADD COLUMN venue_address TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitions' AND column_name = 'phone_number') THEN
        ALTER TABLE exhibitions ADD COLUMN phone_number VARCHAR;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitions' AND column_name = 'operating_hours') THEN
        ALTER TABLE exhibitions ADD COLUMN operating_hours TEXT;
    END IF;
    
    -- Fix column name mismatch (title vs title_en)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitions' AND column_name = 'title') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitions' AND column_name = 'title_en') THEN
            ALTER TABLE exhibitions ADD COLUMN title VARCHAR(500);
            -- We'll copy data in next step
        END IF;
    END IF;
END $$;

-- Fix ID type mismatch for venues (Railway uses integer, we need UUID reference)
DO $$
BEGIN
    -- Check if venues.id is integer type and we need to handle the reference
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'venues' AND column_name = 'id' AND data_type = 'uuid'
    ) THEN
        -- Already UUID, good
        NULL;
    ELSE
        -- Add venue_id_int for Railway compatibility
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitions' AND column_name = 'venue_id_int') THEN
            ALTER TABLE exhibitions ADD COLUMN venue_id_int INTEGER;
        END IF;
    END IF;
END $$;