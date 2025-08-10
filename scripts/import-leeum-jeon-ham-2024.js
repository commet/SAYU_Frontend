const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function importLeeumJeonHam2024() {
  console.log('🎨 리움미술관 《전∙함: 깨달음을 담다》 데이터 입력 시작...\n');
  
  try {
    const exhibitionData = {
      id: uuidv4(),
      
      // 기본 정보
      title_local: '전∙함: 깨달음을 담다',
      title_en: 'Sutras and Cases: Vessels of Enlightenment',
      subtitle: '고려시대 사경과 경함 특별전',
      
      // 날짜
      start_date: '2024-09-05',
      end_date: '2025-02-23',
      exhibition_type: 'special',
      status: 'ongoing', // 2025년 2월까지 진행
      
      // 장소 정보
      venue_name: '리움미술관',
      venue_city: '서울',
      venue_country: 'KR',
      venue_address: '서울특별시 용산구 이태원로55길 60, M1 2층',
      
      // 전시 설명
      description: `《전∙함: 깨달음을 담다》展은 고려시대 불교 경전(經典)을 붓으로 직접 필사(筆寫)한 사경(寫經)과 경전을 보관하기 위해 만든 상자인 경함(經函) 중에서 현존 최고 걸작인 두 작품을 집중 조명하는 전시입니다.

[주요 전시품]

《감지금니 묘법연화경》 (紺紙金泥妙法蓮華經) - 국보급 작품
• 제작연도: 고려 충목왕 1년(1345년)
• 형태: 접어서 보관하고 펼쳐서 보는 절첩본 형식
• 구성: 전체 7권 완질
• 크기: 각 32.3 x 11.5 cm
• 재료: 감지에 금니 (모든 글과 그림을 금으로 완성)
• 특징: 각 권 앞쪽에 경전 내용을 압축한 변상도, 제7권 말미에 발원문

발원자: 진한국대부인 김씨(辰韓國大夫人 金氏)
발원목적: 충혜왕의 영가천도를 기원하고 충목왕과 덕녕공주를 축원

《나전국당초문 경함》 (螺鈿菊唐草文經函)
• 제작연도: 고려 13세기
• 크기: 높이 25.6cm, 너비 47.3cm, 깊이 25.0cm
• 재료: 나무에 나전, 황동
• 제작 추정지: 전함조성도감(鈿函造成都監, 1272년 설치)
• 특징: 수만 개의 나전 조각을 세밀하게 이어 붙인 국당초문
• 보존상태: 원형을 가장 잘 유지한 고려나전 경함

[전시 의의]
• 전세계에 20여점만 현존하는 귀한 고려나전 중 대표작
• 수만 개 나전 조각의 세밀한 조립과 얇은 철선 연결 기법
• 신앙과 예술의 위대한 만남이 이룩한 시대의 걸작
• 고려시대 공예미의 진면모와 최고 수준의 장인 정신
• 막대한 재원과 당대 최고 사경 제작 장인들이 완성한 최고 걸작

[기법과 예술성]
• 나전 조각 표면의 선각으로 디테일 강조
• 요철이 없는 표면의 매끈함 유지
• 옻칠을 통한 완벽한 마감
• 얇은 철선으로 연결된 아름다운 패턴 구성
• 세밀함의 극치를 보여주는 고려 공예미`,
      
      // 작가/제작자 정보
      artists: ['고려시대 장인 (13-14세기)'],
      curator: '리움미술관',
      
      // 작품 정보
      artworks_count: 2, // 감지금니 묘법연화경과 나전국당초문 경함
      
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
    
    console.log('✅ 《전∙함: 깨달음을 담다》 데이터 입력 완료!');
    console.log('\n📋 입력된 전시 정보:');
    console.log(`  - ID: ${data[0].id}`);
    console.log(`  - 제목: ${data[0].title_local}`);
    console.log(`  - 부제: ${data[0].subtitle}`);
    console.log(`  - 장소: ${data[0].venue_name} M1 2층`);
    console.log(`  - 기간: ${data[0].start_date} ~ ${data[0].end_date}`);
    console.log(`  - 주요 작품: 감지금니 묘법연화경, 나전국당초문 경함`);
    console.log(`  - 상태: ${data[0].status} (진행중)`);
    console.log(`  - 시대: 고려시대 (13-14세기)`);
    
    // 리움미술관 고전/전통 예술 전시 현황
    console.log('\n🔍 리움미술관 고전/전통 예술 전시 검색...');
    const { data: traditionalExhibitions, error: traditionalError } = await supabase
      .from('exhibitions')
      .select('title_local, start_date, end_date, status, description')
      .eq('venue_name', '리움미술관')
      .or('title_local.ilike.%전통%,title_local.ilike.%고려%,title_local.ilike.%조선%,title_local.ilike.%경함%,title_local.ilike.%사경%,description.ilike.%전통%')
      .order('start_date', { ascending: false });
    
    if (!traditionalError && traditionalExhibitions) {
      console.log(`\n📿 리움미술관 전통/고전 예술 전시: ${traditionalExhibitions.length}개`);
      traditionalExhibitions.forEach((ex, index) => {
        const statusIcon = ex.status === 'closed' ? '✅' : 
                          ex.status === 'ongoing' ? '🔄' : '📅';
        console.log(`${index + 1}. ${ex.title_local} ${statusIcon}`);
        console.log(`   ${ex.start_date} ~ ${ex.end_date}`);
      });
    }
    
    // 리움미술관 현재 진행중인 전시 현황
    console.log('\n🔍 리움미술관 현재 진행중인 전시...');
    const today = new Date().toISOString().split('T')[0];
    const { data: ongoingExhibitions, error: ongoingError } = await supabase
      .from('exhibitions')
      .select('title_local, start_date, end_date, artists')
      .eq('venue_name', '리움미술관')
      .lte('start_date', today)
      .gte('end_date', today)
      .order('start_date', { ascending: true });
    
    if (!ongoingError && ongoingExhibitions) {
      console.log(`\n🔄 리움미술관 현재 진행중: ${ongoingExhibitions.length}개`);
      ongoingExhibitions.forEach((ex, index) => {
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
importLeeumJeonHam2024();