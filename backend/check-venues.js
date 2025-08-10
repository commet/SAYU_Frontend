const data = require('./real-exhibitions.json');

console.log('Total exhibitions:', data.length);
console.log('\n=== Venues found ===');

// Group by venue
const venues = {};
data.forEach(ex => {
  const venue = ex.venue_name || 'Unknown';
  if (!venues[venue]) venues[venue] = [];
  venues[venue].push({
    title: ex.title_local || ex.title_en,
    dates: `${ex.start_date} ~ ${ex.end_date}`,
    status: ex.status
  });
});

// Show all venues
Object.keys(venues).sort().forEach(venue => {
  console.log(`\n${venue}:`);
  venues[venue].forEach(ex => {
    console.log(`  - ${ex.title} (${ex.dates}) [${ex.status}]`);
  });
});