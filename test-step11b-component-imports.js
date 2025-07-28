// Step 11-B: 5개 컴포넌트 파일들의 import 변경 테스트
console.log('🧪 Step 11-B 테스트: 컴포넌트 파일들 import 변경...');

const fs = require('fs');
const path = require('path');

const componentFiles = [
  'frontend/components/daily-challenge/DailyChallengeCard.tsx',
  'frontend/components/daily-challenge/MatchResults.tsx',
  'frontend/components/exhibition-companion/CreateCompanionRequest.tsx',  
  'frontend/components/art-pulse/EmotionBubbleCanvas.tsx',
  'frontend/components/art-pulse/EmotionSelector.tsx'
];

try {
  console.log('📂 5개 컴포넌트 파일 변경사항 검증...');
  
  let allPassed = true;
  
  componentFiles.forEach((filePath, index) => {
    const fullPath = path.join(__dirname, filePath);
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // 관련 타입들에 대한 기존/새 import 확인
    const hasOldImport = content.includes("} from '@/types/daily-challenge';") ||
                        content.includes("} from '@/types/exhibition-companion';") ||
                        content.includes("} from '@/types/art-pulse';");
    const hasNewImport = content.includes("} from '@sayu/shared';");
    
    console.log(`📄 ${index + 1}. ${path.basename(filePath)}:`);
    console.log(`   - 기존 import (@/types/*): ${hasOldImport ? '❌ 발견됨' : '✅ 제거됨'}`);
    console.log(`   - 새로운 import (@sayu/shared): ${hasNewImport ? '✅ 적용됨' : '❌ 없음'}`);
    console.log(`   - 결과: ${!hasOldImport && hasNewImport ? '✅ 성공' : '❌ 실패'}`);
    console.log('');
    
    if (hasOldImport || !hasNewImport) allPassed = false;
  });
  
  if (allPassed) {
    console.log('🎉 Step 11-B 모든 테스트 통과!');
    console.log('💡 5개 컴포넌트 파일이 모두 @sayu/shared를 사용합니다');
    console.log('');
    console.log('📊 현재까지 진행 상황:');
    console.log('   - API 파일: 4개 ✅');  
    console.log('   - 컴포넌트 파일: 5개 ✅');
    console.log('   - 총 변경: 9개 파일');
    console.log('   - 남은 파일: 약 21개');
  } else {
    throw new Error('일부 컴포넌트 파일에서 import 변경이 실패했습니다');
  }
  
} catch (error) {
  console.error('❌ 테스트 실패:', error.message);
  process.exit(1);
}