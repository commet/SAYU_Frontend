const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function insertStorageExhibition() {
  console.log('=== 특별수장고: 국립현대미술관 드로잉·일본 현대 판화 소장품 입력 ===\n');
  
  const exhibitionData = {
    // 기본 정보
    title_en: 'Special Storage: MMCA Drawing and Japanese Contemporary Print Collection',
    title_local: '특별수장고: 국립현대미술관 드로잉·일본 현대 판화 소장품',
    subtitle: null,
    
    // 날짜
    start_date: '2025-07-22',
    end_date: '2026-12-31',
    status: 'upcoming',
    
    // 장소
    venue_name: '국립현대미술관 청주',
    venue_city: '청주',
    venue_country: 'KR',
    venue_address: '청주 4층, 특별수장고',
    
    // 작가 정보 - 한국 및 일본 작가들
    artists: [
      '곽덕준',
      '권진규',
      '김환기',
      '박수근',
      '박현기',
      '유영국',
      '이중섭',
      '원석연',
      '서용선',
      '구사마 야요이(Kusama Yayoi)',
      '기무라 고스케(Kimura Kosuke)',
      '모토나가 사다마사(Motonaga Sadamasa)',
      '오노사토 도시노부(Onosato Toshinobu)',
      '이치하라 아리노리(Ichihara Arinori)',
      '고시야 겐이치(Koshiya Kenichi)',
      '아이-오(Ay-O)',
      '노다 테츠야(Noda Tetsuya)',
      '외 다수'
    ],
    
    // 전시 설명
    description: `국립현대미술관 청주 특별수장고는 소장품 연구 활성화와 작품에 대한 집중적인 감상을 위해 특별히 조성된 개방형 수장고이다. 2020년부터 특별수장고는 국립현대미술관이 소장하고 있는 드로잉 작품들을 소개하고 있다.

이중섭의 ‹소년›(1943-1945), 박수근의 ‹마을 풍경›(1956), 유영국의 ‹산›(1970년대 중반), 원석연의 ‹개미›(1976), 서용선의 ‹소나무›(1983) 등은 모두 작가의 조형 의식과 예술적 실험 과정을 목격할 수 있는 드로잉 작품이자, 국립현대미술관의 대표 소장품이다. 특별수장고 «국립현대미술관 드로잉 소장품»은 미술관이 구축해 온 대규모의 소장품을 통해 드로잉에 대한 개념 변화와 양상, 그리고 다양한 관점을 고찰해 볼 기회를 제공한다.

이번 특별수장고 개방을 통해 국내 작가들의 드로잉 소장품과 더불어, 주목할 만한 해외 소장품으로 일본 현대 판화 소장품을 선보인다. 판화는 판의 물성과 지지체 사이에서 일어나는 무수한 변형과 실험을 통해 예술의 영역을 확장한다. 일본 판화는 단순한 복제를 넘어 창작의 영역으로 자리 잡은 이래, 1970년대에 팝아트와 개념미술, 대중문화 등의 영향으로 실험적이고 활발한 전성기를 맞았다.

다양한 판화 기법의 발달과 현대미술로서 판화 개념의 확장은 1980년대와 그 이후의 일본 현대 판화 작품에도 그 영향이 여실히 담겨있다. 국립현대미술관 청주에 소장된 이 시기의 다양한 일본 현대 판화 작품들에서 정교한 표현과 독창적인 실험을 감상할 수 있다.`,
    
    // 큐레이터
    curator: 'MMCA 학예연구실',
    
    // 기타 정보
    artworks_count: 100,
    admission_fee: '무료',
    ticket_price: 0,
    operating_hours: '평일 14:00~18:00 매시 10명 제한 입장 (선착순)',
    
    // 메타데이터
    exhibition_type: '소장품전',
    genres: ['드로잉', '판화', '스크린프린트', '석판화', '목판화', '모노타이프'],
    tags: ['특별수장고', '개방형수장고', '드로잉', '일본판화', '소장품', '한일교류'],
    
    // 링크
    official_url: 'https://www.mmca.go.kr',
    source_url: 'https://www.mmca.go.kr',
    
    // 기관 정보
    institution_id: null,
    source: 'MMCA',
    
    // 조회수
    view_count: 4335,
    
    // 수집 정보
    collected_at: new Date().toISOString(),
    ai_verified: false,
    ai_confidence: null
  };
  
  // 대표 작품 정보
  const majorWorks = [
    { artist: '이중섭', work: '소년', year: '1943-1945', type: '드로잉' },
    { artist: '박수근', work: '마을 풍경', year: '1956', type: '드로잉' },
    { artist: '유영국', work: '산', year: '1970년대 중반', type: '드로잉' },
    { artist: '원석연', work: '개미', year: '1976', type: '드로잉' },
    { artist: '서용선', work: '소나무', year: '1983', type: '드로잉' },
    { artist: '오노사토 도시노부', work: 'A.S.-10', year: '1982', type: '스크린프린트' },
    { artist: '기무라 고스케', work: '현재 위치-존재 A', year: '1971', type: '석판, 스크린프린트' },
    { artist: '이치하라 아리노리', work: 'GYM', year: '1985', type: '모노타이프' },
    { artist: '고시야 겐이치', work: '스위치 ON(II)', year: '1986', type: '스크린프린트' },
    { artist: '아이-오', work: '개막식', year: '1988', type: '스크린프린트' },
    { artist: '노다 테츠야', work: '일기: 1989년 8월 5일', year: '1989', type: '목판, 스크린프린트' }
  ];
  
  console.log('입력할 전시 정보:');
  console.log('- 제목:', exhibitionData.title_local);
  console.log('- 기간:', exhibitionData.start_date, '~', exhibitionData.end_date);
  console.log('- 장소:', exhibitionData.venue_name, '-', exhibitionData.venue_address);
  console.log('- 작품수:', exhibitionData.artworks_count + '여 점');
  console.log('- 입장료:', exhibitionData.admission_fee);
  console.log('- 운영시간:', exhibitionData.operating_hours);
  console.log('- 조회수:', exhibitionData.view_count);
  console.log('\n주요 작품:');
  console.log('  [한국 드로잉]');
  majorWorks.filter(w => w.type === '드로잉').forEach(w => {
    console.log(`    - ${w.artist}: ${w.work} (${w.year})`);
  });
  console.log('  [일본 현대 판화]');
  majorWorks.filter(w => w.type !== '드로잉').forEach(w => {
    console.log(`    - ${w.artist}: ${w.work} (${w.year}, ${w.type})`);
  });
  console.log('\n특징:');
  console.log('  - 개방형 수장고 전시');
  console.log('  - 한국 드로잉과 일본 현대 판화 소장품 동시 전시');
  console.log('  - 선착순 제한 입장 (매시 10명)');
  console.log('  - 1970-80년대 일본 판화 전성기 작품 포함');
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

insertStorageExhibition().catch(console.error);