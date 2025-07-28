const { Pool } = require('pg');
const EnhancedArtistPortal = require('./enhance-artist-portal');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function simulateAdminApproval() {
  const portal = new EnhancedArtistPortal();

  try {
    console.log('👨‍💼 관리자 승인 프로세스 시뮬레이션\n');

    // 1. 대기 중인 작가 프로필 확인
    const pendingResult = await pool.query(`
      SELECT id, artist_name, contact_email, bio, specialties, created_at
      FROM artist_profiles
      WHERE status = 'pending'
      ORDER BY created_at DESC
    `);

    console.log(`📋 승인 대기 중인 작가: ${pendingResult.rows.length}명\n`);

    if (pendingResult.rows.length === 0) {
      console.log('대기 중인 작가가 없습니다.');
      return;
    }

    for (const artist of pendingResult.rows) {
      console.log(`👨‍🎨 ${artist.artist_name}`);
      console.log(`   이메일: ${artist.contact_email}`);
      console.log(`   전문분야: ${artist.specialties?.join(', ') || '미설정'}`);
      console.log(`   제출일: ${artist.created_at}`);
      console.log(`   소개: ${artist.bio || '소개 없음'}`);
      console.log('');
    }

    // 2. 첫 번째 작가 승인 처리
    const firstArtist = pendingResult.rows[0];
    console.log(`✅ "${firstArtist.artist_name}" 승인 처리 중...\n`);

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // 작가 프로필 승인
      await client.query(`
        UPDATE artist_profiles 
        SET status = 'approved', updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [firstArtist.id]);

      await client.query('COMMIT');

      console.log(`✅ 작가 프로필 승인 완료\n`);

      // 3. 마스터 DB 동기화
      console.log('🔗 마스터 데이터베이스 동기화 중...\n');
      const artistId = await portal.syncNewArtistToMasterDB(firstArtist.id);

      // 4. 결과 확인
      const syncResult = await pool.query(`
        SELECT name, importance_score, apt_profile->'primary_types' as apt_types
        FROM artists
        WHERE id = $1
      `, [artistId]);

      if (syncResult.rows.length > 0) {
        const syncedArtist = syncResult.rows[0];
        console.log('\n🎯 동기화 결과:');
        console.log(`   작가명: ${syncedArtist.name}`);
        console.log(`   중요도: ${syncedArtist.importance_score}점`);
        console.log(`   APT 타입: ${syncedArtist.apt_types?.map(t => t.type).join(' → ')}`);
      }

      // 5. 전체 통계 업데이트
      console.log('\n📊 전체 시스템 현황:');

      const totalStats = await pool.query(`
        SELECT 
          (SELECT COUNT(*) FROM artist_profiles WHERE status = 'approved') as approved_profiles,
          (SELECT COUNT(*) FROM artist_profiles WHERE status = 'pending') as pending_profiles,
          (SELECT COUNT(*) FROM artists) as total_artists
      `);

      const stats = totalStats.rows[0];
      console.log(`   승인된 포털 작가: ${stats.approved_profiles}명`);
      console.log(`   대기 중인 포털 작가: ${stats.pending_profiles}명`);
      console.log(`   전체 작가: ${stats.total_artists}명`);

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('❌ 오류:', error.message);
  } finally {
    await pool.end();
  }
}

// 실행
if (require.main === module) {
  simulateAdminApproval();
}

module.exports = { simulateAdminApproval };
