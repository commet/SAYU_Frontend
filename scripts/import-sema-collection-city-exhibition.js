const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function importSemaCollectionCityExhibition() {
  console.log('🏙️ SeMA Collection 도시예찬 전시 데이터 입력 시작...\n');
  
  try {
    const exhibitionData = {
      id: uuidv4(),
      
      // 기본 정보
      title_local: 'SeMA Collection 도시예찬',
      title_en: 'SeMA Collection: City Eulogy',
      subtitle: '서울시립미술관+송파구 협력전시',
      
      // 날짜
      start_date: '2025-07-05',
      end_date: '2025-09-28',
      exhibition_type: 'special',
      status: 'upcoming',
      
      // 장소 정보
      venue_name: '더 갤러리 호수',
      venue_city: '서울',
      venue_country: 'KR',
      venue_address: '서울특별시 송파구 올림픽로 300 롯데월드타워',
      
      // 전시 설명
      description: `서울시립미술관과 송파구의 협력으로 마련된 《SeMA Collection: 도시예찬》은 서울시립미술관의 주요 소장품 가운데 '도시'를 주제로 한 회화, 사진, 영상 등 다양한 장르의 작품 37점을 선보입니다.

본 전시는 예술가들이 포착한 도시의 다양한 얼굴을 조명합니다. 도시의 구성원이자 때로는 이방인, 혹은 관찰자로서의 예술가들은 도시 풍경과 도시인의 삶을 애정 어린 동시에 비판적인 시선으로 바라봅니다. 전시 작품들은 그러한 예술가의 시선이 담긴 도시의 '기억과 흔적'을 따라가며, 우리가 사는 도시의 모습을 다층적으로 탐색합니다.

[전시 특징]
• 서울시립미술관 소장품 순회전
• '도시'를 주제로 한 다양한 시각
• 일상 가까이에서 만나는 미술관 컬렉션
• 송파구와의 협력 전시

[전시 정보]
• 장소: 더 갤러리 호수 전시실
• 작품수: 37점
• 장르: 회화, 설치, 사진, 미디어아트
• 관람료: 무료

[도슨트 프로그램]
• 정규 도슨트: 매일 11:00, 15:00

[운영 시간]
• 화~일: 10:00-19:00
• 휴관일: 매주 월요일

[협력]
• 주최: 서울시립미술관, 송파구
• 장소제공: 더 갤러리 호수

문의: 심진솔 02-2124-8974`,
      
      // 작가 정보 (18명)
      artists: [
        '강정헌', '국대호', '권순관', '김봄', '김상돈', '김세진',
        '민재영', '박병주', '박준범', '윤진미', '이상원', '이흥덕',
        '장용근', '정지현', '정직성', '최덕휴', '최민화', '최호철'
      ],
      curator: '서울시립미술관',
      
      // 작품 정보
      artworks_count: 37,
      
      // 관람 정보
      admission_fee: '무료',
      operating_hours: JSON.stringify({
        운영: '10:00-19:00 (화-일)',
        휴관일: '매주 월요일',
        도슨트: '매일 11:00, 15:00'
      }),
      
      // 연락처
      contact_info: JSON.stringify({
        전시문의: '심진솔 02-2124-8974',
        관람문의: '더 호수 갤러리 02-2147-3247 / 3275'
      }),
      phone_number: '02-2147-3247',
      
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
    
    console.log('✅ SeMA Collection 도시예찬 전시 데이터 입력 완료!');
    console.log('\n📋 입력된 전시 정보:');
    console.log(`  - ID: ${data[0].id}`);
    console.log(`  - 제목: ${data[0].title_local}`);
    console.log(`  - 부제: ${data[0].subtitle}`);
    console.log(`  - 장소: ${data[0].venue_name} (송파구)`);
    console.log(`  - 기간: ${data[0].start_date} ~ ${data[0].end_date}`);
    console.log(`  - 참여 작가: ${data[0].artists.length}명`);
    console.log(`  - 작품수: ${data[0].artworks_count}점`);
    console.log(`  - 상태: ${data[0].status}`);
    
    // 서울시립미술관 전체 전시 최종 통계
    console.log('\n🔍 서울시립미술관 전체 전시 최종 통계...');
    const { data: allExhibitions, error: allError } = await supabase
      .from('exhibitions')
      .select('venue_name, exhibition_type, status')
      .or('venue_name.ilike.%서울시립%,venue_name.ilike.%백남준%,venue_name.eq.더 갤러리 호수');
    
    if (!allError && allExhibitions) {
      const stats = {
        total: 0,
        permanent: 0,
        special: 0,
        ongoing: 0,
        upcoming: 0,
        venues: new Set()
      };
      
      allExhibitions.forEach(ex => {
        if (ex.venue_name && 
            (ex.venue_name.includes('서울시립') || 
             ex.venue_name.includes('백남준') || 
             ex.venue_name === '더 갤러리 호수')) {
          stats.total++;
          stats.venues.add(ex.venue_name);
          
          if (ex.exhibition_type === 'permanent') stats.permanent++;
          else stats.special++;
          
          if (ex.status === 'ongoing') stats.ongoing++;
          else if (ex.status === 'upcoming') stats.upcoming++;
        }
      });
      
      console.log('\n📊 서울시립미술관 관련 전시 통계');
      console.log(`  - 총 전시 수: ${stats.total}개`);
      console.log(`  - 상설 전시: ${stats.permanent}개`);
      console.log(`  - 기획/특별 전시: ${stats.special}개`);
      console.log(`  - 현재 운영중: ${stats.ongoing}개`);
      console.log(`  - 개막 예정: ${stats.upcoming}개`);
      console.log(`  - 전시 장소: ${stats.venues.size}곳`);
      
      console.log('\n📍 전시 장소 목록:');
      Array.from(stats.venues).sort().forEach(venue => {
        console.log(`  - ${venue}`);
      });
    }
    
  } catch (error) {
    console.error('❌ 데이터 입력 중 오류 발생:', error.message);
    if (error.details) console.error('세부사항:', error.details);
  }
}

// 실행
importSemaCollectionCityExhibition();