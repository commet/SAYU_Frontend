const axios = require('axios');
const https = require('https');
const fs = require('fs');
const path = require('path');

// 브라우저처럼 보이는 설정
const browserHeaders = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
  'Accept-Encoding': 'gzip, deflate, br',
  'DNT': '1',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1'
};

// HTTPS 에이전트
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
  keepAlive: true
});

// 스마트한 딜레이 함수 (랜덤 요소 추가)
function smartDelay() {
  // 5초 ~ 15초 사이의 랜덤 딜레이
  const minDelay = 5000;
  const maxDelay = 15000;
  const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
  
  console.log(`  ⏳ ${(delay / 1000).toFixed(1)}초 대기 중...`);
  return new Promise(resolve => setTimeout(resolve, delay));
}

// 세션 쿠키 관리
class SessionManager {
  constructor() {
    this.cookies = new Map();
    this.requestCount = 0;
    this.lastRequestTime = 0;
  }
  
  updateCookies(response) {
    const setCookies = response.headers['set-cookie'];
    if (setCookies) {
      setCookies.forEach(cookie => {
        const [nameValue] = cookie.split(';');
        const [name, value] = nameValue.split('=');
        this.cookies.set(name, value);
      });
    }
  }
  
  getCookieString() {
    return Array.from(this.cookies.entries())
      .map(([name, value]) => `${name}=${value}`)
      .join('; ');
  }
  
  shouldTakeLongBreak() {
    // 10개 요청마다 긴 휴식
    return this.requestCount > 0 && this.requestCount % 10 === 0;
  }
}

// API 요청 함수
async function makeRequest(url, session) {
  try {
    // 요청 간 시간 체크
    const now = Date.now();
    if (session.lastRequestTime > 0) {
      const elapsed = now - session.lastRequestTime;
      if (elapsed < 5000) {
        await new Promise(resolve => setTimeout(resolve, 5000 - elapsed));
      }
    }
    
    // 긴 휴식 필요 여부 체크
    if (session.shouldTakeLongBreak()) {
      console.log('  🛌 긴 휴식 중... (30초)');
      await new Promise(resolve => setTimeout(resolve, 30000));
    }
    
    const response = await axios.get(url, {
      httpsAgent,
      headers: {
        ...browserHeaders,
        'Cookie': session.getCookieString(),
        'Referer': 'https://www.metmuseum.org/'
      },
      timeout: 30000,
      maxRedirects: 5
    });
    
    session.updateCookies(response);
    session.requestCount++;
    session.lastRequestTime = Date.now();
    
    return response.data;
    
  } catch (error) {
    if (error.response?.status === 403) {
      console.log('  ⚠️  403 오류 - 1분 휴식 후 재시도...');
      await new Promise(resolve => setTimeout(resolve, 60000));
      // 세션 리셋
      session.cookies.clear();
      session.requestCount = 0;
    }
    throw error;
  }
}

// 작품 정보 가져오기 (세션 활용)
async function getArtworkWithSession(objectId, session) {
  try {
    console.log(`\n🔍 작품 ID ${objectId} 조회 중...`);
    
    const url = `https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectId}`;
    const data = await makeRequest(url, session);
    
    if (data.isPublicDomain && data.primaryImage) {
      console.log(`  ✅ 수집: "${data.title}" by ${data.artistDisplayName}`);
      return {
        objectID: data.objectID,
        title: data.title || 'Untitled',
        artist: data.artistDisplayName || 'Unknown',
        date: data.objectDate || 'Unknown',
        medium: data.medium || '',
        department: data.department || '',
        primaryImage: data.primaryImage,
        primaryImageSmall: data.primaryImageSmall || '',
        metUrl: data.objectURL || ''
      };
    }
    
    console.log(`  ⏭️  건너뜀`);
    return null;
    
  } catch (error) {
    console.error(`  ❌ 오류: ${error.message}`);
    return null;
  }
}

// 메인 크롤링 함수
async function smartCrawl() {
  console.log('🎨 스마트 Met Museum 크롤러 시작...\n');
  console.log('⚙️  설정:');
  console.log('  - 브라우저 User-Agent 사용');
  console.log('  - 랜덤 딜레이 (5-15초)');
  console.log('  - 세션 쿠키 관리');
  console.log('  - 10개마다 긴 휴식\n');
  
  const session = new SessionManager();
  const artworks = [];
  
  // 테스트용 작품 ID 목록 (확인된 공개 도메인 작품들)
  const testObjectIds = [
    // Van Gogh
    436524, 436525, 436526, 436527, 436528,
    // Rembrandt
    437397, 437398, 437399, 437400, 437401,
    // Vermeer
    437881,
    // Degas
    436121, 436122, 436123, 436124,
    // Japanese Art
    36491, 36492, 36493,
    // Highlights
    435809, 436535, 436105
  ];
  
  // 배치 처리
  for (let i = 0; i < testObjectIds.length; i++) {
    const objectId = testObjectIds[i];
    
    // 스마트 딜레이
    if (i > 0) {
      await smartDelay();
    }
    
    const artwork = await getArtworkWithSession(objectId, session);
    if (artwork) {
      artworks.push(artwork);
    }
    
    // 진행 상황 저장
    if (artworks.length > 0 && artworks.length % 5 === 0) {
      saveProgress(artworks);
      console.log(`\n📊 현재까지 ${artworks.length}개 수집\n`);
    }
  }
  
  // 최종 결과 저장
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputFile = path.join(__dirname, 'met-artworks-data', `met-smart-${timestamp}.json`);
  
  // 디렉토리 생성
  const dir = path.dirname(outputFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(outputFile, JSON.stringify({
    metadata: {
      source: 'Metropolitan Museum of Art',
      method: 'Smart API Crawler',
      date: new Date().toISOString(),
      total: artworks.length
    },
    artworks
  }, null, 2));
  
  console.log('\n✨ 크롤링 완료!');
  console.log(`  - 수집된 작품: ${artworks.length}개`);
  console.log(`  - 저장 위치: ${outputFile}`);
}

// 진행 상황 저장
function saveProgress(artworks) {
  const progressFile = path.join(__dirname, 'met-artworks-data', 'smart-progress.json');
  fs.writeFileSync(progressFile, JSON.stringify({
    timestamp: new Date().toISOString(),
    count: artworks.length,
    lastArtwork: artworks[artworks.length - 1]
  }, null, 2));
}

// 실행
if (require.main === module) {
  smartCrawl().catch(console.error);
}

module.exports = { smartCrawl };