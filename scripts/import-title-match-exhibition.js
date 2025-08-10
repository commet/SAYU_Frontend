const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function importTitleMatchExhibition() {
  console.log('🥊 2025 타이틀 매치 전시 데이터 입력 시작...\n');
  
  try {
    const exhibitionData = {
      id: uuidv4(),
      
      // 기본 정보
      title_local: '장영혜중공업 vs. 홍진훤: 중간 지대는 없다',
      title_en: 'Chang Young Hae Heavy Industries vs. Hong Jinhwon: There is No Middle Ground',
      subtitle: '2025 타이틀 매치',
      
      // 날짜
      start_date: '2025-08-14',
      end_date: '2025-11-02',
      exhibition_type: 'special',
      status: 'upcoming',
      
      // 장소 정보
      venue_name: '서울시립 북서울미술관',
      venue_city: '서울',
      venue_country: 'KR',
      venue_address: '서울특별시 노원구 동일로 1238',
      
      // 전시 설명
      description: `서울시립 북서울미술관의 대표 연례전인 타이틀 매치는 2025년, 12회를 맞이하여 장영혜중공업과 홍진훤 작가를 초청한다. 전시는 사회가 끊임없이 '하나의 공동체'라는 이상을 설파하지만, 현실은 복잡한 이해관계들이 충돌하며 분열된 채 작동한다는 문제의식으로부터 시작한다.

[전시 정보]
• 장소: 1층 전시실 1, 2 / 2층 전시실 3, 4
• 작품수: 13점
• 장르: 사진, 영상, 책
• 관람료: 무료

[도슨트 프로그램]
• 기간: 8월 15일 ~ 11월 2일
• 시간: 매일 오전 11시, 오후 3시
• 추석 연휴(10.6-10.8) 제외

[연계 강연]
• 제목: 예술, 정치, 민주주의 – 일상을 통한 연결
• 강연자: 허경(철학학교 혜윰)
• 일시: 2025년 8월 14일(목) 오후 2시 – 4시
• 장소: 다목적홀

[운영 시간]
• 평일(화-금): 10:00-20:00
• 주말: 10:00-19:00 (하절기) / 10:00-18:00 (동절기)
• 금요일 문화의 밤: 10:00-21:00
• 휴관일: 매주 월요일, 1월 1일

[후원]
• 주최: 서울시립미술관
• 후원: 에르메스 코리아
• 협찬: 가제트네트웍스, LG 프로빔, 삼화페인트, 네오룩, 새로움아이, 복순도가

문의: 유은순 02-2124-5268`,
      
      // 작가 정보
      artists: ['장영혜중공업', '홍진훤'],
      curator: '서울시립 북서울미술관',
      
      // 작품 정보
      artworks_count: 13,
      
      // 관람 정보
      admission_fee: '무료',
      operating_hours: JSON.stringify({
        평일: '10:00-20:00 (화-금)',
        주말: '10:00-19:00 (하절기) / 10:00-18:00 (동절기)',
        문화의밤: '10:00-21:00 (금)',
        휴관일: '월요일, 1월 1일'
      }),
      
      // 연락처
      contact_info: JSON.stringify({
        전시문의: '유은순 02-2124-5268',
        관람문의: '안내데스크 02-2124-5248,5249'
      }),
      phone_number: '02-2124-5248',
      
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
    
    console.log('✅ 타이틀 매치 전시 데이터 입력 완료!');
    console.log('\n📋 입력된 전시 정보:');
    console.log(`  - ID: ${data[0].id}`);
    console.log(`  - 제목: ${data[0].title_local}`);
    console.log(`  - 작가: ${data[0].artists.join(', ')}`);
    console.log(`  - 장소: ${data[0].venue_name}`);
    console.log(`  - 기간: ${data[0].start_date} ~ ${data[0].end_date}`);
    console.log(`  - 상태: ${data[0].status}`);
    
  } catch (error) {
    console.error('❌ 데이터 입력 중 오류 발생:', error.message);
    if (error.details) console.error('세부사항:', error.details);
  }
}

// 실행
importTitleMatchExhibition();