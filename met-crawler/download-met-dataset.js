const axios = require('axios');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Met Museum GitHub 데이터셋 URL
const MET_DATASET_URL = 'https://media.githubusercontent.com/media/metmuseum/openaccess/master/MetObjects.csv';

// HTTPS 에이전트 (Windows 인증서 문제 해결)
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

async function downloadMetDataset() {
  console.log('📥 Met Museum 공식 데이터셋 다운로드 시작...\n');
  console.log('ℹ️  이 데이터셋은 약 500MB이며 470,000개 이상의 작품 정보를 포함합니다.\n');
  
  const outputPath = path.join(__dirname, 'MetObjects.csv');
  const writer = fs.createWriteStream(outputPath);
  
  try {
    const response = await axios({
      url: MET_DATASET_URL,
      method: 'GET',
      responseType: 'stream',
      httpsAgent,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const totalLength = response.headers['content-length'];
    let downloadedLength = 0;
    
    response.data.on('data', (chunk) => {
      downloadedLength += chunk.length;
      const percentage = totalLength ? ((downloadedLength / totalLength) * 100).toFixed(2) : '?';
      process.stdout.write(`\r진행률: ${percentage}% (${(downloadedLength / 1024 / 1024).toFixed(2)} MB)`);
    });
    
    response.data.pipe(writer);
    
    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        console.log('\n\n✅ 다운로드 완료!');
        console.log(`📁 파일 위치: ${outputPath}`);
        console.log(`📊 파일 크기: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB`);
        resolve(outputPath);
      });
      
      writer.on('error', reject);
    });
    
  } catch (error) {
    console.error('\n❌ 다운로드 실패:', error.message);
    throw error;
  }
}

// 다운로드한 CSV 파일에서 유명 작가 필터링
async function filterFamousArtists(csvPath) {
  console.log('\n🔍 유명 작가 작품 필터링 중...\n');
  
  const csv = require('csv-parser');
  const results = [];
  
  // 유명 작가 목록
  const famousArtists = [
    'Vincent van Gogh', 'Claude Monet', 'Rembrandt', 'Pablo Picasso',
    'Henri Matisse', 'Johannes Vermeer', 'Gustav Klimt', 'Edgar Degas',
    'Paul Cézanne', 'Pierre-Auguste Renoir', 'Katsushika Hokusai',
    'Leonardo da Vinci', 'Michelangelo', 'Botticelli', 'Andy Warhol',
    'Georgia O\'Keeffe', 'Edward Hopper', 'Salvador Dalí'
  ];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        // 공개 도메인이고 이미지가 있는 유명 작가 작품만 선별
        if (row['Is Public Domain'] === 'True' && 
            row['Image'] && 
            famousArtists.some(artist => 
              row['Artist Display Name']?.includes(artist))) {
          
          results.push({
            objectID: row['Object ID'],
            title: row['Title'],
            artist: row['Artist Display Name'],
            date: row['Object Date'],
            medium: row['Medium'],
            department: row['Department'],
            primaryImage: row['Image'],
            isHighlight: row['Is Highlight'] === 'True',
            metUrl: row['Link Resource']
          });
        }
      })
      .on('end', () => {
        console.log(`✅ ${results.length}개의 유명 작가 작품 발견!`);
        
        // 작가별 통계
        const stats = {};
        results.forEach(work => {
          stats[work.artist] = (stats[work.artist] || 0) + 1;
        });
        
        console.log('\n📊 작가별 작품 수:');
        Object.entries(stats)
          .sort((a, b) => b[1] - a[1])
          .forEach(([artist, count]) => {
            console.log(`  - ${artist}: ${count}개`);
          });
        
        resolve(results);
      })
      .on('error', reject);
  });
}

// 메인 실행 함수
async function main() {
  try {
    // 1. 데이터셋 다운로드
    const csvPath = await downloadMetDataset();
    
    // 2. csv-parser 설치 확인
    try {
      require('csv-parser');
    } catch (e) {
      console.log('\n📦 csv-parser 설치 중...');
      require('child_process').execSync('npm install csv-parser', { stdio: 'inherit' });
    }
    
    // 3. 유명 작가 필터링
    const famousArtworks = await filterFamousArtists(csvPath);
    
    // 4. 결과 저장
    const outputPath = path.join(__dirname, 'met-famous-artworks.json');
    fs.writeFileSync(outputPath, JSON.stringify({
      metadata: {
        source: 'Met Museum Open Access Dataset',
        date: new Date().toISOString(),
        total: famousArtworks.length
      },
      artworks: famousArtworks
    }, null, 2));
    
    console.log(`\n💾 결과 저장: ${outputPath}`);
    
  } catch (error) {
    console.error('오류:', error);
  }
}

if (require.main === module) {
  main();
}

module.exports = { downloadMetDataset, filterFamousArtists };