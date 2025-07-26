/**
 * exhibitions 테이블 구조 확인
 */

const { pool } = require('./src/config/database');

async function checkExhibitionsSchema() {
  try {
    console.log('📋 exhibitions 테이블 구조 확인...\n');

    // 테이블 구조 확인
    const schemaQuery = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'exhibitions' 
      ORDER BY ordinal_position;
    `;
    
    const schema = await pool.query(schemaQuery);
    
    console.log('=== EXHIBITIONS 테이블 구조 ===');
    schema.rows.forEach(row => {
      const nullable = row.is_nullable === 'YES' ? 'NULL 가능' : '필수';
      const defaultVal = row.column_default ? ` (기본값: ${row.column_default})` : '';
      console.log(`  ${row.column_name}: ${row.data_type} (${nullable})${defaultVal}`);
    });

    // 샘플 데이터 확인
    console.log('\n=== 샘플 데이터 (최근 5개) ===');
    const sampleQuery = `
      SELECT id, title, venue_name, start_date, end_date, city, country, source
      FROM exhibitions 
      ORDER BY created_at DESC 
      LIMIT 5;
    `;
    
    const samples = await pool.query(sampleQuery);
    samples.rows.forEach((row, i) => {
      console.log(`${i + 1}. ${row.title}`);
      console.log(`   장소: ${row.venue_name}`);
      console.log(`   위치: ${row.city}, ${row.country}`);
      console.log(`   기간: ${row.start_date} ~ ${row.end_date}`);
      console.log(`   출처: ${row.source}`);
      console.log('');
    });

    // 출처별 통계
    console.log('=== 출처별 전시 수 ===');
    const sourceQuery = `
      SELECT source, COUNT(*) as count 
      FROM exhibitions 
      GROUP BY source 
      ORDER BY count DESC;
    `;
    
    const sources = await pool.query(sourceQuery);
    sources.rows.forEach(row => {
      console.log(`  ${row.source}: ${row.count}개`);
    });

  } catch (error) {
    console.error('❌ 오류:', error.message);
  } finally {
    if (pool && pool.end) {
      await pool.end();
    }
  }
}

if (require.main === module) {
  checkExhibitionsSchema();
}

module.exports = checkExhibitionsSchema;