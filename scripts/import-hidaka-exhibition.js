const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function importHidakaExhibition() {
  console.log('🎨 크리스찬 히다카 전시 데이터 입력 시작...\n');
  
  try {
    const exhibitionData = {
      id: uuidv4(),
      
      // 기본 정보
      title_local: '크리스찬 히다카: 하늘이 극장이 되고, 극장이 하늘에 있으니',
      title_en: 'Christian Hidaka: The Sky Becomes a Theater, The Theater is in the Sky',
      subtitle: '어린이+ 전시',
      
      // 날짜
      start_date: '2025-06-05',
      end_date: '2026-05-10',
      exhibition_type: 'special',
      status: 'upcoming',
      
      // 장소 정보
      venue_name: '서울시립 북서울미술관',
      venue_city: '서울',
      venue_country: 'KR',
      venue_address: '서울특별시 노원구 동일로 1238, B1 전시실 5, 6',
      
      // 전시 설명
      description: `회화의 역사를 거슬러 올라가면 우리는 무엇인가를 기억하기 위해 그림을 그렸다는 사실을 발견할 수 있습니다. 어린이+ 전시 《크리스찬 히다카: 하늘이 극장이 되고, 극장이 하늘에 있으니》는 이미지와 기억에 대하여, 나아가 예술이 건네는 세계의 이해에 대한 질문에서 출발합니다.

작가는 일본인 어머니와 영국인 아버지 사이에서 태어나 영국에서 예술을 공부하고 그림을 그렸습니다. 그의 그림에는 반 고흐, 피카소 같은 예술가들의 흔적과 자연, 역사, 신화에 대한 여러 이야기들도 숨어 있습니다. 특히 동양과 서양의 역사 속 여러 시간과 공간을 한 화면으로 불러 모아 이야기를 만들어 내며 자신이 갖고 있는 초문화주의적 관점을 드러냅니다.

[전시 특징]
• 공간 전체를 아우르는 대형 벽화 작품
• 동서양 원근법의 융합
• 르네상스 템페라와 동양 석청 안료 사용
• 어린이+ 전시 프로그램

[전시 정보]
• 장소: B1 전시실 5, 6
• 작품수: 19점
• 장르: 회화, 벽화, 설치
• 관람료: 무료

[도슨트 프로그램]
• 매주 화~일요일 14:30
• 휴관일, 명절 연휴 제외
• 전시 도슨팅 앱 제공

[운영 시간]
• 평일(화-금): 10:00-20:00
• 주말: 10:00-19:00 (하절기) / 10:00-18:00 (동절기)
• 금요일 문화의 밤: 10:00-21:00
• 휴관일: 매주 월요일, 1월 1일

[후원]
• 주최: 서울시립미술관
• 협찬: 삼화페인트

문의: 이진 02-2124-5269`,
      
      // 작가 정보
      artists: ['크리스찬 히다카 (Christian Hidaka)'],
      curator: '서울시립 북서울미술관',
      
      // 작품 정보
      artworks_count: 19,
      
      // 관람 정보
      admission_fee: '무료',
      operating_hours: JSON.stringify({
        평일: '10:00-20:00 (화-금)',
        주말: '10:00-19:00 (하절기) / 10:00-18:00 (동절기)',
        문화의밤: '10:00-21:00 (금)',
        휴관일: '월요일, 1월 1일'
      }),
      
      // 연락처
      contact_info: JSON.stringify({
        전시문의: '이진 02-2124-5269',
        관람문의: '안내데스크 02-2124-5248,5249'
      }),
      phone_number: '02-2124-5248',
      
      // URL 정보
      official_url: 'https://sema.seoul.go.kr',
      website_url: 'https://sema.seoul.go.kr',
      
      // 데이터 메타정보
      source: 'seoul_museum_official',
      source_url: 'https://sema.seoul.go.kr',
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
    
    console.log('✅ 크리스찬 히다카 전시 데이터 입력 완료!');
    console.log('\n📋 입력된 전시 정보:');
    console.log(`  - ID: ${data[0].id}`);
    console.log(`  - 제목: ${data[0].title_local}`);
    console.log(`  - 작가: ${data[0].artists.join(', ')}`);
    console.log(`  - 장소: ${data[0].venue_name}`);
    console.log(`  - 기간: ${data[0].start_date} ~ ${data[0].end_date}`);
    console.log(`  - 작품수: ${data[0].artworks_count}점`);
    console.log(`  - 상태: ${data[0].status}`);
    
    // 전체 서울시립미술관 전시 확인
    console.log('\n🔍 서울시립미술관 전시 현황...');
    const { data: semaExhibitions, error: semaError } = await supabase
      .from('exhibitions')
      .select('title_local, venue_name, exhibition_type, status')
      .or('venue_name.ilike.%서울시립%,venue_name.ilike.%북서울%')
      .order('start_date', { ascending: false });
    
    if (!semaError && semaExhibitions) {
      console.log(`\n📌 서울시립미술관 계열 전시: ${semaExhibitions.length}개`);
      semaExhibitions.slice(0, 5).forEach(ex => {
        console.log(`  - ${ex.title_local} (${ex.venue_name}, ${ex.status})`);
      });
    }
    
  } catch (error) {
    console.error('❌ 데이터 입력 중 오류 발생:', error.message);
    if (error.details) console.error('세부사항:', error.details);
  }
}

// 실행
importHidakaExhibition();