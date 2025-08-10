const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function importHangaramSergeBloch2025() {
  console.log('🎨 한가람미술관 《작은 선의 위대한 모험: 세르주 블로크展》 전시 데이터 입력 시작...\n');
  
  try {
    const exhibitionData = {
      id: uuidv4(),
      
      // 기본 정보
      title_local: '작은 선의 위대한 모험: 세르주 블로크展',
      title_en: 'SERGE BLOCH EXHIBITION',
      subtitle: '기하학적 크리에이터 세르주 블로크의 작품 세계',
      
      // 날짜
      start_date: '2025-05-29',
      end_date: '2025-08-17',
      exhibition_type: 'special',
      status: 'upcoming',
      
      // 장소 정보
      venue_name: '한가람미술관',
      venue_city: '서울',
      venue_country: 'KR',
      venue_address: '서울특별시 서초구 남부순환로 2406 한가람미술관 제7전시실',
      
      // 운영 정보
      operating_hours: '10:00-19:00 (매주 월요일 휴관, 18:20 입장마감)',
      admission_fee: `일반(만19~64세) 15,000원
청소년/어린이/유아(만 24개월~18세) 10,000원
* 유아~초등학생 입장 시 보호자 최소 1명 동반 필수`,
      
      // 전시 설명
      description: `[전시 소개]
《작은 선의 위대한 모험: 세르주 블로크展》은 세계적인 일러스트레이터이자 아티스트 세르주 블로크(Serge Bloch)의 작품 세계를 조명하는 대규모 개인전입니다.

[작가 소개: 세르주 블로크 (Serge Bloch)]
간결한 선과 색채만으로 무한한 상상력을 펼치는 프랑스 출신의 크리에이터입니다. 그의 작품은 단순한 선 하나로 시작되어 감동과 웃음, 그리고 깊은 사색을 불러일으킵니다.

감각, 출현, 에니메이션, 심플, 클고 뭉
공계 묻는 건변의 힘일!

[전시 구성]

Section 1: 온라인 예매 할인
세계 유명 언론매체의 표지와 삽화들
- 그림 묻지 알기

Section 2: 가장 원은 크리에이터
"막스와 블리" (Max et Lili) 시리즈 원화 250여점
- 어린이들의 일상과 감정을 다룬 베스트셀러 시리즈
- 프랑스에서 가장 많은 판매고를 올리는 그림책작가

Section 3: 글로벌 TOP 브랜드와 콜라보레이션
블리팍스, 르까르띠, 샤르르자 등 글로벌 브랜드와 협업 작품들

Section 4: 선 하나로 전세계를 사로잡은 일러스트레이터
- 뉴욕타임즈, 르몽드, 워싱턴포스트 등 유명 언론사 일러스트
- 간결한 선과 다채로운 색채의 조화
- 펜화가 거의 나타내 하이데

[관람 포인트]
• 단순한 선 하나가 만들어내는 무한한 상상력
• 어린이부터 어른까지 모두가 공감하는 스토리텔링
• 프랑스 유머와 감성이 담긴 일러스트레이션
• 세계 유명 언론매체와 브랜드 콜라보레이션 작품

[특별 프로그램]
• 라이브 페인팅 퍼포먼스
• 작가와의 만남 (일정 추후 공지)
• 어린이 드로잉 워크숍
• 가족 체험 프로그램

[관람기간 특별 이벤트]
• 관람기간: 5.29-8.17
• 원룸기간: 5.29-8.16
* 기간 종료 후 교환/환불 불가

#sergebloch_kr #세르주블로크 #전시 #아트센터이다 #artcenterida #예술의전당전시 #라이브페인팅`,
      
      // 아티스트 정보
      artists: ['Serge Bloch'],
      
      // 태그 정보
      tags: ['세르주블로크', 'SergeBloch', '일러스트레이션', '프랑스', '막스와블리', '한가람미술관', '예술의전당', '라이브페인팅'],
      
      // 연락처 정보
      contact_info: '문의: 02-3143-4368',
      phone_number: '02-3143-4368',
      
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
    console.log('💰 입장료: 일반 15,000원 / 청소년,어린이 10,000원');
    console.log('🎨 주최: 어반플레이');
    console.log('📋 주관: 아트센터이다, 마이아트예술기획연구소');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

// 실행
importHangaramSergeBloch2025();