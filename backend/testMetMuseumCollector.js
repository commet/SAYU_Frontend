// Met Museum 데이터 수집 테스트

require('dotenv').config();
const MetMuseumDataCollector = require('./src/services/metMuseumDataCollector');

async function testMetMuseumCollector() {
  console.log('🧪 Met Museum 데이터 수집 테스트');
  console.log(`=${'='.repeat(70)}`);

  const collector = new MetMuseumDataCollector();

  // 테스트할 작가들
  const testArtists = [
    'Vincent van Gogh',
    'Pablo Picasso',
    'Claude Monet'
  ];

  for (const artist of testArtists) {
    console.log(`\n\n🎨 ${artist} 분석`);
    console.log('-'.repeat(70));

    const data = await collector.collectArtistData(artist);

    if (data) {
      console.log(`✅ Met Museum 소장품: ${data.totalWorks}개`);
      console.log(`   분석한 작품: ${data.analyzedWorks}개`);
      console.log(`   하이라이트: ${data.highlights}개`);
      console.log(`   현재 전시 중: ${data.onView}개`);
      console.log(`   이미지 보유: ${data.withImages}개`);

      console.log('\n   🏛️ 부서별 분포:');
      Object.entries(data.departments).forEach(([dept, count]) => {
        console.log(`      - ${dept}: ${count}개`);
      });

      console.log('\n   📅 시대별 분포:');
      Object.entries(data.periods).forEach(([period, count]) => {
        console.log(`      - ${period}: ${count}개`);
      });

      console.log('\n   🎨 주요 작품:');
      data.artworks.slice(0, 3).forEach((work, idx) => {
        console.log(`      ${idx + 1}. ${work.title} (${work.date})`);
        if (work.isHighlight) console.log(`         ⭐ 하이라이트 작품`);
        if (work.onView) console.log(`         👁️ 갤러리 ${work.gallery}번에 전시 중`);
      });

      const score = collector.calculateImportanceScore(data);
      console.log(`\n   📊 Met Museum 기반 점수: ${score}점`);

      // API 제한 방지
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

// 실행
testMetMuseumCollector().catch(console.error);
