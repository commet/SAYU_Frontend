const fs = require('fs').promises;

async function convertUrls() {
  // 단순 문자열 배열 읽기
  const data = await fs.readFile('./data/artwork-urls-optimized.json', 'utf8');
  const urls = JSON.parse(data);
  
  // 객체 배열로 변환
  const converted = urls.map(url => ({
    url: url,
    lastmod: new Date().toISOString(),
    collected: new Date().toISOString()
  }));
  
  // 저장
  await fs.writeFile('./data/artvee-urls.json', JSON.stringify(converted, null, 2));
  console.log(`✅ ${converted.length}개 URL 변환 완료`);
}

convertUrls().catch(console.error);