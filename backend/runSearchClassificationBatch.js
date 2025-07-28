// Search Classification Runner - Batch Mode
// 검색 기능을 활용한 작가 분류 (배치 처리)

require('dotenv').config();

const GeminiSearchClassifier = require('./src/services/geminiSearchClassifier');
const { pool } = require('./src/config/database');

async function runSearchClassificationBatch(batchSize = 50, offset = 0) {
  console.log('🚀 Gemini Search Classification (배치 모드) 시작');
  console.log('=====================================');
  console.log(`배치 크기: ${batchSize}, 오프셋: ${offset}\n`);

  const classifier = new GeminiSearchClassifier();
  const stats = {
    total: 0,
    processed: 0,
    successful: 0,
    failed: 0,
    searchUsed: 0,
    attributions: 0
  };

  try {
    // 분류되지 않은 작가들 중 일부만 선택
    const artists = await pool.query(`
      SELECT * FROM artists a
      WHERE a.apt_profile IS NULL
         OR CAST(a.apt_profile->'primary_types'->0->>'confidence' AS FLOAT) < 60
      ORDER BY 
        CASE 
          WHEN a.name LIKE '%Attributed%' OR a.name LIKE '%Follower%' 
               OR a.name LIKE '%Workshop%' OR a.name LIKE '%After%' THEN 1
          ELSE 2
        END,
        LENGTH(COALESCE(a.bio, '')) DESC,
        a.id
      LIMIT $1 OFFSET $2
    `, [batchSize, offset]);

    stats.total = artists.rows.length;

    if (stats.total === 0) {
      console.log('🎉 처리할 작가가 없습니다!');
      return;
    }

    console.log(`📊 이번 배치 분류 대상: ${stats.total}명\n`);

    // 각 작가 처리
    for (const artist of artists.rows) {
      stats.processed++;

      console.log(`\n${'='.repeat(60)}`);
      console.log(`[${stats.processed}/${stats.total}] ${artist.name}`);

      const isAttribution = artist.name.match(/Attributed|Follower|Workshop|After/);
      if (isAttribution) {
        stats.attributions++;
        console.log(`   🏷️ 귀속 작품`);
      }

      try {
        const result = await classifier.classifyArtist(artist);

        console.log(`✅ APT: ${result.aptType} (신뢰도: ${result.confidence}%)`);
        console.log(`   전략: ${result.analysis.strategy}`);

        if (result.analysis.searchInfo) {
          console.log(`   🔍 검색 사용됨`);
          stats.searchUsed++;
        }

        // DB 저장
        await saveResult(artist, result);
        stats.successful++;

      } catch (error) {
        console.error(`❌ 실패: ${error.message}`);
        stats.failed++;
      }

      // API 제한 관리
      if (stats.processed % 10 === 0 && stats.processed < stats.total) {
        console.log('\n⏸️  API 제한 대기 (2초)...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // 배치 통계
    console.log(`\n\n${'='.repeat(60)}`);
    console.log(`📊 배치 #${Math.floor(offset / batchSize) + 1} 완료`);
    console.log('='.repeat(60));
    console.log(`처리: ${stats.successful}/${stats.total} 성공`);
    console.log(`검색 사용: ${stats.searchUsed}회`);
    console.log(`귀속 작품: ${stats.attributions}개`);

    // 전체 진행 상황 확인
    const totalCount = await pool.query(`
      SELECT COUNT(*) as total
      FROM artists
      WHERE apt_profile IS NULL
         OR CAST(apt_profile->'primary_types'->0->>'confidence' AS FLOAT) < 60
    `);

    console.log(`\n📈 전체 진행: ${totalCount.rows[0].total}명 남음`);

  } catch (error) {
    console.error('실행 오류:', error);
  } finally {
    await pool.end();
  }
}

async function saveResult(artist, result) {
  const typeMap = {
    'LAEF': { title: '몽환적 방랑자', animal: 'fox', name_ko: '여우' },
    'LAEC': { title: '감성 큐레이터', animal: 'cat', name_ko: '고양이' },
    'LAMF': { title: '직관적 탐구자', animal: 'owl', name_ko: '올빼미' },
    'LAMC': { title: '철학적 수집가', animal: 'turtle', name_ko: '거북이' },
    'LREF': { title: '고독한 관찰자', animal: 'chameleon', name_ko: '카멜레온' },
    'LREC': { title: '섬세한 감정가', animal: 'hedgehog', name_ko: '고슴도치' },
    'LRMF': { title: '디지털 탐험가', animal: 'octopus', name_ko: '문어' },
    'LRMC': { title: '학구적 연구자', animal: 'beaver', name_ko: '비버' },
    'SAEF': { title: '감성 나눔이', animal: 'butterfly', name_ko: '나비' },
    'SAEC': { title: '예술 네트워커', animal: 'penguin', name_ko: '펭귄' },
    'SAMF': { title: '영감 전도사', animal: 'parrot', name_ko: '앵무새' },
    'SAMC': { title: '문화 기획자', animal: 'deer', name_ko: '사슴' },
    'SREF': { title: '열정적 관람자', animal: 'dog', name_ko: '강아지' },
    'SREC': { title: '따뜻한 안내자', animal: 'duck', name_ko: '오리' },
    'SRMF': { title: '지식 멘토', animal: 'elephant', name_ko: '코끼리' },
    'SRMC': { title: '체계적 교육자', animal: 'eagle', name_ko: '독수리' }
  };

  const typeInfo = typeMap[result.aptType] || { title: 'Unknown', animal: 'unknown', name_ko: '알 수 없음' };

  const aptProfile = {
    dimensions: {
      L: Math.round(50 - result.axisScores.L_S / 2),
      S: Math.round(50 + result.axisScores.L_S / 2),
      A: Math.round(50 - result.axisScores.A_R / 2),
      R: Math.round(50 + result.axisScores.A_R / 2),
      E: Math.round(50 - result.axisScores.E_M / 2),
      M: Math.round(50 + result.axisScores.E_M / 2),
      F: Math.round(50 - result.axisScores.F_C / 2),
      C: Math.round(50 + result.axisScores.F_C / 2)
    },
    primary_types: [{
      type: result.aptType,
      title: typeInfo.title,
      animal: typeInfo.animal,
      name_ko: typeInfo.name_ko,
      confidence: result.confidence,
      weight: 0.9
    }],
    meta: {
      analysis_date: new Date().toISOString(),
      analysis_method: 'gemini_search_v1',
      actual_artist_name: result.analysis.actualArtistName,
      strategy_used: result.analysis.strategy,
      search_info: result.analysis.searchInfo,
      reasoning: result.analysis.reasoning
    }
  };

  await pool.query(
    'UPDATE artists SET apt_profile = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
    [artist.id, JSON.stringify(aptProfile)]
  );
}

// 실행 - 명령줄 인자로 배치 크기와 오프셋 지정 가능
const args = process.argv.slice(2);
const batchSize = parseInt(args[0]) || 50;
const offset = parseInt(args[1]) || 0;

runSearchClassificationBatch(batchSize, offset).catch(console.error);
