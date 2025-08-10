const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function importCraftMuseumLacquer2025() {
  console.log('🎨 서울공예박물관 《漆-옻나무에서 칠기로》 전시 데이터 입력 시작...\n');
  
  try {
    const exhibitionData = {
      id: uuidv4(),
      
      // 기본 정보
      title_local: '漆-옻나무에서 칠기로',
      title_en: 'From Lacquer Tree to Lacquerware',
      subtitle: '한국 옻칠공예의 재료와 기술의 역사',
      
      // 날짜
      start_date: '2025-06-27',
      end_date: '2025-12-31',
      exhibition_type: 'special',
      status: 'ongoing',
      
      // 장소 정보
      venue_name: '서울공예박물관',
      venue_city: '서울',
      venue_country: 'KR',
      venue_address: '서울특별시 종로구 율곡로3길 4 (안국동) 전시2동 3층 공예아카이브실',
      
      // 운영 정보
      operating_hours: '화~금 10:00-17:30',
      admission_fee: null, // 정보 미제공
      
      // 전시 설명
      description: `옻칠은 기원전 3,000여 년 전부터 인류가 오랫동안 사용해 온 공예 재료이자 기술입니다. 우리나라에서는 청동기시대의 여수 적량동 유적에서 출토된 비파형 동검에서 가장 오래된 옻칠의 흔적이 발견되었습니다. 그렇다면, 옻칠은 어디에서 비롯되었을까요? 또 어떤 과정을 거쳐 공예품을 아름답게 꾸미게 되었을까요?

서울공예박물관은 2020년부터 이 질문의 답을 찾기 위해 전국의 옻칠 생산지를 직접 찾아다니며 조사와 연구를 진행해 왔습니다. 그 결과를 바탕으로 한국 옻칠공예의 재료와 기술의 역사를 한눈에 살펴볼 수 있는 이동식 전시 상자, '옻칠공예상자'를 개발했습니다. 옻나무에서 채취한 옻칠이 칠기(漆器)로 이어지는 과정을 낱낱이 밝혀 소개합니다.

[전시 특징]
• 기원전 3,000년부터 이어진 옻칠 역사 탐구
• 청동기시대 여수 적량동 유적 출토품 소개
• 2020년부터 진행된 전국 옻칠 생산지 조사 연구 결과
• '옻칠공예상자' - 이동식 전시 상자 개발
• 옻나무에서 칠기까지의 전 과정 소개
• 한국 옻칠공예의 재료와 기술의 역사 조명

[관람 안내]
• 공예아카이브실 운영 시간: 화~금 10:00~17:30
• 공예아카이브실은 개방형 수장고 공간
• 전시실 입장 전 출입문 앞 키오스크에 정보 등록 필요`,
      
      // 전시 타입 정보
      genres: ['나무공예', '칠공예'],
      tags: ['옻칠', '칠기', '전통공예', '아카이브', '수장고'],
      
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
    console.log('📍 위치: 전시2동 3층 공예아카이브실');
    console.log('⏰ 운영시간: 화~금 10:00-17:30');
    console.log('🎨 전시소재: 나무와 칠');
    console.log('📞 대표전화: 02-6450-7000');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

// 실행
importCraftMuseumLacquer2025();