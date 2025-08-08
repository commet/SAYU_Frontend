const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function insertWatercolorExhibition() {
  console.log('=== MMCA 소장품 기획전 - 수채(水彩): 물을 그리다 입력 ===\n');
  
  const exhibitionData = {
    // 기본 정보
    title_en: 'MMCA Collection Exhibition - Watercolor: Painting Water',
    title_local: 'MMCA 소장품 기획전 - 수채(水彩): 물을 그리다',
    subtitle: null,
    
    // 날짜
    start_date: '2025-03-21',
    end_date: '2025-09-07',
    status: 'upcoming',
    
    // 장소
    venue_name: '국립현대미술관 청주',
    venue_city: '청주',
    venue_country: 'KR',
    venue_address: '청주 5층, 기획전시실',
    
    // 작가 정보 - 34명
    artists: [
      '강연균', '강요배', '강환섭', '곽인식', '구본웅',
      '김기린', '김명숙', '김수명', '김정자', '김종하',
      '류인', '문신', '박명조', '박서보', '박수근',
      '배동신', '서동진', '서진달', '손일봉', '양수아',
      '유강열', '윤종숙', '이경희', '이두식', '이인성',
      '이중섭', '장발', '장욱진', '전상수', '전선택',
      '전현선', '정기호', '정상복', '정영렬'
    ],
    
    // 전시 설명
    description: `«수채: 물을 그리다»는 수채화만을 단독 장르로 구성하여 선보이는 미술관 소장품 전시로, 대중에게 친숙한 장르일 뿐 아니라 우리에게 잘 알려진 대표 작가들의 수채 작품을 발견, 감상하는 자리이다.

수채 장르만이 가지고 있는 스며들기, 번지기, 투명성, 즉각성 등과 같은 심미적 특성에 주목하고 이것이 근대미술로부터 현대미술에 이르기까지 어떻게 발전되었는지 함께 살펴본다. 이는 지금까지 습작 또는 드로잉에 머물렀던 기존 수채의 지위를 벗어나 완결성 있는 독자적 장르로서 수채 작품의 완성도를 발견하는 기회가 될 것이다.

전시는 한국 근현대 미술사에서 수채화가 어떻게 독립적인 예술 형식으로 자리 잡았는지를 보여주며, 물이라는 매체가 가진 유동성과 투명성이 각 시대의 작가들에게 어떤 영감을 주었는지 탐구한다. 1930년대부터 1990년대까지 다양한 시기의 작품들을 통해 한국 수채화의 변천사를 한눈에 볼 수 있다.`,
    
    // 큐레이터
    curator: 'MMCA 학예연구실',
    
    // 기타 정보
    artworks_count: 100,
    admission_fee: '2,000원',
    ticket_price: 2000,
    operating_hours: null,
    
    // 메타데이터
    exhibition_type: '소장품전',
    genres: ['수채화', '회화'],
    tags: ['수채화', '소장품', '물', '투명성', '번지기', '근대미술', '현대미술'],
    
    // 링크
    official_url: 'https://www.mmca.go.kr',
    source_url: 'https://www.mmca.go.kr',
    
    // 기관 정보
    institution_id: null,
    source: 'MMCA',
    
    // 조회수
    view_count: 26717,
    
    // 수집 정보
    collected_at: new Date().toISOString(),
    ai_verified: false,
    ai_confidence: null
  };
  
  // 대표 작품 정보
  const majorWorks = [
    { artist: '이인성', work: '계산동 성당', year: '1930년대', size: '34.5×44cm' },
    { artist: '김수명', work: '주전자 있는 정물', year: '1940', size: '28×38cm' },
    { artist: '이중섭', work: '물놀이 하는 아이들', year: '1941', size: '14×9cm' },
    { artist: '손일봉', work: '선도산', year: '1949', size: '38×54cm' },
    { artist: '장발', work: '작품 3', year: '1975', size: '101×132cm' },
    { artist: '곽인식', work: '무제', year: '1980', size: '166×100cm' },
    { artist: '이두식', work: '생의 기원', year: '1982', size: '51×63.5cm' },
    { artist: '정상복', work: '심해인', year: '1983', size: '35×50cm' },
    { artist: '김정자', work: '수평 45', year: '1984', size: '64×87.5cm' },
    { artist: '강연균', work: '전라도 땅', year: '1990', size: '97×146cm' }
  ];
  
  console.log('입력할 전시 정보:');
  console.log('- 제목:', exhibitionData.title_local);
  console.log('- 기간:', exhibitionData.start_date, '~', exhibitionData.end_date);
  console.log('- 장소:', exhibitionData.venue_name, '-', exhibitionData.venue_address);
  console.log('- 참여 작가: 34명');
  console.log('- 작품수:', exhibitionData.artworks_count + '여 점');
  console.log('- 입장료:', exhibitionData.admission_fee);
  console.log('- 조회수:', exhibitionData.view_count);
  console.log('\n주요 작품 (연대순):');
  majorWorks.forEach(w => {
    console.log(`  - ${w.artist}: «${w.work}» (${w.year}) ${w.size}`);
  });
  console.log('\n전시 특징:');
  console.log('  - 수채화만을 단독 장르로 구성한 특별 전시');
  console.log('  - 1930년대부터 1990년대까지 한국 수채화의 변천사');
  console.log('  - 스며들기, 번지기, 투명성 등 수채 특유의 심미적 특성 조명');
  console.log('  - 습작이 아닌 독립적 장르로서의 수채화 재평가');
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

insertWatercolorExhibition().catch(console.error);