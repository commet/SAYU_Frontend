const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function generateAPTBatch2Report() {
  console.log('🎨 APT Analysis Batch 2: Comprehensive Report\n');
  console.log('=' .repeat(80));
  
  try {
    // Get the analyzed artists
    const analysisResult = await pool.query(`
      SELECT 
        name,
        name_ko,
        nationality,
        birth_year,
        death_year,
        apt_profile
      FROM artists 
      WHERE apt_profile->'meta'->>'source' = 'comprehensive_analysis_batch2'
      ORDER BY name
    `);
    
    console.log(`📊 Total Artists Analyzed: ${analysisResult.rows.length}\n`);
    
    // Animal type distribution
    const animalMap = {
      'LAEF': 'Wolf (늑대)', 'LAEC': 'Fox (여우)', 'LAMF': 'Cat (고양이)', 'LAMC': 'Owl (올빼미)',
      'LREF': 'Eagle (독수리)', 'LREC': 'Bear (곰)', 'LRMF': 'Tiger (호랑이)', 'LRMC': 'Lion (사자)',
      'SAEF': 'Horse (말)', 'SAEC': 'Deer (사슴)', 'SAMF': 'Dolphin (돌고래)', 'SAMC': 'Elephant (코끼리)',
      'SREF': 'Dog (개)', 'SREC': 'Sheep (양)', 'SRMF': 'Rabbit (토끼)', 'SRMC': 'Cow (소)'
    };
    
    const animalDistribution = {};
    const eraDistribution = {};
    
    console.log('🔍 Individual Artist Analysis:\n');
    
    analysisResult.rows.forEach((artist, index) => {
      const aptProfile = artist.apt_profile;
      const primaryType = aptProfile.primary_types[0];
      const animal = animalMap[primaryType.type];
      
      console.log(`${index + 1}. ${artist.name}`);
      console.log(`   한국어명: ${artist.name_ko || 'N/A'}`);
      console.log(`   국적: ${artist.nationality || 'Unknown'}`);
      console.log(`   생몰년: ${artist.birth_year || '?'} - ${artist.death_year || 'present'}`);
      console.log(`   시대: ${aptProfile.meta.era || 'N/A'}`);
      console.log(`   주 동물 유형: ${animal} (${primaryType.type}) - ${(primaryType.weight * 100).toFixed(0)}%`);
      
      // Show dimensional scores
      const dims = aptProfile.dimensions;
      console.log(`   차원 점수: L${dims.L} S${dims.S} | A${dims.A} R${dims.R} | E${dims.E} M${dims.M} | F${dims.F} C${dims.C}`);
      
      // Show personality insights
      console.log(`   키워드: ${aptProfile.meta.keywords.join(', ')}`);
      console.log(`   신뢰도: ${(aptProfile.meta.confidence * 100).toFixed(0)}%`);
      console.log('');
      
      // Collect distribution data
      if (!animalDistribution[animal]) animalDistribution[animal] = 0;
      animalDistribution[animal]++;
      
      const era = aptProfile.meta.era || 'Unknown';
      if (!eraDistribution[era]) eraDistribution[era] = 0;
      eraDistribution[era]++;
    });
    
    console.log('\n🐾 동물 유형 분포:\n');
    Object.entries(animalDistribution)
      .sort(([,a], [,b]) => b - a)
      .forEach(([animal, count]) => {
        const percentage = ((count / analysisResult.rows.length) * 100).toFixed(1);
        console.log(`   ${animal}: ${count}명 (${percentage}%)`);
      });
    
    console.log('\n🕰️ 시대별 분포:\n');
    Object.entries(eraDistribution)
      .sort(([,a], [,b]) => b - a)
      .forEach(([era, count]) => {
        const percentage = ((count / analysisResult.rows.length) * 100).toFixed(1);
        console.log(`   ${era}: ${count}명 (${percentage}%)`);
      });
    
    // Dimensional analysis
    console.log('\n📈 차원별 분석:\n');
    
    const dimensionalStats = {
      L: { total: 0, high: 0 }, S: { total: 0, high: 0 },
      A: { total: 0, high: 0 }, R: { total: 0, high: 0 },
      E: { total: 0, high: 0 }, M: { total: 0, high: 0 },
      F: { total: 0, high: 0 }, C: { total: 0, high: 0 }
    };
    
    analysisResult.rows.forEach(artist => {
      const dims = artist.apt_profile.dimensions;
      Object.keys(dimensionalStats).forEach(dim => {
        const score = dims[dim];
        dimensionalStats[dim].total += score;
        if (score > 50) dimensionalStats[dim].high++;
      });
    });
    
    Object.entries(dimensionalStats).forEach(([dim, stats]) => {
      const avg = (stats.total / analysisResult.rows.length).toFixed(1);
      const highPercentage = ((stats.high / analysisResult.rows.length) * 100).toFixed(1);
      
      const dimName = {
        L: 'Lone (독립적)', S: 'Shared (사회적)',
        A: 'Abstract (추상적)', R: 'Representational (재현적)',
        E: 'Emotional (감정적)', M: 'Meaning (의미적)',
        F: 'Flow (자유로운)', C: 'Constructive (구조적)'
      }[dim];
      
      console.log(`   ${dimName}: 평균 ${avg}점, 우세 ${stats.high}명 (${highPercentage}%)`);
    });
    
    // Confidence analysis
    console.log('\n🎯 분석 신뢰도:\n');
    
    const confidenceStats = analysisResult.rows.map(artist => artist.apt_profile.meta.confidence);
    const avgConfidence = (confidenceStats.reduce((a, b) => a + b, 0) / confidenceStats.length * 100).toFixed(1);
    const highConfidence = confidenceStats.filter(c => c >= 0.8).length;
    const mediumConfidence = confidenceStats.filter(c => c >= 0.7 && c < 0.8).length;
    const lowConfidence = confidenceStats.filter(c => c < 0.7).length;
    
    console.log(`   평균 신뢰도: ${avgConfidence}%`);
    console.log(`   높은 신뢰도 (≥80%): ${highConfidence}명`);
    console.log(`   중간 신뢰도 (70-79%): ${mediumConfidence}명`);
    console.log(`   낮은 신뢰도 (<70%): ${lowConfidence}명`);
    
    // Recommendations for future analysis
    console.log('\n💡 향후 분석 권장사항:\n');
    
    const lowConfidenceArtists = analysisResult.rows
      .filter(artist => artist.apt_profile.meta.confidence < 0.8)
      .map(artist => artist.name);
    
    if (lowConfidenceArtists.length > 0) {
      console.log('   재검토 필요 아티스트:');
      lowConfidenceArtists.forEach(name => console.log(`   - ${name}`));
    }
    
    console.log('\n   분석 개선 방향:');
    console.log('   - 저명도가 낮은 아티스트는 더 많은 문헌 조사 필요');
    console.log('   - 익명/귀속 작가는 시대적 맥락과 작품 분석 중심 접근');
    console.log('   - 공예가는 기능성과 예술성의 균형 고려');
    console.log('   - 여성 화가는 사회적 제약과 개인적 혁신성 균형 분석');
    
    // Total database statistics
    console.log('\n📊 전체 데이터베이스 APT 현황:\n');
    
    const totalStatsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_artists,
        COUNT(apt_profile) as mapped_artists,
        COUNT(CASE WHEN apt_profile->'meta'->>'source' = 'comprehensive_analysis_batch2' THEN 1 END) as batch2_count,
        COUNT(CASE WHEN apt_profile->'meta'->>'source' = 'expert_preset' THEN 1 END) as expert_preset_count
      FROM artists
    `);
    
    const stats = totalStatsResult.rows[0];
    const mappingPercentage = ((stats.mapped_artists / stats.total_artists) * 100).toFixed(1);
    
    console.log(`   전체 아티스트: ${stats.total_artists}명`);
    console.log(`   APT 매핑 완료: ${stats.mapped_artists}명 (${mappingPercentage}%)`);
    console.log(`   Batch 2 분석: ${stats.batch2_count}명`);
    console.log(`   Expert Preset: ${stats.expert_preset_count}명`);
    
    console.log('\n🎯 다음 단계:\n');
    console.log('   1. 다음 10명 아티스트 배치 분석 진행');
    console.log('   2. 사용자 성격 유형과 아티스트 매칭 알고리즘 테스트');
    console.log('   3. 감정 벡터 시스템과 APT 시스템 통합');
    console.log('   4. 실제 사용자 피드백을 통한 매칭 정확도 검증');
    
  } catch (error) {
    console.error('Report generation error:', error.message);
  } finally {
    await pool.end();
  }
}

generateAPTBatch2Report().catch(console.error);