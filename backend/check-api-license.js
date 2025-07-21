#!/usr/bin/env node

console.log('🔍 공공데이터 API 상업적 이용 가능 여부 확인\n');

console.log('📋 공공누리(KOGL) 라이선스 4가지 유형:\n');

const licenses = [
  {
    type: '제1유형',
    icon: '🟢',
    commercial: true,
    modification: true,
    desc: '출처표시만 하면 상업적 이용 가능, 변경 가능',
    example: '대부분의 공공데이터포털 Open API'
  },
  {
    type: '제2유형',
    icon: '🟡',
    commercial: false,
    modification: true,
    desc: '비영리 목적으로만 사용 가능',
    example: '일부 연구 데이터'
  },
  {
    type: '제3유형',
    icon: '🟠',
    commercial: true,
    modification: false,
    desc: '상업적 이용 가능하나 변경 불가',
    example: '일부 저작물 데이터'
  },
  {
    type: '제4유형',
    icon: '🔴',
    commercial: false,
    modification: false,
    desc: '상업적 이용 및 변경 모두 불가',
    example: '민감한 공공데이터'
  }
];

licenses.forEach(license => {
  console.log(`${license.icon} ${license.type}`);
  console.log(`   상업적 이용: ${license.commercial ? '✅ 가능' : '❌ 불가'}`);
  console.log(`   변경/가공: ${license.modification ? '✅ 가능' : '❌ 불가'}`);
  console.log(`   설명: ${license.desc}`);
  console.log(`   예시: ${license.example}\n`);
});

console.log('🎨 전시정보 API 라이선스 확인:\n');

const exhibitionAPIs = [
  {
    name: '문화체육관광부 12개 기관 전시정보',
    url: 'https://www.data.go.kr/data/15105037/openapi.do',
    license: '공공누리 제1유형',
    commercial: '✅ 상업적 이용 가능',
    requirement: '출처 표시 필수'
  },
  {
    name: '국립현대미술관 전시정보',
    url: 'https://www.data.go.kr/data/15058313/openapi.do',
    license: '공공누리 제1유형',
    commercial: '✅ 상업적 이용 가능',
    requirement: '출처 표시 필수'
  },
  {
    name: '문화공공데이터광장',
    url: 'https://www.culture.go.kr',
    license: '대부분 제1유형',
    commercial: '✅ 상업적 이용 가능',
    requirement: '개별 데이터 라이선스 확인 필요'
  }
];

exhibitionAPIs.forEach(api => {
  console.log(`📌 ${api.name}`);
  console.log(`   라이선스: ${api.license}`);
  console.log(`   상업적 이용: ${api.commercial}`);
  console.log(`   요구사항: ${api.requirement}\n`);
});

console.log('✅ SAYU 프로젝트에서 사용 가능한 방법:\n');
console.log('1. 공공누리 제1유형 API 사용 시:');
console.log('   - 상업적 이용 가능');
console.log('   - 출처 표시 필수 (예: "출처: 문화체육관광부")');
console.log('   - 데이터 가공/변경 가능');
console.log();
console.log('2. 출처 표시 예시:');
console.log('   - 웹사이트 하단: "전시 정보 제공: 문화체육관광부 공공데이터"');
console.log('   - API 응답에 source 필드 추가');
console.log('   - 이용약관에 명시');
console.log();
console.log('3. 주의사항:');
console.log('   - API 신청 시 사용 목적 정확히 기재');
console.log('   - 일일 호출 제한 준수');
console.log('   - 데이터 재판매는 별도 협의 필요');

console.log('\n💡 결론: 대부분의 전시정보 API는 출처만 표시하면 상업적 이용 가능!');