#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config();

async function updateScrapingJobsTable() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    console.log('🔧 Updating scraping_jobs table...');
    
    const client = await pool.connect();
    
    // 메타데이터 컬럼 추가
    await client.query(`
      ALTER TABLE scraping_jobs 
      ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb
    `);
    
    console.log('✅ Added metadata column to scraping_jobs table');
    
    client.release();
    
  } catch (error) {
    console.error('❌ Error updating table:', error);
  } finally {
    await pool.end();
  }
}

updateScrapingJobsTable();