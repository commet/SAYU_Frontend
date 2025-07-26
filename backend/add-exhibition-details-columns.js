#!/usr/bin/env node
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function addExhibitionDetailsColumns() {
  console.log('🔧 exhibitions 테이블에 상세 정보 컬럼들 추가\n');
  
  const client = await pool.connect();
  
  try {
    // 추가할 컬럼들 목록
    const newColumns = [
      { name: 'venue_address', type: 'TEXT' },
      { name: 'phone_number', type: 'VARCHAR(50)' },
      { name: 'admission_fee', type: 'TEXT' },
      { name: 'operating_hours', type: 'TEXT' }
    ];
    
    for (const column of newColumns) {
      // 컬럼이 이미 있는지 확인
      const columnCheck = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'exhibitions' AND column_name = $1
      `, [column.name]);
      
      if (columnCheck.rows.length > 0) {
        console.log(`ℹ️  ${column.name} 컬럼이 이미 존재합니다.`);
        continue;
      }
      
      // 컬럼 추가
      await client.query(`
        ALTER TABLE exhibitions 
        ADD COLUMN ${column.name} ${column.type}
      `);
      
      console.log(`✅ ${column.name} 컬럼이 성공적으로 추가되었습니다.`);
    }
    
    // 테이블 구조 확인 (새로 추가된 컬럼들만)
    const newColumnsCheck = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'exhibitions' 
      AND column_name IN ('venue_address', 'phone_number', 'admission_fee', 'operating_hours')
    `);
    
    console.log('\n📋 새로 추가된 컬럼들:');
    console.log('=' .repeat(60));
    newColumnsCheck.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`);
    });
    console.log('=' .repeat(60));
    
  } catch (error) {
    console.error('❌ 오류:', error.message);
  } finally {
    client.release();
  }
}

// 실행
async function main() {
  await addExhibitionDetailsColumns();
  await pool.end();
}

if (require.main === module) {
  main();
}

module.exports = { addExhibitionDetailsColumns };