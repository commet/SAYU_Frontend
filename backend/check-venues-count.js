#!/usr/bin/env node
require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkVenues() {
  try {
    console.log('🔍 SAYU 미술관/갤러리 데이터베이스 확인\n');

    // 전체 통계
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN country = 'KR' THEN 1 END) as korean,
        COUNT(CASE WHEN country != 'KR' THEN 1 END) as international,
        COUNT(CASE WHEN type = 'museum' THEN 1 END) as museums,
        COUNT(CASE WHEN type = 'gallery' THEN 1 END) as galleries,
        COUNT(CASE WHEN tier = 1 THEN 1 END) as tier1,
        COUNT(CASE WHEN tier = 2 THEN 1 END) as tier2,
        COUNT(CASE WHEN tier = 3 THEN 1 END) as tier3,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active
      FROM venues
    `);

    const s = stats.rows[0];
    console.log('📊 전체 통계:');
    console.log(`   총 미술관/갤러리: ${s.total}개`);
    console.log(`   ├─ 국내: ${s.korean}개`);
    console.log(`   └─ 해외: ${s.international}개`);
    console.log(`\n   유형별:`);
    console.log(`   ├─ 미술관: ${s.museums}개`);
    console.log(`   └─ 갤러리: ${s.galleries}개`);
    console.log(`\n   티어별:`);
    console.log(`   ├─ Tier 1 (대형): ${s.tier1}개`);
    console.log(`   ├─ Tier 2 (중형): ${s.tier2}개`);
    console.log(`   └─ Tier 3 (소형): ${s.tier3}개`);
    console.log(`\n   활성 상태: ${s.active}개`);

    // 도시별 분포
    console.log('\n🏙️  국내 도시별 분포:');
    const cityStats = await pool.query(`
      SELECT city, COUNT(*) as count
      FROM venues
      WHERE country = 'KR'
      GROUP BY city
      ORDER BY count DESC
    `);

    cityStats.rows.forEach((city, index) => {
      const bar = '█'.repeat(Math.ceil(city.count / 2));
      console.log(`   ${(city.city || '기타').padEnd(10)} ${bar} ${city.count}개`);
    });

    // 주요 미술관 목록
    console.log('\n🏛️  Tier 1 미술관/갤러리:');
    const tier1Venues = await pool.query(`
      SELECT name, city, type, website
      FROM venues
      WHERE tier = 1 AND country = 'KR'
      ORDER BY city, name
      LIMIT 15
    `);

    tier1Venues.rows.forEach(venue => {
      const typeIcon = venue.type === 'museum' ? '🏛️' : '🖼️';
      console.log(`   ${typeIcon} ${venue.name} (${venue.city})`);
    });

    // 최근 추가된 미술관
    console.log('\n🆕 최근 추가된 미술관/갤러리:');
    const recentVenues = await pool.query(`
      SELECT name, city, created_at
      FROM venues
      ORDER BY created_at DESC
      LIMIT 5
    `);

    recentVenues.rows.forEach(venue => {
      const date = new Date(venue.created_at).toLocaleDateString('ko-KR');
      console.log(`   • ${venue.name} (${venue.city}) - ${date}`);
    });

    // 전시 데이터 연결 상태
    console.log('\n🎨 전시 데이터 현황:');
    const exhibitionStats = await pool.query(`
      SELECT 
        COUNT(DISTINCT venue_name) as venues_with_exhibitions,
        COUNT(*) as total_exhibitions
      FROM exhibitions
    `);

    const es = exhibitionStats.rows[0];
    console.log(`   전시 데이터가 있는 미술관: ${es.venues_with_exhibitions}개`);
    console.log(`   총 전시 데이터: ${es.total_exhibitions}개`);

    // 추천 사항
    const needsMoreData = s.total < 100;
    const needsActivation = s.active < s.total * 0.8;
    
    if (needsMoreData || needsActivation) {
      console.log('\n💡 추천 사항:');
      if (needsMoreData) {
        console.log('   • 더 많은 미술관/갤러리 데이터 추가가 필요합니다.');
        console.log('     npm run venues:seed 명령으로 확장된 venue 데이터를 추가하세요.');
      }
      if (needsActivation) {
        console.log('   • 비활성 미술관이 많습니다. 활성화를 검토해주세요.');
      }
    }

    console.log('\n✅ 데이터베이스 확인 완료!');

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  checkVenues();
}

module.exports = { checkVenues };