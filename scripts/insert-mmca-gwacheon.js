const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function insertGwacheonExhibition() {
  console.log('=== MMCA 과천 상설전 «한국근현대미술 II» 입력 ===\n');
  
  const exhibitionData = {
    // 기본 정보
    title_en: 'MMCA Gwacheon Permanent Exhibition: Korean Modern and Contemporary Art II',
    title_local: 'MMCA 과천 상설전 «한국근현대미술 II»',
    subtitle: null,
    
    // 날짜
    start_date: '2025-06-26',
    end_date: '2027-06-27',
    status: 'upcoming',
    
    // 장소
    venue_name: '국립현대미술관 과천',
    venue_city: '과천',
    venue_country: 'KR',
    venue_address: '과천 2층, 3, 4 전시실',
    
    // 작가 정보 - 주요 작가들
    artists: [
      '김환기',
      '박생광',
      '박서보',
      '서세옥',
      '서승원',
      '유영국',
      '윤형근',
      '이성자',
      '이숙자',
      '최욱경',
      '방혜자',
      '외 70여 명'
    ],
    
    // 전시 설명
    description: `MMCA 과천 상설전 «한국근현대미술 II»는 국립현대미술관 소장품 중 20세기 후반에 제작된 주요 작품 120여 점을 소개한다. 국립현대미술관은 1969년 경복궁 내에 위치한 미술관에서 제18회 대한민국미술전람회(국전)를 개관전으로 개최하며 문을 열었으며, 당시 국전의 체계적인 운영이 미술관의 주요 설립 목적이었다. 작품 수집은 1971년부터 이루어졌고, 50여 년이 넘는 기간 동안 한국 미술사 연구에 초점을 맞춘 작품과 아카이브를 꾸준히 수집, 보존해 현재 11,800여 점의 소장품을 보유하고 있다.

이번 전시는 미술관의 소장품 중 1950년대 후반부터 1990년대 말에 이르는 주요 작품들을 기반으로 구상과 추상, 전통과 현대, 기성과 전위, 순수와 현실 참여 등 한국 근현대미술의 흐름을 읽어가는 데 주요한 맥락을 짚으며 주요 작가와 작품들을 다각도로 살핀다. 또한 '정부 수립과 미술', '모더니스트 여성 미술가들'과 같은 주제를 통해 기존 한국 미술사 서술에서 충분히 조명되지 않은 작가와 흐름을 재조명하고자 한다. 이와 더불어 김환기(1913–1974), 윤형근(1928–2007) 등 작가의 섹션을 마련하여 이들의 작품과 예술 세계를 보다 온전히 이해하고 몰입해 감상할 수 있는 공간을 마련했다.

한국의 근현대미술은 일제강점기, 한국전쟁, 산업화, 민주화 등 격동의 시대를 거치며, 변화하는 현실을 감각하고 이에 응답한 작가들의 실천을 통해 형성되어 왔다. 전시는 이러한 역사적 맥락 위에서 창작의 열정을 이어온 작가들의 사유와 조형적 성취를 다각도로 살핀다. 이번 전시가 단절된 과거가 아닌, 동시대 미술로 이어지는 연속선 위에서 한국 미술의 흐름과 가능성을 탐색하는 기회가 되기를 바란다.`,
    
    // 큐레이터
    curator: 'MMCA 학예연구실',
    
    // 기타 정보
    artworks_count: 120,
    admission_fee: '과천 전시관람권 3,000원',
    ticket_price: 3000,
    operating_hours: null,
    
    // 메타데이터
    exhibition_type: '상설전',
    genres: ['회화', '조각', '추상미술', '구상미술', '현대미술'],
    tags: ['상설전', '한국근현대미술', '소장품', '1950년대', '1990년대', '김환기', '윤형근', '추상', '구상', '여성미술가'],
    
    // 링크
    official_url: 'https://www.mmca.go.kr',
    source_url: 'https://www.mmca.go.kr',
    
    // 기관 정보
    institution_id: null,
    source: 'MMCA',
    
    // 조회수
    view_count: 15786,
    
    // 수집 정보
    collected_at: new Date().toISOString(),
    ai_verified: false,
    ai_confidence: null
  };
  
  // 대표 작품 정보
  const majorWorks = [
    { artist: '김환기', work: '새벽 #3', year: '1964-1965', medium: '캔버스에 유채' },
    { artist: '박서보', work: '원형질 1-62', year: 1962, medium: '캔버스에 유화 물감' },
    { artist: '방혜자', work: '정기', year: 1969, medium: '캔버스에 유화물감' },
    { artist: '서승원', work: '동시성 67-1', year: 1967, medium: '캔버스에 유채' },
    { artist: '윤형근', work: '청다색 82-86-32', year: 1982, medium: '캔버스에 유화 물감' },
    { artist: '이성자', work: '극지로 가는 길 83년 11월', year: 1983, medium: null },
    { artist: '최욱경', work: '환희', year: 1977, medium: '캔버스에 아크릴릭물감' }
  ];
  
  console.log('입력할 전시 정보:');
  console.log('- 제목:', exhibitionData.title_local);
  console.log('- 기간:', exhibitionData.start_date, '~', exhibitionData.end_date);
  console.log('- 장소:', exhibitionData.venue_name, '-', exhibitionData.venue_address);
  console.log('- 작가 수: 80여 명');
  console.log('- 작품수:', exhibitionData.artworks_count + '여 점');
  console.log('- 입장료:', exhibitionData.admission_fee);
  console.log('- 조회수:', exhibitionData.view_count);
  console.log('\n주요 작품:');
  majorWorks.forEach(w => {
    console.log(`  - ${w.artist}: ${w.work} (${w.year})`);
  });
  console.log('\n특별 섹션:');
  console.log('  - 김환기 섹션');
  console.log('  - 윤형근 섹션');
  console.log('  - 모더니스트 여성 미술가들');
  console.log('  - 정부 수립과 미술');
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

insertGwacheonExhibition().catch(console.error);