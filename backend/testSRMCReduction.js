// SRMC 재분류 테스트

require('dotenv').config();

const ProperGeminiClassifier = require('./src/services/properGeminiClassifier');
const { pool } = require('./src/config/database');

async function testSRMCReduction() {
  console.log('🔄 SRMC 재분류 테스트');
  console.log('=====================================\n');

  const classifier = new ProperGeminiClassifier();

  try {
    // SRMC로 분류된 작가 중 정보가 있는 작가들 선택
    const srmcArtists = await pool.query(`
      SELECT * 
      FROM artists 
      WHERE apt_profile->'primary_types'->0->>'type' = 'SRMC'
        AND (bio IS NOT NULL OR nationality IS NOT NULL OR era IS NOT NULL)
      ORDER BY 
        CASE 
          WHEN bio IS NOT NULL THEN LENGTH(bio)
          ELSE 0
        END DESC
      LIMIT 10
    `);

    console.log(`테스트 대상: ${srmcArtists.rows.length}명의 SRMC 작가\n`);

    const results = {
      kept_srmc: 0,
      changed: 0,
      unknown: 0,
      new_types: {}
    };

    for (const artist of srmcArtists.rows) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`작가: ${artist.name}`);
      console.log(`정보: ${artist.nationality || '?'} | ${artist.era || '?'} | Bio: ${artist.bio?.length || 0}자`);

      try {
        const result = await classifier.classifyArtist(artist);

        console.log(`\n결과: ${result.aptType} (신뢰도: ${result.confidence}%)`);

        if (result.aptType === 'SRMC') {
          results.kept_srmc++;
          console.log(`✅ SRMC 유지 - 근거: ${result.analysis.reasoning?.substring(0, 100)}...`);
        } else if (result.aptType === 'UNKNOWN') {
          results.unknown++;
          console.log(`❓ 분류 불가`);
        } else {
          results.changed++;
          results.new_types[result.aptType] = (results.new_types[result.aptType] || 0) + 1;
          console.log(`🔄 변경됨: SRMC → ${result.aptType}`);
          console.log(`   근거: ${result.analysis.reasoning?.substring(0, 150)}...`);
        }

      } catch (error) {
        console.error(`❌ 오류: ${error.message}`);
      }

      // API 제한
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // 결과 요약
    console.log(`\n\n${'='.repeat(60)}`);
    console.log('📊 테스트 결과 요약');
    console.log('='.repeat(60));
    console.log(`SRMC 유지: ${results.kept_srmc}명`);
    console.log(`다른 유형으로 변경: ${results.changed}명`);
    console.log(`분류 불가: ${results.unknown}명`);

    if (results.changed > 0) {
      console.log('\n새로운 유형 분포:');
      Object.entries(results.new_types)
        .sort(([,a], [,b]) => b - a)
        .forEach(([type, count]) => {
          console.log(`   ${type}: ${count}명`);
        });
    }

  } catch (error) {
    console.error('테스트 오류:', error);
  } finally {
    await pool.end();
  }
}

// 실행
testSRMCReduction().catch(console.error);
