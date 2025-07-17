const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Met Museum API 기본 URL
const MET_API_BASE = 'https://collectionapi.metmuseum.org/public/collection/v1';

// 안전한 크롤링 설정
const CONFIG = {
  ARTWORKS_PER_BATCH: 10,        // 배치당 작품 수
  BATCH_DELAY: 10000,            // 배치 간 딜레이 (10초)
  API_CALL_DELAY: 3000,          // API 호출 간격 (3초)
  OUTPUT_DIR: './met-artworks-data',
  TOTAL_TARGET: 500              // 목표 작품 수 (테스트용으로 줄임)
};

// 주요 작가 리스트 (테스트용 축소)
const TEST_ARTISTS = [
  'Claude Monet',
  'Vincent van Gogh',
  'Rembrandt van Rijn',
  'Pablo Picasso',
  'Henri Matisse',
  'Johannes Vermeer',
  'Gustav Klimt',
  'Katsushika Hokusai',
  'Edgar Degas',
  'Georgia O\'Keeffe'
];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 안전한 API 호출
async function safeApiCall(url) {
  try {
    console.log(`  ⏳ API 호출 중...`);
    await delay(CONFIG.API_CALL_DELAY);
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'SAYU-Museum-Project/1.0 (Educational)',
        'Accept': 'application/json'
      },
      timeout: 30000
    });
    return response.data;
  } catch (error) {
    console.error(`  ❌ API 오류: ${error.message}`);
    return null;
  }
}

// 작가 검색 및 수집
async function collectArtistWorks(artistName, maxWorks = 20) {
  console.log(`\n🎨 ${artistName} 작품 수집 시작...`);
  
  try {
    // 1. 작가 검색
    const searchUrl = `${MET_API_BASE}/search?q=${encodeURIComponent(artistName)}&hasImages=true`;
    const searchResult = await safeApiCall(searchUrl);
    
    if (!searchResult || !searchResult.objectIDs) {
      console.log(`  ❌ ${artistName} 작품을 찾을 수 없습니다.`);
      return [];
    }
    
    console.log(`  ✅ ${searchResult.total}개 작품 발견`);
    
    // 2. 작품 상세 정보 수집 (제한된 수만큼)
    const artworks = [];
    const idsToProcess = searchResult.objectIDs.slice(0, maxWorks);
    
    for (let i = 0; i < idsToProcess.length; i++) {
      const objectID = idsToProcess[i];
      const detailUrl = `${MET_API_BASE}/objects/${objectID}`;
      const artwork = await safeApiCall(detailUrl);
      
      if (artwork && 
          artwork.isPublicDomain && 
          artwork.primaryImage &&
          artwork.artistDisplayName?.toLowerCase().includes(artistName.toLowerCase())) {
        
        artworks.push({
          objectID: artwork.objectID,
          title: artwork.title || 'Untitled',
          artist: artwork.artistDisplayName,
          date: artwork.objectDate || 'Unknown',
          medium: artwork.medium || '',
          department: artwork.department || '',
          isHighlight: artwork.isHighlight || false,
          primaryImage: artwork.primaryImage,
          primaryImageSmall: artwork.primaryImageSmall || '',
          metUrl: artwork.objectURL || ''
        });
        
        console.log(`  📥 수집: "${artwork.title}" (${i + 1}/${idsToProcess.length})`);
      }
      
      // 배치 처리를 위한 딜레이
      if ((i + 1) % CONFIG.ARTWORKS_PER_BATCH === 0) {
        console.log(`  ⏸️  배치 완료, ${CONFIG.BATCH_DELAY / 1000}초 대기...`);
        await delay(CONFIG.BATCH_DELAY);
      }
    }
    
    console.log(`  ✅ ${artistName}: ${artworks.length}개 작품 수집 완료`);
    return artworks;
    
  } catch (error) {
    console.error(`  ❌ ${artistName} 처리 중 오류:`, error.message);
    return [];
  }
}

// 메인 함수
async function safeCrawl() {
  console.log('🚀 안전한 Met Museum 크롤링 시작...\n');
  console.log('⚙️  설정:');
  console.log(`  - API 호출 간격: ${CONFIG.API_CALL_DELAY / 1000}초`);
  console.log(`  - 배치 간 대기: ${CONFIG.BATCH_DELAY / 1000}초`);
  console.log(`  - 목표 작품 수: ${CONFIG.TOTAL_TARGET}개\n`);
  
  // 출력 디렉토리 생성
  if (!fs.existsSync(CONFIG.OUTPUT_DIR)) {
    fs.mkdirSync(CONFIG.OUTPUT_DIR, { recursive: true });
  }
  
  const allArtworks = [];
  const startTime = Date.now();
  
  // 작가별 수집
  for (const artist of TEST_ARTISTS) {
    if (allArtworks.length >= CONFIG.TOTAL_TARGET) break;
    
    const artworks = await collectArtistWorks(artist, 20);
    allArtworks.push(...artworks);
    
    console.log(`\n📊 현재까지 수집: ${allArtworks.length}개`);
    
    // 작가 간 대기
    console.log(`⏸️  다음 작가로 이동 전 ${CONFIG.BATCH_DELAY / 1000}초 대기...\n`);
    await delay(CONFIG.BATCH_DELAY);
  }
  
  // 결과 저장
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputFile = path.join(CONFIG.OUTPUT_DIR, `met-artworks-safe-${timestamp}.json`);
  
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
  
  console.log('\n✨ 크롤링 완료!');
  console.log(`  - 수집된 작품: ${allArtworks.length}개`);
  console.log(`  - 소요 시간: ${result.metadata.duration.toFixed(2)}분`);
  console.log(`  - 저장 위치: ${outputFile}`);
  
  // CSV 파일도 생성
  const csvFile = path.join(CONFIG.OUTPUT_DIR, `met-artworks-safe-${timestamp}.csv`);
  const csvContent = [
    'ObjectID,Title,Artist,Date,Department,Image URL',
    ...allArtworks.map(a => 
      `"${a.objectID}","${a.title.replace(/"/g, '""')}","${a.artist.replace(/"/g, '""')}","${a.date}","${a.department}","${a.primaryImage}"`
    )
  ].join('\n');
  
  fs.writeFileSync(csvFile, csvContent);
  console.log(`  - CSV 파일: ${csvFile}`);
}

// 실행
if (require.main === module) {
  safeCrawl().catch(console.error);
}

module.exports = { safeCrawl, collectArtistWorks };