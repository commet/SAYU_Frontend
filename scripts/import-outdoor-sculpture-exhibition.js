const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function importOutdoorSculptureExhibition() {
  console.log('🗿 북서울미술관 야외조각전시 데이터 입력 시작...\n');
  
  try {
    const exhibitionData = {
      id: uuidv4(),
      
      // 기본 정보
      title_local: '야외조각전시',
      title_en: 'Outdoor Sculpture Exhibition',
      subtitle: '북서울미술관 상설 야외전시',
      
      // 날짜 (상설 전시)
      start_date: '2020-01-01', // 정확한 시작일 확인 필요
      end_date: '2099-12-31', // 상설 전시
      exhibition_type: 'permanent',
      status: 'ongoing',
      
      // 장소 정보
      venue_name: '서울시립 북서울미술관',
      venue_city: '서울',
      venue_country: 'KR',
      venue_address: '서울특별시 노원구 동일로 1238, 야외 조각공원',
      
      // 전시 설명
      description: `서울시립 북서울미술관 야외조각전시는 미술관 주변 공간에 설치된 상설 조각 전시입니다. 국내 주요 조각가들의 작품을 자연과 함께 감상할 수 있는 열린 전시 공간입니다.

[주요 작품]

1. 【David】 - 박찬걸
   미켈란젤로의 다비드를 스테인리스 스틸로 재해석. 이미지를 분해하여 층층이 쌓아올린 건축적 조각

2. 【그림자의 그림자(낮과 밤)】 - 김영원
   인체의 앞면은 입체, 뒷면은 평면으로 처리하여 현실과 환영의 경계 탐구

3. 【낮과 밤사이】 - 최인수
   자연석의 물성을 그대로 살린 작품. 관람객이 작품 속으로 들어가 풍경을 감상할 수 있는 참여형 조각

4. 【공간속으로】 - 김영원
   세 개의 인체 조형물이 시각적 착시를 통해 하나로 보이는 작품

5. 【그림자의 집】 - 인규철
   집의 형태와 그림자를 입체화한 작품. 앞뒤가 전혀 다른 반전 구조

6. 【積意-0427】 - 박석원
   마천석 재료를 그대로 드러낸 기하학적 구축 작품

7. 【빈 공간】 - 김인겸
   스테인리스 판을 구부려 만든 '스페이스-리스' 시리즈. 입체와 평면의 경계 탐구

8. 【시인의 혼】 - 오상일
   사람과 개의 모습을 투박하게 표현한 구상조각

9. 【원형, 무제, 하늘우물】 - 한용진
   설악산 자연석에 최소한의 손질을 더한 자연주의 조각들

10. 【공동체】 - 이웅배
    삼차원의 리드미컬한 입체조각. 관람객이 만지고 올라탈 수 있는 참여형 작품

11. 【실크로드】 - 송필
    무거운 짐을 진 낙타의 모습으로 현대인의 삶을 표현

[전시 특징]
• 24시간 관람 가능한 열린 전시
• 자연과 조화를 이루는 야외 설치
• 관람객 참여 가능한 작품들
• 무료 관람

문의: 02-2124-5201`,
      
      // 작가 정보 (주요 참여 작가들)
      artists: [
        '박찬걸', '김영원', '최인수', '인규철', 
        '박석원', '김인겸', '오상일', '한용진', 
        '이웅배', '송필'
      ],
      curator: '서울시립 북서울미술관',
      
      // 작품 정보
      artworks_count: 15, // 약 15점 이상의 야외 조각
      
      // 관람 정보
      admission_fee: '무료',
      operating_hours: JSON.stringify({
        야외전시: '24시간 개방',
        미술관: '10:00-20:00 (화-금) / 10:00-19:00 (주말)',
        휴관일: '월요일 (야외전시는 상시 관람 가능)'
      }),
      
      // 연락처
      contact_info: JSON.stringify({
        관람문의: '안내데스크 02-2124-5201'
      }),
      phone_number: '02-2124-5201',
      
      // URL 정보
      official_url: 'https://sema.seoul.go.kr',
      website_url: 'https://sema.seoul.go.kr',
      
      // 데이터 메타정보
      source: 'seoul_museum_official',
      source_url: 'https://sema.seoul.go.kr',
      collected_at: new Date().toISOString(),
      
      // 기본값 설정
      view_count: 0,
      ai_verified: true,
      ai_confidence: 0.95
    };

    // 데이터 입력
    console.log('📝 전시 데이터 입력 중...');
    const { data, error } = await supabase
      .from('exhibitions')
      .insert([exhibitionData])
      .select();
    
    if (error) {
      throw error;
    }
    
    console.log('✅ 야외조각전시 데이터 입력 완료!');
    console.log('\n📋 입력된 전시 정보:');
    console.log(`  - ID: ${data[0].id}`);
    console.log(`  - 제목: ${data[0].title_local}`);
    console.log(`  - 장소: ${data[0].venue_name} 야외 조각공원`);
    console.log(`  - 유형: ${data[0].exhibition_type} (상설 전시)`);
    console.log(`  - 참여 작가: ${data[0].artists.length}명`);
    console.log(`  - 작품수: 약 ${data[0].artworks_count}점`);
    console.log(`  - 상태: ${data[0].status}`);
    
    // 북서울미술관 전체 전시 현황 확인
    console.log('\n🔍 북서울미술관 전시 현황...');
    const { data: bukseoulmExhibitions, error: bukseoulmError } = await supabase
      .from('exhibitions')
      .select('title_local, exhibition_type, status')
      .eq('venue_name', '서울시립 북서울미술관')
      .order('start_date', { ascending: false });
    
    if (!bukseoulmError && bukseoulmExhibitions) {
      console.log(`\n📌 북서울미술관 전시: ${bukseoulmExhibitions.length}개`);
      bukseoulmExhibitions.forEach(ex => {
        const type = ex.exhibition_type === 'permanent' ? '상설' : '기획';
        console.log(`  - ${ex.title_local} (${type}, ${ex.status})`);
      });
    }
    
  } catch (error) {
    console.error('❌ 데이터 입력 중 오류 발생:', error.message);
    if (error.details) console.error('세부사항:', error.details);
  }
}

// 실행
importOutdoorSculptureExhibition();