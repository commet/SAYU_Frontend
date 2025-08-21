/**
 * 🔍 Enhanced vs Full 이미지 품질 비교
 * 같은 작품의 다른 버전들 품질 차이 확인 및 업그레이드 가능성 분석
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('🔍 Enhanced vs Full 이미지 품질 비교!');
console.log('=====================================');

// 현재 컬렉션에서 샘플 작품들 추출
const currentCollectionPath = path.join(__dirname, '../artvee-crawler/validation-results/valid-cloudinary-urls.json');
let sampleArtworks = [];

function loadSampleArtworks() {
  if (!fs.existsSync(currentCollectionPath)) {
    console.log('❌ 현재 컬렉션 파일을 찾을 수 없습니다.');
    return;
  }
  
  const collection = JSON.parse(fs.readFileSync(currentCollectionPath, 'utf8'));
  
  // 다양한 작가의 대표작들 샘플링
  const targetArtists = ['Vincent van Gogh', 'Claude Monet', 'Edgar Degas', 'Caspar David Friedrich'];
  
  targetArtists.forEach(artist => {
    const artistWorks = Object.entries(collection).filter(([key, artwork]) => 
      artwork.artwork?.artist === artist
    ).slice(0, 3); // 각 작가당 3개씩
    
    sampleArtworks.push(...artistWorks);
  });
  
  console.log(`📊 샘플 작품 선정: ${sampleArtworks.length}개`);
  sampleArtworks.forEach(([key, artwork], i) => {
    console.log(`   ${i+1}. ${artwork.artwork?.title} (${artwork.artwork?.artist})`);
  });
}

function testUrl(url) {
  return new Promise((resolve) => {
    const curl = spawn('curl', ['-I', url], { stdio: 'pipe' });
    let responseData = '';
    
    curl.stdout.on('data', (data) => {
      responseData += data.toString();
    });
    
    curl.on('close', () => {
      const isWorking = responseData.includes('HTTP/1.1 200') || responseData.includes('HTTP/2 200');
      
      // 파일 크기 추출
      const sizeMatch = responseData.match(/content-length: (\d+)/i);
      const fileSize = sizeMatch ? parseInt(sizeMatch[1]) : 0;
      
      resolve({ isWorking, fileSize, response: responseData });
    });
    
    curl.stderr.on('data', () => {});
  });
}

async function compareImageVersions() {
  console.log('\n🔍 Enhanced vs Full 버전 비교...\n');
  
  const comparisons = [];
  let enhancedFound = 0;
  let qualityUpgrades = 0;
  
  for (let i = 0; i < sampleArtworks.length; i++) {
    const [key, artwork] = sampleArtworks[i];
    
    // Full 버전 URL (현재 사용중)
    const fullUrl = artwork.full?.url || artwork.url;
    if (!fullUrl) continue;
    
    // Enhanced 버전 URL 생성 (full을 enhanced로 교체)
    const enhancedUrl = fullUrl.replace('/sayu/artvee/full/', '/sayu/artvee/enhanced/');
    
    console.log(`📊 ${i+1}. ${artwork.artwork?.title}`);
    console.log(`   작가: ${artwork.artwork?.artist}`);
    
    // Full 버전 테스트
    console.log('   🔍 Full 버전 확인...');
    const fullResult = await testUrl(fullUrl);
    
    // Enhanced 버전 테스트
    console.log('   🔍 Enhanced 버전 확인...');
    const enhancedResult = await testUrl(enhancedUrl);
    
    const comparison = {
      artwork: artwork.artwork?.title,
      artist: artwork.artwork?.artist,
      key,
      full: {
        url: fullUrl,
        available: fullResult.isWorking,
        size: fullResult.fileSize
      },
      enhanced: {
        url: enhancedUrl,
        available: enhancedResult.isWorking,
        size: enhancedResult.fileSize
      }
    };
    
    if (enhancedResult.isWorking) {
      enhancedFound++;
      console.log('   ✅ Enhanced 버전 발견!');
      console.log(`      Full: ${(fullResult.fileSize / 1024 / 1024).toFixed(2)}MB`);
      console.log(`      Enhanced: ${(enhancedResult.fileSize / 1024 / 1024).toFixed(2)}MB`);
      
      if (enhancedResult.fileSize > fullResult.fileSize * 1.2) {
        qualityUpgrades++;
        comparison.upgrade = 'Enhanced 더 고화질';
        console.log('   📈 Enhanced 버전이 더 고화질!');
      } else if (enhancedResult.fileSize < fullResult.fileSize * 0.8) {
        comparison.upgrade = 'Full 더 고화질';
        console.log('   📉 Full 버전이 더 고화질');
      } else {
        comparison.upgrade = '비슷한 품질';
        console.log('   ➖ 비슷한 품질');
      }
    } else {
      console.log('   ❌ Enhanced 버전 없음');
      comparison.upgrade = 'Enhanced 없음';
    }
    
    comparisons.push(comparison);
    console.log('');
    
    // 서버 부하 방지
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // 결과 분석
  console.log('🏆 품질 비교 결과');
  console.log('=====================================');
  console.log(`📊 총 테스트: ${sampleArtworks.length}개 작품`);
  console.log(`✅ Enhanced 버전 발견: ${enhancedFound}개`);
  console.log(`📈 품질 업그레이드 가능: ${qualityUpgrades}개`);
  console.log(`📊 Enhanced 존재율: ${Math.round(enhancedFound / sampleArtworks.length * 100)}%`);
  
  if (enhancedFound > 0) {
    console.log('\n🎯 업그레이드 가능한 작품들:');
    comparisons.filter(c => c.upgrade === 'Enhanced 더 고화질').forEach(c => {
      const sizeDiff = ((c.enhanced.size - c.full.size) / c.full.size * 100).toFixed(1);
      console.log(`   ✅ ${c.artwork} (+${sizeDiff}% 크기)`);
    });
    
    // 업그레이드 스크립트 제안
    if (qualityUpgrades > 0) {
      console.log('\n🚀 자동 업그레이드 제안:');
      console.log('   1. Enhanced 폴더 전체 스캔');
      console.log('   2. 품질 비교 후 우수한 버전으로 교체');
      console.log('   3. 사용자 경험 향상 (고화질 이미지)');
      console.log(`   📈 예상 효과: ${Math.round(qualityUpgrades / sampleArtworks.length * 773)}개 작품 화질 향상`);
    }
    
    // Masters 폴더 분석도 제안
    console.log('\n🎨 Masters 컬렉션 분석도 추천:');
    console.log('   - Masters 폴더 122개는 큐레이션된 거장 작품');
    console.log('   - 품질과 중요도가 높을 가능성');
    console.log('   - 별도 분석 필요');
  }
  
  return {
    totalTested: sampleArtworks.length,
    enhancedFound,
    qualityUpgrades,
    comparisons
  };
}

async function testMastersCollection() {
  console.log('\n🎨 Masters 컬렉션 샘플 테스트...');
  
  // Masters 폴더의 몇 가지 예상 패턴 테스트
  const masterPatterns = [
    'sayu/artvee/masters/mona-lisa.jpg',
    'sayu/artvee/masters/starry-night.jpg',
    'sayu/artvee/masters/the-scream.jpg',
    'sayu/artvee/masters/guernica.jpg',
    'sayu/artvee/masters/birth-of-venus.jpg'
  ];
  
  const baseUrl = 'https://res.cloudinary.com/dkdzgpj3n/image/upload/';
  let mastersFound = 0;
  const foundMasters = [];
  
  for (const pattern of masterPatterns) {
    const url = baseUrl + pattern;
    const result = await testUrl(url);
    
    if (result.isWorking) {
      mastersFound++;
      foundMasters.push({
        url,
        size: result.fileSize,
        artwork: pattern.split('/').pop()?.replace('.jpg', '')
      });
      console.log(`   ✅ 발견: ${pattern} (${(result.fileSize / 1024 / 1024).toFixed(2)}MB)`);
    } else {
      console.log(`   ❌ 없음: ${pattern}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  console.log(`\n📊 Masters 컬렉션 발견율: ${mastersFound}/${masterPatterns.length} (${Math.round(mastersFound/masterPatterns.length*100)}%)`);
  
  return { mastersFound, foundMasters };
}

// 메인 실행
async function runQualityComparison() {
  try {
    loadSampleArtworks();
    if (sampleArtworks.length === 0) return;
    
    const comparisonResults = await compareImageVersions();
    const mastersResults = await testMastersCollection();
    
    // 종합 결론
    console.log('\n🏆 종합 결론');
    console.log('=====================================');
    
    if (comparisonResults.enhancedFound > 0) {
      console.log(`✅ Enhanced 컬렉션 활용 가치 확인`);
      console.log(`📈 예상 업그레이드 가능 작품: ${Math.round(comparisonResults.qualityUpgrades / comparisonResults.totalTested * 773)}개`);
    }
    
    if (mastersResults.mastersFound > 0) {
      console.log(`✅ Masters 컬렉션 접근 가능 확인`);
      console.log(`🎨 거장 작품들 별도 관리 필요`);
    }
    
    console.log('\n🚀 다음 단계 추천:');
    console.log('   1. Enhanced 폴더 전체 매핑');
    console.log('   2. Masters 컬렉션 완전 분석'); 
    console.log('   3. 품질 기반 자동 업그레이드 시스템');
    console.log('   4. 통합 DB 구축');
    
  } catch (error) {
    console.error('❌ 품질 비교 실행 중 오류:', error.message);
  }
}

runQualityComparison();