const data = require('./real-exhibitions.json');

console.log('Searching for specific museums and exhibitions...\n');

const searchTerms = [
  'leeum', '리움', 
  'hoam', '호암',
  'amore', '아모레',
  'kukje', '국제',
  'pierre', '피에르', '위그',
  '정선', '겸재'
];

searchTerms.forEach(term => {
  const found = data.filter(ex => {
    const fullText = JSON.stringify(ex).toLowerCase();
    return fullText.includes(term.toLowerCase());
  });
  
  if (found.length > 0) {
    console.log(`\n=== Found with "${term}" ===`);
    found.forEach(ex => {
      console.log(`Title: ${ex.title_local || ex.title_en}`);
      console.log(`Venue: ${ex.venue_name}`);
      console.log(`Date: ${ex.start_date} ~ ${ex.end_date}`);
      console.log(`Status: ${ex.status}`);
      if (ex.artists) console.log(`Artists: ${ex.artists.join(', ')}`);
      console.log('---');
    });
  }
});

// Also check if these venue names exist in any form
console.log('\n=== All unique venues in database ===');
const allVenues = [...new Set(data.map(ex => ex.venue_name))].sort();
allVenues.forEach(v => console.log(`- ${v}`));