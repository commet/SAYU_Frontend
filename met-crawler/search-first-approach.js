const axios = require('axios');
const https = require('https');
const fs = require('fs');
const path = require('path');

// 검색 우선 접근 방식
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

// 자연스러운 검색어 리스트
const SEARCH_TERMS = [
  // 유명 작가들
  'van gogh', 'monet', 'renoir', 'degas', 'picasso', 'rembrandt', 'vermeer',
  'hokusai', 'matisse', 'cezanne', 'gauguin', 'manet', 'pissarro',
  
  // 주제별
  'landscape', 'portrait', 'flowers', 'still life', 'impressionist',
  'painting', 'drawing', 'print', 'sculpture',
  
  // 시대별
  'renaissance', 'baroque', 'impressionism', 'modern', 'contemporary',
  
  // 지역별
  'french', 'dutch', 'italian', 'american', 'japanese', 'german'
];

async function searchFirstApproach() {
  console.log('🔍 검색 우선 접근 방식 시작...\n');
  
  const allArtworks = [];
  let searchCount = 0;
  
  for (const searchTerm of SEARCH_TERMS) {
    if (allArtworks.length >= 500) break; // 목표: 500개
    
    console.log(`🔎 "${searchTerm}" 검색 중...`);
    
    try {
      // 1. 자연스러운 딜레이
      await naturalDelay();
      
      // 2. 검색 API 호출
      const searchResults = await searchArtworks(searchTerm);
      
      if (searchResults && searchResults.length > 0) {
        console.log(`  ✅ ${searchResults.length}개 발견`);
        
        // 3. 각 작품의 상세 정보 수집 (제한적으로)
        const detailedArtworks = await collectDetailedInfo(searchResults, searchTerm);
        
        allArtworks.push(...detailedArtworks);
        console.log(`  📥 ${detailedArtworks.length}개 수집 완료`);
        console.log(`  📊 총 수집: ${allArtworks.length}개\\n`);
        
        // 4. 검색 간 긴 휴식
        if (++searchCount % 5 === 0) {
          console.log('😴 긴 휴식 중... (30초)');
          await new Promise(resolve => setTimeout(resolve, 30000));
        }
        
      } else {
        console.log(`  ❌ 결과 없음\\n`);
      }
      
    } catch (error) {
      console.error(`  ❌ "${searchTerm}" 검색 오류:`, error.message);
      
      if (error.response?.status === 403) {
        console.log('  🛑 403 오류 - 1분 휴식 후 계속...');
        await new Promise(resolve => setTimeout(resolve, 60000));
      }
    }
  }
  
  // 중복 제거
  const uniqueArtworks = removeDuplicates(allArtworks);
  
  // 결과 저장
  await saveSearchResults(uniqueArtworks);
  
  console.log('✨ 검색 기반 수집 완료!');
  console.log(`  - 총 수집: ${uniqueArtworks.length}개`);
  
  return uniqueArtworks;
}

// 자연스러운 딜레이
async function naturalDelay() {
  const baseDelay = 5000; // 5초 기본
  const variance = Math.random() * 5000; // 0-5초 변동
  const totalDelay = baseDelay + variance;
  
  return new Promise(resolve => setTimeout(resolve, totalDelay));
}

// 검색 API 호출
async function searchArtworks(query) {
  try {
    const url = `https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&isPublicDomain=true&q=${encodeURIComponent(query)}`;
    
    const response = await axios.get(url, {
      httpsAgent,
      timeout: 20000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.metmuseum.org/',
        'Origin': 'https://www.metmuseum.org'
      }
    });
    
    return response.data.objectIDs || [];
    
  } catch (error) {
    throw error;
  }
}

// 상세 정보 수집 (제한적으로)
async function collectDetailedInfo(objectIds, searchTerm) {
  const artworks = [];
  const maxPerSearch = 10; // 검색어당 최대 10개만
  
  for (let i = 0; i < Math.min(objectIds.length, maxPerSearch); i++) {
    const objectId = objectIds[i];
    
    try {
      // 각 작품 조회 전 딜레이
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const artwork = await getArtworkDetails(objectId, searchTerm);
      
      if (artwork) {
        artworks.push(artwork);
        console.log(`    ✅ "${artwork.title}" by ${artwork.artist}`);
      }
      
    } catch (error) {
      console.log(`    ❌ Object ${objectId} 오류: ${error.message}`);
      
      if (error.response?.status === 403) {
        console.log('    🛑 403 오류 - 이 검색어 중단');
        break;
      }
    }
  }
  
  return artworks;
}

// 작품 상세 정보 가져오기
async function getArtworkDetails(objectId, searchContext) {
  try {
    const url = `https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectId}`;
    
    const response = await axios.get(url, {
      httpsAgent,
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Referer': `https://www.metmuseum.org/art/collection/search?q=${encodeURIComponent(searchContext)}`,
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    
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
        searchContext: searchContext,
        source: 'Met Museum'
      };
    }
    
    return null;
    
  } catch (error) {
    throw error;
  }
}

// 중복 제거
function removeDuplicates(artworks) {
  const unique = [];
  const seen = new Set();
  
  for (const artwork of artworks) {
    if (!seen.has(artwork.objectID)) {
      seen.add(artwork.objectID);
      unique.push(artwork);
    }
  }
  
  return unique;
}

// 결과 저장
async function saveSearchResults(artworks) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputFile = path.join('./met-artworks-data', `search-based-${timestamp}.json`);
  
  // 검색 컨텍스트별 통계
  const searchStats = {};
  artworks.forEach(artwork => {
    const context = artwork.searchContext || 'unknown';
    searchStats[context] = (searchStats[context] || 0) + 1;
  });
  
  const data = {
    metadata: {
      method: 'Search-First Approach',
      date: new Date().toISOString(),
      total: artworks.length,
      searchStats
    },
    artworks
  };
  
  fs.writeFileSync(outputFile, JSON.stringify(data, null, 2));
  console.log(`\\n💾 저장 완료: ${outputFile}`);
  
  // 통계 출력
  console.log('\\n📊 검색어별 수집 통계:');
  Object.entries(searchStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([term, count]) => {
      console.log(`  - "${term}": ${count}개`);
    });
}

// 실행
if (require.main === module) {
  searchFirstApproach().catch(console.error);
}

module.exports = { searchFirstApproach };