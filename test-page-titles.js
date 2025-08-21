// Test if exhibitions page shows correct titles
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3002,
  path: '/exhibitions',
  method: 'GET',
  headers: {
    'Accept': 'text/html'
  }
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    // Check for correct exhibition titles
    const correctTitles = [
      '우관중: 흑과 백 사이',
      '평보 서희환 : 보통의 걸음',
      '집, 옷을 입다',
      '물질-실천',
      '漆-옻나무에서 칠기로',
      '공예동행@쇼윈도 #3'
    ];

    const incorrectPatterns = [
      '주요 전시품',
      '전시 구성',
      '주요 작품',
      '주요 섹션',
      '특별 프로그램',
      '관람 포인트'
    ];

    console.log('🔍 전시 페이지 제목 검증:\n');

    // Check for correct titles
    let foundCorrect = 0;
    correctTitles.forEach(title => {
      if (data.includes(title)) {
        console.log(`✅ "${title}" - 올바른 제목 발견`);
        foundCorrect++;
      } else {
        console.log(`❌ "${title}" - 제목을 찾을 수 없음`);
      }
    });

    console.log('\n🔍 잘못된 패턴 체크:\n');

    // Check for incorrect patterns that shouldn't be titles
    let foundIncorrect = 0;
    incorrectPatterns.forEach(pattern => {
      // Look for these patterns in title-like contexts
      const regex = new RegExp(`<h[1-6][^>]*>.*${pattern}.*</h[1-6]>|"title":"[^"]*${pattern}[^"]*"`, 'gi');
      if (regex.test(data)) {
        console.log(`⚠️ "${pattern}" - 제목으로 사용됨 (문제!)`);
        foundIncorrect++;
      } else {
        console.log(`✅ "${pattern}" - 제목으로 사용 안 됨`);
      }
    });

    console.log('\n📊 결과:');
    console.log(`- 올바른 제목: ${foundCorrect}/${correctTitles.length}`);
    console.log(`- 잘못된 패턴: ${foundIncorrect}/${incorrectPatterns.length}`);

    if (foundCorrect === correctTitles.length && foundIncorrect === 0) {
      console.log('\n🎉 모든 테스트 통과! 전시 제목이 올바르게 표시됩니다.');
    } else {
      console.log('\n⚠️ 일부 문제가 있습니다. 확인이 필요합니다.');
    }
  });
});

req.on('error', (e) => {
  console.error(`문제 발생: ${e.message}`);
});

req.end();