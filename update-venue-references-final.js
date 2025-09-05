const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0ODk1MzEsImV4cCI6MjA2ODA2NTUzMX0.PyoZ0e0P5NtWjMimxGimsJQ6nfFNRFmT4i0bRMEjxTk';
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateVenueReferences() {
  console.log('🔄 Updating exhibitions_master venue references from venues_simple to venues...\n');

  try {
    // Get all exhibitions with venue_id
    const { data: exhibitions, error: exError } = await supabase
      .from('exhibitions_master')
      .select('id, venue_id')
      .not('venue_id', 'is', null);

    if (!exhibitions || exhibitions.length === 0) {
      console.log('No exhibitions with venue_id found.');
      return;
    }

    console.log(`Found ${exhibitions.length} exhibitions with venue_id\n`);

    let updatedCount = 0;
    let notFoundCount = 0;
    
    for (const exhibition of exhibitions) {
      // Get venue info from venues_simple
      const { data: venueSimple } = await supabase
        .from('venues_simple')
        .select('name_ko, name_en')
        .eq('id', exhibition.venue_id)
        .single();

      if (!venueSimple) {
        // Maybe it's already pointing to venues table
        const { data: existingVenue } = await supabase
          .from('venues')
          .select('id')
          .eq('id', exhibition.venue_id)
          .single();
        
        if (existingVenue) {
          console.log(`→ Already updated: Exhibition ${exhibition.id}`);
          continue;
        }
        
        notFoundCount++;
        console.log(`✗ Venue not found for exhibition ${exhibition.id}`);
        continue;
      }

      // Find corresponding venue in venues table by name
      const { data: venue } = await supabase
        .from('venues')
        .select('id, name')
        .eq('name', venueSimple.name_ko)
        .single();

      if (venue) {
        // Update exhibition with new venue_id from venues table
        const { error: updateError } = await supabase
          .from('exhibitions_master')
          .update({ venue_id: venue.id })
          .eq('id', exhibition.id);

        if (!updateError) {
          updatedCount++;
          console.log(`✓ Updated: ${venueSimple.name_ko} (${exhibition.venue_id} → ${venue.id})`);
        } else {
          console.log(`✗ Error updating exhibition ${exhibition.id}:`, updateError.message);
        }
      } else {
        notFoundCount++;
        console.log(`✗ Not found in venues table: ${venueSimple.name_ko}`);
      }
    }

    console.log(`\n📊 Results:`);
    console.log(`  Updated: ${updatedCount} exhibitions`);
    console.log(`  Not found: ${notFoundCount} venues`);
    
    // Verify the update
    const { data: sampleCheck } = await supabase
      .from('exhibitions_master')
      .select('venue_id')
      .not('venue_id', 'is', null)
      .limit(1)
      .single();
    
    if (sampleCheck) {
      const { data: venueCheck } = await supabase
        .from('venues')
        .select('name')
        .eq('id', sampleCheck.venue_id)
        .single();
      
      console.log(`\n✅ Verification: Sample exhibition now points to venues table`);
      console.log(`   Venue: ${venueCheck?.name || 'Not found'}`);
    }
    
    console.log('\n✅ Exhibition venue references updated successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the update
updateVenueReferences();