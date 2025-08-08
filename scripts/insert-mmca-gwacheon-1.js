const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function insertGwacheon1Exhibition() {
  console.log('=== MMCA 과천 상설전 «한국근현대미술 I» 입력 ===\n');
  
  const exhibitionData = {
    // 기본 정보
    title_en: 'MMCA Gwacheon Permanent Exhibition: Korean Modern and Contemporary Art I',
    title_local: 'MMCA 과천 상설전 «한국근현대미술 I»',
    subtitle: null,
    
    // 날짜
    start_date: '2025-05-01',
    end_date: '2027-06-27',
    status: 'upcoming',
    
    // 장소
    venue_name: '국립현대미술관 과천',
    venue_city: '과천',
    venue_country: 'KR',
    venue_address: '과천 3층, 5, 6전시실',
    
    // 작가 정보 - 주요 작가들
    artists: [
      '고희동',
      '김기창',
      '도상봉',
      '박래현',
      '박수근',
      '오지호',
      '이중섭',
      '장욱진',
      '정찬영',
      '김규진',
      '안중식',
      '장우성',
      '외 58명'
    ],
    
    // 전시 설명
    description: `MMCA 과천 상설전 «한국근현대미술 Ⅰ»은 국립현대미술관 소장품 중 20세기 전반에 제작된 작품 145점을 소개한다. 이 시기는 대한제국을 거쳐, 개화기, 일제 강점기, 광복, 한국전쟁에 이르는 시기이다.

1800년대 후반부터 조선의 지식인 사회에서는 일본과 청나라와의 교류를 통해 서양의 문물, 특히 과학기술에 대한 관심이 높아졌다. 일본의 '탈아입구(脫亞入歐)', 청나라의 '중체서용(中體西用)'처럼 조선에서도 동양의 정신과 서양의 기술을 접목하자는 '동도서기(東道西器)' 사상이 개화파 지식인을 중심으로 확산됐다. 사진술과 서양식 원근법의 도입에 따른 사실적 표현은 시각적 충격을 주었다. 금녀의 영역이던 서화와 미술교육의 문이 여성에게도 열리면서 예술가를 꿈꾸는 여성도 늘어났다.

전시는 9개의 섹션으로 구성되어 있다. 1부 '새로운 시선의 등장: 광학과 카메라, 근대적 지식체계와 미술'과 2부 '근대서화의 모색'에서는 사회의 변화 속에서 전통을 지키려고 애썼던 근대 서화가의 활동을 소개한다. 3부 '미술/미술가의 개념의 등장'은 서양식 회화에 호기심을 갖고 도전했던 초기 서양화를 정물화, 풍경화, 인물화로 살펴본다. 4부는 오지호의 작품을 초기부터 말년까지 살펴보며, 5부 '조선의 삶을 그리다'는 1930~40년대 조선미술전람회 수상작을 중심으로 당시 사회상과 인물을 다룬 작품을 소개한다. 6부에서는 부부 작가인 박래현과 김기창을 소개한다. 7부에서는 한국전쟁 시기와 그 이후에 이루어진 반구상적인 경향을 통해 조형실험의 양상을 추적한다. 8부에서는 가족을 주제로 한 회화와 조각이 소개되며, 마지막 9부에서는 이중섭의 드로잉, 유화, 엽서화 등을 소개한다.

MMCA 과천 상설전 «한국근현대미술 Ⅰ»은 새로운 변화 앞에서 적극적이고 치열하게 고민했던 그 시기 예술가들의 질문에 주목했다. 고난의 시기, 예술이 어떤 힘으로 그들을 지켜주었는지를 살펴볼 것이다.`,
    
    // 큐레이터
    curator: 'MMCA 학예연구실',
    
    // 기타 정보
    artworks_count: 145,
    admission_fee: '과천 전시관람권 3,000원',
    ticket_price: 3000,
    operating_hours: null,
    
    // 메타데이터
    exhibition_type: '상설전',
    genres: ['회화', '동양화', '서양화', '조각', '서예'],
    tags: ['상설전', '한국근현대미술', '소장품', '20세기', '개화기', '일제강점기', '한국전쟁', '고희동', '이중섭', '박수근'],
    
    // 링크
    official_url: 'https://www.mmca.go.kr',
    source_url: 'https://www.mmca.go.kr',
    
    // 기관 정보
    institution_id: null,
    source: 'MMCA',
    
    // 조회수
    view_count: 35891,
    
    // 수집 정보
    collected_at: new Date().toISOString(),
    ai_verified: false,
    ai_confidence: null
  };
  
  // 대표 작품 정보
  const majorWorks = [
    { artist: '고희동', work: '자화상', year: 1915, medium: '캔버스에 유화물감' },
    { artist: '김기창', work: '정청(靜聽)', year: 1934, medium: '비단에 색' },
    { artist: '도상봉', work: '성균관', year: 1933, medium: '캔버스에 유화 물감' },
    { artist: '박래현', work: '여인', year: 1942, medium: '종이에 먹, 색' },
    { artist: '박수근', work: '할아버지와 손자', year: 1960, medium: '캔버스에 유화 물감' },
    { artist: '오지호', work: '남향집', year: 1939, medium: '캔버스에 유화물감' },
    { artist: '이중섭', work: '황소', year: '1950년대', medium: '종이에 유화 물감' }
  ];
  
  // 전시 섹션
  const sections = [
    '1부: 새로운 시선의 등장: 광학과 카메라, 근대적 지식체계와 미술',
    '2부: 근대서화의 모색',
    '3부: 미술/미술가의 개념의 등장',
    '4부: 오지호 특별전',
    '5부: 조선의 삶을 그리다',
    '6부: 박래현과 김기창',
    '7부: 한국전쟁과 반구상',
    '8부: 가족',
    '9부: 이중섭'
  ];
  
  console.log('입력할 전시 정보:');
  console.log('- 제목:', exhibitionData.title_local);
  console.log('- 기간:', exhibitionData.start_date, '~', exhibitionData.end_date);
  console.log('- 장소:', exhibitionData.venue_name, '-', exhibitionData.venue_address);
  console.log('- 작가 수: 70명');
  console.log('- 작품수:', exhibitionData.artworks_count + '점');
  console.log('- 입장료:', exhibitionData.admission_fee);
  console.log('- 조회수:', exhibitionData.view_count);
  console.log('\n주요 작품:');
  majorWorks.forEach(w => {
    console.log(`  - ${w.artist}: ${w.work} (${w.year})`);
  });
  console.log('\n전시 섹션:');
  sections.forEach((s, i) => {
    console.log(`  ${s}`);
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
      console.log('장소:', verify.venue_name);
      console.log('작가 수:', verify.artists.length);
      console.log('설명 길이:', verify.description.length + '자');
      console.log('전시 유형:', verify.exhibition_type);
    }
  }
}

insertGwacheon1Exhibition().catch(console.error);