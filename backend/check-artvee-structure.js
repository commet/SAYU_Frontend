/**
 * Artvee 테이블 구조 확인
 */

require('dotenv').config();
const { pool } = require('./src/config/database');

async function checkArtveeStructure() {
  const client = await pool.connect();
  
  try {
    console.log('📋 Artvee 관련 테이블 구조 확인...\n');
    
    // 1. artvee_artworks 테이블 존재 여부 확인
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'artvee_artworks'
      )
    `);
    
    if (!tableExists.rows[0].exists) {
      console.log('❌ artvee_artworks 테이블이 존재하지 않습니다.');
      
      // artvee 관련 테이블 검색
      const artveeTables = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_name LIKE '%artvee%' 
          AND table_schema = 'public'
        ORDER BY table_name
      `);
      
      console.log('\n🔍 Artvee 관련 테이블:');
      artveeTables.rows.forEach(row => {
        console.log(`  - ${row.table_name}`);
      });
      
      // artworks 테이블 확인
      const artworksTables = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_name LIKE '%artwork%' 
          AND table_schema = 'public'
        ORDER BY table_name
      `);
      
      console.log('\n🖼️ Artwork 관련 테이블:');
      artworksTables.rows.forEach(row => {
        console.log(`  - ${row.table_name}`);
      });
      
    } else {
      // 2. artvee_artworks 테이블 컬럼 정보
      const columns = await client.query(`
        SELECT 
          column_name,
          data_type,
          character_maximum_length,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_name = 'artvee_artworks'
        ORDER BY ordinal_position
      `);
      
      console.log('✅ artvee_artworks 테이블 구조:');
      columns.rows.forEach(col => {
        const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const length = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
        console.log(`  - ${col.column_name}: ${col.data_type}${length} ${nullable}`);
      });
    }
    
    console.log('\n');
    
    // 3. artists 테이블 구조
    const artistsColumns = await client.query(`
      SELECT 
        column_name,
        data_type,
        character_maximum_length,
        is_nullable
      FROM information_schema.columns
      WHERE table_name = 'artists'
      ORDER BY ordinal_position
    `);
    
    if (artistsColumns.rows.length > 0) {
      console.log('👨‍🎨 artists 테이블 구조:');
      artistsColumns.rows.forEach(col => {
        const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const length = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
        console.log(`  - ${col.column_name}: ${col.data_type}${length} ${nullable}`);
      });
    } else {
      console.log('❌ artists 테이블이 존재하지 않습니다.');
    }
    
    // 4. 샘플 데이터 확인
    console.log('\n📊 샘플 데이터:');
    
    // Artvee artworks가 있다면
    if (tableExists.rows[0].exists) {
      const sampleArtvee = await client.query(`
        SELECT * FROM artvee_artworks LIMIT 5
      `);
      
      console.log('\nArtvee 작품 샘플:');
      sampleArtvee.rows.forEach((row, index) => {
        console.log(`\n[${index + 1}]`);
        console.log(`  Title: ${row.title || 'N/A'}`);
        console.log(`  Artist: ${row.artist || 'N/A'}`);
        Object.keys(row).forEach(key => {
          if (!['id', 'title', 'artist'].includes(key) && row[key]) {
            console.log(`  ${key}: ${JSON.stringify(row[key]).substring(0, 50)}...`);
          }
        });
      });
    }
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
  } finally {
    client.release();
  }
}

// 실행
checkArtveeStructure().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('❌ 실행 실패:', error);
  process.exit(1);
});