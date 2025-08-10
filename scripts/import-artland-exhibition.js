const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function importArtlandExhibition() {
  console.log('🎨 서도호와 아이들: 아트랜드 상설전 데이터 입력 시작...\n');
  
  try {
    const exhibitionData = {
      id: uuidv4(),
      
      // 기본 정보
      title_local: '서도호와 아이들: 아트랜드',
      title_en: 'Do Ho Suh and Children: Artland',
      subtitle: '상설전',
      
      // 날짜 (장기 전시)
      start_date: '2023-05-02',
      end_date: '2025-12-31',
      exhibition_type: 'permanent',
      status: 'ongoing',
      
      // 장소 정보
      venue_name: '서울시립 북서울미술관',
      venue_city: '서울',
      venue_country: 'KR',
      venue_address: '서울특별시 노원구 동일로 1238, 1층 하트탱크',
      
      // 전시 설명
      description: `2022년 7월 26일부터 2023년 3월 12일까지 서울시립 북서울미술관은 관람객 참여형 어린이 전시《서도호와 아이들: 아트랜드》를 개최했습니다. 이를 통해 약 14,000명의 어린이들이 만든 61개의 섬으로 이어진 거대한 아트랜드가 탄생하였습니다.

아트랜드의 시작은 약 8년 전으로 거슬러 올라갑니다. 서도호 작가와 그의 두 아이들은 집에서 어린이용 점토를 사용해 다양한 동식물이 사는 복잡하고 환상적인 생태계 '아트랜드'를 만들었습니다. 이러한 아트랜드의 섬들 중 하나가 북서울미술관으로 옮겨져, 미술관을 방문했던 아이들이 새로운 섬들을 하나씩 추가했습니다.

[전시 특징]
• 관람객 참여형 전시
• 14,000명의 어린이들이 참여
• 61개의 섬으로 구성된 아트랜드
• 조각형 설치 작품

[전시 정보]
• 장소: 1층 하트탱크
• 관람료: 무료
• 장르: 조각형 설치, 관람객 참여형

※ 클레이 점토 프로그램은 종료되었지만, 기존 작품은 계속 관람 가능합니다.

[운영 시간]
• 평일(화-금): 10:00-20:00
• 주말: 10:00-19:00 (하절기) / 10:00-18:00 (동절기)
• 금요일 문화의 밤: 10:00-21:00
• 휴관일: 매주 월요일, 1월 1일

[협찬]
• 주최: 서울시립미술관
• 협찬: 대한산업주식회사

문의: 이진 02-2124-5269`,
      
      // 작가 정보
      artists: ['서도호', '어린이 참여자 14,000명'],
      curator: '서울시립 북서울미술관',
      
      // 작품 정보
      artworks_count: 61, // 61개의 섬
      
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
        전시문의: '이진 02-2124-5269',
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
    
    console.log('✅ 아트랜드 상설전 데이터 입력 완료!');
    console.log('\n📋 입력된 전시 정보:');
    console.log(`  - ID: ${data[0].id}`);
    console.log(`  - 제목: ${data[0].title_local}`);
    console.log(`  - 작가: 서도호와 어린이들`);
    console.log(`  - 장소: ${data[0].venue_name}`);
    console.log(`  - 기간: ${data[0].start_date} ~ ${data[0].end_date}`);
    console.log(`  - 참여: 14,000명의 어린이`);
    console.log(`  - 작품: ${data[0].artworks_count}개의 섬`);
    console.log(`  - 상태: ${data[0].status}`);
    
  } catch (error) {
    console.error('❌ 데이터 입력 중 오류 발생:', error.message);
    if (error.details) console.error('세부사항:', error.details);
  }
}

// 실행
importArtlandExhibition();