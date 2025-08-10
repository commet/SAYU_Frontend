const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function importKwonJinkyuExhibition() {
  console.log('🎨 권진규의 영원한 집 상설전 데이터 입력 시작...\n');
  
  try {
    const exhibitionData = {
      id: uuidv4(),
      
      // 기본 정보
      title_local: '권진규의 영원한 집',
      title_en: "Kwon Jin-kyu's Eternal Home",
      subtitle: '권진규 작고 50주기 상설전시',
      
      // 날짜 (상설 전시)
      start_date: '2023-01-01', // 2023년 작고 50주기에 시작
      end_date: '2099-12-31', // 상설 전시
      exhibition_type: 'permanent',
      status: 'ongoing',
      
      // 장소 정보
      venue_name: '서울시립 남서울미술관',
      venue_city: '서울',
      venue_country: 'KR',
      venue_address: '서울특별시 관악구 남부순환로 2076, 1층 전시실',
      
      // 전시 설명
      description: `2021년 7월 (사)권진규기념사업회와 유족은 많은 사람이 권진규의 작품을 접하길 바라는 마음으로 서울시립미술관에 총 141점의 작품을 기증했습니다. 기증작품은 1950년대부터 1970년대에 이르는 조각, 소조, 부조, 드로잉, 유화 등으로 다양한데, 특히 1950년대 주요 작품이 포함되어 있습니다.

2023년 미술관은 권진규 작고 50주기를 맞아 벨기에영사관이었던 서울시립 남서울미술관 1층 5개의 전시실을 권진규 상설전시실로 조성했습니다. 권진규는 일제강점기를 거쳐 광복 이후 한일국교단절 상황에서 한국과 일본을 어렵게 오가며 조각가로 활동했습니다.

권진규에게 진정한 작품은 자기 주변의 대상을 끊임없이 관찰, 연구하여 단순히 본질만을 담아낸 것이었습니다. 그가 추구한 것은 사실적인 것도, 아름다운 것도 아닌, 결코 사라지지 않는 영혼, 영원성이었습니다.

[전시 구성 - 7개 소주제]
도쿄 무사시노미술학교 시기:
• 새로운 조각
• 오기노 도모
• 동등한 인체

서울 아틀리에 시기:
• 내면
• 영감
• 인연
• 귀의

[전시 정보]
• 장소: 1층 전시실 (5개 전시실)
• 작품: 26점
• 아카이브 자료: 88점
• 장르: 조각, 소조, 부조, 드로잉, 유화
• 관람료: 무료

[특별 도슨트]
• 정규 도슨트: 매일 오후 3시 30분 (월, 휴관일 제외)
• 특별 도슨트: 매주 수요일 오후 2시 (허명회 고려대 명예교수)

[운영 시간]
• 평일(화-금): 10:00-20:00
• 주말/공휴일: 10:00-18:00
• 휴관일: 매주 월요일, 1월 1일

[후원]
• 주최: 서울시립미술관
• 후원: (사)권진규기념사업회, 에르메스 코리아

문의: 한희진 02-2124-8970`,
      
      // 작가 정보
      artists: ['권진규'],
      curator: '서울시립 남서울미술관',
      
      // 작품 정보
      artworks_count: 26, // 작품 26점 + 자료 88점
      
      // 관람 정보
      admission_fee: '무료',
      operating_hours: JSON.stringify({
        평일: '10:00-20:00 (화-금)',
        주말: '10:00-18:00',
        휴관일: '월요일, 1월 1일',
        도슨트: '매일 15:30, 수요일 특별 도슨트 14:00'
      }),
      
      // 연락처
      contact_info: JSON.stringify({
        전시문의: '한희진 02-2124-8970',
        관람문의: '안내데스크 02-598-6245~7'
      }),
      phone_number: '02-598-6245',
      
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
    
    console.log('✅ 권진규의 영원한 집 상설전 데이터 입력 완료!');
    console.log('\n📋 입력된 전시 정보:');
    console.log(`  - ID: ${data[0].id}`);
    console.log(`  - 제목: ${data[0].title_local}`);
    console.log(`  - 작가: ${data[0].artists.join(', ')}`);
    console.log(`  - 장소: ${data[0].venue_name}`);
    console.log(`  - 유형: ${data[0].exhibition_type} (상설 전시)`);
    console.log(`  - 작품: ${data[0].artworks_count}점 + 아카이브 88점`);
    console.log(`  - 상태: ${data[0].status}`);
    
    // 서울시립미술관 전체 상설전시 확인
    console.log('\n🔍 서울시립미술관 상설 전시 현황...');
    const { data: permanentExhibitions, error: permError } = await supabase
      .from('exhibitions')
      .select('title_local, venue_name, artists')
      .eq('exhibition_type', 'permanent')
      .or('venue_name.ilike.%서울시립%')
      .order('venue_name');
    
    if (!permError && permanentExhibitions) {
      const permanentOnly = permanentExhibitions.filter(ex => 
        ex.venue_name.includes('서울시립')
      );
      console.log(`\n📌 서울시립미술관 계열 상설 전시: ${permanentOnly.length}개`);
      permanentOnly.forEach(ex => {
        const artist = Array.isArray(ex.artists) ? ex.artists[0] : '';
        console.log(`  - ${ex.title_local} (${ex.venue_name}) - ${artist}`);
      });
    }
    
  } catch (error) {
    console.error('❌ 데이터 입력 중 오류 발생:', error.message);
    if (error.details) console.error('세부사항:', error.details);
  }
}

// 실행
importKwonJinkyuExhibition();