const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkMetExhibitions() {
  try {
    // The Met 관련 전시들 찾기
    const { data, error } = await supabase
      .from('exhibitions')
      .select('venue_name, title_local, title_en, source, venue_city, venue_country')
      .or('source.ilike.%met%,venue_name.ilike.%metropolitan%')
      .order('venue_name')
      .limit(25);

    if (!error && data) {
      console.log('🏛️ The Met 관련 전시들:\n');
      data.forEach((ex, idx) => {
        console.log((idx+1) + '. ' + ex.venue_name);
        console.log('   📝 ' + (ex.title_local || ex.title_en));
        console.log('   📍 Source: ' + ex.source);
        console.log('   🌍 Location: ' + ex.venue_city + ', ' + ex.venue_country);
        console.log('');
      });
    }

    // Met에서 전체 venue_name 종류 확인
    console.log('📊 Met 관련 venue_name 종류:');
    const { data: metVenues, error: metError } = await supabase
      .from('exhibitions')
      .select('venue_name')
      .like('source', '%met%');

    if (!metError && metVenues) {
      const venues = {};
      metVenues.forEach(item => {
        venues[item.venue_name] = (venues[item.venue_name] || 0) + 1;
      });

      Object.entries(venues)
        .sort(([,a], [,b]) => b - a)
        .forEach(([venue, count]) => {
          console.log('  - ' + venue + ': ' + count + '개');
        });
    }

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

checkMetExhibitions();