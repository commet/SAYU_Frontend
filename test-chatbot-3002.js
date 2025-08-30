// 포트 3002에서 테스트
async function testChatbotWithRealData() {
  const questions = [
    '현재 진행중인 전시가 몇 개야?',
    '무료 전시 추천해줘',
    '인기 있는 전시 알려줘'
  ];
  
  for (const question of questions) {
    console.log(`\n질문: ${question}`);
    console.log('---');
    
    const response = await fetch('http://localhost:3002/api/chatbot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: question,
        page: '/exhibitions',
        userType: 'LAEF'
      })
    });
    
    const result = await response.json();
    
    if (result.success && result.data) {
      console.log('챗봇 응답:', result.data.response);
      console.log('제공자:', result.data.contextAnalysis?.provider || 'unknown');
    } else {
      console.log('오류:', result);
    }
    
    // 각 질문 사이에 짧은 딜레이
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

console.log('실시간 데이터 기반 챗봇 테스트 시작 (포트 3002)...');
testChatbotWithRealData();