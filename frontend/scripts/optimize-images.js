const fs = require('fs');
const path = require('path');

// Files that use 'next/image' import
const filesToUpdate = [
  'app/login/page.tsx',
  'app/quiz/results/page.tsx',
  'app/collections/[id]/page.tsx',
  'app/artwork/[id]/page.tsx',
  'components/perception-exchange/ExchangeInviteModal.tsx',
  'app/emotion-translator/page.tsx',
  'components/art-profile/StylePreviewGrid.tsx',
  'components/art-profile/ArtProfileResult.tsx',
  'components/art-profile/ArtProfileGallery.tsx',
  'components/daily-challenge/DailyChallengeCard.tsx',
  'components/home/FeaturedArtists.tsx',
  'components/artists/ArtistCard.tsx',
  'components/apt-theme/APTArtworkCard.tsx',
  'components/apt/EvolvingAnimalImage.tsx',
  'components/matching/ArtworkInteractionPrompts.tsx',
];

// Convert import statements
function updateImports(content) {
  return content.replace(
    /import\s+(?:Image|{\s*Image\s*})\s+from\s+['"]next\/image['"]/g,
    "import { OptimizedImage } from '@/components/ui/OptimizedImage'"
  );
}

// Convert Image components to OptimizedImage
function updateImageComponents(content) {
  // Replace <Image with <OptimizedImage
  let updated = content.replace(/<Image\b/g, '<OptimizedImage');
  
  // Add placeholder="blur" if not present
  updated = updated.replace(
    /(<OptimizedImage[^>]*?)(\s*\/>|>)/g,
    (match, p1, p2) => {
      if (!p1.includes('placeholder=')) {
        return `${p1} placeholder="blur"${p2}`;
      }
      return match;
    }
  );
  
  // Add quality if not present
  updated = updated.replace(
    /(<OptimizedImage[^>]*?)(\s*\/>|>)/g,
    (match, p1, p2) => {
      if (!p1.includes('quality=')) {
        return `${p1} quality={90}${p2}`;
      }
      return match;
    }
  );
  
  return updated;
}

// Process each file
filesToUpdate.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  
  try {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Check if file uses next/image
      if (content.includes('from \'next/image\'') || content.includes('from "next/image"')) {
        console.log(`Processing ${file}...`);
        
        // Update imports
        content = updateImports(content);
        
        // Update components
        content = updateImageComponents(content);
        
        // Write back
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Updated ${file}`);
      } else {
        console.log(`⏭️  Skipped ${file} - doesn't use next/image`);
      }
    } else {
      console.log(`❌ File not found: ${file}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
});

console.log('\n🎉 Image optimization complete!');