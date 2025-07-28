// Step 9-A: frontend/app/artists/page.tsx의 Artist import 변경 테스트
console.log('🧪 Step 9-A 테스트: frontend Artist import 변경...');

const fs = require('fs');
const path = require('path');

try {
  console.log('📂 frontend/app/artists/page.tsx 파일 분석...');
  
  const filePath = path.join(__dirname, 'frontend', 'app', 'artists', 'page.tsx');
  const content = fs.readFileSync(filePath, 'utf8');
  
  // 변경사항 확인
  const hasOldImport = content.includes("import { Artist } from '@/types/artist';");
  const hasNewImport = content.includes("import { Artist } from '@sayu/shared';");
  
  console.log('🔍 변경사항 확인:');
  console.log(`   - 기존 import (@/types/artist): ${hasOldImport ? '❌ 발견됨 (문제!)' : '✅ 제거됨'}`);
  console.log(`   - 새로운 import (@sayu/shared): ${hasNewImport ? '✅ 적용됨' : '❌ 없음 (문제!)'}`);
  
  if (!hasOldImport && hasNewImport) {
    console.log('✅ import 변경 성공!');
    
    // Artist 타입 사용 확인
    const artistUsages = [
      'useState<Artist[]>([]);',
      'prev.map(artist',
      'artist.id',
      'isFollowing: true'
    ];
    
    console.log('🔍 Artist 타입 사용 확인:');
    let allUsagesFound = true;
    artistUsages.forEach(usage => {
      const found = content.includes(usage);
      console.log(`   - "${usage}": ${found ? '✅' : '❌'}`);
      if (!found) allUsagesFound = false;
    });
    
    if (allUsagesFound) {
      console.log('🎉 모든 테스트 통과!');
      console.log('💡 frontend/app/artists/page.tsx가 @sayu/shared에서 Artist 타입을 정상적으로 사용합니다');
    } else {
      console.log('⚠️ 일부 사용법이 변경되었을 수 있습니다');
    }
    
  } else {
    throw new Error('import 변경이 올바르게 적용되지 않았습니다');
  }
  
} catch (error) {
  console.error('❌ 테스트 실패:', error.message);
  process.exit(1);
}