// Wikipedia 데이터 수집 테스트

require('dotenv').config();
const WikipediaDataCollector = require('./src/services/wikipediaDataCollector');

async function testWikipediaCollector() {
  console.log('🧪 Wikipedia 데이터 수집 테스트');
  console.log('=' + '='.repeat(70));
  
  const collector = new WikipediaDataCollector();
  
  // 테스트할 작가들
  const testArtists = [
    'Pablo Picasso',
    'Vincent van Gogh',
    'Leonardo da Vinci',
    'Frida Kahlo',
    'Andy Warhol'
  ];
  
  for (const artist of testArtists) {
    console.log(`\n\n🎨 ${artist} 분석`);
    console.log('-'.repeat(70));
    
    const data = await collector.collectArtistData(artist);
    
    if (data) {
      console.log(`✅ Wikipedia 페이지: ${data.title}`);
      console.log(`   URL: ${data.url}`);
      console.log(`   페이지 크기: ${data.pageLength?.toLocaleString()} bytes`);
      console.log(`   언어 버전: ${data.languageCount}개`);
      console.log(`   조회수 (30일): ${data.pageViews?.total30Days?.toLocaleString() || 'N/A'}`);
      console.log(`   일일 평균: ${data.pageViews?.dailyAverage?.toLocaleString() || 'N/A'}회`);
      
      console.log('\n   📚 주요 카테고리:');
      data.categories.slice(0, 5).forEach(cat => {
        console.log(`      - ${cat}`);
      });
      
      console.log('\n   🏆 중요도 지표:');
      Object.entries(data.importanceIndicators).forEach(([key, value]) => {
        if (value === true || (typeof value === 'string' && value !== 'small')) {
          console.log(`      - ${key}: ${value}`);
        }
      });
      
      const score = collector.calculateImportanceScore(data);
      console.log(`\n   📊 Wikipedia 기반 점수: ${score}점`);
      
      // 짧은 대기 (API 제한 방지)
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

// 실행
testWikipediaCollector().catch(console.error);