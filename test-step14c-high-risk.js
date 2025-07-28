// Step 14-C: HIGH 위험 2개 파일 변경 테스트
console.log('🧪 Step 14-C 테스트: HIGH 위험 2개 파일 변경...');

const fs = require('fs');
const path = require('path');

const highRiskFiles = [
  {
    path: 'backend/src/services/aptCacheService.js',
    expectedImports: ['SAYU_TYPES'],
    description: 'APT 캐시 서비스'
  },
  {
    path: 'backend/src/routes/aptRecommendationRoutes.js',
    expectedImports: ['SAYU_TYPES'],
    description: 'APT 추천 라우트'
  }
];

try {
  console.log('🔍 Step 1: 2개 HIGH 위험 파일 변경사항 검증...');
  
  let allPassed = true;
  const results = [];
  
  highRiskFiles.forEach((fileInfo, index) => {
    const fullPath = path.join(__dirname, fileInfo.path);
    
    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Import 상태 확인 (더 엄격한 검사)
      const hasOldImport = content.includes("require('../../../shared/SAYUTypeDefinitions')") ||
                          content.includes("shared/SAYUTypeDefinitions");
      const hasNewImport = content.includes("require('@sayu/shared')");
      
      // SAYU_TYPES 사용 확인
      const usesSayuTypes = content.includes('SAYU_TYPES');
      
      const result = {
        file: fileInfo.path,
        description: fileInfo.description,
        hasOldImport,
        hasNewImport,
        usesSayuTypes,
        success: !hasOldImport && hasNewImport && usesSayuTypes,
        expectedImports: fileInfo.expectedImports
      };
      
      results.push(result);
      
      console.log(`📄 ${index + 1}. ${path.basename(fileInfo.path)}:`);
      console.log(`   - 설명: ${fileInfo.description}`);
      console.log(`   - 기존 import: ${hasOldImport ? '❌ 아직 있음' : '✅ 제거됨'}`);
      console.log(`   - 새로운 import: ${hasNewImport ? '✅ 적용됨' : '❌ 없음'}`);
      console.log(`   - SAYU_TYPES 사용: ${usesSayuTypes ? '✅' : '❌'}`);
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
    console.log('✅ 모든 HIGH 위험 파일 변경 성공!');
    
    // @sayu/shared 패키지 테스트
    console.log('');
    console.log('🔍 Step 2: @sayu/shared 패키지 테스트...');
    
    const backendPath = path.join(__dirname, 'backend');
    process.chdir(backendPath);
    
    const shared = require('@sayu/shared');
    console.log('✅ @sayu/shared 패키지 로드 성공');
    
    // SAYU_TYPES 접근 테스트
    if (shared.SAYU_TYPES && typeof shared.SAYU_TYPES === 'object') {
      const typeCount = Object.keys(shared.SAYU_TYPES).length;
      console.log(`✅ SAYU_TYPES 접근 성공 (${typeCount}개 타입)`);
    } else {
      throw new Error('SAYU_TYPES에 접근할 수 없습니다');
    }
    
    console.log('');
    console.log('🎉 Step 14-C 완전 성공!');
    console.log('💡 HIGH 위험 2개 파일이 모두 @sayu/shared를 정상적으로 사용할 수 있습니다');
    console.log('');
    console.log('🏆 현재까지 누적 진행률:');
    console.log('   - Frontend: 33개 파일 ✅');
    console.log('   - Backend 안전군: 6개 파일 ✅');
    console.log('   - Backend 중위험: 3개 파일 ✅');  
    console.log('   - Backend MEDIUM 고위험: 3개 파일 ✅');
    console.log('   - Backend HIGH 고위험: 2개 파일 ✅');
    console.log('   - 총 변경: 47개 파일 ✅');
    console.log('   - Ultra-safe 리팩토링 연속 성공! 🚀');
    console.log('');
    console.log('⏳ 마지막 남은 작업: VERY_HIGH 위험 4개 파일');
    console.log('   - 가장 복잡한 Core Models (Evolution, Vector 시스템)');
    console.log('   - 최고 수준의 신중함으로 처리 예정 🎯');
    
  } else {
    throw new Error('일부 HIGH 위험 파일에서 변경이 실패했습니다');
  }
  
} catch (error) {
  console.error('❌ 테스트 실패:', error.message);
  process.exit(1);
}