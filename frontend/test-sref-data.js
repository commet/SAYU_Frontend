// Test SREF curated artworks data
import { getSREFCuratedArtworks } from './data/sref-curated-artworks.ts';

console.log('Testing SREF Curated Artworks...');
const artworks = getSREFCuratedArtworks();
console.log('Total artworks:', artworks.length);
console.log('\nFirst 3 artworks:');
artworks.slice(0, 3).forEach((artwork, index) => {
  console.log(`\n${index + 1}. ${artwork.title}`);
  console.log(`   Artist: ${artwork.artist}`);
  console.log(`   Year: ${artwork.year}`);
  console.log(`   Image URL: ${artwork.imageUrl.substring(0, 100)}...`);
});