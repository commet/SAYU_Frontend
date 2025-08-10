const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function importHangaramMuseumTherapy2025() {
  console.log('🎨 한가람디자인미술관 《뮤지엄 테라피 : 칠(漆) 유어 소울》 전시 데이터 입력 시작...\n');
  
  try {
    const exhibitionData = {
      id: uuidv4(),
      
      // 기본 정보
      title_local: '뮤지엄 테라피 : 칠(漆) 유어 소울',
      title_en: 'Museum Therapy : Chill Your Soul',
      subtitle: '예술을 통한 마음의 치유',
      
      // 날짜
      start_date: '2025-06-28',
      end_date: '2025-08-10',
      exhibition_type: 'special',
      status: 'upcoming',
      
      // 장소 정보
      venue_name: '한가람디자인미술관',
      venue_city: '서울',
      venue_country: 'KR',
      venue_address: '서울특별시 서초구 남부순환로 2406 한가람디자인미술관 제1전시실, 제2전시실',
      
      // 운영 정보
      operating_hours: '10:00-19:00 (매주 월요일 휴관, 18:00 입장마감)',
      admission_fee: '성인 10,000원 / 청소년 8,000원 / 어린이 6,000원 (단체 20% 할인)',
      
      // 전시 설명
      description: `[전시 소개]
《뮤지엄 테라피 : 칠(漆) 유어 소울》은 현대인의 지친 마음을 예술로 치유하는 특별한 전시입니다.

'칠(漆)'은 옻칠을 의미하는 동시에 'Chill(휴식, 진정)'의 의미를 담고 있습니다. 이 전시는 전통 옻칠 공예부터 현대 미술까지 다양한 작품을 통해 관람객에게 마음의 안정과 영감을 선사합니다.

[전시 특징]
• 힐링과 테라피를 주제로 한 예술 전시
• 전통 옻칠 공예와 현대 예술의 만남
• 달항아리 등 한국 전통 미술 작품
• 명상과 영감을 주는 작품 구성
• 관람객 참여형 체험 프로그램

[주요 섹션]
01. 마음의 쉼터
   - 현대인의 스트레스를 위로하는 작품들
   - 명상적 분위기의 설치 작품

02. 전통의 숨결
   - 옻칠 공예의 아름다움
   - 달항아리 등 전통 도자 작품
   
03. 현대적 해석
   - 전통을 현대적으로 재해석한 작품들
   - 미디어 아트와 전통의 융합

04. 참여 공간
   - 관람객이 직접 참여하는 체험 존
   - 아트 테라피 프로그램

[관람 포인트]
• 일상의 피로를 잊고 예술 속에서 휴식을 찾는 시간
• 전통과 현대가 어우러진 독특한 큐레이션
• 마음의 평안을 찾는 명상적 관람 경험
• 예술을 통한 정신적 치유와 회복

[프로그램]
• 아트 테라피 워크숍
• 큐레이터 토크
• 명상 프로그램
• 가족 체험 프로그램

이 전시는 바쁜 일상 속에서 잠시 멈춰 서서 자신을 돌아보고, 예술을 통해 마음의 평화를 찾는 특별한 경험을 제공합니다.`,
      
      // 태그 정보
      tags: ['힐링', '테라피', '현대예술', '달항아리', '명상', '영감', '옻칠', '전통공예'],
      
      // 연락처 정보
      contact_info: '문의: 1668-1352',
      phone_number: '1668-1352',
      
      // 메타데이터
      source: 'seoul_arts_center',
      source_url: 'https://www.sac.or.kr',
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
    console.log('🏛️ 장소:', exhibitionData.venue_name);
    console.log('⏰ 운영시간:', exhibitionData.operating_hours);
    console.log('💰 입장료:', exhibitionData.admission_fee);
    console.log('🎨 주최: 사단법인아시아태평양공동체, 와린디앤씨, 팔라스파트너스');
    console.log('💆 테마: 힐링, 테라피, 명상');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

// 실행
importHangaramMuseumTherapy2025();