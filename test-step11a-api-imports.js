// Step 11-A: API 파일들의 import 변경 테스트
console.log('🧪 Step 11-A 테스트: API 파일들 import 변경...');

const fs = require('fs');
const path = require('path');

const apiFiles = [
  'frontend/lib/api/art-pulse.ts',
  'frontend/lib/api/daily-challenge.ts', 
  'frontend/lib/api/exhibition-companion.ts',
  'frontend/lib/api/perception-exchange.ts'
];

try {
  console.log('📂 4개 API 파일 변경사항 검증...');
  
  let allPassed = true;
  
  apiFiles.forEach((filePath, index) => {
    const fullPath = path.join(__dirname, filePath);
    const content = fs.readFileSync(fullPath, 'utf8');
    
    const hasOldImport = content.includes("} from '@/types/");
    const hasNewImport = content.includes("} from '@sayu/shared';");
    
    console.log(`📄 ${index + 1}. ${filePath}:`);
    console.log(`   - 기존 import (@/types/*): ${hasOldImport ? '❌ 발견됨' : '✅ 제거됨'}`);
    console.log(`   - 새로운 import (@sayu/shared): ${hasNewImport ? '✅ 적용됨' : '❌ 없음'}`);
    console.log(`   - 결과: ${!hasOldImport && hasNewImport ? '✅ 성공' : '❌ 실패'}`);
    console.log('');
    
    if (hasOldImport || !hasNewImport) allPassed = false;
  });
  
  if (allPassed) {
    console.log('🎉 Step 11-A 모든 테스트 통과!');
    console.log('💡 4개 API 파일이 모두 @sayu/shared를 사용합니다');
  } else {
    throw new Error('일부 API 파일에서 import 변경이 실패했습니다');
  }
  
} catch (error) {
  console.error('❌ 테스트 실패:', error.message);
  process.exit(1);
}