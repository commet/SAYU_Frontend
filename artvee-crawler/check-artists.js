const fs = require('fs');
const data = JSON.parse(fs.readFileSync('data/complete-artists-collection-2025-08-06T14-24-00.json', 'utf8'));

// 아티스트별 구간 찾기
let artists = [];
let currentArtist = '';
let startIndex = 0;

for(let i = 0; i < data.length; i++) {
  if(data[i].artist !== currentArtist) {
    if(currentArtist !== '') {
      artists.push({
        artist: currentArtist,
        start: startIndex + 1,
        end: i,
        count: i - startIndex
      });
    }
    currentArtist = data[i].artist;
    startIndex = i;
  }
}

// 마지막 아티스트 추가
if(currentArtist !== '') {
  artists.push({
    artist: currentArtist,
    start: startIndex + 1,
    end: data.length,
    count: data.length - startIndex
  });
}

// 처음 15개 아티스트 출력
console.log('아티스트 처리 순서:');
artists.slice(0, 15).forEach((item, index) => {
  const current = (index === 1) ? ' ← 현재 처리중' : '';
  console.log(`${index + 1}. ${item.artist} (${item.start}~${item.end}번째, ${item.count}개)${current}`);
});