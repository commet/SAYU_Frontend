-- Unify Korean venues and global_venues into a single comprehensive venues table
-- This migration adds Korean-specific fields to global_venues and migrates all data

-- Step 1: Add Korean venue specific columns to global_venues
ALTER TABLE global_venues 
ADD COLUMN IF NOT EXISTS name_en VARCHAR(255),
ADD COLUMN IF NOT EXISTS district VARCHAR(100),
ADD COLUMN IF NOT EXISTS tier INTEGER,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2),
ADD COLUMN IF NOT EXISTS review_count INTEGER,
ADD COLUMN IF NOT EXISTS data_completeness INTEGER,
ADD COLUMN IF NOT EXISTS admission_fee JSONB;

-- Step 2: Create a function to migrate Instagram to social_media JSONB
CREATE OR REPLACE FUNCTION migrate_instagram_to_social_media(instagram_handle VARCHAR)
RETURNS JSONB AS $$
BEGIN
    IF instagram_handle IS NULL OR instagram_handle = '' THEN
        RETURN NULL;
    END IF;
    
    RETURN jsonb_build_object(
        'instagram', 
        CASE 
            WHEN instagram_handle LIKE '@%' THEN instagram_handle
            WHEN instagram_handle LIKE 'http%' THEN instagram_handle
            ELSE '@' || instagram_handle
        END
    );
END;
$$ LANGUAGE plpgsql;

-- Step 3: Migrate Korean venues data to global_venues
INSERT INTO global_venues (
    name,
    name_en,
    name_local,
    country,
    city,
    district,
    address,
    latitude,
    longitude,
    phone,
    website,
    social_media,
    venue_type,
    venue_category,
    tier,
    is_active,
    rating,
    review_count,
    opening_hours,
    admission_fee,
    admission_info,
    google_place_id,
    data_source,
    data_quality_score,
    data_completeness,
    verification_status,
    created_at,
    updated_at,
    created_by
)
SELECT 
    COALESCE(v.name, v.name_en) as name,
    v.name_en,
    v.name as name_local,
    COALESCE(v.country, 'South Korea') as country,
    CASE 
        WHEN v.city IS NOT NULL THEN v.city
        WHEN v.address LIKE '%서울%' THEN '서울'
        WHEN v.address LIKE '%부산%' THEN '부산'
        WHEN v.address LIKE '%대구%' THEN '대구'
        WHEN v.address LIKE '%인천%' THEN '인천'
        WHEN v.address LIKE '%광주%' THEN '광주'
        WHEN v.address LIKE '%대전%' THEN '대전'
        WHEN v.address LIKE '%울산%' THEN '울산'
        WHEN v.address LIKE '%제주%' THEN '제주'
        WHEN v.address LIKE '%경기%' THEN '경기'
        ELSE 'Unknown'
    END as city,
    v.district,
    v.address,
    v.latitude,
    v.longitude,
    v.phone,
    v.website,
    migrate_instagram_to_social_media(v.instagram) as social_media,
    CASE 
        WHEN LOWER(v.type) = 'museum' THEN 'museum'
        WHEN LOWER(v.type) = 'gallery' THEN 'gallery'
        WHEN LOWER(v.type) IN ('art center', 'artcenter') THEN 'art_center'
        ELSE 'cultural_center'
    END as venue_type,
    CASE 
        WHEN v.tier <= 1 THEN 'public'
        WHEN v.tier = 2 THEN 'commercial'
        ELSE 'private'
    END as venue_category,
    v.tier,
    v.is_active,
    v.rating,
    v.review_count,
    v.opening_hours,
    v.admission_fee,
    v.admission_fee as admission_info, -- Copy to new field too
    v.google_place_id,
    'korean_venues_migration' as data_source,
    COALESCE(v.data_completeness, 70) as data_quality_score,
    v.data_completeness,
    CASE 
        WHEN v.rating IS NOT NULL AND v.review_count > 10 THEN 'verified'
        ELSE 'unverified'
    END as verification_status,
    v.created_at,
    v.updated_at,
    'migration' as created_by
FROM venues v
WHERE NOT EXISTS (
    -- Avoid duplicates by checking multiple criteria
    SELECT 1 FROM global_venues gv 
    WHERE (
        -- Check by Google Place ID if both have it
        (v.google_place_id IS NOT NULL AND gv.google_place_id = v.google_place_id)
        OR
        -- Check by name and city combination
        (LOWER(gv.name) = LOWER(v.name) AND LOWER(gv.city) = LOWER(v.city))
        OR
        -- Check by English name and city
        (v.name_en IS NOT NULL AND LOWER(gv.name) = LOWER(v.name_en) AND LOWER(gv.city) = LOWER(v.city))
    )
);

-- Step 4: Update existing Seoul venues with district information if missing
UPDATE global_venues gv
SET 
    district = v.district,
    tier = v.tier,
    rating = COALESCE(gv.rating, v.rating),
    review_count = COALESCE(gv.review_count, v.review_count),
    name_en = COALESCE(gv.name_en, v.name_en),
    social_media = CASE 
        WHEN v.instagram IS NOT NULL AND (gv.social_media IS NULL OR NOT gv.social_media ? 'instagram')
        THEN COALESCE(gv.social_media, '{}'::jsonb) || migrate_instagram_to_social_media(v.instagram)
        ELSE gv.social_media
    END
FROM venues v
WHERE LOWER(gv.city) = LOWER(v.city)
AND (
    (gv.name = v.name) OR 
    (gv.name = v.name_en) OR
    (gv.name_en = v.name) OR
    (gv.google_place_id IS NOT NULL AND gv.google_place_id = v.google_place_id)
);

-- Step 5: Create indexes for new fields
CREATE INDEX IF NOT EXISTS idx_global_venues_district ON global_venues(district);
CREATE INDEX IF NOT EXISTS idx_global_venues_tier ON global_venues(tier);
CREATE INDEX IF NOT EXISTS idx_global_venues_rating ON global_venues(rating DESC);
CREATE INDEX IF NOT EXISTS idx_global_venues_active ON global_venues(is_active);

-- Step 6: Create a unified view that shows all venues with complete information
CREATE OR REPLACE VIEW unified_venues AS
SELECT 
    id,
    name,
    name_en,
    name_local,
    country,
    city,
    district,
    address,
    latitude,
    longitude,
    phone,
    email,
    website,
    social_media,
    venue_type,
    venue_category,
    tier,
    is_active,
    rating,
    review_count,
    opening_hours,
    admission_info,
    google_place_id,
    data_source,
    data_quality_score,
    verification_status,
    created_at,
    updated_at,
    -- Computed fields
    CASE 
        WHEN rating >= 4.5 AND review_count > 50 THEN 'highly_recommended'
        WHEN rating >= 4.0 AND review_count > 20 THEN 'recommended'
        WHEN rating >= 3.5 THEN 'good'
        ELSE 'standard'
    END as recommendation_level,
    CASE
        WHEN country = 'South Korea' THEN 'domestic'
        ELSE 'international'
    END as venue_scope
FROM global_venues
WHERE is_active = true OR is_active IS NULL;

-- Step 7: Update statistics
UPDATE global_data_quality_metrics
SET 
    total_venues = (SELECT COUNT(*) FROM global_venues),
    verified_venues = (SELECT COUNT(*) FROM global_venues WHERE verification_status = 'verified')
WHERE metric_date = CURRENT_DATE;

-- Step 8: Add comment to indicate unified table
COMMENT ON TABLE global_venues IS 'Unified table containing all venues - both Korean (migrated from venues table) and international museums, galleries, and art institutions';

-- Step 9: Rename tables for clarity (optional - uncomment if you want to proceed)
-- ALTER TABLE venues RENAME TO venues_legacy_korean;
-- ALTER TABLE global_venues RENAME TO venues;

-- Summary of migration
DO $$
DECLARE
    korean_count INTEGER;
    total_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO korean_count FROM venues;
    SELECT COUNT(*) INTO total_count FROM global_venues;
    
    RAISE NOTICE 'Migration Summary:';
    RAISE NOTICE '- Original Korean venues: %', korean_count;
    RAISE NOTICE '- Total venues after migration: %', total_count;
    RAISE NOTICE '- International venues: %', total_count - korean_count;
END $$;