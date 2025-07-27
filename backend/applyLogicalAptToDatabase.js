// 논리적 APT 매칭 결과를 데이터베이스에 적용
// Wikipedia 데이터 기반 중요도 점수와 3중 APT 매칭 업데이트

require('dotenv').config();
const { pool } = require('./src/config/database');
const fs = require('fs').promises;

async function applyLogicalAptToDatabase() {
  console.log('🚀 논리적 APT 매칭 데이터베이스 적용 시작');
  console.log('='.repeat(70));

  try {
    // 1. 매칭 결과 파일 읽기
    const matchingData = JSON.parse(
      await fs.readFile('./logical_apt_matching_results.json', 'utf-8')
    );

    console.log(`\n📊 총 ${matchingData.totalArtists}명의 작가 데이터 적용\n`);

    // 2. 트랜잭션 시작
    const client = await pool.connect();
    await client.query('BEGIN');

    try {
      let updatedCount = 0;
      let createdCount = 0;

      for (const artist of matchingData.matchingResults) {
        console.log(`\n🎨 ${artist.name} 처리 중...`);
        
        // 작가 검색 (이름으로)
        const artistQuery = await client.query(
          `SELECT id, name, importance_score 
           FROM artists 
           WHERE LOWER(name) = LOWER($1) 
              OR LOWER(name) LIKE LOWER($2)
              OR LOWER(name) LIKE LOWER($3)`,
          [
            artist.name,
            `%${artist.name}%`,
            artist.name.replace(/'/g, '')  // O'Keeffe -> OKeeffe 처리
          ]
        );

        if (artistQuery.rows.length === 0) {
          console.log(`   ⚠️ 데이터베이스에서 찾을 수 없음: ${artist.name}`);
          continue;
        }

        const dbArtist = artistQuery.rows[0];
        console.log(`   ✅ 매칭된 작가: ${dbArtist.name} (ID: ${dbArtist.id})`);

        // 중요도 점수 계산 (Wikipedia 조회수 기반)
        let importanceScore = 30; // 기본 점수
        let importanceTier = 5;

        if (artist.dailyViews > 5000) {
          importanceScore = 90 + Math.min(10, Math.floor((artist.dailyViews - 5000) / 1000));
          importanceTier = 1;
        } else if (artist.dailyViews > 2000) {
          importanceScore = 70 + Math.min(19, Math.floor((artist.dailyViews - 2000) / 150));
          importanceTier = 2;
        } else if (artist.dailyViews > 1000) {
          importanceScore = 50 + Math.min(19, Math.floor((artist.dailyViews - 1000) / 50));
          importanceTier = 3;
        } else if (artist.dailyViews > 500) {
          importanceScore = 30 + Math.min(19, Math.floor((artist.dailyViews - 500) / 25));
          importanceTier = 4;
        } else {
          importanceScore = 30 + Math.min(10, Math.floor(artist.dailyViews / 50));
          importanceTier = 5;
        }

        // 작가 정보 업데이트
        await client.query(
          `UPDATE artists 
           SET importance_score = $1,
               importance_tier = $2,
               updated_by_system = true,
               external_data = jsonb_set(
                 COALESCE(external_data, '{}'::jsonb),
                 '{wikipedia}',
                 $3::jsonb
               ),
               updated_at = NOW()
           WHERE id = $4`,
          [
            importanceScore,
            importanceTier,
            JSON.stringify({
              pageViews: artist.dailyViews,
              languages: artist.languages,
              url: artist.url,
              lastUpdated: new Date().toISOString()
            }),
            dbArtist.id
          ]
        );

        console.log(`   📈 중요도 업데이트: ${importanceScore}점 (티어 ${importanceTier})`);

        // APT 프로필 확인 및 업데이트
        const profileQuery = await client.query(
          `SELECT * FROM apt_profiles WHERE artist_id = $1`,
          [dbArtist.id]
        );

        const aptData = {
          artist_id: dbArtist.id,
          primary_apt: artist.primary,
          secondary_apt: artist.secondary,
          tertiary_apt: artist.tertiary,
          matching_reasoning: artist.reasoning,
          confidence_score: artist.dailyViews > 1000 ? 0.9 : 0.7,
          data_sources: JSON.stringify({
            wikipedia: {
              views: artist.dailyViews,
              languages: artist.languages
            }
          }),
          classification_method: 'logical_data_based',
          is_verified: true
        };

        if (profileQuery.rows.length > 0) {
          // 기존 프로필 업데이트
          await client.query(
            `UPDATE apt_profiles 
             SET primary_apt = $1,
                 secondary_apt = $2,
                 tertiary_apt = $3,
                 matching_reasoning = $4,
                 confidence_score = $5,
                 data_sources = $6::jsonb,
                 classification_method = $7,
                 is_verified = $8,
                 updated_at = NOW()
             WHERE artist_id = $9`,
            [
              aptData.primary_apt,
              aptData.secondary_apt,
              aptData.tertiary_apt,
              aptData.matching_reasoning,
              aptData.confidence_score,
              aptData.data_sources,
              aptData.classification_method,
              aptData.is_verified,
              aptData.artist_id
            ]
          );
          updatedCount++;
          console.log(`   ✅ APT 프로필 업데이트 완료`);
        } else {
          // 새 프로필 생성
          await client.query(
            `INSERT INTO apt_profiles 
             (artist_id, primary_apt, secondary_apt, tertiary_apt, 
              matching_reasoning, confidence_score, data_sources, 
              classification_method, is_verified)
             VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9)`,
            [
              aptData.artist_id,
              aptData.primary_apt,
              aptData.secondary_apt,
              aptData.tertiary_apt,
              aptData.matching_reasoning,
              aptData.confidence_score,
              aptData.data_sources,
              aptData.classification_method,
              aptData.is_verified
            ]
          );
          createdCount++;
          console.log(`   ✅ APT 프로필 생성 완료`);
        }

        console.log(`   🎯 APT: ${artist.primaryName}(주) → ${artist.secondaryName}(부) → ${artist.tertiaryName}(제3)`);
      }

      // 3. 통계 업데이트
      await client.query(`
        UPDATE system_stats 
        SET value = value::integer + $1,
            updated_at = NOW()
        WHERE key = 'total_apt_profiles'`,
        [createdCount]
      );

      // 4. 커밋
      await client.query('COMMIT');

      console.log('\n' + '='.repeat(70));
      console.log('✅ 데이터베이스 적용 완료!');
      console.log(`   - 업데이트된 프로필: ${updatedCount}개`);
      console.log(`   - 새로 생성된 프로필: ${createdCount}개`);
      console.log(`   - 총 처리된 작가: ${updatedCount + createdCount}명`);

      // 5. 최종 검증
      const verifyQuery = await client.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN importance_tier = 1 THEN 1 END) as tier1,
          COUNT(CASE WHEN importance_tier = 2 THEN 1 END) as tier2,
          COUNT(CASE WHEN importance_tier = 3 THEN 1 END) as tier3,
          COUNT(CASE WHEN importance_tier = 4 THEN 1 END) as tier4,
          COUNT(CASE WHEN importance_tier = 5 THEN 1 END) as tier5
        FROM artists
        WHERE updated_by_system = true
      `);

      console.log('\n📊 중요도 티어 분포:');
      const stats = verifyQuery.rows[0];
      console.log(`   티어 1 (거장): ${stats.tier1}명`);
      console.log(`   티어 2 (매우 중요): ${stats.tier2}명`);
      console.log(`   티어 3 (중요): ${stats.tier3}명`);
      console.log(`   티어 4 (일반): ${stats.tier4}명`);
      console.log(`   티어 5 (기타): ${stats.tier5}명`);

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    // 6. 캐시 초기화 알림
    console.log('\n🔄 캐시 초기화가 필요합니다.');
    console.log('   다음 API 호출 시 새로운 데이터가 반영됩니다.');

  } catch (error) {
    console.error('\n❌ 오류 발생:', error);
    console.error(error.stack);
  } finally {
    await pool.end();
  }
}

// 실행
applyLogicalAptToDatabase().catch(console.error);