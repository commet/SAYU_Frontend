const collector = require('./src/services/enhancedExhibitionCollectorService.js');

async function collectSeoulExhibitions() {
  console.log('🎨 Starting Seoul major museums exhibition collection...');
  console.log('Target museums:');
  console.log('- 국립현대미술관 (MMCA)');
  console.log('- 서울시립미술관 (SEMA)'); 
  console.log('- 리움미술관 (Leeum)');
  console.log('- 예술의전당 (Seoul Arts Center)');
  console.log('- 대림미술관 (Daelim)');
  console.log('- 아모레퍼시픽미술관 (Amore)');
  console.log('- 호암미술관 (Hoam)');
  console.log('');
  
  try {
    const results = await collector.collectAllExhibitions();
    
    console.log('=== COLLECTION RESULTS ===');
    console.log(`Total exhibitions found: ${results.total}`);
    console.log(`Successfully collected: ${results.success}`);
    console.log(`Failed sources: ${results.failed}`);
    console.log(`Saved to database: ${results.saved || 0}`);
    console.log(`Duplicates skipped: ${results.duplicates || 0}`);
    console.log('');
    
    if (results.sources) {
      console.log('=== SOURCE BREAKDOWN ===');
      Object.entries(results.sources).forEach(([source, data]) => {
        console.log(`${source}: ${data.count || 0} exhibitions`);
      });
    }
    
    // Show some sample exhibitions
    if (results.exhibitions && results.exhibitions.length > 0) {
      console.log('');
      console.log('=== SAMPLE EXHIBITIONS ===');
      results.exhibitions.slice(0, 5).forEach((ex, i) => {
        console.log(`${i+1}. ${ex.title || 'No title'}`);
        console.log(`   📍 ${ex.venue_name || 'Unknown venue'}`);
        console.log(`   📅 ${ex.start_date || 'No date'} ~ ${ex.end_date || 'No end date'}`);
        console.log(`   🔗 ${ex.source || 'No source'}`);
        console.log('');
      });
    }
    
    return results;
    
  } catch (error) {
    console.error('❌ Collection failed:', error.message);
    console.error(error);
  }
}

collectSeoulExhibitions();