#!/usr/bin/env node
require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkExhibitionsData() {
  const client = await pool.connect();
  
  try {
    // 1. 테이블 스키마 확인
    console.log('📋 exhibitions 테이블 스키마:');
    console.log('=====================================');
    
    const schemaResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'exhibitions'
      ORDER BY ordinal_position
    `);
    
    schemaResult.rows.forEach(col => {
      console.log(`${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
    });
    
    // 2. 네이버 블로그 데이터 품질 분석
    console.log('\n\n📊 네이버 블로그 데이터 품질 분석:');
    console.log('=====================================');
    
    const qualityCheck = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN title_local LIKE '%전시%' THEN 1 END) as has_exhibition_word,
        COUNT(CASE WHEN title_local LIKE '%#%' THEN 1 END) as has_hashtag,
        COUNT(CASE WHEN title_local LIKE '%블로그%' THEN 1 END) as has_blog_word,
        COUNT(CASE WHEN length(title_local) < 10 THEN 1 END) as short_title,
        COUNT(CASE WHEN artists IS NOT NULL AND array_length(artists, 1) > 0 THEN 1 END) as has_artists,
        COUNT(CASE WHEN start_date = end_date THEN 1 END) as same_date,
        COUNT(CASE WHEN start_date = CURRENT_DATE THEN 1 END) as starts_today
      FROM exhibitions 
      WHERE source = 'naver_blog'
    `);
    
    const stats = qualityCheck.rows[0];
    console.log(`총 데이터: ${stats.total}개`);
    console.log(`'전시' 단어 포함: ${stats.has_exhibition_word}개 (${Math.round(stats.has_exhibition_word/stats.total*100)}%)`);
    console.log(`해시태그 포함: ${stats.has_hashtag}개 (${Math.round(stats.has_hashtag/stats.total*100)}%)`);
    console.log(`'블로그' 단어 포함: ${stats.has_blog_word}개 (${Math.round(stats.has_blog_word/stats.total*100)}%)`);
    console.log(`제목 길이 10자 미만: ${stats.short_title}개`);
    console.log(`작가 정보 있음: ${stats.has_artists}개 (${Math.round(stats.has_artists/stats.total*100)}%)`);
    console.log(`시작일=종료일: ${stats.same_date}개`);
    console.log(`오늘 시작: ${stats.starts_today}개`);
    
    // 3. 문제가 있는 데이터 샘플
    console.log('\n\n❌ 문제가 있는 데이터 샘플:');
    console.log('=====================================');
    
    const badSamples = await client.query(`
      SELECT title_local, venue_name, start_date, end_date, description
      FROM exhibitions 
      WHERE source = 'naver_blog'
      AND (
        title_local LIKE '%#%' OR 
        title_local LIKE '%블로그%' OR
        length(title_local) < 10 OR
        title_local NOT LIKE '%전시%'
      )
      LIMIT 10
    `);
    
    badSamples.rows.forEach((row, i) => {
      console.log(`\n[${i+1}] "${row.title_local}"`);
      console.log(`   장소: ${row.venue_name}`);
      console.log(`   기간: ${row.start_date} ~ ${row.end_date}`);
      if (row.description) {
        console.log(`   설명: ${row.description.substring(0, 50)}...`);
      }
    });
    
    // 4. 정상적으로 보이는 데이터 샘플
    console.log('\n\n✅ 정상적으로 보이는 데이터 샘플:');
    console.log('=====================================');
    
    const goodSamples = await client.query(`
      SELECT title_local, venue_name, start_date, end_date, description
      FROM exhibitions 
      WHERE source = 'naver_blog'
      AND title_local LIKE '%전시%'
      AND title_local NOT LIKE '%#%'
      AND title_local NOT LIKE '%블로그%'
      AND length(title_local) >= 10
      LIMIT 5
    `);
    
    goodSamples.rows.forEach((row, i) => {
      console.log(`\n[${i+1}] "${row.title_local}"`);
      console.log(`   장소: ${row.venue_name}`);
      console.log(`   기간: ${row.start_date} ~ ${row.end_date}`);
      if (row.description) {
        console.log(`   설명: ${row.description.substring(0, 50)}...`);
      }
    });
    
    // 5. 권장사항
    console.log('\n\n💡 권장사항:');
    console.log('=====================================');
    console.log('1. 네이버 블로그 소스 데이터는 품질이 매우 낮음 (블로그 포스트 제목을 전시명으로 오해)');
    console.log('2. 해시태그, "블로그" 단어가 포함된 데이터는 삭제 필요');
    console.log('3. 작가 정보가 전혀 없음 (0%)');
    console.log('4. 날짜가 대부분 오늘부터 3개월로 잘못 설정됨');
    console.log('5. 실제 전시 정보 API나 공식 소스로 교체 필요');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  checkExhibitionsData();
}