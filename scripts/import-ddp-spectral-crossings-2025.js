const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function importDDPSpectralCrossings2025() {
  console.log('🎨 DDP 《스펙트럴 크로싱스 | Spectral Crossings》 전시 데이터 입력 시작...\n');
  
  try {
    const exhibitionData = {
      id: uuidv4(),
      
      // 기본 정보
      title_local: '스펙트럴 크로싱스',
      title_en: 'Spectral Crossings',
      subtitle: '몰입형 미디어 설치 전시',
      
      // 날짜
      start_date: '2025-08-14',
      end_date: '2025-11-16',
      exhibition_type: 'media_art',
      status: 'upcoming',
      
      // 장소 정보
      venue_name: 'DDP 동대문디자인플라자',
      venue_city: '서울',
      venue_country: 'KR',
      venue_address: 'DDP 디자인랩 3층',
      
      // 운영 정보
      operating_hours: '10:00-20:00',
      admission_fee: '무료',
      
      // 전시 설명
      description: `144개의 크리스탈을 따라 반짝이는 감정의 빛, 그 안에서 펼쳐지는 낯설고 아름다운 몰입 '스펙트럴 크로싱스'

스펙트럴 크로싱스(Spectral Crossings)는 AI가 만든 얼굴과 형체 없는 감정의 흐름이 빛을 따라 움직이며 관객과 교차해 만나는 순간을 담아낸 미디어아트 전시입니다. 보이지 않던 감정이 찰나의 빛 속에서 모습을 드러냅니다.

[전시 내용]
처음 마주하는 장면은 AI가 빚어낸 '존재하지 않는 얼굴'들입니다. 그 얼굴들은 특정 누구의 것은 아니지만, 관객은 그 표정 속에서 일상 속에서 마주하며 마음을 흔들던 수많은 삶의 감정의 흔적을 발견하게 됩니다.

AI를 통해 수많은 얼굴과 감정 데이터를 토대로 보편적인 감정의 형상을 추출했습니다. 그래서 이 얼굴들은 낯설면서도, 저마다 익숙한 감정과 공감을 불러일으킵니다. 빛으로 새겨진 얼굴들은 해체되었다가 하나의 빛의 구름으로 다시 융합됩니다. 그 빛은 더 이상 개인의 것이 아니라, 타인과 연결되고자 하는 감정의 에너지로 확장됩니다.

이 감정의 에너지는 공간 속 144개의 크리스탈로 전달되며, 각각의 크리스탈은 서로 다른 움직임으로 파동을 만들어냅니다. 이를 통해 감정의 빛이 현실 공간에 물리적으로 드러나는 순간이 연출됩니다. 빛과 움직임으로 가득 찬 이 공간 속에서 관객은 단순한 관람자가 아니라, 타인의 감정 속에서 자신의 내면을 비추게 됩니다.

[전시 특징]

POINT 1. 아나몰픽 미디어아트 (Anamorphic Media Art)
암전 속 공간을 가로지르는 빛이 아나몰픽 스크린을 터치하고 이와 동기된 AI 데이터와 사운드가 입체적 제너레이티브 아트로 표현되어 현실과 가상을 이어줍니다.

POINT 2. 움직이는 크리스탈 조형물 (Kinetic Crystal)
빛이 바다의 파도처럼 역동적으로 움직이는 크리스탈들을 비추어 보석 같이 반짝이는 윤슬을 그려내며 공간을 채웁니다.

[전시 메시지]
스펙트럴 크로싱스(Spectral Crossings)는 묻습니다.
감정은 한 사람의 마음속에만 머무는 것일까요?
아니면 파도처럼 번져, 다른 누군가의 마음에도 스며들 수 있는 걸까요?

[오프닝 행사]
• 일시: 2025년 8월 22일 18시 30분
• 장소: 디자인홀

[아트웍 워크숍]
• 일시: 2025년 10월 17일(금) 18:00~19:00
• 장소: DDP 디자인랩 3층 디자인홀
• 작가: 더 스웨이`,
      
      // 아티스트 정보
      artists: ['THE SWAY (더 스웨이)'],
      curator: '더 스웨이',
      
      // 관련 URL
      official_url: 'http://www.the-sway.com/',
      
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
    console.log('🎨 아티스트: THE SWAY (더 스웨이)');
    console.log('💎 특징: 144개 크리스탈, AI 얼굴, 아나몰픽 미디어아트');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

// 실행
importDDPSpectralCrossings2025();