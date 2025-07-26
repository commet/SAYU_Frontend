const ArtMapCrawler = require('./src/services/artmap-crawler/artmapCrawler');

async function quickTest() {
  console.log('🧪 QUICK ARTMAP TEST');
  console.log('===================');
  
  const crawler = new ArtMapCrawler();
  
  try {
    // 런던에서 제한적 테스트
    console.log('Testing venue collection for London...');
    
    const result = await crawler.crawlCity('london', {
      maxVenues: 2, // 매우 제한적
      venueTypes: ['institutions'], // institutions만 테스트
      saveToJson: true
    });
    
    console.log('\n✅ Test completed!');
    console.log('Results:', result);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await crawler.close();
  }
}

quickTest();