// Step 12-C: Ultra-safe Backend 타입 import 변경 테스트
console.log('🧪 Step 12-C Ultra-safe 테스트: Backend 3개 파일 import 변경...');

const fs = require('fs');
const path = require('path');

const targetFiles = [
  'backend/restoreImportantArtists.js',
  'backend/integrateNewProfiles.js',
  'backend/src/services/animalTypeConverter.js'
];

try {
  console.log('🔍 Step 1: 변경 전 상태 검증...');
  
  const fileStates = {};
  
  targetFiles.forEach((filePath, index) => {
    const fullPath = path.join(__dirname, filePath);
    
    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // 현재 import 패턴 확인
      const hasOldImport = content.includes("require('../shared/SAYUTypeDefinitions')") ||
                          content.includes("require('../../../shared/SAYUTypeDefinitions')");
      const hasNewImport = content.includes("require('@sayu/shared')");
      
      fileStates[filePath] = {
        exists: true,
        hasOldImport,
        hasNewImport,
        content: content.substring(0, 200) // 처음 200자만 저장 (백업용)
      };
      
      console.log(`📄 ${index + 1}. ${path.basename(filePath)}:`);
      console.log(`   - 파일 존재: ✅`);
      console.log(`   - 기존 import: ${hasOldImport ? '✅ 발견' : '❌ 없음'}`);
      console.log(`   - 새로운 import: ${hasNewImport ? '⚠️ 이미 변경됨' : '✅ 변경 필요'}`);
      console.log(`   - 상태: ${hasOldImport && !hasNewImport ? '🟢 변경 준비' : hasNewImport ? '🟡 이미 변경됨' : '🔴 문제 있음'}`);
      console.log('');
      
    } catch (error) {
      fileStates[filePath] = { exists: false, error: error.message };
      console.log(`📄 ${index + 1}. ${path.basename(filePath)}: ❌ 파일 읽기 실패 - ${error.message}`);
    }
  });
  
  console.log('📊 변경 전 상태 요약:');
  const readyFiles = Object.keys(fileStates).filter(file => 
    fileStates[file].exists && fileStates[file].hasOldImport && !fileStates[file].hasNewImport
  );
  const alreadyChangedFiles = Object.keys(fileStates).filter(file =>
    fileStates[file].exists && fileStates[file].hasNewImport
  );
  const errorFiles = Object.keys(fileStates).filter(file => !fileStates[file].exists);
  
  console.log(`   - 변경 준비된 파일: ${readyFiles.length}개`);
  console.log(`   - 이미 변경된 파일: ${alreadyChangedFiles.length}개`);
  console.log(`   - 문제 파일: ${errorFiles.length}개`);
  
  if (readyFiles.length > 0) {
    console.log('');
    console.log('🎯 변경 준비된 파일들:');
    readyFiles.forEach(file => {
      console.log(`   - ${path.basename(file)}`);
    });
  }
  
  if (alreadyChangedFiles.length > 0) {
    console.log('');
    console.log('✅ 이미 변경된 파일들:');
    alreadyChangedFiles.forEach(file => {
      console.log(`   - ${path.basename(file)}`);
    });
  }
  
  // @sayu/shared 패키지 접근 가능성 테스트
  console.log('');
  console.log('🔍 Step 2: @sayu/shared 패키지 접근성 테스트...');
  
  try {
    // backend에서 @sayu/shared 접근 테스트
    const backendPath = path.join(__dirname, 'backend');
    process.chdir(backendPath);
    
    const shared = require('@sayu/shared');
    console.log('✅ @sayu/shared 패키지 로드 성공');
    console.log(`   - Export 개수: ${Object.keys(shared).length}개`);
    
    // 필요한 exports 확인
    const requiredExports = ['VALID_TYPE_CODES', 'getSAYUType', 'SAYU_TYPES'];
    const missingExports = requiredExports.filter(exp => !shared[exp]);
    
    if (missingExports.length === 0) {
      console.log('✅ 모든 필요한 exports 확인됨');
      console.log('🎉 Backend에서 @sayu/shared 사용 준비 완료!');
    } else {
      console.log(`❌ 누락된 exports: ${missingExports.join(', ')}`);
      throw new Error('필요한 exports가 누락되었습니다');
    }
    
  } catch (error) {
    console.error('❌ @sayu/shared 패키지 접근 실패:', error.message);
    console.log('⚠️ backend에서 @sayu/shared 패키지에 접근할 수 없습니다');
    console.log('   해결 방법: backend 디렉토리에서 npm install 필요할 수 있습니다');
    throw error;
  }
  
} catch (error) {
  console.error('❌ 테스트 실패:', error.message);
  process.exit(1);
}