const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function insertTomorrowExhibition() {
  console.log('=== 내일 우리는 전시 입력 ===\n');
  
  const exhibitionData = {
    // 기본 정보
    title_en: "Tomorrow We'll be...",
    title_local: '내일 우리는',
    subtitle: null,
    
    // 날짜
    start_date: '2025-05-01',
    end_date: '2026-02-18',
    status: 'upcoming',
    
    // 장소
    venue_name: '국립현대미술관 과천 어린이미술관',
    venue_city: '과천',
    venue_country: 'KR',
    venue_address: '어린이미술관',
    
    // 작가 정보
    artists: [
      '김민애',
      '이예승',
      '전현선',
      '델리아 프르바키(Delia Prvacki)',
      '밀렌코 프르바키(Milenko Prvacki)'
    ],
    
    // 전시 설명
    description: `한국 - 싱가포르 수교 50주년을 기념하여 개최하는 2025년 국립현대미술관 과천 어린이미술관 «내일 우리는 Tomorrow We'll be...»은 내셔널갤러리싱가포르 갤러리어린이비엔날레 Gallery Children's Biennale, GCB와의 협력으로 공동의 전시명, 공동의 소주제를 갖고 양국이 각기 해석하여 펼치는 전시입니다.

이번 전시는 한국 작가 김민애, 이예승, 전현선, 싱가포르 듀오 작가 델리아 프르바키와 밀렌코 프르바키 5명이 참여하며, 어린이미술관 공간을 특화한 신작 위주의 작품 37점을 소개합니다. 미래 세대 어린이들이 현대미술을 통해 기쁨, 배려, 사랑, 꿈의 네 가지 감정과 가치에 질문을 던지며 탐색할 수 있도록 구성하였습니다.

전시는 네 가지 섹션으로 구성됩니다:
- 기쁨의 실험: 일상에서 발견하는 작은 기쁨들을 예술적으로 재해석
- 배려의 움직임: 타인과 환경에 대한 배려를 몸짓과 행동으로 표현
- 사랑의 몸짓: 다양한 형태의 사랑을 시각적으로 탐구
- 꿈의 풍경: 상상력과 미래에 대한 꿈을 구현한 공간

어린이미술관을 찾는 어린이들이 다양한 현대미술을 만나고 기쁨, 배려, 사랑, 꿈을 새롭게 경험하기를 바랍니다. 한때 아이였던 어른들이 잠시 잊거나 멀리 두었던 감정을 어린이의 언어로 마주하는 시간을 경험하기를 바랍니다. 오늘 이곳에서 피어나는 마음과 상상력이 함께 그려가는 미래로 이어지길 기대합니다.`,
    
    // 큐레이터
    curator: 'MMCA 어린이미술관',
    
    // 기타 정보
    artworks_count: 43,
    admission_fee: '무료',
    ticket_price: 0,
    operating_hours: null,
    
    // 메타데이터
    exhibition_type: '국제교류전',
    genres: ['설치', '체험형 전시', '인터랙티브', '복합매체'],
    tags: ['어린이', '한국-싱가포르', '수교50주년', '국제협력', '감정', '기쁨', '배려', '사랑', '꿈', 'GCB'],
    
    // 링크
    official_url: 'https://www.mmca.go.kr',
    source_url: 'https://www.mmca.go.kr',
    
    // 기관 정보
    institution_id: null,
    source: 'MMCA',
    
    // 조회수
    view_count: 14261,
    
    // 수집 정보
    collected_at: new Date().toISOString(),
    ai_verified: false,
    ai_confidence: null
  };
  
  // 전시 구성
  const sections = [
    { theme: '기쁨의 실험', description: '일상에서 발견하는 작은 기쁨들을 예술적으로 재해석' },
    { theme: '배려의 움직임', description: '타인과 환경에 대한 배려를 몸짓과 행동으로 표현' },
    { theme: '사랑의 몸짓', description: '다양한 형태의 사랑을 시각적으로 탐구' },
    { theme: '꿈의 풍경', description: '상상력과 미래에 대한 꿈을 구현한 공간' }
  ];
  
  console.log('입력할 전시 정보:');
  console.log('- 제목:', exhibitionData.title_local);
  console.log('- 영문 제목:', exhibitionData.title_en);
  console.log('- 기간:', exhibitionData.start_date, '~', exhibitionData.end_date);
  console.log('- 장소:', exhibitionData.venue_name);
  console.log('- 참여 작가: 5명 (한국 3명, 싱가포르 2명)');
  console.log('- 작품수:', exhibitionData.artworks_count + '점');
  console.log('- 입장료:', exhibitionData.admission_fee);
  console.log('- 조회수:', exhibitionData.view_count);
  console.log('\n전시 구성 (4개 섹션):');
  sections.forEach((s, i) => {
    console.log(`  ${i+1}. ${s.theme}`);
    console.log(`     - ${s.description}`);
  });
  console.log('\n특별 사항:');
  console.log('  - 한국-싱가포르 수교 50주년 기념');
  console.log('  - 내셔널갤러리싱가포르 갤러리어린이비엔날레(GCB)와 협력');
  console.log('  - 공동 전시명, 공동 소주제로 양국 동시 개최');
  console.log('  - 신작 위주 작품 구성');
  console.log('  - 어린이와 어른 모두를 위한 전시');
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

insertTomorrowExhibition().catch(console.error);