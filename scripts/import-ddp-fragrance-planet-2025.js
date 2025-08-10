const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function importDDPFragrancePlanet2025() {
  console.log('🎨 DDP 《프래그런스 위드 플래닛(FRAGRANCE WITH PLANET)》 전시 데이터 입력 시작...\n');
  
  try {
    const exhibitionData = {
      id: uuidv4(),
      
      // 기본 정보
      title_local: '프래그런스 위드 플래닛',
      title_en: 'FRAGRANCE WITH PLANET',
      subtitle: '스토리텔링 팝업 전시',
      
      // 날짜
      start_date: '2025-07-18',
      end_date: '2025-08-31',
      exhibition_type: 'popup',
      status: 'upcoming',
      
      // 장소 정보
      venue_name: 'DDP 동대문디자인플라자',
      venue_city: '서울',
      venue_country: 'KR',
      venue_address: 'B the B 다운타운 (DDP 마켓 B2)',
      
      // 운영 정보
      operating_hours: '매일 12:00-20:00',
      admission_fee: '무료',
      
      // 전시 설명
      description: `향수로 인한 멸종위기 동식물의 이야기를 담은 환경 인식 개선 전시입니다.

[전시 배경]
샌달우드, 가이악, 오우드, 로즈우드... 모두 향수로 인한 멸종위기 식물입니다.

환경 문제의 실상:
• 30년이 넘은 나무들을 뿌리째 쓰러뜨려야 우드 오일이 소량 얻어집니다
• 수액을 얻기 위한 과한 인위상해로 나무들이 말라죽고 있습니다
• 야생 허브들은 윤리적 수확비율을 지키지 않고 채취되고 있습니다
• 동물들을 죽여 향을 얻어내기도 합니다
• 세계적으로 향기에 사용되는 80,000종의 동식물 중 15,000종이 멸종위험에 처해있습니다

[전시 주제]
이 전시는 옳게, 재미있게 향을 즐기는 방법을 발견하고 탐험하는 프라포투투(Pra4tu2)의 여정을 담았습니다.

[전시 메시지]
• 향을 즐길 때 지켜야 할 책임감이 우리를 가두기보다는 크리에이티브의 원천이 될 수 있음을 보여줍니다
• 디자인이 어떻게 지속가능한 향 문화를 가능하게 하는지 제시합니다

[전시 구성]
• 멸종위기 동식물과 향료 산업의 관계 소개
• 프라포투투 브랜드의 지속가능한 향 문화 제안
• 윤리적이고 창의적인 향 즐기기 방법 탐색
• 스토리텔링을 통한 몰입형 전시 경험

[관람 포인트]
1. 향수 산업이 환경에 미치는 영향 인식
2. 지속가능한 향 문화의 가능성 발견
3. 창의적이고 윤리적인 소비 방법 탐구
4. 디자인을 통한 환경 문제 해결 사례

전시 예매: 네이버 비더비 스마트플레이스`,
      
      // 관련 정보
      official_url: 'https://naver.me/F5D1uZLi',
      
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
    console.log('🌿 주제: 지속가능한 향 문화');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

// 실행
importDDPFragrancePlanet2025();