const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function importMetExhibitions() {
  try {
    // 1. Read the new Met exhibitions data
    const metData = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'met_exhibitions_2025.json'), 'utf8')
    );
    
    console.log(`Found ${metData.exhibitions.length} Met exhibitions to import`);

    // 2. First, let's check and clean up existing Met Museum data
    console.log('\n=== Checking existing Met Museum exhibitions ===');
    
    // Get all Met Museum exhibitions from DB
    const { data: existingMet, error: fetchError } = await supabase
      .from('exhibitions')
      .select('id, title_en, title_local, start_date, end_date, source')
      .or('venue_name.eq.Metropolitan Museum of Art,venue_name.eq.The Met Cloisters')
      .order('start_date', { ascending: false });

    if (fetchError) {
      console.error('Error fetching existing exhibitions:', fetchError);
      return;
    }

    console.log(`Found ${existingMet?.length || 0} existing Met exhibitions`);
    
    // Show some examples of existing data
    if (existingMet && existingMet.length > 0) {
      console.log('\nExisting Met exhibitions (first 5):');
      existingMet.slice(0, 5).forEach(ex => {
        const title = ex.title_en || ex.title_local;
        console.log(`- ${title} (${ex.start_date?.slice(0,10)} ~ ${ex.end_date?.slice(0,10)}) [source: ${ex.source}]`);
      });

      // Delete old Met Museum data that looks like gallery displays
      const galleryDisplays = existingMet.filter(ex => {
        const title = ex.title_en || ex.title_local;
        return title?.includes('Gallery') && title?.includes('Display');
      });
      
      if (galleryDisplays.length > 0) {
        console.log(`\nFound ${galleryDisplays.length} gallery display entries to remove`);
        const idsToDelete = galleryDisplays.map(ex => ex.id);
        
        const { error: deleteError } = await supabase
          .from('exhibitions')
          .delete()
          .in('id', idsToDelete);
          
        if (deleteError) {
          console.error('Error deleting gallery displays:', deleteError);
        } else {
          console.log(`Successfully deleted ${galleryDisplays.length} gallery display entries`);
        }
      }
    }

    // 3. Prepare new exhibitions for import
    console.log('\n=== Importing new Met exhibitions ===');
    
    const exhibitionsToInsert = metData.exhibitions.map(ex => ({
      // Basic info - matching actual schema
      title_en: ex.title_en,
      title_local: ex.title_local || ex.title_en,
      subtitle: ex.subtitle,
      description: ex.description,
      
      // Venue info
      venue_name: ex.venue_name,
      venue_city: ex.venue_city,
      venue_country: ex.venue_country,
      
      // Dates and status
      start_date: ex.start_date,
      end_date: ex.end_date || '2026-12-31', // Default end date for ongoing exhibitions
      status: ex.status,
      
      // Exhibition details
      exhibition_type: ex.exhibition_type,
      artists: ex.artists,
      curator: ex.curator,
      artworks_count: ex.artworks_count,
      
      // Pricing
      admission_fee: ex.admission_fee,
      ticket_price: ex.ticket_price,
      
      // URLs
      official_url: ex.official_url,
      
      // Metadata
      source: 'manual_met_2025',
      
      // Additional info in tags or description
      tags: ex.themes,
      genres: ex.art_medium ? [ex.art_medium] : null
    }));

    // 4. Insert new exhibitions
    const { data: inserted, error: insertError } = await supabase
      .from('exhibitions')
      .insert(exhibitionsToInsert)
      .select();

    if (insertError) {
      console.error('Error inserting exhibitions:', insertError);
      return;
    }

    console.log(`\nSuccessfully imported ${inserted.length} Met exhibitions!`);
    
    // 5. Show what was imported
    console.log('\nImported exhibitions:');
    inserted.forEach(ex => {
      console.log(`✓ ${ex.title} (${ex.start_date?.slice(0,10)} ~ ${ex.end_date?.slice(0,10) || 'Ongoing'})`);
    });

    // 6. Update venue information if needed
    console.log('\n=== Checking venue data ===');
    
    // Check if Met venues exist
    const { data: venues, error: venueError } = await supabase
      .from('venues')
      .select('id, name')
      .or('name.eq.Metropolitan Museum of Art,name.eq.The Met Cloisters');

    if (venues && venues.length === 0) {
      console.log('Adding Met Museum venues...');
      
      const metVenues = [
        {
          name: 'Metropolitan Museum of Art',
          name_en: 'Metropolitan Museum of Art',
          name_ko: '메트로폴리탄 미술관',
          type: 'museum',
          tier: 1,
          address: '1000 Fifth Avenue',
          city: 'New York',
          region: 'New York',
          country: 'US',
          latitude: 40.7794,
          longitude: -73.9632,
          website: 'https://www.metmuseum.org',
          operating_hours: {
            monday: 'Closed',
            tuesday: '10:00-17:00',
            wednesday: '10:00-17:00',
            thursday: '10:00-17:00',
            friday: '10:00-21:00',
            saturday: '10:00-21:00',
            sunday: '10:00-17:00'
          }
        },
        {
          name: 'The Met Cloisters',
          name_en: 'The Met Cloisters',
          name_ko: '메트 클로이스터스',
          type: 'museum',
          tier: 1,
          address: '99 Margaret Corbin Drive',
          city: 'New York',
          region: 'New York',
          country: 'US',
          latitude: 40.8649,
          longitude: -73.9317,
          website: 'https://www.metmuseum.org/visit/plan-your-visit/met-cloisters',
          operating_hours: {
            monday: 'Closed',
            tuesday: '10:00-17:00',
            wednesday: '10:00-17:00',
            thursday: '10:00-17:00',
            friday: '10:00-17:00',
            saturday: '10:00-17:00',
            sunday: '10:00-17:00'
          }
        }
      ];

      const { error: venueInsertError } = await supabase
        .from('venues')
        .insert(metVenues);

      if (venueInsertError) {
        console.error('Error inserting venues:', venueInsertError);
      } else {
        console.log('Successfully added Met Museum venues');
      }
    }

    console.log('\n✅ Import complete!');

  } catch (error) {
    console.error('Import failed:', error);
  }
}

// Run the import
importMetExhibitions();