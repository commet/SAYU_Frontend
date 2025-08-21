const fs = require('fs');
const path = require('path');

// Load the artwork data
const artworksPath = path.join(__dirname, 'data', 'famous-artists-artworks.json');
const artworks = JSON.parse(fs.readFileSync(artworksPath, 'utf8'));

// Count sayuType distribution
const typeCount = {};
const artistsByType = {};

artworks.forEach(artwork => {
  const type = artwork.sayuType;
  
  // Count types
  typeCount[type] = (typeCount[type] || 0) + 1;
  
  // Group artists by type
  if (!artistsByType[type]) {
    artistsByType[type] = new Set();
  }
  artistsByType[type].add(artwork.artist);
});

// Sort by count
const sortedTypes = Object.entries(typeCount).sort((a, b) => b[1] - a[1]);

console.log('=====================================');
console.log('SAYU Type Distribution Analysis');
console.log('=====================================\n');

console.log('📊 Type Distribution:');
console.log('-------------------');
sortedTypes.forEach(([type, count]) => {
  const percentage = ((count / artworks.length) * 100).toFixed(2);
  console.log(`${type}: ${count} artworks (${percentage}%)`);
});

console.log('\n📈 Summary:');
console.log('-----------');
console.log(`Total artworks: ${artworks.length}`);
console.log(`Unique types: ${sortedTypes.length}`);

console.log('\n🎨 Artists per Type (sample):');
console.log('-----------------------------');
sortedTypes.slice(0, 5).forEach(([type, count]) => {
  const artists = Array.from(artistsByType[type]).slice(0, 3);
  console.log(`\n${type} (${count} artworks):`);
  artists.forEach(artist => console.log(`  - ${artist}`));
  if (artistsByType[type].size > 3) {
    console.log(`  ... and ${artistsByType[type].size - 3} more artists`);
  }
});

// Check if all 16 types are present
const expectedTypes = [
  'LAEF', 'LAEC', 'LAMF', 'LAMC',
  'LREF', 'LREC', 'LRMF', 'LRMC',
  'SAEF', 'SAEC', 'SAMF', 'SAMC',
  'SREF', 'SREC', 'SRMF', 'SRMC'
];

const missingTypes = expectedTypes.filter(type => !typeCount[type]);
if (missingTypes.length > 0) {
  console.log('\n⚠️ Missing Types:');
  console.log('-----------------');
  missingTypes.forEach(type => console.log(`  - ${type}`));
}