#!/usr/bin/env node
require('dotenv').config();

const { Pool } = require('pg');

// 데이터베이스 연결 설정
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function setupCollectionTables() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Setting up exhibition collection tables...');
    
    // 1. collection_logs 테이블 생성
    await client.query(`
      CREATE TABLE IF NOT EXISTS collection_logs (
        id SERIAL PRIMARY KEY,
        collection_type VARCHAR(50) NOT NULL,
        collected_count INTEGER DEFAULT 0,
        failed_count INTEGER DEFAULT 0,
        duration_ms INTEGER DEFAULT 0,
        sources_data JSONB,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ collection_logs table created');

    // 2. exhibition_tags 테이블 생성 (있지 않다면)
    await client.query(`
      CREATE TABLE IF NOT EXISTS exhibition_tags (
        id SERIAL PRIMARY KEY,
        exhibition_id INTEGER REFERENCES exhibitions(id) ON DELETE CASCADE,
        tag VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(exhibition_id, tag)
      )
    `);
    console.log('✅ exhibition_tags table created');

    // 3. exhibition_artists 테이블 생성 (있지 않다면)
    await client.query(`
      CREATE TABLE IF NOT EXISTS exhibition_artists (
        id SERIAL PRIMARY KEY,
        exhibition_id INTEGER REFERENCES exhibitions(id) ON DELETE CASCADE,
        artist_id INTEGER REFERENCES artists(id) ON DELETE CASCADE,
        role VARCHAR(50) DEFAULT 'participant',
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(exhibition_id, artist_id)
      )
    `);
    console.log('✅ exhibition_artists table created');

    // 4. 필요한 인덱스 생성
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_collection_logs_type_date 
      ON collection_logs(collection_type, created_at DESC)
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_exhibition_tags_tag 
      ON exhibition_tags(tag)
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_exhibition_artists_exhibition 
      ON exhibition_artists(exhibition_id)
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_exhibitions_status_dates 
      ON exhibitions(status, start_date, end_date)
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_exhibitions_venue_city 
      ON exhibitions(venue_city)
    `);
    
    console.log('✅ Indexes created');

    // 5. exhibitions 테이블에 필요한 컬럼 추가 (있지 않다면)
    try {
      await client.query(`
        ALTER TABLE exhibitions 
        ADD COLUMN IF NOT EXISTS poster_image VARCHAR(500),
        ADD COLUMN IF NOT EXISTS contact_info VARCHAR(100),
        ADD COLUMN IF NOT EXISTS source VARCHAR(100) DEFAULT 'manual',
        ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0
      `);
      console.log('✅ exhibitions table columns updated');
    } catch (error) {
      console.log('ℹ️  exhibitions table columns already exist or update failed:', error.message);
    }

    // 6. 기본 통계 조회
    const stats = await client.query(`
      SELECT 
        COUNT(*) as total_exhibitions,
        COUNT(CASE WHEN status = 'ongoing' THEN 1 END) as ongoing,
        COUNT(CASE WHEN status = 'upcoming' THEN 1 END) as upcoming,
        COUNT(CASE WHEN status = 'ended' THEN 1 END) as ended
      FROM exhibitions
    `);

    console.log('\n📊 Current exhibition statistics:');
    console.log(`   Total exhibitions: ${stats.rows[0].total_exhibitions}`);
    console.log(`   Ongoing: ${stats.rows[0].ongoing}`);
    console.log(`   Upcoming: ${stats.rows[0].upcoming}`);
    console.log(`   Ended: ${stats.rows[0].ended}`);

    // 7. 수집 로그 통계
    const logStats = await client.query(`
      SELECT 
        COUNT(*) as total_collections,
        SUM(collected_count) as total_collected,
        SUM(failed_count) as total_failed,
        MAX(created_at) as last_collection
      FROM collection_logs
    `);

    if (logStats.rows[0].total_collections > 0) {
      console.log('\n📋 Collection log statistics:');
      console.log(`   Total collection runs: ${logStats.rows[0].total_collections}`);
      console.log(`   Total collected: ${logStats.rows[0].total_collected}`);
      console.log(`   Total failed: ${logStats.rows[0].total_failed}`);
      console.log(`   Last collection: ${logStats.rows[0].last_collection}`);
    } else {
      console.log('\n📋 No collection logs found (first time setup)');
    }

    console.log('\n🎉 Exhibition collection tables setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error setting up collection tables:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  try {
    await setupCollectionTables();
  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main();
}

module.exports = { setupCollectionTables };