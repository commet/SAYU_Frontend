const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Artvee 이미지 크기 예상
 */
async function estimateImageSizes() {
  console.log('🔍 Artvee 이미지 크기 조사\n');
  
  // 샘플 URL들
  const sampleUrls = [
    'https://artvee.com/dl/a-peasant-woman-digging-in-front-of-her-cottage/',
    'https://artvee.com/dl/self-portrait-26/',
    'https://artvee.com/dl/cypresses/',
    'https://artvee.com/dl/nighthawks/',
    'https://artvee.com/dl/the-milkmaid/'
  ];
  
  const imageSizes = [];
  
  for (const url of sampleUrls) {
    try {
      console.log(`검사 중: ${url}`);
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const $ = cheerio.load(response.data);
      
      // 다운로드 버튼이나 이미지 정보 찾기
      const downloadInfo = $('.pf-button-text').text() || '';
      const imageUrl = $('.woocommerce-product-gallery__image img').first().attr('src');
      
      // 이미지 URL에서 크기 정보 추출
      if (imageUrl) {
        // HEAD 요청으로 파일 크기 확인
        try {
          const imgResponse = await axios.head(imageUrl);
          const contentLength = imgResponse.headers['content-length'];
          const sizeInMB = contentLength ? (parseInt(contentLength) / 1024 / 1024).toFixed(2) : 'Unknown';
          
          imageSizes.push({
            url: url,
            imageUrl: imageUrl,
            sizeInMB: sizeInMB,
            resolution: extractResolution(imageUrl)
          });
          
          console.log(`  ✅ 이미지 크기: ${sizeInMB} MB`);
        } catch (err) {
          console.log(`  ❌ 이미지 크기 확인 실패`);
        }
      }
      
      // 다운로드 정보에서 크기 추출
      const sizeMatch = downloadInfo.match(/\(([^)]+)\)/);
      if (sizeMatch) {
        console.log(`  📊 다운로드 정보: ${sizeMatch[1]}`);
      }
      
    } catch (error) {
      console.error(`  ❌ 오류: ${error.message}`);
    }
    
    // 요청 간 대기
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // 통계 계산
  if (imageSizes.length > 0) {
    const sizes = imageSizes.map(img => parseFloat(img.sizeInMB)).filter(size => !isNaN(size));
    const avgSize = sizes.reduce((a, b) => a + b, 0) / sizes.length;
    
    console.log('\n📊 이미지 크기 예상:');
    console.log(`   샘플 수: ${sizes.length}개`);
    console.log(`   평균 크기: ${avgSize.toFixed(2)} MB`);
    console.log(`   최소 크기: ${Math.min(...sizes).toFixed(2)} MB`);
    console.log(`   최대 크기: ${Math.max(...sizes).toFixed(2)} MB`);
    
    // 전체 예상
    const totalArtworks = 1810;
    const estimatedTotal = avgSize * totalArtworks;
    
    console.log('\n💾 전체 용량 예상:');
    console.log(`   작품 수: ${totalArtworks}개`);
    console.log(`   예상 총 용량: ${(estimatedTotal / 1024).toFixed(2)} GB`);
    console.log(`   범위: ${(Math.min(...sizes) * totalArtworks / 1024).toFixed(2)} GB ~ ${(Math.max(...sizes) * totalArtworks / 1024).toFixed(2)} GB`);
    
    // 크기별 분류
    console.log('\n📦 권장사항:');
    console.log(`   - 원본 이미지: 평균 ${avgSize.toFixed(2)} MB`);
    console.log(`   - 썸네일 (300px): 약 0.05-0.1 MB`);
    console.log(`   - 중간 크기 (1024px): 약 0.3-0.5 MB`);
    
    const thumbnailTotal = 0.075 * totalArtworks / 1024; // 75KB 평균
    const mediumTotal = 0.4 * totalArtworks / 1024; // 400KB 평균
    
    console.log('\n💡 대안:');
    console.log(`   1. 썸네일만: 약 ${thumbnailTotal.toFixed(2)} GB`);
    console.log(`   2. 중간 크기만: 약 ${mediumTotal.toFixed(2)} GB`);
    console.log(`   3. 썸네일 + 중간: 약 ${(thumbnailTotal + mediumTotal).toFixed(2)} GB`);
  }
}

function extractResolution(url) {
  // URL에서 해상도 정보 추출 시도
  const match = url.match(/(\d+)x(\d+)/);
  if (match) {
    return `${match[1]}x${match[2]}`;
  }
  return 'Unknown';
}

estimateImageSizes().catch(console.error);