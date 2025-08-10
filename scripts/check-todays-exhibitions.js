const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkTodaysExhibitions() {
  try {
    console.log('🔍 오늘 추가된 전시들 상세 확인...\n');
    
    // 오늘 추가된 전시들 가져오기
    const today = new Date().toISOString().split('T')[0]; // 2025-08-10
    const { data, error } = await supabase
      .from('exhibitions')
      .select('*')
      .gte('created_at', today)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ 오류:', error);
      return;
    }

    if (!data || data.length === 0) {
      console.log('❌ 오늘 추가된 전시가 없습니다.');
      return;
    }

    console.log('📊 총', data.length, '개 전시가 오늘 추가됨\n');
    
    data.forEach((ex, idx) => {
      console.log('========================================');
      console.log((idx + 1) + '. 《' + ex.title_local + '》');
      console.log('========================================');
      console.log('🆔 ID: ' + ex.id);
      console.log('🏛️ 장소: ' + ex.venue_name);
      if (ex.venue_address) {
        console.log('📮 주소: ' + ex.venue_address);
      }
      console.log('📅 기간: ' + ex.start_date + ' ~ ' + ex.end_date);
      console.log('⏰ 운영시간: ' + (ex.operating_hours || '정보없음'));
      console.log('💰 입장료: ' + (ex.admission_fee || '정보없음'));
      console.log('📊 상태: ' + ex.status);
      console.log('🎨 타입: ' + ex.exhibition_type);
      console.log('🕐 추가시간: ' + new Date(ex.created_at).toLocaleString('ko-KR'));
      
      if (ex.title_en) {
        console.log('🌍 영문명: ' + ex.title_en);
      }
      if (ex.subtitle) {
        console.log('📝 부제: ' + ex.subtitle);
      }
      if (ex.artists && ex.artists.length > 0) {
        console.log('👨‍🎨 작가: ' + ex.artists.join(', '));
      }
      if (ex.curator) {
        console.log('👥 큐레이터: ' + ex.curator);
      }
      if (ex.tags && ex.tags.length > 0) {
        console.log('🏷️ 태그: ' + ex.tags.join(', '));
      }
      if (ex.contact_info) {
        console.log('📞 연락처: ' + ex.contact_info);
      }
      if (ex.source) {
        console.log('🔗 소스: ' + ex.source);
      }
      
      // 설명 일부만 표시
      if (ex.description) {
        const shortDesc = ex.description.length > 150 ? 
          ex.description.substring(0, 150) + '...' : ex.description;
        console.log('📖 설명: ' + shortDesc);
      }
      
      console.log('');
    });

  } catch (error) {
    console.error('❌ 전체 오류:', error);
  }
}

checkTodaysExhibitions();