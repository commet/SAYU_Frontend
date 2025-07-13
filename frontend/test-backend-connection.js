// 백엔드 연결 테스트 스크립트
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

console.log('🔍 백엔드 연결 테스트 시작...\n');
console.log(`📡 API URL: ${API_URL}`);

async function testConnection() {
  console.log('\n1️⃣ Health Check 테스트:');
  try {
    const response = await fetch(`${API_URL}/api/health`);
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ 연결 성공!');
      console.log('   응답:', JSON.stringify(data, null, 2));
    } else {
      console.log('   ❌ 연결 실패:', response.status, response.statusText);
    }
  } catch (error) {
    console.log('   ❌ 연결 오류:', error.message);
  }

  console.log('\n2️⃣ 퀴즈 API 테스트:');
  try {
    const response = await fetch(`${API_URL}/api/quiz/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language: 'ko'
      })
    });
    
    if (response.ok) {
      console.log('   ✅ 퀴즈 API 접근 가능');
    } else {
      console.log('   ⚠️  퀴즈 API 상태:', response.status);
    }
  } catch (error) {
    console.log('   ❌ 퀴즈 API 오류:', error.message);
  }

  console.log('\n3️⃣ 게임화 API 테스트:');
  try {
    const response = await fetch(`${API_URL}/api/gamification/stats/test-user`);
    if (response.ok) {
      console.log('   ✅ 게임화 API 접근 가능');
    } else {
      console.log('   ⚠️  게임화 API 상태:', response.status);
    }
  } catch (error) {
    console.log('   ❌ 게임화 API 오류:', error.message);
  }
}

testConnection().then(() => {
  console.log('\n✨ 테스트 완료!');
  console.log('\n💡 백엔드 서버가 실행 중인지 확인하세요:');
  console.log('   cd backend && npm run dev');
});