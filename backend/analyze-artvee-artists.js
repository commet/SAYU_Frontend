/**
 * Artvee 작품과 Artists DB 매칭 분석
 * 현재 데이터 상태를 파악하고 매칭 전략을 수립
 */

require('dotenv').config();
const { pool } = require('./src/config/database');

async function analyzeArtveeArtists() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Artvee 작품-작가 데이터 분석 시작...\n');
    
    // 1. Artvee 작품 통계
    const artveeStats = await client.query(`
      SELECT 
        COUNT(*) as total_artworks,
        COUNT(DISTINCT artist) as unique_artists,
        COUNT(CASE WHEN artist IS NULL OR artist = '' THEN 1 END) as no_artist,
        COUNT(CASE WHEN full_image_url IS NOT NULL THEN 1 END) as has_full_image
      FROM artvee_artworks
    `);
    
    console.log('📊 Artvee 작품 통계:');
    console.log(`  - 총 작품 수: ${artveeStats.rows[0].total_artworks}`);
    console.log(`  - 고유 작가 수: ${artveeStats.rows[0].unique_artists}`);
    console.log(`  - 작가 정보 없음: ${artveeStats.rows[0].no_artist}`);
    console.log(`  - 전체 이미지 URL 보유: ${artveeStats.rows[0].has_full_image}`);
    console.log('');
    
    // 2. Artists 테이블 통계
    const artistsStats = await client.query(`
      SELECT 
        COUNT(*) as total_artists,
        COUNT(DISTINCT name) as unique_names,
        COUNT(CASE WHEN name_ko IS NOT NULL THEN 1 END) as has_korean_name
      FROM artists
    `);
    
    console.log('👨‍🎨 Artists DB 통계:');
    console.log(`  - 총 작가 수: ${artistsStats.rows[0].total_artists}`);
    console.log(`  - 고유 이름 수: ${artistsStats.rows[0].unique_names}`);
    console.log(`  - 한글명 보유: ${artistsStats.rows[0].has_korean_name}`);
    console.log('');
    
    // 3. Artvee의 상위 20명 작가 리스트
    const topArtveeArtists = await client.query(`
      SELECT 
        artist,
        COUNT(*) as artwork_count
      FROM artvee_artworks
      WHERE artist IS NOT NULL AND artist != ''
      GROUP BY artist
      ORDER BY artwork_count DESC
      LIMIT 20
    `);
    
    console.log('🎨 Artvee 상위 20명 작가:');
    topArtveeArtists.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.artist} (${row.artwork_count}개 작품)`);
    });
    console.log('');
    
    // 4. 샘플 매칭 테스트 (정확히 일치하는 경우)
    const exactMatches = await client.query(`
      SELECT 
        av.artist as artvee_artist,
        a.id as artist_id,
        a.name as artist_name,
        a.name_ko,
        COUNT(av.id) as artwork_count
      FROM artvee_artworks av
      INNER JOIN artists a ON LOWER(TRIM(av.artist)) = LOWER(TRIM(a.name))
      WHERE av.artist IS NOT NULL
      GROUP BY av.artist, a.id, a.name, a.name_ko
      ORDER BY artwork_count DESC
      LIMIT 10
    `);
    
    console.log('✅ 정확히 일치하는 작가 (상위 10명):');
    if (exactMatches.rows.length > 0) {
      exactMatches.rows.forEach((row, index) => {
        console.log(`  ${index + 1}. ${row.artvee_artist} = ${row.artist_name} (${row.artwork_count}개 작품)`);
        if (row.name_ko) {
          console.log(`     한글명: ${row.name_ko}`);
        }
      });
    } else {
      console.log('  일치하는 작가가 없습니다.');
    }
    console.log('');
    
    // 5. 작가명 패턴 분석
    const namePatterns = await client.query(`
      SELECT 
        CASE 
          WHEN artist LIKE '%, %' THEN 'Last, First'
          WHEN artist LIKE '% %' THEN 'First Last'
          WHEN artist = UPPER(artist) THEN 'ALL CAPS'
          ELSE 'Other'
        END as pattern,
        COUNT(*) as count,
        array_agg(DISTINCT artist ORDER BY artist) FILTER (WHERE artist IS NOT NULL) as examples
      FROM artvee_artworks
      WHERE artist IS NOT NULL AND artist != ''
      GROUP BY pattern
      ORDER BY count DESC
    `);
    
    console.log('📝 작가명 형식 패턴:');
    namePatterns.rows.forEach(row => {
      console.log(`  - ${row.pattern}: ${row.count}개`);
      if (row.examples && row.examples.length > 0) {
        console.log(`    예시: ${row.examples.slice(0, 3).join(', ')}`);
      }
    });
    console.log('');
    
    // 6. 매칭되지 않는 주요 작가들
    const unmatchedArtists = await client.query(`
      SELECT 
        av.artist,
        COUNT(*) as artwork_count
      FROM artvee_artworks av
      LEFT JOIN artists a ON LOWER(TRIM(av.artist)) = LOWER(TRIM(a.name))
      WHERE av.artist IS NOT NULL 
        AND av.artist != ''
        AND a.id IS NULL
      GROUP BY av.artist
      ORDER BY artwork_count DESC
      LIMIT 20
    `);
    
    console.log('❌ 매칭되지 않는 주요 작가 (상위 20명):');
    unmatchedArtists.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.artist} (${row.artwork_count}개 작품)`);
    });
    console.log('');
    
    // 7. 추천 매칭 전략
    console.log('💡 매칭 전략 제안:');
    console.log('  1. 정확한 매칭: LOWER(TRIM()) 사용');
    console.log('  2. 부분 매칭: 성(Last name)만으로 매칭');
    console.log('  3. 유사도 매칭: Levenshtein distance 활용');
    console.log('  4. 별칭 처리: artists.name_aliases 활용');
    console.log('  5. 수동 매핑: 주요 작가는 수동으로 매핑 테이블 생성');
    
  } catch (error) {
    console.error('❌ 분석 중 오류 발생:', error);
  } finally {
    client.release();
  }
}

// 실행
analyzeArtveeArtists().then(() => {
  console.log('\n✅ 분석 완료!');
  process.exit(0);
}).catch(error => {
  console.error('❌ 실행 실패:', error);
  process.exit(1);
});