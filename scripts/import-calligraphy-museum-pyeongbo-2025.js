const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function importCalligraphyMuseumPyeongbo2025() {
  console.log('🎨 서울서예박물관 《평보 서희환 : 보통의 걸음》 전시 데이터 입력 시작...\n');
  
  try {
    const exhibitionData = {
      id: uuidv4(),
      
      // 기본 정보
      title_local: '평보 서희환 : 보통의 걸음',
      title_en: 'Pyeongbo Seo Hee-hwan : Ordinary Steps',
      subtitle: '서희환 서예가의 삶과 예술 세계',
      
      // 날짜
      start_date: '2025-07-11',
      end_date: '2025-10-12',
      exhibition_type: 'special',
      status: 'upcoming',
      
      // 장소 정보
      venue_name: '서울서예박물관',
      venue_city: '서울',
      venue_country: 'KR',
      venue_address: '서울특별시 서초구 남부순환로 2406 서울서예박물관 제1전시실, 제2전시실',
      
      // 운영 정보
      operating_hours: '10:00-19:00 (매주 월요일 휴관, 18:00 입장마감)',
      admission_fee: '일반 10,000원 / 청소년, 어린이, 유아 5,000원',
      
      // 전시 설명
      description: `[전시 소개]
《평보 서희환 : 보통의 걸음》은 한국 현대 서예의 거장 평보(平步) 서희환 선생의 예술 세계를 조명하는 대규모 회고전입니다.

'평보(平步)'는 '평범한 걸음'을 의미하며, 이는 서희환 선생이 평생 추구해온 겸손하고 진실된 예술 정신을 상징합니다. '보통의 걸음'이라는 부제는 평범함 속에서 비범함을 찾아가는 그의 예술 철학을 담고 있습니다.

[작가 소개: 평보 서희환]
서희환(1934-1995)은 한국 현대 서예사에 큰 족적을 남긴 서예가입니다. 전통 서예의 정신을 계승하면서도 현대적 감각을 접목시켜 독자적인 서예 세계를 구축했습니다. 그의 작품은 단순한 글씨를 넘어 깊은 정신성과 예술성을 담고 있습니다.

[전시 구성]

Section 1: 서체와 인품
• 서희환의 대표 서체 작품
• 한글과 한자 서예의 조화
• 전통과 현대의 만남

Section 2: 문학과 서예
• 시서화 작품
• 문학 작품과의 협업
• 서예와 문학의 융합

Section 3: 일상 속 서예
• 생활 속 서예 작품
• 편지와 일기 등 개인 기록물
• 교육자로서의 서희환

Section 4: 정신과 사상
• 서예를 통한 정신 수양
• 동양 철학과 서예
• 현대 서예의 방향 제시

Section 5: 유산과 영향
• 제자들과의 교류
• 한국 서예계에 미친 영향
• 미래 세대를 위한 메시지

[전시 특징]
• 서희환의 대표작품 100여 점 전시
• 미공개 작품 및 개인 소장품 최초 공개
• 멀티미디어를 활용한 입체적 전시 구성
• 서예 체험 프로그램 운영

[관람 포인트]
• 한국 현대 서예의 정수를 한눈에 감상
• 전통과 현대를 아우르는 서예 예술의 진수
• 글씨에 담긴 정신과 철학의 깊이
• 일상과 예술의 경계를 넘나드는 작품 세계

[특별 프로그램]
• 큐레이터 토크
• 서예 체험 워크숍
• 전문가 특별 강연
• 가족 프로그램

이 전시는 단순히 글씨를 감상하는 것을 넘어, 한 예술가가 평생을 통해 추구한 '보통의 걸음' 속에 담긴 비범한 정신을 만나는 특별한 기회가 될 것입니다.`,
      
      // 아티스트 정보
      artists: ['서희환'],
      
      // 태그 정보
      tags: ['평보', '서희환', '서예', '서예박물관', '한국서예', '현대서예', '전통예술'],
      
      // 연락처 정보
      contact_info: '문의: 1668-1352',
      phone_number: '1668-1352',
      
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
    console.log('💰 입장료:', exhibitionData.admission_fee);
    console.log('✒️ 주최: 예술의전당');
    console.log('🎨 주제: 한국 현대 서예의 거장 회고전');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

// 실행
importCalligraphyMuseumPyeongbo2025();