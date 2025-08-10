const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkSharedFuture() {
  try {
    console.log('🔍 공유미래 전시 확인 중...\n');
    
    const { data, error } = await supabase
      .from('exhibitions')
      .select('*')
      .eq('title_local', '공유미래');

    if (error) {
      console.error('❌ 오류:', error);
      return;
    }

    if (!data || data.length === 0) {
      console.log('❌ 공유미래 전시 데이터가 없습니다!');
      
      // 비슷한 제목으로 다시 검색
      const { data: similarData, error: similarError } = await supabase
        .from('exhibitions')
        .select('title_local, venue_name, start_date, end_date, created_at')
        .or('title_local.ilike.%공유%,title_local.ilike.%미래%');
        
      if (similarData && similarData.length > 0) {
        console.log('🔍 공유/미래 관련 전시들:', similarData.length, '개');
        similarData.forEach(ex => {
          console.log('  -', ex.title_local, '(' + ex.venue_name + ')');
        });
      }
      
      // 오늘 추가된 모든 전시들 확인
      const today = new Date().toISOString().split('T')[0];
      const { data: todayData, error: todayError } = await supabase
        .from('exhibitions')
        .select('title_local, venue_name, created_at')
        .gte('created_at', today);
        
      if (todayData && todayData.length > 0) {
        console.log('\n📅 오늘 추가된 전시들:', todayData.length, '개');
        todayData.forEach(ex => {
          const time = new Date(ex.created_at).toLocaleTimeString();
          console.log('  -', ex.title_local, '(' + ex.venue_name + ') [' + time + ']');
        });
      }
      return;
    }

    console.log('✅ 공유미래 전시 데이터 발견:', data.length, '개\n');
    
    const exhibition = data[0];
    console.log('📋 전시 정보:');
    console.log('ID:', exhibition.id);
    console.log('제목:', exhibition.title_local);
    console.log('영문명:', exhibition.title_en);
    console.log('부제:', exhibition.subtitle);
    console.log('장소:', exhibition.venue_name);
    console.log('주소:', exhibition.venue_address);
    console.log('기간:', exhibition.start_date, '~', exhibition.end_date);
    console.log('운영시간:', exhibition.operating_hours);
    console.log('입장료:', exhibition.admission_fee);
    console.log('상태:', exhibition.status);
    console.log('타입:', exhibition.exhibition_type);
    console.log('생성일:', exhibition.created_at);
    console.log('소스:', exhibition.source);
    
    if (exhibition.description) {
      console.log('\n📝 설명:');
      console.log(exhibition.description.substring(0, 200) + '...');
    }
    
    if (exhibition.tags) {
      console.log('\n🏷️ 태그:', exhibition.tags.join(', '));
    }

  } catch (error) {
    console.error('❌ 검색 오류:', error);
  }
}

checkSharedFuture();