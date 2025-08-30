// 포트 3003에서 테스트
async function test() {
  const response = await fetch('http://localhost:3003/api/chatbot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: '인기 있는 전시 알려줘',
      page: '/exhibitions',
      userType: 'LAEF'
    })
  });
  const result = await response.json();
  console.log('응답:', result.data?.response);
}

test();