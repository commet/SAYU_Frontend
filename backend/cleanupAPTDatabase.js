const { Pool } = require('pg');
const { VALID_TYPE_CODES, getSAYUType } = require('@sayu/shared');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function cleanupAPTDatabase() {
  console.log('🧹 SAYU APT 데이터베이스 정리 시작!\n');

  try {
    // 1. 현재 상태 파악
    const currentStatsResult = await pool.query(`
      SELECT 
        apt_profile->'primary_types'->0->>'type' as apt_type,
        COUNT(*) as count
      FROM artists 
      WHERE apt_profile IS NOT NULL
      GROUP BY apt_profile->'primary_types'->0->>'type'
      ORDER BY count DESC
    `);

    console.log('📊 현재 APT 타입 분포:');
    const invalidTypes = [];
    const validTypeCounts = {};

    currentStatsResult.rows.forEach(row => {
      if (VALID_TYPE_CODES.includes(row.apt_type)) {
        console.log(`  ✅ ${row.apt_type}: ${row.count}명`);
        validTypeCounts[row.apt_type] = row.count;
      } else {
        console.log(`  ❌ ${row.apt_type}: ${row.count}명 (잘못된 타입)`);
        invalidTypes.push(row.apt_type);
      }
    });

    // 2. 잘못된 타입을 가진 아티스트들 처리
    console.log('\n🔧 잘못된 타입 정리:');

    for (const invalidType of invalidTypes) {
      const artistsResult = await pool.query(`
        SELECT id, name, apt_profile
        FROM artists 
        WHERE apt_profile->'primary_types'->0->>'type' = $1
      `, [invalidType]);

      console.log(`\n  처리 중: ${invalidType} (${artistsResult.rows.length}명)`);

      for (const artist of artistsResult.rows) {
        // null로 설정하여 재분석 대상으로 만들기
        await pool.query(
          'UPDATE artists SET apt_profile = NULL WHERE id = $1',
          [artist.id]
        );
        console.log(`    - ${artist.name}: APT 프로필 삭제됨`);
      }
    }

    // 3. 한글명이 누락된 프로필 수정
    console.log('\n📝 한글명 누락 프로필 수정:');

    for (const typeCode of VALID_TYPE_CODES) {
      const sayuType = getSAYUType(typeCode);

      const updateResult = await pool.query(`
        UPDATE artists 
        SET apt_profile = jsonb_set(
          jsonb_set(
            jsonb_set(
              apt_profile,
              '{primary_types,0,title_ko}',
              $2::jsonb
            ),
            '{primary_types,0,animal}',
            $3::jsonb
          ),
          '{primary_types,0,name_ko}',
          $4::jsonb
        )
        WHERE apt_profile->'primary_types'->0->>'type' = $1
        AND (
          apt_profile->'primary_types'->0->>'title_ko' IS NULL
          OR apt_profile->'primary_types'->0->>'name_ko' IS NULL
        )
      `, [typeCode, JSON.stringify(sayuType.name), JSON.stringify(sayuType.animalEn?.toLowerCase()), JSON.stringify(sayuType.animal)]);

      if (updateResult.rowCount > 0) {
        console.log(`  ✅ ${typeCode}: ${updateResult.rowCount}개 프로필 수정됨`);
      }
    }

    // 4. 최종 통계
    const finalStatsResult = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN apt_profile IS NOT NULL THEN 1 END) as with_apt
      FROM artists
    `);

    const finalTypeResult = await pool.query(`
      SELECT 
        apt_profile->'primary_types'->0->>'type' as apt_type,
        COUNT(*) as count
      FROM artists 
      WHERE apt_profile IS NOT NULL
      AND apt_profile->'primary_types'->0->>'type' IS NOT NULL
      GROUP BY apt_profile->'primary_types'->0->>'type'
      ORDER BY count DESC
    `);

    console.log('\n✨ 정리 완료!');
    console.log('\n📊 최종 현황:');
    console.log(`  전체 아티스트: ${finalStatsResult.rows[0].total}명`);
    console.log(`  APT 프로필 보유: ${finalStatsResult.rows[0].with_apt}명`);
    console.log('\n📈 올바른 APT 타입 분포 (16개):');

    finalTypeResult.rows.forEach(row => {
      const sayuType = getSAYUType(row.apt_type);
      console.log(`  ${row.apt_type} - ${sayuType.name} (${sayuType.animal}): ${row.count}명`);
    });

    // 5. APT 미설정 중요 아티스트 목록
    const missingAPTResult = await pool.query(`
      SELECT name, importance_score
      FROM artists 
      WHERE importance_score >= 90
      AND apt_profile IS NULL
      ORDER BY importance_score DESC
      LIMIT 20
    `);

    console.log(`\n⚠️ APT 재설정 필요 (중요도 90+): ${missingAPTResult.rows.length}명`);
    missingAPTResult.rows.forEach(row => {
      console.log(`  - ${row.name} (중요도: ${row.importance_score})`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

cleanupAPTDatabase();
