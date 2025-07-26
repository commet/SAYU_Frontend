/**
 * Check Global Tables Structure
 * global_venues와 global_exhibitions 테이블 구조 확인
 */

const { Pool } = require('pg');
require('dotenv').config();

async function checkTableStructure() {
  console.log('🔍 GLOBAL TABLES STRUCTURE CHECK');
  console.log('=================================\n');

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    // 1. global_venues 테이블 구조 확인
    console.log('🏛️  GLOBAL_VENUES TABLE STRUCTURE:');
    console.log('================================');
    
    const venuesStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'global_venues'
      ORDER BY ordinal_position;
    `);
    
    if (venuesStructure.rows.length === 0) {
      console.log('❌ global_venues 테이블이 존재하지 않습니다!');
    } else {
      venuesStructure.rows.forEach(row => {
        console.log(`   ${row.column_name} | ${row.data_type} | nullable: ${row.is_nullable}`);
      });
    }

    // 2. global_venues 인덱스 확인
    console.log('\n🔑 GLOBAL_VENUES CONSTRAINTS & INDEXES:');
    console.log('=====================================');
    
    const venuesConstraints = await pool.query(`
      SELECT conname, contype, pg_get_constraintdef(oid) as definition
      FROM pg_constraint 
      WHERE conrelid = 'global_venues'::regclass;
    `);
    
    venuesConstraints.rows.forEach(row => {
      console.log(`   ${row.conname} (${row.contype}): ${row.definition}`);
    });

    // 3. global_exhibitions 테이블 구조 확인
    console.log('\n🎨 GLOBAL_EXHIBITIONS TABLE STRUCTURE:');
    console.log('====================================');
    
    const exhibitionsStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'global_exhibitions'
      ORDER BY ordinal_position;
    `);
    
    if (exhibitionsStructure.rows.length === 0) {
      console.log('❌ global_exhibitions 테이블이 존재하지 않습니다!');
    } else {
      exhibitionsStructure.rows.forEach(row => {
        console.log(`   ${row.column_name} | ${row.data_type} | nullable: ${row.is_nullable}`);
      });
    }

    // 4. global_exhibitions 인덱스 확인
    console.log('\n🔑 GLOBAL_EXHIBITIONS CONSTRAINTS & INDEXES:');
    console.log('==========================================');
    
    const exhibitionsConstraints = await pool.query(`
      SELECT conname, contype, pg_get_constraintdef(oid) as definition
      FROM pg_constraint 
      WHERE conrelid = 'global_exhibitions'::regclass;
    `);
    
    exhibitionsConstraints.rows.forEach(row => {
      console.log(`   ${row.conname} (${row.contype}): ${row.definition}`);
    });

    // 5. 기존 데이터 확인
    console.log('\n📊 EXISTING DATA COUNT:');
    console.log('=====================');
    
    const venuesCount = await pool.query('SELECT COUNT(*) FROM global_venues');
    const exhibitionsCount = await pool.query('SELECT COUNT(*) FROM global_exhibitions');
    
    console.log(`   global_venues: ${venuesCount.rows[0].count} rows`);
    console.log(`   global_exhibitions: ${exhibitionsCount.rows[0].count} rows`);

    // 6. 기존 timeout_enhanced 데이터 확인
    const timeoutVenues = await pool.query(`
      SELECT COUNT(*) FROM global_venues WHERE data_source = 'timeout_enhanced'
    `);
    const timeoutExhibitions = await pool.query(`
      SELECT COUNT(*) FROM global_exhibitions WHERE data_source = 'timeout_enhanced'
    `);
    
    console.log(`   timeout_enhanced venues: ${timeoutVenues.rows[0].count} rows`);
    console.log(`   timeout_enhanced exhibitions: ${timeoutExhibitions.rows[0].count} rows`);

  } catch (error) {
    console.error('❌ 테이블 구조 확인 오류:', error.message);
  } finally {
    await pool.end();
  }
}

// 실행
if (require.main === module) {
  checkTableStructure();
}

module.exports = { checkTableStructure };