#!/usr/bin/env node
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function addWebsiteUrlColumn() {
  console.log('🔧 exhibitions 테이블에 website_url 컬럼 추가\n');
  
  const client = await pool.connect();
  
  try {
    // website_url 컬럼이 이미 있는지 확인
    const columnCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'exhibitions' AND column_name = 'website_url'
    `);
    
    if (columnCheck.rows.length > 0) {
      console.log('ℹ️  website_url 컬럼이 이미 존재합니다.');
      return;
    }
    
    // website_url 컬럼 추가
    await client.query(`
      ALTER TABLE exhibitions 
      ADD COLUMN website_url TEXT
    `);
    
    console.log('✅ website_url 컬럼이 성공적으로 추가되었습니다.');
    
    // 테이블 구조 확인
    const tableInfo = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'exhibitions' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 exhibitions 테이블 구조:');
    console.log('=' .repeat(60));
    tableInfo.rows.forEach(col => {
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
  await addWebsiteUrlColumn();
  await pool.end();
}

if (require.main === module) {
  main();
}

module.exports = { addWebsiteUrlColumn };