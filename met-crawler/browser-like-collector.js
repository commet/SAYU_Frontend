const axios = require('axios');
const https = require('https');
const fs = require('fs');
const path = require('path');

// 완전한 브라우저 시뮬레이션
class BrowserLikeCollector {
  constructor() {
    this.session = axios.create({
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
        keepAlive: true
      }),
      timeout: 30000,
      withCredentials: true
    });
    
    this.cookies = new Map();
    this.userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0'
    ];
    
    this.currentUserAgent = this.userAgents[0];
    this.lastRequestTime = 0;
    this.requestCount = 0;
  }
  
  // 브라우저 세션 초기화
  async initializeSession() {
    console.log('🌐 브라우저 세션 초기화 중...');
    
    try {
      // 1. Met Museum 홈페이지 방문 (쿠키 획득)
      await this.visitHomePage();
      
      // 2. Collection 페이지 방문
      await this.visitCollectionPage();
      
      // 3. 무작위 작품 몇 개 조회 (자연스러운 패턴)
      await this.browseRandomArtworks();
      
      console.log('  ✅ 브라우저 세션 초기화 완료\\n');
      return true;
      
    } catch (error) {
      console.error('  ❌ 세션 초기화 실패:', error.message);
      return false;
    }
  }
  
  // Met Museum 홈페이지 방문
  async visitHomePage() {
    const response = await this.session.get('https://www.metmuseum.org/', {
      headers: this.getBrowserHeaders('https://www.google.com/')
    });
    
    this.updateCookies(response);
    await this.humanDelay(2000, 5000);
  }
  
  // Collection 페이지 방문
  async visitCollectionPage() {
    const response = await this.session.get('https://www.metmuseum.org/art/collection', {
      headers: this.getBrowserHeaders('https://www.metmuseum.org/')
    });
    
    this.updateCookies(response);
    await this.humanDelay(3000, 7000);
  }
  
  // 무작위 작품 조회
  async browseRandomArtworks() {
    const sampleIds = [436524, 437397, 437881]; // Van Gogh, Rembrandt, Vermeer
    
    for (const id of sampleIds) {
      try {
        await this.session.get(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`, {
          headers: this.getBrowserHeaders('https://www.metmuseum.org/art/collection')
        });
        
        await this.humanDelay(5000, 10000);
      } catch (error) {
        // 무시하고 계속
      }
    }
  }
  
  // 인간적인 딜레이
  async humanDelay(min = 3000, max = 8000) {
    const delay = Math.random() * (max - min) + min;
    const variance = delay * 0.1; // 10% 변동
    const finalDelay = delay + (Math.random() - 0.5) * variance;
    
    console.log(`  ⏳ ${(finalDelay / 1000).toFixed(1)}초 대기...`);
    return new Promise(resolve => setTimeout(resolve, finalDelay));
  }
  
  // 완전한 브라우저 헤더 생성
  getBrowserHeaders(referer) {
    return {
      'User-Agent': this.currentUserAgent,
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept-Encoding': 'gzip, deflate, br',
      'Referer': referer,
      'Origin': 'https://www.metmuseum.org',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
      'Sec-CH-UA': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      'Sec-CH-UA-Mobile': '?0',
      'Sec-CH-UA-Platform': '"Windows"',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Cookie': this.getCookieString()
    };
  }
  
  // 쿠키 업데이트
  updateCookies(response) {
    const setCookies = response.headers['set-cookie'];
    if (setCookies) {
      setCookies.forEach(cookie => {
        const [nameValue] = cookie.split(';');
        const [name, value] = nameValue.split('=');
        if (name && value) {
          this.cookies.set(name.trim(), value.trim());
        }
      });
    }
  }
  
  // 쿠키 문자열 생성
  getCookieString() {
    return Array.from(this.cookies.entries())
      .map(([name, value]) => `${name}=${value}`)
      .join('; ');
  }
  
  // 세션 리셋 (IP 변경 시뮬레이션)
  async resetSession() {
    console.log('🔄 세션 리셋 중...');
    
    // User-Agent 변경
    this.currentUserAgent = this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
    
    // 쿠키 클리어
    this.cookies.clear();
    
    // 새 세션
    this.session = axios.create({
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
        keepAlive: true
      }),
      timeout: 30000,
      withCredentials: true
    });
    
    // 긴 휴식
    await this.humanDelay(30000, 60000);
    
    // 새 세션 초기화
    await this.initializeSession();
  }
  
  // 작품 정보 수집 (브라우저 방식)
  async collectArtwork(objectId) {
    try {
      // 요청 간격 체크
      const now = Date.now();
      if (this.lastRequestTime > 0) {
        const elapsed = now - this.lastRequestTime;
        if (elapsed < 5000) {
          await new Promise(resolve => setTimeout(resolve, 5000 - elapsed));
        }
      }
      
      // 세션 리셋 체크 (100개마다)
      if (this.requestCount > 0 && this.requestCount % 100 === 0) {
        await this.resetSession();
      }
      
      const response = await this.session.get(
        `https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectId}`,
        {
          headers: this.getBrowserHeaders('https://www.metmuseum.org/art/collection/search')
        }
      );
      
      this.updateCookies(response);
      this.lastRequestTime = Date.now();
      this.requestCount++;
      
      const data = response.data;
      
      if (data.isPublicDomain && data.primaryImage) {
        return {
          objectID: data.objectID,
          title: data.title || 'Untitled',
          artist: data.artistDisplayName || 'Unknown',
          date: data.objectDate || '',
          medium: data.medium || '',
          department: data.department || '',
          classification: data.classification || '',
          isHighlight: data.isHighlight || false,
          primaryImage: data.primaryImage,
          primaryImageSmall: data.primaryImageSmall || '',
          metUrl: data.objectURL || '',
          source: 'Met Museum'
        };
      }
      
      return null;
      
    } catch (error) {
      if (error.response?.status === 403) {
        console.log(`  ⚠️  403 오류 - 세션 리셋 필요`);
        await this.resetSession();
        return null;
      }
      
      if (error.response?.status === 429) {
        console.log(`  ⏳ Rate limit - 2분 대기`);
        await new Promise(resolve => setTimeout(resolve, 120000));
        return null;
      }
      
      return null;
    }
  }
}

// 메인 브라우저 기반 수집 함수
async function browserBasedCollect() {
  console.log('🌐 브라우저 기반 Met Museum 수집 시작...');
  
  const collector = new BrowserLikeCollector();
  
  // 세션 초기화
  const sessionOk = await collector.initializeSession();
  if (!sessionOk) {
    console.error('❌ 세션 초기화 실패');
    return;
  }
  
  // 무작위 ID 로드
  const shuffledIds = JSON.parse(
    fs.readFileSync('./met-object-ids-shuffled.json', 'utf8')
  ).objectIDs;
  
  const artworks = [];
  const targetCount = 200; // 테스트용으로 200개
  
  console.log(`🎯 목표: ${targetCount}개 작품 수집\\n`);
  
  for (let i = 0; i < shuffledIds.length && artworks.length < targetCount; i++) {
    const objectId = shuffledIds[i];
    
    console.log(`🔍 ${i + 1}/${targetCount} - Object ID ${objectId} 조회 중...`);
    
    const artwork = await collector.collectArtwork(objectId);
    
    if (artwork) {
      artworks.push(artwork);
      console.log(`  ✅ 수집: "${artwork.title}" by ${artwork.artist}`);
      console.log(`  📊 현재 수집: ${artworks.length}/${targetCount}\\n`);
    } else {
      console.log(`  ⏭️  건너뜀\\n`);
    }
    
    // 인간적인 딜레이
    await collector.humanDelay(3000, 8000);
  }
  
  // 결과 저장
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputFile = path.join('./met-artworks-data', `browser-based-${timestamp}.json`);
  
  fs.writeFileSync(outputFile, JSON.stringify({
    metadata: {
      method: 'Browser-based Collection',
      date: new Date().toISOString(),
      total: artworks.length
    },
    artworks
  }, null, 2));
  
  console.log('✨ 브라우저 기반 수집 완료!');
  console.log(`  - 수집된 작품: ${artworks.length}개`);
  console.log(`  - 저장 위치: ${outputFile}`);
  
  return artworks;
}

// 실행
if (require.main === module) {
  browserBasedCollect().catch(console.error);
}

module.exports = { browserBasedCollect, BrowserLikeCollector };