// 중요도 기반 추천 시스템 테스트

require('dotenv').config();
const ImportanceBasedRecommendation = require('./src/services/importanceBasedRecommendation');

async function testRecommendationSystem() {
  console.log('🎯 중요도 기반 추천 시스템 테스트');
  console.log(`=${'='.repeat(70)}`);

  const recommender = new ImportanceBasedRecommendation();

  try {
    // 1. 일반 추천 테스트
    console.log('\n📌 일반 추천 (중요도 우선):');
    console.log('-'.repeat(70));

    const generalRec = await recommender.recommendArtists({
      limit: 10,
      includeModern: true,
      educationalMode: false
    });

    generalRec.recommendations.forEach(rec => {
      console.log(`${rec.rank}. ${rec.artist.name}`);
      console.log(`   ${rec.artist.importance.tierName} (${rec.artist.importance.score}점)`);
      console.log(`   ${rec.artist.era || '시대 미상'} | ${rec.artist.nationality || '국적 미상'}`);
      console.log(`   추천 이유: ${rec.reason}`);
      console.log(`   점수: 총 ${rec.scores.total} (중요도: ${rec.scores.breakdown.importance})`);
      console.log('');
    });

    // 2. APT 매칭 추천 테스트
    console.log('\n📌 APT 매칭 추천 (LAEF 사용자):');
    console.log('-'.repeat(70));

    const aptRec = await recommender.recommendArtists({
      userAPT: 'LAEF',
      limit: 5,
      includeModern: true,
      educationalMode: false
    });

    aptRec.recommendations.forEach(rec => {
      console.log(`${rec.rank}. ${rec.artist.name}`);
      if (rec.artist.apt) {
        console.log(`   APT: ${rec.artist.apt.type} - ${rec.artist.apt.title}`);
      }
      console.log(`   APT 매칭 점수: ${rec.scores.breakdown.aptMatch}`);
      console.log('');
    });

    // 3. 교육 모드 테스트
    console.log('\n📌 교육 모드 (거장 우선):');
    console.log('-'.repeat(70));

    const eduRec = await recommender.recommendArtists({
      limit: 10,
      includeModern: false,
      educationalMode: true
    });

    console.log('미술사 필수 작가들:');
    eduRec.recommendations.forEach(rec => {
      console.log(`${rec.rank}. ${rec.artist.name} (${rec.artist.lifespan || '생몰년 미상'})`);
      console.log(`   ${rec.artist.importance.tierName}`);
    });

    // 4. 시대별 추천 테스트
    console.log('\n\n📌 시대별 추천 (르네상스):');
    console.log('-'.repeat(70));

    const renaissanceArtists = await recommender.recommendByEra('Renaissance', 5);

    renaissanceArtists.forEach((artist, idx) => {
      console.log(`${idx + 1}. ${artist.name} - ${artist.nationality || '?'}`);
    });

    // 5. 학습 경로 테스트
    console.log('\n\n📌 미술사 학습 경로:');
    console.log('-'.repeat(70));

    const levels = ['beginner', 'intermediate', 'advanced'];

    for (const level of levels) {
      const path = await recommender.getEducationalPath(level);
      console.log(`\n${level.toUpperCase()} 레벨 (${path.totalArtists}명):`);
      console.log(`시대: ${path.eras.join(', ')}`);

      path.path.slice(0, 3).forEach((artist, idx) => {
        console.log(`  ${idx + 1}. ${artist.name} (${artist.era || '?'})`);
      });
      console.log('  ...');
    }

    // 6. 다양성 추천 테스트
    console.log('\n\n📌 다양성 추천:');
    console.log('-'.repeat(70));

    const diverseArtists = await recommender.getDiverseRecommendations(10);

    const nationalities = [...new Set(diverseArtists.map(a => a.nationality))];
    const eras = [...new Set(diverseArtists.map(a => a.era))];

    console.log(`${diverseArtists.length}명의 작가 (${nationalities.length}개국, ${eras.length}개 시대)`);

    diverseArtists.slice(0, 5).forEach((artist, idx) => {
      console.log(`${idx + 1}. ${artist.name} - ${artist.nationality} (${artist.era || '?'})`);
    });

    // 7. 통계
    console.log('\n\n📊 추천 시스템 통계:');
    console.log('-'.repeat(70));

    const { pool } = require('./src/config/database');
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN importance_tier = 1 THEN 1 END) as tier1,
        COUNT(CASE WHEN importance_tier = 2 THEN 1 END) as tier2,
        COUNT(CASE WHEN importance_tier = 3 THEN 1 END) as tier3,
        AVG(importance_score) as avg_score
      FROM artists
      WHERE importance_score > 0
    `);

    const stat = stats.rows[0];
    console.log(`전체 중요 작가: ${stat.total}명`);
    console.log(`거장 (티어 1): ${stat.tier1}명`);
    console.log(`매우 중요 (티어 2): ${stat.tier2}명`);
    console.log(`중요 (티어 3): ${stat.tier3}명`);
    console.log(`평균 중요도 점수: ${Math.round(stat.avg_score)}점`);

    await pool.end();

  } catch (error) {
    console.error('테스트 오류:', error);
  }
}

// 실행
testRecommendationSystem();
