// 적절한 분류기 테스트 - 몇 가지 예시로 확인

require('dotenv').config();

const ProperGeminiClassifier = require('./src/services/properGeminiClassifier');
const { pool } = require('./src/config/database');

async function testProperClassifier() {
  console.log('🧪 적절한 분류기 테스트');
  console.log('=====================================\n');
  
  const classifier = new ProperGeminiClassifier();
  
  try {
    // 다양한 유형의 작가 선택
    const testArtists = await pool.query(`
      SELECT * FROM (
        -- 정보가 풍부한 작가
        (SELECT *, 'rich_data' as test_type 
         FROM artists 
         WHERE LENGTH(COALESCE(bio, '')) > 500 
           AND apt_profile->'primary_types'->0->>'type' = 'SRMC'
         ORDER BY RANDOM() LIMIT 2)
        
        UNION ALL
        
        -- 귀속 작품
        (SELECT *, 'attribution' as test_type
         FROM artists 
         WHERE name LIKE '%Attributed%' 
           AND apt_profile->'primary_types'->0->>'type' = 'SRMC'
         ORDER BY RANDOM() LIMIT 2)
        
        UNION ALL
        
        -- 도자기 화가
        (SELECT *, 'pottery' as test_type
         FROM artists 
         WHERE name LIKE '%Painter%' AND name LIKE '%Greek%'
           AND apt_profile->'primary_types'->0->>'type' = 'SRMC'
         ORDER BY RANDOM() LIMIT 2)
        
        UNION ALL
        
        -- 정보 부족
        (SELECT *, 'minimal_data' as test_type
         FROM artists 
         WHERE bio IS NULL AND nationality IS NULL
           AND apt_profile->'primary_types'->0->>'type' = 'SRMC'
         ORDER BY RANDOM() LIMIT 2)
      ) test_set
      ORDER BY test_type
    `);
    
    console.log(`테스트 대상: ${testArtists.rows.length}명\n`);
    
    for (const artist of testArtists.rows) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`테스트 유형: ${artist.test_type}`);
      console.log(`작가: ${artist.name}`);
      console.log(`현재 APT: SRMC\n`);
      
      try {
        const result = await classifier.classifyArtist(artist);
        
        console.log(`✅ 새로운 분류 결과:`);
        console.log(`   APT: ${result.aptType}`);
        console.log(`   신뢰도: ${result.confidence}%`);
        console.log(`   축 점수: L/S=${result.axisScores.L_S}, A/R=${result.axisScores.A_R}, E/M=${result.axisScores.E_M}, F/C=${result.axisScores.F_C}`);
        console.log(`   분류 근거: ${result.analysis.reasoning?.substring(0, 200)}...`);
        
        if (result.aptType === 'UNKNOWN') {
          console.log(`   ⚠️ 정보 부족으로 분류 불가`);
        }
        
      } catch (error) {
        console.error(`❌ 실패: ${error.message}`);
      }
      
      // API 제한
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
  } catch (error) {
    console.error('테스트 오류:', error);
  } finally {
    await pool.end();
  }
}

// 실행
testProperClassifier().catch(console.error);