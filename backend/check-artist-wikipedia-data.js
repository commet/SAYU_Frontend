import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import dotenv from 'dotenv';
import pkg from 'pg';
const { Pool } = pkg;

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkArtistWikipediaData() {
  try {
    console.log('🔍 Artists 테이블의 Wikipedia 정보 확인\n');

    // 1. artists 테이블 구조 확인
    console.log('1️⃣ Artists 테이블 구조:');
    const schemaQuery = `
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'artists'
      AND (column_name LIKE '%bio%' OR column_name LIKE '%wikipedia%')
      ORDER BY ordinal_position;
    `;
    const schemaResult = await pool.query(schemaQuery);
    console.table(schemaResult.rows);
    console.log();

    // 2. 유명 아티스트들의 실제 데이터 확인
    console.log('2️⃣ 유명 아티스트 데이터 샘플:');
    const sampleQuery = `
      SELECT 
        id,
        name,
        name_ko,
        nationality,
        birth_year,
        death_year,
        CASE 
          WHEN bio IS NOT NULL THEN SUBSTRING(bio, 1, 100) || '...'
          ELSE NULL
        END as bio_sample,
        CASE 
          WHEN bio_ko IS NOT NULL THEN SUBSTRING(bio_ko, 1, 100) || '...'
          ELSE NULL
        END as bio_ko_sample,
        LENGTH(bio) as en_length,
        LENGTH(bio_ko) as ko_length,
        sources::text as sources
      FROM artists
      WHERE name IN ('Vincent van Gogh', 'Pablo Picasso', 'Claude Monet', 'Leonardo da Vinci')
         OR name_ko IN ('김환기', '이중섭', '박수근', '천경자')
      ORDER BY name;
    `;
    const sampleResult = await pool.query(sampleQuery);
    
    if (sampleResult.rows.length > 0) {
      sampleResult.rows.forEach(artist => {
        console.log(`\n🎨 ${artist.name || artist.name_ko} (ID: ${artist.id})`);
        console.log(`   국적: ${artist.nationality || 'N/A'}`);
        console.log(`   생몰년: ${artist.birth_year || '?'} - ${artist.death_year || '현재'}`);
        console.log(`   Sources: ${artist.sources || 'N/A'}`);
        console.log(`   영어 bio: ${artist.en_length ? `${artist.en_length}자` : '없음'}`);
        if (artist.bio_sample) {
          console.log(`   -> ${artist.bio_sample}`);
        }
        console.log(`   한글 bio: ${artist.ko_length ? `${artist.ko_length}자` : '없음'}`);
        if (artist.bio_ko_sample) {
          console.log(`   -> ${artist.bio_ko_sample}`);
        }
      });
    } else {
      console.log('샘플 아티스트를 찾을 수 없습니다.');
    }
    console.log();

    // 3. 전체 데이터 완성도 통계
    console.log('3️⃣ 전체 데이터 완성도 통계:');
    const statsQuery = `
      SELECT 
        COUNT(*) as total_artists,
        COUNT(bio) as has_en_bio,
        COUNT(bio_ko) as has_ko_bio,
        COUNT(CASE WHEN bio IS NOT NULL AND bio_ko IS NOT NULL THEN 1 END) as has_both,
        COUNT(CASE WHEN bio IS NULL AND bio_ko IS NULL THEN 1 END) as has_none,
        COUNT(CASE WHEN sources::text ILIKE '%wiki%' THEN 1 END) as has_wikipedia_source,
        ROUND(COUNT(bio)::numeric / COUNT(*)::numeric * 100, 2) as en_bio_rate,
        ROUND(COUNT(bio_ko)::numeric / COUNT(*)::numeric * 100, 2) as ko_bio_rate,
        ROUND(COUNT(CASE WHEN bio IS NOT NULL AND bio_ko IS NOT NULL THEN 1 END)::numeric / COUNT(*)::numeric * 100, 2) as both_bio_rate
      FROM artists;
    `;
    const statsResult = await pool.query(statsQuery);
    const stats = statsResult.rows[0];
    
    console.table({
      '전체 아티스트 수': stats.total_artists,
      '영어 bio 보유': `${stats.has_en_bio} (${stats.en_bio_rate}%)`,
      '한글 bio 보유': `${stats.has_ko_bio} (${stats.ko_bio_rate}%)`,
      '둘 다 보유': `${stats.has_both} (${stats.both_bio_rate}%)`,
      'bio 없음': stats.has_none,
      'Wikipedia 소스 포함': stats.has_wikipedia_source
    });
    console.log();

    // 4. Biography 내용 길이 분포
    console.log('4️⃣ Biography 길이 분포:');
    const lengthQuery = `
      SELECT 
        'English' as language,
        MIN(LENGTH(bio)) as min_length,
        AVG(LENGTH(bio))::int as avg_length,
        MAX(LENGTH(bio)) as max_length
      FROM artists
      WHERE bio IS NOT NULL
      UNION ALL
      SELECT 
        'Korean' as language,
        MIN(LENGTH(bio_ko)) as min_length,
        AVG(LENGTH(bio_ko))::int as avg_length,
        MAX(LENGTH(bio_ko)) as max_length
      FROM artists
      WHERE bio_ko IS NOT NULL;
    `;
    const lengthResult = await pool.query(lengthQuery);
    console.table(lengthResult.rows);
    console.log();

    // 5. 실제 Wikipedia 내용인지 확인 (특정 패턴 검색)
    console.log('5️⃣ Wikipedia 내용 패턴 확인:');
    const patternQuery = `
      SELECT 
        COUNT(CASE WHEN bio LIKE '%born%' OR bio LIKE '%was a%' THEN 1 END) as en_wiki_pattern,
        COUNT(CASE WHEN bio_ko LIKE '%출생%' OR bio_ko LIKE '%화가%' OR bio_ko LIKE '%작가%' THEN 1 END) as ko_wiki_pattern,
        COUNT(CASE WHEN bio LIKE '%Wikipedia%' OR bio_ko LIKE '%위키%' OR sources::text ILIKE '%wiki%' THEN 1 END) as has_wiki_mention
      FROM artists
      WHERE bio IS NOT NULL OR bio_ko IS NOT NULL;
    `;
    const patternResult = await pool.query(patternQuery);
    console.table(patternResult.rows[0]);
    console.log();

    // 6. 최근 업데이트된 아티스트 확인
    console.log('6️⃣ 최근 업데이트된 아티스트 (bio 있는 경우):');
    const recentQuery = `
      SELECT 
        id,
        name,
        name_ko,
        created_at,
        updated_at,
        CASE 
          WHEN bio IS NOT NULL THEN '✓'
          ELSE '✗'
        END as has_en,
        CASE 
          WHEN bio_ko IS NOT NULL THEN '✓'
          ELSE '✗'
        END as has_ko
      FROM artists
      WHERE bio IS NOT NULL OR bio_ko IS NOT NULL
      ORDER BY updated_at DESC NULLS LAST
      LIMIT 10;
    `;
    const recentResult = await pool.query(recentQuery);
    console.table(recentResult.rows);

    // 7. 국적별 bio 보유율
    console.log('\n7️⃣ 국적별 bio 보유율:');
    const nationalityQuery = `
      SELECT 
        nationality,
        COUNT(*) as total,
        COUNT(bio) as has_en,
        COUNT(bio_ko) as has_ko,
        ROUND(COUNT(bio)::numeric / COUNT(*)::numeric * 100, 1) as en_rate,
        ROUND(COUNT(bio_ko)::numeric / COUNT(*)::numeric * 100, 1) as ko_rate
      FROM artists
      WHERE nationality IS NOT NULL
      GROUP BY nationality
      HAVING COUNT(*) > 5
      ORDER BY total DESC
      LIMIT 15;
    `;
    const nationalityResult = await pool.query(nationalityQuery);
    console.table(nationalityResult.rows);

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await pool.end();
  }
}

// 스크립트 실행
checkArtistWikipediaData();