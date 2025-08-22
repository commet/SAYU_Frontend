const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://hgltvdshuyfffskvjmst.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0ODk1MzEsImV4cCI6MjA2ODA2NTUzMX0.PyoZ0e0P5NtWjMimxGimsJQ6nfFNRFmT4i0bRMEjxTk'
);

async function findLeeumExhibition() {
  try {
    // 리움 또는 홍콩 M+ 관련 전시 찾기
    const { data: exhibitions, error } = await supabase
      .from('exhibitions')
      .select('*')
      .or('venue_name.ilike.%리움%,venue_name.ilike.%leeum%,description.ilike.%홍콩%,description.ilike.%M+%')
      .limit(10);
    
    if (error) {
      console.error('Error:', error);
      return;
    }

    console.log(`\n🔍 리움/홍콩 M+ 관련 전시 ${exhibitions.length}개 발견:\n`);
    
    exhibitions.forEach((ex, index) => {
      console.log(`${index + 1}. ID: ${ex.id}`);
      console.log(`   제목: ${ex.title_local || ex.title_en || '제목 없음'}`);
      console.log(`   설명: ${ex.description ? ex.description.substring(0, 100) + '...' : '설명 없음'}`);
      console.log(`   장소: ${ex.venue_name}`);
      console.log(`   기간: ${ex.start_date} ~ ${ex.end_date}`);
      console.log('---');
    });

    // 가장 유력한 후보 찾기
    const candidate = exhibitions.find(ex => 
      (ex.description && ex.description.includes('M+')) || 
      (ex.venue_name && ex.venue_name.includes('리움'))
    );

    if (candidate) {
      console.log('\n✨ 수정할 후보 전시:');
      console.log(`ID: ${candidate.id}`);
      console.log(`현재 제목: ${candidate.title_local || candidate.title_en}`);
      console.log(`현재 설명: ${candidate.description?.substring(0, 200)}`);
      
      // 이불 개인전으로 업데이트
      const updateData = {
        title_local: '이불: 1998년 이후',
        title_en: 'Lee Bul: After 1998',
        description: `리움미술관은 한국 동시대미술의 주요 작가 이불의 대규모 서베이 전시를 개최합니다. 이불은 퍼포먼스, 조각, 설치, 평면을 아우르는 실험적 작품을 통해 신체와 사회, 인간과 기술, 자연과 문명의 복잡다단한 관계와 이를 둘러싼 권력의 문제를 폭넓게 탐색하며, 인류의 과거와 현재를 성찰하고 미래에 대한 확장된 사유를 이끌어왔습니다.

《이불: 1998년 이후》는 1990년대 후반부터 현재까지 이어지는 이불 작업의 큰 흐름을 조망하는 전시로, 총 150여 점의 작품을 선보입니다. 전시는 〈사이보그〉, 〈아나그램〉, 노래방 연작 등 대표적 초기작을 필두로, 2005년부터 전개된 건축적 조각설치 연작인 〈몽그랑레시〉의 주요 작품 일체를 중점적으로 다룹니다.

리움미술관과 홍콩 M+가 공동기획하는 이번 전시는 2025년 가을 리움을 시작으로 2026년 3월 M+로 이어지며, 2027년 하반기까지 주요 해외 기관으로 순회될 예정입니다.`,
        venue_name: '리움미술관',
        venue_city: '서울',
        start_date: '2025-09-04',
        end_date: '2026-01-04',
        category: '현대미술'
      };

      console.log('\n📝 업데이트할 내용:');
      console.log(JSON.stringify(updateData, null, 2));
      
      // 실제 업데이트는 확인 후 진행
      console.log('\n⚠️  위 ID의 전시를 이불 개인전으로 업데이트하려면 update-leeum-exhibition.js 실행');
      console.log(`   수정할 전시 ID: ${candidate.id}`);
    }

  } catch (err) {
    console.error('Error:', err);
  }
}

findLeeumExhibition();