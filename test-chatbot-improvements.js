// Test script for improved chatbot responses
const testCases = [
  {
    message: "추천 전시 보여줘",
    userType: "LAEF",
    page: "home",
    expected: "구체적 전시 정보 (장소, 날짜, 가격 포함)"
  },
  {
    message: "이번 주말에 갈 만한 곳 있어?",
    userType: "SREF", 
    page: "gallery",
    expected: "실제 전시장 정보와 일정"
  },
  {
    message: "현대미술 전시 찾고 있어",
    userType: "LRMF",
    page: "exhibitions", 
    expected: "현대미술 관련 전시 추천"
  }
];

async function testChatbot() {
  console.log("🤖 챗봇 개선사항 테스트 시작");
  
  for (const test of testCases) {
    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: test.message,
          userId: 'test-user',
          userType: test.userType,
          page: test.page
        })
      });
      
      const data = await response.json();
      
      console.log(`\n📝 테스트: ${test.message}`);
      console.log(`💬 응답: ${data.data?.response || '응답 없음'}`);
      console.log(`📏 응답 길이: ${data.data?.response?.length || 0}자`);
      console.log(`💡 제안사항: ${data.data?.suggestions?.join(', ') || '없음'}`);
      
      // 응답 품질 체크
      const response_text = data.data?.response || '';
      const checks = {
        '100자 이하': response_text.length <= 100,
        '구체적 정보 포함': /\d+\.\d+|\d+원|미술관|박물관|전시|~/.test(response_text),
        '낭만적 표현 최소화': !/아름다운|신비로운|감성적인|영감을|마음에/.test(response_text)
      };
      
      console.log('✅ 품질 체크:', Object.entries(checks).map(([k,v]) => `${k}: ${v ? '✓' : '✗'}`).join(', '));
      
    } catch (error) {
      console.error(`❌ 테스트 실패: ${test.message}`, error.message);
    }
  }
  
  console.log("\n🏁 테스트 완료");
}

// Node.js 환경에서 실행
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testChatbot };
}