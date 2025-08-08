const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteBadMMCAData() {
  console.log('=== 잘못 수집된 MMCA 데이터 삭제 ===\n');
  
  // 잘못된 MMCA 데이터 찾기
  const { data: badData, error: fetchError } = await supabase
    .from('exhibitions')
    .select('id, title_en, title_local, artists, venue_name')
    .eq('venue_name', '국립현대미술관')
    .order('created_at', { ascending: false });
    
  if (fetchError) {
    console.error('조회 오류:', fetchError);
    return;
  }
  
  if (badData && badData.length > 0) {
    console.log('삭제할 MMCA 전시들:');
    badData.forEach((ex, idx) => {
      console.log(`${idx + 1}. ID: ${ex.id}`);
      console.log(`   제목: ${ex.title_local || ex.title_en}`);
      console.log(`   작가: ${JSON.stringify(ex.artists).substring(0, 100)}`);
      console.log('');
    });
    
    // 모든 MMCA 데이터 삭제
    const { error: deleteError } = await supabase
      .from('exhibitions')
      .delete()
      .eq('venue_name', '국립현대미술관');
      
    if (deleteError) {
      console.error('삭제 오류:', deleteError);
    } else {
      console.log(`\n✅ ${badData.length}개의 잘못된 MMCA 전시 데이터를 삭제했습니다.`);
    }
  } else {
    console.log('삭제할 MMCA 데이터가 없습니다.');
  }
  
  // 현재 남은 전시 통계
  const { data: remaining, error: countError } = await supabase
    .from('exhibitions')
    .select('venue_name')
    .order('venue_name');
    
  if (!countError && remaining) {
    const venues = {};
    remaining.forEach(ex => {
      const v = ex.venue_name || '미정';
      venues[v] = (venues[v] || 0) + 1;
    });
    
    console.log('\n=== 남은 전시 데이터 통계 ===');
    const mainVenues = Object.entries(venues)
      .filter(([venue]) => 
        venue.includes('국제갤러리') || 
        venue.includes('Metropolitan') || 
        venue.includes('Met') ||
        venue.includes('국립')
      )
      .sort((a, b) => b[1] - a[1]);
      
    mainVenues.forEach(([venue, count]) => {
      console.log(`  - ${venue}: ${count}개`);
    });
    
    console.log(`\n총 ${remaining.length}개의 전시 데이터가 남아있습니다.`);
  }
}

deleteBadMMCAData().catch(console.error);