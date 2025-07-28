#!/usr/bin/env node
require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function urgentCleanupFakeData() {
  const client = await pool.connect();

  try {
    console.log('🚨 긴급: 가짜 데이터 완전 삭제 작업 시작');
    console.log('❌ 삭제 대상 소스: massive_verified, additional_verified, emergency_verified, manual_curated');
    console.log('✅ 유지 대상: design_plus_verified (실제 검증된 5개)');

    // 삭제 전 현황 확인
    const beforeStats = await client.query(`
      SELECT source, COUNT(*) as count 
      FROM exhibitions 
      GROUP BY source 
      ORDER BY count DESC
    `);

    console.log('\n📊 삭제 전 현황:');
    beforeStats.rows.forEach(row => {
      const status = row.source === 'design_plus_verified' ? '✅ 유지' : '❌ 삭제 예정';
      console.log(`   ${row.source}: ${row.count}개 ${status}`);
    });

    // 가짜 데이터 소스들
    const fakeSources = [
      'massive_verified',
      'additional_verified',
      'emergency_verified',
      'manual_curated'
    ];

    await client.query('BEGIN');

    // 가짜 데이터 삭제
    const deleteResult = await client.query(`
      DELETE FROM exhibitions 
      WHERE source = ANY($1)
    `, [fakeSources]);

    await client.query('COMMIT');

    // 삭제 후 현황 확인
    const afterStats = await client.query(`
      SELECT source, COUNT(*) as count 
      FROM exhibitions 
      GROUP BY source 
      ORDER BY count DESC
    `);

    console.log(`\n✅ 가짜 데이터 ${deleteResult.rowCount}개 삭제 완료`);
    console.log('\n📊 삭제 후 현황:');
    if (afterStats.rows.length > 0) {
      afterStats.rows.forEach(row => {
        console.log(`   ${row.source}: ${row.count}개 ✅`);
      });
    } else {
      console.log('   (데이터 없음)');
    }

    console.log('\n🎯 결과:');
    console.log('   • 가짜 데이터 완전 삭제 완료');
    console.log('   • 검증된 실제 데이터만 유지');
    console.log('   • DB 청정성 복구 완료');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ 삭제 중 오류:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  urgentCleanupFakeData();
}
