const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkSchema() {
  try {
    // Check exhibitions table
    console.log('=== Checking exhibitions table schema ===');
    const { data, error } = await supabase
      .from('exhibitions')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error:', error);
      
      // Try to get table info from information_schema
      console.log('\nTrying to check table structure...');
      const { data: schemaData, error: schemaError } = await supabase
        .rpc('get_table_columns', { table_name: 'exhibitions' });
      
      if (schemaError) {
        console.error('Schema error:', schemaError);
      } else {
        console.log('Schema data:', schemaData);
      }
    } else {
      console.log('Sample data structure:', data[0] ? Object.keys(data[0]) : 'No data');
    }

    // Check venues table
    console.log('\n=== Checking venues table schema ===');
    const { data: venueData, error: venueError } = await supabase
      .from('venues')
      .select('*')
      .limit(1);

    if (venueError) {
      console.error('Venue error:', venueError);
    } else {
      console.log('Venue structure:', venueData[0] ? Object.keys(venueData[0]) : 'No data');
    }

  } catch (error) {
    console.error('Check failed:', error);
  }
}

checkSchema();