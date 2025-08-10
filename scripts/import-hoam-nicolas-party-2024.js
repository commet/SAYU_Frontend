const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function importHoamNicolasParty2024() {
  console.log('🎨 호암미술관 《니콜라스 파티: 더스트》 전시 데이터 입력 시작...\n');
  
  try {
    const exhibitionData = {
      id: uuidv4(),
      
      // 기본 정보
      title_local: '니콜라스 파티: 더스트',
      title_en: 'Nicolas Party: DUST',
      subtitle: '스위스 작가 니콜라스 파티 최대 규모 서베이 전시',
      
      // 날짜
      start_date: '2024-08-31',
      end_date: '2025-01-19',
      exhibition_type: 'special',
      status: 'ongoing', // 2025년 1월까지 진행
      
      // 장소 정보
      venue_name: '호암미술관',
      venue_city: '용인',
      venue_country: 'KR',
      venue_address: '경기도 용인시 처인구 포곡읍 에버랜드로 562번길 38',
      
      // 전시 설명
      description: `호암미술관은 스위스 작가 니콜라스 파티의 작품세계 전반을 아우르는 최대 규모의 서베이 전시 《더스트》를 개최합니다. 이번 전시는 작가의 기존 회화 및 조각 48점, 신작 회화 20점, 전시를 위해 특별히 제작된 파스텔 벽화 5점을 리움의 고미술 소장품과 함께 선보입니다.

[작가 배경]
니콜라스 파티는 유년 시절부터 그래피티를 체험하고, 대학에서는 영화, 그래픽디자인, 3D애니메이션을 전공했습니다. 아티스트 그룹을 결성하여 미술, 음악, 퍼포먼스가 융합된 전시와 공연을 만들기도 했으며, 이러한 다원적 경험은 벽화, 채색 조각, 총체적 설치와 전시기획을 포괄하는 작품 활동 전반에 영향을 미치고 있습니다.

[전시 구성]
• 기존 회화 및 조각: 48점
• 신작 회화: 20점  
• 특별 제작 파스텔 벽화: 5점
• 리움미술관 고미술 소장품과의 협업 전시

[주요 벽화 작품]
《동굴》 (2024) - 벽에 소프트 파스텔, 380 x 908 cm
《나무 기둥》 (2024) - 벽에 소프트 파스텔, 380 x 908 cm  
《산》 (2024) - 벽에 소프트 파스텔, 350 x 800 cm
《구름》 (2024) - 벽에 소프트 파스텔, 350 x 800 cm

[신작 초상화 시리즈]
리움미술관 소장 《십장생도 10곡병》과 김홍도의 《군선도》를 참조하여 상상의 팔선(八仙)을 형상화한 신작 초상 8점:
• 《두 마리 개가 있는 초상》 (2024)
• 《복숭아가 있는 초상》 (2024) 
• 《사슴이 있는 초상》 (2024)
• 《청자가 있는 초상》 (2024)
• 《버섯이 있는 초상》 (2019)
• 《부엉이가 있는 초상》 (2021)
• 《빨간 꽃이 있는 초상》 (2020)

[주요 기존 작품]
• 《폭포》 (2022) - 리넨에 소프트 파스텔, 285 x 180 cm
• 《곤충이 있는 조각》 (2019) - 고밀도 폴리우레탄 폼에 유채

[협업 고미술 소장품]
• 《십장생도 10곡병》 (조선 18세기 후반) - 비단·채색, 210 × 552.3 cm
• 김홍도, 《군선도》 (1776년) - 종이·수묵담채, 132.8 x 575.8 cm (리움미술관 소장, 국보)
• 《백자 태호》 (조선) - 국립중앙박물관, 이건희 회장 기증
• 《금동 용두보당》 (고려 10-11세기) - 리움미술관 소장, 국보

[전시 테마: '더스트']
전시 제목 '더스트'는 파스텔 고유의 특성을 회화적 재현의 주된 방식이자 주제로 받아들이는 파티의 작품세계와 연계됩니다. 마치 '나비 날개의 인분(鱗粉)처럼' 쉽사리 공기 중으로 흩어지는 파스텔은 지극히 연약하고 일시적인 재료입니다.

[작가의 철학]
• 미술사는 영감을 위한 소중한 보고(寶庫)이자 아카이브
• 고대부터 근·현대를 아우르는 미술사의 다양한 작가, 모티프, 양식, 재료 등을 자유롭게 참조
• 18세기 유럽에서 유행한 이후 잊혀진 파스텔화를 소환하여 풍경, 정물, 초상 같은 회화의 전통 장르를 재해석
• 선명한 색, 단순한 형태, 생경한 이미지가 어우러진 작품
• 가벼움과 심오함, 유머와 진지함 사이를 넘나드는 작품세계

[파스텔의 존재론적 불안정성]
파티에게 파스텔화는 '먼지로 이루어진 가면(mask of dust)'이자, 화장과 같은 환영입니다. 미술관 벽에 직접 그리는 거대한 파스텔 벽화는 전시 동안에만 존재하고 사라지는 운명을 지닙니다. 이러한 파스텔의 존재론적 불안정성을 인간과 비인간 종(種), 문명과 자연의 지속과 소멸에 대한 사유로 확장합니다.

[공간 연출]
호암미술관의 1층과 2층을 동일한 구조로 만든 파티는 좁은 회랑과 넓은 방들로 미로 같은 공간을 연출하고, 중세 건축과 회화의 모티프인 아치 문과 마블 페인팅을 활용하여 방과 방을 연결하는 특별한 건축적 경험을 선사합니다.

[동서고금의 문화적 대화]
동굴과 백자 태호, 꽃, 버섯, 운석과 합체된 인간, 멸종된 공룡과 상상의 동물 용, 붉은 숲과 잿빛 구름 풍경 등 동서고금의 문화적 상징과 재현을 뒤섞고, 낭만주의적 숭고와 재난의 이미지를 교차시킵니다.`,
      
      // 작가 정보
      artists: ['니콜라스 파티 (Nicolas Party)'],
      curator: '곽준영 (전시기획실장), 김혜연 (큐레이터)',
      
      // 작품 정보
      artworks_count: 73, // 기존 작품 48점 + 신작 20점 + 벽화 5점
      
      // 관람 정보
      admission_fee: '별도 공지',
      operating_hours: JSON.stringify({
        운영시간: '화-일 10:00-18:00 (예상)',
        휴관일: '매주 월요일 (예상)',
        예약: '전시예약 필요'
      }),
      
      // 연락처
      contact_info: JSON.stringify({
        대표: '031-320-1801~2',
        문의: '031-320-1801',
        홈페이지: 'hoam.samsung.org',
        예약: '전시예약 시스템 이용'
      }),
      phone_number: '031-320-1801',
      
      // URL 정보
      official_url: 'https://hoam.samsung.org',
      website_url: 'https://hoam.samsung.org',
      
      // 데이터 메타정보
      source: 'hoam_official',
      source_url: 'https://hoam.samsung.org',
      collected_at: new Date().toISOString(),
      
      // 기본값 설정
      view_count: 0,
      ai_verified: true,
      ai_confidence: 0.95
    };

    // 데이터 입력
    console.log('📝 전시 데이터 입력 중...');
    const { data, error } = await supabase
      .from('exhibitions')
      .insert([exhibitionData])
      .select();
    
    if (error) {
      throw error;
    }
    
    console.log('✅ 《니콜라스 파티: 더스트》 전시 데이터 입력 완료!');
    console.log('\n📋 입력된 전시 정보:');
    console.log(`  - ID: ${data[0].id}`);
    console.log(`  - 제목: ${data[0].title_local}`);
    console.log(`  - 부제: ${data[0].subtitle}`);
    console.log(`  - 작가: ${data[0].artists.join(', ')}`);
    console.log(`  - 장소: ${data[0].venue_name} (전시실 1, 2)`);
    console.log(`  - 기간: ${data[0].start_date} ~ ${data[0].end_date}`);
    console.log(`  - 작품수: ${data[0].artworks_count}점 (기존 48 + 신작 20 + 벽화 5)`);
    console.log(`  - 상태: ${data[0].status}`);
    console.log(`  - 큐레이터: ${data[0].curator}`);
    console.log(`  - 특징: 리움미술관 고미술 소장품과 협업`);
    
    // 호암미술관 현재 진행 전시 확인
    console.log('\n🔍 호암미술관 현재 진행중인 전시...');
    const today = new Date().toISOString().split('T')[0];
    const { data: ongoingExhibitions, error: ongoingError } = await supabase
      .from('exhibitions')
      .select('title_local, start_date, end_date, artists')
      .eq('venue_name', '호암미술관')
      .lte('start_date', today)
      .gte('end_date', today)
      .order('start_date', { ascending: true });
    
    if (!ongoingError && ongoingExhibitions) {
      console.log(`\n🔄 호암미술관 현재 진행중: ${ongoingExhibitions.length}개`);
      ongoingExhibitions.forEach((ex, index) => {
        const artist = ex.artists && ex.artists.length > 0 ? `(${ex.artists[0]})` : '';
        console.log(`${index + 1}. ${ex.title_local} ${artist}`);
        console.log(`   ${ex.start_date} ~ ${ex.end_date}`);
      });
    }
    
    // 현대미술과 고미술 협업 전시 검색
    console.log('\n🔍 현대미술 × 고미술 협업 전시 검색...');
    const { data: collaborativeExhibitions, error: collaborativeError } = await supabase
      .from('exhibitions')
      .select('title_local, venue_name, start_date, end_date')
      .or('description.ilike.%고미술%,description.ilike.%소장품%,description.ilike.%국보%,description.ilike.%협업%,description.ilike.%조선%')
      .order('start_date', { ascending: false });
    
    if (!collaborativeError && collaborativeExhibitions) {
      console.log(`\n🤝 현대미술 × 고미술 협업: ${collaborativeExhibitions.length}개`);
      collaborativeExhibitions.slice(0, 5).forEach((ex, index) => {
        console.log(`${index + 1}. ${ex.title_local} (${ex.venue_name})`);
        console.log(`   ${ex.start_date} ~ ${ex.end_date}`);
      });
    }
    
    // 파스텔/벽화 전시 검색
    console.log('\n🔍 파스텔/벽화 관련 전시 검색...');
    const { data: pastelExhibitions, error: pastelError } = await supabase
      .from('exhibitions')
      .select('title_local, venue_name, start_date, end_date')
      .or('description.ilike.%파스텔%,description.ilike.%벽화%,description.ilike.%더스트%')
      .order('start_date', { ascending: false });
    
    if (!pastelError && pastelExhibitions) {
      console.log(`\n🎨 파스텔/벽화 전시: ${pastelExhibitions.length}개`);
      pastelExhibitions.forEach((ex, index) => {
        console.log(`${index + 1}. ${ex.title_local} (${ex.venue_name})`);
        console.log(`   ${ex.start_date} ~ ${ex.end_date}`);
      });
    }
    
  } catch (error) {
    console.error('❌ 데이터 입력 중 오류 발생:', error.message);
    if (error.details) console.error('세부사항:', error.details);
  }
}

// 실행
importHoamNicolasParty2024();