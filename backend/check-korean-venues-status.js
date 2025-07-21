#!/usr/bin/env node
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkKoreanVenuesStatus() {
  try {
    console.log('🇰🇷 국내 미술관/갤러리 데이터 현황 분석\n');
    
    // 전체 통계
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(google_place_id) as with_place_id,
        COUNT(latitude) as with_coords,
        COUNT(address) as with_address,
        COUNT(phone) as with_phone,
        COUNT(rating) as with_rating,
        COUNT(opening_hours) as with_hours,
        AVG(rating)::numeric(3,2) as avg_rating,
        MIN(rating) as min_rating,
        MAX(rating) as max_rating
      FROM venues 
      WHERE country = 'KR'
    `);
    
    const s = stats.rows[0];
    console.log('📊 국내 기관 데이터 현황:');
    console.log(`   총 기관 수: ${s.total}개`);
    console.log(`   Google Place ID: ${s.with_place_id}개 (${Math.round(s.with_place_id/s.total*100)}%)`);
    console.log(`   좌표 정보: ${s.with_coords}개 (${Math.round(s.with_coords/s.total*100)}%)`);
    console.log(`   주소 정보: ${s.with_address}개 (${Math.round(s.with_address/s.total*100)}%)`);
    console.log(`   전화번호: ${s.with_phone}개 (${Math.round(s.with_phone/s.total*100)}%)`);
    console.log(`   평점 정보: ${s.with_rating}개 (${Math.round(s.with_rating/s.total*100)}%)`);
    console.log(`   운영시간: ${s.with_hours}개 (${Math.round(s.with_hours/s.total*100)}%)`);
    console.log(`   평균 평점: ${s.avg_rating || 'N/A'} (${s.min_rating || 'N/A'} ~ ${s.max_rating || 'N/A'})`);
    
    // 미수집 기관 확인
    const uncollected = await pool.query(`
      SELECT id, name, city, type, tier
      FROM venues
      WHERE country = 'KR' 
      AND (google_place_id IS NULL OR google_place_id = '')
      ORDER BY tier ASC, city, name
    `);
    
    console.log(`\n⏳ 미수집 기관: ${uncollected.rows.length}개`);
    
    if (uncollected.rows.length > 0) {
      console.log('\n📋 Google Places ID가 없는 기관 목록:');
      uncollected.rows.forEach((v, i) => {
        const typeIcon = v.type === 'museum' ? '🏛️' : '🖼️';
        console.log(`   ${i+1}. ${typeIcon} ${v.name} (${v.city}) - Tier ${v.tier}`);
      });
    }
    
    // 도시별 수집 현황
    console.log('\n🏙️ 도시별 수집 현황:');
    const cityStats = await pool.query(`
      SELECT 
        city,
        COUNT(*) as total,
        COUNT(google_place_id) as collected,
        ROUND(COUNT(google_place_id)::numeric/COUNT(*)::numeric * 100) as percentage
      FROM venues
      WHERE country = 'KR'
      GROUP BY city
      HAVING COUNT(*) > 3
      ORDER BY COUNT(*) DESC
    `);
    
    cityStats.rows.forEach(city => {
      const bar = '█'.repeat(Math.ceil(city.percentage / 10));
      const emptyBar = '░'.repeat(10 - Math.ceil(city.percentage / 10));
      console.log(`   ${city.city.padEnd(8)} ${bar}${emptyBar} ${city.collected}/${city.total} (${city.percentage}%)`);
    });
    
    // 추가 가능한 미술관 제안
    console.log('\n💡 추가 수집 가능한 주요 미술관/갤러리:');
    const suggestions = [
      '아라리오갤러리 (서울, 천안)',
      '사비나미술관 (서울)',
      '토탈미술관 (서울)',
      '대전시립미술관 창작센터',
      '광주 국립아시아문화전당 창제작센터',
      '제주도립미술관',
      '제주현대미술관',
      '박수근미술관 (양구)',
      '이응노미술관 (대전)',
      '백남준아트센터 (용인)',
      '소마미술관 (서울)',
      '환기미술관 (서울)',
      '고양아람누리 아람미술관',
      '성곡미술관 (서울)',
      '호암미술관 (용인)'
    ];
    
    console.log('   주요 미술관:');
    suggestions.slice(0, 8).forEach(s => console.log(`   • ${s}`));
    console.log('\n   지역 미술관:');
    suggestions.slice(8).forEach(s => console.log(`   • ${s}`));
    
    // 데이터 품질 개선 필요 기관
    const needsImprovement = await pool.query(`
      SELECT name, city,
        CASE 
          WHEN address IS NULL THEN '주소' 
          WHEN phone IS NULL THEN '전화' 
          WHEN opening_hours IS NULL THEN '운영시간'
          WHEN latitude IS NULL THEN '좌표'
        END as missing
      FROM venues
      WHERE country = 'KR'
      AND google_place_id IS NOT NULL
      AND (address IS NULL OR phone IS NULL OR opening_hours IS NULL OR latitude IS NULL)
      LIMIT 10
    `);
    
    if (needsImprovement.rows.length > 0) {
      console.log('\n⚠️ 데이터 보완 필요 기관:');
      needsImprovement.rows.forEach(v => {
        console.log(`   • ${v.name} (${v.city}) - ${v.missing} 정보 없음`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkKoreanVenuesStatus();