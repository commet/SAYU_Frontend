const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function importDDPDesignArt2025() {
  console.log('🎨 DDP 《2025 DDP 디자인&아트》 전시 데이터 입력 시작...\n');
  
  try {
    const exhibitionData = {
      id: uuidv4(),
      
      // 기본 정보
      title_local: '2025 DDP 디자인&아트',
      title_en: '2025 DDP Design&Art',
      subtitle: 'Movement & Senses, 움직임이 만드는 감각의 순간들',
      
      // 날짜
      start_date: '2025-08-28',
      end_date: '2025-09-14',
      exhibition_type: 'public_art',
      status: 'upcoming',
      
      // 장소 정보
      venue_name: 'DDP 동대문디자인플라자',
      venue_city: '서울',
      venue_country: 'KR',
      venue_address: 'DDP팔거리 및 야외공간',
      
      // 운영 정보
      operating_hours: '10:00-22:00',
      admission_fee: '무료',
      
      // 전시 설명
      description: `DDP 디자인&아트는 도시의 일상 속에서, 감각과 생각이 잠시 머무를 수 있는 시간을 디자인과 예술을 통해 제안하고 그 즐거움을 시민들과 공유합니다. 2023년부터 시작된 디자인&아트는 디자인, 예술, 기술이 어우러진 융복합 콘텐츠를 통해 새로운 문화 경험을 제시하며, 누구나 쉽게 접근할 수 있는 열린 콘텐츠를 통해 예술과 도시, 시민을 연결하는 공공 디자인을 지향합니다.

[2025년 주제: 움직임]
2025년에는 '움직임'을 주제로, 관람자의 감각을 일깨우고 상상을 자극하는 체험형 설치작품 두 점을 선보입니다. 프랑스의 키네틱 아티스트 뱅상 르로이(Vincent Leroy)와 호주의 인터랙티브 아트 스튜디오 ENESS는 각기 다른 방식으로 움직임을 조형화하며, 도시 공간 속 예술의 작동 방식을 새롭게 제안합니다.

[작품 1: Vincent Leroy - Molecular Cloud]
"DDP를 비추는 핑크빛 꿈의 구름"
• 도시의 풍경을 담은 키네틱아트
• 유기적 구조의 핑크빛 풍선이 끊임없이 부유하며 도시의 리듬을 따라 움직임
• DDP 공간과 어우러져 관람객의 감각을 자극하고, 순간적인 몰입과 사색의 경험 제공
• 관람자의 위치와 시선에 따라 전혀 다른 장면을 보여주는 변화하는 풍경
• 단지 '보는 것'이 아니라, 자신만의 사유를 투영하며 완성하는 작품

[작품 2: ENESS - Pool Teacher]
"감각을 깨우는 유쾌한 상상"
• 유쾌한 감각과 움직임의 인터랙티브 벌룬
• 움직임에 반응해 빛과 소리, 물줄기로 대답하는 인터랙티브 벌룬 조형물
• 관람객이 직접 참여하며 완성하는 감각적 놀이이자 예술의 무대
• 유머와 감성이 더해진 퍼블릭 아트
• 창의적 삶의 실천에 대한 메시지이자 퍼포먼스
• DDP 건축에 입체적으로 배치되어 유쾌하고 생동감 있는 장면 연출

[작가 소개]

Vincent Leroy (프랑스)
"기계적 움직임과 유기적 조형을 결합하는 키네틱 아티스트"
• 프랑스 출신의 아티스트이자 엔지니어 출신 설치 작가
• 기계적 움직임과 유기적 형태를 결합한 조형을 통해 '사유하는 움직임' 창조
• 자연과 기술, 속도와 느림, 감성과 구조 사이의 경계를 흐리는 작업
• 전 세계 도시 공간 속에 명상적 풍경을 다양하게 선보임
• www.vincentleroy.com

ENESS (호주)
"유쾌한 감각과 움직임의 상호작용을 설계하는 인터랙티브 아트 스튜디오"
• 호주 멜버른 기반 활동
• 기술, 예술, 유머를 결합해 관람객의 몸과 감각이 반응하는 조형적 경험 제안
• 개성 있는 캐릭터 구조물, 반응하는 빛과 사운드, 시나리오적 움직임 활용
• 관람객이 '직접 완성하는' 감각의 공간 구성
• 조형·기술·놀이가 융합된 체험형 설치로 다채로운 풍경 창조
• www.eness.com`,
      
      // 아티스트 정보
      artists: ['Vincent Leroy', 'ENESS'],
      artworks_count: 2,
      
      // 연락처 정보
      contact_info: '전시팀 02-2153-0062',
      
      // 메타데이터
      source: 'ddp_official',
      source_url: 'https://www.ddp.or.kr',
      collected_at: new Date().toISOString(),
      ai_verified: false,
      ai_confidence: 0,
      view_count: 0
    };

    // 데이터 삽입
    const { data, error } = await supabase
      .from('exhibitions')
      .insert([exhibitionData])
      .select();

    if (error) {
      console.error('❌ 전시 데이터 삽입 실패:', error);
      return;
    }

    console.log('✅ 전시 데이터 성공적으로 추가됨!');
    console.log('📍 전시명:', exhibitionData.title_local);
    console.log('📅 전시 기간:', exhibitionData.start_date, '~', exhibitionData.end_date);
    console.log('🏛️ 장소:', exhibitionData.venue_address);
    console.log('⏰ 운영시간:', exhibitionData.operating_hours);
    console.log('💰 관람료: 무료');
    console.log('🎨 참여 작가: Vincent Leroy (프랑스), ENESS (호주)');
    console.log('🏢 주최: 서울디자인재단');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

// 실행
importDDPDesignArt2025();