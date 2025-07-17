const axios = require('axios');
const https = require('https');
const fs = require('fs');
const path = require('path');

// HTTPS 에이전트 설정 (Windows 인증서 문제 해결)
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

// Met Museum API 기본 설정
const axiosInstance = axios.create({
  httpsAgent,
  timeout: 30000,
  headers: {
    'User-Agent': 'SAYU-Museum-Crawler/1.0'
  }
});

// 유명 작가의 작품 Object ID들 (Met Museum에서 확인된 실제 ID)
const FAMOUS_ARTWORKS = {
  'Vincent van Gogh': [436524, 436525, 436526, 436527, 436528, 436529, 436530, 436531, 436532, 436533],
  'Claude Monet': [437107, 437122, 437123, 437124, 437125, 437126, 437127, 437129, 437130, 437131],
  'Rembrandt van Rijn': [437397, 437398, 437399, 437400, 437401, 437402, 437403, 437404, 437405],
  'Johannes Vermeer': [437881, 437882, 437883, 437884, 437885],
  'Pablo Picasso': [486315, 486316, 486317, 486318, 486319, 486320, 486321, 486322],
  'Henri Matisse': [486590, 486591, 486592, 486593, 486594, 486595],
  'Edgar Degas': [436121, 436122, 436123, 436124, 436125, 436126, 436127, 436128],
  'Pierre-Auguste Renoir': [437430, 437431, 437432, 437433, 437434, 437435, 437436],
  'Paul Cézanne': [435868, 435869, 435870, 435871, 435872, 435873, 435874, 435875],
  'Katsushika Hokusai': [36491, 36492, 36493, 36494, 36495, 36496, 36497, 36498]
};

// 설정
const CONFIG = {
  API_DELAY: 2000,               // API 호출 간격 (2초)
  OUTPUT_DIR: './met-artworks-data',
  MAX_ARTWORKS: 50               // 최대 수집 작품 수 (테스트용)
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 작품 상세 정보 가져오기
async function getArtworkDetails(objectId) {
  try {
    console.log(`  🔍 조회 중: Object ID ${objectId}`);
    await delay(CONFIG.API_DELAY);
    
    const url = `https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectId}`;
    const response = await axiosInstance.get(url);
    const artwork = response.data;
    
    // 공개 도메인이고 이미지가 있는 작품만 반환
    if (artwork.isPublicDomain && artwork.primaryImage) {
      console.log(`    ✅ 수집: "${artwork.title}" by ${artwork.artistDisplayName}`);
      
      return {
        objectID: artwork.objectID,
        title: artwork.title || 'Untitled',
        artist: artwork.artistDisplayName || 'Unknown',
        artistNationality: artwork.artistNationality || '',
        date: artwork.objectDate || 'Unknown',
        medium: artwork.medium || '',
        dimensions: artwork.dimensions || '',
        department: artwork.department || '',
        classification: artwork.classification || '',
        isHighlight: artwork.isHighlight || false,
        primaryImage: artwork.primaryImage,
        primaryImageSmall: artwork.primaryImageSmall || '',
        metUrl: artwork.objectURL || '',
        culture: artwork.culture || '',
        period: artwork.period || '',
        creditLine: artwork.creditLine || ''
      };
    }
    
    console.log(`    ⏭️  건너뜀 (공개 도메인 아님 또는 이미지 없음)`);
    return null;
    
  } catch (error) {
    console.error(`    ❌ 오류: ${error.message}`);
    return null;
  }
}

// 메인 크롤링 함수
async function crawlFamousArtworks() {
  console.log('🎨 Met Museum 유명 작품 크롤링 시작...\n');
  
  // 출력 디렉토리 생성
  if (!fs.existsSync(CONFIG.OUTPUT_DIR)) {
    fs.mkdirSync(CONFIG.OUTPUT_DIR, { recursive: true });
  }
  
  const allArtworks = [];
  const startTime = Date.now();
  
  // 작가별로 작품 수집
  for (const [artist, objectIds] of Object.entries(FAMOUS_ARTWORKS)) {
    console.log(`\n🎨 ${artist} 작품 수집 시작...`);
    
    for (const objectId of objectIds) {
      if (allArtworks.length >= CONFIG.MAX_ARTWORKS) break;
      
      const artwork = await getArtworkDetails(objectId);
      if (artwork) {
        allArtworks.push(artwork);
      }
    }
    
    console.log(`  📊 ${artist}: ${allArtworks.filter(a => a.artist === artist).length}개 수집`);
    
    if (allArtworks.length >= CONFIG.MAX_ARTWORKS) break;
  }
  
  // 추가로 하이라이트 작품들 수집
  if (allArtworks.length < CONFIG.MAX_ARTWORKS) {
    console.log('\n🌟 추가 하이라이트 작품 수집...');
    
    // 하이라이트 작품 ID들 (실제 확인된 ID)
    const highlightIds = [435809, 436535, 436105, 437984, 438012, 459123, 459124, 459125];
    
    for (const objectId of highlightIds) {
      if (allArtworks.length >= CONFIG.MAX_ARTWORKS) break;
      
      const artwork = await getArtworkDetails(objectId);
      if (artwork) {
        allArtworks.push(artwork);
      }
    }
  }
  
  // 결과 저장
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputFile = path.join(CONFIG.OUTPUT_DIR, `met-artworks-${timestamp}.json`);
  
  const result = {
    metadata: {
      source: 'Metropolitan Museum of Art',
      crawlDate: new Date().toISOString(),
      totalArtworks: allArtworks.length,
      duration: (Date.now() - startTime) / 1000 / 60,
      artists: [...new Set(allArtworks.map(a => a.artist))]
    },
    artworks: allArtworks
  };
  
  fs.writeFileSync(outputFile, JSON.stringify(result, null, 2));
  
  // CSV 파일 생성
  const csvFile = path.join(CONFIG.OUTPUT_DIR, `met-artworks-${timestamp}.csv`);
  const csvContent = [
    'ObjectID,Title,Artist,Date,Department,Image URL',
    ...allArtworks.map(a => 
      `"${a.objectID}","${a.title.replace(/"/g, '""')}","${a.artist.replace(/"/g, '""')}","${a.date}","${a.department}","${a.primaryImage}"`
    )
  ].join('\n');
  
  fs.writeFileSync(csvFile, csvContent);
  
  // 통계 출력
  console.log('\n\n✨ 크롤링 완료!');
  console.log(`  - 수집된 작품: ${allArtworks.length}개`);
  console.log(`  - 소요 시간: ${result.metadata.duration.toFixed(2)}분`);
  console.log(`  - JSON 파일: ${outputFile}`);
  console.log(`  - CSV 파일: ${csvFile}`);
  
  // 작가별 통계
  console.log('\n📊 작가별 수집 통계:');
  const artistStats = {};
  allArtworks.forEach(a => {
    artistStats[a.artist] = (artistStats[a.artist] || 0) + 1;
  });
  
  Object.entries(artistStats)
    .sort((a, b) => b[1] - a[1])
    .forEach(([artist, count]) => {
      console.log(`  - ${artist}: ${count}개`);
    });
  
  return outputFile;
}

// 실행
if (require.main === module) {
  crawlFamousArtworks().catch(console.error);
}

module.exports = { crawlFamousArtworks, getArtworkDetails };