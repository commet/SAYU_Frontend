/**
 * 🎨 Masters 작품 최적화 및 SAYU 추가
 * 큰 파일들을 기존 컬렉션 크기에 맞게 최적화하여 추가
 */

const fs = require('fs');
const path = require('path');

console.log('🎨 Masters 작품 최적화 및 SAYU 추가');
console.log('=====================================');

// Masters 결과 로드
const mastersResultsPath = path.join(__dirname, '../artvee-crawler/masters-success-results.json');
const mastersResults = JSON.parse(fs.readFileSync(mastersResultsPath, 'utf8'));

console.log('📊 Masters 작품 분석');
console.log('=====================================');
console.log(`발견된 작품: ${mastersResults.successCount}개`);
console.log(`평균 크기: ${(mastersResults.mastersArtworks.reduce((sum, art) => sum + parseFloat(art.sizeMB), 0) / mastersResults.successCount).toFixed(2)}MB`);

console.log('\n📈 파일 크기 분석:');
mastersResults.mastersArtworks.forEach((artwork, i) => {
  const sizeCategory = parseFloat(artwork.sizeMB) > 5 ? '🔴 LARGE' : 
                       parseFloat(artwork.sizeMB) > 3 ? '🟡 MEDIUM' : '🟢 SMALL';
  console.log(`   ${(i+1).toString().padStart(2)}. ${artwork.filename} - ${artwork.sizeMB}MB ${sizeCategory}`);
});

// 기존 컬렉션 크기 기준 (약 1MB)
const TARGET_SIZE_MB = 1.5; // 기존보다 약간 크게 허용
const largeFiles = mastersResults.mastersArtworks.filter(art => parseFloat(art.sizeMB) > TARGET_SIZE_MB);

console.log(`\n🎯 최적화 필요 작품: ${largeFiles.length}개 (${TARGET_SIZE_MB}MB 초과)`);

// Cloudinary transformation으로 크기 최적화
function createOptimizedUrl(originalUrl, targetQuality = 80, targetWidth = 1200) {
  // 원본 URL을 파싱하여 transformation 추가
  const baseUrl = 'https://res.cloudinary.com/dkdzgpj3n/image/upload/';
  const version = 'v1753790141/';
  const path = 'sayu/artvee/masters/sayu/artvee/masters/';
  const filename = originalUrl.split('/').pop();
  
  // Cloudinary transformation 파라미터 추가
  const transformation = `w_${targetWidth},q_${targetQuality},f_auto/`;
  
  return `${baseUrl}${transformation}${version}${path}${filename}`;
}

// 최적화된 Masters 컬렉션 생성
const optimizedMasters = mastersResults.mastersArtworks.map(artwork => {
  const needsOptimization = parseFloat(artwork.sizeMB) > TARGET_SIZE_MB;
  
  return {
    id: artwork.id,
    title: artwork.title,
    artist: 'Masters Collection', // 추후 개별 작가명 매핑 가능
    source: 'Artvee Masters Collection',
    category: 'Masters',
    original: {
      url: artwork.url,
      sizeMB: artwork.sizeMB,
      resolution: 'High'
    },
    optimized: needsOptimization ? {
      url: createOptimizedUrl(artwork.url, 80, 1200),
      estimatedSizeMB: (parseFloat(artwork.sizeMB) * 0.4).toFixed(2), // 대략 60% 축소 예상
      transformation: 'w_1200,q_80,f_auto'
    } : null,
    recommended: needsOptimization ? 
      createOptimizedUrl(artwork.url, 80, 1200) : 
      artwork.url,
    sayuType: 'AUTO', // 추후 APT 매칭 필요
    priority: 'High'
  };
});

console.log('\n⚡ 최적화 방안');
console.log('=====================================');
console.log('🔧 Cloudinary Transformation 사용:');
console.log('   - 너비: 1200px (기존 컬렉션과 유사)');
console.log('   - 품질: 80% (고품질 유지)');
console.log('   - 자동 포맷: WebP 등 최적 포맷');
console.log('   - 예상 크기 감소: ~60%');

console.log('\n📋 최적화 결과 미리보기:');
optimizedMasters.slice(0, 5).forEach((artwork, i) => {
  console.log(`   ${i+1}. ${artwork.title}`);
  console.log(`      원본: ${artwork.original.sizeMB}MB`);
  if (artwork.optimized) {
    console.log(`      최적화: ${artwork.optimized.estimatedSizeMB}MB (${Math.round((1 - artwork.optimized.estimatedSizeMB/artwork.original.sizeMB) * 100)}% 감소)`);
    console.log(`      URL: ${artwork.optimized.url.substring(0, 80)}...`);
  } else {
    console.log(`      최적화: 불필요 (이미 적정 크기)`);
  }
  console.log('');
});

// SAYU 통합 데이터 생성
const sayuIntegrationData = {
  addedDate: new Date().toISOString(),
  source: 'Masters Collection',
  totalCount: optimizedMasters.length,
  optimization: {
    applied: largeFiles.length,
    method: 'Cloudinary Transformation',
    parameters: 'w_1200,q_80,f_auto'
  },
  artworks: optimizedMasters,
  integration: {
    beforeCount: 773,
    afterCount: 773 + optimizedMasters.length,
    addedCategory: 'Masters',
    recommendedUrls: optimizedMasters.map(art => ({
      id: art.id,
      title: art.title,
      url: art.recommended,
      category: 'Masters'
    }))
  }
};

console.log('\n🚀 SAYU 통합 준비 완료');
console.log('=====================================');
console.log(`📊 추가될 작품: ${sayuIntegrationData.totalCount}개`);
console.log(`📈 컬렉션 확장: ${sayuIntegrationData.integration.beforeCount} → ${sayuIntegrationData.integration.afterCount}개`);
console.log(`🎯 최적화 적용: ${sayuIntegrationData.optimization.applied}개 작품`);

// 결과 저장
const outputDir = path.join(__dirname, '../artvee-crawler');
fs.writeFileSync(
  path.join(outputDir, 'masters-optimized-for-sayu.json'),
  JSON.stringify(sayuIntegrationData, null, 2)
);

console.log('\n💾 파일 저장: masters-optimized-for-sayu.json');

// 즉시 추가 가능한 URL 리스트 생성
const quickAddUrls = sayuIntegrationData.integration.recommendedUrls;
console.log('\n⚡ 즉시 SAYU 추가 가능한 URL들:');
quickAddUrls.slice(0, 3).forEach(item => {
  console.log(`   - ${item.title}: ${item.url.substring(0, 70)}...`);
});

console.log('\n🎯 다음 단계:');
console.log('1. 최적화된 URL들로 실제 크기 테스트');
console.log('2. SAYU 데이터베이스에 13개 작품 추가');
console.log('3. Masters 카테고리로 특별 분류');
console.log('4. APT별 맞춤 추천 알고리즘 적용');

// 성공 반환
console.log('\n✅ Masters 최적화 완료! SAYU 통합 준비됨');

module.exports = { sayuIntegrationData, optimizedMasters };