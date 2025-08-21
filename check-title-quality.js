const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkTitleQuality() {
  console.log('🔍 전시 제목 품질 분석\n');
  console.log('=' .repeat(60));
  
  try {
    // 제목이 없거나 비어있는 전시들
    const { data: noTitle, count: noTitleCount } = await supabase
      .from('exhibitions')
      .select('venue_name', { count: 'exact' })
      .or('title_local.is.null,title_local.eq.')
      .limit(5);
    
    console.log(`\n❌ 제목이 없는 전시: ${noTitleCount || 0}개`);
    if (noTitle && noTitle.length > 0) {
      noTitle.forEach(ex => {
        console.log(`   - ${ex.venue_name}`);
      });
    }
    
    // 소스별 제목 품질
    console.log('\n📊 데이터 소스별 제목 상태:');
    const sources = [
      'seoul_arts_center',
      'leeum_official', 
      'MMCA',
      'naver_blog',
      'crawled',
      'manual',
      'api'
    ];
    
    for (const source of sources) {
      const { data: sourceData, count } = await supabase
        .from('exhibitions')
        .select('title_local', { count: 'exact' })
        .eq('source', source)
        .limit(1);
      
      const { count: emptyCount } = await supabase
        .from('exhibitions')
        .select('*', { count: 'exact' })
        .eq('source', source)
        .or('title_local.is.null,title_local.eq.');
      
      if (count > 0) {
        console.log(`   ${source}: 총 ${count}개, 제목 없음 ${emptyCount || 0}개`);
      }
    }
    
    // 서울 주요 미술관의 현재 전시 상태
    console.log('\n🏛️ 서울 주요 미술관 전시 제목 상태:');
    const venues = [
      '리움미술관',
      '국립현대미술관 서울',
      '서울시립미술관',
      'DDP 동대문디자인플라자',
      '아모레퍼시픽미술관',
      '서울공예박물관',
      '서울서예박물관'
    ];
    
    for (const venue of venues) {
      const { data: venueExhibitions } = await supabase
        .from('exhibitions')
        .select('title_local, description')
        .eq('venue_name', venue)
        .gte('end_date', new Date().toISOString().split('T')[0])
        .limit(2);
      
      if (venueExhibitions && venueExhibitions.length > 0) {
        console.log(`\n   [${venue}]`);
        venueExhibitions.forEach(ex => {
          const hasTitle = ex.title_local && ex.title_local.length > 0;
          const titleQuality = hasTitle && !ex.title_local.includes('...') && ex.title_local.length < 50 ? '✅' : '⚠️';
          console.log(`   ${titleQuality} 제목: "${ex.title_local || '없음'}"`);
          if (!hasTitle && ex.description) {
            console.log(`      설명 첫줄: "${ex.description.substring(0, 50)}..."`);
          }
        });
      }
    }
    
  } catch (error) {
    console.error('❌ 실행 중 오류:', error);
  }
}

checkTitleQuality();