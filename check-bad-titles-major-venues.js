const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkBadTitlesInMajorVenues() {
  console.log('🚨 주요 기관의 잘못된 전시 제목 확인\n');
  console.log('=' .repeat(80));
  
  try {
    // 주요 기관 리스트
    const majorVenues = [
      '서울시립미술관',
      '서울시립 북서울미술관',
      '서울시립 남서울미술관',
      '서울시립 미술아카이브',
      '국립현대미술관 서울',
      '국립현대미술관 덕수궁',
      '국립현대미술관 과천',
      '국립현대미술관 청주',
      '리움미술관',
      'DDP 동대문디자인플라자',
      '서울공예박물관',
      '서울서예박물관',
      '예술의전당',
      '한가람미술관',
      '한가람디자인미술관',
      '아모레퍼시픽미술관',
      '아르코미술관',
      '국립중앙박물관',
      '대림미술관',
      '삼성미술관',
      '호암미술관'
    ];
    
    const problemTitles = [];
    
    for (const venue of majorVenues) {
      const { data: exhibitions } = await supabase
        .from('exhibitions')
        .select('id, title_local, venue_name, start_date, end_date, description')
        .eq('venue_name', venue)
        .gte('end_date', '2025-01-01')  // 2025년 이후 전시만
        .order('start_date', { ascending: false });
      
      if (exhibitions && exhibitions.length > 0) {
        for (const ex of exhibitions) {
          const title = ex.title_local || '';
          
          // 문제가 있는 제목 패턴 체크
          const isBadTitle = 
            title.length > 70 ||  // 너무 긴 제목
            title.includes('...') ||  // 잘린 제목
            title.match(/^\d+년/) ||  // 년도로 시작
            title.match(/기원전|여 년|작품.*점/) ||  // 설명문 같은 제목
            title.includes('는') ||  // 문장 형태
            title.includes('하다') ||  // 동사 형태
            title.includes('으로') ||  // 조사 포함
            title.match(/^[가-힣]{1,2}$/) ||  // 너무 짧은 제목 (1-2글자)
            !title.trim();  // 빈 제목
          
          if (isBadTitle) {
            problemTitles.push({
              venue: venue,
              title: title,
              id: ex.id,
              dates: `${ex.start_date} ~ ${ex.end_date}`,
              descStart: ex.description ? ex.description.substring(0, 100) : ''
            });
          }
        }
      }
    }
    
    // 문제 있는 제목들 출력
    if (problemTitles.length === 0) {
      console.log('\n✅ 주요 기관의 전시 제목은 모두 정상입니다.');
    } else {
      console.log(`\n🔴 문제가 있는 전시 제목 ${problemTitles.length}개:\n`);
      
      // 기관별로 그룹화
      const byVenue = {};
      problemTitles.forEach(item => {
        if (!byVenue[item.venue]) {
          byVenue[item.venue] = [];
        }
        byVenue[item.venue].push(item);
      });
      
      Object.entries(byVenue).forEach(([venue, items]) => {
        console.log(`\n📍 ${venue} (${items.length}개 문제):`);
        console.log('-'.repeat(80));
        
        items.forEach((item, idx) => {
          console.log(`\n${idx + 1}. ID: ${item.id}`);
          console.log(`   제목: "${item.title}"`);
          console.log(`   기간: ${item.dates}`);
          if (item.descStart) {
            console.log(`   설명 시작: "${item.descStart}..."`);
          }
        });
      });
    }
    
    // extractTitle 함수가 만들 수 있는 문제 제목 패턴 확인
    console.log('\n\n📊 API extractTitle 함수가 만들 가능성이 있는 제목들:');
    console.log('-'.repeat(80));
    
    const { data: noTitleOrLongDesc } = await supabase
      .from('exhibitions')
      .select('id, title_local, venue_name, description')
      .in('venue_name', majorVenues)
      .gte('end_date', '2025-01-01')
      .limit(10);
    
    noTitleOrLongDesc?.forEach((ex, idx) => {
      if (ex.description) {
        // extractTitle이 하는 것처럼 description 첫 줄 추출
        const firstLine = ex.description.split('\n')[0].trim();
        if (firstLine !== ex.title_local && firstLine.length > 0) {
          console.log(`\n${idx + 1}. ${ex.venue_name}`);
          console.log(`   DB 제목: "${ex.title_local}"`);
          console.log(`   API가 추출할 제목: "${firstLine.substring(0, 60)}${firstLine.length > 60 ? '...' : ''}"`);
        }
      }
    });
    
  } catch (error) {
    console.error('❌ 실행 중 오류:', error);
  }
}

checkBadTitlesInMajorVenues();