const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkGalleryNumbers() {
  try {
    // 숫자로만 된 갤러리들과 그 source 확인
    const { data, error } = await supabase
      .from('exhibitions')
      .select('venue_name, source, title_local, venue_city, venue_country, source_url')
      .in('venue_name', ['407', '211', '343'])
      .limit(15);

    if (!error && data) {
      console.log('🔍 숫자 갤러리들의 실제 출처:\n');
      data.forEach((ex, idx) => {
        console.log((idx+1) + '. Gallery ' + ex.venue_name);
        console.log('   📍 Source: ' + ex.source);
        console.log('   🌍 Location: ' + ex.venue_city + ', ' + ex.venue_country);
        console.log('   📝 Exhibition: ' + ex.title_local);
        if (ex.source_url) {
          console.log('   🔗 URL: ' + ex.source_url);
        }
        console.log('');
      });
    }

    // 숫자 갤러리들이 실제로는 어느 기관 소속인지 확인
    console.log('📊 각 숫자 갤러리의 출처별 분류:');
    
    for (const galleryNum of ['407', '211', '343']) {
      const { data: galleryData, error: galleryError } = await supabase
        .from('exhibitions')
        .select('source, venue_city, venue_country')
        .eq('venue_name', galleryNum);

      if (!galleryError && galleryData && galleryData.length > 0) {
        const sources = {};
        galleryData.forEach(item => {
          const key = item.source + ' (' + item.venue_city + ', ' + item.venue_country + ')';
          sources[key] = (sources[key] || 0) + 1;
        });

        console.log('\\nGallery ' + galleryNum + ':');
        Object.entries(sources).forEach(([source, count]) => {
          console.log('  - ' + source + ': ' + count + '개');
        });
      }
    }

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

checkGalleryNumbers();