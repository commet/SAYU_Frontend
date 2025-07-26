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

async function checkWikipediaContent() {
  try {
    console.log('🔍 Wikipedia 콘텐츠 상세 분석\n');

    // 1. sources에 wikipedia가 포함된 아티스트들의 bio 내용 확인
    console.log('1️⃣ Wikipedia 소스가 표시된 아티스트의 bio 내용:');
    const wikiSourceQuery = `
      SELECT 
        name,
        name_ko,
        sources,
        SUBSTRING(bio, 1, 200) || '...' as bio_preview,
        LENGTH(bio) as bio_length
      FROM artists
      WHERE sources::text ILIKE '%wiki%'
      ORDER BY bio_length DESC
      LIMIT 10;
    `;
    const wikiSourceResult = await pool.query(wikiSourceQuery);
    
    wikiSourceResult.rows.forEach((artist, index) => {
      console.log(`\n${index + 1}. ${artist.name}`);
      console.log(`   Sources: ${artist.sources}`);
      console.log(`   Bio 길이: ${artist.bio_length}자`);
      console.log(`   Bio 내용:\n   ${artist.bio_preview}`);
    });

    // 2. 긴 bio를 가진 아티스트 (Wikipedia일 가능성 높음)
    console.log('\n\n2️⃣ 긴 bio를 가진 아티스트 (상위 10명):');
    const longBioQuery = `
      SELECT 
        name,
        nationality,
        sources,
        LENGTH(bio) as bio_length,
        SUBSTRING(bio, 1, 300) || '...' as bio_preview
      FROM artists
      WHERE bio IS NOT NULL
      ORDER BY bio_length DESC
      LIMIT 10;
    `;
    const longBioResult = await pool.query(longBioQuery);
    
    console.table(longBioResult.rows.map(row => ({
      name: row.name,
      nationality: row.nationality,
      bio_length: row.bio_length,
      has_wiki_source: row.sources?.toString().includes('wiki') ? 'Yes' : 'No'
    })));

    // 3. bio_ko 내용 분석
    console.log('\n3️⃣ 한글 bio 내용 패턴 분석:');
    const koBioQuery = `
      SELECT 
        bio_ko,
        COUNT(*) as count
      FROM artists
      WHERE bio_ko IS NOT NULL
      GROUP BY bio_ko
      ORDER BY count DESC
      LIMIT 5;
    `;
    const koBioResult = await pool.query(koBioQuery);
    
    console.log('가장 많이 반복되는 한글 bio:');
    koBioResult.rows.forEach((row, index) => {
      console.log(`${index + 1}. "${row.bio_ko}" (${row.count}건)`);
    });

    // 4. Wikipedia 패턴 상세 분석
    console.log('\n4️⃣ Wikipedia 특징적 패턴 분석:');
    const patternQuery = `
      SELECT 
        COUNT(CASE WHEN bio LIKE '%(born%' THEN 1 END) as has_birth_info,
        COUNT(CASE WHEN bio LIKE '%died%' OR bio LIKE '%death%' THEN 1 END) as has_death_info,
        COUNT(CASE WHEN bio LIKE '%[%]%' THEN 1 END) as has_brackets,
        COUNT(CASE WHEN bio LIKE '%citation needed%' THEN 1 END) as has_citation,
        COUNT(CASE WHEN bio ~ '[0-9]{4}' THEN 1 END) as has_year,
        COUNT(CASE WHEN bio LIKE '%is a%' OR bio LIKE '%was a%' THEN 1 END) as has_definition,
        COUNT(CASE WHEN LENGTH(bio) > 500 THEN 1 END) as long_bio,
        COUNT(CASE WHEN LENGTH(bio) > 1000 THEN 1 END) as very_long_bio
      FROM artists
      WHERE bio IS NOT NULL;
    `;
    const patternResult = await pool.query(patternQuery);
    
    console.table(patternResult.rows[0]);

    // 5. 실제 Wikipedia 내용인지 확인할 수 있는 샘플
    console.log('\n5️⃣ Wikipedia 스타일 bio 샘플 (3개):');
    const wikiStyleQuery = `
      SELECT 
        name,
        nationality,
        birth_year,
        death_year,
        bio
      FROM artists
      WHERE LENGTH(bio) > 1000
        AND bio LIKE '%born%'
        AND bio ~ '[0-9]{4}'
      ORDER BY LENGTH(bio) DESC
      LIMIT 3;
    `;
    const wikiStyleResult = await pool.query(wikiStyleQuery);
    
    wikiStyleResult.rows.forEach((artist, index) => {
      console.log(`\n--- ${index + 1}. ${artist.name} (${artist.nationality}, ${artist.birth_year}-${artist.death_year || 'present'}) ---`);
      console.log(artist.bio.substring(0, 500) + '...\n');
    });

    // 6. 짧은 bio vs 긴 bio 비율
    console.log('6️⃣ Bio 길이 분포:');
    const lengthDistQuery = `
      SELECT 
        CASE 
          WHEN LENGTH(bio) < 50 THEN 'Very Short (<50)'
          WHEN LENGTH(bio) < 100 THEN 'Short (50-100)'
          WHEN LENGTH(bio) < 500 THEN 'Medium (100-500)'
          WHEN LENGTH(bio) < 1000 THEN 'Long (500-1000)'
          ELSE 'Very Long (>1000)'
        END as length_category,
        COUNT(*) as count,
        ROUND(COUNT(*)::numeric / (SELECT COUNT(*) FROM artists WHERE bio IS NOT NULL)::numeric * 100, 2) as percentage
      FROM artists
      WHERE bio IS NOT NULL
      GROUP BY length_category
      ORDER BY 
        CASE length_category
          WHEN 'Very Short (<50)' THEN 1
          WHEN 'Short (50-100)' THEN 2
          WHEN 'Medium (100-500)' THEN 3
          WHEN 'Long (500-1000)' THEN 4
          WHEN 'Very Long (>1000)' THEN 5
        END;
    `;
    const lengthDistResult = await pool.query(lengthDistQuery);
    
    console.table(lengthDistResult.rows);

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await pool.end();
  }
}

// 스크립트 실행
checkWikipediaContent();