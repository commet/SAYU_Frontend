const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkRealAPTStatus() {
  try {
    console.log('📊 실제 APT 매핑 현황 확인\n');
    
    // 실제 APT 프로필 개수
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_artists,
        COUNT(apt_profile) as with_apt_profile
      FROM artists
    `);
    
    // 16가지 동물 유형별 분포 확인
    const animalDistribution = await pool.query(`
      SELECT 
        apt_profile->'primary_types'->0->>'type' as apt_type,
        COUNT(*) as count,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM artists WHERE apt_profile IS NOT NULL)), 1) as percentage
      FROM artists 
      WHERE apt_profile IS NOT NULL 
        AND apt_profile->'primary_types'->0->>'type' IS NOT NULL
      GROUP BY apt_profile->'primary_types'->0->>'type'
      ORDER BY count DESC
    `);
    
    // LAREMFC 4글자 코드별 분포
    const laremfcDistribution = await pool.query(`
      SELECT 
        apt_profile->'primary_types'->0->>'type' as apt_code,
        COUNT(*) as count
      FROM artists 
      WHERE apt_profile IS NOT NULL
      GROUP BY apt_profile->'primary_types'->0->>'type'
      ORDER BY count DESC
    `);
    
    // 유명 아티스트들의 매핑 상태
    const famousArtists = await pool.query(`
      SELECT name, apt_profile->'primary_types'->0->>'type' as apt_type, follow_count, name_ko
      FROM artists 
      WHERE apt_profile IS NOT NULL
        AND (follow_count > 10 OR 
             name ILIKE '%van gogh%' OR name ILIKE '%picasso%' OR name ILIKE '%monet%' OR
             name ILIKE '%raphael%' OR name ILIKE '%leonardo%' OR name ILIKE '%michelangelo%')
      ORDER BY follow_count DESC NULLS LAST
    `);
    
    // 최근 매핑된 아티스트들
    const recent = await pool.query(`
      SELECT name, apt_profile->'primary_types'->0->>'type' as apt_type, updated_at
      FROM artists 
      WHERE apt_profile IS NOT NULL
      ORDER BY updated_at DESC
      LIMIT 10
    `);
    
    const summary = stats.rows[0];
    console.log('🎯 전체 현황:');
    console.log(`  총 아티스트: ${summary.total_artists}명`);
    console.log(`  APT 프로필 보유: ${summary.with_apt_profile}명`);
    console.log(`  진행률: ${((summary.with_apt_profile / summary.total_artists) * 100).toFixed(2)}%`);
    
    console.log('\n🔤 LAREMFC 코드별 분포:');
    if (laremfcDistribution.rows.length > 0) {
      laremfcDistribution.rows.forEach(row => {
        console.log(`  ${row.apt_code}: ${row.count}명`);
      });
    } else {
      console.log('  분포 데이터 없음');
    }
    
    console.log('\n🐾 동물 유형 변환 필요 여부:');
    console.log('현재는 LAREMFC 4글자 코드로 저장됨 (예: LAEF, SRMC)');
    console.log('16가지 동물 유형으로 변환 로직 필요');
    
    console.log('\n⭐ 유명 아티스트 매핑 상태:');
    if (famousArtists.rows.length > 0) {
      famousArtists.rows.forEach(artist => {
        console.log(`  ${artist.name}: ${artist.apt_type} (팔로워: ${artist.follow_count || 0})`);
      });
    } else {
      console.log('  유명 아티스트 매핑 없음 - 우선순위 조정 필요');
    }
    
    console.log('\n🕐 최근 매핑된 아티스트:');
    recent.rows.forEach(artist => {
      console.log(`  ${artist.name}: ${artist.apt_type}`);
    });
    
  } catch (error) {
    console.error('❌ 오류:', error.message);
  } finally {
    await pool.end();
  }
}

checkRealAPTStatus();