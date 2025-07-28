// Step 11-C2: 5개 혼합 파일들의 import 변경 테스트  
console.log('🧪 Step 11-C2 테스트: 혼합 파일들 import 변경...');

const fs = require('fs');
const path = require('path');

const mixedFiles = [
  'frontend/app/emotion-translator/page.tsx',
  'frontend/components/art-pulse/ArtPulseViewer.tsx',
  'frontend/components/art-pulse/PhaseIndicator.tsx',
  'frontend/components/art-pulse/ReflectionFeed.tsx',
  'frontend/components/art-pulse/SessionResults.tsx'
];

try {
  console.log('📂 5개 혼합 파일 변경사항 검증...');
  
  let allPassed = true;
  
  mixedFiles.forEach((filePath, index) => {
    const fullPath = path.join(__dirname, filePath);
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // 관련 타입들에 대한 기존/새 import 확인
    const hasOldImport = content.includes("from '@/types/emotion-translation'") ||
                        content.includes("from '@/types/art-pulse'");
    const hasNewImport = content.includes("from '@sayu/shared'");
    
    console.log(`📄 ${index + 1}. ${path.basename(filePath)}:`);
    console.log(`   - 기존 import (@/types/*): ${hasOldImport ? '❌ 발견됨' : '✅ 제거됨'}`);
    console.log(`   - 새로운 import (@sayu/shared): ${hasNewImport ? '✅ 적용됨' : '❌ 없음'}`);
    console.log(`   - 결과: ${!hasOldImport && hasNewImport ? '✅ 성공' : '❌ 실패'}`);
    console.log('');
    
    if (hasOldImport || !hasNewImport) allPassed = false;
  });
  
  if (allPassed) {
    console.log('🎉 Step 11-C2 모든 테스트 통과!');
    console.log('💡 5개 혼합 파일이 모두 @sayu/shared를 사용합니다');
    console.log('');
    console.log('📊 현재까지 누적 진행:');
    console.log('   - Artist: 4개 ✅');
    console.log('   - API: 4개 ✅'); 
    console.log('   - 초기 컴포넌트: 5개 ✅');
    console.log('   - art-profile: 5개 ✅');
    console.log('   - 혼합 파일: 5개 ✅');
    console.log('   - 총 변경: 23개 파일 ✅');
    
  } else {
    throw new Error('일부 혼합 파일에서 import 변경이 실패했습니다');
  }
  
} catch (error) {
  console.error('❌ 테스트 실패:', error.message);
  process.exit(1);
}