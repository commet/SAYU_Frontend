// Step 9-C: 모든 Artist import 변경 종합 테스트
console.log('🧪 Step 9-C 테스트: 모든 Artist import 변경 검증...');

const fs = require('fs');
const path = require('path');

const filesToTest = [
  'frontend/app/artists/page.tsx',
  'frontend/components/artists/ArtistCard.tsx',
  'frontend/components/artists/ArtistsGrid.tsx',
  'frontend/components/home/FeaturedArtists.tsx'
];

try {
  console.log('📂 4개 파일 변경사항 검증...');
  
  let allPassed = true;
  const results = [];
  
  filesToTest.forEach((filePath, index) => {
    const fullPath = path.join(__dirname, filePath);
    
    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // 기존 import 패턴들 확인
      const oldImports = [
        "from '@/types/artist'",
        "} from '@/types/artist'"
      ];
      
      const newImports = [
        "from '@sayu/shared'",
        "} from '@sayu/shared'"  
      ];
      
      const hasOldImport = oldImports.some(pattern => content.includes(pattern));
      const hasNewImport = newImports.some(pattern => content.includes(pattern));
      
      const result = {
        file: filePath,
        hasOldImport,
        hasNewImport,
        success: !hasOldImport && hasNewImport
      };
      
      results.push(result);
      
      console.log(`📄 ${index + 1}. ${filePath}:`);
      console.log(`   - 기존 import: ${hasOldImport ? '❌ 발견됨' : '✅ 제거됨'}`);
      console.log(`   - 새로운 import: ${hasNewImport ? '✅ 적용됨' : '❌ 없음'}`);
      console.log(`   - 결과: ${result.success ? '✅ 성공' : '❌ 실패'}`);
      console.log('');
      
      if (!result.success) allPassed = false;
      
    } catch (error) {
      console.log(`📄 ${index + 1}. ${filePath}: ❌ 파일 읽기 실패 - ${error.message}`);
      allPassed = false;
    }
  });
  
  console.log('📊 종합 결과:');
  console.log(`   - 성공한 파일: ${results.filter(r => r.success).length}/${results.length}`);
  console.log(`   - 실패한 파일: ${results.filter(r => !r.success).length}/${results.length}`);
  
  if (allPassed) {
    console.log('🎉 모든 테스트 통과!');
    console.log('💡 4개 파일이 모두 @sayu/shared에서 Artist 타입을 사용합니다');
    
    // 추가 확인: @sayu/shared에서 Artist 타입 export 확인
    const sharedIndexPath = path.join(__dirname, 'packages', 'shared', 'src', 'index.ts');
    const sharedContent = fs.readFileSync(sharedIndexPath, 'utf8');
    
    if (sharedContent.includes("export * from './types/artist';")) {
      console.log('✅ @sayu/shared에서 Artist 타입 정상 export 확인');
    } else {
      console.log('⚠️ @sayu/shared에서 Artist 타입 export 상태 확인 필요');
    }
    
  } else {
    throw new Error('일부 파일에서 import 변경이 실패했습니다');
  }
  
} catch (error) {
  console.error('❌ 테스트 실패:', error.message);
  process.exit(1);
}