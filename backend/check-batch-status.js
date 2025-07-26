const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkBatchStatus() {
  try {
    console.log('📊 첫 번째 배치 분석 후 상태 확인\n');
    
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_artists,
        COUNT(apt_profile) as with_apt_profile,
        COUNT(CASE WHEN is_verified = true THEN 1 END) as verified,
        COUNT(CASE WHEN bio IS NOT NULL AND LENGTH(bio) > 200 THEN 1 END) as with_detailed_bio
      FROM artists
    `);
    
    const recent = await pool.query(`
      SELECT name, LENGTH(bio) as bio_length, is_verified, updated_at
      FROM artists 
      WHERE updated_at > NOW() - INTERVAL '2 hours'
      ORDER BY updated_at DESC 
      LIMIT 15
    `);
    
    const aptTypes = await pool.query(`
      SELECT 
        apt_profile->>'primaryType' as apt_type,
        COUNT(*) as count
      FROM artists 
      WHERE apt_profile IS NOT NULL
      GROUP BY apt_profile->>'primaryType'
      ORDER BY count DESC
    `);
    
    const summary = stats.rows[0];
    console.log('🎯 Database Status:');
    console.log(`  총 아티스트: ${summary.total_artists}명`);
    console.log(`  APT 프로필 보유: ${summary.with_apt_profile}명`);
    console.log(`  검증 완료: ${summary.verified}명`);
    console.log(`  상세 전기 보유: ${summary.with_detailed_bio}명`);
    
    console.log('\n🕐 최근 업데이트 (2시간 내):');
    if (recent.rows.length > 0) {
      recent.rows.forEach(artist => {
        console.log(`  ${artist.name}: bio ${artist.bio_length || 0}자, 검증: ${artist.is_verified}`);
      });
    } else {
      console.log('  최근 업데이트 없음');
    }
    
    if (aptTypes.rows.length > 0) {
      console.log('\n🐾 APT 유형 분포:');
      aptTypes.rows.forEach(type => {
        console.log(`  ${type.apt_type}: ${type.count}명`);
      });
    }
    
    // 다음 배치 선정
    const nextBatch = await pool.query(`
      SELECT name, nationality, birth_year, follow_count
      FROM artists 
      WHERE apt_profile IS NULL 
        AND is_verified = false
        AND name IS NOT NULL
        AND LENGTH(name) < 60
      ORDER BY 
        CASE WHEN follow_count > 0 THEN follow_count ELSE 0 END DESC,
        created_at DESC
      LIMIT 10
    `);
    
    console.log('\n🎯 다음 배치 후보 (10명):');
    nextBatch.rows.forEach((artist, idx) => {
      console.log(`  [${idx + 1}] ${artist.name} (${artist.nationality || '불명'}, ${artist.birth_year || '?'}, 팔로워: ${artist.follow_count || 0})`);
    });
    
    console.log(`\n📈 진행률: ${summary.with_apt_profile}/${summary.total_artists} (${((summary.with_apt_profile / summary.total_artists) * 100).toFixed(2)}%)`);
    
  } catch (error) {
    console.error('❌ 오류:', error.message);
  } finally {
    await pool.end();
  }
}

checkBatchStatus();