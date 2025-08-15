const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://hgltvdshuyfffskvjmst.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0ODk1MzEsImV4cCI6MjA2ODA2NTUzMX0.PyoZ0e0P5NtWjMimxGimsJQ6nfFNRFmT4i0bRMEjxTk'
);

async function testConnection() {
  try {
    const { data, error, count } = await supabase
      .from('exhibitions')
      .select('*', { count: 'exact' })
      .limit(5);
    
    if (error) {
      console.error('Supabase error:', error);
    } else {
      console.log('✅ Found', data.length, 'exhibitions');
      console.log('📊 Total count:', count);
      if (data.length > 0) {
        console.log('First exhibition:', data[0]);
      }
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

testConnection();