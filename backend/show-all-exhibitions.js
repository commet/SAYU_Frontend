#!/usr/bin/env node
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function showAllExhibitions() {
  const client = await pool.connect();

  try {
    console.log('🎨 SAYU 전시 데이터베이스 전체 목록\n');
    console.log('='.repeat(100));

    // 전체 전시 조회
    const result = await client.query(`
      SELECT 
        id,
        title_en,
        title_local,
        venue_name,
        venue_city,
        start_date,
        end_date,
        description,
        source,
        collected_at,
        CASE 
          WHEN end_date < CURRENT_DATE THEN '종료'
          WHEN start_date > CURRENT_DATE THEN '예정'
          ELSE '진행중'
        END as status
      FROM exhibitions
      ORDER BY start_date DESC, title_en
    `);

    console.log(`총 ${result.rows.length}개의 전시\n`);

    // 상태별 분류
    const ongoing = result.rows.filter(ex => ex.status === '진행중');
    const upcoming = result.rows.filter(ex => ex.status === '예정');
    const ended = result.rows.filter(ex => ex.status === '종료');

    // 진행 중인 전시
    console.log(`\n🟢 현재 진행 중인 전시 (${ongoing.length}개)`);
    console.log('='.repeat(100));
    ongoing.forEach((ex, idx) => {
      console.log(`\n${idx + 1}. ${ex.title_en}`);
      if (ex.title_local !== ex.title_en) {
        console.log(`   (${ex.title_local})`);
      }
      console.log(`   📍 장소: ${ex.venue_name} (${ex.venue_city})`);
      console.log(`   📅 기간: ${formatDate(ex.start_date)} ~ ${formatDate(ex.end_date)}`);
      if (ex.description) {
        console.log(`   📝 설명: ${ex.description.substring(0, 100)}${ex.description.length > 100 ? '...' : ''}`);
      }
      console.log(`   🏷️ 출처: ${ex.source}`);
    });

    // 예정된 전시
    if (upcoming.length > 0) {
      console.log(`\n\n🔵 예정된 전시 (${upcoming.length}개)`);
      console.log('='.repeat(100));
      upcoming.forEach((ex, idx) => {
        console.log(`\n${idx + 1}. ${ex.title_en}`);
        console.log(`   📍 장소: ${ex.venue_name} (${ex.venue_city})`);
        console.log(`   📅 기간: ${formatDate(ex.start_date)} ~ ${formatDate(ex.end_date)}`);
        if (ex.description) {
          console.log(`   📝 설명: ${ex.description.substring(0, 100)}${ex.description.length > 100 ? '...' : ''}`);
        }
        console.log(`   🏷️ 출처: ${ex.source}`);
      });
    }

    // 종료된 전시 (최근 10개만)
    if (ended.length > 0) {
      console.log('\n\n⚫ 최근 종료된 전시 (최근 10개)');
      console.log('='.repeat(100));
      ended.slice(0, 10).forEach((ex, idx) => {
        console.log(`\n${idx + 1}. ${ex.title_en}`);
        console.log(`   📍 장소: ${ex.venue_name} (${ex.venue_city})`);
        console.log(`   📅 기간: ${formatDate(ex.start_date)} ~ ${formatDate(ex.end_date)}`);
        console.log(`   🏷️ 출처: ${ex.source}`);
      });
    }

    // 통계 정보
    console.log('\n\n📊 통계 정보');
    console.log('='.repeat(100));

    // 도시별 통계
    const cityStats = await client.query(`
      SELECT venue_city, COUNT(*) as count
      FROM exhibitions
      GROUP BY venue_city
      ORDER BY count DESC
    `);

    console.log('\n도시별 전시 분포:');
    cityStats.rows.forEach(row => {
      const bar = '█'.repeat(Math.min(row.count, 40));
      console.log(`${row.venue_city.padEnd(10)} ${bar} ${row.count}개`);
    });

    // 월별 전시 시작
    const monthStats = await client.query(`
      SELECT 
        TO_CHAR(start_date, 'YYYY-MM') as month,
        COUNT(*) as count
      FROM exhibitions
      WHERE start_date >= '2025-01-01'
      GROUP BY TO_CHAR(start_date, 'YYYY-MM')
      ORDER BY month
    `);

    console.log('\n\n2025년 월별 전시 시작:');
    monthStats.rows.forEach(row => {
      const bar = '█'.repeat(Math.min(row.count * 2, 40));
      console.log(`${row.month} ${bar} ${row.count}개`);
    });

    // 주요 미술관별 전시
    const venueStats = await client.query(`
      SELECT venue_name, COUNT(*) as count
      FROM exhibitions
      GROUP BY venue_name
      HAVING COUNT(*) > 1
      ORDER BY count DESC
      LIMIT 10
    `);

    console.log('\n\n주요 전시 장소 (2개 이상 전시):');
    venueStats.rows.forEach(row => {
      console.log(`${row.venue_name}: ${row.count}개`);
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

showAllExhibitions();
