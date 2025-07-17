const axios = require('axios');
const https = require('https');
const fs = require('fs');
const path = require('path');

// HTTPS 에이전트
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

// 개선된 설정
const CONFIG = {
  BATCH_SIZE: 200,              // 배치 크기 증가
  API_DELAY: 800,               // API 호출 간격 단축 (800ms)
  SMART_DELAY_MIN: 500,         // 스마트 딜레이 최소값
  SMART_DELAY_MAX: 1500,        // 스마트 딜레이 최대값
  LONG_BREAK_INTERVAL: 100,     // 100개마다 긴 휴식
  LONG_BREAK_DURATION: 20000,   // 20초 휴식
  TARGET_COUNT: 1000,           // 목표 수집 개수
  OUTPUT_DIR: './met-artworks-data',
  PROGRESS_FILE: './met-artworks-data/smart-progress.json'
};

// 유명 작가 우선 필터링 (확장된 리스트)
const FAMOUS_ARTISTS = [
  // 최우선 (인상주의/후기 인상주의)
  'vincent van gogh', 'claude monet', 'pierre-auguste renoir', 'edgar degas',
  'paul cézanne', 'paul gauguin', 'camille pissarro', 'édouard manet',
  
  // 고전 거장
  'rembrandt van rijn', 'rembrandt', 'johannes vermeer', 'leonardo da vinci',
  'michelangelo', 'raphael', 'sandro botticelli', 'titian',
  
  // 현대 미술
  'pablo picasso', 'henri matisse', 'andy warhol', 'jackson pollock',
  'mark rothko', 'georgia o\'keeffe', 'edward hopper', 'jean-michel basquiat',
  
  // 일본 우키요에
  'katsushika hokusai', 'utagawa hiroshige', 'kitagawa utamaro',
  
  // 기타 유명 작가
  'gustav klimt', 'egon schiele', 'henri de toulouse-lautrec', 'francisco goya',
  'j.m.w. turner', 'john constable', 'eugène delacroix', 'théodore géricault',
  'william blake', 'dante gabriel rossetti', 'john everett millais',
  'wassily kandinsky', 'paul klee', 'marc chagall', 'salvador dalí',
  'frida kahlo', 'diego rivera', 'henri rousseau', 'mary cassatt'
];

// 스마트 딜레이 함수
function smartDelay() {
  const delay = Math.random() * (CONFIG.SMART_DELAY_MAX - CONFIG.SMART_DELAY_MIN) + CONFIG.SMART_DELAY_MIN;
  return new Promise(resolve => setTimeout(resolve, delay));
}

// 유명 작가 체크 함수 (개선)
function isFamousArtist(artistName) {
  if (!artistName) return false;
  
  const lowerName = artistName.toLowerCase();
  
  // 정확한 매칭 우선
  for (const famous of FAMOUS_ARTISTS) {
    if (lowerName === famous.toLowerCase()) return true;
  }
  
  // 부분 매칭
  for (const famous of FAMOUS_ARTISTS) {
    if (lowerName.includes(famous.toLowerCase()) || 
        famous.toLowerCase().includes(lowerName)) {
      return true;
    }
  }
  
  return false;
}

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
    totalCollected: 0,
    famousArtists: 0,
    highlights: 0,
    startTime: Date.now()
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

// 작품 정보 가져오기 (개선된 버전)
async function fetchArtworkSmart(objectId, attempt = 1) {
  try {
    const response = await axios.get(
      `https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectId}`,
      {
        httpsAgent,
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9',
          'Connection': 'keep-alive',
          'Cache-Control': 'no-cache'
        }
      }
    );
    
    const data = response.data;
    
    // 공개 도메인이고 이미지가 있는 작품만
    if (data.isPublicDomain && data.primaryImage) {
      const isFamous = isFamousArtist(data.artistDisplayName);
      
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
        isFamous: isFamous,
        primaryImage: data.primaryImage,
        primaryImageSmall: data.primaryImageSmall || '',
        metUrl: data.objectURL || '',
        culture: data.culture || '',
        period: data.period || '',
        creditLine: data.creditLine || '',
        source: 'Met Museum'
      };
    }
    
    return null;
    
  } catch (error) {
    if (error.response?.status === 403 && attempt < 3) {
      console.log(`  🔄 403 오류 재시도 ${attempt}/3 (ID: ${objectId})`);
      await new Promise(resolve => setTimeout(resolve, 10000 * attempt));
      return fetchArtworkSmart(objectId, attempt + 1);
    }
    
    if (error.response?.status === 429 && attempt < 3) {
      console.log(`  ⏳ Rate limit 재시도 ${attempt}/3 (ID: ${objectId})`);
      await new Promise(resolve => setTimeout(resolve, 15000 * attempt));
      return fetchArtworkSmart(objectId, attempt + 1);
    }
    
    return null;
  }
}

// 스마트 대량 수집 함수
async function smartMassCollect() {
  console.log('🧠 스마트 Met Museum 대량 수집 시작...\n');
  console.log(`⚙️  개선된 설정:`);
  console.log(`  - 목표: ${CONFIG.TARGET_COUNT}개 작품`);
  console.log(`  - 배치 크기: ${CONFIG.BATCH_SIZE}`);
  console.log(`  - 스마트 딜레이: ${CONFIG.SMART_DELAY_MIN}-${CONFIG.SMART_DELAY_MAX}ms`);
  console.log(`  - 유명 작가 우선 필터링: ${FAMOUS_ARTISTS.length}명\n`);
  
  // 무작위로 섞인 오브젝트 ID 로드
  const shuffledIds = JSON.parse(
    fs.readFileSync('./met-object-ids-shuffled.json', 'utf8')
  ).objectIDs;
  
  console.log(`📊 총 ${shuffledIds.length}개 오브젝트 ID 로드됨\n`);
  
  // 진행 상황 로드
  const progress = loadProgress();
  console.log(`📈 이전 진행 상황:`);
  console.log(`  - 처리된 ID: ${progress.totalProcessed}`);
  console.log(`  - 수집된 작품: ${progress.totalCollected}`);
  console.log(`  - 유명 작가: ${progress.famousArtists}`);
  console.log(`  - 하이라이트: ${progress.highlights}\n`);
  
  let consecutiveErrors = 0;
  let lastSuccessTime = Date.now();
  
  // 배치 처리
  for (let i = progress.lastIndex; i < shuffledIds.length; i += CONFIG.BATCH_SIZE) {
    // 목표 달성 확인
    if (progress.totalCollected >= CONFIG.TARGET_COUNT) {
      console.log(`\n🎯 목표 달성! ${CONFIG.TARGET_COUNT}개 작품 수집 완료`);
      break;
    }
    
    const batch = shuffledIds.slice(i, i + CONFIG.BATCH_SIZE);
    console.log(`\n🔄 배치 ${Math.floor(i / CONFIG.BATCH_SIZE) + 1} 처리 중... (${i + 1}-${Math.min(i + CONFIG.BATCH_SIZE, shuffledIds.length)}/${shuffledIds.length})`);
    
    let batchSuccess = 0;
    let batchErrors = 0;
    
    for (const objectId of batch) {
      // 이미 처리된 ID는 건너뛰기
      if (progress.processedIds.includes(objectId)) {
        continue;
      }
      
      // 스마트 딜레이
      await smartDelay();
      
      // 작품 정보 가져오기
      const artwork = await fetchArtworkSmart(objectId);
      
      progress.processedIds.push(objectId);
      progress.totalProcessed++;
      
      if (artwork) {
        progress.collectedArtworks.push(artwork);
        progress.totalCollected++;
        batchSuccess++;
        consecutiveErrors = 0;
        lastSuccessTime = Date.now();
        
        // 유명 작가 카운트
        if (artwork.isFamous) {
          progress.famousArtists++;
        }
        
        // 하이라이트 카운트
        if (artwork.isHighlight) {
          progress.highlights++;
        }
        
        // 유명 작가나 하이라이트는 즉시 표시
        if (artwork.isFamous || artwork.isHighlight) {
          console.log(`  🌟 ${artwork.isFamous ? '[유명]' : ''}${artwork.isHighlight ? '[하이라이트]' : ''} "${artwork.title}" by ${artwork.artist}`);
        }
        
      } else {
        batchErrors++;
        consecutiveErrors++;
        
        // 연속 오류가 많으면 긴 휴식
        if (consecutiveErrors > 20) {
          console.log(`\n⚠️  연속 오류 ${consecutiveErrors}회, 1분 휴식...`);
          await new Promise(resolve => setTimeout(resolve, 60000));
          consecutiveErrors = 0;
        }
      }
      
      // 진행 상황 표시
      if (progress.totalProcessed % 50 === 0) {
        const successRate = ((progress.totalCollected / progress.totalProcessed) * 100).toFixed(1);
        console.log(`\n📊 중간 현황:`);
        console.log(`  - 처리: ${progress.totalProcessed}개`);
        console.log(`  - 수집: ${progress.totalCollected}개 (성공률: ${successRate}%)`);
        console.log(`  - 유명 작가: ${progress.famousArtists}개`);
        console.log(`  - 하이라이트: ${progress.highlights}개\n`);
      }
    }
    
    // 배치 완료 후 진행 상황 저장
    progress.lastIndex = i + CONFIG.BATCH_SIZE;
    saveProgress(progress);
    
    console.log(`  ✅ 배치 완료: 성공 ${batchSuccess}개, 오류 ${batchErrors}개`);
    
    // 배치 간 휴식
    if (progress.totalProcessed % CONFIG.LONG_BREAK_INTERVAL === 0) {
      console.log(`\n🛌 ${CONFIG.LONG_BREAK_DURATION / 1000}초 휴식...`);
      await new Promise(resolve => setTimeout(resolve, CONFIG.LONG_BREAK_DURATION));
    }
    
    // 중간 결과 저장
    if (progress.totalCollected % 100 === 0 && progress.totalCollected > 0) {
      saveResults(progress.collectedArtworks, false);
    }
  }
  
  // 최종 결과 저장
  saveResults(progress.collectedArtworks, true);
  printFinalStats(progress);
}

// 결과 저장
function saveResults(artworks, isFinal) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const prefix = isFinal ? 'final' : 'progress';
  const outputFile = path.join(CONFIG.OUTPUT_DIR, `met-smart-${prefix}-${timestamp}.json`);
  
  const data = {
    metadata: {
      source: 'Metropolitan Museum of Art',
      method: 'Smart Mass Collection',
      date: new Date().toISOString(),
      total: artworks.length,
      famousArtists: artworks.filter(a => a.isFamous).length,
      highlights: artworks.filter(a => a.isHighlight).length,
      isFinal
    },
    artworks
  };
  
  fs.writeFileSync(outputFile, JSON.stringify(data, null, 2));
  
  if (isFinal) {
    console.log(`\n💾 최종 결과 저장: ${outputFile}`);
  }
}

// 최종 통계 출력
function printFinalStats(progress) {
  const duration = (Date.now() - progress.startTime) / 1000 / 60;
  const successRate = ((progress.totalCollected / progress.totalProcessed) * 100).toFixed(1);
  
  console.log(`\n\n✨ 스마트 수집 완료!`);
  console.log(`  - 총 처리: ${progress.totalProcessed}개`);
  console.log(`  - 수집 성공: ${progress.totalCollected}개 (성공률: ${successRate}%)`);
  console.log(`  - 유명 작가: ${progress.famousArtists}개`);
  console.log(`  - 하이라이트: ${progress.highlights}개`);
  console.log(`  - 소요 시간: ${duration.toFixed(2)}분`);
  
  // 작가별 통계
  const artistStats = {};
  progress.collectedArtworks.forEach(artwork => {
    if (artwork.isFamous) {
      artistStats[artwork.artist] = (artistStats[artwork.artist] || 0) + 1;
    }
  });
  
  console.log(`\n👨‍🎨 유명 작가 통계:`);
  Object.entries(artistStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([artist, count]) => {
      console.log(`  - ${artist}: ${count}개`);
    });
}

// 실행
if (require.main === module) {
  smartMassCollect().catch(console.error);
}

module.exports = { smartMassCollect };