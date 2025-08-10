const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function importDDPDesignShowwindow2024() {
  console.log('🎨 DDP 《디자인 쇼윈도: 2024 ddp 디자인론칭페어》 전시 데이터 입력 시작...\n');
  
  try {
    const exhibitionData = {
      id: uuidv4(),
      
      // 기본 정보
      title_local: 'DDP 디자인 쇼윈도: 2024 ddp 디자인론칭페어',
      title_en: 'DDP Design Showwindow: 2024 ddp Design Launching Fair',
      subtitle: '디자이너와 제조기업의 시너지를 보여주는 디자인 쇼윈도',
      
      // 날짜
      start_date: '2024-12-18',
      end_date: '2025-11-30',
      exhibition_type: 'design',
      status: 'ongoing',
      
      // 장소 정보
      venue_name: 'DDP 동대문디자인플라자',
      venue_city: '서울',
      venue_country: 'KR',
      venue_address: '동대문역사문화공원역 1번 출구 옆',
      
      // 운영 정보
      operating_hours: '24시간 (쇼윈도 내부 출입 불가)',
      admission_fee: '무료',
      
      // 전시 설명
      description: `DDP 디자인 쇼윈도는 서울디자인재단과 협력한 디자인&디자이너를 보여주기 위한 공간입니다.

[전시 개요]
두 번째 주제는 올해로 6회를 맞는 《ddp 디자인론칭페어》로, 디자이너의 새로운 아이디어와 제조기업의 똑똑한 노하우가 만나 시너지를 내는 디자인신제품 개발 사업입니다.

[전시 컨셉: 확장]
이번 쇼윈도 공간은 디자이너와 제조기업이 만나 발산되는 시너지와 무한한 가능성을 "확장"이라는 키워드로 표현했습니다.

[관람 포인트]
• 베스트디자인 수상작 전시
• 디자이너와 제조기업의 협업 결과물
• 디자인 신제품 개발 사례
• 24시간 관람 가능한 야외 쇼윈도

[DDP 디자인 쇼윈도 프로그램]
서울디자인재단과 협력하여 운영되는 DDP 디자인 쇼윈도는 디자인과 디자이너를 소개하는 상설 전시 공간으로, 다양한 주제의 디자인 전시를 선보이고 있습니다.

※ 쇼윈도 외부에서만 관람 가능하며, 내부 출입은 불가합니다.`,
      
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
    console.log('⏰ 운영시간: 24시간');
    console.log('💰 관람료: 무료');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

// 실행
importDDPDesignShowwindow2024();