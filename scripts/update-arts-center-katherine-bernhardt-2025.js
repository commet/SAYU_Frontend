const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function updateArtsCenterKatherineBernhardt2025() {
  console.log('🎨 예술의전당 《캐서린 번하드 展》 정보 업데이트 시작...\n');
  
  try {
    // 기존 전시 ID
    const exhibitionId = '7ae30223-9073-4cc3-b11e-eba73f0b6c20';
    
    const updateData = {
      // 날짜 수정
      start_date: '2025-06-06',
      end_date: '2025-09-28',
      
      // 추가 정보
      title_en: 'Katherine Bernhardt Exhibition',
      subtitle: '대중문화와 현대미술의 완벽한 교차점',
      venue_address: '서울특별시 서초구 남부순환로 2406 한가람미술관 제5전시실, 제6전시실',
      operating_hours: '10:00-19:00 (매주 월요일 휴관, 18:00 입장마감)',
      
      // 상세 요금 정보
      admission_fee: `일반(20세 이상) 22,000원
청소년(14-19세) 17,000원
어린이(36개월 이상-13세) 15,000원`,
      
      // 상세 설명
      description: `[전시 소개]
대중문화와 현대미술의 완벽한 교차점, 캐서린 번하드의 세계로 초대합니다.

[작가 소개: 캐서린 번하드 (Katherine Bernhardt)]
뉴욕을 기반으로 활동하는 캐서린 번하드는 대중문화 아이콘과 일상의 사물들을 독특한 시각으로 재해석하는 현대 미술가입니다. 핑크 팬더, 쿠키 몬스터, 스머프 등 우리에게 친숙한 캐릭터들을 비롯해 과일, 담배, 화장품 등 일상의 오브제들을 캔버스에 담아내며 현대 소비문화를 유쾌하게 비틉니다.

[전시 특징]
• 대중문화 아이콘의 재해석
• 일상 오브제의 예술적 변환
• 강렬한 색채와 대담한 붓터치
• 현대 소비문화에 대한 유쾌한 비평
• 팝아트의 계승과 진화

[주요 작품]
• 핑크 팬더 시리즈
• 쿠키 몬스터 연작
• 열대 과일과 일상 오브제 작품들
• 패턴 페인팅 시리즈

[관람 포인트]
캐서린 번하드의 작품은 우리가 매일 마주하는 평범한 사물과 대중문화 아이콘들을 예술로 승화시킵니다. 그녀의 과감한 색채 사용과 자유로운 붓질은 관람객에게 시각적 즐거움을 선사하며, 동시에 현대 소비사회에 대한 재치 있는 관찰을 담고 있습니다.

[오디오 가이드]
• 배우 김우빈: 배우 김우빈님과 함께하는 특스터 아티스트의 감사 수업 중 갈멋, 소개되는트음동육 감덕하이터
• 온느뮤지엄: 미술 전문 큐레이터와 함께하는 특별한 전시 해설

[특별 도슨트]
• 배우 변정민: 배우 변정민과 함께하는, 재치와 인문트 넘치는 도슨트 투어
• 일정: 1/24(토) 6월 22일 (일), 3/4(토) 7월 19일 (일), 9월 24일/9월 4일, 5/28(토) 8월 17일 (일), 8월 24일/9월 4일, 9월 24일/9월 4일
• ※ 현장 방문 인원에 한해 참여방식

[전시 정보]
• 주최/주관: 주식회사유엔씨갤러리
• 후원: 네이버, 널위한문화예술
• 협찬: 산업은행, 렉서스, 노루페인트, ELUV`,
      
      // 아티스트 정보
      artists: ['Katherine Bernhardt'],
      
      // 연락처 정보
      contact_info: '문의: 02-733-2798',
      phone_number: '02-733-2798',
      
      // 태그 정보
      tags: ['캐서린번하드', '대중문화', '현대미술', '핑크팬더', '쿠키몬스터', '원화전시', 'KatherineBernhardt'],
      
      // 메타데이터 업데이트
      updated_at: new Date().toISOString()
    };

    // 데이터 업데이트
    const { data, error } = await supabase
      .from('exhibitions')
      .update(updateData)
      .eq('id', exhibitionId)
      .select();

    if (error) {
      console.error('❌ 전시 데이터 업데이트 실패:', error);
      return;
    }

    console.log('✅ 전시 정보 성공적으로 업데이트됨!');
    console.log('📍 전시명: 캐서린 번하드 展');
    console.log('📅 전시 기간: 2025-06-06 ~ 2025-09-28');
    console.log('🏛️ 장소: 예술의전당 한가람미술관');
    console.log('⏰ 운영시간: 10:00-19:00 (월요일 휴관)');
    console.log('💰 입장료: 일반 22,000원 / 청소년 17,000원 / 어린이 15,000원');
    console.log('\n📝 추가된 정보:');
    console.log('- 제5,6전시실 위치 정보');
    console.log('- 오디오 가이드: 배우 김우빈');
    console.log('- 특별 도슨트: 배우 변정민');
    console.log('- 핑크팬더, 쿠키몬스터 등 대중문화 아이콘 작품');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

// 실행
updateArtsCenterKatherineBernhardt2025();