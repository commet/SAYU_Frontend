// 브라우저 콘솔에서 실행할 챗봇 테스트 코드
// 1. http://localhost:3001/exhibitions 페이지로 이동
// 2. 브라우저 콘솔 열기 (F12)
// 3. 아래 코드 붙여넣고 실행

async function testChatbotInBrowser() {
  // 챗봇 버튼 찾기
  const chatButton = document.querySelector('[aria-label*="chat"], [aria-label*="Chat"], button[class*="chatbot"], button[class*="Chatbot"]');
  if (chatButton) {
    chatButton.click();
    console.log('챗봇 열림');
    
    // 잠시 대기
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 입력 필드 찾기
    const input = document.querySelector('input[placeholder*="메시지"], input[placeholder*="질문"], textarea[placeholder*="메시지"], textarea[placeholder*="질문"]');
    const sendButton = document.querySelector('button[type="submit"], button[aria-label*="send"], button[aria-label*="Send"]');
    
    if (input && sendButton) {
      // 테스트 메시지 입력
      input.value = '현재 진행중인 전시가 몇 개야?';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      
      // 전송 버튼 클릭
      sendButton.click();
      console.log('메시지 전송됨');
      
      // 응답 대기
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // 응답 확인
      const messages = document.querySelectorAll('[class*="message"], [class*="Message"]');
      const lastMessage = messages[messages.length - 1];
      console.log('챗봇 응답:', lastMessage?.textContent);
    } else {
      console.log('입력 필드나 전송 버튼을 찾을 수 없습니다');
    }
  } else {
    console.log('챗봇 버튼을 찾을 수 없습니다');
  }
}

// 직접 API 호출 테스트
async function testAPIDirectly() {
  const response = await fetch('/api/chatbot', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: '현재 진행중인 전시가 몇 개야?',
      page: window.location.pathname,
      userType: 'LAEF'
    })
  });
  
  const result = await response.json();
  console.log('API 직접 호출 결과:', result);
  
  if (result.data?.response) {
    console.log('\n챗봇 응답:');
    console.log(result.data.response);
  }
}

console.log('테스트 시작...');
console.log('현재 페이지:', window.location.pathname);
console.log('\n1. API 직접 호출 테스트:');
testAPIDirectly();

console.log('\n테스트 완료! 위 응답을 확인해주세요.');