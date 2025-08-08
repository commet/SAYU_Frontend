const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function insertYoungArtistsExhibition() {
  console.log('=== 젊은 모색 2025 : 지금, 여기 전시 입력 ===\n');
  
  const exhibitionData = {
    // 기본 정보
    title_en: 'Young Exploration 2025: Here and Now',
    title_local: '젊은 모색 2025 : 지금, 여기',
    subtitle: null,
    
    // 날짜
    start_date: '2025-04-24',
    end_date: '2025-10-12',
    status: 'upcoming',
    
    // 장소
    venue_name: '국립현대미술관 과천',
    venue_city: '과천',
    venue_country: 'KR',
    venue_address: '과천 1층, 1, 2 전시실, 중앙홀',
    
    // 작가 정보 - 20명(인/팀)
    artists: [
      '강나영',
      '권동현×권세정',
      '김을지로',
      '김진희',
      '다이애나랩',
      '무니페리',
      '상희',
      '송예환',
      '야광',
      '업체eobchae',
      '이은희',
      '장한나',
      '정주원',
      '조한나(영상)',
      '조한나(회화)',
      '외 5명/팀'
    ],
    
    // 전시 설명
    description: `1981년에 시작된 «젊은 모색»은 국립현대미술관의 대표적인 정례 전시로 국내에서 가장 오래된 신인작가 지원 프로그램이다. 역량 있는 신진 작가를 발굴하여 지원함으로써 향후 한국 미술을 대표하고 국제적인 작가로 성장할 수 있는 기회를 제공하고자 한다.

«젊은 모색 2025»에서는 20명(인/팀)의 신진 작가들이 참여하며, 다양한 매체의 실험적이고 도전적인 신작을 통해 동시대 한국 미술의 경향과 가능성을 살펴볼 수 있을 것이다. 

'지금, 여기'라는 부제는 동시대 신진 작가들이 현재의 시점에서 포착하는 예술적 감각과 사회적 관찰, 그리고 미래에 대한 비전을 담고 있다. 각 작가들은 회화, 조각, 설치, 영상, 퍼포먼스 등 다양한 매체를 통해 자신만의 독창적인 예술 언어를 구축하며, 한국 현대미술의 새로운 가능성을 제시한다.

이번 전시는 신진 작가들에게는 국립미술관이라는 공식적인 플랫폼을 통해 작품을 선보일 수 있는 기회를, 관람객들에게는 한국 미술의 미래를 이끌어갈 젊은 작가들의 신선한 시각과 실험정신을 만날 수 있는 장을 제공한다.`,
    
    // 큐레이터
    curator: 'MMCA 학예연구실',
    
    // 기타 정보
    artworks_count: 60,
    admission_fee: '과천 전시관람권 3,000원',
    ticket_price: 3000,
    operating_hours: null,
    
    // 메타데이터
    exhibition_type: '기획전',
    genres: ['회화', '조각', '설치', '영상', '퍼포먼스', '복합매체'],
    tags: ['젊은모색', '신진작가', '신인작가', '지원프로그램', '2025', '실험미술', '동시대미술'],
    
    // 링크
    official_url: 'https://www.mmca.go.kr',
    source_url: 'https://www.mmca.go.kr',
    
    // 기관 정보
    institution_id: null,
    source: 'MMCA',
    
    // 조회수
    view_count: 35021,
    
    // 수집 정보
    collected_at: new Date().toISOString(),
    ai_verified: false,
    ai_confidence: null
  };
  
  console.log('입력할 전시 정보:');
  console.log('- 제목:', exhibitionData.title_local);
  console.log('- 기간:', exhibitionData.start_date, '~', exhibitionData.end_date);
  console.log('- 장소:', exhibitionData.venue_name, '-', exhibitionData.venue_address);
  console.log('- 참여 작가: 20명(인/팀)');
  console.log('- 작품수:', exhibitionData.artworks_count + '여 점');
  console.log('- 입장료:', exhibitionData.admission_fee);
  console.log('- 조회수:', exhibitionData.view_count);
  console.log('\n참여 작가:');
  console.log('  강나영, 권동현×권세정, 김을지로, 김진희, 다이애나랩,');
  console.log('  무니페리, 상희, 송예환, 야광, 업체eobchae,');
  console.log('  이은희, 장한나, 정주원, 조한나(영상), 조한나(회화) 외 5명/팀');
  console.log('\n특징:');
  console.log('  - 1981년부터 시작된 국내 최장수 신진작가 지원 프로그램');
  console.log('  - 44년의 역사를 가진 정례 전시');
  console.log('  - 실험적이고 도전적인 신작 위주');
  console.log('  - 다양한 매체를 아우르는 전시');
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

insertYoungArtistsExhibition().catch(console.error);