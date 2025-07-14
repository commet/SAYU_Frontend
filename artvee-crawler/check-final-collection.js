const fs = require('fs').promises;

async function checkFinalCollection() {
  console.log('📊 최종 수집 현황 확인\n');
  
  try {
    // 1. 유명 작가 작품
    const famousData = await fs.readFile('./data/famous-artists-artworks.json', 'utf8');
    const famousArtworks = JSON.parse(famousData);
    console.log(`✅ 유명 작가 작품: ${famousArtworks.length}개`);
    
    // 2. 벌크 수집 작품
    const bulkData = await fs.readFile('./data/bulk-artworks.json', 'utf8');
    const bulkArtworks = JSON.parse(bulkData);
    console.log(`✅ 벌크 수집 작품: ${bulkArtworks.length}개`);
    
    // 3. 중복 확인
    const famousUrls = new Set(famousArtworks.map(a => a.url));
    const uniqueBulk = bulkArtworks.filter(a => !famousUrls.has(a.url));
    console.log(`✅ 중복 제거 후 벌크: ${uniqueBulk.length}개`);
    
    // 4. 총합
    const totalUnique = famousArtworks.length + uniqueBulk.length;
    console.log(`\n📊 총 고유 작품 수: ${totalUnique}개`);
    
    // 5. 시대별 분석 (벌크 작품)
    const eras = {};
    bulkArtworks.forEach(artwork => {
      const title = artwork.title || '';
      const year = title.match(/\((\d{4})\)/)?.[1] || 
                   title.match(/\b(1[0-9]{3}|20[0-2][0-9])\b/)?.[0];
      
      if (year) {
        const yearNum = parseInt(year);
        let era = 'Unknown';
        
        if (yearNum < 1400) era = 'Medieval';
        else if (yearNum < 1500) era = '15th Century';
        else if (yearNum < 1600) era = '16th Century';
        else if (yearNum < 1700) era = '17th Century';
        else if (yearNum < 1800) era = '18th Century';
        else if (yearNum < 1900) era = '19th Century';
        else if (yearNum < 2000) era = '20th Century';
        else era = '21st Century';
        
        eras[era] = (eras[era] || 0) + 1;
      }
    });
    
    console.log('\n🕰️ 시대별 분포 (벌크 작품):');
    Object.entries(eras)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([era, count]) => {
        console.log(`   ${era}: ${count}개`);
      });
    
    // 6. 작가 분석
    const artists = {};
    [...famousArtworks, ...bulkArtworks].forEach(artwork => {
      const artist = artwork.artist || 'Unknown';
      artists[artist] = (artists[artist] || 0) + 1;
    });
    
    const knownArtists = Object.entries(artists).filter(([name, _]) => name !== 'Unknown');
    const unknownCount = artists['Unknown'] || 0;
    
    console.log('\n🎨 작가 통계:');
    console.log(`   알려진 작가: ${knownArtists.length}명`);
    console.log(`   Unknown 작가: ${unknownCount}개 작품`);
    console.log(`\n   상위 20명 작가:`);
    knownArtists
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .forEach(([artist, count]) => {
        console.log(`     ${artist}: ${count}개`);
      });
    
    // 7. SAYU 타입 분포
    const sayuTypes = {};
    [...famousArtworks, ...uniqueBulk].forEach(artwork => {
      const type = artwork.sayuType || 'Unknown';
      sayuTypes[type] = (sayuTypes[type] || 0) + 1;
    });
    
    console.log('\n🦊 SAYU 타입별 분포:');
    Object.entries(sayuTypes)
      .sort(([,a], [,b]) => b - a)
      .forEach(([type, count]) => {
        const percentage = ((count / totalUnique) * 100).toFixed(1);
        console.log(`   ${type}: ${count}개 (${percentage}%)`);
      });
    
  } catch (error) {
    console.error('오류:', error);
  }
}

checkFinalCollection();