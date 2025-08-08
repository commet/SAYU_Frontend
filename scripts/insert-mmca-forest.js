const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function insertForestExhibition() {
  console.log('=== MMCA 다원예술 : 숲 전시 입력 ===\n');
  
  const exhibitionData = {
    // 기본 정보
    title_en: 'MMCA Performing Arts : Forest',
    title_local: 'MMCA 다원예술 : 숲',
    subtitle: null,
    
    // 날짜
    start_date: '2025-05-23',
    end_date: '2026-01-15',
    status: 'upcoming',
    
    // 장소
    venue_name: '국립현대미술관 서울',
    venue_city: '서울',
    venue_country: 'KR',
    venue_address: '서울 지하1층, MMCA 다원공간, 기타',
    
    // 작가 정보 - 참여 작가들
    artists: [
      '임고은',
      '최상민',
      '하이너 괴벨스(Heiner Goebbels)',
      '카티아 엥겔(Katja Engel)',
      '아리 에르산디(Ari Ersandi)',
      '포인트 오브 리스닝(Point of Listening)',
      '홍이현숙',
      '토시키 오카다(Toshiki Okada)',
      '체르핏추(Chelfitsch)',
      '텃페이 카네우지(Teppei Kaneuji)',
      '김신우',
      '명수민',
      '임한솔',
      '이정은',
      '트리플래닛',
      '곽소진'
    ],
    
    // 전시 설명
    description: `국립현대미술관의 다원예술«숲»은 인류세 시대에 미술관의 역할에 대한 비판적 질문을 던지고, 사람과 숲 사이의 복잡한 관계를 탐구하는 프로젝트입니다. 지금의 숲들은 과연 과거의 숲과 어떻게 다르며, 우리는 과거에 어떻게 숲과의 관계를 맺어왔을 것인가를 생각해 봤습니다. 우리에게 있어서 숲은 무엇인가를 곰곰히 생각해보면서 시작했지만, 오히려 숲에 있어서 인간이란 무엇인가라는 반대의 질문이 우리에게 돌아왔습니다.

이 프로젝트는 2025년 5월부터 2026년 1월까지 매월 다른 프로그램으로 진행됩니다. 먼저 "빽빽한 숲"에서 시작합니다. 빽빽한 숲은 우주와 같은 다양성에 대한 제안이기도 합니다. 삼라만상(森羅萬象)에서 '삼(森)'은 나무 목(木) 세 개가 모여 이루어진 한자로, 나무가 빽빽하게 들어찬 숲을 의미합니다. 이는 동아시아 사유 전통에서 숲이 가진 존재론적 중요성을 보여줍니다.

숲은 오랫동안 우리에게 깊은 정서적 영향을 주는 교감의 장소였습니다. "정동의 숲"이라고 말할 수 있습니다. 여기서 정동(affect)은 단순한 개인적 감정이 아닌, 몸과 환경 사이에서 발생하는 사회적이고 집단적인 정서의 흐름을 의미합니다. 헨리 데이비드 소로의 『월든』에서 영향받은 작가들은 현대인의 단절된 자연 경험을 몸과 감각으로 재연결하는 사색의 기회를 제공합니다.

"공생의 숲"은 인간중심주의의 해체를 제안합니다. 도나 해러웨이의 "우리는 흙이지, 인간이 아니다; 우리는 퇴비이지, 포스트휴먼이 아니다"라는 선언처럼, 숲은 여러 존재들의 역동적인 연결망의 공간입니다. 식물학자 로빈 월 키머러는 "일부 원주민 언어에서는 식물을 가리키는 단어가 '우리를 보살피는 이들'로 번역된다"고 적었습니다.

다원예술 «숲»의 일련의 작업들은 연극, 무용, 퍼포먼스, 음악, 워크샵, 강연 등 다양한 형식을 통해 매체와 장르 사이, 미술관과 숲 사이의 경계를 흐립니다. 12월에는 다학제간 연구 프로젝트인 <다가오는 숲>이 진행되며, '다원예술 쇼케이스'가 일본 교토실험축제와 협력하여 개최될 예정입니다.`,
    
    // 큐레이터
    curator: 'MMCA 다원예술 큐레이터',
    
    // 기타 정보
    artworks_count: 10, // 약 10개의 프로그램
    admission_fee: '프로그램별 상이',
    ticket_price: null,
    operating_hours: '프로그램별 상이',
    
    // 메타데이터
    exhibition_type: '다원예술',
    genres: ['퍼포먼스', '설치', '무용', '음악', '연극', '워크샵', '다원예술'],
    tags: ['숲', '인류세', '생태', '공생', '정동', '다원예술', '교토실험축제', '환경', '자연'],
    
    // 링크
    official_url: 'https://www.mmca.go.kr',
    source_url: 'https://www.mmca.go.kr',
    
    // 기관 정보
    institution_id: null,
    source: 'MMCA',
    
    // 조회수
    view_count: 42391,
    
    // 수집 정보
    collected_at: new Date().toISOString(),
    ai_verified: false,
    ai_confidence: null
  };
  
  // 프로그램 일정 정보
  const programs = [
    { date: '5.23-25', artist: '임고은', work: '그림자-숲', genre: '퍼포먼스, 설치' },
    { date: '6.13-7.6, 11.21-12.11', artist: '최상민', work: '4:04, 6:22', genre: '퍼포먼스' },
    { date: '7.14-8.10', artist: '하이너 괴벨스', work: '겐코-안 03062', genre: '멀티미디어 퍼포먼스' },
    { date: '8.16-17', artist: '카티아 엥겔, 아리 에르산디, 포인트 오브 리스닝', work: '후탄(숲)', genre: '무용, 음악' },
    { date: '9.3-4', artist: '추후 공개', work: '다원예술 쇼케이스 2025', genre: '퍼포먼스' },
    { date: '10.11-26', artist: '홍이현숙', work: '오소리 A씨의 초대 2', genre: '관객참여 퍼포먼스' },
    { date: '11.8-9', artist: '토시키 오카다/체르핏추, 텃페이 카네우지', work: '지우개 산', genre: '연극' },
    { date: '12.12', artist: '김신우, 명수민, 임한솔, 이정은, 트리플래닛', work: '다가오는 숲', genre: '연구 프로젝트' },
    { date: '2026.1.23-25', artist: '곽소진', work: '휘-판', genre: '영화, 사운드' }
  ];
  
  console.log('입력할 전시 정보:');
  console.log('- 제목:', exhibitionData.title_local);
  console.log('- 기간:', exhibitionData.start_date, '~', exhibitionData.end_date);
  console.log('- 장소:', exhibitionData.venue_address);
  console.log('- 참여 작가 수:', exhibitionData.artists.length + '명');
  console.log('- 프로그램 수:', programs.length + '개');
  console.log('- 조회수:', exhibitionData.view_count);
  console.log('\n프로그램 일정:');
  programs.forEach(p => {
    console.log(`  - ${p.date}: ${p.artist} - ${p.work} (${p.genre})`);
  });
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
      console.log('참여 작가 수:', verify.artists.length + '명');
      console.log('설명 길이:', verify.description.length + '자');
      console.log('조회수:', verify.view_count);
    }
  }
}

insertForestExhibition().catch(console.error);