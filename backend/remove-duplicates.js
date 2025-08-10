require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function removeDuplicates() {
  try {
    console.log('🔍 중복된 Mana Moana 전시 확인 중...');
    
    // First check all Mana Moana exhibitions
    const { data: allData, error: checkError } = await supabase
      .from('exhibitions')
      .select('id, title_local, venue_name, start_date')
      .eq('title_local', 'Mana Moana: Arts of Oceania');
    
    if (checkError) {
      console.error('조회 오류:', checkError);
      return;
    }
    
    console.log('찾은 Mana Moana 전시:', allData.length, '개');
    allData.forEach((ex, i) => {
      console.log(`${i+1}. ID: ${ex.id}`);
    });
    
    if (allData.length <= 1) {
      console.log('중복이 없습니다! ✅');
      return;
    }
    
    // Delete the two specific duplicates
    console.log('\n🗑️ 중복 제거 중...');
    
    const { error: error1 } = await supabase
      .from('exhibitions')
      .delete()
      .eq('id', 'fed7dc04-c7ff-409a-9a44-19cf4b3da311');
    
    const { error: error2 } = await supabase
      .from('exhibitions')
      .delete()
      .eq('id', '061a8233-ffa0-4c96-91fb-b2cd7d6ad808');
    
    if (error1) console.error('첫 번째 삭제 오류:', error1);
    if (error2) console.error('두 번째 삭제 오류:', error2);
    
    if (!error1 && !error2) {
      console.log('✅ 중복 제거 성공!');
      
      // Verify final result
      const { data: finalData } = await supabase
        .from('exhibitions')
        .select('id, title_local')
        .eq('title_local', 'Mana Moana: Arts of Oceania');
      
      console.log('최종 남은 Mana Moana 전시:', finalData.length, '개');
      if (finalData.length === 1) {
        console.log('유지된 ID:', finalData[0].id);
      }
    }
    
  } catch (error) {
    console.error('오류 발생:', error);
  }
  
  process.exit(0);
}

removeDuplicates();