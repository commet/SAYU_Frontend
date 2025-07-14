const fs = require('fs').promises;

async function analyzeCollection() {
  try {
    // 데이터 로드
    const data = await fs.readFile('./data/famous-artists-artworks.json', 'utf8');
    const artworks = JSON.parse(data);
    
    // 통계 계산
    const artistStats = {};
    const sayuTypeStats = {};
    
    artworks.forEach(artwork => {
      // 작가별 통계
      artistStats[artwork.artist] = (artistStats[artwork.artist] || 0) + 1;
      
      // SAYU 타입별 통계
      sayuTypeStats[artwork.sayuType] = (sayuTypeStats[artwork.sayuType] || 0) + 1;
    });
    
    console.log('📊 수집 현황 분석\n');
    console.log(`총 작품 수: ${artworks.length}개`);
    console.log(`총 작가 수: ${Object.keys(artistStats).length}명`);
    
    console.log('\n🎨 주요 작가별 작품 수 (상위 30명):');
    Object.entries(artistStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 30)
      .forEach(([artist, count]) => {
        console.log(`  ${artist}: ${count}개`);
      });
    
    console.log('\n🦊 SAYU 타입별 분포:');
    Object.entries(sayuTypeStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([type, count]) => {
        console.log(`  ${type}: ${count}개`);
      });
    
    // 서양미술사 주요 작가 확인
    const masterArtists = [
      'Leonardo da Vinci',
      'Michelangelo',
      'Vincent van Gogh',
      'Claude Monet',
      'Rembrandt van Rijn',
      'Pablo Picasso',
      'Johannes Vermeer',
      'Caravaggio',
      'Peter Paul Rubens',
      'Diego Velázquez',
      'Jan van Eyck',
      'Sandro Botticelli',
      'Henri Matisse',
      'Paul Cézanne',
      'Edgar Degas',
      'Pierre-Auguste Renoir',
      'Wassily Kandinsky',
      'Piet Mondrian',
      'Édouard Manet',
      'J.M.W. Turner'
    ];
    
    console.log('\n🏛️ 서양미술사 거장 포함 여부:');
    let includedMasters = 0;
    masterArtists.forEach(master => {
      const found = Object.keys(artistStats).find(a => 
        a.toLowerCase().includes(master.toLowerCase()) || 
        master.toLowerCase().includes(a.toLowerCase())
      );
      if (found) {
        console.log(`  ✅ ${master} (${artistStats[found]}개)`);
        includedMasters++;
      } else {
        console.log(`  ❌ ${master}`);
      }
    });
    
    console.log(`\n포함된 거장: ${includedMasters}/${masterArtists.length}`);
    
  } catch (error) {
    console.error('오류:', error);
  }
}

analyzeCollection();