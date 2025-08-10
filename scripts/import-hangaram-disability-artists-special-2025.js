const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function importHangaramDisabilityArtistsSpecial2025() {
  console.log('🎨 한가람미술관 《장애예술인 특별전》 전시 데이터 입력 시작...\n');
  
  try {
    const exhibitionData = {
      id: uuidv4(),
      
      // 기본 정보
      title_local: '장애예술인 특별전',
      title_en: 'Special Exhibition of Artists with Disabilities',
      subtitle: '서울장애예술창작센터 입주작가 작품전',
      
      // 날짜
      start_date: '2025-10-17',
      end_date: '2025-11-06',
      exhibition_type: 'special',
      status: 'upcoming',
      
      // 장소 정보
      venue_name: '한가람미술관',
      venue_city: '서울',
      venue_country: 'KR',
      venue_address: '서울특별시 서초구 남부순환로 2406 한가람미술관 제7전시실',
      
      // 운영 정보
      operating_hours: '10:00-19:00 (매주 월요일 휴관, 18:00 입장마감)',
      admission_fee: '무료',
      
      // 전시 설명
      description: `[전시 소개]
《장애예술인 특별전》은 서울문화재단 서울장애예술창작센터 입주작가들의 예술 세계를 소개하는 기획전입니다.

이 전시는 2023년부터 서울문화재단과 예술의전당이 함께 주관하고, 효성이 후원하여 매년 개최되는 의미 있는 전시로, 장애와 비장애의 경계를 넘어 예술의 진정한 가치를 탐구합니다.

[서울장애예술창작센터 소개]
서울장애예술창작센터는 서울문화재단이 운영하는 국내 최초의 장애예술인 전문 창작 공간입니다. 장애예술인들의 창작 활동을 지원하고, 예술적 역량 강화를 통해 문화예술계의 다양성과 포용성을 확산하는 역할을 하고 있습니다.

[전시 특징]
• 서울장애예술창작센터 입주작가들의 대표작 소개
• 다양한 매체와 장르를 아우르는 시각예술 작품
• 장애와 비장애의 경계를 넘나드는 예술적 표현
• 사회적 포용과 다양성의 가치 실현
• 예술을 통한 인식 개선과 사회 통합

[참여 작가 및 작품]
서울장애예술창작센터에 입주하여 활발한 창작 활동을 펼치고 있는 다양한 분야의 작가들이 참여합니다:

**시각예술 분야**
• 회화: 다양한 기법과 매체를 활용한 회화 작품
• 조각: 입체적 표현을 통한 조형 작품
• 설치미술: 공간을 활용한 창의적 설치 작품
• 영상미술: 디지털 매체를 활용한 영상 작품

[주요 섹션]

**Section 1: 내면의 목소리**
• 작가 개인의 경험과 정서를 담은 작품들
• 내적 성찰과 자아 탐구의 표현
• 개인사와 사회적 맥락의 교차점

**Section 2: 소통과 연결**
• 타인과의 소통을 시도하는 작품들
• 사회적 관계와 유대감에 대한 탐구
• 공감과 이해를 바탕으로 한 예술적 소통

**Section 3: 일상의 재발견**
• 평범한 일상 속에서 발견하는 특별함
• 새로운 시각으로 바라본 세상
• 일상적 경험의 예술적 승화

**Section 4: 미래로의 전망**
• 희망과 꿈을 담은 미래 지향적 작품들
• 사회 변화에 대한 예술적 제안
• 포용적 사회를 향한 비전 제시

[전시의 의미와 가치]
이번 전시는 단순히 장애예술인의 작품을 소개하는 것을 넘어, 예술이 가진 소통의 힘과 치유의 가치를 보여줍니다. 작가들의 진솔한 작품을 통해 관람객들은 다름에 대한 이해를 넓히고, 예술의 보편적 가치를 재발견할 수 있을 것입니다.

[관람 포인트]
• 예술을 통한 다양성과 포용성의 가치 체험
• 장애예술인들의 창의적이고 독창적인 표현 방식
• 사회적 편견을 넘어선 순수한 예술적 감동
• 인간의 보편적 정서와 경험에 대한 공감
• 예술이 가진 치유와 소통의 힘 확인

[특별 프로그램]
• 작가와의 만남
• 장애인식개선 교육 프로그램
• 접근성을 고려한 관람 서비스
• 수어 해설 및 촉각 체험 프로그램
• 가족 및 단체 관람객을 위한 특별 투어

[접근성 지원]
• 휠체어 접근 가능한 전시 공간
• 시각장애인을 위한 촉각 및 음성 안내
• 청각장애인을 위한 수어 통역 서비스
• 다양한 장애 유형을 고려한 관람 환경 조성

이번 전시는 예술의 힘으로 사회적 편견을 허물고, 모든 사람이 함께 향유할 수 있는 포용적 문화 환경을 만들어가는 소중한 기회가 될 것입니다.`,
      
      // 태그 정보
      tags: ['장애예술', '장애예술인', '서울장애예술창작센터', '포용성', '다양성', '사회통합', '무료전시', '시각예술'],
      
      // 연락처 정보
      contact_info: '문의: 02-423-6675',
      phone_number: '02-423-6675',
      
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
    console.log('🤝 주최/주관: 예술의전당, 서울문화재단');
    console.log('💙 후원: 효성');
    console.log('🎨 특징: 서울장애예술창작센터 입주작가 기획전');
    console.log('♿ 접근성: 다양한 장애 유형을 고려한 관람 환경');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

// 실행
importHangaramDisabilityArtistsSpecial2025();