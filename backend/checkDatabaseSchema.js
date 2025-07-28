// 데이터베이스 스키마 확인
require('dotenv').config();
const { pool } = require('./src/config/database');

async function checkSchema() {
  try {
    console.log('🔍 데이터베이스 스키마 확인 중...\n');

    // 1. artists 테이블 구조
    const artistColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'artists'
      ORDER BY ordinal_position
    `);

    console.log('📋 artists 테이블 컬럼:');
    artistColumns.rows.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type})`);
    });

    // 2. artworks 테이블 존재 여부
    const hasArtworks = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'artworks'
      )
    `);

    console.log(`\n📋 artworks 테이블 존재: ${hasArtworks.rows[0].exists}`);

    if (hasArtworks.rows[0].exists) {
      const artworkColumns = await pool.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'artworks'
        ORDER BY ordinal_position
        LIMIT 10
      `);

      console.log('📋 artworks 테이블 주요 컬럼:');
      artworkColumns.rows.forEach(col => {
        console.log(`   - ${col.column_name} (${col.data_type})`);
      });
    }

    // 3. follows 테이블 존재 여부
    const hasFollows = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'follows'
      )
    `);

    console.log(`\n📋 follows 테이블 존재: ${hasFollows.rows[0].exists}`);

    // 4. APT 관련 컬럼 확인
    const aptColumns = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'artists'
        AND column_name LIKE 'apt%'
    `);

    console.log('\n📋 APT 관련 컬럼:');
    if (aptColumns.rows.length > 0) {
      aptColumns.rows.forEach(col => {
        console.log(`   - ${col.column_name}`);
      });
    } else {
      console.log('   - APT 컬럼이 없습니다. 마이그레이션이 필요합니다.');
    }

    // 5. 작가 수 확인
    const artistCount = await pool.query('SELECT COUNT(*) FROM artists');
    console.log(`\n📊 총 작가 수: ${artistCount.rows[0].count}명`);

    // 6. 샘플 작가 확인
    const sampleArtists = await pool.query(`
      SELECT id, name, nationality, birth_year, death_year, bio IS NOT NULL as has_bio
      FROM artists
      LIMIT 5
    `);

    console.log('\n📋 샘플 작가:');
    sampleArtists.rows.forEach(artist => {
      console.log(`   - ${artist.name} (${artist.nationality || '?'}, ${artist.birth_year || '?'}-${artist.death_year || '?'}) Bio: ${artist.has_bio}`);
    });

  } catch (error) {
    console.error('❌ 오류:', error.message);
  } finally {
    await pool.end();
  }
}

checkSchema();
