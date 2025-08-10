const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function updateExhibitionsSchema() {
  console.log('🔧 exhibitions 테이블 스키마 업데이트 시작...\n');
  
  const columnsToAdd = [
    // 영문 필드들
    { name: 'admission_fee_en', type: 'TEXT', description: '입장료 영문' },
    { name: 'location_en', type: 'TEXT', description: '위치 영문' },
    { name: 'organizer_en', type: 'TEXT', description: '주최자 영문' },
    { name: 'description_en', type: 'TEXT', description: '설명 영문' },
    
    // JSON 필드들
    { name: 'highlights', type: 'JSONB', description: '전시 하이라이트' },
    { name: 'sections', type: 'JSONB', description: '전시 섹션 정보' },
    { name: 'programs', type: 'JSONB', description: '관련 프로그램' },
    { name: 'visitor_info', type: 'JSONB', description: '관람객 정보' },
    { name: 'related_artists', type: 'JSONB', description: '관련 아티스트 정보' },
    
    // 추가 중요 필드들
    { name: 'poster_image_url', type: 'TEXT', description: '포스터 이미지 URL' },
    { name: 'gallery_images', type: 'JSONB', description: '갤러리 이미지들' },
    { name: 'gallery_location', type: 'TEXT', description: '갤러리 위치' },
    { name: 'themes', type: 'JSONB', description: '전시 테마들' },
    { name: 'sponsors', type: 'JSONB', description: '후원사들' },
    { name: 'collaborators', type: 'JSONB', description: '협력기관들' },
    { name: 'special_events', type: 'JSONB', description: '특별 이벤트들' },
    { name: 'accessibility_info', type: 'JSONB', description: '접근성 정보' },
    { name: 'price_details', type: 'JSONB', description: '가격 상세정보' },
    { name: 'booking_info', type: 'JSONB', description: '예약 정보' }
  ];

  try {
    for (const column of columnsToAdd) {
      console.log(`📝 ${column.name} 컬럼 추가 중...`);
      
      // 컬럼이 이미 존재하는지 확인
      const { data: existing, error: checkError } = await supabase.rpc('exec_sql', {
        sql: `
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'exhibitions' 
          AND column_name = '${column.name}';
        `
      });
      
      if (checkError && !checkError.message.includes('does not exist')) {
        // RPC가 없는 경우 직접 ALTER TABLE 실행
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: `ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS ${column.name} ${column.type};`
        });
        
        if (error) {
          // RPC가 없는 경우 pgAdmin 또는 다른 방법으로 실행해야 함을 안내
          console.log(`⚠️  ${column.name}: RPC 함수가 없어 직접 실행이 필요합니다.`);
          console.log(`   SQL: ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS ${column.name} ${column.type};`);
        } else {
          console.log(`✅ ${column.name} 컬럼 추가 완료`);
        }
      } else if (existing && existing.length > 0) {
        console.log(`ℹ️  ${column.name} 컬럼이 이미 존재합니다.`);
      }
    }
    
    console.log('\n🎉 스키마 업데이트 완료!');
    
    // 업데이트된 스키마 확인
    console.log('\n📊 업데이트된 테이블 컬럼 목록:');
    const { data: sample, error: sampleError } = await supabase
      .from('exhibitions')
      .select('*')
      .limit(1);
    
    if (sampleError) throw sampleError;
    
    if (sample && sample.length > 0) {
      const columns = Object.keys(sample[0]).sort();
      columns.forEach((col, index) => {
        const isNew = columnsToAdd.some(newCol => newCol.name === col);
        console.log(`${index + 1}. ${col} ${isNew ? '🆕' : ''}`);
      });
    }
    
  } catch (error) {
    console.error('❌ 스키마 업데이트 중 오류 발생:', error.message);
    if (error.details) console.error('세부사항:', error.details);
    if (error.hint) console.error('힌트:', error.hint);
    
    // SQL 문을 파일로 출력
    console.log('\n📄 수동 실행을 위한 SQL 문들:');
    console.log('-- exhibitions 테이블 스키마 업데이트');
    columnsToAdd.forEach(column => {
      console.log(`ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS ${column.name} ${column.type}; -- ${column.description}`);
    });
  }
}

// 실행
updateExhibitionsSchema();