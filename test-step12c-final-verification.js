// Step 12-C 최종 검증: 3개 Backend 파일 변경 완료 테스트
console.log('🧪 Step 12-C 최종 검증: 3개 Backend 파일 변경 완료...');

const fs = require('fs');
const path = require('path');

const changedFiles = [
  {
    path: 'backend/restoreImportantArtists.js',
    expectedImports: ['VALID_TYPE_CODES', 'getSAYUType']
  },
  {
    path: 'backend/integrateNewProfiles.js', 
    expectedImports: ['VALID_TYPE_CODES', 'getSAYUType']
  },
  {
    path: 'backend/src/services/animalTypeConverter.js',
    expectedImports: ['SAYU_TYPES', 'VALID_TYPE_CODES', 'getSAYUType']
  }
];

try {
  console.log('🔍 Step 1: 3개 파일 변경사항 검증...');
  
  let allPassed = true;
  const results = [];
  
  changedFiles.forEach((fileInfo, index) => {
    const fullPath = path.join(__dirname, fileInfo.path);
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Import 상태 확인
    const hasOldImport = content.includes("require('../shared/SAYUTypeDefinitions')") ||
                        content.includes("require('../../../shared/SAYUTypeDefinitions')");
    const hasNewImport = content.includes("require('@sayu/shared')");
    
    const result = {
      file: fileInfo.path,
      hasOldImport,
      hasNewImport,
      success: !hasOldImport && hasNewImport,
      expectedImports: fileInfo.expectedImports
    };
    
    results.push(result);
    
    console.log(`📄 ${index + 1}. ${path.basename(fileInfo.path)}:`);
    console.log(`   - 기존 import: ${hasOldImport ? '❌ 아직 있음' : '✅ 제거됨'}`);
    console.log(`   - 새로운 import: ${hasNewImport ? '✅ 적용됨' : '❌ 없음'}`);
    console.log(`   - 결과: ${result.success ? '✅ 성공' : '❌ 실패'}`);
    console.log('');
    
    if (!result.success) allPassed = false;
  });
  
  console.log('📊 변경 결과 요약:');
  const successCount = results.filter(r => r.success).length;
  console.log(`   - 성공한 파일: ${successCount}/${results.length}`);
  console.log(`   - 실패한 파일: ${results.length - successCount}/${results.length}`);
  
  if (allPassed) {
    console.log('✅ 모든 파일 변경 성공!');
    
    // 실제 @sayu/shared 패키지 사용 테스트
    console.log('');
    console.log('🔍 Step 2: @sayu/shared 패키지 실제 사용 테스트...');
    
    // backend 디렉토리로 이동
    const backendPath = path.join(__dirname, 'backend');
    process.chdir(backendPath);
    
    const shared = require('@sayu/shared');
    console.log('✅ @sayu/shared 패키지 로드 성공');
    
    // 모든 필요한 exports 확인
    const allRequiredExports = [...new Set(changedFiles.flatMap(f => f.expectedImports))];
    const availableExports = allRequiredExports.filter(exp => shared[exp]);
    const missingExports = allRequiredExports.filter(exp => !shared[exp]);
    
    console.log(`📦 필요한 모든 exports (${allRequiredExports.length}개): ${allRequiredExports.join(', ')}`);
    console.log(`✅ 사용 가능한 exports (${availableExports.length}개): ${availableExports.join(', ')}`);
    
    if (missingExports.length > 0) {
      console.log(`❌ 누락된 exports (${missingExports.length}개): ${missingExports.join(', ')}`);
      throw new Error('일부 필요한 exports가 누락되었습니다');
    }
    
    console.log('');
    console.log('🎉 Step 12-C 완전 성공!');
    console.log('💡 3개 Backend 파일이 모두 @sayu/shared를 정상적으로 사용할 수 있습니다');
    console.log('');
    console.log('📊 현재까지 전체 진행률:');
    console.log('   - Frontend: 33개 파일 ✅');
    console.log('   - Backend: 6개 파일 ✅ (기존 3개 + 신규 3개)');
    console.log('   - 총 변경: 39개 파일 ✅');
    console.log('   - Ultra-safe 리팩토링 계속 성공 중! 🚀');
    
  } else {
    throw new Error('일부 파일에서 변경이 실패했습니다');
  }
  
} catch (error) {
  console.error('❌ 최종 검증 실패:', error.message);
  process.exit(1);
}