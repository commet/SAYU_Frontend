const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function insertArtBankExhibition() {
  console.log('=== 미술은행 20주년 특별전 «돌아온 미래: 형태와 생각의 발현» 입력 ===\n');
  
  const exhibitionData = {
    // 기본 정보
    title_en: 'Art Bank 20th Anniversary Special Exhibition: Returned Future: Emergence of Forms and Thoughts',
    title_local: '미술은행 20주년 특별전 «돌아온 미래: 형태와 생각의 발현»',
    subtitle: null,
    
    // 날짜
    start_date: '2025-08-08',
    end_date: '2026-07-31',
    status: 'upcoming',
    
    // 장소
    venue_name: '국립현대미술관 청주',
    venue_city: '청주',
    venue_country: 'KR',
    venue_address: '청주 3층, 개방수장고',
    
    // 작가 정보 - 54명
    artists: [
      '곽훈', '구정아', '권오상(b.1971)', '권오상(b.1974)', '김기린',
      '김명주', '김수자', '김지아나', '김지평', '김춘환',
      '김혁정', '김현희', '꼴라쥬플러스(장승효&김용민)', '듀킴', '문범',
      '민성홍', '박계훈', '박남철', '박진현', '빠키',
      '샌정', '설원기', '성낙희', '성능경', '손영락',
      '송수남', '신미경', '심승욱', '윤형근', '이강소',
      '이건용', '이동엽', '이배', '이수경', '이순애',
      '이이남', '임흥순', '전광영', '정상화', '정정엽',
      '정종미', '정직성', '조덕현', '조상근', '주도양',
      '채성필', '최병소', '최선', '최수앙', '추미림',
      '하태범', '홍푸르메', '황란희', '황주리'
    ],
    
    // 전시 설명
    description: `미술은행은 지난 20년간 한국 현대미술의 중요한 동반자로서 그 발자취를 남겨왔습니다. 국립현대미술관 청주에서 개최되는 미술은행 20주년 특별전 «돌아온 미래: 형태와 생각의 발현»은 이러한 20년의 역사를 되짚어보고, 그동안 수집해온 주요 작품들과 끊임없는 미술적 실험의 결과물을 집중적으로 조명하는 자리입니다.

이번 전시는 미술은행의 소장품, 대여 기록, 전시 아카이브 자료 등을 통해 한국 예술의 흐름과 변화를 면밀히 기록하고, 현재와 미래의 예술적 가능성을 다각도로 탐구합니다. 미술은행 소장품을 매개로 예술적 아이디어와 형태가 어떻게 진화해왔는지를 살펴보고, 관람객들에게 예술적 실험의 중요성을 일깨우는 계기가 되리라 기대합니다.

이번 전시는 크게 세 가지 주제로 구성됩니다:

1부. 돌아온 미래: 형태와 생각의 발현 - 미술은행이 품었던 '미래'가 어떻게 '돌아왔는지', 그리고 윤형근, 성능경, 구정아, 듀킴 작가의 작품과 같이 어떤 형태와 생각으로 발현되었는지를 탐구합니다. 약 50여 점의 작품들은 예술의 진화 과정을 생생하게 보여줄 것이며, 기존 예술적 경계를 넘어선 실험적 시도를 통해 현대미술의 변화 가능성을 제시합니다.

2부. 아카이브의 회상: 미술은행 시간의 기록 - 미술은행 소장품 중 대여가 많이 이루어진 50점의 정보를 QR 코드와 이미지를 통해 확인할 수 있으며, 그중 수장고에 보관된 송수남, 설원기, 김혁정 작가의 작품 10점을 직접 만날 수 있습니다.

3부. 기억된 미래: 도시와의 대화 - 아카이브 자료를 기반으로 한 작품 변형 재현을 통해 미술은행의 공공 프로젝트와 특별전시 작품들을 새로운 시각으로 선보입니다.`,
    
    // 큐레이터
    curator: '미술은행',
    
    // 기타 정보
    artworks_count: 57,
    admission_fee: '무료',
    ticket_price: 0,
    operating_hours: null,
    
    // 메타데이터
    exhibition_type: '특별전',
    genres: ['회화', '조각', '설치', '미디어아트', '복합매체'],
    tags: ['미술은행', '20주년', '소장품', '아카이브', '개방수장고', '현대미술'],
    
    // 링크
    official_url: 'https://www.mmca.go.kr',
    source_url: 'https://www.mmca.go.kr',
    
    // 기관 정보
    institution_id: null,
    source: 'MMCA',
    
    // 조회수
    view_count: 290,
    
    // 수집 정보
    collected_at: new Date().toISOString(),
    ai_verified: false,
    ai_confidence: null
  };
  
  // 전시 섹션
  const sections = [
    {
      part: '1부',
      title: '돌아온 미래: 형태와 생각의 발현',
      description: '실험적이고 혁신적인 작품들을 통해 형태와 아이디어의 진보적 전환',
      artists: ['윤형근', '성능경', '구정아', '듀킴']
    },
    {
      part: '2부',
      title: '아카이브의 회상: 미술은행 시간의 기록',
      description: '대여 많이 이루어진 50점 정보 및 수장고 작품 10점',
      artists: ['송수남', '설원기', '김혁정']
    },
    {
      part: '3부',
      title: '기억된 미래: 도시와의 대화',
      description: '공공 프로젝트와 특별전시 작품들의 새로운 시각'
    }
  ];
  
  console.log('입력할 전시 정보:');
  console.log('- 제목:', exhibitionData.title_local);
  console.log('- 기간:', exhibitionData.start_date, '~', exhibitionData.end_date);
  console.log('- 장소:', exhibitionData.venue_name, '-', exhibitionData.venue_address);
  console.log('- 참여 작가: 54명');
  console.log('- 작품수:', exhibitionData.artworks_count + '점');
  console.log('- 입장료:', exhibitionData.admission_fee);
  console.log('- 조회수:', exhibitionData.view_count);
  console.log('\n전시 구성:');
  sections.forEach(s => {
    console.log(`  ${s.part}. ${s.title}`);
    console.log(`    - ${s.description}`);
    if (s.artists) {
      console.log(`    - 주요 작가: ${s.artists.join(', ')}`);
    }
  });
  console.log('\n특징:');
  console.log('  - 미술은행 20주년 기념 특별전');
  console.log('  - 개방수장고에서 진행');
  console.log('  - QR 코드를 활용한 디지털 아카이브 연계');
  console.log('  - 20년간의 대여 기록과 전시 아카이브 자료 공개');
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
      console.log('작가 수:', verify.artists.length);
      console.log('설명 길이:', verify.description.length + '자');
      console.log('전시 유형:', verify.exhibition_type);
    }
  }
}

insertArtBankExhibition().catch(console.error);