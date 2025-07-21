#!/usr/bin/env node

console.log('🔍 한국관광공사 API 전시 정보 확인\n');

console.log('📌 한국관광공사 국문 관광정보 서비스');
console.log('URL: https://www.data.go.kr/data/15101578/openapi.do\n');

console.log('✅ 제공 정보:');
console.log('1. 관광지 정보 (contentTypeId=12)');
console.log('2. 문화시설 정보 (contentTypeId=14) ⭐');
console.log('3. 축제/공연/행사 (contentTypeId=15) ⭐');
console.log('4. 숙박 정보 (contentTypeId=32)');
console.log('5. 음식점 정보 (contentTypeId=39)\n');

console.log('🎨 전시 관련 데이터:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('1. contentTypeId=14 (문화시설)');
console.log('   - 미술관, 박물관, 갤러리 등 시설 정보');
console.log('   - 위치, 운영시간, 관람료, 연락처');
console.log('   - 시설 소개 및 이미지\n');

console.log('2. contentTypeId=15 (축제/공연/행사)');
console.log('   - 전시회, 특별전 등 이벤트 정보');
console.log('   - 기간, 장소, 내용');
console.log('   - 실시간 업데이트\n');

console.log('3. 키워드 검색 API');
console.log('   - "전시", "미술관", "갤러리" 키워드로 검색');
console.log('   - 상세 정보 조회 가능\n');

console.log('📊 장단점:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('장점:');
console.log('✅ 즉시 승인 (바로 사용 가능)');
console.log('✅ 안정적인 서비스');
console.log('✅ 전국 데이터 포함');
console.log('✅ 이미지, 상세정보 포함');
console.log('✅ 다국어 지원\n');

console.log('단점:');
console.log('❌ 개별 전시 정보는 제한적');
console.log('❌ 주로 시설 정보 위주');
console.log('❌ 작은 갤러리는 누락 가능\n');

console.log('💡 활용 방법:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('1. 미술관/갤러리 시설 정보 수집 (contentTypeId=14)');
console.log('2. 전시/이벤트 정보 수집 (contentTypeId=15)');
console.log('3. 두 정보를 조합하여 전시 DB 구축');
console.log('4. 주기적으로 업데이트\n');

console.log('🔧 예시 API 호출:');
console.log(`
// 서울 지역 문화시설 조회
GET http://apis.data.go.kr/B551011/KorService1/areaBasedList1
?serviceKey=인증키
&numOfRows=100
&pageNo=1
&MobileOS=ETC
&MobileApp=SAYU
&contentTypeId=14  // 문화시설
&areaCode=1       // 서울

// 전시 키워드 검색
GET http://apis.data.go.kr/B551011/KorService1/searchKeyword1
?serviceKey=인증키
&keyword=전시
&contentTypeId=15  // 행사
`);

console.log('\n⚠️ 참고:');
console.log('한국관광공사 API는 "관광" 관점의 정보라서');
console.log('순수 전시 정보만을 위한 API는 아닙니다.');
console.log('하지만 현재 사용 가능한 API 중 가장 안정적입니다.');

console.log('\n🎯 추천:');
console.log('1. 한국관광공사 API로 기본 데이터 구축');
console.log('2. 주요 미술관 웹사이트 크롤링으로 보완');
console.log('3. 사용자 제보 시스템 추가');