const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function insertTzusooExhibition() {
  console.log('=== MMCA×LG OLED 시리즈 2025—추수 전시 입력 ===\n');
  
  const exhibitionData = {
    // 기본 정보
    title_en: 'MMCA×LG OLED Series 2025—TZUSOO',
    title_local: 'MMCA×LG OLED 시리즈 2025—추수',
    subtitle: '«아가몬 대백과: 외부 유출본»',
    
    // 날짜
    start_date: '2025-08-01',
    end_date: '2026-02-01',
    status: 'ongoing',
    
    // 장소
    venue_name: '국립현대미술관 서울',
    venue_city: '서울',
    venue_country: 'KR',
    venue_address: '서울 지하1층, 서울박스',
    
    // 작가 정보 - 배열로 저장
    artists: [
      '추수(TZUSOO)',
      '마르텐 보스(음악)',
      '지언 쾨니히(3D 그래픽)',
      '로이드 마크바트(3D 그래픽)',
      '독립정원(조각)',
      '김소희(에디팅 어시스턴트)'
    ],
    
    // 전시 설명
    description: `국립현대미술관과 LG전자가 협력하여 처음 선보이는 MMCA×LG OLED 시리즈는 디지털 기술과 현대미술이 만나는 자리에서 더 나아가 오늘날 동시대 시각예술의 확장 가능성을 모색하는 미래지향적 프로젝트이다. 기술이라는 매개를 통해 우리가 느낄 수 있는 세계를 더욱 넓히고, 예술가들이 들려주는 새로운 서사와 창발적 순간을 함께 나누고자 한다.

2025년 첫 번째 프로젝트 작가로 선정된 추수는 디지털 네이티브 세대의 감수성과 동시대의 정서를 날카롭게 포착하며, 사이버 생태계와 물리적 현실이 맞닿는 경계에서 독창적인 시각 언어를 구축해왔다. 작가는 이번 전시에서 그가 오랜 시간 형성해온 세계관과 감각을 집약시키며, 생명과 욕망, 그리고 끊임없는 순환이라는 본질적인 주제를 기술 매체와 물질적 조형을 통해 긴장감 있게 펼쳐낸다.

«아가몬 대백과: 외부 유출본»이라는 전시 제목은 작가가 창조한 생명체 '아가몬'을 중심으로 펼쳐지는 세계관이 일종의 연유로 인간 세계에 드러나기 시작한 정황을 담는다. 서울관 모든 전시실을 연결하는 동선의 중심에 위치한 서울박스는 관람객에게 익숙한 공간에서 벗어나 생명력과 소멸, 그리고 다시 태어남이 뒤엉킨 낯설면서도 유기적인 공간으로 변모한다.

OLED 디스플레이의 정교한 색채 표현력과 해상도는 디지털 매체를 통해 장인적 조형언어를 구축해온 작가의 미학적 태도와 강한 시너지를 발휘한다. 서울박스를 가득 채운 이 감각의 풍경은 기술 너머 예술이 감지해야 할 것들—몸, 관계 맺음, 재생의 힘, 그리고 불완전한(완벽하지 않기에 아름다운) 생명성—에 대해 질문을 건넨다.`,
    
    // 큐레이터
    curator: 'MMCA 큐레이터',
    
    // 기타 정보
    artworks_count: null,
    admission_fee: '무료',
    ticket_price: 0,
    
    // 메타데이터
    exhibition_type: '특별전',
    genres: ['디지털 아트', '미디어 아트', '설치미술'],
    tags: ['OLED', 'LG', '디지털', '미디어아트', '추수', 'TZUSOO', '아가몬'],
    
    // 링크
    official_url: 'https://www.mmca.go.kr/exhibitions/exhibitionsDetail.do?exhFlag=1&exhId=202501060001891',
    source_url: 'https://www.mmca.go.kr',
    
    // 기관 정보
    institution_id: null,
    source: 'MMCA',
    
    // 조회수
    view_count: 10822,
    
    // 수집 정보
    collected_at: new Date().toISOString(),
    ai_verified: false,
    ai_confidence: null
  };
  
  console.log('입력할 전시 정보:');
  console.log('- 제목:', exhibitionData.title_local);
  console.log('- 부제:', exhibitionData.subtitle);
  console.log('- 작가:', exhibitionData.artists[0]);
  console.log('- 기간:', exhibitionData.start_date, '~', exhibitionData.end_date);
  console.log('- 장소:', exhibitionData.venue_name);
  console.log('- 입장료:', exhibitionData.admission_fee);
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
      console.log('작가:', verify.artists);
      console.log('설명 길이:', verify.description.length + '자');
    }
  }
}

insertTzusooExhibition().catch(console.error);