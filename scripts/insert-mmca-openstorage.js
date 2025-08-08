const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function insertOpenStorageExhibition() {
  console.log('=== 개방 수장고 개편 전시 입력 ===\n');
  
  const exhibitionData = {
    // 기본 정보
    title_en: 'Open Storage Reorganization',
    title_local: '개방 수장고 개편',
    subtitle: null,
    
    // 날짜
    start_date: '2020-12-03',
    end_date: '2026-12-31',
    status: 'ongoing',
    
    // 장소
    venue_name: '국립현대미술관 청주',
    venue_city: '청주',
    venue_country: 'KR',
    venue_address: '청주 개방수장고',
    
    // 작가 정보
    artists: [
      '홍경희',
      'V.A.T(권진호, 김민재, 김향미, 박슬아, 백신영, 임웅빈)',
      '국립현대미술관 소장 작가들'
    ],
    
    // 전시 설명
    description: `국립현대미술관 청주관 미술품수장센터는 국내 최초의 수장형 미술관이다. 특히 미술관의 소장품을 보관하는 비밀스러운 공간인 수장고를 관람객이 직접 들어가 볼 수 있도록 공개하여, '개방'과 '소통'을 위한 '열린' 미술관을 지향한다.

개방 수장고는 그 특성상 기획된 전시와는 달리 특정한 주제와 의도를 갖지 않고 작품과 공간을 체험할 수 있도록 하는 것이 목적이다. 또한 작품들이 휴식을 취하는 곳인 만큼 전시 혹은 보존처리를 위한 일부 이동 이외에 변화가 크거나 빈번하지 않은 공간이다. 개관 이후 첫 번째로 이루어지는 이번 개편에서는 새로운 각도로 공간과 작품을 볼 수 있도록 조각이라는 매체가 가진 물성을 강조하여 수장고 속 작품들을 재분류 및 재배치하였다.

1층 개방 수장고에는 국립현대미술관의 소장품 중 주로 조각으로 분류된 입체 유형의 작품이 보관되어 있다. 조각은 깎거나 붙여 형상을 만들어내는 오래된 예술 표현 방식으로, 삼차원의 공간 속에 구현된다. 전통적인 조각 작품이 주로 나무, 돌, 흙과 같은 자연적인 재료로 제작되었다면, 현대의 조각은 산업사회의 부산물인 철, 플라스틱, 일상 오브제 등 매체 자체의 한계를 벗어나 다양한 방식으로 창작되고 있다. 이번 개편에서는 소장품을 통해 조각의 흐름을 살펴볼 수 있도록 연대별, 재료별로 분류하여 소개한다.

개방 수장고는 작품을 보존 보관하는 공간이지만 동시에 관람객이 직접 작품과 보존 환경을 관람하는 전시의 역할을 수행한다. 이번 개편 과정에서는 관람객의 입장에서 접근하는 수장고의 의미를 담아내고자 청주에서 활동하고 있는 청년 디자인 콘텐츠 그룹 V.A.T와 협업하여 수장고의 각종 안내 자료를 제작하였다.

로비에는 홍경희의 ‹Incubation Period 001-11›(1999)이 설치되어 있다. 이 작품은 공간의 순간적인 포착을 통하여 공간 속에서 작품의 존재를 부각시키고, 거울과 하늘의 이미지를 통하여 중첩된 공간의 접점을 보여준다. 금속이라는 무기물의 재료에 자연의 질서를 담아 생명의 본질을 은유적으로 담아내는 조형물이다.`,
    
    // 큐레이터
    curator: 'MMCA 학예연구실',
    
    // 기타 정보
    artworks_count: 170,
    admission_fee: '무료',
    ticket_price: 0,
    operating_hours: null,
    
    // 메타데이터
    exhibition_type: '상설전',
    genres: ['조각', '설치', '입체'],
    tags: ['개방수장고', '수장형미술관', '조각', '국내최초', '열린미술관', '보존', 'VAT'],
    
    // 링크
    official_url: 'https://www.mmca.go.kr',
    source_url: 'https://www.mmca.go.kr',
    
    // 기관 정보
    institution_id: null,
    source: 'MMCA',
    
    // 조회수
    view_count: 59467,
    
    // 수집 정보
    collected_at: new Date().toISOString(),
    ai_verified: false,
    ai_confidence: null
  };
  
  // 개방 수장고 특징
  const features = [
    '국내 최초 수장형 미술관',
    '관람객이 직접 들어가 볼 수 있는 개방형 수장고',
    '조각 소장품 170여점 전시',
    '연대별, 재료별 분류 전시',
    '청년 디자인 그룹 V.A.T와 협업',
    '홍경희 작품 로비 설치'
  ];
  
  console.log('입력할 전시 정보:');
  console.log('- 제목:', exhibitionData.title_local);
  console.log('- 기간:', exhibitionData.start_date, '~', exhibitionData.end_date);
  console.log('- 장소:', exhibitionData.venue_name, '-', exhibitionData.venue_address);
  console.log('- 작품수:', exhibitionData.artworks_count + '여 점');
  console.log('- 입장료:', exhibitionData.admission_fee);
  console.log('- 조회수:', exhibitionData.view_count);
  console.log('\n개방 수장고 특징:');
  features.forEach(f => {
    console.log(`  - ${f}`);
  });
  console.log('\n주요 작품:');
  console.log('  - 홍경희: «Incubation Period 001-11» (1999) - 로비 설치');
  console.log('\n협업:');
  console.log('  - V.A.T (청주 청년 디자인 콘텐츠 그룹)');
  console.log('    권진호, 김민재, 김향미, 박슬아, 백신영, 임웅빈');
  console.log('    수장고 내외부 그래픽 디자인 및 안내 자료 제작');
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
      console.log('상태:', verify.status);
    }
  }
}

insertOpenStorageExhibition().catch(console.error);