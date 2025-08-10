const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function importHangaramDAFSummerFestival2025() {
  console.log('🎨 한가람미술관 《디자인아트페어 썸머페스티벌》 전시 데이터 입력 시작...\n');
  
  try {
    const exhibitionData = {
      id: uuidv4(),
      
      // 기본 정보
      title_local: '디자인아트페어 썸머페스티벌',
      title_en: 'Design Art Fair Summer Festival',
      subtitle: '예술의전당에서 열리는 여름 디자인아트페어',
      
      // 날짜
      start_date: '2025-08-23',
      end_date: '2025-08-31',
      exhibition_type: 'fair',
      status: 'upcoming',
      
      // 장소 정보
      venue_name: '한가람미술관',
      venue_city: '서울',
      venue_country: 'KR',
      venue_address: '서울특별시 서초구 남부순환로 2406 한가람미술관 제7전시실',
      
      // 운영 정보
      operating_hours: '10:00-19:00 (매주 월요일 휴관, 18:30 입장마감)',
      admission_fee: '무료',
      
      // 전시 설명
      description: `[전시 소개]
국내 최고의 복합예술공간 예술의전당에서 펼쳐지는 특별한 디자인아트페어!

명실상부한 국내 대표 예술기관으로 상징되는 예술의전당은 공연·전시·놀이·교육·저수·연구 등 6가지 형태가 다양한 예술을 접근할 여건, 가치의 전문 공간에서 보편되어 컸션한 독자성과 연계성을 유지하되 독 위야 아는 공연을 보러 온 관객 또한 전시를 같이 관람할 수 있는 장점이 있는 국내 최고의 복합예술공간입니다.

[DAF 2025 SUMMER FESTIVAL 소개]
이번 썸머페스티벌은 예술의전당의 가장 성수기인 8월에 개최됩니다.
예술의전당에서 4개(뮤지컬, 브라움스, 사월전, 커셔턴 번하드전 등)의 블록버스터 전시가 개최되고,
여름 휴가철, 귀성, 드리머 등이 얻리께 되므로 2만명 이상의 관람객이 예상됩니다.

[예술의전당에서 얻리는 아트페어]

Section 1: 다양한 분야의 작가들과 함께하는 전시
DAF는 예술의전당에서 각 분야에서 독보적인 작품활동을 하고 있는 작가들과 함께 하는 전시입니다.
회화, 조각, 도자, 금속공예, 일러스트, 캘리그래피 등 다양한 분야의 작가들을 함께하는 기획전으로 
디자인과 아트의 영역을 넓내는 아티스트들의 자유롭고 신선한 창작의 장이 펼쳐집니다.

Section 2: 신진작가 기획전
디자인아트페어 공모전을 통해 선발된 유망한 신진작가들의 특별전
이번 디자인아트페어 여름 특별전에서는 신진작가들에게 더욱 도약할 수 있는 발판을 마련해주고 
다양한 중견 작가들과의 멘토링 및 네트워킹 시간도 마련됩니다.

Section 3: 성장을 위한 도약
DAF를 통해 한층 더 성장해 나갑니다. 
기존 참여작가들은 키리라시드, 알렌산드로, 맨디니, 앤서니 브라운, 세르주블로크, 에르데릭텀 등 
세계적인 아티스트들과의 협업을 보여 주었습니다.
이 외에도 DAF는 아티스트의 성장을 돕고 글로벌 무대로 진출할 수 있는 발판을 마련해줍니다.

[전시 특징]
• 예술의전당 한가람미술관에서 개최되는 프리미엄 아트페어
• 회화, 조각, 도자, 금속공예, 일러스트, 캘리그래피 등 다양한 장르
• 신진작가와 중견작가의 만남과 교류
• 관람객 참여형 체험 프로그램
• 여름 성수기 2만명 이상 관람객 예상

[관람 포인트]
• 국내 최고의 복합예술공간에서 열리는 특별한 아트페어
• 다양한 장르의 작가들이 한자리에 모이는 종합 전시
• 신진작가 발굴과 성장 지원 프로그램
• 예술 작품 직접 구매 및 소장 기회
• 작가와의 직접 만남과 소통

[특별 프로그램]
• 작가와의 만남
• 신진작가 멘토링 프로그램
• 아트 체험 워크숍
• 큐레이터 토크
• 컬렉터 가이드 투어

이번 DAF 2025 SUMMER FESTIVAL은 예술의전당이라는 특별한 공간에서 펼쳐지는 프리미엄 아트페어로, 다양한 장르의 작가들과 관람객이 함께 만들어가는 예술의 축제입니다.`,
      
      // 태그 정보
      tags: ['디자인아트페어', 'DAF', '썸머페스티벌', '아트페어', '디자인', '현대미술', '신진작가', '예술의전당'],
      
      // 연락처 정보
      contact_info: '문의: 02-735-4237',
      phone_number: '02-735-4237',
      
      // 메타데이터
      source: 'seoul_arts_center',
      source_url: 'https://www.sac.or.kr',
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
    console.log('⏰ 운영시간:', exhibitionData.operating_hours);
    console.log('💰 입장료: 무료');
    console.log('🎨 주최: 마이아트예술기획연구소');
    console.log('🌟 특징: 다양한 장르의 작가들이 참여하는 프리미엄 아트페어');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

// 실행
importHangaramDAFSummerFestival2025();