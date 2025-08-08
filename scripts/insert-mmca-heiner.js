const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function insertHeinerExhibition() {
  console.log('=== MMCA 다원예술: 하이너 괴벨스 전시 입력 ===\n');
  
  const exhibitionData = {
    // 기본 정보
    title_en: 'MMCA Performing Arts: Heiner Goebbels ‹Genko-An 03062›',
    title_local: 'MMCA 다원예술: 하이너 괴벨스 ‹겐코-안 03062›',
    subtitle: null,
    
    // 날짜
    start_date: '2025-07-14',
    end_date: '2025-08-10',
    status: 'upcoming',
    
    // 장소
    venue_name: '국립현대미술관 서울',
    venue_city: '서울',
    venue_country: 'KR',
    venue_address: '서울 지하1층, MMCA 다원공간',
    
    // 작가 정보
    artists: [
      '하이너 괴벨스(Heiner Goebbels)',
      'René Liebert(협업)'
    ],
    
    // 전시 설명
    description: `‹겐코-안›시리즈는 작가가 1992년 교토의 겐코안 사원을 방문하며 구상되었다. 사원의 둥근 창과 사각형 창을 통해 같은 정원을 바라보며 받은 인상을 바탕으로 장소 특정적 작품을 제작했다. 국립현대미술관의 우편번호를 제목으로 포함한 ‹겐코-안 03062›는 두 창에서 본 정원을 '소리와 목소리의 정원'으로 변환한다.

이 작업의 시작은 헨리 데이비드 소로로부터 비롯되었으며, 그의 일기를 예술적으로 해체한 존 케이지(John Cage)의 ‹빈 단어들›(Empty Words, 1974)의 소리가 포함된다. 또 작가가 화가, 조각가, 음악가, 악기 제작자인 로버트 루트먼(Robert Rutman)과 헨리 데이비드 소로의 『월든』을 바탕으로 창작한 오케스트라 작품 ‹월든›(Walden, 1998)의 일부가 포함된다.

루트먼은 독특한 금속 악기를 제작하는 실험적 음악가로, 『월든』은 소로가 자연 속 단순한 삶의 가치를 탐구한 작품으로 알려져 있다. 이와 함께 조지아, 아제르바이잔, 아르메니아, 시베리아, 아프리카, 그리스 등으로부터 비롯된 민족학적 음성 기록과 존 케이지, 로버트 루트먼, 하이너 뮐러, 한나 아렌트, 마리나 아브라모비치 등 다양한 작가, 예술가, 음악가의 목소리도 결합된다.

하이너 괴벨스는 현대 음악, 연극, 설치 미술의 교차점에서 활동하는 작곡가이자 연출가이다. 그는 음악, 텍스트, 시각적 요소 및 움직임을 결합하여 전통적인 장르의 경계를 넘어서는 복합적인 예술적 경험을 창조한다. 주요 작곡으로 베를린 필하모닉이 초연한 오케스트라 ‹부름의 집›(A House of Call, 2021)과 대형 오케스트라를 위한 ‹대리 도시들›(Surrogate Cities, 1994)이 있다.`,
    
    // 큐레이터
    curator: 'MMCA 큐레이터',
    
    // 기타 정보
    artworks_count: 1,
    admission_fee: '2,000원',
    ticket_price: 2000,
    operating_hours: '수·토 10:00~21:00, 그 외 10:00~18:00 (월요일 휴관)',
    
    // 메타데이터
    exhibition_type: '다원예술',
    genres: ['사운드 아트', '설치미술', '미디어 아트', '다원예술'],
    tags: ['하이너 괴벨스', '겐코안', '사운드', '존 케이지', '장소특정적', '다원예술'],
    
    // 링크
    official_url: 'https://www.mmca.go.kr',
    source_url: 'https://www.mmca.go.kr',
    
    // 기관 정보
    institution_id: null,
    source: 'MMCA',
    
    // 조회수
    view_count: 15141,
    
    // 수집 정보
    collected_at: new Date().toISOString(),
    ai_verified: false,
    ai_confidence: null
  };
  
  console.log('입력할 전시 정보:');
  console.log('- 제목:', exhibitionData.title_local);
  console.log('- 작가:', exhibitionData.artists[0]);
  console.log('- 기간:', exhibitionData.start_date, '~', exhibitionData.end_date);
  console.log('- 장소:', exhibitionData.venue_address);
  console.log('- 작품수:', exhibitionData.artworks_count);
  console.log('- 입장료:', exhibitionData.admission_fee);
  console.log('\n');
  
  // DB에 삽입
  const { data, error } = await supabase
    .from('exhibitions')
    .insert([exhibitionData])
    .select();
    
  if (error) {
    console.error('❌ 입력 오류:', error);
  } else {
    console.log('✅ 전시 정보가 성공적으로 입력되었습니다!');
    console.log('DB ID:', data[0].id);
    
    // 입력 확인
    const { data: verify } = await supabase
      .from('exhibitions')
      .select('*')
      .eq('id', data[0].id)
      .single();
      
    if (verify) {
      console.log('\n=== 입력된 데이터 확인 ===');
      console.log('제목:', verify.title_local);
      console.log('작가:', verify.artists);
      console.log('작품 설명:', verify.description.substring(0, 100) + '...');
      console.log('전체 설명 길이:', verify.description.length + '자');
    }
  }
}

insertHeinerExhibition().catch(console.error);