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

async function checkArtistsTableStructure() {
  try {
    console.log('🔍 Artists 테이블 전체 구조 확인\n');

    // 1. artists 테이블의 모든 컬럼 확인
    console.log('1️⃣ Artists 테이블의 모든 컬럼:');
    const schemaQuery = `
      SELECT 
        column_name,
        data_type,
        character_maximum_length,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'artists'
      ORDER BY ordinal_position;
    `;
    const schemaResult = await pool.query(schemaQuery);
    console.table(schemaResult.rows);
    console.log();

    // 2. 샘플 데이터 확인 (모든 컬럼)
    console.log('2️⃣ 샘플 아티스트 데이터 (상위 5개):');
    const sampleQuery = `
      SELECT *
      FROM artists
      LIMIT 5;
    `;
    const sampleResult = await pool.query(sampleQuery);
    
    if (sampleResult.rows.length > 0) {
      sampleResult.rows.forEach((artist, index) => {
        console.log(`\n--- Artist ${index + 1} ---`);
        Object.entries(artist).forEach(([key, value]) => {
          if (value !== null && value !== '') {
            console.log(`${key}: ${typeof value === 'string' && value.length > 100 ? value.substring(0, 100) + '...' : value}`);
          }
        });
      });
    }
    console.log();

    // 3. Wikipedia 관련 컬럼이 있는지 확인
    console.log('3️⃣ Wikipedia 또는 Biography 관련 컬럼 검색:');
    const wikiQuery = `
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'artists'
      AND (
        column_name ILIKE '%wiki%' 
        OR column_name ILIKE '%bio%' 
        OR column_name ILIKE '%description%'
        OR column_name ILIKE '%about%'
      );
    `;
    const wikiResult = await pool.query(wikiQuery);
    if (wikiResult.rows.length > 0) {
      console.table(wikiResult.rows);
    } else {
      console.log('Wikipedia 또는 Biography 관련 컬럼이 없습니다.');
    }

    // 4. 유명 아티스트 검색
    console.log('\n4️⃣ 유명 아티스트 존재 확인:');
    const famousQuery = `
      SELECT id, name, name_ko, nationality, birth_year, death_year
      FROM artists
      WHERE name ILIKE '%van gogh%' 
         OR name ILIKE '%picasso%'
         OR name ILIKE '%monet%'
         OR name_ko ILIKE '%김환기%'
         OR name_ko ILIKE '%이중섭%'
      LIMIT 10;
    `;
    const famousResult = await pool.query(famousQuery);
    if (famousResult.rows.length > 0) {
      console.table(famousResult.rows);
    } else {
      console.log('검색된 유명 아티스트가 없습니다.');
    }

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await pool.end();
  }
}

// 스크립트 실행
checkArtistsTableStructure();