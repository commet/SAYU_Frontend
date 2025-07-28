// APT 프로필 테이블 설정

require('dotenv').config();
const { pool } = require('./src/config/database');

async function setupAptProfiles() {
  console.log('🔧 APT 프로필 테이블 설정 중...');

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. APT 프로필 테이블 생성
    await client.query(`
      CREATE TABLE IF NOT EXISTS apt_profiles (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
        primary_apt VARCHAR(4) NOT NULL CHECK (primary_apt ~ '^[A-Z]{4}$'),
        secondary_apt VARCHAR(4) CHECK (secondary_apt ~ '^[A-Z]{4}$'),
        tertiary_apt VARCHAR(4) CHECK (tertiary_apt ~ '^[A-Z]{4}$'),
        matching_reasoning TEXT,
        confidence_score DECIMAL(3,2) DEFAULT 0.5 CHECK (confidence_score >= 0 AND confidence_score <= 1),
        data_sources JSONB DEFAULT '{}',
        classification_method VARCHAR(50) DEFAULT 'manual',
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(artist_id)
      )
    `);
    console.log('✅ APT 프로필 테이블 생성 완료');

    // 2. 인덱스 생성
    await client.query('CREATE INDEX IF NOT EXISTS idx_apt_profiles_artist_id ON apt_profiles(artist_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_apt_profiles_primary_apt ON apt_profiles(primary_apt)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_apt_profiles_is_verified ON apt_profiles(is_verified)');
    console.log('✅ 인덱스 생성 완료');

    // 3. 시스템 통계 테이블
    await client.query(`
      CREATE TABLE IF NOT EXISTS system_stats (
        key VARCHAR(100) PRIMARY KEY,
        value TEXT,
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await client.query(`
      INSERT INTO system_stats (key, value) 
      VALUES ('total_apt_profiles', '0')
      ON CONFLICT (key) DO NOTHING
    `);
    console.log('✅ 시스템 통계 테이블 설정 완료');

    await client.query('COMMIT');
    console.log('✅ 모든 설정 완료!');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ 오류 발생:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

setupAptProfiles();
