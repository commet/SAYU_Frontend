const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkExistingExhibitions() {
  console.log('🔍 기존 저장된 전시 정보 확인 중...\n');
  
  try {
    // 전체 전시 수 확인
    const { count, error: countError } = await supabase
      .from('exhibitions')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Count Error:', countError);
      return;
    }

    console.log('📊 총 전시 수:', count, '개\n');

    // 장소별 분류
    const { data: venueData, error: venueError } = await supabase
      .from('exhibitions')
      .select('venue_name')
      .not('venue_name', 'is', null);

    if (!venueError && venueData) {
      const venues = {};
      venueData.forEach(item => {
        venues[item.venue_name] = (venues[item.venue_name] || 0) + 1;
      });

      console.log('🏛️ 주요 장소별 전시 수:');
      Object.entries(venues)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 15)
        .forEach(([venue, count]) => {
          console.log('  -', venue + ':', count + '개');
        });
      console.log('');
    }

    // 최근 추가된 전시들
    const { data: recentData, error: recentError } = await supabase
      .from('exhibitions')
      .select('title_local, venue_name, start_date, end_date, created_at')
      .order('created_at', { ascending: false })
      .limit(15);

    if (!recentError && recentData) {
      console.log('📅 최근 추가된 전시 15개:');
      recentData.forEach((ex, idx) => {
        const createdDate = new Date(ex.created_at).toLocaleDateString('ko-KR');
        console.log(`  ${idx+1}. ${ex.title_local} - ${ex.venue_name} (${ex.start_date}~${ex.end_date}) [${createdDate}]`);
      });
      console.log('');
    }

    // 상태별 분류
    const { data: statusData, error: statusError } = await supabase
      .from('exhibitions')
      .select('status');

    if (!statusError && statusData) {
      const statuses = {};
      statusData.forEach(item => {
        statuses[item.status] = (statuses[item.status] || 0) + 1;
      });

      console.log('📈 상태별 분류:');
      Object.entries(statuses).forEach(([status, count]) => {
        console.log('  -', status + ':', count + '개');
      });
      console.log('');
    }

    // 타입별 분류
    const { data: typeData, error: typeError } = await supabase
      .from('exhibitions')
      .select('exhibition_type');

    if (!typeError && typeData) {
      const types = {};
      typeData.forEach(item => {
        types[item.exhibition_type] = (types[item.exhibition_type] || 0) + 1;
      });

      console.log('🎨 전시 타입별 분류:');
      Object.entries(types).forEach(([type, count]) => {
        console.log('  -', type + ':', count + '개');
      });
    }

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

// 실행
checkExistingExhibitions();