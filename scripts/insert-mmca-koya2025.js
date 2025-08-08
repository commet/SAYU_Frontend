const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function insertKOYA2025Exhibition() {
  console.log('=== 올해의 작가상 2025 입력 ===\n');
  
  const exhibitionData = {
    // 기본 정보
    title_en: 'Korea Artist Prize 2025',
    title_local: '올해의 작가상 2025',
    subtitle: null,
    
    // 날짜
    start_date: '2025-08-29',
    end_date: '2026-02-01',
    status: 'upcoming',
    
    // 장소
    venue_name: '국립현대미술관 서울',
    venue_city: '서울',
    venue_country: 'KR',
    venue_address: '서울 지하1층, 3, 4, 5전시실',
    
    // 작가 정보
    artists: [
      '김영은',
      '임영주',
      '김지평',
      '언메이크랩(최빛나, 송수연)'
    ],
    
    // 전시 설명
    description: `‹올해의 작가상›은 국립현대미술관과 SBS문화재단이 2012년부터 공동으로 주최해 온 대표적인 현대미술 작가 후원 프로그램이자 수상 제도로, 매년 작가 4인(팀)을 선정하여 신작 제작과 전시를 지원해 왔다. 2023년 10주년을 맞아 작가의 작품 세계를 (비)선형적이자 입체적으로 조망할 수 있도록 신작에 더해 기존의 주요 작품을 함께 선보이는 변화를 꾀하였다.

«올해의 작가상 2025» 선정 작가는 김영은, 임영주, 김지평, 언메이크랩이다.

김영은은 소리와 청취를 정치적이고 역사적인 산물 및 실천으로 바라본 작업을 선보인다. 소리와 청취가 특정 역사적 맥락 안에서 어떻게 구성되고 기술적으로 발전되는지, 그리고 청취가 지식 생산과 탈식민화 과정에서 어떤 가능성을 제공하는지를 탐구한다.

임영주는 한국 사회에서 미신과 신념, 종교적 믿음이 형성·수용되는 과정을 관찰해 왔으며, 이러한 '불확실한 믿음'을 과학기술의 발전과 견주어 보며 현실 너머를 상상하고 나아가 죽음, 종말, 외계에 대한 실존적 차원의 이야기를 새롭게 구성한다.

김지평은 '동양화'의 개념과 기법에 들어 있는 전통적 세계관과 보는 방식을 비평적으로 해석해 왔다. 작가는 공인된 전통이 이미 근대성의 일부가 되었다고 보고 그간 전통이 스스로 배제해 온 재야의 미술, 야생의 사고, 신화의 상상력을 다시 길어 올리려 한다.

언메이크랩은 최빛나와 송수연이 구성한 콜렉티브로, 한국의 발전주의 역사와 인공지능의 요소(데이터셋, 컴퓨터 비전, 생성 신경망 기술)를 교차시키며, 현재의 사회적·생태적 상황을 사변적 풍경으로 재구성하는 작업에 집중하고 있다.

네 작가는 각기 다른 매체와 주제를 경유하며 감각되지 않는 것—감춰지거나 누락되고, 소외되거나 잊혀진 세계의 층위들—을 추적한다. 이들은 "비가시적인 세계는 어떻게 드러날 수 있는가?"라는 질문을 따라 재현의 역학을 파헤치고, 세계를 인식하는 방식 자체에 의문을 던진다.`,
    
    // 큐레이터
    curator: 'MMCA 학예연구실',
    
    // 기타 정보
    artworks_count: null,
    admission_fee: '미정',
    ticket_price: null,
    operating_hours: null,
    
    // 메타데이터
    exhibition_type: '공모전시',
    genres: ['현대미술', '비디오아트', '설치', '퍼포먼스', '미디어아트'],
    tags: ['올해의작가상', 'KOYA', '2025', 'SBS문화재단', '신작', '소리', '청취', '동양화', '인공지능', '비가시적'],
    
    // 링크
    official_url: 'https://www.mmca.go.kr',
    source_url: 'https://www.mmca.go.kr',
    
    // 기관 정보
    institution_id: null,
    source: 'MMCA',
    
    // 조회수
    view_count: 2557,
    
    // 수집 정보
    collected_at: new Date().toISOString(),
    ai_verified: false,
    ai_confidence: null
  };
  
  // 작가별 주요 작품
  const artistWorks = [
    {
      artist: '김영은',
      work: '미래의 청취자들에게 I',
      year: 2022,
      medium: '단채널 비디오, 사운드(스테레오), 8분',
      theme: '소리와 청취의 정치학, 탈식민화'
    },
    {
      artist: '임영주',
      work: '고 故 The Late',
      year: '2023-2025',
      medium: '비디오, 사운드, 물체, 퍼포먼스, 웹사이트, 책, 60분',
      theme: '미신과 과학, 죽음과 종말'
    },
    {
      artist: '김지평',
      work: '디바-무당',
      year: 2023,
      medium: '3폭 병풍: 나무 패널에 배접 비단, 한지, 마이크, 혼합 재료, 170×115cm',
      theme: '동양화 재해석, 재야의 미술'
    },
    {
      artist: '언메이크랩',
      work: '뉴-빌리지',
      year: 2025,
      medium: '기록영상, 게임 엔진, 단채널 비디오, 4K, 컬러, 사운드(스테레오), 23분',
      theme: '발전주의와 AI, 사변적 풍경'
    }
  ];
  
  console.log('입력할 전시 정보:');
  console.log('- 제목:', exhibitionData.title_local);
  console.log('- 기간:', exhibitionData.start_date, '~', exhibitionData.end_date);
  console.log('- 장소:', exhibitionData.venue_name, '-', exhibitionData.venue_address);
  console.log('- 작가: 4팀');
  console.log('  1. 김영은');
  console.log('  2. 임영주');
  console.log('  3. 김지평');
  console.log('  4. 언메이크랩(최빛나, 송수연)');
  console.log('- 주최/후원: 국립현대미술관 / SBS문화재단');
  console.log('- 조회수:', exhibitionData.view_count);
  console.log('\n작가별 대표작:');
  artistWorks.forEach(a => {
    console.log(`  ${a.artist}`);
    console.log(`    - 작품: ${a.work} (${a.year})`);
    console.log(`    - 매체: ${a.medium}`);
    console.log(`    - 주제: ${a.theme}`);
  });
  console.log('\n전시 특징:');
  console.log('  - 2012년부터 이어온 대표적인 현대미술 작가 후원 프로그램');
  console.log('  - 14회째를 맞는 올해의 작가상');
  console.log('  - 신작과 기존 주요 작품을 함께 전시');
  console.log('  - "비가시적인 세계"를 탐구하는 4인(팀)의 작업');
  console.log('  - 청취와 정치, 전통과 동양화, 미신과 과학, 기술과 인간의 관계 탐구');
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

insertKOYA2025Exhibition().catch(console.error);