// exhibitions API가 실제로 반환하는 제목 확인
async function testExhibitionsAPI() {
  console.log('🔍 /api/exhibitions가 실제로 반환하는 제목 확인\n');
  console.log('=' .repeat(80));
  
  try {
    // API 호출
    const response = await fetch('http://localhost:3002/api/exhibitions?limit=20');
    const data = await response.json();
    
    console.log(`\n총 ${data.exhibitions?.length || 0}개 전시 로드됨\n`);
    
    if (data.exhibitions) {
      // 문제가 있을 것 같은 제목들 필터링
      const suspiciousTitles = data.exhibitions.filter(ex => {
        const title = ex.title || '';
        return (
          title.includes('...') ||
          title.includes('기원전') ||
          title.includes('여 년') ||
          title.includes('작품') ||
          title.includes('선정해야') ||
          title.length > 100 ||
          title.match(/^\d+년/)
        );
      });
      
      if (suspiciousTitles.length > 0) {
        console.log('🚨 문제가 있는 제목들:\n');
        suspiciousTitles.forEach((ex, idx) => {
          console.log(`${idx + 1}. ${ex.venue}`);
          console.log(`   API 제목: "${ex.title}"`);
          console.log(`   원본 제목: "${ex.title_local || 'null'}"`);
          console.log('');
        });
      }
      
      // 주요 기관 확인
      console.log('\n📍 주요 기관 전시 (API 반환값):');
      const majorVenues = ['서울공예박물관', '서울서예박물관', 'DDP', '국립현대미술관'];
      
      data.exhibitions.forEach(ex => {
        if (majorVenues.some(v => ex.venue?.includes(v))) {
          console.log(`\n[${ex.venue}]`);
          console.log(`  API 반환 제목: "${ex.title}"`);
          console.log(`  DB 원본 제목: "${ex.title_local}"`);
          if (ex.title !== ex.title_local) {
            console.log(`  ⚠️ 제목이 변경됨!`);
          }
        }
      });
    }
    
  } catch (error) {
    console.error('❌ API 호출 실패:', error.message);
  }
}

// 브라우저에서 실행하거나 Node.js에서 fetch 사용
if (typeof window !== 'undefined') {
  testExhibitionsAPI();
} else {
  console.log('브라우저 콘솔에서 실행하거나 서버가 실행 중인지 확인하세요.');
}