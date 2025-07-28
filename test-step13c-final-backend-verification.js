// Step 13-C: 중위험 3개 Backend 파일 변경 최종 검증
console.log('🧪 Step 13-C 최종 검증: 중위험 3개 Backend 파일 변경 완료...');

const fs = require('fs');
const path = require('path');

const changedFiles = [
  {
    path: 'backend/src/middleware/aptValidation.js',
    expectedImports: ['VALID_TYPE_CODES', 'getSAYUType'],
    description: 'APT 검증 미들웨어'
  },
  {
    path: 'backend/src/data/sayuEnhancedQuizData.js',
    expectedImports: ['SAYU_TYPES', 'validateSAYUType'],
    description: '퀴즈 데이터 구조'
  },
  {
    path: 'backend/src/controllers/aptRecommendationController.js',
    expectedImports: ['SAYU_TYPES'],
    description: 'APT 추천 컨트롤러'
  }
];

try {
  console.log('🔍 Step 1: 3개 파일 변경사항 검증...');
  
  let allPassed = true;
  const results = [];
  
  changedFiles.forEach((fileInfo, index) => {
    const fullPath = path.join(__dirname, fileInfo.path);
    
    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Import 상태 확인
      const hasOldImport = content.includes("require('../../../shared/SAYUTypeDefinitions')");
      const hasNewImport = content.includes("require('@sayu/shared')");
      
      const result = {
        file: fileInfo.path,
        description: fileInfo.description,
        hasOldImport,
        hasNewImport,
        success: !hasOldImport && hasNewImport,
        expectedImports: fileInfo.expectedImports
      };
      
      results.push(result);
      
      console.log(`📄 ${index + 1}. ${path.basename(fileInfo.path)}:`);
      console.log(`   - 설명: ${fileInfo.description}`);
      console.log(`   - 기존 import: ${hasOldImport ? '❌ 아직 있음' : '✅ 제거됨'}`);
      console.log(`   - 새로운 import: ${hasNewImport ? '✅ 적용됨' : '❌ 없음'}`);
      console.log(`   - 결과: ${result.success ? '✅ 성공' : '❌ 실패'}`);
      console.log('');
      
      if (!result.success) allPassed = false;
      
    } catch (error) {
      console.log(`📄 ${index + 1}. ${path.basename(fileInfo.path)}: ❌ 파일 읽기 실패`);
      allPassed = false;
    }
  });
  
  console.log('📊 변경 결과 요약:');
  const successCount = results.filter(r => r.success).length;
  console.log(`   - 성공한 파일: ${successCount}/${results.length}`);
  console.log(`   - 실패한 파일: ${results.length - successCount}/${results.length}`);
  
  if (allPassed) {
    console.log('✅ 모든 파일 변경 성공!');
    
    // @sayu/shared 패키지 실제 사용 테스트
    console.log('');
    console.log('🔍 Step 2: @sayu/shared 패키지 종합 테스트...');
    
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
      console.log(`❌ 누락된 exports: ${missingExports.join(', ')}`);
      throw new Error('일부 필요한 exports가 누락되었습니다');
    }
    
    console.log('');
    console.log('🎉 Step 13 완전 성공!');
    console.log('💡 중위험 3개 Backend 파일이 모두 @sayu/shared를 정상적으로 사용할 수 있습니다');
    console.log('');
    console.log('🏆 현재까지 전체 진행률:');
    console.log('   - Frontend: 33개 파일 ✅');
    console.log('   - Backend 안전군: 6개 파일 ✅ (Step 12)');
    console.log('   - Backend 중위험: 3개 파일 ✅ (Step 13)');
    console.log('   - 총 변경: 42개 파일 ✅');
    console.log('   - Ultra-safe 리팩토링 연속 성공! 🚀');
    console.log('');
    console.log('⏳ 남은 Backend 고위험 파일들: 9개 (Models, Core systems)');
    console.log('   - 다음 단계에서 더욱 신중하게 처리 예정');
    
  } else {
    throw new Error('일부 파일에서 변경이 실패했습니다');
  }
  
} catch (error) {
  console.error('❌ 최종 검증 실패:', error.message);
  process.exit(1);
}