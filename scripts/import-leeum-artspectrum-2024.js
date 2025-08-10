const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function importLeeumArtSpectrum2024() {
  console.log('🎨 리움미술관 2024 아트스펙트럼 《드림 스크린》 데이터 입력 시작...\n');
  
  try {
    const exhibitionData = {
      id: uuidv4(),
      
      // 기본 정보
      title_local: '2024 아트스펙트럼 《드림 스크린》',
      title_en: '2024 Art Spectrum: Dream Screen',
      subtitle: '아시아 신진작가 26명/팀 참여',
      
      // 날짜
      start_date: '2024-09-05',
      end_date: '2024-12-29',
      exhibition_type: 'special',
      status: 'closed', // 이미 종료된 전시
      
      // 장소 정보
      venue_name: '리움미술관',
      venue_city: '서울',
      venue_country: 'KR',
      venue_address: '서울특별시 용산구 이태원로55길 60, 블랙박스, 그라운드갤러리',
      
      // 전시 설명
      description: `국내 신진작가 지원 전시로 명맥을 이어온 '아트스펙트럼'이 급격하게 변화하는 동시대 미술 현장의 흐름에 걸맞은 전환을 꾀합니다. 수상제를 폐지함으로써 경쟁 체제를 탈피하고, 참여 작가의 범주를 국내에서 아시아로 확장해 다양한 문화적, 예술적 배경의 국내 및 아시아 창작자 26명/팀이 함께 하는 교류의 장을 만들었습니다.

2024 아트스펙트럼 《드림 스크린》은 밀레니얼 이후 세대가 인터넷, 게임, 영화 등 '스크린'이라는 매개체를 통한 경험을 체화하면서 물리적인 세계에 대해 이전과는 다른 감각을 갖게 된 점을 그 출발점으로 삼습니다.

[전시 컨셉]
전시 제목인 "드림 스크린"은 허구적이지만 보다 깊은 무의식의 영역을 드러내는 '꿈'과 직간접적인 경험을 중개하는 다종다양한 '스크린'을 합성한 표현이자, 스크린 너머로 떠오르는 환상이나 잔상을 의미하는 조어입니다.

[윈체스터 하우스 모티프]
19세기 후반에 지어진 미국 산호세 소재 윈체스터 하우스를 모티프로 삼아, 총기로 인해 사망한 이들의 혼이 찾아오지 못하도록 복잡하고 독특한 구조로 지어진 '귀신 들린 집'을 재현했습니다.

[전시 공간 구성]
• 마당, 입구, 복도, 20여 개의 독립적인 방으로 구성
• 방에서 방으로 이어지는 구성
• 미로 같은 동선으로 방향성의 상실과 고립감을 표현
• 각자만의 길을 찾아 작품을 감상하는 새로운 경험 제시

[주요 테마]
• 스크린을 통한 광범위한 정보와 감각 자극
• 다중적 서사를 통해 구성, 공유되는 공포
• 가공된 공포를 시대적 징후로 해석
• 물리적, 심리적 고립 세계에서의 관계 탐색

[작품 특징]
• 총 60점 중 23점 신작
• 인터넷, 서브컬처, 게임, 대중문화 기반
• 역사적 유산의 동시대적 해석
• 스크린 안팎을 왕복하는 작업`,
      
      // 작가 정보 (26명/팀)
      artists: [
        '최윤', '돈선필', '김대환', '프리실라 정', '강정석', '김희천',
        '김무영', '정지현', '콜론', '이은새', '리 이판', '소 유 누에',
        '박세영', '파트타임스위트', '리아르 리잘디', '콘칸 룽사왕',
        '류한솔', '스파클링 탭 워터', '카몬락 숙차이', '선다이얼',
        '후유히코 다카타', '아를렛 꾸잉-안 짠', '보 왕', '비비안 장',
        '헤 지케', '스텔라 종'
      ],
      curator: '전효경, 유지원',
      
      // 작품 정보
      artworks_count: 60,
      
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
      
      // 기타 정보 (DB 스키마에 없는 필드 제거)
      
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
    
    console.log('✅ 2024 아트스펙트럼 《드림 스크린》 데이터 입력 완료!');
    console.log('\n📋 입력된 전시 정보:');
    console.log(`  - ID: ${data[0].id}`);
    console.log(`  - 제목: ${data[0].title_local}`);
    console.log(`  - 참여 작가: ${data[0].artists.length}명/팀`);
    console.log(`  - 장소: ${data[0].venue_name} (블랙박스, 그라운드갤러리)`);
    console.log(`  - 기간: ${data[0].start_date} ~ ${data[0].end_date}`);
    console.log(`  - 작품수: ${data[0].artworks_count}점 (신작 23점 포함)`);
    console.log(`  - 상태: ${data[0].status} (종료)`);
    console.log(`  - 예술감독: 리크리트 티라바닛`);
    console.log(`  - 큐레이터: ${data[0].curator}`);
    
    // 리움미술관 2024년 전시 현황
    console.log('\n🔍 리움미술관 2024년 전시 현황...');
    const { data: leeum2024, error: leeum2024Error } = await supabase
      .from('exhibitions')
      .select('title_local, artists, start_date, end_date, status')
      .eq('venue_name', '리움미술관')
      .gte('start_date', '2024-01-01')
      .lt('start_date', '2025-01-01')
      .order('start_date', { ascending: true });
    
    if (!leeum2024Error && leeum2024) {
      console.log(`\n📅 리움미술관 2024년 전시: ${leeum2024.length}개`);
      leeum2024.forEach((ex, index) => {
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
importLeeumArtSpectrum2024();