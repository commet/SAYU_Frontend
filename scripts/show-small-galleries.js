const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function showSmallGalleries() {
  console.log('🔍 작은 갤러리들 전시 정보 확인...\n');
  
  try {
    // 유명하지 않은 갤러리들
    const { data: smallVenues, error } = await supabase
      .from('exhibitions')
      .select('title_local, venue_name, venue_address, start_date, end_date, description, artists')
      .in('venue_name', ['407', '211', '343', '(신사동)', 'Gallery Baton', 'PKM Gallery', '아르코미술관', '탈영역우정국'])
      .order('created_at', { ascending: false })
      .limit(8);

    if (!error && smallVenues) {
      console.log('🎨 작은/독립 갤러리들 전시 예시:\n');
      smallVenues.forEach((ex, idx) => {
        console.log((idx+1) + '. 《' + ex.title_local + '》');
        console.log('   📍 ' + ex.venue_name + (ex.venue_address ? ' - ' + ex.venue_address : ''));
        console.log('   📅 ' + ex.start_date + ' ~ ' + ex.end_date);
        if (ex.artists) {
          console.log('   👨‍🎨 작가: ' + ex.artists.join(', '));
        }
        if (ex.description) {
          const shortDesc = ex.description.length > 100 ? 
            ex.description.substring(0, 100) + '...' : 
            ex.description;
          console.log('   📝 ' + shortDesc);
        }
        console.log('');
      });
    }

    // 숫자나 특이한 이름의 갤러리들 더 찾아보기
    const { data: uniqueVenues, error: uniqueError } = await supabase
      .from('exhibitions')
      .select('venue_name')
      .not('venue_name', 'in', ['Art Institute of Chicago', 'Metropolitan Museum of Art', '국립중앙박물관', '국제갤러리', 'DDP 동대문디자인플라자', '국립현대미술관 서울', '리움미술관', '서울시립미술관', '서울공예박물관']);

    if (!uniqueError && uniqueVenues) {
      const venueCount = {};
      uniqueVenues.forEach(item => {
        if (item.venue_name) {
          venueCount[item.venue_name] = (venueCount[item.venue_name] || 0) + 1;
        }
      });

      console.log('🏢 독특한 이름의 갤러리/공간들 (전시 5개 이하):');
      Object.entries(venueCount)
        .filter(([name, count]) => count <= 5)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 25)
        .forEach(([venue, count]) => {
          console.log('  - ' + venue + ': ' + count + '개');
        });
    }

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

showSmallGalleries();