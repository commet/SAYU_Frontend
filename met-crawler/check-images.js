const fs = require('fs');

// JSON 파일 읽기
const data = JSON.parse(fs.readFileSync('./met-artworks-data/met-artworks-2025-07-17T10-29-45-111Z.json', 'utf8'));

console.log(`총 ${data.artworks.length}개 작품\n`);

// 처음 5개 작품의 이미지 URL 출력
data.artworks.slice(0, 5).forEach((artwork, index) => {
  console.log(`${index + 1}. ${artwork.title} by ${artwork.artist}`);
  console.log(`   이미지: ${artwork.primaryImage}`);
  console.log(`   작은 이미지: ${artwork.primaryImageSmall}\n`);
});