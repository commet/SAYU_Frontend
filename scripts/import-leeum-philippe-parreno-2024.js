const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function importLeeumPhilippeParreno2024() {
  console.log('🎨 리움미술관 필립 파레노 《보이스》 데이터 입력 시작...\n');
  
  try {
    const exhibitionData = {
      id: uuidv4(),
      
      // 기본 정보
      title_local: '필립 파레노: 보이스',
      title_en: 'Philippe Parreno: VOICES',
      subtitle: '국내 첫 개인전, 아시아 최대 규모 서베이 전시',
      
      // 날짜
      start_date: '2024-02-28',
      end_date: '2024-07-07',
      exhibition_type: 'special',
      status: 'closed', // 이미 종료된 전시
      
      // 장소 정보
      venue_name: '리움미술관',
      venue_city: '서울',
      venue_country: 'KR',
      venue_address: '서울특별시 용산구 이태원로55길 60, M2, 블랙박스, 그라운드갤러리, 로비, 데크',
      
      // 전시 설명
      description: `리움미술관은 전세계 미술계가 주목하는 프랑스 작가 필립 파레노의 국내 첫 개인전 《VOICES, 보이스》를 개최합니다. 90년대부터 최근까지 파레노의 작품세계를 총체적으로 경험할 수 있는 아시아 최대 규모의 서베이 전시입니다.

[작가 철학]
필립 파레노는 전통적 작가 개념에 도전하며 오브제 생산자로서 작가의 역할을 거부합니다. 그는 전시와 작품과의 역동적 관계를 탐구하고 '시간의 경험'을 제안하며 90년대 현대미술 형태의 혁신적 전환을 이끌었습니다.

[전시 컨셉: 다수의 목소리]
'다수의 목소리'는 파레노 작업의 핵심요소로, 대상에 생명력을 불어넣고 주체로 변신하게 합니다. 전시는 과거에 파편적으로 존재했던 '다수의 목소리'를 하나로 집결시키며, 지금 여기에 어떠한 방식으로 존재할 수 있을지 질문합니다.

[주요 신작]

《막(膜)》 (2024)
• 재료: 콘크리트, 금속, 플렉시글라스, LED, 센서, 모터, 마이크, 스피커
• 크기: 1360 x 112.7 x 112.7 cm
• 위치: 미술관 야외 데크
• 기능: 기온, 습도, 풍량, 소음, 대기오염, 미세한 진동까지 수집하는 인공두뇌
• 역할: 미술관 내부의 <∂A>와 상호작용하며 전시의 모든 요소 조율

《∂A》 (2024)
• 협업: 배우 배두나, 언어개발자 데이비드 J. 피터슨, 제시 샘스
• 사운드: 피에르 랑샹탱, 니콜라스 베커, 렉스
• 특징: 배두나의 실제 목소리를 AI로 '실재하는 가상'의 목소리로 재탄생
• 진화: 웅얼거림에서 시작하여 새로운 언어 '∂A'를 습득하며 발화 주체로 성장

《움직이는 조명등》 (2024)
• 새로운 대형 신작

[주요 기존작품]
• 《꽃》 (1987) - 작가의 첫 작품
• 《루미나리에》 (2001) - 피에르 위그, M/M 공동작업, 2000년 베니스 비엔날레 이후 첫 공개
• 《내 방은 또 다른 어항》 (2002)
• 《마릴린》 (2012)
• 《차양 연작》 (2014-2023) - 플렉시글라스, 전구, 네온 튜브, DMX 제어기
• 《삶의 의지를 넘어서 생동적 본능과 함께 살아갈 수 있도록》 (2018) - LED 패널, 맥미니, 스피커

[전시 경험]
미술관이 거대한 자동기계(automaton)로 변신합니다. 조명이 깜박이며 벽이 움직이고, 눈이 녹는 소리가 들리며 거대한 스피커가 움직입니다. 영상이 켜지고 반딧불이가 나타나며 피아노는 저절로 연주합니다.

전시는 자기제어시스템에 의해 작동되며 모든 요소는 완벽하게 컨트롤되지만, 수많은 변수와 우연의 상호작용으로 인해 예측불허한 진화를 지속합니다.

[특별 초청]
동료 작가 티노 세갈을 초청하여 전시 기간 동안 블랙박스와 그라운드갤러리 공간의 에스컬레이터에서 라이브 작품을 소개했습니다.

[전시 공간]
• 야외 데크: 《막(膜)》 설치
• 로비: 입구 경험
• M2: 주요 작품들
• 블랙박스: 몰입형 경험
• 그라운드갤러리: 서베이 전시`,
      
      // 작가 정보
      artists: ['필립 파레노 (Philippe Parreno)'],
      curator: '리움미술관',
      
      // 작품 정보
      artworks_count: 40, // 30여년 작품세계의 40여점
      
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
    
    console.log('✅ 필립 파레노 《보이스》 데이터 입력 완료!');
    console.log('\n📋 입력된 전시 정보:');
    console.log(`  - ID: ${data[0].id}`);
    console.log(`  - 제목: ${data[0].title_local}`);
    console.log(`  - 작가: ${data[0].artists.join(', ')}`);
    console.log(`  - 장소: ${data[0].venue_name} (전관 활용)`);
    console.log(`  - 기간: ${data[0].start_date} ~ ${data[0].end_date}`);
    console.log(`  - 작품수: ${data[0].artworks_count}여점 (30여년 서베이)`);
    console.log(`  - 상태: ${data[0].status} (종료)`);
    console.log(`  - 특징: 국내 첫 개인전, 아시아 최대 규모`);
    console.log(`  - 협업: 배두나, 티노 세갈`);
    
    // 리움미술관 2024년 상반기 전시 현황
    console.log('\n🔍 리움미술관 2024년 상반기 전시 현황...');
    const { data: firstHalf2024, error: firstHalfError } = await supabase
      .from('exhibitions')
      .select('title_local, artists, start_date, end_date, status')
      .eq('venue_name', '리움미술관')
      .gte('start_date', '2024-01-01')
      .lt('start_date', '2024-07-01')
      .order('start_date', { ascending: true });
    
    if (!firstHalfError && firstHalf2024) {
      console.log(`\n📅 리움미술관 2024년 상반기: ${firstHalf2024.length}개`);
      firstHalf2024.forEach((ex, index) => {
        const artist = ex.artists && ex.artists.length > 0 ? ex.artists[0] : '';
        const statusIcon = ex.status === 'closed' ? '✅' : 
                          ex.status === 'ongoing' ? '🔄' : '📅';
        console.log(`${index + 1}. ${ex.title_local} ${artist ? `(${artist})` : ''} ${statusIcon}`);
        console.log(`   ${ex.start_date} ~ ${ex.end_date}`);
      });
    }
    
    // 메디어아트/설치미술 전시 검색
    console.log('\n🔍 리움미술관 메디어아트/설치미술 전시...');
    const { data: mediaArt, error: mediaError } = await supabase
      .from('exhibitions')
      .select('title_local, artists, start_date, end_date')
      .eq('venue_name', '리움미술관')
      .or('description.ilike.%미디어%,description.ilike.%설치%,description.ilike.%인터랙티브%,description.ilike.%센서%,description.ilike.%AI%,description.ilike.%알고리즘%')
      .order('start_date', { ascending: false });
    
    if (!mediaError && mediaArt) {
      console.log(`\n🎮 리움미술관 메디어아트/설치미술: ${mediaArt.length}개`);
      mediaArt.slice(0, 5).forEach((ex, index) => {
        const artist = ex.artists && ex.artists.length > 0 ? `(${ex.artists[0]})` : '';
        console.log(`${index + 1}. ${ex.title_local} ${artist}`);
        console.log(`   ${ex.start_date} ~ ${ex.end_date}`);
      });
    }
    
  } catch (error) {
    console.error('❌ 데이터 입력 중 오류 발생:', error.message);
    if (error.details) console.error('세부사항:', error.details);
  }
}

// 실행
importLeeumPhilippeParreno2024();