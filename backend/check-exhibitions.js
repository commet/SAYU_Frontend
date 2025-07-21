#!/usr/bin/env node
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkExhibitions() {
  const client = await pool.connect();
  
  try {
    // 현재 전시 목록
    const result = await client.query(`
      SELECT id, title_en, venue_name, start_date, end_date, source
      FROM exhibitions
      ORDER BY collected_at DESC
    `);
    
    console.log('📊 현재 저장된 전시:', result.rows.length + '개\n');
    
    console.log('최근 10개 전시:');
    console.log('='.repeat(80));
    
    result.rows.slice(0, 10).forEach((row, i) => {
      console.log(`${i + 1}. ${row.title_en}`);
      console.log(`   장소: ${row.venue_name}`);
      console.log(`   기간: ${row.start_date} ~ ${row.end_date}`);
      console.log(`   출처: ${row.source}`);
      console.log('');
    });
    
    // 출처별 통계
    const sources = await client.query(`
      SELECT source, COUNT(*) as count
      FROM exhibitions
      GROUP BY source
      ORDER BY count DESC
    `);
    
    console.log('\n출처별 통계:');
    console.log('='.repeat(40));
    sources.rows.forEach(row => {
      console.log(`${row.source}: ${row.count}개`);
    });
    
    // 테이블 구조 확인
    const constraints = await client.query(`
      SELECT constraint_name, constraint_type
      FROM information_schema.table_constraints
      WHERE table_name = 'exhibitions'
    `);
    
    console.log('\n\n테이블 제약조건:');
    console.log('='.repeat(40));
    constraints.rows.forEach(row => {
      console.log(`${row.constraint_name}: ${row.constraint_type}`);
    });
    
  } finally {
    client.release();
  }
  
  process.exit(0);
}

checkExhibitions();