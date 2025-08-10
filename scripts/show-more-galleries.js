const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function showMoreSmallGalleries() {
  try {
    // 더 구체적인 작은 갤러리들 검색
    const { data: galleries, error } = await supabase
      .from('exhibitions')
      .select('title_local, venue_name, venue_address, start_date, end_date, artists, description')
      .or('venue_name.ilike.%갤러리%,venue_name.ilike.%아트센터%,venue_name.ilike.%문화센터%,venue_name.ilike.%아트스페이스%')
      .not('venue_name', 'in', ['국제갤러리', '아르코미술관'])
      .order('created_at', { ascending: false })
      .limit(12);

    if (!error && galleries) {
      console.log('🏛️ 작은 갤러리들 전시 예시:\n');
      galleries.forEach((ex, idx) => {
        console.log((idx+1) + '. 《' + ex.title_local + '》');
        console.log('   📍 ' + ex.venue_name);
        if (ex.venue_address) {
          console.log('   📮 ' + ex.venue_address);
        }
        console.log('   📅 ' + ex.start_date + ' ~ ' + ex.end_date);
        if (ex.artists && ex.artists.length > 0) {
          console.log('   👨‍🎨 작가: ' + ex.artists.join(', '));
        }
        if (ex.description) {
          const lines = ex.description.split('\n');
          const firstLine = lines[0];
          if (firstLine.length > 80) {
            console.log('   📝 ' + firstLine.substring(0, 80) + '...');
          } else {
            console.log('   📝 ' + firstLine);
          }
        }
        console.log('');
      });
    }

    // 다른 작은 공간들도 찾아보기
    const { data: venues, error: venueError } = await supabase
      .from('exhibitions')
      .select('venue_name')
      .like('venue_name', '%공간%');

    if (!venueError && venues) {
      const venueCount = {};
      venues.forEach(item => {
        if (item.venue_name) {
          venueCount[item.venue_name] = (venueCount[item.venue_name] || 0) + 1;
        }
      });

      console.log('🏢 "공간"이 들어간 문화공간들:');
      Object.entries(venueCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .forEach(([venue, count]) => {
          console.log('  - ' + venue + ': ' + count + '개');
        });
    }

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

showMoreSmallGalleries();