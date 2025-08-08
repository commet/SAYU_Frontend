const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function insertHeartExhibition() {
  console.log('=== 마음_봄 전시 입력 ===\n');
  
  const exhibitionData = {
    // 기본 정보
    title_en: 'Mind_Spring',
    title_local: '마음_봄',
    subtitle: null,
    
    // 날짜
    start_date: '2025-05-02',
    end_date: '2026-02-27',
    status: 'upcoming',
    
    // 장소
    venue_name: '국립현대미술관 서울',
    venue_city: '서울',
    venue_country: 'KR',
    venue_address: '서울 교육동 2층 MMCA 아이공간',
    
    // 작가 정보
    artists: [
      '오유경',
      '조소희'
    ],
    
    // 전시 설명
    description: `MMCA 아이공간은 국립현대미술관 서울에서 처음 선보이는 어린이와 가족을 위한 공간입니다. 아이공간의 '아이'는 '어린 아이'와 '나(I)'의 의미를 담고 있습니다. 어린이도 어른도 예술적 경험을 통해 자신의 내면을 만나보고 주변도 함께 살펴볼 수 있는 의미있는 공간이 되기를 바라는 마음을 담았습니다.

MMCA 아이공간의 첫 전시는 «마음_봄» 입니다. 우리는 하루 중 얼마나 자주 내 마음을 들여다볼까요? 소중한 사람의 마음을 살피는 질문은 언제 해보았나요? 전시는 오유경, 조소희 작가의 작품과 함께 우리의 마음을 천천히 들여다보기를 제안합니다.

«마음_봄»은 마음을 이어 보는 '마음 이어봄', 마주 보는 '마음 마주봄', 서로의 마음을 나누는 '마음 서로봄'의 세 공간으로 이루어져 있습니다. 각 공간에는 작가의 작품을 감상하고 이해할 수 있는 워크숍을 마련하였습니다.

MMCA 아이공간 «마음_봄» 전시를 찾는 어린이와 어른 모두 자신의 마음을 온전히 바라보고 서로의 마음을 나누는 시간을 가져보길 바랍니다.`,
    
    // 큐레이터
    curator: 'MMCA 교육팀',
    
    // 기타 정보
    artworks_count: null,
    admission_fee: '무료',
    ticket_price: 0,
    operating_hours: '화-일 10:00-17:00 (매주 월요일, 1월 1일 휴관)',
    
    // 메타데이터
    exhibition_type: '어린이전시',
    genres: ['설치', '체험형 전시', '교육 프로그램', '가족 프로그램'],
    tags: ['어린이', '가족', '마음', '봄', '아이공간', '워크숍', '체험', '교육'],
    
    // 링크
    official_url: 'https://www.mmca.go.kr',
    source_url: 'https://www.mmca.go.kr',
    
    // 기관 정보
    institution_id: null,
    source: 'MMCA',
    
    // 조회수
    view_count: 63883,
    
    // 수집 정보
    collected_at: new Date().toISOString(),
    ai_verified: false,
    ai_confidence: null
  };
  
  console.log('입력할 전시 정보:');
  console.log('- 제목:', exhibitionData.title_local);
  console.log('- 작가:', exhibitionData.artists.join(', '));
  console.log('- 기간:', exhibitionData.start_date, '~', exhibitionData.end_date);
  console.log('- 장소:', exhibitionData.venue_address);
  console.log('- 대상: 어린이와 가족');
  console.log('- 입장료:', exhibitionData.admission_fee);
  console.log('- 조회수:', exhibitionData.view_count);
  console.log('\n전시 구성:');
  console.log('  - 마음 이어봄: 마음을 이어 보는 공간');
  console.log('  - 마음 마주봄: 마음을 마주 보는 공간');
  console.log('  - 마음 서로봄: 서로의 마음을 나누는 공간');
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
      console.log('설명 길이:', verify.description.length + '자');
      console.log('조회수:', verify.view_count);
    }
  }
}

insertHeartExhibition().catch(console.error);