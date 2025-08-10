const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function importLeeumContemporaryArt() {
  console.log('🎨 리움미술관 현대미술 소장품전 데이터 입력 시작...\n');
  
  try {
    const exhibitionData = {
      id: uuidv4(),
      
      // 기본 정보
      title_local: '현대미술 소장품',
      title_en: 'Contemporary Art Collection',
      subtitle: '삼성문화재단 창립 60주년 기념 소장품전',
      
      // 날짜
      start_date: '2025-02-27',
      end_date: '2026-02-28', // 종료일 미정이므로 약 1년으로 설정
      exhibition_type: 'collection', // 소장품전
      status: 'upcoming',
      
      // 장소 정보
      venue_name: '리움미술관',
      venue_city: '서울',
      venue_country: 'KR',
      venue_address: '서울특별시 용산구 이태원로55길 60, M2 전시관',
      
      // 전시 설명
      description: `삼성문화재단 창립 60주년을 맞아 리움미술관은 현대미술 소장품을 새로운 시각으로 조망하는 자리를 마련했습니다.

이번 전시는 익히 알려진 미술관의 대표 소장품들보다는 그동안 전시되지 않은 미공개 작품을 중심으로 전개됩니다. 총 44점의 작품 중 27점이 최초로 공개되며, 최근 미술관에 소장된 신수품도 함께 소개되어 시대의 흐름을 반영한 예술적 대화를 더욱 다채롭게 만듭니다.

[전시 구성]
전시는 연대기적 혹은 주제별 구성보다 작품 간의 시각적 혹은 개념적 병치를 통해 관람객이 작품들 사이에서 또 다른 관계를 발견하고 다층적이며 비선형적 예술경험을 할 수 있도록 유도합니다.

[주요 작품]
• 오귀스트 로댕 〈칼레의 시민〉
• 알베르토 자코메티 〈거대한 여인 Ⅲ〉
• 솔 르윗 〈매달린 구조 #28A〉 (최초 공개)
• 루이즈 네벨슨 〈새벽의 존재 – 셋〉
• 칼 안드레 〈81개의 구리, 철 (헤파이스토스의 그물)〉 (최초 공개)
• 한네 다보벤 〈한국 달력〉
• 김종영 작품 시리즈
• 이우환 〈선으로부터〉, 〈점으로부터〉
• 마크 로스코, 장욱진 회화
• 리처드 디콘, 로버트 라우셴버그 등

[전시 특징]
• 최초 공개 작품 27점 포함
• 한국 근현대미술부터 서구 현대미술까지 아우름
• M2 공간의 건축적 변형을 통한 새로운 경험
• 로비 공간으로 확장된 전시

[청소년 프로그램]
• 대상: 초등 5학년 ~ 고교 3학년 단체
• 시기: 2025년 4월 중순부터
• 워크북 및 관람권 무료 제공

협찬: KB금융그룹`,
      
      // 작가 정보 (35명 작가 중 주요 작가)
      artists: [
        '오귀스트 로댕', '알베르토 자코메티', '솔 르윗', '루이즈 네벨슨',
        '칼 안드레', '한네 다보벤', '김종영', '이우환', '마크 로스코',
        '장욱진', '리처드 디콘', '로버트 라우셴버그', '얀 보', '온카와라',
        '리 본테큐', '정서영', '임민욱', '박미나', 'Sasa[44]', '프랑수아 모렐레'
      ],
      curator: '김성원 (리움미술관 부관장)',
      
      // 작품 정보
      artworks_count: 44,
      
      // 관람 정보
      admission_fee: '멤버 무료 / 일반 관람료 별도',
      operating_hours: JSON.stringify({
        운영시간: '화-일 10:30-18:00',
        휴관일: '매주 월요일, 1월 1일, 설날, 추석',
        예약: '온라인 사전 예약 필수'
      }),
      
      // 연락처
      contact_info: JSON.stringify({
        담당: '한미소 책임',
        문의: '02-2014-6553',
        대표: '02-2014-6900'
      }),
      phone_number: '02-2014-6553',
      
      // URL 정보
      official_url: 'https://www.leeum.org',
      website_url: 'https://www.leeum.org',
      
      // 데이터 메타정보
      source: 'leeum_official',
      source_url: 'https://www.leeum.org',
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
    
    console.log('✅ 리움미술관 현대미술 소장품전 데이터 입력 완료!');
    console.log('\n📋 입력된 전시 정보:');
    console.log(`  - ID: ${data[0].id}`);
    console.log(`  - 제목: ${data[0].title_local}`);
    console.log(`  - 부제: ${data[0].subtitle}`);
    console.log(`  - 장소: ${data[0].venue_name} M2`);
    console.log(`  - 기간: ${data[0].start_date}부터`);
    console.log(`  - 참여 작가: ${data[0].artists.length}명`);
    console.log(`  - 작품수: ${data[0].artworks_count}점 (최초 공개 27점)`);
    console.log(`  - 상태: ${data[0].status}`);
    
    // 리움미술관 전시 현황 확인
    console.log('\n🔍 리움미술관 전시 현황...');
    const { data: leeumExhibitions, error: leeumError } = await supabase
      .from('exhibitions')
      .select('title_local, start_date, end_date, status')
      .eq('venue_name', '리움미술관')
      .order('start_date', { ascending: false });
    
    if (!leeumError && leeumExhibitions) {
      console.log(`\n📌 리움미술관 전시: ${leeumExhibitions.length}개`);
      leeumExhibitions.forEach(ex => {
        console.log(`  - ${ex.title_local} (${ex.start_date} ~ ${ex.end_date}) [${ex.status}]`);
      });
    }
    
  } catch (error) {
    console.error('❌ 데이터 입력 중 오류 발생:', error.message);
    if (error.details) console.error('세부사항:', error.details);
  }
}

// 실행
importLeeumContemporaryArt();