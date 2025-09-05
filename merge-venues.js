const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0ODk1MzEsImV4cCI6MjA2ODA2NTUzMX0.PyoZ0e0P5NtWjMimxGimsJQ6nfFNRFmT4i0bRMEjxTk';
const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanAndMergeVenues() {
  console.log('🧹 Starting venue cleanup and merge process...\n');

  try {
    // Step 1: Clean venue names (remove codes)
    console.log('Step 1: Cleaning venue names...');
    const { data: venuesWithCodes } = await supabase
      .from('venues')
      .select('id, name')
      .like('name', '%(%)%');
    
    let cleanedCount = 0;
    for (const venue of venuesWithCodes || []) {
      const cleanName = venue.name.split('(')[0].trim();
      const { error } = await supabase
        .from('venues')
        .update({ 
          name: cleanName,
          updated_at: new Date().toISOString()
        })
        .eq('id', venue.id);
      
      if (!error) {
        cleanedCount++;
        console.log(`  ✓ Cleaned: ${venue.name} → ${cleanName}`);
      }
    }
    console.log(`  Cleaned ${cleanedCount} venue names\n`);

    // Step 2: Get all venues_simple data
    console.log('Step 2: Fetching venues_simple data...');
    const { data: venuesSimple } = await supabase
      .from('venues_simple')
      .select('*');
    console.log(`  Found ${venuesSimple?.length || 0} venues in venues_simple\n`);

    // Step 3: Check for matches and merge
    console.log('Step 3: Merging venues_simple into venues...');
    const venueMapping = [];
    let updatedCount = 0;
    let insertedCount = 0;

    for (const vs of venuesSimple || []) {
      // Check if venue exists in venues table
      const { data: existingVenue } = await supabase
        .from('venues')
        .select('id')
        .or(`name.eq.${vs.name_ko},name.eq.${vs.name_en}`)
        .single();

      if (existingVenue) {
        // Update existing venue
        const { error } = await supabase
          .from('venues')
          .update({
            name: vs.name_ko,
            name_en: vs.name_en,
            district: vs.district,
            type: mapVenueType(vs.venue_type),
            phone: vs.phone,
            website: vs.website,
            address: vs.address_ko,
            tier: vs.is_major ? 1 : 2,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingVenue.id);

        if (!error) {
          updatedCount++;
          venueMapping.push({ old_id: vs.id, new_id: existingVenue.id });
          console.log(`  ✓ Updated: ${vs.name_ko}`);
        }
      } else {
        // Insert new venue
        const { data: newVenue, error } = await supabase
          .from('venues')
          .insert({
            name: vs.name_ko,
            name_en: vs.name_en,
            type: mapVenueType(vs.venue_type),
            tier: vs.is_major ? 1 : 2,
            city: vs.city,
            country: '한국',
            district: vs.district,
            address: vs.address_ko,
            phone: vs.phone,
            website: vs.website,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select('id')
          .single();

        if (!error) {
          insertedCount++;
          venueMapping.push({ old_id: vs.id, new_id: newVenue.id });
          console.log(`  ✓ Inserted: ${vs.name_ko}`);
        }
      }
    }
    
    console.log(`  Updated ${updatedCount} venues, Inserted ${insertedCount} new venues\n`);

    // Step 4: Update exhibitions_master venue_id references
    console.log('Step 4: Updating exhibitions_master venue_id references...');
    let exhibitionUpdateCount = 0;
    
    for (const mapping of venueMapping) {
      const { error } = await supabase
        .from('exhibitions_master')
        .update({ venue_id: mapping.new_id })
        .eq('venue_id', mapping.old_id);
      
      if (!error) {
        exhibitionUpdateCount++;
      }
    }
    
    console.log(`  Updated ${exhibitionUpdateCount} exhibition venue references\n`);

    // Final statistics
    console.log('📊 Final Statistics:');
    const { count: venuesCount } = await supabase
      .from('venues')
      .select('*', { count: 'exact', head: true });
    
    const { count: exhibitionsWithVenue } = await supabase
      .from('exhibitions_master')
      .select('*', { count: 'exact', head: true })
      .not('venue_id', 'is', null);
    
    console.log(`  Total venues: ${venuesCount}`);
    console.log(`  Exhibitions with venue: ${exhibitionsWithVenue}`);
    console.log('\n✅ Venue merge completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

function mapVenueType(venueType) {
  const typeMap = {
    'museum': 'museum',
    'gallery': 'gallery',
    'art_center': 'art_center',
    'alternative': 'alternative',
    'auction': 'auction'
  };
  return typeMap[venueType] || 'gallery';
}

// Run the merge
cleanAndMergeVenues();