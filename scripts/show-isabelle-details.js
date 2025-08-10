const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function showIsabelleDetails() {
  try {
    const { data, error } = await supabase
      .from('exhibitions')
      .select('*')
      .eq('title_local', '이자벨 드 가네 : 모먼츠');

    if (error) {
      console.error('Error:', error);
      return;
    }

    if (!data || data.length === 0) {
      console.log('이자벨 드 가네 전시를 찾을 수 없습니다.');
      return;
    }

    const exhibition = data[0];
    console.log('========== 이자벨 드 가네 전시 상세 정보 ==========');
    console.log('');
    console.log('🆔 ID: ' + exhibition.id);
    console.log('📝 제목 (한국어): ' + exhibition.title_local);
    console.log('🌍 제목 (영어): ' + exhibition.title_en);
    console.log('📄 부제: ' + exhibition.subtitle);
    console.log('');
    console.log('📅 시작일: ' + exhibition.start_date);
    console.log('📅 종료일: ' + exhibition.end_date);
    console.log('📊 상태: ' + exhibition.status);
    console.log('🎨 전시 타입: ' + exhibition.exhibition_type);
    console.log('');
    console.log('🏛️ 장소명: ' + exhibition.venue_name);
    console.log('🌍 도시: ' + exhibition.venue_city);
    console.log('🌏 국가: ' + exhibition.venue_country);
    console.log('📮 주소: ' + exhibition.venue_address);
    console.log('');
    console.log('⏰ 운영시간: ' + exhibition.operating_hours);
    console.log('💰 입장료: ' + exhibition.admission_fee);
    console.log('');
    console.log('👨‍🎨 작가: ' + (exhibition.artists ? exhibition.artists.join(', ') : 'null'));
    console.log('👥 큐레이터: ' + (exhibition.curator || 'null'));
    console.log('');
    console.log('📞 연락처: ' + (exhibition.contact_info || 'null'));
    console.log('☎️ 전화번호: ' + (exhibition.phone_number || 'null'));
    console.log('');
    console.log('🏷️ 태그: ' + (exhibition.tags ? exhibition.tags.join(', ') : 'null'));
    console.log('');
    console.log('🔗 소스: ' + (exhibition.source || 'null'));
    console.log('🌐 소스 URL: ' + (exhibition.source_url || 'null'));
    console.log('');
    console.log('🕐 생성일: ' + exhibition.created_at);
    console.log('🕐 수정일: ' + (exhibition.updated_at || 'null'));
    console.log('');
    console.log('👀 조회수: ' + exhibition.view_count);
    console.log('🤖 AI 검증: ' + exhibition.ai_verified);
    console.log('📊 AI 신뢰도: ' + exhibition.ai_confidence);
    console.log('');
    console.log('📝 전시 설명:');
    console.log('----------------------------------------');
    console.log(exhibition.description || 'null');
    
  } catch (error) {
    console.error('오류 발생:', error);
  }
}

showIsabelleDetails();