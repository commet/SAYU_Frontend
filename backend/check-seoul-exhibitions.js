/**
 * 서울 전시 데이터 확인
 */

const fs = require('fs');
const path = require('path');

// 가장 최근 파일 찾기
const files = fs.readdirSync('.').filter(f => f.startsWith('artmap-asian-cities-'));
if (files.length === 0) {
  console.log('No data files found');
  process.exit(1);
}

const latestFile = files.sort().reverse()[0];
console.log(`Reading from: ${latestFile}\n`);

const data = JSON.parse(fs.readFileSync(latestFile, 'utf8'));

// 서울 전시 정보
console.log('=== Seoul Exhibitions ===');
const seoulExhibitions = data.exhibitions.filter(ex => ex.city === 'Seoul');
console.log(`Total Seoul exhibitions: ${seoulExhibitions.length}\n`);

// 처음 10개 출력
seoulExhibitions.slice(0, 10).forEach((ex, i) => {
  console.log(`${i + 1}. ${ex.title}`);
  console.log(`   URL: ${ex.url}`);
  console.log();
});

// 실제 서울 장소인지 확인하기 위해 URL 패턴 분석
console.log('\n=== URL Pattern Analysis ===');
const urlPatterns = {};
seoulExhibitions.forEach(ex => {
  const match = ex.url.match(/\/([^\/]+)\/exhibition\//);
  if (match) {
    const venue = match[1];
    urlPatterns[venue] = (urlPatterns[venue] || 0) + 1;
  }
});

console.log('Venues in URLs:');
Object.entries(urlPatterns)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .forEach(([venue, count]) => {
    console.log(`  ${venue}: ${count} exhibitions`);
  });

// 부산과 광주 전시도 확인
console.log('\n\n=== Other Korean Cities ===');
const busanExhibitions = data.exhibitions.filter(ex => ex.city === 'Busan');
const gwangjuExhibitions = data.exhibitions.filter(ex => ex.city === 'Gwangju');

console.log(`Busan exhibitions: ${busanExhibitions.length}`);
console.log(`Gwangju exhibitions: ${gwangjuExhibitions.length}`);

// 전체 도시 통계
console.log('\n\n=== All Cities Summary ===');
const cityStats = {};
data.exhibitions.forEach(ex => {
  cityStats[ex.city] = (cityStats[ex.city] || 0) + 1;
});

Object.entries(cityStats)
  .sort((a, b) => b[1] - a[1])
  .forEach(([city, count]) => {
    console.log(`${city}: ${count} exhibitions`);
  });