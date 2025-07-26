#!/usr/bin/env node
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkManualVenues() {
  console.log('🏛️ 문화포털 수동 수집 전시의 고유 venue 목록\n');
  console.log('=' .repeat(60));
  
  const client = await pool.connect();
  
  try {
    // culture_portal_manual 소스에서 고유한 venue 목록 조회
    const result = await client.query(`
      SELECT DISTINCT 
        venue_name,
        venue_city,
        COUNT(*) as exhibition_count
      FROM exhibitions
      WHERE source IN ('culture_portal_manual', 'culture_portal_manual_batch2')
      GROUP BY venue_name, venue_city
      ORDER BY venue_name
    `);
    
    console.log(`📊 총 ${result.rows.length}개의 고유한 venue\n`);
    
    result.rows.forEach((venue, index) => {
      console.log(`${index + 1}. ${venue.venue_name} (${venue.venue_city}) - ${venue.exhibition_count}개 전시`);
    });
    
    console.log('\n' + '=' .repeat(60));
    
    // venues 테이블에 이미 있는지 확인
    console.log('\n🔍 venues 테이블에 이미 등록된 venue 확인...\n');
    
    let registeredCount = 0;
    let notRegisteredVenues = [];
    
    for (const venue of result.rows) {
      const existing = await client.query(
        'SELECT id, website FROM venues WHERE name = $1 AND city = $2',
        [venue.venue_name, venue.venue_city]
      );
      
      if (existing.rows.length > 0) {
        console.log(`✅ 등록됨: ${venue.venue_name} ${existing.rows[0].website ? '(웹사이트 있음)' : '(웹사이트 없음)'}`);
        registeredCount++;
      } else {
        console.log(`❌ 미등록: ${venue.venue_name}`);
        notRegisteredVenues.push(venue);
      }
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log('📊 요약:');
    console.log(`   ✅ venues 테이블에 등록된 venue: ${registeredCount}개`);
    console.log(`   ❌ venues 테이블에 없는 venue: ${notRegisteredVenues.length}개`);
    console.log('=' .repeat(60));
    
    return {
      allVenues: result.rows,
      notRegistered: notRegisteredVenues
    };
    
  } catch (error) {
    console.error('❌ 오류:', error.message);
  } finally {
    client.release();
  }
}

// 실행
async function main() {
  const result = await checkManualVenues();
  await pool.end();
  return result;
}

if (require.main === module) {
  main();
}

module.exports = { checkManualVenues };