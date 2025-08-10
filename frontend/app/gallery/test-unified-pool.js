// 통합 작품 풀 테스트 스크립트
// 이 스크립트는 개발 중에만 사용됩니다.

const { 
  getAllArtworks, 
  getCloudinaryArtworks,
  evaluatePoolQuality,
  getArtworksByType,
  searchArtworks,
  getRandomArtworks,
  getArtworksForPersonalityType
} = require('./artwork-pool-builder.ts');

async function testUnifiedPool() {
  console.log('🧪 통합 작품 풀 테스트 시작...\n');
  
  try {
    // 1. 전체 풀 구성 테스트
    console.log('1️⃣ 전체 풀 구성 테스트');
    const pool = await getAllArtworks();
    console.log(`✅ 총 ${pool.total}개 작품 로드 성공`);
    console.log(`   ├─ Cloudinary: ${pool.metadata.cloudinaryCount}개`);
    console.log(`   └─ Wikimedia: ${pool.metadata.wikimediaCount}개`);
    
    // 2. 품질 평가 테스트
    console.log('\n2️⃣ 품질 평가 테스트');
    const quality = await evaluatePoolQuality();
    console.log(`✅ 품질 점수: ${quality.qualityScore}`);
    console.log(`   ├─ 시대 다양성: ${quality.diversity.periods}개`);
    console.log(`   ├─ 운동 다양성: ${quality.diversity.movements}개`);
    console.log(`   ├─ 매체 다양성: ${quality.diversity.mediums}개`);
    console.log(`   ├─ 작가 다양성: ${quality.diversity.artists}개`);
    console.log(`   ├─ 테마 다양성: ${quality.diversity.themes}개`);
    console.log(`   └─ 무드 다양성: ${quality.diversity.moods}개`);
    
    // 3. 유형별 필터링 테스트
    console.log('\n3️⃣ 유형별 필터링 테스트');
    const impressionistWorks = await getArtworksByType('theme', 'impressionist');
    console.log(`✅ 인상주의 작품: ${impressionistWorks.length}개`);
    
    const oilPaintings = await getArtworksByType('medium', 'oil');
    console.log(`✅ 유화 작품: ${oilPaintings.length}개`);
    
    const complexWorks = await getArtworksByType('complexity', 'complex');
    console.log(`✅ 복잡한 작품: ${complexWorks.length}개`);
    
    // 4. 검색 기능 테스트
    console.log('\n4️⃣ 검색 기능 테스트');
    const vanGoghWorks = await searchArtworks('van gogh');
    console.log(`✅ 반 고흐 검색 결과: ${vanGoghWorks.length}개`);
    
    const portraitWorks = await searchArtworks('portrait');
    console.log(`✅ 초상화 검색 결과: ${portraitWorks.length}개`);
    
    // 5. 개성 유형별 추천 테스트
    console.log('\n5️⃣ 개성 유형별 추천 테스트');
    const foxWorks = await getArtworksForPersonalityType('LAEF'); // 여우
    console.log(`✅ 여우 유형 추천: ${foxWorks.length}개`);
    
    const dogWorks = await getArtworksForPersonalityType('SREF'); // 강아지
    console.log(`✅ 강아지 유형 추천: ${dogWorks.length}개`);
    
    // 6. 랜덤 작품 선택 테스트
    console.log('\n6️⃣ 랜덤 작품 선택 테스트');
    const randomWorks = await getRandomArtworks(5);
    console.log(`✅ 랜덤 작품 5개 선택:`);
    randomWorks.forEach((work, index) => {
      console.log(`   ${index + 1}. ${work.title} - ${work.artist}`);
    });
    
    // 7. 개성 편향 랜덤 테스트
    console.log('\n7️⃣ 개성 편향 랜덤 테스트');
    const biasedWorks = await getRandomArtworks(5, 'LAEF');
    console.log(`✅ 여우 유형 편향 랜덤 5개:`);
    biasedWorks.forEach((work, index) => {
      console.log(`   ${index + 1}. ${work.title} - ${work.artist} (${work.source})`);
    });
    
    console.log('\n🎉 모든 테스트 성공적으로 완료!');
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error);
  }
}

// 테스트 실행
if (require.main === module) {
  testUnifiedPool();
}

module.exports = { testUnifiedPool };