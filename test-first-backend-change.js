// 첫 번째 backend 파일 변경 테스트
console.log('🧪 첫 번째 backend 파일 변경 테스트...');

const path = require('path');

try {
  // backend 디렉토리로 이동
  const backendPath = path.join(__dirname, 'backend');
  process.chdir(backendPath);
  
  console.log('📂 작업 디렉토리:', process.cwd());
  
  // 변경된 파일이 정상적으로 require되는지 테스트
  console.log('🔍 restoreImportantArtists.js 로드 테스트...');
  
  // 파일의 첫 부분만 테스트 (실제 실행은 하지 않음)
  const fs = require('fs');
  const filePath = './restoreImportantArtists.js';
  const content = fs.readFileSync(filePath, 'utf8');
  
  // import 문이 올바르게 변경되었는지 확인
  const hasOldImport = content.includes("require('../shared/SAYUTypeDefinitions')");
  const hasNewImport = content.includes("require('@sayu/shared')");
  
  console.log('📄 Import 상태 확인:');
  console.log(`   - 기존 import: ${hasOldImport ? '❌ 아직 있음' : '✅ 제거됨'}`);
  console.log(`   - 새로운 import: ${hasNewImport ? '✅ 적용됨' : '❌ 없음'}`);
  
  if (!hasOldImport && hasNewImport) {
    console.log('✅ Import 변경 성공!');
    
    // @sayu/shared에서 필요한 exports 로드 테스트
    console.log('🔍 @sayu/shared exports 테스트...');
    const shared = require('@sayu/shared');
    
    const requiredExports = ['VALID_TYPE_CODES', 'getSAYUType'];
    const availableExports = requiredExports.filter(exp => shared[exp]);
    
    console.log(`📦 필요한 exports: ${requiredExports.join(', ')}`);
    console.log(`✅ 사용 가능한 exports: ${availableExports.join(', ')}`);
    
    if (availableExports.length === requiredExports.length) {
      console.log('🎉 첫 번째 파일 변경 완전 성공!');
      console.log('💡 restoreImportantArtists.js가 @sayu/shared를 정상적으로 사용할 수 있습니다');
    } else {
      throw new Error('일부 필요한 exports가 누락되었습니다');
    }
    
  } else {
    throw new Error('Import 변경이 올바르게 적용되지 않았습니다');
  }
  
} catch (error) {
  console.error('❌ 테스트 실패:', error.message);
  process.exit(1);
}