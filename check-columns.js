// exhibitions 테이블의 실제 컬럼 확인
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './frontend/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
  // 모든 컬럼 가져오기 (1개 row만)
  const { data: sampleRow, error } = await supabase
    .from('exhibitions')
    .select('*')
    .limit(1);
    
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  if (sampleRow && sampleRow.length > 0) {
    console.log('=== exhibitions 테이블 컬럼 목록 ===');
    const columns = Object.keys(sampleRow[0]);
    columns.forEach(col => {
      const value = sampleRow[0][col];
      const valueType = typeof value;
      const preview = value !== null ? 
        (valueType === 'string' && value.length > 50 ? value.substring(0, 50) + '...' : value) : 
        'null';
      console.log(`- ${col}: ${valueType} (예시: ${preview})`);
    });
    
    console.log('\n=== 인기/조회 관련 컬럼 찾기 ===');
    const popularityColumns = columns.filter(col => 
      col.toLowerCase().includes('popular') || 
      col.toLowerCase().includes('view') || 
      col.toLowerCase().includes('score') ||
      col.toLowerCase().includes('count') ||
      col.toLowerCase().includes('rank')
    );
    
    if (popularityColumns.length > 0) {
      console.log('발견된 관련 컬럼:', popularityColumns);
    } else {
      console.log('인기도 관련 컬럼이 없습니다.');
    }
    
    console.log('\n=== 날짜 관련 컬럼 ===');
    const dateColumns = columns.filter(col => 
      col.toLowerCase().includes('date') || 
      col.toLowerCase().includes('time')
    );
    console.log('날짜 컬럼:', dateColumns);
    
    // 실제 날짜 값 확인
    if (sampleRow[0].start_date && sampleRow[0].end_date) {
      console.log('\n샘플 날짜 데이터:');
      console.log('start_date:', sampleRow[0].start_date);
      console.log('end_date:', sampleRow[0].end_date);
    }
  }
  
  // 현재 진행중인 전시 테스트
  const today = new Date().toISOString().split('T')[0];
  console.log('\n=== 진행중인 전시 테스트 ===');
  console.log('오늘 날짜:', today);
  
  const { data: currentExhibitions, count } = await supabase
    .from('exhibitions')
    .select('id, title_local, venue_name, start_date, end_date', { count: 'exact' })
    .lte('start_date', today)
    .gte('end_date', today)
    .limit(3);
    
  console.log('\n진행중인 전시 수:', count);
  if (currentExhibitions && currentExhibitions.length > 0) {
    console.log('\n처음 3개 (챗봇이 추천하는 것과 동일):');
    currentExhibitions.forEach((ex, idx) => {
      console.log(`${idx + 1}. ${ex.venue_name || ex.title_local}`);
      console.log(`   기간: ${ex.start_date} ~ ${ex.end_date}`);
    });
  }
}

checkColumns().catch(console.error);