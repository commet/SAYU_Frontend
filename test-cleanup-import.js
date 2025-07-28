// cleanupAPTDatabase.js의 import만 안전하게 테스트
console.log('🧪 cleanupAPTDatabase.js import 테스트...');

try {
  // 정확히 같은 import 구문 테스트
  const { VALID_TYPE_CODES, getSAYUType } = require('@sayu/shared');
  
  console.log('✅ Import 성공!');
  console.log('📊 VALID_TYPE_CODES 개수:', VALID_TYPE_CODES.length);
  console.log('🔍 첫 번째 타입 코드:', VALID_TYPE_CODES[0]);
  
  // getSAYUType 함수 테스트
  const testType = getSAYUType(VALID_TYPE_CODES[0]);
  console.log('🎯 함수 테스트 결과:', testType ? '성공' : '실패');
  
  console.log('🎉 모든 테스트 통과!');
} catch (error) {
  console.error('❌ Import 실패:', error.message);
  process.exit(1);
}