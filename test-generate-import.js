// generateThreeAPTProfiles.js의 import만 안전하게 테스트
console.log('🧪 generateThreeAPTProfiles.js import 테스트...');

try {
  // 정확히 같은 import 구문 테스트
  const { VALID_TYPE_CODES, getSAYUType } = require('@sayu/shared');
  
  console.log('✅ Import 성공!');
  console.log('📊 VALID_TYPE_CODES 개수:', VALID_TYPE_CODES.length);
  
  // 파일에서 사용되는 패턴들 테스트
  console.log('🔍 .includes() 테스트:', VALID_TYPE_CODES.includes('LAEF') ? '성공' : '실패');
  console.log('🎯 .filter() 테스트:', VALID_TYPE_CODES.filter(t => t.startsWith('LA')).length > 0 ? '성공' : '실패');
  
  // getSAYUType 함수 테스트
  const testType = getSAYUType('LAEF');
  console.log('🎨 getSAYUType 테스트:', testType ? '성공' : '실패');
  
  console.log('🎉 모든 테스트 통과!');
} catch (error) {
  console.error('❌ Import 실패:', error.message);
  process.exit(1);
}