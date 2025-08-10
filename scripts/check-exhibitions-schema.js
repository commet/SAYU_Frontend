const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkExhibitionsSchema() {
  console.log('🔍 exhibitions 테이블 스키마 확인...\n');
  
  try {
    // PostgreSQL에서 테이블 구조 조회
    const { data, error } = await supabase.rpc('get_table_columns', {
      table_name: 'exhibitions'
    });
    
    if (error) {
      // 직접 쿼리로 시도
      const { data: columns, error: directError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_name', 'exhibitions')
        .order('ordinal_position');
      
      if (directError) {
        // 샘플 데이터로 스키마 파악
        const { data: sample, error: sampleError } = await supabase
          .from('exhibitions')
          .select('*')
          .limit(1);
        
        if (sampleError) throw sampleError;
        
        if (sample && sample.length > 0) {
          console.log('📊 샘플 데이터 기반 컬럼 목록:');
          const columns = Object.keys(sample[0]).sort();
          columns.forEach((col, index) => {
            console.log(`${index + 1}. ${col}`);
          });
          
          console.log('\n🔍 JSON에서 필요한 컬럼들:');
          const requiredColumns = [
            'poster_image_url',
            'gallery_images', 
            'gallery_location',
            'official_url',
            'themes',
            'artists',
            'sponsors',
            'collaborators',
            'special_events'
          ];
          
          requiredColumns.forEach(col => {
            const exists = columns.includes(col);
            console.log(`   ${exists ? '✅' : '❌'} ${col}`);
          });
        }
      } else {
        console.log('📊 테이블 컬럼 정보:');
        columns.forEach((col, index) => {
          console.log(`${index + 1}. ${col.column_name} (${col.data_type}) - ${col.is_nullable === 'YES' ? 'nullable' : 'not null'}`);
        });
      }
    }
    
    // MET 전시 하나의 실제 데이터 구조 확인
    console.log('\n📋 실제 MET 전시 데이터 구조:');
    const { data: metSample, error: metError } = await supabase
      .from('exhibitions')
      .select('*')
      .or('venue_name.ilike.%Metropolitan Museum%,venue_name.ilike.%Met Cloisters%')
      .limit(1);
    
    if (metError) throw metError;
    
    if (metSample && metSample.length > 0) {
      const exhibition = metSample[0];
      console.log(`샘플: ${exhibition.title_en || exhibition.title}`);
      console.log('구조:');
      Object.entries(exhibition).forEach(([key, value]) => {
        const type = Array.isArray(value) ? 'array' : typeof value;
        const preview = type === 'string' && value && value.length > 50 
          ? value.substring(0, 50) + '...' 
          : value;
        console.log(`  ${key}: ${type} = ${JSON.stringify(preview)}`);
      });
    }
    
  } catch (error) {
    console.error('❌ 스키마 확인 중 오류 발생:', error.message);
    if (error.details) console.error('세부사항:', error.details);
    if (error.hint) console.error('힌트:', error.hint);
  }
}

// 실행
checkExhibitionsSchema();