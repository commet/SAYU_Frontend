const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function importLeeumAnickaYi() {
  console.log('🎨 리움미술관 아니카 이 개인전 데이터 입력 시작...\n');
  
  try {
    const exhibitionData = {
      id: uuidv4(),
      
      // 기본 정보
      title_local: '또 다른 진화가 있다, 그러나 이에는',
      title_en: 'There Is No Other Evolution, But That Of The',
      subtitle: '아시아 첫 미술관 개인전',
      
      // 날짜
      start_date: '2024-09-05',
      end_date: '2024-12-29',
      exhibition_type: 'special',
      status: 'closed', // 이미 종료된 전시
      
      // 장소 정보
      venue_name: '리움미술관',
      venue_city: '서울',
      venue_country: 'KR',
      venue_address: '서울특별시 용산구 이태원로55길 60, M2',
      
      // 전시 설명
      description: `리움미술관은 한국계 미국인 작가 아니카 이의 아시아 첫 미술관 개인전을 개최했습니다. 이번 전시는 신작을 포함한 작가의 최근작에 방점을 두고 지난 10년간 제작된 30여 점의 작품을 전시했습니다.

아니카 이는 기술과 생물, 감각을 연결하는 실험적인 작업을 전개해왔습니다. 박테리아, 냄새, 튀긴 꽃처럼 유기적이고 일시적인 재료를 사용해 인간의 감정과 감각을 예민하게 포착한 작업으로 세계 미술계의 주목을 받았습니다.

[전시 제목의 의미]
불교 수행법 중 간화선에서 사용되는 화두의 특성을 차용한 수수께끼 같은 구절로, 아니카 이 작업의 명성적이고 영적인 전환을 반영합니다.

[주요 작품]
• 〈두 갈래 길을 한번에 걷기〉 (2023): 조향사 바나베 피용과 협업한 향 작업
• 〈후기 고전파 XVIII〉 (2022): 덴푸라 꽃 튀김, 파라핀 왁스, 아령
• 〈전류를 발생시키는 석영〉 (2023-2024): PMMA 광섬유, LED 조각
• 〈방산충〉 연작: 기계 생명체, 캄브리아기 플랑크톤에서 영감
• 〈산호 가지는 달빛을 길어 올린다〉 (2024): AI 알고리즘 기반 영상
• 〈또 다른 너〉 (2024): 박테리아, 인피니티 미러

[작품 특징]
• 박테리아, 냄새, 유기적 재료 사용
• 생물과 기계의 융합
• 인간중심적 사고에 대한 의문 제기
• 부패와 영속성 탐구
• AI와 합성생물학 활용

[협업]
• 과학자, 건축가, 조향사 등과의 학제간 협업
• 컬럼비아대 해리스 웡 연구실
• 이화여자대학교 연구진
• 조향: 바나베 피용

[순회]
베이징 UCCA 현대미술센터로 순회 (2025년 3월)

공동 기획: 이진아 (리움), 피터 일리 (UCCA)`,
      
      // 작가 정보
      artists: ['아니카 이 (Anicka Yi)'],
      curator: '이진아 (리움미술관), 피터 일리 (UCCA)',
      
      // 작품 정보
      artworks_count: 30,
      
      // 관람 정보
      admission_fee: '별도 공지',
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
    
    console.log('✅ 아니카 이 개인전 데이터 입력 완료!');
    console.log('\n📋 입력된 전시 정보:');
    console.log(`  - ID: ${data[0].id}`);
    console.log(`  - 제목: ${data[0].title_local}`);
    console.log(`  - 작가: ${data[0].artists.join(', ')}`);
    console.log(`  - 장소: ${data[0].venue_name} M2`);
    console.log(`  - 기간: ${data[0].start_date} ~ ${data[0].end_date}`);
    console.log(`  - 작품수: ${data[0].artworks_count}점`);
    console.log(`  - 상태: ${data[0].status} (종료)`);
    
    // 리움미술관 전시 연표 확인
    console.log('\n🔍 리움미술관 전시 연표...');
    const { data: chronology, error: chronError } = await supabase
      .from('exhibitions')
      .select('title_local, artists, start_date, end_date, status')
      .eq('venue_name', '리움미술관')
      .order('start_date', { ascending: true });
    
    if (!chronError && chronology) {
      console.log(`\n📅 리움미술관 전시 연표 (총 ${chronology.length}개):`);
      chronology.forEach((ex, index) => {
        const artist = ex.artists && ex.artists.length > 0 ? ex.artists[0] : '';
        const statusIcon = ex.status === 'closed' ? '✅' : 
                          ex.status === 'ongoing' ? '🔄' : '📅';
        console.log(`${index + 1}. ${ex.title_local} ${artist ? `(${artist})` : ''} ${statusIcon}`);
        console.log(`   ${ex.start_date} ~ ${ex.end_date}`);
      });
    }
    
  } catch (error) {
    console.error('❌ 데이터 입력 중 오류 발생:', error.message);
    if (error.details) console.error('세부사항:', error.details);
  }
}

// 실행
importLeeumAnickaYi();