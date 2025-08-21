const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkCurrentExhibitions() {
  console.log('🔍 현재 진행 중인 전시 데이터 확인\n');
  console.log('오늘 날짜:', new Date().toISOString().split('T')[0]);
  console.log('=' .repeat(60));
  
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // 현재 진행 중인 전시 가져오기 (시작일이 과거이고 종료일이 미래인 것)
    const { data: exhibitions, error } = await supabase
      .from('exhibitions')
      .select('id, title_local, venue_name, start_date, end_date, admission_fee, tags')
      .lte('start_date', today)  // 시작일이 오늘 이전 (이미 시작함)
      .gte('end_date', today)    // 종료일이 오늘 이후 (아직 안 끝남)
      .order('start_date', { ascending: false })
      .limit(50);
    
    if (error) {
      console.error('❌ 에러:', error);
      return;
    }
    
    console.log(`\n✅ 현재 진행 중인 전시: ${exhibitions?.length || 0}개\n`);
    
    if (exhibitions && exhibitions.length > 0) {
      exhibitions.forEach((ex, idx) => {
        console.log(`${idx + 1}. ${ex.title_local || '제목 없음'}`);
        console.log(`   장소: ${ex.venue_name || '장소 미정'}`);
        console.log(`   기간: ${ex.start_date} ~ ${ex.end_date}`);
        console.log(`   가격: ${ex.admission_fee || '정보 없음'}`);
        if (ex.tags) {
          console.log(`   태그: ${ex.tags}`);
        }
        console.log('');
      });
      
      // 장소별 통계
      console.log('\n📍 장소별 전시 수:');
      const venueCount = {};
      exhibitions.forEach(ex => {
        const venue = ex.venue_name || '장소 미정';
        venueCount[venue] = (venueCount[venue] || 0) + 1;
      });
      
      Object.entries(venueCount)
        .sort((a, b) => b[1] - a[1])
        .forEach(([venue, count]) => {
          console.log(`   ${venue}: ${count}개`);
        });
        
    } else {
      console.log('현재 진행 중인 전시가 없습니다.');
      
      // 대신 모든 전시 확인
      console.log('\n📅 모든 전시 데이터 확인:');
      const { data: allExhibitions, error: allError } = await supabase
        .from('exhibitions')
        .select('title_local, start_date, end_date, venue_name')
        .order('start_date', { ascending: false })
        .limit(20);
        
      if (allExhibitions && allExhibitions.length > 0) {
        console.log(`\n최근 등록된 전시 ${allExhibitions.length}개:`);
        allExhibitions.forEach((ex, idx) => {
          console.log(`${idx + 1}. ${ex.title_local} (${ex.start_date} ~ ${ex.end_date}) @ ${ex.venue_name}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ 실행 중 오류:', error);
  }
}

checkCurrentExhibitions();