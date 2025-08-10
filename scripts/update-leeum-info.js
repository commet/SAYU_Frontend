const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function updateLeeumInfo() {
  console.log('🔄 리움미술관 정보 업데이트 시작...\n');
  
  try {
    // 먼저 현재 데이터 확인
    const { data: exhibitions, error: selectError } = await supabase
      .from('exhibitions')
      .select('id, title_local, venue_address, phone_number, contact_info')
      .eq('venue_name', '리움미술관');
    
    if (selectError) {
      console.error('❌ 조회 중 오류:', selectError.message);
      return;
    }
    
    console.log(`📋 업데이트 대상: ${exhibitions.length}개 전시\n`);
    
    let updatedCount = 0;
    
    for (const exhibition of exhibitions) {
      console.log(`🔄 ${exhibition.title_local} 업데이트 중...`);
      
      // 주소 통일: 이태원로55길 60
      let newAddress = exhibition.venue_address;
      if (newAddress) {
        // 한남대로27길 주소를 이태원로55길로 변경
        if (newAddress.includes('한남대로27길 60')) {
          newAddress = newAddress.replace('한남대로27길 60', '이태원로55길 60');
        }
        // 건물 번호 제거 (60-16 -> 60)
        newAddress = newAddress.replace('이태원로55길 60-16', '이태원로55길 60');
        // 전시관 정보는 유지
      } else {
        newAddress = '서울특별시 용산구 이태원로55길 60';
      }
      
      // 연락처 통일: 대표 번호 02-2014-6900
      let newPhoneNumber = '02-2014-6900';
      
      // contact_info 업데이트: 특정 전시 담당이 있으면 병기
      let newContactInfo = exhibition.contact_info;
      if (newContactInfo) {
        try {
          const contact = JSON.parse(newContactInfo);
          
          // 기본 정보 설정
          contact['대표'] = '02-2014-6900';
          contact['홈페이지'] = 'www.leeum.org';
          
          // 특정 담당자가 있으면 유지
          if (contact['담당'] && contact['문의'] && contact['문의'] !== '02-2014-6900') {
            // 특정 담당자 정보 유지
          } else {
            // 일반적인 경우 대표 번호로 통일
            contact['문의'] = '02-2014-6900';
          }
          
          newContactInfo = JSON.stringify(contact);
        } catch (e) {
          // JSON 파싱 실패시 기본값 설정
          newContactInfo = JSON.stringify({
            '대표': '02-2014-6900',
            '문의': '02-2014-6900',
            '홈페이지': 'www.leeum.org'
          });
        }
      } else {
        // contact_info가 없는 경우 기본값 설정
        newContactInfo = JSON.stringify({
          '대표': '02-2014-6900',
          '문의': '02-2014-6900',
          '홈페이지': 'www.leeum.org'
        });
      }
      
      // 업데이트 실행
      const { error: updateError } = await supabase
        .from('exhibitions')
        .update({
          venue_address: newAddress,
          phone_number: newPhoneNumber,
          contact_info: newContactInfo
        })
        .eq('id', exhibition.id);
      
      if (updateError) {
        console.error(`❌ ${exhibition.title_local} 업데이트 실패:`, updateError.message);
        continue;
      }
      
      console.log(`✅ ${exhibition.title_local} 업데이트 완료`);
      console.log(`   주소: ${newAddress}`);
      console.log(`   연락처: ${newPhoneNumber}`);
      
      try {
        const contact = JSON.parse(newContactInfo);
        if (contact['담당'] && contact['문의'] !== contact['대표']) {
          console.log(`   담당: ${contact['담당']} (${contact['문의']})`);
        }
      } catch (e) {
        // JSON 파싱 실패시 무시
      }
      
      console.log('');
      updatedCount++;
    }
    
    console.log(`🎉 리움미술관 정보 업데이트 완료!`);
    console.log(`   - 업데이트된 전시: ${updatedCount}개`);
    console.log(`   - 통일된 주소: 서울특별시 용산구 이태원로55길 60`);
    console.log(`   - 통일된 대표번호: 02-2014-6900`);
    console.log(`   - 특정 담당자 정보는 추가로 유지`);
    
    // 업데이트 결과 확인
    console.log('\n🔍 업데이트 결과 확인...');
    const { data: updatedExhibitions, error: checkError } = await supabase
      .from('exhibitions')
      .select('title_local, venue_address, phone_number, contact_info')
      .eq('venue_name', '리움미술관')
      .limit(3);
    
    if (!checkError && updatedExhibitions) {
      console.log('\n📋 업데이트 결과 샘플:');
      updatedExhibitions.forEach((ex, index) => {
        console.log(`${index + 1}. ${ex.title_local}`);
        console.log(`   주소: ${ex.venue_address}`);
        console.log(`   연락처: ${ex.phone_number}`);
        try {
          const contact = JSON.parse(ex.contact_info);
          console.log(`   상세:`, contact);
        } catch (e) {
          console.log(`   상세: ${ex.contact_info}`);
        }
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ 업데이트 중 오류 발생:', error.message);
  }
}

updateLeeumInfo();