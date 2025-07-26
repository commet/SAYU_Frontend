#!/usr/bin/env node
require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkColumns() {
  const client = await pool.connect();
  
  try {
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'venues' 
      ORDER BY ordinal_position
    `);
    
    console.log('venues 테이블 컬럼 목록:');
    console.log('===================================');
    result.rows.forEach(row => {
      console.log(`${row.column_name.padEnd(25)} | ${row.data_type.padEnd(20)} | ${row.is_nullable} | ${row.column_default || 'NULL'}`);
    });
    
  } catch (error) {
    console.error('오류:', error);
  } finally {
    client.release();
    pool.end();
  }
}

checkColumns();