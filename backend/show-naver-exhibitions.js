#!/usr/bin/env node
require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function showAllNaverExhibitions() {
  const client = await pool.connect();

  try {
    const result = await client.query(`
      SELECT 
        title_local,
        venue_name,
        start_date,
        end_date,
        source_url,
        description
      FROM exhibitions 
      WHERE source = 'naver_blog'
      ORDER BY collected_at DESC
    `);

    console.log('🎭 네이버 API로 수집된 전체 58개 "전시" 목록');
    console.log('='.repeat(80));
    console.log();

    result.rows.forEach((ex, index) => {
      console.log(`${index + 1}. "${ex.title_local}" - ${ex.venue_name}`);
      console.log(`   📅 ${ex.start_date} ~ ${ex.end_date}`);
      if (ex.description && ex.description.trim()) {
        console.log(`   📝 ${ex.description.substring(0, 100)}...`);
      }
      if (ex.source_url) {
        console.log(`   🔗 ${ex.source_url.substring(0, 80)}...`);
      }
      console.log();
    });

    console.log(`\n총 ${result.rows.length}개 "전시" 발견`);
    console.log('\n🤔 분석 결과:');
    console.log('- 대부분이 블로그 글 제목이지 실제 전시명이 아님');
    console.log('- "블로그는 간만이라", "#문화누리카드", "화성 다크투어리즘" 등 전시와 무관');
    console.log('- 실제 전시명으로 보이는 것: "론 뮤익", "초이앤초이", "마르크 샤갈" 정도');
    console.log('- 날짜도 대부분 잘못 파싱됨 (오늘부터 3개월)');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  showAllNaverExhibitions();
}
