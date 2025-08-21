// API 직접 테스트
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3007,
  path: '/api/exhibitions?limit=2',
  method: 'GET',
  headers: {
    'Accept': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      if (json.exhibitions && json.exhibitions.length > 0) {
        console.log('🔍 API가 실제로 반환하는 데이터:\n');
        json.exhibitions.forEach((ex, idx) => {
          console.log(`${idx + 1}. 전시 정보:`);
          console.log(`   title: "${ex.title}"`);
          console.log(`   title_local: "${ex.title_local || 'undefined'}"`);
          console.log(`   venue: "${ex.venue}"`);
          console.log(`   description 시작: "${ex.description ? ex.description.substring(0, 60) + '...' : 'null'}"`);
          console.log('');
        });
      }
    } catch (e) {
      console.error('JSON 파싱 에러:', e);
      console.log('Raw response:', data.substring(0, 200));
    }
  });
});

req.on('error', (e) => {
  console.error(`문제 발생: ${e.message}`);
});

req.end();