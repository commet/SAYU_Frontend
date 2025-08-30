// 데이터베이스의 날짜 형식 확인
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './frontend/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDateFormat() {
  // 먼저 전체 전시 몇 개 가져오기
  const { data: sampleExhibitions, error } = await supabase
    .from('exhibitions')
    .select('id, title_local, venue_name, start_date, end_date, popularity_score')
    .limit(5);
    
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('=== 샘플 전시 데이터 (첫 5개) ===');
  sampleExhibitions?.forEach(ex => {
    console.log(`\nID: ${ex.id}`);
    console.log(`제목: ${ex.title_local || 'N/A'}`);
    console.log(`장소: ${ex.venue_name || 'N/A'}`);
    console.log(`시작일: ${ex.start_date} (타입: ${typeof ex.start_date})`);
    console.log(`종료일: ${ex.end_date} (타입: ${typeof ex.end_date})`);
    console.log(`인기도: ${ex.popularity_score}`);
  });
  
  // 날짜 비교 테스트
  const today = new Date().toISOString().split('T')[0];
  console.log('\n=== 날짜 비교 테스트 ===');
  console.log('오늘 날짜 (ISO):', today);
  console.log('오늘 날짜 (Date):', new Date());
  
  if (sampleExhibitions && sampleExhibitions.length > 0) {
    const firstEx = sampleExhibitions[0];
    console.log('\n첫 번째 전시 날짜 비교:');
    console.log('시작일:', firstEx.start_date);
    console.log('종료일:', firstEx.end_date);
    console.log('시작일 <= 오늘?', firstEx.start_date <= today);
    console.log('종료일 >= 오늘?', firstEx.end_date >= today);
    
    // Date 객체로 변환 테스트
    const startDate = new Date(firstEx.start_date);
    const endDate = new Date(firstEx.end_date);
    const todayDate = new Date(today);
    
    console.log('\nDate 객체로 변환:');
    console.log('시작일 Date:', startDate);
    console.log('종료일 Date:', endDate);
    console.log('오늘 Date:', todayDate);
    console.log('진행중?', startDate <= todayDate && endDate >= todayDate);
  }
  
  // 실제 진행중인 전시 수 확인 (다른 방법)
  console.log('\n=== 진행중인 전시 확인 (직접 쿼리) ===');
  const { data: currentExhibitions, count } = await supabase
    .from('exhibitions')
    .select('*', { count: 'exact', head: true })
    .lte('start_date', today)
    .gte('end_date', today);
    
  console.log('진행중인 전시 수:', count);
}

checkDateFormat().catch(console.error);