// artworks 테이블과 artists 연결 확인
require('dotenv').config();
const { pool } = require('./src/config/database');

async function checkArtworkSchema() {
  try {
    // 1. artworks 테이블의 전체 컬럼 확인
    const artworkColumns = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'artworks'
      ORDER BY ordinal_position
    `);

    console.log('📋 artworks 테이블 전체 컬럼:');
    artworkColumns.rows.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type})`);
    });

    // 2. 관계 테이블 확인
    const relationTables = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_name LIKE '%artist%' 
         OR table_name LIKE '%artwork%'
      ORDER BY table_name
    `);

    console.log('\n📋 관련 테이블들:');
    relationTables.rows.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });

    // 3. artist_artworks 또는 유사한 연결 테이블 확인
    const hasArtistArtworks = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name IN ('artist_artworks', 'artwork_artists', 'artist_artwork')
      )
    `);

    if (hasArtistArtworks.rows[0].exists) {
      console.log('\n✅ 작가-작품 연결 테이블 발견');

      // 어떤 테이블인지 확인
      const linkTable = await pool.query(`
        SELECT table_name
        FROM information_schema.tables 
        WHERE table_name IN ('artist_artworks', 'artwork_artists', 'artist_artwork')
      `);

      const tableName = linkTable.rows[0].table_name;
      console.log(`   테이블명: ${tableName}`);

      // 컬럼 확인
      const linkColumns = await pool.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = $1
      `, [tableName]);

      console.log(`   컬럼:`);
      linkColumns.rows.forEach(col => {
        console.log(`   - ${col.column_name} (${col.data_type})`);
      });
    }

    // 4. APT 관련 확인
    console.log('\n📋 APT 프로필 데이터 샘플:');
    const aptSample = await pool.query(`
      SELECT name, apt_profile
      FROM artists
      WHERE apt_profile IS NOT NULL
      LIMIT 3
    `);

    if (aptSample.rows.length > 0) {
      aptSample.rows.forEach(artist => {
        console.log(`\n${artist.name}:`);
        console.log(JSON.stringify(artist.apt_profile, null, 2));
      });
    } else {
      console.log('   APT 프로필 데이터가 없습니다.');
    }

  } catch (error) {
    console.error('❌ 오류:', error.message);
  } finally {
    await pool.end();
  }
}

checkArtworkSchema();
