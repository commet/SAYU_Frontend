const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkImportantExhibitions() {
  console.log('🔍 중요 전시 확인 (이불, 김창열, 오랑주리)\n');
  console.log('=' .repeat(60));
  
  try {
    // 키워드로 검색
    const keywords = [
      '이불', 'Lee Bul', 
      '김창열', 'Kim Tschang', 'Kim Chang',
      '오랑주리', 'Orangerie', 
      '세잔', 'Cezanne', 
      '르누아르', 'Renoir'
    ];
    
    for (const keyword of keywords) {
      console.log(`\n📌 "${keyword}" 검색 결과:`);
      
      const { data: exhibitions, error } = await supabase
        .from('exhibitions')
        .select('id, title_local, venue_name, start_date, end_date, admission_fee, artists')
        .or(`title_local.ilike.%${keyword}%,title_en.ilike.%${keyword}%,description.ilike.%${keyword}%,artists.cs.["${keyword}"]`)
        .order('start_date', { ascending: false })
        .limit(5);
      
      if (error) {
        console.error('  ❌ 에러:', error.message);
        continue;
      }
      
      if (exhibitions && exhibitions.length > 0) {
        exhibitions.forEach(ex => {
          console.log(`  - ${ex.title_local}`);
          console.log(`    장소: ${ex.venue_name}`);
          console.log(`    기간: ${ex.start_date} ~ ${ex.end_date}`);
        });
      } else {
        console.log('  결과 없음');
      }
    }
    
    // 특정 미술관 전시 확인
    console.log('\n\n📍 주요 미술관 2025년 하반기 전시:');
    const venues = ['리움', '국립현대미술관', '예술의전당', '한가람'];
    
    for (const venue of venues) {
      console.log(`\n[${venue}]`);
      
      const { data: exhibitions, error } = await supabase
        .from('exhibitions')
        .select('title_local, start_date, end_date')
        .ilike('venue_name', `%${venue}%`)
        .gte('start_date', '2025-08-01')
        .lte('start_date', '2026-01-31')
        .order('start_date', { ascending: true })
        .limit(10);
      
      if (exhibitions && exhibitions.length > 0) {
        exhibitions.forEach(ex => {
          console.log(`  - ${ex.title_local} (${ex.start_date} ~ ${ex.end_date})`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ 실행 중 오류:', error);
  }
}

checkImportantExhibitions();