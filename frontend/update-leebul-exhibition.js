const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://hgltvdshuyfffskvjmst.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0ODk1MzEsImV4cCI6MjA2ODA2NTUzMX0.PyoZ0e0P5NtWjMimxGimsJQ6nfFNRFmT4i0bRMEjxTk'
);

async function updateLeeBulExhibition() {
  try {
    // 이불 개인전 ID 사용 (이미 존재)
    const exhibitionId = '061303bc-7f17-476c-8449-07f6e9952b35';
    
    // 이불 개인전 상세 정보로 업데이트
    const { data, error } = await supabase
      .from('exhibitions')
      .update({
        title_local: '이불: 1998년 이후',
        title_en: 'Lee Bul: After 1998',
        description: `리움미술관은 한국 동시대미술의 주요 작가 이불의 대규모 서베이 전시를 개최합니다. 이불은 퍼포먼스, 조각, 설치, 평면을 아우르는 실험적 작품을 통해 신체와 사회, 인간과 기술, 자연과 문명의 복잡다단한 관계와 이를 둘러싼 권력의 문제를 폭넓게 탐색하며, 인류의 과거와 현재를 성찰하고 미래에 대한 확장된 사유를 이끌어왔습니다.

《이불: 1998년 이후》는 1990년대 후반부터 현재까지 이어지는 이불 작업의 큰 흐름을 조망하는 전시로, 총 150여 점의 작품을 선보입니다. 전시는 〈사이보그〉, 〈아나그램〉, 노래방 연작 등 대표적 초기작을 필두로, 2005년부터 전개된 건축적 조각설치 연작인 〈몽그랑레시〉의 주요 작품 일체를 중점적으로 다룹니다. 또한 2010년대 이후 발전된 〈취약할 의향〉과 〈퍼듀〉 연작, 작가의 상상과 창작 과정을 담은 드로잉과 모형, 그리고 가장 최근의 조각 작품을 망라합니다.

리움미술관과 홍콩 M+가 공동기획하는 이번 전시는 2025년 가을 리움을 시작으로 2026년 3월 M+로 이어지며, 2027년 하반기까지 주요 해외 기관으로 순회될 예정입니다.

전시 장소: 블랙박스, 그라운드갤러리`,
        venue_name: '리움미술관',
        venue_city: '서울',
        admission_fee: '미정'
      })
      .eq('id', exhibitionId);
    
    if (error) {
      console.error('Error updating exhibition:', error);
    } else {
      console.log('✅ 이불 개인전 정보 업데이트 완료');
      console.log(`   ID: ${exhibitionId}`);
    }

    // 업데이트 확인
    const { data: updated } = await supabase
      .from('exhibitions')
      .select('*')
      .eq('id', exhibitionId)
      .single();
    
    if (updated) {
      console.log('\n📋 업데이트된 정보:');
      console.log(`   제목: ${updated.title_local || updated.title_en}`);
      console.log(`   장소: ${updated.venue_name}`);
      console.log(`   기간: ${updated.start_date} ~ ${updated.end_date}`);
      console.log(`   설명: ${updated.description?.substring(0, 100)}...`);
    }

  } catch (err) {
    console.error('Error:', err);
  }
}

updateLeeBulExhibition();