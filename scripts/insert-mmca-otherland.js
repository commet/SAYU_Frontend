const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function insertOtherlandExhibition() {
  console.log('=== MMCA 소장품 «아더랜드 Ⅱ: 와엘 샤키, 아크람 자타리» 입력 ===\n');
  
  const exhibitionData = {
    // 기본 정보
    title_en: 'MMCA Collection: Otherland II: Wael Shawky, Akram Zaatari',
    title_local: 'MMCA 소장품 «아더랜드 Ⅱ: 와엘 샤키, 아크람 자타리»',
    subtitle: null,
    
    // 날짜
    start_date: '2025-06-03',
    end_date: '2025-08-17',
    status: 'upcoming',
    
    // 장소
    venue_name: '국립현대미술관 과천',
    venue_city: '과천',
    venue_country: 'KR',
    venue_address: '과천 1층, 1원형전시실',
    
    // 작가 정보
    artists: [
      '와엘 샤키(Wael Shawky)',
      '아크람 자타리(Akram Zaatari)'
    ],
    
    // 전시 설명
    description: `«아더랜드 II: 와엘 샤키, 아크람 자타리»는 국립현대미술관의 뉴미디어 소장품을 소개하고자 마련되었다. 그중에서도 와엘 샤키와 아크람 자타리와 같이 특정한 역사적 사건을 탐구하고 그것을 재해석한 작가들의 작품을 중심으로 구성했다. 이번 전시는 역사적 주제를 다루는 현대미술가들의 태도와 그것이 반영된 뉴미디어 작품의 특징을 동시에 살펴볼 수 있는 기회가 될 것이다.

와엘 샤키는 이집트 출신의 작가로, 중동 지역의 역사와 신화를 동시대적 관점에서 새롭게 해석한 작품을 선보여왔다. 이번 전시에 소개되는 ‹드라마 1882›(2024)는 이집트 현대사에서 중요한 의미를 갖는 우라비 혁명을 다룬다. 2024년 국립현대미술관 발전 후원위원회가 기증한 이 작품은 미술관의 소장품이 되었다.

레바논 출신 작가인 아크람 자타리는 아랍 문화권의 사진 자료를 수집, 보존, 연구하는 아랍 이미지 재단을 운영해 온 작가이다. 이번 전시 출품작인 ‹거부하는 조종사에게 보내는 편지›(2013)는 사진을 매개로 레바논에서 벌어진 전쟁에 관한 기억들을 소환한다.

샤키와 자타리의 작품에서는 과거와 현재가 뒤섞이며 만들어진 다층적인 시공간이 펼쳐지고, 그 안에서 실제와 허구가 혼재된 흥미진진한 이야기가 전개된다. 연극적인 구성, 극장 같은 설치가 포함되어 관객들은 두 작가가 작품을 통해 보여주는 다른 공간 혹은 다른 세계를 연극이나 영화를 관람하듯 몰입도 있게 경험할 수 있다. 이번 전시에서는 샤키와 자타리의 작품에서 볼 수 있는 다양한 시공간과 색다른 이야기가 펼쳐지는 세계를 '아더랜드'로 부르고자 한다.`,
    
    // 큐레이터
    curator: 'MMCA 학예연구실',
    
    // 기타 정보
    artworks_count: 2,
    admission_fee: '과천 전시관람권 3,000원',
    ticket_price: 3000,
    operating_hours: '와엘 샤키 작품 매시 30분 상영 (10:30-16:30)',
    
    // 메타데이터
    exhibition_type: '소장품전',
    genres: ['뉴미디어', '비디오아트', '설치미술'],
    tags: ['아더랜드', '뉴미디어', '중동', '역사', '우라비혁명', '레바논전쟁', '이집트', '아랍', '소장품'],
    
    // 링크
    official_url: 'https://www.mmca.go.kr',
    source_url: 'https://www.mmca.go.kr',
    
    // 기관 정보
    institution_id: null,
    source: 'MMCA',
    
    // 조회수
    view_count: 21330,
    
    // 수집 정보
    collected_at: new Date().toISOString(),
    ai_verified: false,
    ai_confidence: null
  };
  
  // 작품 정보
  const works = [
    {
      artist: '와엘 샤키',
      title: '드라마 1882',
      year: 2024,
      description: '이집트 현대사의 우라비 혁명을 다룬 작품',
      note: '국립현대미술관 발전 후원위원회 기증'
    },
    {
      artist: '아크람 자타리',
      title: '거부하는 조종사에게 보내는 편지',
      year: 2013,
      description: '레바논 전쟁의 기억을 사진을 매개로 소환하는 작품',
      note: '국립현대미술관 소장'
    }
  ];
  
  console.log('입력할 전시 정보:');
  console.log('- 제목:', exhibitionData.title_local);
  console.log('- 기간:', exhibitionData.start_date, '~', exhibitionData.end_date);
  console.log('- 장소:', exhibitionData.venue_name, '-', exhibitionData.venue_address);
  console.log('- 작가:', exhibitionData.artists.join(', '));
  console.log('- 작품수:', exhibitionData.artworks_count + '점');
  console.log('- 입장료:', exhibitionData.admission_fee);
  console.log('- 조회수:', exhibitionData.view_count);
  console.log('\n전시 작품:');
  works.forEach(w => {
    console.log(`  - ${w.artist}: «${w.title}» (${w.year})`);
    console.log(`    ${w.description}`);
    console.log(`    ${w.note}`);
  });
  console.log('\n특별 사항:');
  console.log('  - 와엘 샤키 작품은 매시 30분에 상영');
  console.log('  - 뉴미디어 소장품 특별전');
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

insertOtherlandExhibition().catch(console.error);