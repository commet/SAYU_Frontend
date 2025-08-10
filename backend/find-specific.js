const data = require('./real-exhibitions.json');

const targetIds = [
  '061303bc-7f17-476c-8449-07f6e9952b35',
  '1876420e-9190-4f1e-8a53-372707544cfb'
];

console.log(`Total exhibitions: ${data.length}`);

targetIds.forEach(id => {
  const found = data.find(ex => ex.id === id);
  if (found) {
    console.log('\n===================================');
    console.log(`ID: ${found.id}`);
    console.log(`Title: ${found.title_local || found.title_en}`);
    console.log(`Venue: ${found.venue_name}`);
    console.log(`Date: ${found.start_date} ~ ${found.end_date}`);
    console.log(`Status: ${found.status}`);
    if (found.artists) console.log(`Artists: ${found.artists.join(', ')}`);
  } else {
    console.log(`\nNot found: ${id}`);
  }
});

// Also search for Leeum, Hoam, Amore, Kukje
console.log('\n\n=== Searching for major museums ===');
const museums = ['리움', 'Leeum', '호암', 'Hoam', '아모레', 'Amore', '국제', 'Kukje'];
museums.forEach(museum => {
  const found = data.filter(ex => 
    ex.venue_name?.toLowerCase().includes(museum.toLowerCase())
  );
  if (found.length > 0) {
    console.log(`\n${museum}:`);
    found.forEach(ex => {
      console.log(`  - ${ex.title_local || ex.title_en}`);
    });
  }
});