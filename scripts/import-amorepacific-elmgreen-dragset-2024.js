const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function importAmorepacificElmgreenDragset2024() {
  console.log('🎨 아모레퍼시픽미술관 《Elmgreen & Dragset: Spaces》 전시 데이터 입력 시작...\n');
  
  try {
    const exhibitionData = {
      id: uuidv4(),
      
      // 기본 정보
      title_local: 'Elmgreen & Dragset: Spaces',
      title_en: 'Elmgreen & Dragset: Spaces',
      subtitle: '아시아 최대 규모 엘름그린 & 드라그셋 전시',
      
      // 날짜
      start_date: '2024-09-03',
      end_date: '2025-02-23',
      exhibition_type: 'special',
      status: 'ongoing',
      
      // 장소 정보
      venue_name: '아모레퍼시픽미술관',
      venue_city: '서울',
      venue_country: 'KR',
      venue_address: '서울특별시 용산구 한강대로 100 (한강로2가 181)',
      
      // 전시 설명
      description: `아모레퍼시픽미술관은 2024년 하반기 현대미술 기획전으로 엘름그린 & 드라그셋의 《Spaces》를 개최합니다.

[작가 소개: 엘름그린 & 드라그셋 (Elmgreen & Dragset)]
• 마이클 엘름그린(Michael Elmgreen, 1961~): 북유럽 출신
• 잉가 드라그셋(Ingar Dragset, 1969~): 북유럽 출신
• 1995년 아티스트 듀오 결성
• 조각, 설치, 퍼포먼스 등 다양한 매체 활용
• 고착화된 사회, 정치적 구조를 새롭게 바라보는 시각 제시

[전시 개요]
• 국내에서 8년 만에 개최되는 미술관 전시
• 아시아에서 열린 전시 중 최대 규모
• 공간 설치 작업 중심, 작품 50여 점 전시
• 미술관 1F 로비, B1 1~7전시실, 교육실 등 전체 공간 활용

[주요 작품 및 공간 구성]
듀오는 이번 전시에서 집, 수영장, 레스토랑, 주방, 그리고 작가 아뜰리에 이르기까지 총 다섯 개의 대규모 공간 설치 작업을 선보입니다.

1. 첫 번째 전시실: 가상의 집
   - 작가들이 디자인한 집과 그 안의 다양한 요소들
   - 가상의 거주자에 대한 단서 탐색 가능

2. 두 번째 전시실: 실제 규모의 수영장
   - 물이 빠진 수영장 설치
   - 작가들의 반복되는 모티프
   - 오늘날 공공 장소의 쇠퇴와 공동체 상실을 암시

3. 더 클라우드(The Cloud) 레스토랑
   - 실제 운영 중인 레스토랑과 다름없는 모습의 설치 작품
   - 테이블 사이를 거닐며 관람
   - 영상통화 중인 사람 형상의 작품 등 현실과 허구의 경계에 위치한 작품들

4. 실험실 같은 주방 공간

5. 작가의 아뜰리에

[작품 세계와 의미]
엘름그린 & 드라그셋은 전시 공간을 예기치 못한 환경으로 탈바꿈하여 기존 공간의 기능과 의미를 전복시키는 경험을 선사해왔습니다. 관객은 상상하기 어려운 규모와 형태의 작업을 만나며, 익숙한 대상을 새롭게 바라보는 특별한 경험을 하게 됩니다.

미술관 공간은 그 자체가 크고 작은 조각 작품들을 감상할 수 있는 무대이며, 관람객은 그 안에서 스스로 새로운 의미들을 찾아 나아가는 주인공이 됩니다.`,
      
      // 아티스트 정보
      artists: ['Michael Elmgreen', 'Ingar Dragset'],
      
      // 기타 정보
      curator: null,
      artworks_count: 50,
      
      // 메타데이터
      source: 'amorepacific_museum',
      source_url: 'https://www.amorepacific.com/museum',
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
    console.log('👥 아티스트:', exhibitionData.artists.join(' & '));
    console.log('🎨 작품 수:', exhibitionData.artworks_count + '여 점');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

// 실행
importAmorepacificElmgreenDragset2024();