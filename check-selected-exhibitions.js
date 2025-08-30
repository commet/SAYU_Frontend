// 실제로 선택되는 전시 확인
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './frontend/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const MAJOR_VENUES = [
  '국립현대미술관',
  '서울시립미술관',
  '리움미술관',
  '호암미술관',
  '아모레퍼시픽미술관',
  '국제갤러리',
  '한가람미술관',
  '예술의전당',
  '대림미술관',
  '삼성미술관',
  '리움',
  'MMCA',
  'SeMA'
];

async function checkSelectedExhibitions() {
  const today = new Date().toISOString().split('T')[0];
  console.log('오늘 날짜:', today);
  
  // 주요 미술관 전시 확인
  console.log('\n=== 주요 미술관 전시 (최대 6개) ===');
  const { data: majorVenueExhibitions } = await supabase
    .from('exhibitions')
    .select('id, title_local, venue_name, start_date, end_date, view_count')
    .lte('start_date', today)
    .gte('end_date', today)
    .in('venue_name', MAJOR_VENUES)
    .limit(6);
    
  if (majorVenueExhibitions && majorVenueExhibitions.length > 0) {
    console.log(`찾은 주요 미술관 전시: ${majorVenueExhibitions.length}개`);
    majorVenueExhibitions.forEach((ex, idx) => {
      console.log(`${idx + 1}. [${ex.venue_name}] ${ex.title_local || '제목 없음'}`);
      console.log(`   기간: ${ex.start_date} ~ ${ex.end_date}`);
      console.log(`   조회수: ${ex.view_count || 0}`);
    });
  } else {
    console.log('주요 미술관 전시를 찾을 수 없습니다.');
  }
  
  // 나머지 전시 확인
  const remainingLimit = 10 - (majorVenueExhibitions?.length || 0);
  if (remainingLimit > 0) {
    console.log(`\n=== 기타 전시 (${remainingLimit}개) ===`);
    const { data: otherExhibitions } = await supabase
      .from('exhibitions')
      .select('id, title_local, venue_name, start_date, end_date, view_count')
      .lte('start_date', today)
      .gte('end_date', today)
      .not('venue_name', 'in', `(${MAJOR_VENUES.map(v => `"${v}"`).join(',')})`)
      .order('view_count', { ascending: false, nullsFirst: false })
      .limit(remainingLimit);
      
    if (otherExhibitions && otherExhibitions.length > 0) {
      otherExhibitions.forEach((ex, idx) => {
        console.log(`${idx + 1}. [${ex.venue_name}] ${ex.title_local || '제목 없음'}`);
        console.log(`   조회수: ${ex.view_count || 0}`);
      });
    }
  }
  
  // 주요 미술관 중 실제로 전시가 있는 곳 확인
  console.log('\n=== 주요 미술관별 진행중인 전시 수 ===');
  for (const venue of MAJOR_VENUES) {
    const { count } = await supabase
      .from('exhibitions')
      .select('*', { count: 'exact', head: true })
      .lte('start_date', today)
      .gte('end_date', today)
      .eq('venue_name', venue);
      
    if (count > 0) {
      console.log(`${venue}: ${count}개`);
    }
  }
}

checkSelectedExhibitions().catch(console.error);