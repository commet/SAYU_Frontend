const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function importCraftMuseumMaterialPractice2025() {
  console.log('🎨 서울공예박물관 《물질-실천》 전시 데이터 입력 시작...\n');
  
  try {
    const exhibitionData = {
      id: uuidv4(),
      
      // 기본 정보
      title_local: '물질-실천',
      title_en: 'Material-Practice',
      subtitle: '현대공예 특별기획전',
      
      // 날짜
      start_date: '2025-08-26',
      end_date: '2025-11-23',
      exhibition_type: 'special',
      status: 'upcoming',
      
      // 장소 정보
      venue_name: '서울공예박물관',
      venue_city: '서울',
      venue_country: 'KR',
      venue_address: '서울특별시 종로구 율곡로3길 4 (안국동) 전시1동 3층 기획전시실',
      
      // 전시 설명
      description: `서울공예박물관은 오늘날 '공예-기술'이 내포한 가치를 동시대의 물질을 통해 드러내는 제작자들의 작업을 소개하는 《물질-실천》전을 개최합니다.

물질은 단순한 자원이 아닌, 고유한 개성으로 창작 행위를 유도하고 반응을 끌어내는 힘을 갖습니다.

이번 전시에 소개되는 작가들은 '버려지는 것들'을 재료로 환원하고, '자연의 순환 시스템'에 기댄 제작방식을 실험하며, '물질과 정보'의 호환성을 모색합니다.

물질을 다루는 방식과 태도에서 공예의 미래적 실천을 감지해보는 이번 전시는 공예기술이 단지 손기술에 머무르지 않고, 세계와 조응하는 창작의 감각이자 비판적 실천으로 확장되고 있음을 보여줍니다.

[전시 구성]
1. 재의 재구성
   - 버려진 물질의 재활용과 새로운 가치 창출

2. 원시적 창조
   - 자연의 순환 시스템을 활용한 제작 방식

3. 유동하는 물질
   - 물질과 정보의 호환성 탐구

[전시 특징]
• 동시대 공예의 미래적 가능성 탐구
• 폐기물을 재료로 활용하는 지속가능한 공예
• 자연 순환 시스템 기반의 제작 방식 실험
• 물질과 정보(데이터)의 융합
• 공예기술의 확장된 의미와 실천
• 세계와 조응하는 창작의 감각
• 비판적 실천으로서의 현대공예

이번 전시를 통해 동시대 공예와 미래적 가능성을 함께 탐험해보시기 바랍니다.`,
      
      // 전시 타입 정보
      genres: ['현대공예', '도자', '금속', '섬유', '가죽', '복합매체'],
      tags: ['현대공예', '폐기물', '자연', '데이터', '지속가능성', '순환시스템', '물질성'],
      
      // 연락처 정보
      contact_info: '대표전화: 02-6450-7000',
      phone_number: '02-6450-7000',
      
      // 메타데이터
      source: 'seoul_craft_museum',
      source_url: 'https://craftmuseum.seoul.go.kr',
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
    console.log('📍 위치: 전시1동 3층 기획전시실');
    console.log('🎨 전시소재: 도자, 금속, 섬유, 가죽과 털, 그 밖에 모든 것');
    console.log('🔑 키워드: 현대공예, 폐기물, 자연, 데이터');
    console.log('📞 대표전화: 02-6450-7000');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

// 실행
importCraftMuseumMaterialPractice2025();