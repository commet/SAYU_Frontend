const fs = require('fs');
const path = require('path');

function mergeBatchResults() {
  console.log('🔄 배치 결과 파일 병합 시작!');

  // 모든 배치 파일 찾기
  const files = fs.readdirSync(__dirname)
    .filter(file => file.startsWith('batch_collection_results_') && file.endsWith('.json'))
    .sort();

  console.log(`📋 발견된 배치 파일: ${files.length}개`);

  const mergedResults = {
    metadata: {
      totalProcessed: 0,
      successfulCollections: 0,
      failedCollections: 0,
      mergedFrom: files,
      mergedAt: new Date().toISOString()
    },
    qualityDistribution: {
      high: 0,
      medium: 0,
      low: 0,
      very_low: 0,
      failed: 0
    },
    results: [],
    errors: []
  };

  // 중복 제거를 위한 Set
  const processedArtists = new Set();

  // 각 파일에서 데이터 수집
  files.forEach(file => {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(__dirname, file), 'utf8'));

      if (data.results && data.results.length > 0) {
        console.log(`  📄 ${file}: ${data.results.length}명`);

        data.results.forEach(result => {
          const artistKey = result.originalArtist.name;

          // 중복 제거
          if (!processedArtists.has(artistKey)) {
            processedArtists.add(artistKey);
            mergedResults.results.push(result);

            // 통계 업데이트
            mergedResults.metadata.totalProcessed++;
            if (result.reliabilityGrade !== 'failed') {
              mergedResults.metadata.successfulCollections++;
              mergedResults.qualityDistribution[result.reliabilityGrade]++;
            } else {
              mergedResults.metadata.failedCollections++;
              mergedResults.qualityDistribution.failed++;
            }
          }
        });
      }

      // 에러 병합
      if (data.errors && data.errors.length > 0) {
        mergedResults.errors.push(...data.errors);
      }
    } catch (error) {
      console.error(`  ❌ ${file} 읽기 실패:`, error.message);
    }
  });

  // 병합된 결과 저장
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputFile = `merged_batch_results_${timestamp}.json`;

  fs.writeFileSync(
    path.join(__dirname, outputFile),
    JSON.stringify(mergedResults, null, 2)
  );

  console.log('\n✅ 병합 완료!');
  console.log(`📊 총 아티스트: ${mergedResults.metadata.totalProcessed}명`);
  console.log(`✅ 성공: ${mergedResults.metadata.successfulCollections}명`);
  console.log(`❌ 실패: ${mergedResults.metadata.failedCollections}명`);
  console.log(`\n💾 저장: ${outputFile}`);

  // 품질 분포 출력
  console.log('\n📈 품질 분포:');
  Object.entries(mergedResults.qualityDistribution).forEach(([grade, count]) => {
    if (count > 0) {
      console.log(`   ${grade}: ${count}명`);
    }
  });

  return outputFile;
}

// 실행
if (require.main === module) {
  mergeBatchResults();
}

module.exports = mergeBatchResults;
