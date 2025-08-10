const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function importLeeumLeeBul() {
  console.log('🎨 리움미술관 이불 개인전 데이터 입력 시작...\n');
  
  try {
    const exhibitionData = {
      id: uuidv4(),
      
      // 기본 정보
      title_local: '이불 개인전',
      title_en: 'Lee Bul Solo Exhibition',
      subtitle: '대규모 서베이 전시',
      
      // 날짜
      start_date: '2025-09-04',
      end_date: '2026-01-04',
      exhibition_type: 'special',
      status: 'upcoming',
      
      // 장소 정보
      venue_name: '리움미술관',
      venue_city: '서울',
      venue_country: 'KR',
      venue_address: '서울특별시 용산구 이태원로55길 60, 블랙박스, 그라운드갤러리',
      
      // 전시 설명
      description: `2025년 하반기에는 인간과 기술의 관계, 유토피아적 모더니티, 인류의 진보주의적 열망과 실패에 대한 탐구를 이어온 이불 작가의 작품 세계를 조망하는 대규모 서베이 전시를 개최합니다.

리움미술관과 홍콩 M+미술관이 공동기획하는 이번 전시는 2025년 9월 리움 전시를 필두로 2026년 3월 M+로 이어지며, 이후 주요 해외 기관으로 순회 예정입니다.

[전시 주제]
• 인간과 기술의 관계
• 유토피아적 모더니티
• 인류의 진보주의적 열망과 실패
• 디스토피아와 신체의 변형

[주요 작품 특징]
• 거울 바닥 위 철골 구조물
• 조각과 디지털 텍스트의 융합
• 폴리우레탄, 스테인리스 스틸 등 다양한 재료 활용
• 대규모 설치 작품

[대표작]
• 〈나의 거대서사: 바위에 흐느끼다…〉 (2005)
  - 폴리우레탄, 포맥스, 합성 점토, 스테인리스 스틸 로드
  - 280 x 440 x 300 cm

[전시 공간]
• 블랙박스
• 그라운드갤러리

[순회 전시]
• 2025년 9월: 리움미술관 (서울)
• 2026년 3월: M+미술관 (홍콩)
• 이후 주요 해외 기관 순회 예정

공동기획: 리움미술관, 홍콩 M+미술관`,
      
      // 작가 정보
      artists: ['이불 (Lee Bul)'],
      curator: '리움미술관, 홍콩 M+미술관',
      
      // 작품 정보
      artworks_count: 0, // 대규모 서베이 전시, 구체적 수 미정
      
      // 관람 정보
      admission_fee: '별도 공지 예정',
      operating_hours: JSON.stringify({
        운영시간: '화-일 10:30-18:00',
        휴관일: '매주 월요일, 1월 1일, 설날, 추석',
        예약: '온라인 사전 예약 필수'
      }),
      
      // 연락처
      contact_info: JSON.stringify({
        문의: '02-2014-6900',
        홈페이지: 'www.leeum.org'
      }),
      phone_number: '02-2014-6900',
      
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
    
    console.log('✅ 리움미술관 이불 개인전 데이터 입력 완료!');
    console.log('\n📋 입력된 전시 정보:');
    console.log(`  - ID: ${data[0].id}`);
    console.log(`  - 제목: ${data[0].title_local}`);
    console.log(`  - 작가: ${data[0].artists.join(', ')}`);
    console.log(`  - 장소: ${data[0].venue_name} (블랙박스, 그라운드갤러리)`);
    console.log(`  - 기간: ${data[0].start_date} ~ ${data[0].end_date}`);
    console.log(`  - 공동기획: 리움미술관, 홍콩 M+미술관`);
    console.log(`  - 상태: ${data[0].status}`);
    
    // 리움미술관 전체 전시 현황
    console.log('\n🔍 리움미술관 전체 전시 현황...');
    const { data: leeumAll, error: allError } = await supabase
      .from('exhibitions')
      .select('title_local, artists, start_date, end_date, status')
      .eq('venue_name', '리움미술관')
      .order('start_date', { ascending: true });
    
    if (!allError && leeumAll) {
      console.log(`\n📌 리움미술관 전시: ${leeumAll.length}개`);
      leeumAll.forEach(ex => {
        const artist = ex.artists && ex.artists.length > 0 ? ex.artists[0] : '';
        console.log(`  - ${ex.title_local} ${artist ? `(${artist})` : ''}`);
        console.log(`    ${ex.start_date} ~ ${ex.end_date} [${ex.status}]`);
      });
    }
    
  } catch (error) {
    console.error('❌ 데이터 입력 중 오류 발생:', error.message);
    if (error.details) console.error('세부사항:', error.details);
  }
}

// 실행
importLeeumLeeBul();