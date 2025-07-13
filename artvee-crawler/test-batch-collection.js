const FamousArtistCollector = require('./collect-famous-artists.js');

/**
 * 소규모 배치 테스트 - 각 SAYU 타입에서 1명씩만 수집
 */
async function testBatchCollection() {
  console.log('🎨 소규모 배치 수집 테스트\n');
  
  const collector = new FamousArtistCollector();
  
  // 테스트용으로 각 타입에서 첫 번째 작가만 사용
  const testArtists = {
    'LAEF': ['vincent-van-gogh'],        // 여우 - 반 고흐
    'LAEC': ['claude-monet'],            // 고양이 - 모네
    'LREC': ['pierre-auguste-renoir'],   // 고슴도치 - 르누아르
    'SAEF': ['henri-matisse'],           // 나비 - 마티스
    'SREC': ['john-everett-millais']     // 오리 - 밀레
  };
  
  // 기존 famousArtists를 testArtists로 임시 교체
  const originalArtists = collector.famousArtists;
  collector.famousArtists = testArtists;
  
  try {
    const artworks = await collector.collectFamousArtworks();
    
    console.log('\n🎯 수집 결과 요약:');
    console.log(`총 작품 수: ${artworks.length}개`);
    
    // SAYU 타입별 분석
    const typeAnalysis = {};
    artworks.forEach(artwork => {
      if (!typeAnalysis[artwork.sayuType]) {
        typeAnalysis[artwork.sayuType] = {
          count: 0,
          artists: new Set(),
          samples: []
        };
      }
      
      typeAnalysis[artwork.sayuType].count++;
      typeAnalysis[artwork.sayuType].artists.add(artwork.artist);
      
      if (typeAnalysis[artwork.sayuType].samples.length < 2) {
        typeAnalysis[artwork.sayuType].samples.push(artwork.title);
      }
    });
    
    console.log('\n📊 SAYU 타입별 상세 분석:');
    Object.entries(typeAnalysis).forEach(([type, data]) => {
      console.log(`\n${type}:`);
      console.log(`  작품 수: ${data.count}개`);
      console.log(`  작가: ${Array.from(data.artists).join(', ')}`);
      console.log(`  샘플: ${data.samples.join(', ')}`);
    });
    
    // 데이터 품질 체크
    console.log('\n🔍 데이터 품질 체크:');
    const withTitles = artworks.filter(a => a.title && a.title !== 'Untitled').length;
    const withArtists = artworks.filter(a => a.artist && a.artist !== 'Unknown').length;
    const withIds = artworks.filter(a => a.artveeId).length;
    
    console.log(`  제목 있음: ${withTitles}/${artworks.length} (${Math.round(withTitles/artworks.length*100)}%)`);
    console.log(`  작가 있음: ${withArtists}/${artworks.length} (${Math.round(withArtists/artworks.length*100)}%)`);
    console.log(`  ID 있음: ${withIds}/${artworks.length} (${Math.round(withIds/artworks.length*100)}%)`);
    
    if (artworks.length >= 20) {
      console.log('\n✅ 테스트 성공! 본격적인 수집을 진행할 수 있습니다.');
    } else {
      console.log('\n⚠️ 수집된 작품이 예상보다 적습니다. 일부 작가들의 URL을 확인해야 할 수 있습니다.');
    }
    
  } catch (error) {
    console.error('❌ 배치 수집 오류:', error.message);
  } finally {
    // 원래 설정 복원
    collector.famousArtists = originalArtists;
  }
}

testBatchCollection().catch(console.error);