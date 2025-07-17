const axios = require('axios');
const https = require('https');
const fs = require('fs');
const path = require('path');

// HTTPS 에이전트
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

// 설정
const CONFIG = {
  BATCH_SIZE: 100,              // 한 번에 처리할 작품 수
  API_DELAY: 1000,              // API 호출 간격 (1초)
  LONG_BREAK_INTERVAL: 50,      // 50개마다 긴 휴식
  LONG_BREAK_DURATION: 30000,   // 30초 휴식
  TARGET_COUNT: 2000,           // 목표 수집 개수
  OUTPUT_DIR: './met-artworks-data',
  PROGRESS_FILE: './met-artworks-data/mass-progress.json'
};

// 진행 상황 로드
function loadProgress() {
  if (fs.existsSync(CONFIG.PROGRESS_FILE)) {
    return JSON.parse(fs.readFileSync(CONFIG.PROGRESS_FILE, 'utf8'));
  }
  return {
    processedIds: [],
    collectedArtworks: [],
    lastIndex: 0,
    totalProcessed: 0,
    totalCollected: 0
  };
}

// 진행 상황 저장
function saveProgress(progress) {
  const dir = path.dirname(CONFIG.PROGRESS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(CONFIG.PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

// 작품 정보 가져오기
async function fetchArtwork(objectId, attempt = 1) {
  try {
    const response = await axios.get(
      `https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectId}`,
      {
        httpsAgent,
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Educational Purpose) Met-Crawler/1.0'
        }
      }
    );
    
    const data = response.data;
    
    // 공개 도메인이고 이미지가 있는 작품만
    if (data.isPublicDomain && data.primaryImage) {
      return {
        objectID: data.objectID,
        title: data.title || 'Untitled',
        artist: data.artistDisplayName || 'Unknown',
        artistNationality: data.artistNationality || '',
        date: data.objectDate || '',
        medium: data.medium || '',
        department: data.department || '',
        classification: data.classification || '',
        isHighlight: data.isHighlight || false,
        primaryImage: data.primaryImage,
        primaryImageSmall: data.primaryImageSmall || '',
        metUrl: data.objectURL || '',
        culture: data.culture || '',
        period: data.period || '',
        dynasty: data.dynasty || '',
        creditLine: data.creditLine || ''
      };
    }
    
    return null;
    
  } catch (error) {
    if (error.response?.status === 403 && attempt < 3) {
      console.log(`  🔄 재시도 ${attempt}/3 (ID: ${objectId})`);
      await new Promise(resolve => setTimeout(resolve, 5000 * attempt));
      return fetchArtwork(objectId, attempt + 1);
    }
    return null;
  }
}

// 대량 수집 함수
async function massCollect() {
  console.log('🚀 Met Museum 대량 수집 시작...\n');
  console.log(`⚙️  설정:`);
  console.log(`  - 목표: ${CONFIG.TARGET_COUNT}개 작품`);
  console.log(`  - 배치 크기: ${CONFIG.BATCH_SIZE}`);
  console.log(`  - API 딜레이: ${CONFIG.API_DELAY}ms\n`);
  
  // 무작위로 섞인 오브젝트 ID 로드
  const shuffledIds = JSON.parse(
    fs.readFileSync('./met-object-ids-shuffled.json', 'utf8')
  ).objectIDs;
  
  console.log(`📊 총 ${shuffledIds.length}개 오브젝트 ID 로드됨\n`);
  
  // 진행 상황 로드
  const progress = loadProgress();
  console.log(`📈 이전 진행 상황:`);
  console.log(`  - 처리된 ID: ${progress.totalProcessed}`);
  console.log(`  - 수집된 작품: ${progress.totalCollected}\n`);
  
  let consecutiveErrors = 0;
  const startTime = Date.now();
  
  // 시작 인덱스부터 처리
  for (let i = progress.lastIndex; i < shuffledIds.length; i++) {
    // 목표 달성 확인
    if (progress.totalCollected >= CONFIG.TARGET_COUNT) {
      console.log(`\n🎯 목표 달성! ${CONFIG.TARGET_COUNT}개 작품 수집 완료`);
      break;
    }
    
    const objectId = shuffledIds[i];
    
    // 이미 처리된 ID는 건너뛰기
    if (progress.processedIds.includes(objectId)) {
      continue;
    }
    
    // API 호출 딜레이
    await new Promise(resolve => setTimeout(resolve, CONFIG.API_DELAY));
    
    // 긴 휴식
    if (progress.totalProcessed > 0 && progress.totalProcessed % CONFIG.LONG_BREAK_INTERVAL === 0) {
      console.log(`\n🛌 ${CONFIG.LONG_BREAK_DURATION / 1000}초 휴식...`);
      await new Promise(resolve => setTimeout(resolve, CONFIG.LONG_BREAK_DURATION));
      consecutiveErrors = 0;
    }
    
    // 작품 정보 가져오기
    process.stdout.write(`\r🔍 처리 중: ${i + 1}/${shuffledIds.length} (수집: ${progress.totalCollected})`);
    
    const artwork = await fetchArtwork(objectId);
    
    progress.processedIds.push(objectId);
    progress.totalProcessed++;
    
    if (artwork) {
      progress.collectedArtworks.push(artwork);
      progress.totalCollected++;
      consecutiveErrors = 0;
      
      // 10개마다 콘솔에 표시
      if (progress.totalCollected % 10 === 0) {
        console.log(`\n  ✅ ${progress.totalCollected}개 수집: "${artwork.title}" by ${artwork.artist}`);
      }
    } else {
      consecutiveErrors++;
      
      // 연속 오류가 많으면 긴 휴식
      if (consecutiveErrors > 10) {
        console.log(`\n⚠️  연속 오류 ${consecutiveErrors}회, 1분 휴식...`);
        await new Promise(resolve => setTimeout(resolve, 60000));
        consecutiveErrors = 0;
      }
    }
    
    // 진행 상황 저장 (50개마다)
    if (progress.totalProcessed % 50 === 0) {
      progress.lastIndex = i;
      saveProgress(progress);
      
      // 중간 결과 저장
      saveResults(progress.collectedArtworks, false);
    }
  }
  
  // 최종 결과 저장
  saveResults(progress.collectedArtworks, true);
  
  const duration = (Date.now() - startTime) / 1000 / 60;
  console.log(`\n\n✨ 수집 완료!`);
  console.log(`  - 총 처리: ${progress.totalProcessed}개`);
  console.log(`  - 수집 성공: ${progress.totalCollected}개`);
  console.log(`  - 성공률: ${((progress.totalCollected / progress.totalProcessed) * 100).toFixed(1)}%`);
  console.log(`  - 소요 시간: ${duration.toFixed(2)}분`);
}

// 결과 저장
function saveResults(artworks, isFinal) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const prefix = isFinal ? 'final' : 'progress';
  const outputFile = path.join(CONFIG.OUTPUT_DIR, `met-mass-${prefix}-${timestamp}.json`);
  
  const data = {
    metadata: {
      source: 'Metropolitan Museum of Art',
      method: 'Mass Collection',
      date: new Date().toISOString(),
      total: artworks.length,
      isFinal
    },
    artworks
  };
  
  fs.writeFileSync(outputFile, JSON.stringify(data, null, 2));
  
  if (isFinal) {
    console.log(`\n💾 최종 결과 저장: ${outputFile}`);
    
    // CSV도 생성
    const csvFile = outputFile.replace('.json', '.csv');
    const csv = [
      'ObjectID,Title,Artist,Date,Department,Classification,IsHighlight,ImageURL',
      ...artworks.map(a => 
        `"${a.objectID}","${(a.title || '').replace(/"/g, '""')}","${(a.artist || '').replace(/"/g, '""')}","${a.date}","${a.department}","${a.classification}","${a.isHighlight}","${a.primaryImage}"`
      )
    ].join('\n');
    
    fs.writeFileSync(csvFile, csv);
    console.log(`📄 CSV 파일: ${csvFile}`);
  }
}

// 실행
if (require.main === module) {
  massCollect().catch(console.error);
}

module.exports = { massCollect };