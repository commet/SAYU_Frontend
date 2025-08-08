const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function insertMakganExhibition() {
  console.log('=== 2025 막간: 경계에 머무는 시선 전시 입력 ===\n');
  
  const exhibitionData = {
    // 기본 정보
    title_en: '2025 Intermission: Lingering on the Margins',
    title_local: '2025 막간: 경계에 머무는 시선',
    subtitle: null,
    
    // 날짜
    start_date: '2025-07-11',
    end_date: '2025-09-13',
    status: 'upcoming',
    
    // 장소
    venue_name: '국립현대미술관 서울',
    venue_city: '서울',
    venue_country: 'KR',
    venue_address: '서울 지하1층, MMCA영상관',
    
    // 작가 정보
    artists: [
      '켈리 라이카트(Kelly Reichardt)',
      '알리체 로르바케르(Alice Rohrwacher)',
      '루크레시아 마르텔(Lucrecia Martel)'
    ],
    
    // 전시 설명
    description: `'막간'은 국립현대미술관 필름앤비디오 정규 프로그램 사이에 소개되어 관객에게 호평을 받은 작품을 다시 감상할 수 있는 기회를 제공해왔다. 2025년에는 '경계에 머무는 시선'이라는 주제로 사회의 주변부에 존재하는 인물과 공간, 그리고 그들의 감각과 정동을 섬세하게 포착하는 세 명의 여성 감독 켈리 라이카트, 알리체 로르바케르, 루크레시아 마르텔의 작품을 소개한다.

켈리 라이카트는 미국을 대표하는 독립영화 감독으로, 미니멀한 연출과 정적인 쇼트를 통해 주변부 인물들의 고요한 삶을 섬세하게 그려낸다. 상영작 ‹쇼잉 업›은 예술가의 일상을 조명하며, ‹퍼스트 카우›는 19세기 초 서부 개척시대를 배경으로 진실한 우정을 그린다. ‹믹의 지름길›은 1845년 오레곤 트레일을 배경으로 생존과 타자에 대한 신뢰 사이에서 갈등하는 과정을 따라간다.

알리체 로르바케르는 이탈리아 출신의 감독으로 비선형적 서사와 해체된 시간성 속에서 신화와 현실이 교차하는 독창적인 영화 세계를 구축한다. ‹행복한 라짜로›는 계급적 착취를 은폐하고 있는 시골마을을 배경으로 사회적 부조리와 인간 존재의 순수성을 탐구한다. ‹키메라›는 에트루리아 시대의 무덤을 불법 도굴하는 이야기를 통해 상실된 과거와 관계를 복원하려는 인간의 욕망을 그린다. ‹알레고리›는 플라톤의 '동굴 우화'를 현대적으로 재구성한다.

아르헨티나 출신의 루크레시아 마르텔은 남미의 역사적 맥락 속에서 개인과 권력, 계급, 젠더의 복합적 관계를 예리하게 탐구한다. ‹자마›는 남미 식민지의 변방을 배경으로 식민주의의 폭력성과 존재론적 불안을 묘사한다. ‹늪›은 무기력한 부르주아 대가족이 무너져가는 모습을 그리며, ‹북부 터미널›은 팬데믹 시기에 촬영한 음악 다큐멘터리이다.

«2025 막간: 경계에 머무는 시선»은 전통적인 서사 구조와 스펙타클이 제공하지 못하는 감각의 시간을 제안한다. 모두가 열망하는 중심이 아니라, 낯설고도 조용한 가장자리에서 세계를 바라보는 자리로 관객을 초대한다.`,
    
    // 큐레이터
    curator: 'MMCA 필름앤비디오 큐레이터',
    
    // 기타 정보
    artworks_count: 9,
    admission_fee: '무료',
    ticket_price: 0,
    operating_hours: null,
    
    // 메타데이터
    exhibition_type: '영화상영',
    genres: ['영화', '필름앤비디오', '실험영화', '독립영화'],
    tags: ['막간', '여성감독', '켈리 라이카트', '알리체 로르바케르', '루크레시아 마르텔', '경계', '주변부', '독립영화'],
    
    // 링크
    official_url: 'https://www.mmca.go.kr',
    source_url: 'https://www.mmca.go.kr',
    
    // 기관 정보
    institution_id: null,
    source: 'MMCA',
    
    // 조회수
    view_count: 24803,
    
    // 수집 정보
    collected_at: new Date().toISOString(),
    ai_verified: false,
    ai_confidence: null
  };
  
  // 상영작 목록 정보
  const screeningList = [
    '켈리 라이카트: ‹쇼잉 업›(2022, 107분), ‹퍼스트 카우›(2019, 122분), ‹믹의 지름길›(2010, 104분)',
    '알리체 로르바케르: ‹키메라›(2023, 131분), ‹행복한 라짜로›(2018, 127분), ‹알레고리›(2024, 21분)',
    '루크레시아 마르텔: ‹자마›(2017, 115분), ‹늪›(2001, 103분), ‹북부 터미널›(2021, 37분)'
  ];
  
  console.log('입력할 전시 정보:');
  console.log('- 제목:', exhibitionData.title_local);
  console.log('- 작가:', exhibitionData.artists.join(', '));
  console.log('- 기간:', exhibitionData.start_date, '~', exhibitionData.end_date);
  console.log('- 장소:', exhibitionData.venue_address);
  console.log('- 작품수:', exhibitionData.artworks_count + '편');
  console.log('- 입장료:', exhibitionData.admission_fee);
  console.log('\n상영작 목록:');
  screeningList.forEach(item => console.log('  -', item));
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
      console.log('감독:', verify.artists);
      console.log('설명 길이:', verify.description.length + '자');
      console.log('조회수:', verify.view_count);
    }
  }
}

insertMakganExhibition().catch(console.error);