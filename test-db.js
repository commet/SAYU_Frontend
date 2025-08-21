// DB 전시 데이터 확인 스크립트

async function checkExhibitions() {
  try {
    const response = await fetch('http://localhost:3000/api/exhibitions?limit=100');
    const data = await response.json();
    
    console.log('총 전시 개수:', data.data?.length || 0);
    console.log('\n=== 주요 전시 찾기 ===\n');
    
    // 리움 관련 전시
    const leeum = data.data?.filter(ex => 
      ex.venue?.includes('리움') || ex.venue?.includes('Leeum')
    );
    console.log('리움 전시:', leeum?.length || 0, '개');
    leeum?.forEach(ex => {
      console.log(`- ${ex.title} | ${ex.venue} | ${ex.startDate} ~ ${ex.endDate}`);
    });
    
    // 예술의전당 관련
    const sac = data.data?.filter(ex => 
      ex.venue?.includes('예술의전당') || ex.venue?.includes('한가람')
    );
    console.log('\n예술의전당 전시:', sac?.length || 0, '개');
    sac?.forEach(ex => {
      console.log(`- ${ex.title} | ${ex.venue} | ${ex.startDate} ~ ${ex.endDate}`);
    });
    
    // 국립현대미술관 관련
    const mmca = data.data?.filter(ex => 
      ex.venue?.includes('국립현대') || ex.venue?.includes('MMCA')
    );
    console.log('\n국립현대미술관 전시:', mmca?.length || 0, '개');
    mmca?.forEach(ex => {
      console.log(`- ${ex.title} | ${ex.venue} | ${ex.startDate} ~ ${ex.endDate}`);
    });
    
    // 이불, 오르세, 김창열 관련 검색
    console.log('\n=== 특정 전시 검색 ===\n');
    
    const leebul = data.data?.filter(ex => 
      ex.title?.includes('이불') || ex.title?.includes('Lee Bul')
    );
    console.log('이불 관련:', leebul?.length || 0, '개');
    leebul?.forEach(ex => {
      console.log(`- ${ex.title} | ${ex.venue} | ${ex.startDate} ~ ${ex.endDate}`);
    });
    
    const orsay = data.data?.filter(ex => 
      ex.title?.includes('오르세') || ex.title?.includes('고흐') || ex.title?.includes('세잔')
    );
    console.log('\n오르세 관련:', orsay?.length || 0, '개');
    orsay?.forEach(ex => {
      console.log(`- ${ex.title} | ${ex.venue} | ${ex.startDate} ~ ${ex.endDate}`);
    });
    
    const kim = data.data?.filter(ex => 
      ex.title?.includes('김창열') || ex.title?.includes('물방울')
    );
    console.log('\n김창열 관련:', kim?.length || 0, '개');
    kim?.forEach(ex => {
      console.log(`- ${ex.title} | ${ex.venue} | ${ex.startDate} ~ ${ex.endDate}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkExhibitions();