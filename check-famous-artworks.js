const fs = require('fs');
const path = require('path');

// Load the artworks database
const artworksPath = path.join(__dirname, 'frontend', 'public', 'data', 'artworks.json');

if (!fs.existsSync(artworksPath)) {
  console.error('Artworks database not found at:', artworksPath);
  process.exit(1);
}

const artworksData = JSON.parse(fs.readFileSync(artworksPath, 'utf8'));
const artworks = artworksData.artworks;

console.log(`Total artworks in database: ${artworks.length}`);
console.log('');

// Famous masterpieces to look for
const famousMasterpieces = {
  "Van Gogh": ["The Starry Night", "Sunflowers", "Wheatfield with Crows", "The Bedroom", "Starry Night", "Café Terrace"],
  "Monet": ["Water Lilies", "Impression, Sunrise", "Rouen Cathedral", "Haystacks", "Poplar", "Charing Cross"],
  "Picasso": ["Les Demoiselles d'Avignon", "Guernica", "The Old Guitarist", "The Weeping Woman", "Ma Jolie"],
  "Leonardo da Vinci": ["Mona Lisa", "The Last Supper", "Vitruvian Man", "Lady with an Ermine"],
  "Michelangelo": ["The Creation of Adam", "Pietà", "David", "The Last Judgment"],
  "Vermeer": ["Girl with a Pearl Earring", "The Milkmaid", "View of Delft", "The Art of Painting"],
  "Renoir": ["Dance at Moulin de la Galette", "Luncheon of the Boating Party", "Two Sisters", "Bal du moulin"],
  "Degas": ["The Ballet Class", "Woman Combing Her Hair", "The Absinthe Drinker", "Ballet Rehearsal"],
  "Cézanne": ["Mont Sainte-Victoire", "The Card Players", "The Large Bathers", "Still Life with Apples"],
  "Klimt": ["The Kiss", "The Tree of Life", "Portrait of Adele", "The Beethoven Frieze"],
  "Munch": ["The Scream", "The Dance of Life", "Madonna", "The Sick Child"],
  "Kandinsky": ["Composition VII", "Yellow-Red-Blue", "Blue Rider", "Several Circles"],
  "Hokusai": ["The Great Wave", "Thirty-six Views of Mount Fuji", "Red Fuji"],
  "Botticelli": ["The Birth of Venus", "Primavera", "Venus and Mars"],
  "Rembrandt": ["The Night Watch", "Self-Portrait", "The Return of the Prodigal Son"]
};

// Group artworks by artist
const artistGroups = {};
artworks.forEach(artwork => {
  if (!artwork.artist) return;
  
  const artistName = artwork.artist.split('\n')[0].trim();
  const cleanName = artistName.replace(/\([^)]*\)/, '').trim();
  
  if (!artistGroups[cleanName]) {
    artistGroups[cleanName] = [];
  }
  artistGroups[cleanName].push(artwork);
});

console.log('=== FAMOUS ARTISTS FOUND IN DATABASE ===\n');

// Check each famous artist
Object.entries(famousMasterpieces).forEach(([targetArtist, targetWorks]) => {
  console.log(`🎨 ${targetArtist}:`);
  
  // Find matching artists in our database
  const matchingArtists = Object.keys(artistGroups).filter(dbArtist => {
    const dbLastName = dbArtist.split(' ').pop()?.toLowerCase() || '';
    const targetLastName = targetArtist.split(' ').pop()?.toLowerCase() || '';
    
    return dbArtist.toLowerCase().includes(targetArtist.toLowerCase()) ||
           targetArtist.toLowerCase().includes(dbArtist.toLowerCase()) ||
           (dbLastName && targetLastName && dbLastName === targetLastName);
  });
  
  if (matchingArtists.length === 0) {
    console.log(`   ❌ Not found in database`);
    console.log('');
    return;
  }
  
  matchingArtists.forEach(matchingArtist => {
    const works = artistGroups[matchingArtist];
    console.log(`   ✅ Found as: ${matchingArtist} (${works.length} works)`);
    
    // Check for famous works
    const foundFamousWorks = [];
    targetWorks.forEach(famousWork => {
      const foundWork = works.find(work => 
        work.title?.toLowerCase().includes(famousWork.toLowerCase()) ||
        famousWork.toLowerCase().includes(work.title?.toLowerCase() || '')
      );
      if (foundWork) {
        foundFamousWorks.push({
          title: foundWork.title,
          hasImage: !!(foundWork.cloudinaryUrl || foundWork.primaryImage),
          imageUrl: foundWork.cloudinaryUrl || foundWork.primaryImage || 'No image'
        });
      }
    });
    
    if (foundFamousWorks.length > 0) {
      console.log(`   🌟 Famous works available:`);
      foundFamousWorks.forEach(work => {
        console.log(`      • ${work.title} ${work.hasImage ? '🖼️' : '❌ No image'}`);
      });
    } else {
      console.log(`   ⚠️  No famous masterpieces found, but has ${works.length} other works`);
      // Show first 3 works as examples
      works.slice(0, 3).forEach(work => {
        console.log(`      • ${work.title || 'Untitled'}`);
      });
    }
  });
  
  console.log('');
});

// Summary statistics
const totalArtists = Object.keys(artistGroups).length;
const artistsWithImages = Object.values(artistGroups).filter(works => 
  works.some(work => work.cloudinaryUrl || work.primaryImage)
).length;

console.log('=== DATABASE SUMMARY ===');
console.log(`Total unique artists: ${totalArtists}`);
console.log(`Artists with images: ${artistsWithImages}`);
console.log(`Coverage: ${Math.round((artistsWithImages / totalArtists) * 100)}%`);

// Top artists by number of works
console.log('\n=== TOP ARTISTS BY VOLUME ===');
const topArtists = Object.entries(artistGroups)
  .sort(([,a], [,b]) => b.length - a.length)
  .slice(0, 10);

topArtists.forEach(([artist, works]) => {
  const withImages = works.filter(w => w.cloudinaryUrl || w.primaryImage).length;
  console.log(`${artist}: ${works.length} works (${withImages} with images)`);
});