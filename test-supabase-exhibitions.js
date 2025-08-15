// Test Supabase connection and exhibitions table
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0ODk1MzEsImV4cCI6MjA2ODA2NTUzMX0.PyoZ0e0P5NtWjMimxGimsJQ6nfFNRFmT4i0bRMEjxTk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testExhibitions() {
  try {
    console.log('🚀 Testing Supabase connection...');
    
    // Test 1: Simple query first
    console.log('📋 Step 1: Simple query test...');
    const { data: simpleData, error: simpleError } = await supabase
      .from('exhibitions')
      .select('id')
      .limit(1);
    
    if (simpleError) {
      console.error('❌ Simple query error:', JSON.stringify(simpleError, null, 2));
      return;
    }
    
    console.log(`✅ Simple query successful. Records found: ${simpleData?.length || 0}`);
    
    // Test 2: Get first 5 exhibitions  
    console.log('📋 Step 2: Full query test...');
    const { data: exhibitions, error } = await supabase
      .from('exhibitions')
      .select('id, venue_name, venue_city, start_date, end_date, description')
      .limit(5);
    
    if (error) {
      console.error('❌ Full query error:', JSON.stringify(error, null, 2));
      return;
    }
    
    console.log(`📊 Sample exhibitions (${exhibitions?.length || 0}):`);
    if (exhibitions && exhibitions.length > 0) {
      exhibitions.forEach((ex, index) => {
        console.log(`${index + 1}. Venue: ${ex.venue_name || 'No venue'}, City: ${ex.venue_city || 'No city'}`);
      });
    } else {
      console.log('🔍 No exhibitions found');
    }
    
    // Test 3: Count
    console.log('📋 Step 3: Count test...');
    const { count, error: countError } = await supabase
      .from('exhibitions')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Count error:', JSON.stringify(countError, null, 2));
    } else {
      console.log(`✅ Total exhibitions in table: ${count}`);
    }
    
  } catch (err) {
    console.error('❌ Connection error:', err);
  }
}

testExhibitions();