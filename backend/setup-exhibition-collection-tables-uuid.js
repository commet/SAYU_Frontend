#!/usr/bin/env node
require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function setupCollectionTables() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Setting up exhibition collection tables with UUID support...');
    
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

    // 2. exhibition_tags 테이블 생성 (UUID 지원)
    await client.query(`
      CREATE TABLE IF NOT EXISTS exhibition_tags (
        id SERIAL PRIMARY KEY,
        exhibition_id UUID REFERENCES exhibitions(id) ON DELETE CASCADE,
        tag VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(exhibition_id, tag)
      )
    `);
    console.log('✅ exhibition_tags table created');

    // 3. exhibition_artists 테이블 생성 (UUID 지원)
    await client.query(`
      CREATE TABLE IF NOT EXISTS exhibition_artists (
        id SERIAL PRIMARY KEY,
        exhibition_id UUID REFERENCES exhibitions(id) ON DELETE CASCADE,
        artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
        role VARCHAR(50) DEFAULT 'participant',
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(exhibition_id, artist_id)
      )
    `);
    console.log('✅ exhibition_artists table created');

    // 4. exhibition_submissions 테이블 생성
    await client.query(`
      CREATE TABLE IF NOT EXISTS exhibition_submissions (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        venue_name VARCHAR(255) NOT NULL,
        venue_city VARCHAR(100),
        venue_country VARCHAR(2) DEFAULT 'KR',
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        description TEXT,
        artists TEXT,
        admission_fee INTEGER DEFAULT 0,
        source_url VARCHAR(500),
        contact_info VARCHAR(200),
        poster_image VARCHAR(500),
        submitted_by UUID REFERENCES users(id),
        submission_status VARCHAR(50) DEFAULT 'pending',
        review_notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ exhibition_submissions table created');

    // 5. 기존 exhibitions 테이블에 필요한 컬럼 추가
    const columnsToAdd = [
      { name: 'venue_id', type: 'INTEGER REFERENCES venues(id)' },
      { name: 'venue_name', type: 'VARCHAR(255)' },
      { name: 'venue_city', type: 'VARCHAR(100)' },
      { name: 'venue_country', type: 'VARCHAR(2) DEFAULT \'KR\'' },
      { name: 'source', type: 'VARCHAR(100) DEFAULT \'manual\'' },
      { name: 'source_url', type: 'VARCHAR(500)' },
      { name: 'contact_info', type: 'VARCHAR(200)' },
      { name: 'collected_at', type: 'TIMESTAMP' },
      { name: 'submission_id', type: 'INTEGER REFERENCES exhibition_submissions(id)' }
    ];

    for (const column of columnsToAdd) {
      try {
        await client.query(`ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS ${column.name} ${column.type}`);
        console.log(`✅ Added column ${column.name} to exhibitions table`);
      } catch (error) {
        console.log(`ℹ️  Column ${column.name} already exists or cannot be added: ${error.message}`);
      }
    }

    // 6. 필요한 인덱스 생성
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_collection_logs_type_date ON collection_logs(collection_type, created_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_exhibition_tags_tag ON exhibition_tags(tag)',
      'CREATE INDEX IF NOT EXISTS idx_exhibition_artists_exhibition ON exhibition_artists(exhibition_id)',
      'CREATE INDEX IF NOT EXISTS idx_exhibitions_venue_id ON exhibitions(venue_id)',
      'CREATE INDEX IF NOT EXISTS idx_exhibitions_source ON exhibitions(source)',
      'CREATE INDEX IF NOT EXISTS idx_exhibitions_dates ON exhibitions(start_date, end_date)',
      'CREATE INDEX IF NOT EXISTS idx_venues_city ON venues(city)',
      'CREATE INDEX IF NOT EXISTS idx_venues_tier ON venues(tier)'
    ];

    for (const indexQuery of indexes) {
      await client.query(indexQuery);
    }
    console.log('✅ Indexes created');

    // 7. 통계 조회
    const stats = await client.query(`
      SELECT 
        COUNT(*) as total_exhibitions,
        COUNT(CASE WHEN status = 'current' THEN 1 END) as current,
        COUNT(CASE WHEN status = 'upcoming' THEN 1 END) as upcoming,
        COUNT(CASE WHEN status = 'past' THEN 1 END) as past
      FROM exhibitions
    `);

    console.log('\n📊 Current exhibition statistics:');
    console.log(`   Total exhibitions: ${stats.rows[0].total_exhibitions}`);
    console.log(`   Current: ${stats.rows[0].current}`);
    console.log(`   Upcoming: ${stats.rows[0].upcoming}`);
    console.log(`   Past: ${stats.rows[0].past}`);

    // 8. Venue 통계
    const venueStats = await client.query(`
      SELECT COUNT(*) as total_venues FROM venues
    `);

    console.log(`\n🏛️  Total venues: ${venueStats.rows[0].total_venues}`);

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