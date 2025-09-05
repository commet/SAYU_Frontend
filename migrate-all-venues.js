const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0ODk1MzEsImV4cCI6MjA2ODA2NTUzMX0.PyoZ0e0P5NtWjMimxGimsJQ6nfFNRFmT4i0bRMEjxTk';
const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateAllVenues() {
  console.log('🚀 Migrating all venues_simple to venues table...\n');
  
  try {
    // Get all venues_simple
    const { data: venuesSimple, error: fetchError } = await supabase
      .from('venues_simple')
      .select('*');
    
    if (fetchError) {
      console.error('Error fetching venues_simple:', fetchError);
      return;
    }
    
    console.log(`Processing ${venuesSimple.length} venues from venues_simple...\n`);
    
    let addedCount = 0;
    let skippedCount = 0;
    
    for (const vs of venuesSimple) {
      // Check if already exists
      const { data: existing } = await supabase
        .from('venues')
        .select('id')
        .eq('name', vs.name_ko)
        .single();
      
      if (!existing) {
        const { error } = await supabase
          .from('venues')
          .insert({
            name: vs.name_ko,
            name_en: vs.name_en,
            type: vs.venue_type || 'gallery',
            tier: vs.is_major ? 1 : 2,
            city: vs.city || '서울',
            country: '한국',
            district: vs.district,
            address: vs.address_ko,
            phone: vs.phone,
            website: vs.website,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (!error) {
          addedCount++;
          console.log(`✓ Added: ${vs.name_ko}`);
        } else {
          console.log(`✗ Error adding ${vs.name_ko}:`, error.message);
        }
      } else {
        skippedCount++;
        console.log(`→ Skipped (exists): ${vs.name_ko}`);
      }
    }
    
    console.log(`\n📊 Results:`);
    console.log(`  Added: ${addedCount} new venues`);
    console.log(`  Skipped: ${skippedCount} existing venues`);
    console.log('\n✅ Migration completed!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the migration
migrateAllVenues();