/**
 * Artvee 이미지 저장 용량 계산
 */

function calculateStorage() {
  console.log('💾 Artvee 이미지 저장 용량 예상\n');
  
  const totalArtworks = 1810;
  
  // 일반적인 고품질 아트 이미지 크기 (경험 기반)
  const imageSizes = {
    // Artvee는 고해상도 아트 이미지 제공
    fullSize: {
      resolution: '3000-5000px',
      avgSize: 3.5, // MB
      minSize: 1.5, // MB
      maxSize: 8.0  // MB
    },
    // 웹 표시용 중간 크기
    medium: {
      resolution: '1200-1600px',
      avgSize: 0.5, // MB
      minSize: 0.3, // MB
      maxSize: 0.8  // MB
    },
    // 썸네일
    thumbnail: {
      resolution: '300-400px',
      avgSize: 0.08, // MB (80KB)
      minSize: 0.05, // MB (50KB)
      maxSize: 0.12  // MB (120KB)
    }
  };
  
  console.log('📏 예상 이미지 크기:');
  console.log('   원본 (고해상도):');
  console.log(`     - 해상도: ${imageSizes.fullSize.resolution}`);
  console.log(`     - 평균: ${imageSizes.fullSize.avgSize} MB`);
  console.log(`     - 범위: ${imageSizes.fullSize.minSize} - ${imageSizes.fullSize.maxSize} MB`);
  
  console.log('\n   중간 크기:');
  console.log(`     - 해상도: ${imageSizes.medium.resolution}`);
  console.log(`     - 평균: ${imageSizes.medium.avgSize} MB`);
  console.log(`     - 범위: ${imageSizes.medium.minSize} - ${imageSizes.medium.maxSize} MB`);
  
  console.log('\n   썸네일:');
  console.log(`     - 해상도: ${imageSizes.thumbnail.resolution}`);
  console.log(`     - 평균: ${imageSizes.thumbnail.avgSize} MB`);
  console.log(`     - 범위: ${imageSizes.thumbnail.minSize} - ${imageSizes.thumbnail.maxSize} MB`);
  
  console.log('\n📊 전체 용량 계산 (1,810개 작품):');
  
  // 시나리오별 계산
  const scenarios = [
    {
      name: '원본 이미지만',
      total: (imageSizes.fullSize.avgSize * totalArtworks / 1024).toFixed(2),
      min: (imageSizes.fullSize.minSize * totalArtworks / 1024).toFixed(2),
      max: (imageSizes.fullSize.maxSize * totalArtworks / 1024).toFixed(2)
    },
    {
      name: '중간 크기만',
      total: (imageSizes.medium.avgSize * totalArtworks / 1024).toFixed(2),
      min: (imageSizes.medium.minSize * totalArtworks / 1024).toFixed(2),
      max: (imageSizes.medium.maxSize * totalArtworks / 1024).toFixed(2)
    },
    {
      name: '썸네일만',
      total: (imageSizes.thumbnail.avgSize * totalArtworks / 1024).toFixed(2),
      min: (imageSizes.thumbnail.minSize * totalArtworks / 1024).toFixed(2),
      max: (imageSizes.thumbnail.maxSize * totalArtworks / 1024).toFixed(2)
    },
    {
      name: '썸네일 + 중간 크기',
      total: ((imageSizes.thumbnail.avgSize + imageSizes.medium.avgSize) * totalArtworks / 1024).toFixed(2),
      min: ((imageSizes.thumbnail.minSize + imageSizes.medium.minSize) * totalArtworks / 1024).toFixed(2),
      max: ((imageSizes.thumbnail.maxSize + imageSizes.medium.maxSize) * totalArtworks / 1024).toFixed(2)
    },
    {
      name: '전체 (원본 + 중간 + 썸네일)',
      total: ((imageSizes.fullSize.avgSize + imageSizes.medium.avgSize + imageSizes.thumbnail.avgSize) * totalArtworks / 1024).toFixed(2),
      min: ((imageSizes.fullSize.minSize + imageSizes.medium.minSize + imageSizes.thumbnail.minSize) * totalArtworks / 1024).toFixed(2),
      max: ((imageSizes.fullSize.maxSize + imageSizes.medium.maxSize + imageSizes.thumbnail.maxSize) * totalArtworks / 1024).toFixed(2)
    }
  ];
  
  scenarios.forEach(scenario => {
    console.log(`\n   ${scenario.name}:`);
    console.log(`     예상: ${scenario.total} GB`);
    console.log(`     범위: ${scenario.min} - ${scenario.max} GB`);
  });
  
  console.log('\n💡 권장사항:');
  console.log('   1. 초기 테스트: 썸네일만 다운로드 (약 0.14 GB)');
  console.log('   2. 실용적 선택: 썸네일 + 중간 크기 (약 1 GB)');
  console.log('   3. 필요시: 선택적으로 원본 다운로드');
  
  console.log('\n⚡ 다운로드 시간 예상 (50 Mbps 기준):');
  scenarios.forEach(scenario => {
    const timeInMinutes = (parseFloat(scenario.total) * 1024 * 8 / 50 / 60).toFixed(1);
    console.log(`   ${scenario.name}: 약 ${timeInMinutes}분`);
  });
  
  console.log('\n🔄 단계별 접근:');
  console.log('   1단계: 주요 작가 100개 썸네일 (약 8 MB)');
  console.log('   2단계: 전체 썸네일 (약 140 MB)');
  console.log('   3단계: 주요 작품 중간 크기 (선택적)');
  console.log('   4단계: 필요한 원본만 선택적 다운로드');
}

calculateStorage();