const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function insertKimChangYeolExhibition() {
  console.log('=== 김창열 회고전 입력 ===\n');
  
  const exhibitionData = {
    // 기본 정보
    title_en: 'Kim Tschang-Yeul',
    title_local: '김창열',
    subtitle: null,
    
    // 날짜
    start_date: '2025-08-22',
    end_date: '2025-12-21',
    status: 'upcoming',
    
    // 장소
    venue_name: '국립현대미술관 서울',
    venue_city: '서울',
    venue_country: 'KR',
    venue_address: '서울 (전시실 미정)',
    
    // 작가 정보
    artists: [
      '김창열(Kim Tschang-Yeul, 1929-2021)'
    ],
    
    // 전시 설명
    description: `«김창열»은 한국 현대미술을 대표하는 작가 김창열(1929–2021)의 예술세계를 총체적으로 조명하는 회고전으로, 한국의 근현대사와 미술사의 맥락 속에서 그의 작업을 재조명하고자 한다. 20세기 중반, 전쟁과 분단, 산업화와 도시화로 이어지는 한국 사회의 급격한 근대화 과정은 김창열의 내면에 깊은 상흔을 남겼고, 이는 고유한 조형 언어로 승화되었다.

김창열은 1950년대 앵포르멜 운동을 주도하며 서구 현대미술의 어법을 한국적 정서와 접목하는 데 앞장섰고, 1965년 뉴욕에서의 활동을 거쳐 1969년 파리에 정착하기까지 자신만의 예술에 도달하기 위한 실험과 도전의 여정을 멈추지 않았다.

1970년대 초, 물방울 회화의 여정이 시작되면서 자신만의 독자적인 예술세계를 구축하였고, 평생에 걸쳐 탐구한 물방울은 곧 김창열을 상징하는 예술적 기호가 되었다. 이번 전시는 물방울의 시각적 아름다움 이면에 자리한 상흔의 기억과 근원적 미의식에 주목하며, 작업 초기 및 뉴욕 시기의 미공개 작품과 귀중한 기록 자료를 통해 작가의 창작 여정을 보다 입체적으로 조망한다.

물방울이라는 형식 속에 스며든 다양한 조형 언어를 새롭게 발견하고, 우리가 미처 마주하지 못했던 김창열의 예술을 재인식하는 계기가 될 것이다. 나아가 한국 현대미술이 지닌 고유한 정신성과 그 미술사적 의의를 다시금 되새기는 뜻깊은 자리가 되기를 기대한다.`,
    
    // 큐레이터
    curator: 'MMCA 학예연구실',
    
    // 기타 정보
    artworks_count: null,
    admission_fee: '미정',
    ticket_price: null,
    operating_hours: null,
    
    // 메타데이터
    exhibition_type: '회고전',
    genres: ['회화', '현대미술'],
    tags: ['김창열', '물방울', '앵포르멜', '한국현대미술', '회고전', '파리', '뉴욕', '1950년대', '물방울회화'],
    
    // 링크
    official_url: 'https://www.mmca.go.kr',
    source_url: 'https://www.mmca.go.kr',
    
    // 기관 정보
    institution_id: null,
    source: 'MMCA',
    
    // 조회수
    view_count: 7359,
    
    // 수집 정보
    collected_at: new Date().toISOString(),
    ai_verified: false,
    ai_confidence: null
  };
  
  // 김창열 작가 주요 경력
  const timeline = [
    { year: '1929', event: '평안남도 맹산 출생' },
    { year: '1950년대', event: '앵포르멜 운동 주도' },
    { year: '1965', event: '뉴욕 활동 시작' },
    { year: '1969', event: '파리 정착' },
    { year: '1970년대 초', event: '물방울 회화 시작' },
    { year: '2021', event: '작고' }
  ];
  
  console.log('입력할 전시 정보:');
  console.log('- 제목:', exhibitionData.title_local);
  console.log('- 기간:', exhibitionData.start_date, '~', exhibitionData.end_date);
  console.log('- 장소:', exhibitionData.venue_name);
  console.log('- 작가:', exhibitionData.artists[0]);
  console.log('- 전시 유형:', exhibitionData.exhibition_type);
  console.log('- 조회수:', exhibitionData.view_count);
  console.log('\n작가 연보:');
  timeline.forEach(t => {
    console.log(`  - ${t.year}: ${t.event}`);
  });
  console.log('\n전시 특징:');
  console.log('  - 김창열 작고 후 첫 대규모 회고전');
  console.log('  - 물방울 회화의 기원과 발전 과정 조명');
  console.log('  - 미공개 작품 및 뉴욕 시기 작품 포함');
  console.log('  - 앵포르멜부터 물방울까지 전 시기 망라');
  console.log('  - 한국 현대미술사적 의의 재조명');
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
      console.log('장소:', verify.venue_name);
      console.log('작가:', verify.artists);
      console.log('설명 길이:', verify.description.length + '자');
      console.log('전시 유형:', verify.exhibition_type);
    }
  }
}

insertKimChangYeolExhibition().catch(console.error);