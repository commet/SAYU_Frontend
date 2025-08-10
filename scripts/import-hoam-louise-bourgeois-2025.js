const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function importHoamLouiseBourgeois2025() {
  console.log('🎨 호암미술관 루이즈 부르주아 개인전 데이터 입력 시작...\n');
  
  try {
    const exhibitionData = {
      id: uuidv4(),
      
      // 기본 정보
      title_local: '루이즈 부르주아 개인전',
      title_en: 'Louise Bourgeois Solo Exhibition',
      subtitle: '20세기 현대미술의 거장, 한국 25년 만의 대규모 개인전',
      
      // 날짜
      start_date: '2025-08-30',
      end_date: '2026-01-04',
      exhibition_type: 'special',
      status: 'upcoming',
      
      // 장소 정보
      venue_name: '호암미술관',
      venue_city: '용인',
      venue_country: 'KR',
      venue_address: '경기도 용인시 처인구 포곡읍 에버랜드로 562번길 38',
      
      // 전시 설명
      description: `2025년 하반기 호암미술관에서는 20세기 현대미술의 거장, 루이즈 부르주아의 개인전을 개최합니다. 이번 전시는 한국에서 25년 만에 열리는 부르주아의 대규모 미술관 개인전으로, 거대한 거미 조각과 초기 회화 등 주요 작품이 두루 출품됩니다.

[전시 의의]
• 한국에서 25년 만에 열리는 루이즈 부르주아 대규모 미술관 개인전
• 20세기 현대미술의 거장 작품 세계 총체적 조망
• 작가의 내면 세계와 정신분석적 접근을 통한 깊이 있는 이해

[주요 출품작]

《엄마》 (Maman, 1999)
• 재료: 청동, 스테인리스 스틸, 대리석
• 크기: 927.1 x 891.5 x 1023.6cm
• 소장: 리움미술관
• 특징: 거대한 거미 조각, 모성과 보호 본능을 상징
• 설치: 호암미술관 희원 (정원) 설치 예정

《밀실 XI(초상)》 (Cell XI - Portrait)
• 소장: 리움미술관
• 특징: 부르주아의 대표적인 밀실(Cell) 연작

초기 회화 작품들
• 특징: 한국에서 최초로 전시되는 작품들
• 의의: 작가의 예술적 출발점과 발전 과정 조망

[전시 구성]
• 전시 공간: 전시실 1, 2
• 정원 설치: 호암미술관 희원에 《엄마》 조각 설치
• 아카이브: 일기와 정신분석일지 등 작가의 내면 세계를 보여주는 글

[작가 소개: 루이즈 부르주아 (Louise Bourgeois, 1911-2010)]
• 프랑스 태생 미국 작가
• 20세기 현대미술의 거장
• 조각, 설치, 회화, 판화 등 다양한 매체 활용
• 모성, 가족관계, 성(性), 무의식 등을 주제로 한 강렬한 작품 세계
• 거미를 모티프로 한 《마망(Maman)》 시리즈로 세계적 명성

[주요 테마]
• 모성과 보호 본능
• 가족관계와 트라우마
• 여성성과 성적 정체성  
• 무의식과 정신분석
• 공간과 기억의 관계
• 취약성과 강인함의 이중성

[전시 특징]
• 리움미술관과의 협력 전시
• 삼성문화재단 운영 미술관 간 소장품 교류
• 대형 야외 조각 설치로 정원과 전시의 조화
• 작가의 글과 아카이브를 통한 심층적 접근
• 25년 만의 한국 대규모 개인전이라는 역사적 의미`,
      
      // 작가 정보
      artists: ['루이즈 부르주아 (Louise Bourgeois)'],
      curator: '호암미술관',
      
      // 작품 정보
      artworks_count: 0, // 구체적 수량 미공개, 주요 작품과 초기 회화 등 다수 출품 예정
      
      // 관람 정보
      admission_fee: '별도 공지 예정',
      operating_hours: JSON.stringify({
        운영시간: '화-일 10:00-18:00 (예상)',
        휴관일: '매주 월요일 (예상)',
        예약: '별도 안내 예정'
      }),
      
      // 연락처
      contact_info: JSON.stringify({
        대표: '031-320-1801~2',
        문의: '031-320-1801',
        홈페이지: 'hoam.samsung.org'
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
    
    console.log('✅ 루이즈 부르주아 개인전 데이터 입력 완료!');
    console.log('\n📋 입력된 전시 정보:');
    console.log(`  - ID: ${data[0].id}`);
    console.log(`  - 제목: ${data[0].title_local}`);
    console.log(`  - 부제: ${data[0].subtitle}`);
    console.log(`  - 작가: ${data[0].artists.join(', ')}`);
    console.log(`  - 장소: ${data[0].venue_name} (전시실 1, 2 + 희원)`);
    console.log(`  - 주소: ${data[0].venue_address}`);
    console.log(`  - 기간: ${data[0].start_date} ~ ${data[0].end_date}`);
    console.log(`  - 연락처: ${data[0].phone_number}`);
    console.log(`  - 상태: ${data[0].status}`);
    console.log(`  - 주요 작품: 《엄마》, 《밀실 XI》, 초기 회화`);
    
    // 호암미술관 전시 현황 확인
    console.log('\n🔍 호암미술관 전시 현황...');
    const { data: hoamExhibitions, error: hoamError } = await supabase
      .from('exhibitions')
      .select('title_local, start_date, end_date, status')
      .eq('venue_name', '호암미술관')
      .order('start_date', { ascending: false });
    
    if (!hoamError && hoamExhibitions) {
      console.log(`\n🏛️ 호암미술관 전시: ${hoamExhibitions.length}개`);
      hoamExhibitions.forEach((ex, index) => {
        const statusIcon = ex.status === 'closed' ? '✅' : 
                          ex.status === 'ongoing' ? '🔄' : '📅';
        console.log(`${index + 1}. ${ex.title_local} ${statusIcon}`);
        console.log(`   ${ex.start_date} ~ ${ex.end_date}`);
      });
    }
    
    // 삼성문화재단 미술관 현황
    console.log('\n🔍 삼성문화재단 미술관 현황...');
    const { data: samsungMuseums, error: samsungError } = await supabase
      .from('exhibitions')
      .select('venue_name, title_local, start_date, end_date')
      .in('venue_name', ['리움미술관', '호암미술관'])
      .gte('start_date', '2025-01-01')
      .order('start_date', { ascending: true });
    
    if (!samsungError && samsungMuseums) {
      const leeumCount = samsungMuseums.filter(ex => ex.venue_name === '리움미술관').length;
      const hoamCount = samsungMuseums.filter(ex => ex.venue_name === '호암미술관').length;
      
      console.log(`\n🏢 삼성문화재단 2025년 전시 계획:`);
      console.log(`   - 리움미술관: ${leeumCount}개`);
      console.log(`   - 호암미술관: ${hoamCount}개`);
      console.log(`   - 총합: ${samsungMuseums.length}개`);
    }
    
  } catch (error) {
    console.error('❌ 데이터 입력 중 오류 발생:', error.message);
    if (error.details) console.error('세부사항:', error.details);
  }
}

// 실행
importHoamLouiseBourgeois2025();