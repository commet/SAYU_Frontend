const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { FAMOUS_ARTISTS, PRIORITY_DEPARTMENTS } = require('./config/famous-artists');

// Met Museum API 기본 URL
const MET_API_BASE = 'https://collectionapi.metmuseum.org/public/collection/v1';

// 설정
const CONFIG = {
  MAX_ARTWORKS_PER_ARTIST: 30,  // 작가당 최대 작품 수 (줄임)
  TOTAL_TARGET: 1500,            // 전체 목표 작품 수 (줄임)
  RATE_LIMIT_DELAY: 2000,        // API 호출 간격 (2초로 늘림)
  MAX_RETRIES: 2,                // 재시도 횟수
  OUTPUT_DIR: './met-artworks-data',
  DOWNLOAD_IMAGES: false         // 이미지 다운로드 여부 (나중에 true로 변경)
};

// 유틸리티 함수들
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const ensureDirectory = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// API 호출 함수 (재시도 로직 포함)
async function apiCall(url, retries = CONFIG.MAX_RETRIES) {
  try {
    await delay(CONFIG.RATE_LIMIT_DELAY);
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    if (retries > 0 && error.response?.status !== 404) {
      console.log(`재시도 중... (${CONFIG.MAX_RETRIES - retries + 1}/${CONFIG.MAX_RETRIES})`);
      await delay(CONFIG.RATE_LIMIT_DELAY * 3);
      return apiCall(url, retries - 1);
    }
    throw error;
  }
}

// 작가별 작품 검색
async function searchArtworksByArtist(artistName) {
  try {
    console.log(`\n🔍 ${artistName} 작품 검색 중...`);
    
    // Met API의 search는 q 파라미터로 검색
    const searchUrl = `${MET_API_BASE}/search?q=${encodeURIComponent(artistName)}&hasImages=true`;
    const searchResults = await apiCall(searchUrl);
    
    if (!searchResults.objectIDs || searchResults.objectIDs.length === 0) {
      console.log(`  ❌ ${artistName}의 작품을 찾을 수 없습니다.`);
      return [];
    }
    
    console.log(`  ✅ ${searchResults.total}개 작품 발견`);
    
    // 최대 개수만큼만 처리
    const objectIDsToProcess = searchResults.objectIDs.slice(0, CONFIG.MAX_ARTWORKS_PER_ARTIST);
    const artworks = [];
    
    for (const objectID of objectIDsToProcess) {
      try {
        const artwork = await getArtworkDetails(objectID);
        
        // 공개 도메인이고 이미지가 있는 작품만 선별
        if (artwork && 
            artwork.isPublicDomain && 
            artwork.primaryImage &&
            artwork.artistDisplayName?.toLowerCase().includes(artistName.toLowerCase())) {
          
          artworks.push({
            objectID: artwork.objectID,
            title: artwork.title,
            artist: artwork.artistDisplayName,
            artistNationality: artwork.artistNationality,
            date: artwork.objectDate,
            medium: artwork.medium,
            dimensions: artwork.dimensions,
            department: artwork.department,
            classification: artwork.classification,
            isHighlight: artwork.isHighlight,
            primaryImage: artwork.primaryImage,
            primaryImageSmall: artwork.primaryImageSmall,
            metUrl: artwork.objectURL,
            culture: artwork.culture,
            period: artwork.period,
            dynasty: artwork.dynasty,
            reign: artwork.reign,
            portfolio: artwork.portfolio,
            creditLine: artwork.creditLine,
            isPublicDomain: artwork.isPublicDomain
          });
          
          process.stdout.write(`\r  📥 수집됨: ${artworks.length}/${objectIDsToProcess.length}`);
        }
      } catch (error) {
        // 개별 작품 오류는 무시하고 계속
        continue;
      }
    }
    
    console.log(`\n  ✅ ${artistName}: ${artworks.length}개 작품 수집 완료`);
    return artworks;
    
  } catch (error) {
    console.error(`  ❌ ${artistName} 검색 오류:`, error.message);
    return [];
  }
}

// 작품 상세 정보 가져오기
async function getArtworkDetails(objectID) {
  try {
    const url = `${MET_API_BASE}/objects/${objectID}`;
    return await apiCall(url);
  } catch (error) {
    return null;
  }
}

// 하이라이트 작품 가져오기
async function getHighlightArtworks() {
  try {
    console.log('\n🌟 하이라이트 작품 수집 중...');
    
    // 부서별로 하이라이트 작품 검색
    const allHighlights = [];
    
    for (const department of PRIORITY_DEPARTMENTS.slice(0, 5)) {
      try {
        const searchUrl = `${MET_API_BASE}/search?departmentId=11&isHighlight=true&hasImages=true&q=*`;
        const results = await apiCall(searchUrl);
        
        if (results.objectIDs) {
          const highlights = [];
          for (const id of results.objectIDs.slice(0, 20)) {
            const artwork = await getArtworkDetails(id);
            if (artwork?.isPublicDomain && artwork?.primaryImage) {
              highlights.push(artwork);
            }
          }
          allHighlights.push(...highlights);
          console.log(`  ✅ ${department}: ${highlights.length}개 하이라이트 작품`);
        }
      } catch (error) {
        continue;
      }
    }
    
    return allHighlights;
  } catch (error) {
    console.error('하이라이트 작품 수집 오류:', error);
    return [];
  }
}

// 메인 크롤링 함수
async function crawlMetArtworks() {
  console.log('🎨 Met Museum 작품 크롤링 시작...\n');
  
  ensureDirectory(CONFIG.OUTPUT_DIR);
  
  const allArtworks = [];
  const stats = {
    totalArtworks: 0,
    artistsProcessed: 0,
    highlightArtworks: 0,
    startTime: Date.now()
  };
  
  // 1. 유명 작가별 작품 수집
  for (const artist of FAMOUS_ARTISTS) {
    if (allArtworks.length >= CONFIG.TOTAL_TARGET) break;
    
    const artworks = await searchArtworksByArtist(artist);
    allArtworks.push(...artworks);
    stats.artistsProcessed++;
    
    // 중간 저장
    if (stats.artistsProcessed % 5 === 0) {
      saveProgress(allArtworks, stats);
    }
  }
  
  // 2. 하이라이트 작품 추가 수집
  if (allArtworks.length < CONFIG.TOTAL_TARGET) {
    const highlights = await getHighlightArtworks();
    allArtworks.push(...highlights);
    stats.highlightArtworks = highlights.length;
  }
  
  // 최종 결과 저장
  stats.totalArtworks = allArtworks.length;
  stats.endTime = Date.now();
  stats.duration = (stats.endTime - stats.startTime) / 1000 / 60; // 분 단위
  
  saveResults(allArtworks, stats);
  
  console.log('\n\n📊 크롤링 완료!');
  console.log(`  - 총 작품 수: ${stats.totalArtworks}`);
  console.log(`  - 처리된 작가 수: ${stats.artistsProcessed}`);
  console.log(`  - 하이라이트 작품: ${stats.highlightArtworks}`);
  console.log(`  - 소요 시간: ${stats.duration.toFixed(2)}분`);
}

// 진행 상황 저장
function saveProgress(artworks, stats) {
  const progressFile = path.join(CONFIG.OUTPUT_DIR, 'progress.json');
  fs.writeFileSync(progressFile, JSON.stringify({
    artworks: artworks.length,
    stats,
    lastUpdate: new Date().toISOString()
  }, null, 2));
}

// 최종 결과 저장
function saveResults(artworks, stats) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  // 전체 데이터 저장
  const dataFile = path.join(CONFIG.OUTPUT_DIR, `met-artworks-${timestamp}.json`);
  fs.writeFileSync(dataFile, JSON.stringify({
    metadata: {
      source: 'Metropolitan Museum of Art',
      crawlDate: new Date().toISOString(),
      totalArtworks: artworks.length,
      stats
    },
    artworks
  }, null, 2));
  
  // 작가별 통계
  const artistStats = {};
  artworks.forEach(artwork => {
    const artist = artwork.artist || 'Unknown';
    artistStats[artist] = (artistStats[artist] || 0) + 1;
  });
  
  const statsFile = path.join(CONFIG.OUTPUT_DIR, `artist-stats-${timestamp}.json`);
  fs.writeFileSync(statsFile, JSON.stringify(artistStats, null, 2));
  
  // CSV 파일 생성 (Excel에서 열기 쉽게)
  const csvFile = path.join(CONFIG.OUTPUT_DIR, `met-artworks-${timestamp}.csv`);
  const csvHeader = 'ID,Title,Artist,Date,Department,Classification,IsHighlight,ImageURL,MetURL\n';
  const csvRows = artworks.map(a => 
    `"${a.objectID}","${a.title?.replace(/"/g, '""')}","${a.artist?.replace(/"/g, '""')}","${a.date}","${a.department}","${a.classification}","${a.isHighlight}","${a.primaryImage}","${a.metUrl}"`
  ).join('\n');
  
  fs.writeFileSync(csvFile, csvHeader + csvRows);
  
  console.log(`\n💾 파일 저장 완료:`);
  console.log(`  - JSON: ${dataFile}`);
  console.log(`  - 통계: ${statsFile}`);
  console.log(`  - CSV: ${csvFile}`);
}

// 실행
if (require.main === module) {
  crawlMetArtworks().catch(console.error);
}

module.exports = { crawlMetArtworks, searchArtworksByArtist, getArtworkDetails };