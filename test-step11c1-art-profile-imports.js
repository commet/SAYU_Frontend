// Step 11-C1: 5개 art-profile 컴포넌트 파일들의 import 변경 테스트
console.log('🧪 Step 11-C1 테스트: art-profile 컴포넌트들 import 변경...');

const fs = require('fs');
const path = require('path');

const artProfileFiles = [
  'frontend/components/art-profile/ArtProfileGallery.tsx',
  'frontend/components/art-profile/ArtProfileResult.tsx',
  'frontend/components/art-profile/StylePreviewGrid.tsx',
  'frontend/components/art-profile/StyleSelector.tsx',
  'frontend/components/art-profile/ArtProfileGenerator.tsx'
];

try {
  console.log('📂 5개 art-profile 컴포넌트 파일 변경사항 검증...');
  
  let allPassed = true;
  
  artProfileFiles.forEach((filePath, index) => {
    const fullPath = path.join(__dirname, filePath);
    const content = fs.readFileSync(fullPath, 'utf8');
    
    const hasOldImport = content.includes("from '@/types/art-profile'");
    const hasNewImport = content.includes("from '@sayu/shared'");
    
    console.log(`📄 ${index + 1}. ${path.basename(filePath)}:`);
    console.log(`   - 기존 import (@/types/art-profile): ${hasOldImport ? '❌ 발견됨' : '✅ 제거됨'}`);
    console.log(`   - 새로운 import (@sayu/shared): ${hasNewImport ? '✅ 적용됨' : '❌ 없음'}`);
    console.log(`   - 결과: ${!hasOldImport && hasNewImport ? '✅ 성공' : '❌ 실패'}`);
    console.log('');
    
    if (hasOldImport || !hasNewImport) allPassed = false;
  });
  
  if (allPassed) {
    console.log('🎉 Step 11-C1 모든 테스트 통과!');
    console.log('💡 5개 art-profile 컴포넌트가 모두 @sayu/shared를 사용합니다');
  } else {
    throw new Error('일부 art-profile 컴포넌트에서 import 변경이 실패했습니다');
  }
  
} catch (error) {
  console.error('❌ 테스트 실패:', error.message);
  process.exit(1);
}