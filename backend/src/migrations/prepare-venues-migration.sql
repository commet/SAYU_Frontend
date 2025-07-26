-- Prepare venues table for migration by handling duplicates

-- Step 1: Handle duplicates within venues table
-- Update duplicate venues with NULL google_place_id except the first one
WITH duplicate_places AS (
    SELECT 
        google_place_id,
        id,
        ROW_NUMBER() OVER (PARTITION BY google_place_id ORDER BY rating DESC NULLS LAST, id) as rn
    FROM venues
    WHERE google_place_id IS NOT NULL
)
UPDATE venues v
SET google_place_id = NULL
FROM duplicate_places dp
WHERE v.id = dp.id 
AND dp.rn > 1;

-- Step 2: Log what we're about to migrate
DO $$
DECLARE
    total_korean INTEGER;
    with_place_id INTEGER;
    without_place_id INTEGER;
    will_be_new INTEGER;
    will_update_existing INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_korean FROM venues;
    SELECT COUNT(*) INTO with_place_id FROM venues WHERE google_place_id IS NOT NULL;
    SELECT COUNT(*) INTO without_place_id FROM venues WHERE google_place_id IS NULL;
    
    -- Count how many will be new additions
    SELECT COUNT(*) INTO will_be_new 
    FROM venues v
    WHERE NOT EXISTS (
        SELECT 1 FROM global_venues gv 
        WHERE (
            (v.google_place_id IS NOT NULL AND gv.google_place_id = v.google_place_id)
            OR (LOWER(gv.name) = LOWER(v.name) AND LOWER(gv.city) = LOWER(v.city))
            OR (v.name_en IS NOT NULL AND LOWER(gv.name) = LOWER(v.name_en) AND LOWER(gv.city) = LOWER(v.city))
        )
    );
    
    -- Count how many will update existing
    SELECT COUNT(*) INTO will_update_existing
    FROM venues v
    WHERE EXISTS (
        SELECT 1 FROM global_venues gv 
        WHERE (
            (v.google_place_id IS NOT NULL AND gv.google_place_id = v.google_place_id)
            OR (LOWER(gv.name) = LOWER(v.name) AND LOWER(gv.city) = LOWER(v.city))
            OR (v.name_en IS NOT NULL AND LOWER(gv.name) = LOWER(v.name_en) AND LOWER(gv.city) = LOWER(v.city))
        )
    );
    
    RAISE NOTICE '';
    RAISE NOTICE '=== Pre-Migration Summary ===';
    RAISE NOTICE 'Total Korean venues: %', total_korean;
    RAISE NOTICE 'With Google Place ID: %', with_place_id;
    RAISE NOTICE 'Without Google Place ID: %', without_place_id;
    RAISE NOTICE 'Will be NEW additions: %', will_be_new;
    RAISE NOTICE 'Will UPDATE existing: %', will_update_existing;
    RAISE NOTICE '=============================';
END $$;