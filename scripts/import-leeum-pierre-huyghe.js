const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function importLeeumPierreHuyghe() {
  console.log('🎨 리움미술관 피에르 위그: 리미널 전시 데이터 입력 시작...\n');
  
  try {
    const exhibitionData = {
      id: uuidv4(),
      
      // 기본 정보
      title_local: '피에르 위그: 리미널',
      title_en: 'Pierre Huyghe: Liminal',
      subtitle: '아시아 최초 개인전',
      
      // 날짜
      start_date: '2025-02-27',
      end_date: '2025-07-06',
      exhibition_type: 'special',
      status: 'closed', // 이미 종료된 전시
      
      // 장소 정보
      venue_name: '리움미술관',
      venue_city: '서울',
      venue_country: 'KR',
      venue_address: '서울특별시 용산구 이태원로55길 60, 블랙박스, 그라운드갤러리',
      
      // 전시 설명
      description: `리움미술관은 현대미술의 고정된 형식을 깨고 끊임없이 새로운 세계를 탐구해 온 세계적 작가 피에르 위그의 아시아 최초 개인전 《리미널》을 선보입니다.

전시 제목 '리미널'은 "생각지도 못한 무언가가 출현할 수 있는 과도기적 상태"를 의미합니다. 전시는 예측 불가능성을 가시화하고 인간과 비인간이 공존하는 새로운 생태적 환경을 제안하며, 서로 다른 시간과 공간이 겹쳐지거나 분리되면서 그 의미가 진화합니다.

[주요 작품]
• 〈리미널〉 (2024–현재): 얼굴 없는 인간 형상, AI 기반 움직임
• 〈카마타〉 (2024–현재): 아타카마 사막 해골, 기계 의식
• 〈이디엄〉 (2024–현재): 황금색 마스크, 실시간 생성 언어
• 〈휴먼 마스크〉 (2014): 대표작
• 〈오프스프링〉 (2018)
• 〈U움벨트-안리〉 (2018–2025): 인간-기계 협업
• 〈암세포 변환기〉 (2016): 삼성서울병원 협력

[전시 특징]
• 실시간 데이터와 생명공학 결합
• 인간과 비인간의 상호 관계
• 살아있는 환경으로서의 전시
• 예측 불가능한 불확실성의 세계
• AI와 센서 기반 실시간 변화

[협력]
• 공동 제작: 피노 컬렉션 푼타 델라 도가나
• 파트너십: Bottega Veneta
• 의료 협력: 삼성서울병원

"나는 이야기의 형태가 선형성을 벗어날 때 흥미를 느낀다. 역사를 넘어선 서사 밖의 허구에 관한 것이다." - 피에르 위그`,
      
      // 작가 정보
      artists: ['피에르 위그 (Pierre Huyghe)'],
      curator: '리움미술관',
      
      // 작품 정보
      artworks_count: 12,
      
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
    
    console.log('✅ 피에르 위그: 리미널 전시 데이터 입력 완료!');
    console.log('\n📋 입력된 전시 정보:');
    console.log(`  - ID: ${data[0].id}`);
    console.log(`  - 제목: ${data[0].title_local}`);
    console.log(`  - 작가: ${data[0].artists.join(', ')}`);
    console.log(`  - 장소: ${data[0].venue_name} (블랙박스, 그라운드갤러리)`);
    console.log(`  - 기간: ${data[0].start_date} ~ ${data[0].end_date}`);
    console.log(`  - 작품수: ${data[0].artworks_count}점`);
    console.log(`  - 상태: ${data[0].status} (종료)`);
    
    // 리움미술관 전체 전시 현황
    console.log('\n🔍 리움미술관 전체 전시 현황...');
    const { data: leeumAll, error: allError } = await supabase
      .from('exhibitions')
      .select('title_local, artists, start_date, end_date, status')
      .eq('venue_name', '리움미술관')
      .order('start_date', { ascending: true });
    
    if (!allError && leeumAll) {
      console.log(`\n📌 리움미술관 전시: ${leeumAll.length}개`);
      
      const byStatus = {
        closed: [],
        ongoing: [],
        upcoming: []
      };
      
      leeumAll.forEach(ex => {
        if (ex.status) {
          if (!byStatus[ex.status]) byStatus[ex.status] = [];
          byStatus[ex.status].push(ex);
        }
      });
      
      if (byStatus.closed.length > 0) {
        console.log(`\n[종료된 전시] ${byStatus.closed.length}개`);
        byStatus.closed.forEach(ex => {
          const artist = ex.artists && ex.artists.length > 0 ? `(${ex.artists[0]})` : '';
          console.log(`  - ${ex.title_local} ${artist}`);
        });
      }
      
      if (byStatus.ongoing.length > 0) {
        console.log(`\n[진행중] ${byStatus.ongoing.length}개`);
        byStatus.ongoing.forEach(ex => {
          const artist = ex.artists && ex.artists.length > 0 ? `(${ex.artists[0]})` : '';
          console.log(`  - ${ex.title_local} ${artist}`);
        });
      }
      
      if (byStatus.upcoming.length > 0) {
        console.log(`\n[예정] ${byStatus.upcoming.length}개`);
        byStatus.upcoming.forEach(ex => {
          const artist = ex.artists && ex.artists.length > 0 ? `(${ex.artists[0]})` : '';
          console.log(`  - ${ex.title_local} ${artist}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ 데이터 입력 중 오류 발생:', error.message);
    if (error.details) console.error('세부사항:', error.details);
  }
}

// 실행
importLeeumPierreHuyghe();