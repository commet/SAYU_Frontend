#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config();

async function createCrawlingTables() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
  
  try {
    console.log('🔧 Creating crawling tables in Railway...');
    
    const client = await pool.connect();
    
    // 1. Create exhibition_raw_data table
    console.log('📋 Creating exhibition_raw_data table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS exhibition_raw_data (
        id SERIAL PRIMARY KEY,
        source VARCHAR(50) NOT NULL,
        venue_name VARCHAR(255),
        raw_content TEXT,
        parsed_data JSONB,
        processing_status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // 2. Create naver_search_cache table
    console.log('📋 Creating naver_search_cache table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS naver_search_cache (
        id SERIAL PRIMARY KEY,
        query VARCHAR(500) UNIQUE,
        response_data JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '24 hours'
      )
    `);
    
    // 3. Create scraping_jobs table
    console.log('📋 Creating scraping_jobs table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS scraping_jobs (
        id SERIAL PRIMARY KEY,
        venue_id UUID,
        venue_name VARCHAR(255),
        job_type VARCHAR(50),
        status VARCHAR(20) DEFAULT 'pending',
        started_at TIMESTAMP,
        completed_at TIMESTAMP,
        error_message TEXT,
        results_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // 4. Create indexes
    console.log('📋 Creating indexes...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_raw_data_status ON exhibition_raw_data(processing_status);
      CREATE INDEX IF NOT EXISTS idx_raw_data_created ON exhibition_raw_data(created_at);
      CREATE INDEX IF NOT EXISTS idx_cache_query ON naver_search_cache(query);
      CREATE INDEX IF NOT EXISTS idx_cache_expires ON naver_search_cache(expires_at);
      CREATE INDEX IF NOT EXISTS idx_jobs_status ON scraping_jobs(status);
    `);
    
    // 5. Verify tables were created
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('exhibition_raw_data', 'naver_search_cache', 'scraping_jobs')
    `);
    
    console.log('✅ Created tables:', result.rows.map(r => r.table_name).join(', '));
    
    client.release();
    
  } catch (error) {
    console.error('❌ Error creating tables:', error);
  } finally {
    await pool.end();
  }
}

createCrawlingTables();