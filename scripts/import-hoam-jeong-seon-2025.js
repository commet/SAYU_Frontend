const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function importHoamJeongSeon2025() {
  console.log('🎨 호암미술관 《겸재 정선》 전시 데이터 입력 시작...\n');
  
  try {
    const exhibitionData = {
      id: uuidv4(),
      
      // 기본 정보
      title_local: '겸재 정선',
      title_en: 'Gyeomjae Jeong Seon',
      subtitle: '한국회화사의 거장, 진경산수화의 대가',
      
      // 날짜
      start_date: '2025-04-02',
      end_date: '2025-06-29',
      exhibition_type: 'special',
      status: 'upcoming',
      
      // 장소 정보
      venue_name: '호암미술관',
      venue_city: '용인',
      venue_country: 'KR',
      venue_address: '경기도 용인시 처인구 포곡읍 에버랜드로 562번길 38',
      
      // 전시 설명
      description: `호암미술관은 한국회화사를 대표하는 화가이자 진경산수화의 대가인 겸재 정선(謙齋 鄭敾, 1676-1759)의 회화를 조명하는 대규모 기획전을 개최합니다.

[전시 의의]
• 정선 회화세계의 전모를 주요 작품들을 통해 보여주는 최초의 전시
• 정선이 남긴 작품에 나타난 내면세계와 예술혼까지 살펴보는 종합적 조망
• 정선의 회화세계를 다양한 관점에서 바라볼 수 있는 귀중한 기회

[주요 출품작]
정선의 대표작 165여 점이 출품되며, 다양한 장르의 작품을 통해 정선 회화의 정수를 감상할 수 있습니다.

• 진경산수화: 정선의 대표 장르
• 산수화: 전통 산수화 양식
• 인물화: 인물 묘사 작품들
• 화조영모화: 화조와 동물 그림

[주요 전시품 - 교체 전시]

《인왕제색도》 (仁王霽色圖)
• 전시 기간: 4월 2일 ~ 5월 6일
• 정선의 최고 걸작 중 하나
• 인왕산을 그린 대표적인 진경산수화

《풍악내산총람》 (楓岳內山摠覽) 
• 전시 기간: 5월 7일 ~ 6월 29일
• 인왕제색도와 교체 전시
• 금강산 내산을 그린 작품

《여산초당》 (廬山草堂)
• 전시 기간: 4월 2일 ~ 6월 1일

《여산폭》 (廬山瀑)
• 전시 기간: 6월 3일 ~ 6월 29일
• 여산초당과 교체 전시

[공동 주최]
• 삼성문화재단 (호암미술관)
• 간송미술문화재단
고미술계 양대 사립기관의 협력으로 실현된 의미 있는 전시

[출품 기관]
• 간송미술문화재단: 정선의 주요 작품 다수 소장
• 국립중앙박물관
• 여러 기관 및 개인 소장품

[순회 전시]
2026년 하반기 대구간송미술관에서 본 전시의 주요 작품 및 새로운 작품을 더해 순회전 개최 예정

[겸재 정선 (謙齋 鄭敾, 1676-1759)]
• 조선 후기를 대표하는 화가
• 진경산수화의 창시자이자 대가
• 실제 우리나라 산천을 그린 진경산수화로 한국 회화사에 획기적 전환점 마련
• 인왕산, 금강산, 관동팔경 등을 소재로 한 대표작들
• 83세까지 장수하며 많은 작품 남김

[진경산수화의 의의]
• 중국의 이상적 산수가 아닌 우리 땅의 실제 풍경을 그림
• 한국적 정서와 미감이 담긴 독창적 회화 양식 확립
• 조선 후기 회화 발전에 지대한 영향
• 우리나라 산천에 대한 애정과 자부심 표현

[전시 특징]
• 작품 교체를 통한 다양한 명품 감상 기회
• 국내 주요 소장처의 협력으로 실현된 역대 최대 규모
• 정선 회화의 모든 장르를 아우르는 종합적 구성
• 학술적 가치와 대중적 감동을 동시에 추구`,
      
      // 작가 정보
      artists: ['겸재 정선 (謙齋 鄭敾, 1676-1759)'],
      curator: '호암미술관, 간송미술문화재단',
      
      // 작품 정보
      artworks_count: 165, // 정선의 대표작 165여 점
      
      // 관람 정보
      admission_fee: '별도 공지',
      operating_hours: JSON.stringify({
        운영시간: '화-일 10:00-18:00 (예상)',
        휴관일: '매주 월요일 (예상)',
        예약: '전시예약 필요',
        특이사항: '작품 교체로 인한 관람 시기 확인 필요'
      }),
      
      // 연락처
      contact_info: JSON.stringify({
        대표: '031-320-1801~2',
        문의: '031-320-1801',
        홈페이지: 'hoam.samsung.org',
        예약: '전시예약 시스템 이용'
      }),
      phone_number: '031-320-1801',
      
      // URL 정보
      official_url: 'https://hoam.samsung.org',
      website_url: 'https://hoam.samsung.org',
      
      // 데이터 메타정보
      source: 'hoam_official',
      source_url: 'https://hoam.samsung.org',
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
    
    console.log('✅ 《겸재 정선》 전시 데이터 입력 완료!');
    console.log('\n📋 입력된 전시 정보:');
    console.log(`  - ID: ${data[0].id}`);
    console.log(`  - 제목: ${data[0].title_local}`);
    console.log(`  - 부제: ${data[0].subtitle}`);
    console.log(`  - 작가: ${data[0].artists.join(', ')}`);
    console.log(`  - 장소: ${data[0].venue_name} (전시실 1, 2)`);
    console.log(`  - 기간: ${data[0].start_date} ~ ${data[0].end_date}`);
    console.log(`  - 작품수: ${data[0].artworks_count}여 점`);
    console.log(`  - 상태: ${data[0].status}`);
    console.log(`  - 공동주최: 삼성문화재단 & 간송미술문화재단`);
    console.log(`  - 협찬: 삼성증권`);
    
    // 작품 교체 정보
    console.log('\n🔄 주요 작품 교체 일정:');
    console.log('1. 인왕제색도 (4.2-5.6) → 풍악내산총람 (5.7-6.29)');
    console.log('2. 여산초당 (4.2-6.1) → 여산폭 (6.3-6.29)');
    
    // 호암미술관 전체 전시 현황
    console.log('\n🔍 호암미술관 2025년 전시 현황...');
    const { data: hoam2025, error: hoamError } = await supabase
      .from('exhibitions')
      .select('title_local, start_date, end_date, status')
      .eq('venue_name', '호암미술관')
      .gte('start_date', '2025-01-01')
      .order('start_date', { ascending: true });
    
    if (!hoamError && hoam2025) {
      console.log(`\n🏛️ 호암미술관 2025년: ${hoam2025.length}개`);
      hoam2025.forEach((ex, index) => {
        const statusIcon = ex.status === 'closed' ? '✅' : 
                          ex.status === 'ongoing' ? '🔄' : '📅';
        console.log(`${index + 1}. ${ex.title_local} ${statusIcon}`);
        console.log(`   ${ex.start_date} ~ ${ex.end_date}`);
      });
    }
    
    // 전통 회화 전시 검색
    console.log('\n🔍 전통 회화 전시 검색...');
    const { data: traditionalPainting, error: traditionalError } = await supabase
      .from('exhibitions')
      .select('title_local, venue_name, start_date, end_date')
      .or('description.ilike.%산수화%,description.ilike.%전통%,description.ilike.%조선%,description.ilike.%고려%,title_local.ilike.%정선%,title_local.ilike.%겸재%')
      .order('start_date', { ascending: false });
    
    if (!traditionalError && traditionalPainting) {
      console.log(`\n🎨 전통 회화 관련 전시: ${traditionalPainting.length}개`);
      traditionalPainting.slice(0, 5).forEach((ex, index) => {
        console.log(`${index + 1}. ${ex.title_local} (${ex.venue_name})`);
        console.log(`   ${ex.start_date} ~ ${ex.end_date}`);
      });
    }
    
  } catch (error) {
    console.error('❌ 데이터 입력 중 오류 발생:', error.message);
    if (error.details) console.error('세부사항:', error.details);
  }
}

// 실행
importHoamJeongSeon2025();