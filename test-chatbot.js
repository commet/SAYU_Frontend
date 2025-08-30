// 챗봇 API 테스트 스크립트
async function testChatbot() {
  const response = await fetch('http://localhost:3001/api/chatbot', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: '현재 진행중인 전시가 몇 개야?',
      page: '/exhibitions',
      userType: 'LAEF'
    })
  });
  
  const result = await response.json();
  console.log('API Response:', JSON.stringify(result, null, 2));
}

testChatbot();