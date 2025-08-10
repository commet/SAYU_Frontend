const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function importDDPSunriseSunlight2025() {
  console.log('🎨 DDP 《Sunrise to Sunlight》 전시 데이터 입력 시작...\n');
  
  try {
    const exhibitionData = {
      id: uuidv4(),
      
      // 기본 정보
      title_local: '선라이즈 투 선라잇',
      title_en: 'Sunrise to Sunlight',
      subtitle: '여름의 뷰티 전시',
      
      // 날짜
      start_date: '2025-08-14',
      end_date: '2025-12-31',
      exhibition_type: 'beauty',
      status: 'upcoming',
      
      // 장소 정보
      venue_name: 'DDP 동대문디자인플라자',
      venue_city: '서울',
      venue_country: 'KR',
      venue_address: 'B the B 업타운',
      
      // 전시 설명 (포스터 텍스트 기반)
      description: `여름의 태양 아래, 빛을 머금은 피부가 가장 찬란해지는 순간. 비더비의 여름은 태양처럼 투명하고, 이슬처럼 가볍습니다. 빛과 수분이 교차하는 이 계절, 피부 위에 내려앉는 섬세한 광채를 경험해보세요.

[전시 주제]
여름 시즌의 뷰티 트렌드와 피부 관리를 주제로 한 전시로, 태양과 빛, 수분이 만들어내는 건강한 피부의 아름다움을 조명합니다.

[B the B 업타운]
DDP 내 위치한 뷰티 전문 공간으로, 다양한 뷰티 브랜드와 제품을 경험할 수 있는 복합 문화 공간입니다.`,
      
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
    console.log('💄 주제: 여름 뷰티 전시');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

// 실행
importDDPSunriseSunlight2025();