const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://hgltvdshuyfffskvjmst.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0ODk1MzEsImV4cCI6MjA2ODA2NTUzMX0.PyoZ0e0P5NtWjMimxGimsJQ6nfFNRFmT4i0bRMEjxTk'
);

async function checkDuplicates() {
  try {
    const { data, error } = await supabase
      .from('exhibitions')
      .select('id, venue_name, venue_city, description, start_date, end_date')
      .order('venue_name')
      .limit(100);
    
    if (error) {
      console.error('Error:', error);
      return;
    }
    
    console.log('Total exhibitions fetched:', data.length);
    
    // Group by venue
    const venueGroups = {};
    data.forEach(ex => {
      const venue = ex.venue_name || 'Unknown';
      if (!venueGroups[venue]) {
        venueGroups[venue] = [];
      }
      venueGroups[venue].push(ex);
    });
    
    // Find venues with multiple exhibitions
    console.log('\n=== Venues with Multiple Exhibitions ===');
    Object.entries(venueGroups)
      .filter(([venue, exhibitions]) => exhibitions.length > 1)
      .sort((a, b) => b[1].length - a[1].length)
      .forEach(([venue, exhibitions]) => {
        console.log(`\n${venue}: ${exhibitions.length} exhibitions`);
        exhibitions.forEach(ex => {
          const title = extractTitle(ex.description, venue);
          console.log(`  - ${title} (${ex.start_date} ~ ${ex.end_date})`);
        });
      });
    
    // Check descriptions
    const noDescription = data.filter(ex => !ex.description).length;
    const genericTitles = data.filter(ex => {
      const title = extractTitle(ex.description, ex.venue_name);
      return title.endsWith('전시');
    }).length;
    
    console.log('\n=== Statistics ===');
    console.log(`Exhibitions without description: ${noDescription}/${data.length}`);
    console.log(`Exhibitions with generic titles: ${genericTitles}/${data.length}`);
    
    // Sample some exhibitions
    console.log('\n=== Sample Exhibitions ===');
    data.slice(0, 10).forEach(ex => {
      const title = extractTitle(ex.description, ex.venue_name);
      console.log(`${title}`);
      console.log(`  Venue: ${ex.venue_name}`);
      console.log(`  Description: ${ex.description ? ex.description.substring(0, 100) + '...' : 'NO DESCRIPTION'}`);
      console.log('');
    });
    
  } catch (err) {
    console.error('Error:', err);
  }
}

function extractTitle(description, venue) {
  if (!description) return `${venue} 전시`;
  
  // Extract title from brackets
  const bracketMatch = description.match(/《([^》]+)》|<([^>]+)>|「([^」]+)」|『([^』]+)』/);
  if (bracketMatch) {
    const title = (bracketMatch[1] || bracketMatch[2] || bracketMatch[3] || bracketMatch[4])?.trim();
    if (title && title.length >= 2 && title.length <= 60) {
      return title;
    }
  }
  
  return `${venue} 전시`;
}

checkDuplicates();