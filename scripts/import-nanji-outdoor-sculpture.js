const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function importNanjiOutdoorSculpture() {
  console.log('🗿 난지미술창작스튜디오 야외조각전시 데이터 입력 시작...\n');
  
  try {
    const exhibitionData = {
      id: uuidv4(),
      
      // 기본 정보
      title_local: '야외조각전시 - 난지미술창작스튜디오',
      title_en: 'Outdoor Sculpture Exhibition - Nanji Art Studio',
      subtitle: '난지미술창작스튜디오 상설 야외전시',
      
      // 날짜 (상설 전시)
      start_date: '2010-01-01', // 정확한 시작일 확인 필요
      end_date: '2099-12-31', // 상설 전시
      exhibition_type: 'permanent',
      status: 'ongoing',
      
      // 장소 정보
      venue_name: '서울시립 난지미술창작스튜디오',
      venue_city: '서울',
      venue_country: 'KR',
      venue_address: '서울특별시 마포구 하늘공원로 108-1',
      
      // 전시 설명
      description: `서울시립 난지미술창작스튜디오 야외조각전시는 스튜디오 주변 야외 공간에 설치된 상설 조각 전시입니다. 한국 현대 조각의 주요 작가들의 작품을 자연 속에서 감상할 수 있습니다.

[주요 작품]

【Messenger】 - 조성묵 (1999)
• 크기: 147 X 135 X 142 cm
• 의자를 통한 존재와 성찰의 메타포
• 일상의 위로와 명상의 자리를 상징
• 권력과 부, 명예를 대변하는 사회적 구조 표현

【현전】 - 심문섭 (1992)
• 크기: 175 X 175 X 120 cm
• 추상적이면서도 개념적 작업
• 철의 자연스러운 시간성 표현
• 심플한 개념과 추상적 형태의 조화

【Point-Fly】 - 임동락 (2006)
• 크기: 205 X 205 X 205 cm
• 스테인리스 스틸 작품
• 구심점 중심의 유려한 형태미
• 재료 특성과 매스의 조화

【무제】 - 전국광 (1990)
• 크기: 65 X 65 X 310 cm
• 기념비적 조각 형태
• 표면 재질감의 변화
• 안정감과 위상의 표현

[전시 특징]
• 24시간 관람 가능한 야외 전시
• 한국 현대 조각의 다양성 제시
• 자연과 예술의 조화
• 무료 관람

[운영 정보]
• 상설 전시로 언제나 관람 가능
• 야외 공간이므로 날씨 영향 고려
• 난지미술창작스튜디오 방문 시 함께 관람 추천

문의: 서울시립미술관`,
      
      // 작가 정보
      artists: ['조성묵', '심문섭', '임동락', '전국광'],
      curator: '서울시립 난지미술창작스튜디오',
      
      // 작품 정보
      artworks_count: 4,
      
      // 관람 정보
      admission_fee: '무료',
      operating_hours: JSON.stringify({
        야외전시: '24시간 개방',
        스튜디오: '작가 레지던시 운영 시간에 준함'
      }),
      
      // 연락처
      contact_info: JSON.stringify({
        관람문의: '서울시립미술관'
      }),
      phone_number: '02-308-1020',
      
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
    
    console.log('✅ 난지미술창작스튜디오 야외조각전시 데이터 입력 완료!');
    console.log('\n📋 입력된 전시 정보:');
    console.log(`  - ID: ${data[0].id}`);
    console.log(`  - 제목: ${data[0].title_local}`);
    console.log(`  - 장소: ${data[0].venue_name}`);
    console.log(`  - 유형: ${data[0].exhibition_type} (상설 전시)`);
    console.log(`  - 참여 작가: ${data[0].artists.length}명`);
    console.log(`  - 작품수: ${data[0].artworks_count}점`);
    console.log(`  - 상태: ${data[0].status}`);
    
    // 야외조각전시 비교
    console.log('\n🔍 서울시립미술관 야외조각전시 현황...');
    const { data: outdoorExhibitions, error: outdoorError } = await supabase
      .from('exhibitions')
      .select('venue_name, title_local, artists, artworks_count')
      .or('title_local.ilike.%야외조각%,title_local.ilike.%outdoor%')
      .eq('exhibition_type', 'permanent');
    
    if (!outdoorError && outdoorExhibitions) {
      console.log(`\n📌 야외조각 상설전시: ${outdoorExhibitions.length}개`);
      outdoorExhibitions.forEach(ex => {
        console.log(`\n[${ex.venue_name}]`);
        console.log(`  - ${ex.title_local}`);
        console.log(`  - 작가: ${ex.artists ? ex.artists.length : 0}명`);
        console.log(`  - 작품: ${ex.artworks_count}점`);
      });
    }
    
  } catch (error) {
    console.error('❌ 데이터 입력 중 오류 발생:', error.message);
    if (error.details) console.error('세부사항:', error.details);
  }
}

// 실행
importNanjiOutdoorSculpture();