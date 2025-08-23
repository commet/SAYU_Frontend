const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkExhibitionSchema() {
  console.log('📋 Exhibitions 테이블 컬럼 확인...\n');
  
  try {
    // 샘플 데이터 가져오기
    const { data, error } = await supabase
      .from('exhibitions')
      .select('*')
      .limit(1);
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      const columns = Object.keys(data[0]);
      console.log('✅ 사용 가능한 컬럼들:');
      columns.forEach(col => {
        console.log(`  - ${col}: ${typeof data[0][col]}`);
      });
      
      console.log('\n📌 이미지 관련 컬럼:');
      const imageColumns = columns.filter(col => 
        col.toLowerCase().includes('image') || 
        col.toLowerCase().includes('img') ||
        col.toLowerCase().includes('photo') ||
        col.toLowerCase().includes('picture')
      );
      
      if (imageColumns.length > 0) {
        imageColumns.forEach(col => {
          console.log(`  - ${col}: ${data[0][col] ? '값 있음' : '비어있음'}`);
        });
      } else {
        console.log('  이미지 관련 컬럼이 없습니다.');
      }
    }
    
  } catch (error) {
    console.error('❌ 오류:', error.message);
  }
}

checkExhibitionSchema();