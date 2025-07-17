const axios = require('axios');
const https = require('https');
const fs = require('fs');
const path = require('path');

// HTTPS 에이전트
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

// 유명 작가 리스트 (우선순위 순)
const PRIORITY_ARTISTS = [
  // 최고 우선순위 (인상주의/후기 인상주의)
  { name: 'Vincent van Gogh', priority: 1, variations: ['Van Gogh', 'Gogh'] },
  { name: 'Claude Monet', priority: 1, variations: ['Monet'] },
  { name: 'Pierre-Auguste Renoir', priority: 1, variations: ['Renoir'] },
  { name: 'Edgar Degas', priority: 1, variations: ['Degas'] },
  { name: 'Paul Cézanne', priority: 1, variations: ['Cézanne', 'Cezanne'] },
  { name: 'Paul Gauguin', priority: 1, variations: ['Gauguin'] },
  
  // 고전 거장 (르네상스/바로크)
  { name: 'Rembrandt van Rijn', priority: 2, variations: ['Rembrandt'] },
  { name: 'Johannes Vermeer', priority: 2, variations: ['Vermeer'] },
  { name: 'Leonardo da Vinci', priority: 2, variations: ['Leonardo', 'da Vinci'] },
  { name: 'Michelangelo Buonarroti', priority: 2, variations: ['Michelangelo'] },
  
  // 현대 미술
  { name: 'Pablo Picasso', priority: 3, variations: ['Picasso'] },
  { name: 'Henri Matisse', priority: 3, variations: ['Matisse'] },
  { name: 'Andy Warhol', priority: 3, variations: ['Warhol'] },
  { name: 'Jackson Pollock', priority: 3, variations: ['Pollock'] },
  
  // 일본 우키요에
  { name: 'Katsushika Hokusai', priority: 2, variations: ['Hokusai'] },
  { name: 'Utagawa Hiroshige', priority: 2, variations: ['Hiroshige'] },
  
  // 기타 유명 작가들
  { name: 'Gustav Klimt', priority: 3, variations: ['Klimt'] },
  { name: 'Édouard Manet', priority: 3, variations: ['Manet'] },
  { name: 'Camille Pissarro', priority: 3, variations: ['Pissarro'] },
  { name: 'Henri de Toulouse-Lautrec', priority: 3, variations: ['Toulouse-Lautrec'] },
  { name: 'Georgia O\'Keeffe', priority: 3, variations: ['O\'Keeffe', 'Keeffe'] },
  { name: 'Edward Hopper', priority: 3, variations: ['Hopper'] }
];

// 유명 작가 작품인지 확인
function isFamousArtist(artistName) {
  if (!artistName) return null;
  
  const lowerName = artistName.toLowerCase();
  
  for (const artist of PRIORITY_ARTISTS) {
    // 정확한 이름 매칭
    if (lowerName.includes(artist.name.toLowerCase())) {
      return artist;
    }
    
    // 변형 이름 매칭
    for (const variation of artist.variations) {
      if (lowerName.includes(variation.toLowerCase())) {
        return artist;
      }
    }
  }
  
  return null;
}

// European Paintings 부서 우선 수집
async function collectEuropeanPaintings(maxCount = 500) {
  console.log('🎨 European Paintings 부서 유명 작가 수집 시작...\n');
  
  try {
    // European Paintings 부서 (ID: 11) 오브젝트 가져오기
    const response = await axios.get(
      'https://collectionapi.metmuseum.org/public/collection/v1/objects?departmentIds=11',
      { httpsAgent, timeout: 30000 }
    );
    
    console.log(`📊 European Paintings 부서: ${response.data.total}개 작품`);
    
    const europeanPaintingIds = response.data.objectIDs || [];
    const collectedArtworks = [];
    
    // 우선순위별로 분류할 배열
    const priorityGroups = {
      1: [], // 최고 우선순위
      2: [], // 고전 거장
      3: []  // 현대 미술
    };
    
    let processed = 0;
    
    // 작품 하나씩 확인
    for (const objectId of europeanPaintingIds.slice(0, 2000)) { // 처음 2000개만 확인
      if (collectedArtworks.length >= maxCount) break;
      
      try {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 대기
        
        const artworkResponse = await axios.get(
          `https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectId}`,
          { httpsAgent, timeout: 10000 }
        );
        
        const artwork = artworkResponse.data;
        processed++;
        
        // 공개 도메인이고 이미지가 있는 작품만
        if (artwork.isPublicDomain && artwork.primaryImage) {
          const famousArtist = isFamousArtist(artwork.artistDisplayName);
          
          if (famousArtist) {
            const artworkData = {
              objectID: artwork.objectID,
              title: artwork.title || 'Untitled',
              artist: artwork.artistDisplayName,
              priority: famousArtist.priority,
              date: artwork.objectDate || '',
              medium: artwork.medium || '',
              department: artwork.department || '',
              classification: artwork.classification || '',
              isHighlight: artwork.isHighlight || false,
              primaryImage: artwork.primaryImage,
              primaryImageSmall: artwork.primaryImageSmall || '',
              metUrl: artwork.objectURL || ''
            };
            
            priorityGroups[famousArtist.priority].push(artworkData);
            collectedArtworks.push(artworkData);
            
            console.log(`  ✅ [P${famousArtist.priority}] "${artwork.title}" by ${artwork.artistDisplayName}`);
          }
        }
        
        // 진행 상황 출력
        if (processed % 100 === 0) {
          console.log(`\n📈 진행: ${processed}개 처리, ${collectedArtworks.length}개 수집`);
          console.log(`  - 우선순위 1: ${priorityGroups[1].length}개`);
          console.log(`  - 우선순위 2: ${priorityGroups[2].length}개`);
          console.log(`  - 우선순위 3: ${priorityGroups[3].length}개\n`);
        }
        
      } catch (error) {
        // 개별 작품 오류는 무시
        continue;
      }
    }
    
    // 우선순위별로 정렬 (우선순위 1 > 2 > 3)
    const sortedArtworks = [
      ...priorityGroups[1],
      ...priorityGroups[2], 
      ...priorityGroups[3]
    ];
    
    // 결과 저장
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputFile = path.join(__dirname, 'met-artworks-data', `met-famous-artists-${timestamp}.json`);
    
    fs.writeFileSync(outputFile, JSON.stringify({
      metadata: {
        source: 'Metropolitan Museum of Art',
        department: 'European Paintings',
        method: 'Famous Artists Priority Collection',
        date: new Date().toISOString(),
        totalProcessed: processed,
        totalCollected: collectedArtworks.length,
        priorityBreakdown: {
          priority1: priorityGroups[1].length,
          priority2: priorityGroups[2].length,
          priority3: priorityGroups[3].length
        }
      },
      artworks: sortedArtworks
    }, null, 2));
    
    console.log('\n✨ 수집 완료!');
    console.log(`  - 총 처리: ${processed}개`);
    console.log(`  - 수집 성공: ${collectedArtworks.length}개`);
    console.log(`  - 우선순위 1 (최고): ${priorityGroups[1].length}개`);
    console.log(`  - 우선순위 2 (고전): ${priorityGroups[2].length}개`);
    console.log(`  - 우선순위 3 (현대): ${priorityGroups[3].length}개`);
    console.log(`  - 저장 위치: ${outputFile}`);
    
    return outputFile;
    
  } catch (error) {
    console.error('❌ 오류:', error.message);
    return null;
  }
}

// 실행
if (require.main === module) {
  collectEuropeanPaintings(1000).catch(console.error);
}

module.exports = { collectEuropeanPaintings, isFamousArtist, PRIORITY_ARTISTS };