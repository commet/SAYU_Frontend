// 간단한 venue API 테스트
const http = require('http');

async function quickTest() {
  console.log('🚀 SAYU Backend Venue API 빠른 테스트\n');

  // 현재 실행 중인 서버 포트들 확인
  const ports = [3005, 3006, 3007];
  
  for (const port of ports) {
    console.log(`🔍 포트 ${port} 확인...`);
    
    try {
      const response = await fetch(`http://localhost:${port}/api/venues`);
      const data = await response.json();
      
      if (data.success && data.data) {
        console.log(`✅ 포트 ${port}: Venue API 정상 작동`);
        console.log(`📊 데이터: ${data.data.length}개 venue 발견`);
        console.log(`🌍 언어: ${data.language}`);
        data.data.slice(0, 2).forEach((venue, i) => {
          console.log(`   ${i+1}. ${venue.name_ko || venue.name} (${venue.city})`);
        });
        console.log('');
        break;
      } else {
        console.log(`❌ 포트 ${port}: ${data.error || 'API 응답 없음'}`);
      }
    } catch (error) {
      console.log(`❌ 포트 ${port}: 연결 실패`);
    }
  }
}

quickTest().catch(console.error);