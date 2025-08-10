const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// 국립중앙박물관 특별전시 데이터 입력 템플릿
async function importNationalMuseumExhibitions() {
  console.log('🏛️ 국립중앙박물관 특별전시 데이터 입력 시작...\n');
  
  try {
    // 여러 전시를 배열로 관리
    const exhibitions = [
      // 마나 모아나-신성한 바다의 예술, 오세아니아
      {
        id: uuidv4(),
        
        // 기본 정보
        title_local: '마나 모아나-신성한 바다의 예술, 오세아니아',
        title_en: 'Mana Moana: Arts of Oceania',
        subtitle: '국내 최초 오세아니아 예술 특별전',
        
        // 날짜
        start_date: '2025-04-30',
        end_date: '2025-09-14',
        exhibition_type: 'special',
        status: 'ongoing',
        
        // 장소 정보
        venue_name: '국립중앙박물관',
        venue_city: '서울',
        venue_country: 'KR',
        venue_address: '서울특별시 용산구 서빙고로 137, 특별전시실2',
        
        // 전시 설명
        description: `지구 표면의 3분의 1. 모든 육지를 합한 것보다 더 큰 바다. 바로 태평양입니다. 이 거대한 바다에서 인간은 배를 띄우고, 섬을 찾고, 자신의 뿌리를 만들었습니다.

특별전 '마나 모아나-신성한 바다의 예술, 오세아니아'는 국립중앙박물관과 프랑스 케브랑리-자크시라크 박물관이 공동으로 기획한 전시로, 18세기부터 현대까지 오세아니아의 전통 예술품과 현대 작품을 소개합니다.

폴리네시아어로 '마나mana'는 모든 존재에 깃든 신성한 힘을, '모아나moana'는 거대한 바다를 뜻합니다. 신성한 바다를 삶의 터전이자 연결의 공간으로 삼은 이들에게 '마나'는 삶과 자연, 조상을 존중하는 마음의 근원이자 세상을 움직이는 힘입니다.

[전시품]
• 대형 카누, 조각, 석상
• 악기, 장신구, 직물
• 18세기~20세기 오세아니아 소장품 180여 건

[전시 특징]
• 국내 최초 오세아니아 예술 대규모 전시
• 프랑스 케브랑리-자크시라크박물관 소장품
• 어린이·가족 프로그램 운영
• 그림책, 오디오가이드, 특별 패널 제공

[관람 시간]
• 월,화,목,금,일: 10:00-18:00
• 수,토: 10:00-21:00

[도슨트]
• 매일 11:00, 14:00 (1일 2회)
• 큐레이터와의 대화: 월 2-3회

담당: 전시과 백승미 1588-7890`,
        
        // 작가/큐레이터 정보
        artists: [],
        curator: '국립중앙박물관, 프랑스 케브랑리-자크시라크박물관',
        
        // 작품 정보
        artworks_count: 180,
        
        // 관람 정보
        admission_fee: '성인 5,000원 / 청소년 3,000원 / 65세 이상 무료',
        operating_hours: JSON.stringify({
          '월화목금일': '10:00-18:00',
          '수토': '10:00-21:00',
          휴관일: '1월 1일, 설날, 추석',
          도슨트: '매일 11:00, 14:00'
        }),
        
        // 연락처
        contact_info: JSON.stringify({
          담당부서: '전시과',
          담당자: '백승미',
          문의: '1588-7890',
          대표: '02-2077-9000'
        }),
        phone_number: '1588-7890',
        
        // URL 정보
        official_url: 'https://www.museum.go.kr',
        website_url: 'https://www.museum.go.kr',
        
        // 데이터 메타정보
        source: 'national_museum_official',
        source_url: 'https://www.museum.go.kr',
        collected_at: new Date().toISOString(),
        
        // 기본값 설정
        view_count: 0,
        ai_verified: true,
        ai_confidence: 0.95
      },
      
      // 두 발로 세계를 제패하다
      {
        id: uuidv4(),
        
        // 기본 정보
        title_local: '두 발로 세계를 제패하다',
        title_en: 'Conquering the World with Two Feet',
        subtitle: '광복 80주년 기념 특별전',
        
        // 날짜
        start_date: '2025-07-25',
        end_date: '2025-12-28',
        exhibition_type: 'special',
        status: 'upcoming',
        
        // 장소 정보
        venue_name: '국립중앙박물관',
        venue_city: '서울',
        venue_country: 'KR',
        venue_address: '서울특별시 용산구 서빙고로 137, 상설전시관 2층 기증1실',
        
        // 전시 설명
        description: `국립중앙박물관은 광복 80주년을 맞이하여 특별전 〈두 발로 세계를 제패하다〉를 개최합니다.

1936년 베를린 올림픽에서 조국을 가슴에 품고 달렸던 손기정 선수와 그의 발자취를 따라 세계 무대에서 활약한 제자들의 이야기, 그리고 1988년 서울에서 성화를 봉송했던 감동의 순간들을 담았습니다.

"족패천하足覇天下", 두 발로 세상에 용기와 희망을 전한 손기정 선수의 이야기에 여러분을 초대합니다.

[주요 전시품]
• 1936년 베를린올림픽 우승 청동투구 (보물, 손기정 기증)
• 금메달
• 월계관
• 총 18건 18점

[전시 의의]
• 광복 80주년 기념
• 손기정 선수의 역사적 의미 재조명
• 한국 육상 역사의 발자취
• 1988 서울올림픽의 기억

[관람 정보]
• 장소: 상설전시관 2층 기증1실
• 관람료: 무료
• 예약: 불필요 (자유 관람)

담당: 세계문화부 권혜은 02-2077-9553`,
        
        // 작가/큐레이터 정보
        artists: [],
        curator: '국립중앙박물관',
        
        // 작품 정보
        artworks_count: 18,
        
        // 관람 정보
        admission_fee: '무료',
        operating_hours: JSON.stringify({
          평일: '10:00-18:00',
          수요일: '10:00-21:00',
          토요일: '10:00-21:00',
          일요일: '10:00-18:00',
          휴관일: '1월 1일, 설날, 추석'
        }),
        
        // 연락처
        contact_info: JSON.stringify({
          담당부서: '세계문화부',
          담당자: '권혜은',
          문의: '02-2077-9553',
          대표: '02-2077-9000'
        }),
        phone_number: '02-2077-9553',
        
        // URL 정보
        official_url: 'https://www.museum.go.kr',
        website_url: 'https://www.museum.go.kr',
        
        // 데이터 메타정보
        source: 'national_museum_official',
        source_url: 'https://www.museum.go.kr',
        collected_at: new Date().toISOString(),
        
        // 기본값 설정
        view_count: 0,
        ai_verified: true,
        ai_confidence: 0.95
      },
      
      // 일본미술, 네 가지 시선
      {
        id: uuidv4(),
        
        // 기본 정보
        title_local: '일본미술, 네 가지 시선',
        title_en: 'Japanese Art, Four Perspectives',
        subtitle: '한일 국교 정상화 60주년 기념 특별전',
        
        // 날짜
        start_date: '2025-06-17',
        end_date: '2025-08-10',
        exhibition_type: 'special',
        status: 'upcoming',
        
        // 장소 정보
        venue_name: '국립중앙박물관',
        venue_city: '서울',
        venue_country: 'KR',
        venue_address: '서울특별시 용산구 서빙고로 137, 상설전시관 3층 306호',
        
        // 전시 설명
        description: `국립중앙박물관과 도쿄국립박물관은 한일 국교 정상화 60주년을 기념하여, 일본미술을 새로운 시각에서 조망하는 특별전 《일본미술, 네 가지 시선》을 공동 개최합니다.

이번 전시는 도쿄국립박물관과 국립중앙박물관이 엄선한 소장품 62건을 중심으로, 일본미술이 지닌 외적인 아름다움과 내면의 정서를 눈과 마음으로 감상할 수 있도록 구성하였습니다.

[네 가지 시선]
• 화려한 장식성(飾り)
• 절제된 미(反飾り)
• 자연의 섬세한 변화에 대한 감동(あはれ)
• 유쾌하고 재치 있는 미적 감각(遊び)

이 요소들은 서로 유기적으로 어우러지며 일본인의 삶과 세계관을 반영합니다. 일본미술의 시각적 매력을 넘어서, 그 내면에 흐르는 사유와 감성을 오롯이 경험하는 기회를 선사할 것입니다.

[전시 특징]
• 한일 공동 기획 전시
• 도쿄국립박물관 소장품 포함
• 가을풀무늬 고소데 등 주요 작품
• 무료 관람

[운영 정보]
• 장소: 상설전시관 3층 306호
• 예약: 불필요 (자유 관람)
• 촬영: 동영상 촬영 불가, 플래시/조명/삼각대 사용 불가
• 도록: PDF 무료 제공 (판매 없음)

담당: 세계문화부 최종은 02-2077-9554`,
        
        // 작가/큐레이터 정보
        artists: [],
        curator: '국립중앙박물관, 도쿄국립박물관',
        
        // 작품 정보
        artworks_count: 62,
        
        // 관람 정보
        admission_fee: '무료',
        operating_hours: JSON.stringify({
          평일: '10:00-18:00',
          수요일: '10:00-21:00',
          토요일: '10:00-21:00',
          일요일: '10:00-18:00',
          휴관일: '1월 1일, 설날, 추석'
        }),
        
        // 연락처
        contact_info: JSON.stringify({
          담당부서: '세계문화부',
          담당자: '최종은',
          문의: '02-2077-9554',
          대표: '02-2077-9000'
        }),
        phone_number: '02-2077-9554',
        
        // URL 정보
        official_url: 'https://www.museum.go.kr',
        website_url: 'https://www.museum.go.kr',
        
        // 데이터 메타정보
        source: 'national_museum_official',
        source_url: 'https://www.museum.go.kr',
        collected_at: new Date().toISOString(),
        
        // 기본값 설정
        view_count: 0,
        ai_verified: true,
        ai_confidence: 0.95
      }
    ];

    // 실제 전시가 추가되면 주석 해제
    if (exhibitions.length === 1 && exhibitions[0].title_local === '전시 제목') {
      console.log('⚠️ 아직 입력할 전시 정보가 없습니다.');
      console.log('전시 정보를 제공해주시면 바로 입력하겠습니다.');
      return;
    }

    // 데이터 입력
    for (const exhibition of exhibitions) {
      console.log(`📝 ${exhibition.title_local} 입력 중...`);
      
      const { data, error } = await supabase
        .from('exhibitions')
        .insert([exhibition])
        .select();
      
      if (error) {
        console.error(`❌ ${exhibition.title_local} 입력 실패:`, error.message);
        continue;
      }
      
      console.log(`✅ ${exhibition.title_local} 입력 완료`);
    }
    
    // 국립중앙박물관 전시 현황 확인
    console.log('\n🔍 국립중앙박물관 전시 현황...');
    const { data: nmkExhibitions, error: nmkError } = await supabase
      .from('exhibitions')
      .select('title_local, start_date, end_date, status')
      .eq('venue_name', '국립중앙박물관')
      .order('start_date', { ascending: false });
    
    if (!nmkError && nmkExhibitions) {
      console.log(`\n📌 국립중앙박물관 전시: ${nmkExhibitions.length}개`);
      nmkExhibitions.forEach(ex => {
        console.log(`  - ${ex.title_local} (${ex.start_date} ~ ${ex.end_date}) [${ex.status}]`);
      });
    }
    
  } catch (error) {
    console.error('❌ 데이터 입력 중 오류 발생:', error.message);
    if (error.details) console.error('세부사항:', error.details);
  }
}

// 실행
importNationalMuseumExhibitions();