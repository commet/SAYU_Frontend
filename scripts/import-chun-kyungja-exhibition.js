const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function importChunKyungjaExhibition() {
  console.log('🎨 천경자 탄생 100주년 기념 전시 데이터 입력 시작...\n');
  
  try {
    // 먼저 현재 스키마 확인
    const { data: sampleCheck, error: checkError } = await supabase
      .from('exhibitions')
      .select('*')
      .limit(1);
    
    if (checkError) {
      console.log('스키마 확인 실패:', checkError.message);
    } else if (sampleCheck && sampleCheck.length > 0) {
      const availableColumns = Object.keys(sampleCheck[0]);
      console.log('📊 사용 가능한 컬럼:', availableColumns.length + '개');
    }
    
    // 천경자 전시 데이터 (기존 스키마에 맞춰 조정)
    const exhibitionData = {
      id: uuidv4(),
      
      // 기본 정보
      title_local: '영혼을 울리는 바람을 향하여',
      title_en: 'Toward the Wind that Touches the Soul',
      subtitle: '천경자 탄생 100주년 기념',
      
      // 날짜 (상설 전시)
      start_date: '2024-01-01',
      end_date: '2099-12-31', // 상설 전시를 위한 관례적 종료일
      exhibition_type: 'permanent',
      status: 'ongoing',
      
      // 장소 정보
      venue_name: '서울시립미술관',
      venue_city: '서울',
      venue_country: 'KR',
      venue_address: '서울특별시 중구 덕수궁길 61 서소문본관 2층',
      
      // 전시 설명 (모든 정보를 description에 통합)
      description: `서울시립미술관은 천경자 탄생 100주년을 기념하여 천경자 컬렉션 상설전 《영혼을 울리는 바람을 향하여》를 선보입니다. 

한국 화단의 대표적인 작가 천경자(千鏡子, 1924-2015)는 한국 채색화 분야에서 독자적인 양식과 행보를 이어가며 자신만의 작품세계를 구축하였습니다. 

[전시 구성]
• 환상과 정한의 세계
• 꿈과 바람의 여로
• 예술과 낭만
• 자유로운 여자

[전시 정보]
• 장소: 서소문본관 2층 천경자컬렉션 전시실
• 작품수: 30여 점
• 장르: 한국화, 채색화, 기행화
• 관람료: 무료

[운영 시간]
• 평일(화-금): 10:00-20:00
• 주말: 10:00-19:00 (하절기) / 10:00-18:00 (동절기)
• 금요일 문화의 밤: 10:00-21:00
• 휴관일: 매주 월요일, 1월 1일

[도슨트 프로그램]
• 일정: 2025년 3월 21일 ~ 10월 26일
• 시간: 매일 오후 2시 (월요일 제외)
• 무료 도슨팅 앱 제공

문의: 02-2124-8868`,
      
      // 작가 정보
      artists: ['천경자 (Chun Kyung-ja)'],
      curator: '서울시립미술관',
      
      // 작품 정보
      artworks_count: 30,
      
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
        전시문의: '02-2124-8974',
        관람문의: '02-2124-8868'
      }),
      phone_number: '02-2124-8868',
      
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
    
    console.log('✅ 천경자 전시 데이터 입력 완료!');
    console.log('\n📋 입력된 전시 정보:');
    console.log(`  - ID: ${data[0].id}`);
    console.log(`  - 제목: ${data[0].title_local}`);
    console.log(`  - 장소: ${data[0].venue_name} ${data[0].gallery_location}`);
    console.log(`  - 유형: ${data[0].exhibition_type} (상설 전시)`);
    console.log(`  - 작품수: ${data[0].artworks_count}점`);
    console.log(`  - 상태: ${data[0].status}`);
    
    // 확인 쿼리
    console.log('\n🔍 상설 전시 확인...');
    const { data: permanent, error: permError } = await supabase
      .from('exhibitions')
      .select('title_local, exhibition_type, end_date, status')
      .eq('exhibition_type', 'permanent');
    
    if (!permError && permanent) {
      console.log(`\n📌 현재 등록된 상설 전시: ${permanent.length}개`);
      permanent.forEach(ex => {
        console.log(`  - ${ex.title_local} (종료: ${ex.end_date}, 상태: ${ex.status})`);
      });
    }
    
  } catch (error) {
    console.error('❌ 데이터 입력 중 오류 발생:', error.message);
    if (error.details) console.error('세부사항:', error.details);
    if (error.hint) console.error('힌트:', error.hint);
  }
}

// 실행
importChunKyungjaExhibition();