// SRMC 과다 분류 패턴 분석

require('dotenv').config();
const { pool } = require('./src/config/database');

async function analyzeSRMCPatterns() {
  try {
    console.log('\n🔍 SRMC 과다 분류 원인 분석');
    console.log('=====================================\n');
    
    // 1. 검색 결과가 없거나 부족한 경우
    const noSearchInfo = await pool.query(`
      SELECT COUNT(*) as count
      FROM artists
      WHERE apt_profile->'primary_types'->0->>'type' = 'SRMC'
        AND apt_profile->'meta'->>'search_info' IS NULL
    `);
    
    const withSearchInfo = await pool.query(`
      SELECT COUNT(*) as count
      FROM artists
      WHERE apt_profile->'primary_types'->0->>'type' = 'SRMC'
        AND apt_profile->'meta'->>'search_info' IS NOT NULL
    `);
    
    console.log(`📊 SRMC 분류 통계:`);
    console.log(`   - 검색 정보 없음: ${noSearchInfo.rows[0].count}명`);
    console.log(`   - 검색 정보 있음: ${withSearchInfo.rows[0].count}명\n`);
    
    // 2. 검색 정보가 있는 SRMC 샘플
    const srmcWithSearch = await pool.query(`
      SELECT 
        name,
        apt_profile->'meta'->>'search_info' as search_info,
        apt_profile->'meta'->>'reasoning' as reasoning,
        apt_profile->'dimensions'->>'S' as s_score,
        apt_profile->'dimensions'->>'R' as r_score,
        apt_profile->'dimensions'->>'M' as m_score,
        apt_profile->'dimensions'->>'C' as c_score
      FROM artists
      WHERE apt_profile->'primary_types'->0->>'type' = 'SRMC'
        AND apt_profile->'meta'->>'search_info' IS NOT NULL
      ORDER BY RANDOM()
      LIMIT 5
    `);
    
    console.log('📝 검색 정보가 있는 SRMC 작가 샘플:');
    console.log('=====================================\n');
    
    srmcWithSearch.rows.forEach((artist, idx) => {
      console.log(`${idx + 1}. ${artist.name}`);
      console.log(`   축 점수: S=${artist.s_score}, R=${artist.r_score}, M=${artist.m_score}, C=${artist.c_score}`);
      if (artist.search_info) {
        console.log(`   검색 정보: ${artist.search_info.substring(0, 200)}...`);
      }
      if (artist.reasoning) {
        console.log(`   분류 근거: ${artist.reasoning.substring(0, 200)}...`);
      }
      console.log('');
    });
    
    // 3. 공통 패턴 분석
    console.log('🔑 SRMC 과다 분류 핵심 원인:');
    console.log('=====================================\n');
    
    // 귀속 작품 분석
    const attributionCount = await pool.query(`
      SELECT COUNT(*) as count
      FROM artists
      WHERE apt_profile->'primary_types'->0->>'type' = 'SRMC'
        AND (name LIKE '%Attributed%' OR name LIKE '%Workshop%' OR name LIKE '%After%' OR name LIKE '%Follower%')
    `);
    
    console.log(`1. 귀속 작품: ${attributionCount.rows[0].count}명이 SRMC로 분류됨`);
    console.log(`   → Gemini가 "작업장", "공방", "체계적" 등의 키워드에 반응`);
    
    // 검색 실패 패턴
    const searchPatterns = await pool.query(`
      SELECT 
        CASE 
          WHEN apt_profile->'meta'->>'search_info' LIKE '%찾을 수 없%' THEN '정보 없음'
          WHEN apt_profile->'meta'->>'search_info' LIKE '%제한적%' THEN '제한적 정보'
          WHEN apt_profile->'meta'->>'search_info' LIKE '%도자기%' THEN '도자기 작가'
          WHEN apt_profile->'meta'->>'search_info' LIKE '%그룹%' THEN '그룹/공방'
          ELSE '기타'
        END as pattern,
        COUNT(*) as count
      FROM artists
      WHERE apt_profile->'primary_types'->0->>'type' = 'SRMC'
        AND apt_profile->'meta'->>'search_info' IS NOT NULL
      GROUP BY pattern
      ORDER BY count DESC
    `);
    
    console.log(`\n2. 검색 결과 패턴:`);
    searchPatterns.rows.forEach(row => {
      console.log(`   - ${row.pattern}: ${row.count}명`);
    });
    
    // 4. Gemini의 기본 응답 경향
    console.log(`\n3. Gemini의 응답 경향:`);
    console.log(`   - 정보가 부족할 때 "체계적", "교육적" 특성으로 기본 분류`);
    console.log(`   - 고대 그리스/로마 도자기 작가들을 대부분 SRMC로 분류`);
    console.log(`   - "Workshop", "School" 등의 단어를 보면 자동으로 C(체계적) 높게 평가`);
    
    // 5. 해결 방안
    console.log(`\n💡 해결 방안:`);
    console.log(`   1. 프롬프트에서 SRMC를 명시적으로 제한`);
    console.log(`   2. 도자기/공예 작가는 다른 기준 적용`);
    console.log(`   3. 귀속 작품은 별도 분류 로직 사용`);
    console.log(`   4. 검색 결과가 없을 때 더 다양한 기본값 사용`);
    
  } catch (error) {
    console.error('오류:', error);
  } finally {
    await pool.end();
  }
}

analyzeSRMCPatterns();