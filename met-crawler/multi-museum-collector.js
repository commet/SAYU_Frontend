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
  API_DELAY: 2000,
  OUTPUT_DIR: './met-artworks-data',
  TARGET_TOTAL: 1000,
  MAX_PER_MUSEUM: 400
};

// 유명 작가 체크 함수
const FAMOUS_ARTISTS = [
  'van gogh', 'monet', 'renoir', 'degas', 'cezanne', 'picasso', 'matisse',
  'rembrandt', 'vermeer', 'hokusai', 'hiroshige', 'klimt', 'manet',
  'pissarro', 'gauguin', 'da vinci', 'michelangelo', 'botticelli',
  'warhol', 'pollock', 'hopper', 'o\'keeffe', 'turner', 'constable'
];

function isFamousArtist(artistName) {
  if (!artistName) return false;
  const lowerName = artistName.toLowerCase();
  return FAMOUS_ARTISTS.some(famous => lowerName.includes(famous));
}

// 1. Rijksmuseum API 수집
async function collectRijksmuseum() {
  console.log('🇳🇱 Rijksmuseum 수집 시작...');
  
  const collected = [];
  
  try {
    // 유명 작가들로 검색
    const searchTerms = ['van gogh', 'monet', 'rembrandt', 'vermeer', 'hokusai'];
    
    for (const term of searchTerms) {
      if (collected.length >= CONFIG.MAX_PER_MUSEUM) break;
      
      await new Promise(resolve => setTimeout(resolve, CONFIG.API_DELAY));
      
      // Rijksmuseum API 호출 (API key 불필요한 공개 엔드포인트 사용)
      const searchUrl = `https://www.rijksmuseum.nl/api/en/collection?q=${encodeURIComponent(term)}&imgonly=true&ps=100`;
      
      try {
        const response = await axios.get(searchUrl, {
          httpsAgent,
          timeout: 10000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Educational Purpose)'
          }
        });
        
        if (response.data && response.data.artObjects) {
          for (const artwork of response.data.artObjects) {
            if (collected.length >= CONFIG.MAX_PER_MUSEUM) break;
            
            // 공개 도메인 작품만 (Rijksmuseum은 대부분 공개 도메인)
            if (artwork.webImage && artwork.webImage.url) {
              collected.push({
                objectID: artwork.objectNumber,
                title: artwork.title || 'Untitled',
                artist: artwork.principalOrFirstMaker || 'Unknown',
                date: artwork.dating?.presentingDate || '',
                medium: artwork.subTitle || '',
                department: 'Rijksmuseum',
                classification: artwork.objectTypes?.[0] || '',
                isHighlight: false,
                primaryImage: artwork.webImage.url,
                primaryImageSmall: artwork.webImage.url,
                metUrl: artwork.links?.web || '',
                source: 'Rijksmuseum'
              });
              
              console.log(`  ✅ "${artwork.title}" by ${artwork.principalOrFirstMaker}`);
            }
          }
        }
        
        console.log(`  📊 ${term}: ${collected.length}개 수집`);
        
      } catch (error) {
        console.error(`  ❌ ${term} 검색 오류:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Rijksmuseum 수집 오류:', error.message);
  }
  
  console.log(`🇳🇱 Rijksmuseum 완료: ${collected.length}개\n`);
  return collected;
}

// 2. Cleveland Museum API 수집
async function collectClevelandMuseum() {
  console.log('🇺🇸 Cleveland Museum 수집 시작...');
  
  const collected = [];
  
  try {
    // Cleveland Museum API는 공개 API key 없이 사용 가능
    const searchTerms = ['van gogh', 'monet', 'picasso', 'degas', 'renoir'];
    
    for (const term of searchTerms) {
      if (collected.length >= CONFIG.MAX_PER_MUSEUM) break;
      
      await new Promise(resolve => setTimeout(resolve, CONFIG.API_DELAY));
      
      const searchUrl = `https://openaccess-api.clevelandart.org/api/artworks/?q=${encodeURIComponent(term)}&has_image=1&limit=100`;
      
      try {
        const response = await axios.get(searchUrl, {
          httpsAgent,
          timeout: 10000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Educational Purpose)'
          }
        });
        
        if (response.data && response.data.data) {
          for (const artwork of response.data.data) {
            if (collected.length >= CONFIG.MAX_PER_MUSEUM) break;
            
            // 공개 도메인이고 이미지가 있는 작품만
            if (artwork.share_license_status === 'CC0' && artwork.images?.web?.url) {
              collected.push({
                objectID: artwork.id,
                title: artwork.title || 'Untitled',
                artist: artwork.creators?.[0]?.description || 'Unknown',
                date: artwork.creation_date || '',
                medium: artwork.technique || '',
                department: 'Cleveland Museum',
                classification: artwork.type || '',
                isHighlight: false,
                primaryImage: artwork.images.web.url,
                primaryImageSmall: artwork.images.web.url,
                metUrl: artwork.url || '',
                source: 'Cleveland Museum'
              });
              
              console.log(`  ✅ "${artwork.title}" by ${artwork.creators?.[0]?.description || 'Unknown'}`);
            }
          }
        }
        
        console.log(`  📊 ${term}: ${collected.length}개 수집`);
        
      } catch (error) {
        console.error(`  ❌ ${term} 검색 오류:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Cleveland Museum 수집 오류:', error.message);
  }
  
  console.log(`🇺🇸 Cleveland Museum 완료: ${collected.length}개\n`);
  return collected;
}

// 3. Met Museum 유명 작가 우선 수집
async function collectMetFamousArtists() {
  console.log('🗽 Met Museum 유명 작가 수집 시작...');
  
  const collected = [];
  
  try {
    // 기존 수집된 데이터 로드
    const existingFile = path.join(CONFIG.OUTPUT_DIR, 'met-mass-progress-2025-07-17T10-51-02-695Z.json');
    if (fs.existsSync(existingFile)) {
      const existingData = JSON.parse(fs.readFileSync(existingFile, 'utf8'));
      
      // 유명 작가 작품만 필터링
      const famousArtworks = existingData.artworks.filter(artwork => 
        isFamousArtist(artwork.artist) || artwork.isHighlight
      );
      
      collected.push(...famousArtworks);
      console.log(`  📥 기존 데이터에서 ${famousArtworks.length}개 유명 작가 작품 로드`);
    }
    
    // 추가로 Van Gogh 작품 더 수집
    const vanGoghIds = [436524, 436525, 436526, 436527, 436528, 436529, 436530, 436531, 436532, 436533, 437984];
    
    for (const objectId of vanGoghIds) {
      if (collected.length >= CONFIG.MAX_PER_MUSEUM) break;
      
      try {
        await new Promise(resolve => setTimeout(resolve, CONFIG.API_DELAY));
        
        const response = await axios.get(
          `https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectId}`,
          { httpsAgent, timeout: 10000 }
        );
        
        const artwork = response.data;
        
        if (artwork.isPublicDomain && artwork.primaryImage) {
          // 이미 수집된 작품인지 확인
          const alreadyExists = collected.some(c => c.objectID === artwork.objectID);
          
          if (!alreadyExists) {
            collected.push({
              objectID: artwork.objectID,
              title: artwork.title || 'Untitled',
              artist: artwork.artistDisplayName || 'Unknown',
              date: artwork.objectDate || '',
              medium: artwork.medium || '',
              department: artwork.department || '',
              classification: artwork.classification || '',
              isHighlight: artwork.isHighlight || false,
              primaryImage: artwork.primaryImage,
              primaryImageSmall: artwork.primaryImageSmall || '',
              metUrl: artwork.objectURL || '',
              source: 'Met Museum'
            });
            
            console.log(`  ✅ "${artwork.title}" by ${artwork.artistDisplayName}`);
          }
        }
        
      } catch (error) {
        // 개별 작품 오류는 무시
        continue;
      }
    }
    
  } catch (error) {
    console.error('❌ Met Museum 수집 오류:', error.message);
  }
  
  console.log(`🗽 Met Museum 완료: ${collected.length}개\n`);
  return collected;
}

// 메인 수집 함수
async function collectMultiMuseum() {
  console.log('🌍 다중 미술관 수집 시작...\n');
  
  const allArtworks = [];
  
  // 1. Met Museum 수집
  const metArtworks = await collectMetFamousArtists();
  allArtworks.push(...metArtworks);
  
  // 2. Rijksmuseum 수집
  const rijksArtworks = await collectRijksmuseum();
  allArtworks.push(...rijksArtworks);
  
  // 3. Cleveland Museum 수집
  const clevelandArtworks = await collectClevelandMuseum();
  allArtworks.push(...clevelandArtworks);
  
  // 중복 제거 (title + artist로 체크)
  const uniqueArtworks = [];
  const seen = new Set();
  
  for (const artwork of allArtworks) {
    const key = `${artwork.title}-${artwork.artist}`.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      uniqueArtworks.push(artwork);
    }
  }
  
  // 결과 저장
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputFile = path.join(CONFIG.OUTPUT_DIR, `multi-museum-${timestamp}.json`);
  
  fs.writeFileSync(outputFile, JSON.stringify({
    metadata: {
      sources: ['Met Museum', 'Rijksmuseum', 'Cleveland Museum'],
      date: new Date().toISOString(),
      total: uniqueArtworks.length,
      breakdown: {
        'Met Museum': metArtworks.length,
        'Rijksmuseum': rijksArtworks.length,
        'Cleveland Museum': clevelandArtworks.length
      }
    },
    artworks: uniqueArtworks
  }, null, 2));
  
  console.log('✨ 다중 미술관 수집 완료!');
  console.log(`  - 총 수집: ${uniqueArtworks.length}개`);
  console.log(`  - Met Museum: ${metArtworks.length}개`);
  console.log(`  - Rijksmuseum: ${rijksArtworks.length}개`);
  console.log(`  - Cleveland Museum: ${clevelandArtworks.length}개`);
  console.log(`  - 저장 위치: ${outputFile}`);
  
  return outputFile;
}

// 실행
if (require.main === module) {
  collectMultiMuseum().catch(console.error);
}

module.exports = { collectMultiMuseum };