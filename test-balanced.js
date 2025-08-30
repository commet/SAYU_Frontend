// 균형잡힌 미술관 선택 테스트
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './frontend/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// 확장된 주요 미술관 목록
const MAJOR_VENUES = [
  '국립현대미술관',
  '서울시립미술관',
  '리움미술관',
  '호암미술관',
  '아모레퍼시픽미술관',
  '한가람미술관',
  '예술의전당',
  'DDP',
  '동대문디자인플라자',
  '대림미술관',
  '국제갤러리',
  '삼성미술관',
  '리움',
  'MMCA',
  'SeMA',
  'K현대미술관',
  '로덴갤러리',
  '석파정 서울미술관'
];

async function testBalancedSelection() {
  const today = new Date().toISOString().split('T')[0];
  console.log('오늘 날짜:', today);
  
  const majorVenueExhibitions = [];
  const selectedVenues = new Set();
  
  console.log('\n=== 1차: 각 미술관에서 1개씩 선택 ===');
  for (const venue of MAJOR_VENUES) {
    if (majorVenueExhibitions.length >= 6) break;
    
    const { data } = await supabase
      .from('exhibitions')
      .select('id, title_local, venue_name')
      .lte('start_date', today)
      .gte('end_date', today)
      .eq('venue_name', venue)
      .limit(1);
    
    if (data && data.length > 0) {
      majorVenueExhibitions.push(data[0]);
      selectedVenues.add(venue);
      console.log(`✓ ${venue}: ${data[0].title_local || '제목 없음'}`);
    }
  }
  
  console.log(`\n선택된 전시: ${majorVenueExhibitions.length}개`);
  
  if (majorVenueExhibitions.length < 6) {
    console.log('\n=== 2차: 추가 선택 (6개까지) ===');
    for (const venue of MAJOR_VENUES) {
      if (majorVenueExhibitions.length >= 6) break;
      if (selectedVenues.has(venue)) continue;
      
      const { data } = await supabase
        .from('exhibitions')
        .select('id, title_local, venue_name')
        .lte('start_date', today)
        .gte('end_date', today)
        .eq('venue_name', venue)
        .limit(2);
      
      if (data) {
        const toAdd = data.slice(0, 6 - majorVenueExhibitions.length);
        majorVenueExhibitions.push(...toAdd);
        toAdd.forEach(ex => {
          console.log(`✓ ${ex.venue_name}: ${ex.title_local || '제목 없음'}`);
        });
      }
    }
  }
  
  console.log('\n=== 최종 선택된 전시 ===');
  const venueCount = {};
  majorVenueExhibitions.forEach((ex, idx) => {
    console.log(`${idx + 1}. [${ex.venue_name}] ${ex.title_local || '제목 없음'}`);
    venueCount[ex.venue_name] = (venueCount[ex.venue_name] || 0) + 1;
  });
  
  console.log('\n=== 미술관별 선택 수 ===');
  Object.entries(venueCount).forEach(([venue, count]) => {
    console.log(`${venue}: ${count}개`);
  });
  
  // API 테스트
  console.log('\n=== 챗봇 API 테스트 ===');
  const response = await fetch('http://localhost:3004/api/chatbot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: '인기 있는 전시 추천해줘',
      page: '/exhibitions',
      userType: 'LAEF'
    })
  });
  
  const result = await response.json();
  if (result.success) {
    console.log('챗봇 응답:', result.data.response);
  }
}

testBalancedSelection().catch(console.error);