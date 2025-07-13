const axios = require('axios');
const FamousArtistCollector = require('./collect-famous-artists.js');

/**
 * 작가들이 실제로 Artvee에 있는지 확인
 */
async function verifyArtists() {
  console.log('🔍 Artvee 작가 존재 여부 확인\n');
  
  const collector = new FamousArtistCollector();
  const allArtists = [];
  
  // 모든 작가 목록 수집
  Object.entries(collector.famousArtists).forEach(([type, artists]) => {
    artists.forEach(artist => {
      allArtists.push({ artist, type });
    });
  });
  
  // 중복 제거
  const uniqueArtists = [...new Set(allArtists.map(a => a.artist))];
  console.log(`총 ${uniqueArtists.length}명의 작가 확인 중...\n`);
  
  const results = {
    found: [],
    notFound: [],
    error: []
  };
  
  // 배치로 확인 (5개씩)
  for (let i = 0; i < uniqueArtists.length; i += 5) {
    const batch = uniqueArtists.slice(i, i + 5);
    
    await Promise.all(batch.map(async (artist) => {
      const url = `https://artvee.com/artist/${artist}/`;
      
      try {
        const response = await axios.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          timeout: 10000
        });
        
        if (response.status === 200) {
          results.found.push(artist);
          console.log(`✅ ${artist}`);
        }
      } catch (error) {
        if (error.response?.status === 404) {
          results.notFound.push(artist);
          console.log(`❌ ${artist} - 404`);
        } else {
          results.error.push(artist);
          console.log(`⚠️ ${artist} - 오류`);
        }
      }
    }));
    
    // 요청 간 지연
    if (i + 5 < uniqueArtists.length) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // 결과 요약
  console.log('\n📊 확인 결과:');
  console.log(`✅ 발견: ${results.found.length}명`);
  console.log(`❌ 없음: ${results.notFound.length}명`);
  console.log(`⚠️ 오류: ${results.error.length}명`);
  
  if (results.notFound.length > 0) {
    console.log('\n🔴 Artvee에 없는 작가들:');
    results.notFound.forEach(artist => {
      // 어떤 타입에 속하는지 찾기
      const artistData = allArtists.find(a => a.artist === artist);
      console.log(`- ${artist} (${artistData.type})`);
    });
    
    // 대체 작가 제안
    console.log('\n💡 대체 가능한 유명 작가들:');
    const alternatives = [
      'gustave-dore', 'aubrey-beardsley', 'arthur-rackham',
      'ivan-aivazovsky', 'ilya-repin', 'isaac-levitan',
      'joaquin-sorolla', 'john-william-godward', 'alma-tadema',
      'eugene-boudin', 'gustave-caillebotte', 'henri-fantin-latour'
    ];
    console.log(alternatives.join(', '));
  }
  
  // 타입별 분포 확인
  console.log('\n📈 타입별 확인된 작가 수:');
  const typeCount = {};
  results.found.forEach(artist => {
    const artistData = allArtists.find(a => a.artist === artist);
    if (artistData) {
      typeCount[artistData.type] = (typeCount[artistData.type] || 0) + 1;
    }
  });
  
  Object.entries(typeCount)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([type, count]) => {
      console.log(`${type}: ${count}명`);
    });
}

verifyArtists().catch(console.error);