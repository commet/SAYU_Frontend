const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function importDDPBluehouse2025() {
  console.log('🎨 DDP 《블루하우스 : 이야기가 시작되는 곳》 전시 데이터 입력 시작...\n');
  
  try {
    const exhibitionData = {
      id: uuidv4(),
      
      // 기본 정보
      title_local: '블루하우스 : 이야기가 시작되는 곳',
      title_en: 'Blue House : Where Stories Begin',
      subtitle: null,
      
      // 날짜
      start_date: '2025-08-08',
      end_date: '2025-08-17',
      exhibition_type: 'special',
      status: 'upcoming',
      
      // 장소 정보
      venue_name: 'DDP 동대문디자인플라자',
      venue_city: '서울',
      venue_country: 'KR',
      venue_address: '디자인랩 3층',
      
      // 운영 정보
      operating_hours: '10:00-18:50 (17:30 입장마감)',
      admission_fee: null, // 이미지 파일로 제공되어 정확한 정보 없음
      
      // 전시 설명
      description: '블루하우스 전시는 이야기가 시작되는 공간을 주제로 한 특별 전시입니다.',
      
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
    console.log('\n⚠️ 관람료 정보는 이미지 파일로 제공되어 추후 업데이트 필요');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

// 실행
importDDPBluehouse2025();