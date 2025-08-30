// 주요 미술관 우선 정렬 테스트
async function testMajorVenues() {
  const response = await fetch('http://localhost:3002/api/chatbot', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: '인기 있는 전시 알려줘',
      page: '/exhibitions',
      userType: 'LAEF'
    })
  });
  
  const result = await response.json();
  console.log('챗봇 응답:', result.data?.response);
}

console.log('주요 미술관 우선 추천 테스트...');
testMajorVenues();