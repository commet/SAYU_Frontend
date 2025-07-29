const fs = require('fs');
const path = require('path');

// Files found from the grep search
const filesToUpdate = [
  'frontend/app/api/personality-types/route.ts',
  'frontend/app/personality-overview/page.tsx',
  'frontend/app/results/page.tsx',
  'frontend/components/collection/SharedCollectionCreator.tsx',
  'frontend/components/collection/SharedCollectionViewer.tsx',
  'frontend/components/easter-egg/EasterEggNotification.tsx',
  'frontend/components/gallery/RealtimeGalleryExplorer.tsx',
  'frontend/components/matching/APTCompatibilityVisualization.tsx',
  'frontend/components/matching/ArtworkInteractionPrompts.tsx',
  'frontend/components/matching/ExhibitionCompanionMatch.tsx',
  'frontend/components/matching/MatchedInteractionView.tsx',
  'frontend/components/PersonalityTypeGrid.tsx',
  'frontend/components/privacy/ProgressiveRevealProfile.tsx',
  'frontend/components/profile/BadgeShowcase.tsx',
  'frontend/constants/personality-gradients.ts',
  'frontend/contexts/EasterEggContext.tsx',
  'frontend/data/personality-animals.ts',
  'frontend/data/personality-descriptions.ts',
  'frontend/lib/easter-egg/easter-egg-service.ts',
  'frontend/lib/museums/recommendation-engine.ts',
  'frontend/lib/supabase/matching-api.ts',
  'frontend/types/art-persona-matching.ts'
];

// Map of import patterns to replace
const importPatterns = [
  {
    // Pattern: @/shared/SAYUTypeDefinitions
    pattern: /from ['"]@\/shared\/SAYUTypeDefinitions['"]/g,
    replacement: "from '@sayu/shared'"
  },
  {
    // Pattern: ../../../shared/SAYUTypeDefinitions
    pattern: /from ['"]\.\.\/\.\.\/\.\.\/shared\/SAYUTypeDefinitions['"]/g,
    replacement: "from '@sayu/shared'"
  },
  {
    // Pattern: ../shared/SAYUTypeDefinitions
    pattern: /from ['"]\.\.\/shared\/SAYUTypeDefinitions['"]/g,
    replacement: "from '@sayu/shared'"
  },
  {
    // Pattern: ../../../shared/easterEggDefinitions
    pattern: /from ['"]\.\.\/\.\.\/\.\.\/shared\/easterEggDefinitions['"]/g,
    replacement: "from '@sayu/shared'"
  },
  {
    // Pattern: @/shared/easterEggDefinitions
    pattern: /from ['"]@\/shared\/easterEggDefinitions['"]/g,
    replacement: "from '@sayu/shared'"
  }
];

console.log('Starting to update shared imports...\n');

filesToUpdate.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let originalContent = content;
  let modified = false;
  
  // Apply all patterns
  importPatterns.forEach(({ pattern, replacement }) => {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      modified = true;
    }
  });
  
  if (modified) {
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Updated: ${filePath}`);
    
    // Show what was changed
    const lines = originalContent.split('\n');
    const newLines = content.split('\n');
    lines.forEach((line, i) => {
      if (line !== newLines[i] && line.includes('import')) {
        console.log(`   Before: ${line.trim()}`);
        console.log(`   After:  ${newLines[i].trim()}`);
      }
    });
  } else {
    console.log(`⚠️  No changes needed: ${filePath}`);
  }
});

console.log('\n✨ Import update complete!');
console.log('\nNext steps:');
console.log('1. Run "npm run build:shared" from the root to build the shared package');
console.log('2. Run "npm run typecheck" to verify all imports are working');