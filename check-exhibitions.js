// Supabase 전시 데이터 확인 스크립트
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ffjasggfifzxnsuagiml.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmamFzZ2dmaWZ6eG5zdWFnaW1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM1MTM0NjUsImV4cCI6MjA0OTA4OTQ2NX0.SPEJrzOrxvxjZkBNOLXBD9oRN4AQF4E8H8hv-jzqOTI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkExhibitions() {
  const today = new Date().toISOString().split('T')[0];
  console.log('오늘 날짜:', today);
  
  // 전체 전시 수 확인
  const { count: totalCount } = await supabase
    .from('exhibitions')
    .select('*', { count: 'exact', head: true });
    
  console.log('\n전체 전시 수:', totalCount);
  
  // 현재 진행중인 전시 확인
  const { data: currentExhibitions, count: currentCount } = await supabase
    .from('exhibitions')
    .select('id, title_local, start_date, end_date', { count: 'exact' })
    .lte('start_date', today)
    .gte('end_date', today);
    
  console.log('\n현재 진행중인 전시:', currentCount);
  if (currentExhibitions && currentExhibitions.length > 0) {
    currentExhibitions.forEach(ex => {
      console.log(`- ${ex.title_local} (${ex.start_date} ~ ${ex.end_date})`);
    });
  }
  
  // 곧 시작할 전시 (7일 이내)
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 7);
  const futureDateStr = futureDate.toISOString().split('T')[0];
  
  const { data: upcomingExhibitions, count: upcomingCount } = await supabase
    .from('exhibitions')
    .select('id, title_local, start_date', { count: 'exact' })
    .gt('start_date', today)
    .lte('start_date', futureDateStr);
    
  console.log('\n7일 이내 시작 예정:', upcomingCount);
  if (upcomingExhibitions && upcomingExhibitions.length > 0) {
    upcomingExhibitions.forEach(ex => {
      console.log(`- ${ex.title_local} (${ex.start_date}부터)`);
    });
  }
}

checkExhibitions().catch(console.error);