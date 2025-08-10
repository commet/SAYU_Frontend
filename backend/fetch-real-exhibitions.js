const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  'https://hgltvdshuyfffskvjmst.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0ODk1MzEsImV4cCI6MjA2ODA2NTUzMX0.PyoZ0e0P5NtWjMimxGimsJQ6nfFNRFmT4i0bRMEjxTk'
);

async function fetchExhibitions() {
  try {
    const { data, error } = await supabase
      .from('exhibitions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000);
    
    if (error) {
      console.error('Error fetching exhibitions:', error);
      return;
    }
    
    console.log('Fetched exhibitions from Supabase:');
    console.log(JSON.stringify(data, null, 2));
    
    // Save to file for use in server
    const fs = require('fs');
    fs.writeFileSync('real-exhibitions.json', JSON.stringify(data, null, 2));
    console.log('\nSaved to real-exhibitions.json');
    
  } catch (err) {
    console.error('Error:', err);
  }
}

fetchExhibitions();