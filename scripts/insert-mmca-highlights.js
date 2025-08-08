const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function insertHighlightsExhibition() {
  console.log('=== MMCA 서울 상설전 «한국현대미술 하이라이트» 입력 ===\n');
  
  const exhibitionData = {
    // 기본 정보
    title_en: 'MMCA Seoul Permanent Exhibition: Highlights of Korean Contemporary Art',
    title_local: 'MMCA 서울 상설전 «한국현대미술 하이라이트»',
    subtitle: null,
    
    // 날짜
    start_date: '2025-05-01',
    end_date: '2026-05-03',
    status: 'upcoming',
    
    // 장소
    venue_name: '국립현대미술관 서울',
    venue_city: '서울',
    venue_country: 'KR',
    venue_address: '서울 1층, 1전시실 / 지하1층, 2전시실',
    
    // 작가 정보 - 주요 작가들
    artists: [
      '김수자',
      '김환기',
      '박서보',
      '박현기',
      '서도호',
      '신학철',
      '양혜규',
      '이불',
      '이우환',
      '문경원+전준호',
      '최욱경',
      '곽인식',
      '고영훈',
      '오윤',
      '강익중',
      '김범',
      '김아영',
      '박생광',
      '외 60여 명'
    ],
    
    // 전시 설명
    description: `이번 전시는 2013년 국립현대미술관 서울관 개관 이래 처음으로 선보이는 상설전이다.

국립현대미술관은 1969년 개관 후 작품을 수집하기 시작하여 현재에 이르기까지 50년 이상, 미술사와 동시대미술의 흐름에 초점을 맞춘 중요한 작품과 아카이브를 수집, 연구해 왔다. 이번 전시는, 11,800여 점에 이르는 미술관 소장품 중 1960년대에서 2010년대에 이르는 한국 현대미술 대표작 90여 점을 선보인다. 전시는 한국 현대미술사에서 주요하게 다루어져 온 추상, 실험, 형상, 혼성, 개념, 다큐멘터리와 같은 소주제를 중심으로 선별된 대표 소장품들을 통해, 국내외 관객들에게 시대에 따른 한국 현대미술의 흐름을 다층적으로 소개한다.

한국 현대미술은 한국의 특수한 사회 상황과 문화 변동, 그리고 매체 변화 및 당대 국제 미술과의 유기적 관계 속에서 역동적인 변화를 거듭해 왔다. 1전시실에는 1960년대에서 1980년대에 이르는 한국 현대미술의 대표 작품들이 전시된다. 현대성과 전위의 이름으로 전개되었던 한국 추상미술을 시작으로, 사물성과 행위를 중심으로 미술의 영역을 확장했던 실험미술, 그리고 예술을 삶의 문맥에서 바라보고자 했던 형상미술과 민중미술 등을 살펴볼 수 있다.

2전시실은 1990년대에서 2010년대에 이르는 한국 동시대미술의 주요 작품들을 소개한다. 다원화와 세계화의 흐름 속에서 동시대 국제 미술계에서 본격적으로 주목받았던 한국 작가들의 대표 작품들을 비롯하여, 사물과 언어를 중심으로 한 개념적 작품들, 그리고 다큐멘터리와 허구의 맥락 속에서 현실을 재인식하고자 했던 일련의 작품들을 만날 수 있다.

한국 현대미술의 복잡한 지형도 속에서 엄선된 주요 소장품들을 감상하며 관객들은 한국의 사회적 상황 속에서 미술이 어떻게 변화하고 전개해 왔는지를 이해할 수 있을 것이다. 동시에 이번 전시는 국제 미술의 흐름 속에서 의미 있는 관계를 맺고 전개해 온 한국 현대미술의 특수성과 보편성을 동시에 숙고할 수 있는 기회가 될 것으로 기대한다.`,
    
    // 큐레이터
    curator: 'MMCA 학예연구실',
    
    // 기타 정보
    artworks_count: 90,
    admission_fee: '2,000원',
    ticket_price: 2000,
    operating_hours: null,
    
    // 메타데이터
    exhibition_type: '상설전',
    genres: ['회화', '조각', '설치', '비디오', '미디어아트', '개념미술', '실험미술'],
    tags: ['상설전', '한국현대미술', '하이라이트', '소장품', '1960년대', '2010년대', '추상', '실험', '형상', '개념', '민중미술'],
    
    // 링크
    official_url: 'https://www.mmca.go.kr',
    source_url: 'https://www.mmca.go.kr',
    
    // 기관 정보
    institution_id: null,
    source: 'MMCA',
    
    // 조회수
    view_count: 100729,
    
    // 수집 정보
    collected_at: new Date().toISOString(),
    ai_verified: false,
    ai_confidence: null
  };
  
  // 대표 작품 정보
  const majorWorks = [
    { artist: '최욱경', work: '미처 못 끝낸 이야기', year: 1977 },
    { artist: '박서보', work: '묘법 No.43-78-79-81', year: 1981 },
    { artist: '곽인식', work: '작품', year: 1962 },
    { artist: '박현기', work: '무제', year: 1979 },
    { artist: '고영훈', work: '스톤북', year: 1985 },
    { artist: '오윤', work: '원귀도', year: 1984 },
    { artist: '강익중', work: '삼라만상', year: '1984-2014' },
    { artist: '김수자', work: '보따리 트럭 - 이민자들', year: 2007 },
    { artist: '김범', work: '무제-친숙한 고통#12', year: 2012 },
    { artist: '양혜규', work: '여성형원주민', year: 2010 },
    { artist: '문경원&전준호', work: '뉴스프럼노웨어', year: '2011-2012' },
    { artist: '김아영', work: '다공성 계곡 2:트릭스터 플롯', year: 2019 }
  ];
  
  console.log('입력할 전시 정보:');
  console.log('- 제목:', exhibitionData.title_local);
  console.log('- 기간:', exhibitionData.start_date, '~', exhibitionData.end_date);
  console.log('- 장소:', exhibitionData.venue_address);
  console.log('- 작가 수: 80여 명');
  console.log('- 작품수:', exhibitionData.artworks_count + '여 점');
  console.log('- 입장료:', exhibitionData.admission_fee);
  console.log('- 조회수:', exhibitionData.view_count);
  console.log('\n주요 작품:');
  majorWorks.forEach(w => {
    console.log(`  - ${w.artist}: ${w.work} (${w.year})`);
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
      console.log('작가 수:', verify.artists.length);
      console.log('설명 길이:', verify.description.length + '자');
      console.log('조회수:', verify.view_count);
      console.log('전시 유형:', verify.exhibition_type);
    }
  }
}

insertHighlightsExhibition().catch(console.error);