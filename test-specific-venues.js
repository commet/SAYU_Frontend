// 특정 미술관 전시 확인
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3007,
  path: '/api/exhibitions?limit=50',
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
      if (json.exhibitions) {
        console.log('🔍 문제가 있는 미술관 전시 확인:\n');
        
        // 서울서예박물관과 서울공예박물관 전시만 필터링
        const problematicVenues = json.exhibitions.filter(ex => 
          ex.venue?.includes('서울서예박물관') || 
          ex.venue?.includes('서울공예박물관')
        );
        
        if (problematicVenues.length > 0) {
          problematicVenues.forEach((ex, idx) => {
            console.log(`\n${idx + 1}. ${ex.venue}`);
            console.log(`   API title: "${ex.title}"`);
            console.log(`   title_local: "${ex.title_local || 'undefined'}"`);
            
            // title이 description 첫 줄과 같은지 확인
            if (ex.description) {
              const firstLine = ex.description.split('\n')[0].substring(0, 60);
              if (ex.title && ex.title.includes(firstLine.substring(0, 30))) {
                console.log(`   ⚠️ 제목이 description 첫 줄입니다!`);
              }
            }
          });
        } else {
          console.log('서울서예박물관, 서울공예박물관 전시가 응답에 없습니다.');
          
          // 전체 전시 중 처음 10개 확인
          console.log('\n전체 전시 목록 (처음 10개):');
          json.exhibitions.slice(0, 10).forEach((ex, idx) => {
            console.log(`${idx + 1}. ${ex.venue}: "${ex.title}"`);
          });
        }
      }
    } catch (e) {
      console.error('JSON 파싱 에러:', e);
    }
  });
});

req.on('error', (e) => {
  console.error(`문제 발생: ${e.message}`);
});

req.end();