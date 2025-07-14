const fs = require('fs');
const path = require('path');

const artworksPath = path.join(process.cwd(), '../artvee-crawler/data/famous-artists-artworks.json');
const data = fs.readFileSync(artworksPath, 'utf8');
const artworks = JSON.parse(data);

// Count by personality type
const counts = {};
artworks.forEach(artwork => {
  const type = artwork.sayuType || 'UNKNOWN';
  counts[type] = (counts[type] || 0) + 1;
});

console.log('Personality type distribution:');
Object.entries(counts).forEach(([type, count]) => {
  console.log(`  ${type}: ${count} artworks`);
});

// Check specific types
const testTypes = ['LAEF', 'LSES', 'LLEP', 'CAET'];
console.log('\nChecking test types:');
testTypes.forEach(type => {
  const filtered = artworks.filter(a => a.sayuType === type);
  console.log(`  ${type}: ${filtered.length} artworks`);
  if (filtered.length > 0) {
    console.log(`    First: ${filtered[0].title} by ${filtered[0].artist}`);
  }
});