#!/usr/bin/env node

console.log('📋 공공데이터포털 API 신청 가이드\n');

console.log('🔍 추천 API: "문화체육관광부_12개 기관 전시정보"\n');

console.log('1️⃣ API 찾기:');
console.log('   • 상단 검색창에 "전시정보" 검색');
console.log('   • 또는 "문화체육관광부 12개 기관" 검색');
console.log('   • 찾은 API 클릭\n');

console.log('2️⃣ 활용신청 버튼 클릭:');
console.log('   • API 상세 페이지에서 우측 상단 "활용신청" 버튼');
console.log('   • 파란색 버튼입니다\n');

console.log('3️⃣ 신청서 작성:');
console.log('   📝 활용목적: "미술관 전시 정보 제공 서비스 개발"');
console.log('   📝 상세용도: "사용자 성격 기반 맞춤형 미술관 추천 서비스에서 전시 정보 제공"');
console.log('   📝 활용정보: "전시명, 기간, 장소, 작가 정보 등"');
console.log('   📝 저장형태: "데이터베이스 저장 후 서비스 제공"');
console.log('   📝 이용기간: "제한없음" 선택');
console.log('   📝 활용형태: "웹서비스" 선택\n');

console.log('4️⃣ 제출 후:');
console.log('   • 자동승인: 즉시 사용 가능');
console.log('   • 수동승인: 1-2일 내 승인 (이메일 알림)');
console.log('   • 마이페이지 > 데이터활용 > 오픈API에서 확인\n');

console.log('5️⃣ 인증키 확인:');
console.log('   • 마이페이지 > 데이터활용 > 오픈API');
console.log('   • "인증키" 항목에서 복사');
console.log('   • 일반적으로 URL Encoding된 긴 문자열\n');

console.log('6️⃣ 테스트:');
console.log('   • API 문서의 "요청/응답 예제" 확인');
console.log('   • 브라우저에서 직접 테스트 가능');
console.log('   • 예시 URL:');
console.log('     http://api.data.go.kr/openapi/tn_pubr_public_museum_exhibition_api');
console.log('     ?serviceKey=인증키');
console.log('     &pageNo=1');
console.log('     &numOfRows=10');
console.log('     &type=json\n');

console.log('💡 꿀팁:');
console.log('   • "전시" 키워드로 검색하면 여러 API 발견 가능');
console.log('   • 자동승인 API를 먼저 신청해서 테스트');
console.log('   • 하나의 인증키로 여러 API 사용 가능한 경우도 있음');
console.log('   • 일일 트래픽 제한 확인 (보통 1000건/일)');

console.log('\n🎯 추천 순서:');
console.log('1. "문화체육관광부_12개 기관 전시정보" (주요 미술관)');
console.log('2. "한국문화정보원_문화행사정보" (전국 문화행사)');
console.log('3. "서울특별시_문화행사 정보" (서울 지역)');
