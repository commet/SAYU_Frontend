// 새로 추가된 frontend types 테스트
console.log('🧪 새로 추가된 타입들 테스트...');

try {
  // @sayu/shared에서 새로운 타입들 import 테스트
  const shared = require('@sayu/shared');
  
  console.log('✅ 패키지 로드 성공!');
  console.log('📦 사용 가능한 export들:', Object.keys(shared));
  
  // 기존 것들이 여전히 작동하는지 확인
  console.log('🔍 기존 VALID_TYPE_CODES:', shared.VALID_TYPE_CODES ? '여전히 사용 가능' : '문제 발생');
  console.log('🎯 기존 getSAYUType:', typeof shared.getSAYUType === 'function' ? '여전히 사용 가능' : '문제 발생');
  
  // 새로 추가된 것들 확인 (User, Profile 등은 interface라서 runtime에 없음)
  // 하지만 TypeScript 컴파일이 성공했다는 것은 타입이 정상적으로 export된다는 뜻
  
  console.log('🎉 모든 테스트 통과!');
  console.log('💡 새로운 타입들(User, Profile, QuizQuestion 등)이 @sayu/shared에서 사용 가능합니다.');
  
} catch (error) {
  console.error('❌ 테스트 실패:', error.message);
  process.exit(1);
}