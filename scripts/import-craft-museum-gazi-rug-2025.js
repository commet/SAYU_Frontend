const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function importCraftMuseumGaziRug2025() {
  console.log('🎨 서울공예박물관 《공예동행@쇼윈도 #3. 가지가지 러그》 전시 데이터 입력 시작...\n');
  
  try {
    const exhibitionData = {
      id: uuidv4(),
      
      // 기본 정보
      title_local: '공예동행@쇼윈도 #3. 가지가지 러그',
      title_en: 'GAZI GAZI RUG',
      subtitle: '시민소통공예프로젝트',
      
      // 날짜
      start_date: '2025-07-23',
      end_date: '2025-09-07',
      exhibition_type: 'special',
      status: 'upcoming',
      
      // 장소 정보
      venue_name: '서울공예박물관',
      venue_city: '서울',
      venue_country: 'KR',
      venue_address: '서울특별시 종로구 율곡로3길 4 (안국동) 전시3동, 기타장소',
      
      // 전시 설명
      description: `본 전시는 39세 이하 공예작가들을 대상으로 작품을 공모, 선정하는 서울공예박물관 2025년 '시민소통 공예프로그램' 선정작입니다.

《가지가지 러그》는 사용자가 러그의 모듈을 자유롭게 배치하고 조합함으로써 매번 새로운 형태와 의미를 창출하는 작품입니다. 이러한 상호작용은 공예가 지닌 전통적인 경계와 구조를 허물며, 창의적이고 유동적인 사용감을 탐색하게 합니다. 지속가능한 소재와 형태의 유연성을 기반으로 하는 《가지가지 러그》는 공간과 일상에 독창적이면서도 기능적인 예술의 가치를 더합니다.

[전시 특징]
• 39세 이하 공예작가 대상 공모 선정작
• 2025년 시민소통 공예프로그램 일환
• 모듈형 러그 디자인
• 사용자 참여형 작품
• 지속가능한 소재 활용
• 전통과 현대의 경계를 넘나드는 섬유공예`,
      
      // 아티스트 정보
      artists: ['이민영'],
      
      // 전시 타입 정보
      genres: ['섬유공예'],
      tags: ['시민소통', '공예프로젝트', '쇼윈도', '러그', '섬유'],
      
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
    console.log('📍 주소:', '서울특별시 종로구 율곡로3길 4');
    console.log('🎨 참여작가: 이민영');
    console.log('🧵 전시소재: 섬유');
    console.log('📞 대표전화: 02-6450-7000');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

// 실행
importCraftMuseumGaziRug2025();