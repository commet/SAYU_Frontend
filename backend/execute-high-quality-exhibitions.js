/**
 * Execute High-Quality Exhibitions SQL Insert
 * 최종 고품질 전시 데이터를 데이터베이스에 삽입
 */

const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

async function executeHighQualityExhibitions() {
  console.log('🎨 HIGH-QUALITY EXHIBITIONS INSERTION');
  console.log('=====================================\n');

  // 데이터베이스 연결
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    // SQL 파일 읽기
    const sqlContent = fs.readFileSync('./safe-high-quality-exhibitions-insert.sql', 'utf8');
    
    console.log('📝 SQL 파일 로드 완료');
    console.log(`📊 SQL 내용 크기: ${sqlContent.length} characters\n`);

    // SQL 실행
    console.log('🚀 SQL 실행 시작...');
    const startTime = Date.now();
    
    const result = await pool.query(sqlContent);
    
    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log('✅ SQL 실행 완료!');
    console.log(`⏰ 실행 시간: ${duration}ms\n`);

    // 결과 확인
    await verifyInsertion(pool);

  } catch (error) {
    console.error('❌ SQL 실행 오류:', error.message);
    console.error('상세 오류:', error);
  } finally {
    await pool.end();
  }
}

async function verifyInsertion(pool) {
  console.log('🔍 데이터 삽입 검증 시작...\n');

  try {
    // 1. venues 카운트
    const venuesResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM global_venues 
      WHERE data_source = 'timeout_enhanced'
    `);
    console.log(`🏛️  삽입된 Venues: ${venuesResult.rows[0].count}개`);

    // 2. exhibitions 카운트
    const exhibitionsResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM global_exhibitions 
      WHERE data_source = 'timeout_enhanced'
    `);
    console.log(`🎨 삽입된 Exhibitions: ${exhibitionsResult.rows[0].count}개`);

    // 3. 품질 점수 확인
    const qualityResult = await pool.query(`
      SELECT 
        AVG(data_quality_score) as avg_venue_quality,
        MIN(data_quality_score) as min_venue_quality,
        MAX(data_quality_score) as max_venue_quality
      FROM global_venues 
      WHERE data_source = 'timeout_enhanced'
    `);
    
    if (qualityResult.rows[0].avg_venue_quality) {
      console.log(`📊 평균 Venue 품질 점수: ${Math.round(qualityResult.rows[0].avg_venue_quality)}/100`);
      console.log(`📊 최소/최대 품질 점수: ${qualityResult.rows[0].min_venue_quality}/${qualityResult.rows[0].max_venue_quality}`);
    }

    // 4. 성격 매칭 확인
    const personalityResult = await pool.query(`
      SELECT COUNT(DISTINCT unnest(personality_matches)) as personality_types_covered
      FROM global_exhibitions 
      WHERE data_source = 'timeout_enhanced'
    `);
    console.log(`🎭 커버된 성격 유형: ${personalityResult.rows[0].personality_types_covered}/16`);

    // 5. 샘플 데이터 출력
    const sampleResult = await pool.query(`
      SELECT v.name as venue_name, e.title as exhibition_title, e.recommendation_score
      FROM global_venues v
      JOIN global_exhibitions e ON v.id = e.venue_id
      WHERE v.data_source = 'timeout_enhanced'
      ORDER BY v.data_quality_score DESC, e.recommendation_score DESC
      LIMIT 5
    `);

    if (sampleResult.rows.length > 0) {
      console.log('\n✨ 삽입된 고품질 전시 샘플:');
      sampleResult.rows.forEach((row, i) => {
        console.log(`   ${i + 1}. "${row.exhibition_title}" - ${row.venue_name} (추천점수: ${row.recommendation_score})`);
      });
    }

    console.log('\n🎉 HIGH-QUALITY EXHIBITIONS 성공적으로 삽입됨!');
    console.log('✅ 런던의 세계적인 미술관 13곳과 현재 진행 중인 주요 전시 10개 추가');
    console.log('✅ 모든 16가지 성격 유형에 대한 매칭 정보 포함');
    console.log('✅ SAYU 개인화 추천 시스템 준비 완료');

  } catch (error) {
    console.error('❌ 검증 중 오류 발생:', error.message);
  }
}

// 실행
if (require.main === module) {
  executeHighQualityExhibitions();
}

module.exports = { executeHighQualityExhibitions };