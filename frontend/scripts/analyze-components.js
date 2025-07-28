const fs = require('fs');
const path = require('path');

// Components that should be loaded dynamically
const componentsToOptimize = [
  // Heavy chart components
  { 
    file: 'components/insights/EmotionalJourneyMap.tsx',
    imports: ['EmotionalJourneyMap'],
    reason: 'Uses recharts - heavy charting library'
  },
  { 
    file: 'components/insights/GrowthTracker.tsx',
    imports: ['GrowthTracker'],
    reason: 'Uses recharts - heavy charting library'
  },
  { 
    file: 'components/insights/ViewingPatternsChart.tsx',
    imports: ['ViewingPatternsChart'],
    reason: 'Uses recharts - heavy charting library'
  },
  // 3D components
  { 
    file: 'components/spatial/AICuratorAvatar.tsx',
    imports: ['AICuratorAvatar', 'AICurator3DChat'],
    reason: 'Uses @react-three/fiber - 3D rendering'
  },
  { 
    file: 'components/spatial/InteractiveDimensions.tsx',
    imports: ['ArtStudioDimension', 'GalleryHallDimension', 'CommunityLoungeDimension'],
    reason: 'Uses @react-three/fiber - 3D rendering'
  },
  // Complex features
  { 
    file: 'components/art-profile/ArtProfileGenerator.tsx',
    imports: ['ArtProfileGenerator'],
    reason: 'Complex AI generation component'
  },
  { 
    file: 'components/quiz/AudioGuideQuiz.tsx',
    imports: ['AudioGuideQuiz'],
    reason: 'Audio processing component'
  },
];

// Find usage of these components
function findComponentUsage(componentName) {
  const results = [];
  
  function searchDir(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        searchDir(filePath);
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          if (content.includes(`import`) && content.includes(componentName)) {
            const importMatch = content.match(new RegExp(`import.*${componentName}.*from`, 's'));
            if (importMatch) {
              results.push({
                file: filePath.replace(/\\/g, '/'),
                usage: importMatch[0].replace(/\n/g, ' ').trim()
              });
            }
          }
        } catch (error) {
          // Ignore read errors
        }
      }
    });
  }
  
  searchDir(path.join(__dirname, '..'));
  return results;
}

console.log('🔍 Analyzing component usage for code splitting optimization...\n');

componentsToOptimize.forEach(component => {
  console.log(`\n📦 ${component.file}`);
  console.log(`   Reason: ${component.reason}`);
  
  component.imports.forEach(importName => {
    const usages = findComponentUsage(importName);
    if (usages.length > 0) {
      console.log(`   ✅ ${importName} is used in:`);
      usages.forEach(usage => {
        console.log(`      - ${usage.file}`);
      });
    } else {
      console.log(`   ⚠️  ${importName} is not used anywhere`);
    }
  });
});

console.log('\n\n💡 Recommendation:');
console.log('   Convert these imports to dynamic imports with React.lazy() and Suspense');
console.log('   This will reduce initial bundle size and improve loading performance');