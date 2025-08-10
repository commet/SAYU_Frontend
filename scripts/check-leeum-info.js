const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkLeeumData() {
  console.log('🔍 리움미술관 정보 확인 중...\n');
  
  try {
    // 리움미술관 전시 데이터 확인
    const { data: exhibitions, error } = await supabase
      .from('exhibitions')
      .select('id, title_local, venue_name, venue_address, phone_number, contact_info')
      .eq('venue_name', '리움미술관')
      .limit(5);
    
    if (error) {
      console.error('❌ 조회 중 오류:', error.message);
      return;
    }
    
    console.log('📋 리움미술관 전시 데이터 샘플:');
    exhibitions.forEach((ex, index) => {
      console.log(`${index + 1}. ${ex.title_local}`);
      console.log(`   주소: ${ex.venue_address || '정보 없음'}`);
      console.log(`   연락처: ${ex.phone_number || '정보 없음'}`);
      if (ex.contact_info) {
        try {
          const contact = JSON.parse(ex.contact_info);
          console.log(`   상세 연락처:`, contact);
        } catch (e) {
          console.log(`   상세 연락처: ${ex.contact_info}`);
        }
      }
      console.log('');
    });
    
    console.log(`📊 총 리움미술관 전시 샘플: ${exhibitions.length}개`);
    
    // 전체 리움미술관 전시 수 확인
    const { count, error: countError } = await supabase
      .from('exhibitions')
      .select('id', { count: 'exact' })
      .eq('venue_name', '리움미술관');
    
    if (!countError) {
      console.log(`📈 리움미술관 전체 전시 수: ${count}개`);
    }
    
    // 주소 정보 확인
    console.log('\n🏛️ 리움미술관 주소 정보 분석:');
    const uniqueAddresses = [...new Set(exhibitions.map(ex => ex.venue_address).filter(Boolean))];
    uniqueAddresses.forEach((addr, index) => {
      console.log(`${index + 1}. ${addr}`);
    });
    
    // 연락처 정보 확인
    console.log('\n📞 리움미술관 연락처 정보 분석:');
    const uniquePhones = [...new Set(exhibitions.map(ex => ex.phone_number).filter(Boolean))];
    uniquePhones.forEach((phone, index) => {
      console.log(`${index + 1}. ${phone}`);
    });
    
  } catch (error) {
    console.error('❌ 확인 중 오류 발생:', error.message);
  }
}

checkLeeumData();