/**
 * Artvee-Artists 매칭 결과 검증
 * Cloudinary URL과 Artists DB 연결 확인
 */

require('dotenv').config();
const { pool } = require('./src/config/database');

async function verifyMatching() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Artvee-Artists 매칭 결과 검증...\n');
    
    // 1. 매칭 통계 요약
    const matchingStats = await client.query(`
      SELECT 
        mapping_method,
        COUNT(*) as count,
        ROUND(AVG(confidence_score)::numeric, 2) as avg_confidence
      FROM artvee_artist_mappings
      GROUP BY mapping_method
      ORDER BY count DESC
    `);
    
    console.log('📊 매칭 방법별 통계:');
    matchingStats.rows.forEach(row => {
      console.log(`  - ${row.mapping_method}: ${row.count}명 (평균 신뢰도: ${row.avg_confidence})`);
    });
    console.log('');
    
    // 2. 연결된 작품 통계
    const linkedArtworks = await client.query(`
      SELECT 
        COUNT(DISTINCT aaa.artwork_id) as linked_artworks,
        COUNT(DISTINCT aaa.artist_id) as linked_artists,
        COUNT(*) as total_connections
      FROM artvee_artwork_artists aaa
    `);
    
    console.log('🔗 연결 통계:');
    console.log(`  - 연결된 작품: ${linkedArtworks.rows[0].linked_artworks}개`);
    console.log(`  - 연결된 작가: ${linkedArtworks.rows[0].linked_artists}명`);
    console.log(`  - 총 연결: ${linkedArtworks.rows[0].total_connections}개`);
    console.log('');
    
    // 3. 작가별 작품 수 Top 10
    const topArtists = await client.query(`
      SELECT 
        a.name,
        a.name_ko,
        COUNT(aaa.artwork_id) as artwork_count,
        aam.confidence_score,
        aam.mapping_method
      FROM artists a
      INNER JOIN artvee_artist_mappings aam ON a.id = aam.artist_id
      INNER JOIN artvee_artwork_artists aaa ON a.id = aaa.artist_id
      GROUP BY a.id, a.name, a.name_ko, aam.confidence_score, aam.mapping_method
      ORDER BY artwork_count DESC
      LIMIT 10
    `);
    
    console.log('🎨 작품 수 상위 10명 작가:');
    topArtists.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.name} (${row.artwork_count}개 작품)`);
      if (row.name_ko && row.name_ko !== row.name) {
        console.log(`     한글명: ${row.name_ko}`);
      }
      console.log(`     매칭: ${row.mapping_method} (신뢰도: ${row.confidence_score})`);
    });
    console.log('');
    
    // 4. 샘플 작품과 이미지 URL 확인
    const sampleArtworks = await client.query(`
      SELECT 
        aa.title,
        aa.url as artvee_url,
        aa.thumbnail_url,
        aa.full_image_url,
        a.name as artist_name,
        a.name_ko as artist_name_ko,
        aam.mapping_method,
        aam.confidence_score
      FROM artvee_artworks aa
      INNER JOIN artvee_artwork_artists aaa ON aa.id = aaa.artwork_id
      INNER JOIN artists a ON aaa.artist_id = a.id
      INNER JOIN artvee_artist_mappings aam ON a.id = aam.artist_id
      WHERE aa.url IS NOT NULL
      ORDER BY aam.confidence_score DESC
      LIMIT 5
    `);
    
    console.log('🖼️ 샘플 연결된 작품들:');
    sampleArtworks.rows.forEach((row, index) => {
      console.log(`\n[${index + 1}] ${row.title}`);
      console.log(`  작가: ${row.artist_name} ${row.artist_name_ko ? `(${row.artist_name_ko})` : ''}`);
      console.log(`  매칭: ${row.mapping_method} (신뢰도: ${row.confidence_score})`);
      console.log(`  Artvee URL: ${row.artvee_url}`);
      if (row.thumbnail_url) {
        console.log(`  썸네일: ${row.thumbnail_url}`);
      }
      if (row.full_image_url) {
        console.log(`  전체 이미지: ${row.full_image_url}`);
      }
    });
    console.log('');
    
    // 5. 매칭되지 않은 주요 작가들
    const unmatchedMajor = await client.query(`
      SELECT 
        aam.artvee_artist,
        COUNT(aa.id) as artwork_count
      FROM artvee_artist_mappings aam
      INNER JOIN artvee_artworks aa ON aa.artist = aam.artvee_artist
      WHERE aam.artist_id IS NULL
      GROUP BY aam.artvee_artist
      ORDER BY artwork_count DESC
      LIMIT 10
    `);
    
    console.log('❌ 매칭되지 않은 주요 작가들:');
    unmatchedMajor.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.artvee_artist} (${row.artwork_count}개 작품)`);
    });
    console.log('');
    
    // 6. Cloudinary 통합을 위한 URL 패턴 분석
    const urlPatterns = await client.query(`
      SELECT 
        CASE 
          WHEN url LIKE 'https://artvee.com/%' THEN 'Direct Artvee'
          WHEN url LIKE 'https://upload.wikimedia.org/%' THEN 'Wikimedia'
          ELSE 'Other'
        END as url_type,
        COUNT(*) as count,
        array_agg(url ORDER BY url) as examples
      FROM artvee_artworks
      WHERE url IS NOT NULL
      GROUP BY url_type
      ORDER BY count DESC
    `);
    
    console.log('🌐 이미지 URL 패턴:');
    urlPatterns.rows.forEach(row => {
      console.log(`  - ${row.url_type}: ${row.count}개`);
      if (row.examples && row.examples.length > 0) {
        console.log(`    예시: ${row.examples[0]}`);
      }
    });
    console.log('');
    
    // 7. API 쿼리 예시 제안
    console.log('💡 SAYU API 활용 예시:');
    console.log('  // 특정 작가의 Artvee 작품 가져오기');
    console.log('  GET /api/artists/{artistId}/artvee-artworks');
    console.log('');
    console.log('  // 성격 유형별 추천 작품 (Artvee 이미지 포함)');
    console.log('  GET /api/recommendations/personality/{type}?include=artvee');
    console.log('');
    console.log('  // 랜덤 아트워크 with Cloudinary URL');
    console.log('  GET /api/artworks/random?source=artvee&format=cloudinary');
    
  } catch (error) {
    console.error('❌ 검증 중 오류 발생:', error);
  } finally {
    client.release();
  }
}

// 실행
verifyMatching().then(() => {
  console.log('\n✅ 검증 완료!');
  process.exit(0);
}).catch(error => {
  console.error('❌ 실행 실패:', error);
  process.exit(1);
});