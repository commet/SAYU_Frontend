const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function importSemaProjectAExhibition() {
  console.log('🎨 2025 SeMA-프로젝트 A 상설전 데이터 입력 시작...\n');
  
  try {
    const exhibitionData = {
      id: uuidv4(),
      
      // 기본 정보
      title_local: '2025 SeMA-프로젝트 A',
      title_en: '2025 SeMA-Project A',
      subtitle: '미술아카이브 상설 프로젝트',
      
      // 날짜 (상설 전시)
      start_date: '2025-01-01',
      end_date: '2099-12-31', // 상설 전시
      exhibition_type: 'permanent',
      status: 'ongoing',
      
      // 장소 정보
      venue_name: '서울시립 미술아카이브',
      venue_city: '서울',
      venue_country: 'KR',
      venue_address: '서울특별시 종로구 평창동, 모음동 2-4층 옥상정원 및 나눔동 1층',
      
      // 전시 설명
      description: `SeMA-프로젝트 A는 서울시립 미술아카이브의 내부와 외부를 연결하는 옥상정원과 유휴공간에 소장품을 상설로 전시하고, 매해 신작 커미션을 통해 미술아카이브 공간을 새로운 관점으로 해석하고 발견하는 기회를 제공합니다.

2025년은 기관의제 '행동'과 전시의제 '행성'을 기반으로, 사회적 재난과 기후위기, 불안 등에 반응하는 작가의 문제의식에 공감해보는 자리를 마련했습니다.

[주요 작품]

【이게 마지막일 리는 없어】 - 오묘초 (2025)
• 모음동 2층 옥상정원
• 기후변화 위기 경고, 미래 생명체 상상
• 유리와 금속, 나무와 해초 등 인공-자연 재료 결합

【Dancing Star(별별하늘)】 - 이원우 (2025)
• 모음동 3층 옥상정원
• 불확실한 미래에 대한 불안을 위트있게 표현
• 색종이 놀이에서 영감받은 대형 별 조각

【풍경이 된 자】 - 유비호 (2015)
• 나눔동 1층
• 사회적 재난과 비극적 운명을 견뎌내는 삶의 은유
• 영상 작품

【De-veloping-Silhouette Casting】 - 홍명섭
• 모음동 3층
• 가위 실루엣 조각

【김인겸, 홍석호 작품】
• 모음동 4층 옥상정원

[전시 특징]
• 매년 신작 커미션 추가
• 옥상정원과 유휴공간 활용
• 기후위기와 사회적 이슈 반영
• 상설 전시로 언제나 관람 가능

[운영 시간]
• 평일(화-금): 10:00-20:00
• 주말: 10:00-19:00 (하절기) / 10:00-18:00 (동절기)
• 휴관일: 매주 월요일, 1월 1일
• 관람료: 무료

문의: 송고운 02-2124-7409`,
      
      // 작가 정보
      artists: ['김인겸', '오묘초', '유비호', '이원우', '홍명섭', '홍석호'],
      curator: '서울시립 미술아카이브',
      
      // 작품 정보
      artworks_count: 6,
      
      // 관람 정보
      admission_fee: '무료',
      operating_hours: JSON.stringify({
        평일: '10:00-20:00 (화-금)',
        주말: '10:00-19:00 (하절기) / 10:00-18:00 (동절기)',
        휴관일: '월요일, 1월 1일'
      }),
      
      // 연락처
      contact_info: JSON.stringify({
        전시문의: '송고운 02-2124-7409',
        관람문의: '02-2124-7400'
      }),
      phone_number: '02-2124-7400',
      
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
    
    console.log('✅ 2025 SeMA-프로젝트 A 상설전 데이터 입력 완료!');
    console.log('\n📋 입력된 전시 정보:');
    console.log(`  - ID: ${data[0].id}`);
    console.log(`  - 제목: ${data[0].title_local}`);
    console.log(`  - 장소: ${data[0].venue_name}`);
    console.log(`  - 유형: ${data[0].exhibition_type} (상설 전시)`);
    console.log(`  - 참여 작가: ${data[0].artists.length}명`);
    console.log(`  - 작품수: ${data[0].artworks_count}점`);
    console.log(`  - 상태: ${data[0].status}`);
    
    // 서울시립미술관 전체 상설 전시 통계
    console.log('\n🔍 서울시립미술관 계열 상설 전시 통계...');
    const { data: permanentStats, error: statsError } = await supabase
      .from('exhibitions')
      .select('venue_name, title_local')
      .eq('exhibition_type', 'permanent')
      .or('venue_name.ilike.%서울시립%');
    
    if (!statsError && permanentStats) {
      const permanentExhibitions = permanentStats.filter(ex => 
        ex.venue_name && ex.venue_name.includes('서울시립')
      );
      
      console.log(`\n📌 서울시립미술관 계열 상설 전시 총 ${permanentExhibitions.length}개`);
      
      const venues = {};
      permanentExhibitions.forEach(ex => {
        if (!venues[ex.venue_name]) venues[ex.venue_name] = [];
        venues[ex.venue_name].push(ex.title_local);
      });
      
      Object.keys(venues).forEach(venue => {
        console.log(`\n[${venue}]`);
        venues[venue].forEach(title => {
          console.log(`  - ${title}`);
        });
      });
    }
    
  } catch (error) {
    console.error('❌ 데이터 입력 중 오류 발생:', error.message);
    if (error.details) console.error('세부사항:', error.details);
  }
}

// 실행
importSemaProjectAExhibition();