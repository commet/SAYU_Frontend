const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function importHangaramDesignSharedFuture2025() {
  console.log('🎨 한가람디자인미술관 《공유미래》 전시 데이터 입력 시작...\n');
  
  try {
    const exhibitionData = {
      id: uuidv4(),
      
      // 기본 정보
      title_local: '공유미래',
      title_en: 'Shared Future',
      subtitle: '미래를 함께 만들어가는 예술과 기술의 만남',
      
      // 날짜
      start_date: '2025-08-22',
      end_date: '2025-09-07',
      exhibition_type: 'special',
      status: 'upcoming',
      
      // 장소 정보
      venue_name: '한가람디자인미술관',
      venue_city: '서울',
      venue_country: 'KR',
      venue_address: '서울특별시 서초구 남부순환로 2406 한가람디자인미술관',
      
      // 운영 정보
      operating_hours: '10:00-19:00 (매주 월요일 휴관, 18:30 입장마감)',
      admission_fee: '무료',
      
      // 전시 설명
      description: `[전시 소개]
《공유미래》는 예술과 기술이 만나 우리가 함께 만들어갈 미래의 모습을 제시하는 특별한 전시입니다.

이 전시는 디지털 시대의 새로운 가능성을 탐구하며, 개인과 공동체가 어떻게 협력하여 더 나은 미래를 창조할 수 있는지를 예술적 관점에서 조명합니다.

[전시 특징]
• 예술과 기술의 융합을 통한 미래 비전 제시
• 참여형 인터랙티브 작품 구성
• 공동체와 개인의 관계성 탐구
• 지속가능한 미래에 대한 예술적 제안
• 디지털 네이티브 세대의 새로운 소통 방식

[주요 섹션]

Section 1: 연결의 미래
• 디지털 기술로 연결된 세상
• 가상과 현실의 경계를 넘나드는 작품들
• 소셜 네트워크와 인간관계의 새로운 패러다임

Section 2: 지속가능한 내일
• 환경과 기술의 조화
• 친환경 미래 사회의 모습
• 순환경제와 예술의 만남

Section 3: 창작의 민주화
• 모든 사람이 창작자가 되는 시대
• AI와 인간의 협업
• 집단지성을 통한 새로운 창작 방식

Section 4: 공유하는 세상
• 공유경제와 커뮤니티 문화
• 개방과 협력의 가치
• 함께 만들어가는 미래 도시

[관람 포인트]
• 미래 사회에 대한 다양한 상상과 비전
• 예술과 기술의 창의적 결합
• 관람객이 직접 참여할 수 있는 인터랙티브 체험
• 공동체 의식과 연대감을 키우는 메시지

[특별 프로그램]
• 아티스트 토크
• 미래 기술 체험 워크숍
• 청소년 대상 교육 프로그램
• 시민 참여 프로젝트

이 전시는 단순히 미래를 관망하는 것이 아니라, 관람객 모두가 함께 참여하여 공유미래를 만들어가는 의미 있는 경험을 제공합니다.`,
      
      // 태그 정보
      tags: ['공유미래', 'SharedFuture', '미래기술', '인터랙티브', '공동체', '지속가능성', '디지털아트'],
      
      // 연락처 정보
      contact_info: '문의: 02-3477-2074',
      phone_number: '02-3477-2074',
      
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
    console.log('🤝 주최: 예술의전당, 서초구, 서초문화재단');
    console.log('🌐 테마: 예술과 기술의 융합, 공유미래');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

// 실행
importHangaramDesignSharedFuture2025();