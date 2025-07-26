// Venue API 테스트 스크립트
const http = require('http');

function testAPI(path, description) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3006,
      path: path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`\n🔍 ${description}`);
        console.log(`📍 GET http://localhost:3006${path}`);
        console.log(`✅ Status: ${res.statusCode}`);
        
        try {
          const json = JSON.parse(data);
          console.log('📋 Response:');
          console.log(JSON.stringify(json, null, 2));
        } catch (e) {
          console.log('📄 Raw Response:', data);
        }
        resolve();
      });
    });

    req.on('error', (err) => {
      console.log(`❌ ${description} - Error:`, err.message);
      resolve();
    });

    req.setTimeout(5000, () => {
      console.log(`⏰ ${description} - Timeout`);
      req.destroy();
      resolve();
    });

    req.end();
  });
}

async function runTests() {
  console.log('🚀 SAYU Venue API 기능 테스트 시작\n');
  
  // 1. 헬스 체크
  await testAPI('/api/health', '헬스 체크');
  
  // 2. Venue 목록 조회
  await testAPI('/api/venues', 'Venue 목록 조회');
  
  // 3. 한국어 언어 설정
  await testAPI('/api/venues?lang=ko', 'Venue 목록 (한국어)');
  
  // 4. 영어 언어 설정
  await testAPI('/api/venues?lang=en', 'Venue 목록 (영어)');
  
  // 5. 도시별 필터링
  await testAPI('/api/venues?city=Seoul', 'Seoul 미술관 검색');
  
  // 6. 검색 기능
  await testAPI('/api/venues?search=museum', '미술관 텍스트 검색');
  
  // 7. 단일 venue 조회
  await testAPI('/api/venues/1', '국립현대미술관 상세 조회');
  
  // 8. 단일 venue 조회 (영어)
  await testAPI('/api/venues/1?lang=en', '국립현대미술관 상세 조회 (영어)');
  
  console.log('\n🎉 모든 테스트 완료!');
}

runTests().catch(console.error);