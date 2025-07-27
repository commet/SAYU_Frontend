// 데이터 기반 중요도 계산 테스트
require('dotenv').config();
const DataBasedImportanceCalculator = require('./src/services/dataBasedImportanceCalculator');

async function testDataBasedImportance() {
  try {
    console.log('🧪 데이터 기반 중요도 계산 시스템 테스트');
    console.log('='.repeat(80));

    const calculator = new DataBasedImportanceCalculator();

    // 테스트할 작가들 (정보량이 다른 작가들로 구성)
    const testArtists = [
      'Keith Haring',      // 잘 알려진 현대 작가
      'Yves Klein',        // 특색 있는 작가  
      'Gerhard Richter',   // 독일 현대 작가
      'Kaws',             // 현대 팝 아티스트
      'Takashi Murakami'   // 일본 현대 작가
    ];

    const results = [];

    for (const artistName of testArtists) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`🎨 ${artistName} 분석 중...`);
      console.log(`${'='.repeat(60)}`);

      try {
        const result = await calculator.calculateImportanceScore(artistName);
        
        if (result) {
          results.push(result);
          
          console.log(`\n📊 분석 결과:`);
          console.log(`중요도 점수: ${result.importance_score}점`);
          console.log(`신뢰도: ${result.confidence_level}`);
          console.log(`데이터 소스: ${result.data_sources.join(', ')}`);
          console.log(`국적: ${result.biographical_data.nationality || '정보 없음'}`);
          console.log(`생년: ${result.biographical_data.birth_year || '정보 없음'}`);
          console.log(`예술 운동: ${result.biographical_data.art_movements.join(', ') || '정보 없음'}`);
          console.log(`매체: ${result.biographical_data.mediums.join(', ') || '정보 없음'}`);
          console.log(`대표작 수: ${result.notable_works.length}개`);
          
          // 성격 지표 출력
          console.log(`\n🧠 성격 지표:`);
          const indicators = result.personality_indicators;
          console.log(`리더십 성향: ${indicators.leadership_tendency > 0 ? 'Leader' : 'Support'} (${indicators.leadership_tendency.toFixed(2)})`);
          console.log(`행동 지향성: ${indicators.action_orientation > 0 ? 'Action' : 'Reflection'} (${indicators.action_orientation.toFixed(2)})`);
          console.log(`감정 표현: ${indicators.emotional_expression > 0 ? 'Emotional' : 'Meaning-driven'} (${indicators.emotional_expression.toFixed(2)})`);
          console.log(`유연성: ${indicators.flexibility > 0 ? 'Flow' : 'Consistent'} (${indicators.flexibility.toFixed(2)})`);
          console.log(`지표 신뢰도: ${indicators.confidence}`);
          
          // 메타데이터
          console.log(`\n📈 분석 메타데이터:`);
          console.log(`Wikipedia 신뢰도: ${result.analysis_metadata.wikipedia_reliability}`);
          console.log(`Museum 신뢰도: ${result.analysis_metadata.museum_reliability}`);
          console.log(`데이터 완성도: ${result.analysis_metadata.data_completeness}%`);
          console.log(`총 소스 수: ${result.analysis_metadata.total_sources}`);
          
        } else {
          console.log(`❌ ${artistName} 분석 실패`);
        }
        
        // API 제한 고려 (3초 대기)
        await new Promise(resolve => setTimeout(resolve, 3000));
        
      } catch (error) {
        console.error(`❌ ${artistName} 분석 중 오류:`, error.message);
      }
    }

    // 종합 분석 결과
    console.log('\n' + '='.repeat(80));
    console.log('📋 종합 분석 결과');
    console.log('='.repeat(80));

    if (results.length > 0) {
      // 중요도별 정렬
      results.sort((a, b) => b.importance_score - a.importance_score);
      
      console.log('\n중요도 순위:');
      results.forEach((result, index) => {
        console.log(`${index + 1}. ${result.artist_name}: ${result.importance_score}점 (${result.confidence_level})`);
      });

      // 데이터 품질 분석
      console.log('\n데이터 품질 분석:');
      const avgCompleteness = results.reduce((sum, r) => sum + r.analysis_metadata.data_completeness, 0) / results.length;
      const avgSources = results.reduce((sum, r) => sum + r.analysis_metadata.total_sources, 0) / results.length;
      
      console.log(`평균 데이터 완성도: ${avgCompleteness.toFixed(1)}%`);
      console.log(`평균 소스 수: ${avgSources.toFixed(1)}개`);
      
      // 신뢰도 분포
      const confidenceLevels = results.reduce((acc, r) => {
        acc[r.confidence_level] = (acc[r.confidence_level] || 0) + 1;
        return acc;
      }, {});
      
      console.log('\n신뢰도 분포:');
      Object.entries(confidenceLevels).forEach(([level, count]) => {
        console.log(`${level}: ${count}명`);
      });

      // APT 지표 분석
      console.log('\nAPT 성격 지표 신뢰도:');
      const aptConfidence = results.reduce((acc, r) => {
        acc[r.personality_indicators.confidence] = (acc[r.personality_indicators.confidence] || 0) + 1;
        return acc;
      }, {});
      
      Object.entries(aptConfidence).forEach(([level, count]) => {
        console.log(`${level}: ${count}명`);
      });

    } else {
      console.log('❌ 분석된 작가가 없습니다.');
    }

    console.log('\n✅ 테스트 완료!');

  } catch (error) {
    console.error('테스트 실행 오류:', error);
  }
}

testDataBasedImportance();