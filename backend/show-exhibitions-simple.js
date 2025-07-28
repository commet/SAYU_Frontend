#!/usr/bin/env node
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function showExhibitionsSimple() {
  const client = await pool.connect();

  try {
    console.log('🎨 SAYU 전시 데이터베이스 목록\n');
    console.log('='.repeat(80));

    // 전체 전시 조회
    const result = await client.query(`
      SELECT 
        title_en,
        venue_name,
        venue_city,
        start_date,
        end_date,
        CASE 
          WHEN end_date < CURRENT_DATE THEN '종료'
          WHEN start_date > CURRENT_DATE THEN '예정'
          ELSE '진행중'
        END as status
      FROM exhibitions
      ORDER BY 
        CASE 
          WHEN end_date < CURRENT_DATE THEN 3
          WHEN start_date > CURRENT_DATE THEN 2
          ELSE 1
        END,
        start_date DESC
    `);

    console.log(`총 ${result.rows.length}개의 전시\n`);

    // 상태별로 분류
    const ongoing = result.rows.filter(ex => ex.status === '진행중');
    const upcoming = result.rows.filter(ex => ex.status === '예정');
    const ended = result.rows.filter(ex => ex.status === '종료');

    // 진행 중인 전시
    console.log(`\n🟢 현재 진행 중인 전시 (${ongoing.length}개)`);
    console.log('-'.repeat(80));
    ongoing.forEach((ex, idx) => {
      const start = formatDate(ex.start_date);
      const end = formatDate(ex.end_date);
      console.log(`${(idx + 1).toString().padStart(2, '0')}. ${ex.title_en}`);
      console.log(`    ${ex.venue_name} (${ex.venue_city}) | ${start} ~ ${end}`);
    });

    // 예정된 전시
    console.log(`\n\n🔵 예정된 전시 (${upcoming.length}개)`);
    console.log('-'.repeat(80));
    upcoming.forEach((ex, idx) => {
      const start = formatDate(ex.start_date);
      const end = formatDate(ex.end_date);
      console.log(`${(idx + 1).toString().padStart(2, '0')}. ${ex.title_en}`);
      console.log(`    ${ex.venue_name} (${ex.venue_city}) | ${start} ~ ${end}`);
    });

    // 종료된 전시
    console.log(`\n\n⚫ 종료된 전시 (${ended.length}개)`);
    console.log('-'.repeat(80));
    ended.forEach((ex, idx) => {
      const start = formatDate(ex.start_date);
      const end = formatDate(ex.end_date);
      console.log(`${(idx + 1).toString().padStart(2, '0')}. ${ex.title_en}`);
      console.log(`    ${ex.venue_name} (${ex.venue_city}) | ${start} ~ ${end}`);
    });

    // 통계
    console.log('\n\n📊 요약 통계');
    console.log('-'.repeat(80));
    console.log(`진행 중: ${ongoing.length}개 | 예정: ${upcoming.length}개 | 종료: ${ended.length}개`);

    // 도시별 통계
    const cityStats = await client.query(`
      SELECT venue_city, COUNT(*) as count
      FROM exhibitions
      GROUP BY venue_city
      ORDER BY count DESC
      LIMIT 5
    `);

    console.log('\n도시별 TOP 5:');
    cityStats.rows.forEach(row => {
      console.log(`  ${row.venue_city}: ${row.count}개`);
    });

  } catch (error) {
    console.error('오류:', error.message);
  } finally {
    client.release();
  }

  process.exit(0);
}

function formatDate(date) {
  if (!date) return '미정';
  const d = new Date(date);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

showExhibitionsSimple();
