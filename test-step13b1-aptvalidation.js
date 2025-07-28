// Step 13-B1: aptValidation.js Ultra-safe 변경 테스트
console.log('🧪 Step 13-B1 Ultra-safe 테스트: aptValidation.js 변경...');

const fs = require('fs');
const path = require('path');

const targetFile = 'backend/src/middleware/aptValidation.js';

try {
  console.log('🔍 Step 1: 변경 전 상태 분석...');
  
  const fullPath = path.join(__dirname, targetFile);
  const content = fs.readFileSync(fullPath, 'utf8');
  
  // Import 패턴 분석
  const hasOldImport = content.includes("require('../../../shared/SAYUTypeDefinitions')");
  const hasNewImport = content.includes("require('@sayu/shared')");
  
  // 사용되는 exports 확인
  const usesValidTypeCodes = content.includes('VALID_TYPE_CODES');
  const usesGetSayuType = content.includes('getSAYUType');
  
  console.log('📄 aptValidation.js 현재 상태:');
  console.log(`   - 파일 크기: ${content.length} characters`);
  console.log(`   - 기존 import: ${hasOldImport ? '✅ 발견' : '❌ 없음'}`);
  console.log(`   - 새로운 import: ${hasNewImport ? '⚠️ 이미 변경됨' : '✅ 변경 필요'}`);
  console.log(`   - VALID_TYPE_CODES 사용: ${usesValidTypeCodes ? '✅' : '❌'}`);
  console.log(`   - getSAYUType 사용: ${usesGetSayuType ? '✅' : '❌'}`);
  
  if (!hasOldImport) {
    if (hasNewImport) {
      console.log('✅ 이미 @sayu/shared를 사용하고 있습니다');
      console.log('🎉 aptValidation.js는 이미 올바른 상태입니다!');
      return;
    } else {
      throw new Error('예상되는 import 패턴을 찾을 수 없습니다');
    }
  }
  
  // 변경 준비 상태 확인
  if (hasOldImport && !hasNewImport) {
    console.log('🟢 변경 준비 완료!');
    
    // @sayu/shared 접근성 테스트
    console.log('');
    console.log('🔍 Step 2: @sayu/shared 필요한 exports 확인...');
    
    const backendPath = path.join(__dirname, 'backend');
    process.chdir(backendPath);
    
    const shared = require('@sayu/shared');
    const requiredExports = ['VALID_TYPE_CODES', 'getSAYUType'];
    const availableExports = requiredExports.filter(exp => shared[exp]);
    
    console.log(`📦 필요한 exports: ${requiredExports.join(', ')}`);
    console.log(`✅ 사용 가능한 exports: ${availableExports.join(', ')}`);
    
    if (availableExports.length === requiredExports.length) {
      console.log('✅ 모든 필요한 exports 확인됨');
      console.log('🎯 aptValidation.js 변경 준비 100% 완료!');
      
      // 파일 내용 추가 분석
      console.log('');
      console.log('🔍 Step 3: 파일 내용 안전성 분석...');
      
      const lines = content.split('\\n');
      console.log(`   - 총 라인 수: ${lines.length}`);
      console.log(`   - Import 라인: ${lines.findIndex(line => line.includes('require')) + 1}`);
      
      const importLine = lines.find(line => line.includes("require('../../../shared/SAYUTypeDefinitions')"));
      if (importLine) {
        console.log(`   - 현재 import: ${importLine.trim()}`);
        console.log(`   - 변경 예정: ${importLine.replace("require('../../../shared/SAYUTypeDefinitions')", "require('@sayu/shared')").trim()}`);
      }
      
      console.log('🟢 Ultra-safe 분석 완료 - 변경 준비됨!');
      
    } else {
      throw new Error(`필요한 exports가 누락됨: ${requiredExports.filter(exp => !shared[exp]).join(', ')}`);
    }
    
  } else {
    throw new Error('예상하지 못한 파일 상태입니다');
  }
  
} catch (error) {
  console.error('❌ 테스트 실패:', error.message);
  process.exit(1);
}