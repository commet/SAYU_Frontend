const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkArtistsDatabase() {
  try {
    console.log('🔍 Artists 테이블 구조 확인 중...\n');
    
    // 1. artists 테이블 구조 확인
    const tableStructure = await pool.query(`
      SELECT 
        column_name,
        data_type,
        character_maximum_length,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'artists'
      ORDER BY ordinal_position;
    `);
    
    console.log('📊 Artists 테이블 구조:');
    console.log('========================');
    tableStructure.rows.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type}${col.character_maximum_length ? `(${col.character_maximum_length})` : ''} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    // 2. 실제 저장된 데이터 샘플 (10개)
    console.log('\n\n📝 저장된 아티스트 샘플 데이터:');
    console.log('================================');
    
    const sampleData = await pool.query(`
      SELECT * FROM artists 
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    
    sampleData.rows.forEach((artist, index) => {
      console.log(`\n[${index + 1}] ${artist.name_ko || artist.name || 'Unknown'}`);
      console.log(`   ID: ${artist.id}`);
      console.log(`   이름: ${artist.name_ko} / ${artist.name}`);
      console.log(`   국적: ${artist.nationality || 'N/A'} / ${artist.nationality_ko || ''}`);
      console.log(`   생몰년: ${artist.birth_year || '?'} - ${artist.death_year || '현재'}`);
      console.log(`   저작권: ${artist.copyright_status || 'N/A'}`);
      console.log(`   시대: ${artist.era || 'N/A'}`);
      console.log(`   검증 여부: ${artist.is_verified ? '✅ 검증됨' : '❌ 미검증'}`);
      console.log(`   팔로워: ${artist.follow_count || 0}명`);
      console.log(`   수집일: ${artist.created_at ? new Date(artist.created_at).toLocaleDateString('ko-KR') : 'N/A'}`);
      
      // JSONB 필드 확인
      if (artist.images) {
        console.log(`   이미지: ${Object.keys(artist.images).length}개`);
      }
      if (artist.sources) {
        console.log(`   출처: ${JSON.stringify(artist.sources)}`);
      }
      if (artist.recent_exhibitions) {
        console.log(`   최근 전시: ${Array.isArray(artist.recent_exhibitions) ? artist.recent_exhibitions.length : 0}개`);
      }
    });
    
    // 3. 데이터 완성도 통계
    console.log('\n\n📈 데이터 완성도 분석:');
    console.log('=======================');
    
    const completenessStats = await pool.query(`
      SELECT 
        COUNT(*) as total_artists,
        COUNT(name) as has_name,
        COUNT(name_ko) as has_korean_name,
        COUNT(nationality) as has_nationality,
        COUNT(nationality_ko) as has_korean_nationality,
        COUNT(birth_year) as has_birth_year,
        COUNT(death_year) as has_death_year,
        COUNT(copyright_status) as has_copyright_status,
        COUNT(bio) as has_bio,
        COUNT(bio_ko) as has_korean_bio,
        COUNT(era) as has_era,
        COUNT(images) as has_images,
        COUNT(sources) as has_sources,
        COUNT(official_links) as has_official_links,
        COUNT(recent_exhibitions) as has_recent_exhibitions,
        COUNT(CASE WHEN is_verified = true THEN 1 END) as verified_count,
        COUNT(CASE WHEN is_featured = true THEN 1 END) as featured_count
      FROM artists
    `);
    
    const stats = completenessStats.rows[0];
    const total = parseInt(stats.total_artists);
    
    console.log(`총 아티스트 수: ${total}명\n`);
    
    const fields = [
      { name: '이름 (영문)', count: stats.has_name },
      { name: '한국어 이름', count: stats.has_korean_name },
      { name: '국적', count: stats.has_nationality },
      { name: '한국어 국적', count: stats.has_korean_nationality },
      { name: '출생년도', count: stats.has_birth_year },
      { name: '사망년도', count: stats.has_death_year },
      { name: '저작권 상태', count: stats.has_copyright_status },
      { name: '약력', count: stats.has_bio },
      { name: '한국어 약력', count: stats.has_korean_bio },
      { name: '시대', count: stats.has_era },
      { name: '이미지', count: stats.has_images },
      { name: '출처', count: stats.has_sources },
      { name: '공식 링크', count: stats.has_official_links },
      { name: '최근 전시', count: stats.has_recent_exhibitions },
      { name: '검증됨', count: stats.verified_count },
      { name: '주목 작가', count: stats.featured_count }
    ];
    
    fields.forEach(field => {
      const percentage = total > 0 ? ((field.count / total) * 100).toFixed(1) : 0;
      const bar = '█'.repeat(Math.floor(percentage / 5));
      console.log(`${field.name.padEnd(20)} ${field.count.toString().padStart(5)}/${total} (${percentage}%) ${bar}`);
    });
    
    // 4. 관련 테이블 확인
    console.log('\n\n🔗 관련 테이블 확인:');
    console.log('===================');
    
    // artists_collection_logs 테이블 존재 확인
    const collectionLogsExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'artists_collection_logs'
      );
    `);
    
    if (collectionLogsExists.rows[0].exists) {
      const logsCount = await pool.query(`
        SELECT 
          COUNT(*) as total_logs,
          COUNT(DISTINCT artist_id) as unique_artists,
          MIN(collected_at) as first_collection,
          MAX(collected_at) as last_collection
        FROM artists_collection_logs
      `);
      
      const logs = logsCount.rows[0];
      console.log('✅ artists_collection_logs 테이블 존재');
      console.log(`   - 총 로그 수: ${logs.total_logs}`);
      console.log(`   - 고유 아티스트: ${logs.unique_artists}`);
      console.log(`   - 첫 수집: ${logs.first_collection ? new Date(logs.first_collection).toLocaleDateString('ko-KR') : 'N/A'}`);
      console.log(`   - 최근 수집: ${logs.last_collection ? new Date(logs.last_collection).toLocaleDateString('ko-KR') : 'N/A'}`);
    } else {
      console.log('❌ artists_collection_logs 테이블 없음');
    }
    
    // artist_artworks 테이블 확인
    const artworksExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'artist_artworks'
      );
    `);
    
    if (artworksExists.rows[0].exists) {
      const artworksCount = await pool.query(`
        SELECT 
          COUNT(*) as total_artworks,
          COUNT(DISTINCT artist_id) as artists_with_works
        FROM artist_artworks
      `);
      
      const artworks = artworksCount.rows[0];
      console.log('\n✅ artist_artworks 테이블 존재');
      console.log(`   - 총 작품 수: ${artworks.total_artworks}`);
      console.log(`   - 작품 보유 아티스트: ${artworks.artists_with_works}`);
    } else {
      console.log('\n❌ artist_artworks 테이블 없음');
    }
    
    // 5. 저작권 상태 분포
    console.log('\n\n©️ 저작권 상태 분포:');
    console.log('==================');
    
    const copyrightDistribution = await pool.query(`
      SELECT 
        copyright_status,
        COUNT(*) as count
      FROM artists
      GROUP BY copyright_status
      ORDER BY count DESC
    `);
    
    copyrightDistribution.rows.forEach(row => {
      console.log(`${row.copyright_status}: ${row.count}명`);
    });
    
    // 6. 최근 추가된 아티스트
    console.log('\n\n🆕 최근 24시간 내 추가된 아티스트:');
    console.log('================================');
    
    const recentArtists = await pool.query(`
      SELECT name_ko, name, created_at
      FROM artists
      WHERE created_at >= NOW() - INTERVAL '24 hours'
      ORDER BY created_at DESC
      LIMIT 10
    `);
    
    if (recentArtists.rows.length > 0) {
      recentArtists.rows.forEach(artist => {
        const time = new Date(artist.created_at).toLocaleString('ko-KR');
        console.log(`- ${artist.name_ko || artist.name}: ${time}`);
      });
    } else {
      console.log('최근 24시간 내 추가된 아티스트가 없습니다.');
    }
    
    // 7. 국적별 분포 (상위 10개)
    console.log('\n\n🌍 국적별 분포 (상위 10개):');
    console.log('==========================');
    
    const nationalityDist = await pool.query(`
      SELECT nationality, COUNT(*) as count
      FROM artists
      WHERE nationality IS NOT NULL
      GROUP BY nationality
      ORDER BY count DESC
      LIMIT 10
    `);
    
    nationalityDist.rows.forEach(row => {
      console.log(`${row.nationality}: ${row.count}명`);
    });
    
    // 8. 시대별 분포
    console.log('\n\n🕰️ 시대별 분포:');
    console.log('================');
    
    const eraDist = await pool.query(`
      SELECT era, COUNT(*) as count
      FROM artists
      WHERE era IS NOT NULL
      GROUP BY era
      ORDER BY count DESC
    `);
    
    eraDist.rows.forEach(row => {
      console.log(`${row.era}: ${row.count}명`);
    });
    
  } catch (error) {
    console.error('❌ 데이터베이스 확인 중 오류:', error);
  } finally {
    await pool.end();
  }
}

checkArtistsDatabase();