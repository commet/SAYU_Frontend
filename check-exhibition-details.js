// 특정 전시 상세 정보 확인
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './frontend/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkExhibitionDetails() {
  const today = new Date().toISOString().split('T')[0];
  
  // "불타는 욕망" 전시 확인
  console.log('=== "불타는 욕망" 전시 정보 ===');
  const { data: burningDesire } = await supabase
    .from('exhibitions')
    .select('*')
    .eq('title_local', '불타는 욕망')
    .lte('start_date', today)
    .gte('end_date', today);
    
  if (burningDesire && burningDesire.length > 0) {
    const ex = burningDesire[0];
    console.log('제목:', ex.title_local);
    console.log('영문 제목:', ex.title_en);
    console.log('장소:', ex.venue_name);
    console.log('주소:', ex.venue_address);
    console.log('기간:', ex.start_date, '~', ex.end_date);
    console.log('설명:', ex.description);
    console.log('입장료:', ex.admission_fee);
    console.log('데이터 출처:', ex.source);
    console.log('공식 URL:', ex.official_url);
  } else {
    console.log('전시를 찾을 수 없습니다.');
  }
  
  // "리처드 프린스" 전시 확인
  console.log('\n=== "리처드 프린스" 전시 정보 ===');
  const { data: richardPrince } = await supabase
    .from('exhibitions')
    .select('*')
    .like('title_local', '%리처드 프린스%')
    .lte('start_date', today)
    .gte('end_date', today);
    
  if (richardPrince && richardPrince.length > 0) {
    const ex = richardPrince[0];
    console.log('제목:', ex.title_local);
    console.log('영문 제목:', ex.title_en);
    console.log('장소:', ex.venue_name);
    console.log('주소:', ex.venue_address);
    console.log('기간:', ex.start_date, '~', ex.end_date);
    console.log('설명:', ex.description);
    console.log('입장료:', ex.admission_fee);
    console.log('데이터 출처:', ex.source);
    console.log('공식 URL:', ex.official_url);
  } else {
    console.log('전시를 찾을 수 없습니다.');
  }
  
  // 실제로 진행중인 유명 전시 확인
  console.log('\n=== 실제 진행중인 주요 전시 (view_count 상위) ===');
  const { data: topExhibitions } = await supabase
    .from('exhibitions')
    .select('title_local, venue_name, start_date, end_date, view_count, source')
    .lte('start_date', today)
    .gte('end_date', today)
    .order('view_count', { ascending: false })
    .limit(10);
    
  if (topExhibitions) {
    topExhibitions.forEach((ex, idx) => {
      console.log(`${idx + 1}. ${ex.title_local || '제목 없음'}`);
      console.log(`   장소: ${ex.venue_name}`);
      console.log(`   기간: ${ex.start_date} ~ ${ex.end_date}`);
      console.log(`   조회수: ${ex.view_count}`);
      console.log(`   출처: ${ex.source}`);
      console.log('');
    });
  }
}

checkExhibitionDetails().catch(console.error);