const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function importStorageStoryExhibition() {
  console.log('📸 스토리지 스토리 전시 데이터 입력 시작...\n');
  
  try {
    const exhibitionData = {
      id: uuidv4(),
      
      // 기본 정보
      title_local: '스토리지 스토리',
      title_en: 'Storage Story',
      subtitle: '서울시립 사진미술관 개관특별전',
      
      // 날짜
      start_date: '2025-05-29',
      end_date: '2025-10-12',
      exhibition_type: 'special',
      status: 'upcoming',
      
      // 장소 정보
      venue_name: '서울시립 사진미술관',
      venue_city: '서울',
      venue_country: 'KR',
      venue_address: '서울특별시 도봉구 창동, 2층 1·2전시실 및 영상홀',
      
      // 전시 설명
      description: `서울시립 사진미술관은 건립을 기념하며 개관특별전 《스토리지 스토리》를 개최한다. 이번 전시는 사진미술관의 건립 과정을 단순히 행정적 절차나 물리적 결과로 환원하지 않고 감각의 층위와 매체적 다성성(多聲性)의 관점으로 해석함으로써 사진이 기록을 넘어 예술적 사유와 실천의 장으로 확장될 수 있음을 제시한다.

전시 제목 《스토리지 스토리》는 미술관이 위치한 창동(倉洞)의 지명에서 출발한다. 전통적으로 곡식을 저장하던 '창고, 창(倉)'의 의미는 오늘날 이미지와 기억, 작품과 자료를 저장하는 미술관의 수장 기능으로 전이된다.

[전시 구성]
사진 매체의 대표 속성을 '재료', '기록', '정보'로 정의하고, 여섯 명의 작가와 함께:
• 건설 현장과 자재 탐색
• 건립 과정에서 수집된 소장품과 자료 재해석
• 지역의 역사·문화·지리적 맥락 연구
• 미술관 형성을 '살아 있는 서사'로 구현

[전시 정보]
• 장소: 2층 1·2전시실, 영상홀
• 작품수: 90점
• 장르: 사진, 설치, 입체, AI, 미디어
• 관람료: 무료

[도슨트 프로그램]
• 매일 오전 11시, 오후 2시

[운영 시간]
• 평일(화-금): 10:00-20:00
• 주말: 10:00-19:00 (하절기) / 10:00-18:00 (동절기)
• 휴관일: 매주 월요일, 1월 1일

문의: 박소진 02-2124-7618`,
      
      // 작가 정보
      artists: ['서동신', '원성원', '정지현', '주용성', '정멜멜', '오주영'],
      curator: '서울시립 사진미술관',
      
      // 작품 정보
      artworks_count: 90,
      
      // 관람 정보
      admission_fee: '무료',
      operating_hours: JSON.stringify({
        평일: '10:00-20:00 (화-금)',
        주말: '10:00-19:00 (하절기) / 10:00-18:00 (동절기)',
        휴관일: '월요일, 1월 1일',
        도슨트: '매일 11:00, 14:00'
      }),
      
      // 연락처
      contact_info: JSON.stringify({
        전시문의: '박소진 02-2124-7618',
        관람문의: '안내데스크 02-2124-7600'
      }),
      phone_number: '02-2124-7600',
      
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
    
    console.log('✅ 스토리지 스토리 전시 데이터 입력 완료!');
    console.log('\n📋 입력된 전시 정보:');
    console.log(`  - ID: ${data[0].id}`);
    console.log(`  - 제목: ${data[0].title_local}`);
    console.log(`  - 부제: ${data[0].subtitle}`);
    console.log(`  - 장소: ${data[0].venue_name}`);
    console.log(`  - 기간: ${data[0].start_date} ~ ${data[0].end_date}`);
    console.log(`  - 참여 작가: ${data[0].artists.length}명`);
    console.log(`  - 작품수: ${data[0].artworks_count}점`);
    console.log(`  - 상태: ${data[0].status}`);
    
    // 서울시립미술관 전체 현황 확인
    console.log('\n🔍 서울시립미술관 전체 전시 현황...');
    const { data: allExhibitions, error: allError } = await supabase
      .from('exhibitions')
      .select('title_local, venue_name, exhibition_type, status')
      .or('venue_name.ilike.%서울시립%')
      .order('venue_name');
    
    if (!allError && allExhibitions) {
      const byVenue = {};
      allExhibitions.forEach(ex => {
        if (!byVenue[ex.venue_name]) byVenue[ex.venue_name] = [];
        byVenue[ex.venue_name].push(ex);
      });
      
      console.log(`\n📌 서울시립미술관 계열 총 ${allExhibitions.length}개 전시`);
      Object.keys(byVenue).forEach(venue => {
        console.log(`\n[${venue}] ${byVenue[venue].length}개`);
        byVenue[venue].slice(0, 3).forEach(ex => {
          const type = ex.exhibition_type === 'permanent' ? '상설' : '기획';
          console.log(`  - ${ex.title_local} (${type})`);
        });
      });
    }
    
  } catch (error) {
    console.error('❌ 데이터 입력 중 오류 발생:', error.message);
    if (error.details) console.error('세부사항:', error.details);
  }
}

// 실행
importStorageStoryExhibition();