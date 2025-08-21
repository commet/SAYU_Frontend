/**
 * 🧠 스마트 MET 컬렉션 발견
 * 실제 발견된 패턴을 분석해서 다른 작품들 찾기
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧠 스마트 MET 컬렉션 발견 시작!');
console.log('=====================================');

const baseUrl = 'https://res.cloudinary.com/dkdzgpj3n/image/upload/';
let discoveredUrls = [];
let totalTests = 0;

function testUrl(url, description = '') {
  return new Promise((resolve) => {
    const curl = spawn('curl', ['-I', url], { stdio: 'pipe' });
    let responseData = '';
    
    curl.stdout.on('data', (data) => {
      responseData += data.toString();
    });
    
    curl.on('close', () => {
      const isWorking = responseData.includes('HTTP/1.1 200') || responseData.includes('HTTP/2 200');
      totalTests++;
      
      if (isWorking) {
        const sizeMatch = responseData.match(/content-length: (\d+)/i);
        const fileSize = sizeMatch ? parseInt(sizeMatch[1]) : 0;
        
        discoveredUrls.push({
          url,
          description,
          fileSize,
          sizeMB: (fileSize / 1024 / 1024).toFixed(2)
        });
        
        console.log(`✅ ${totalTests.toString().padStart(3)}: FOUND! ${url} (${(fileSize / 1024 / 1024).toFixed(2)}MB)`);
        console.log(`    📝 ${description}`);
      } else {
        console.log(`❌ ${totalTests.toString().padStart(3)}: Not found: ${url}`);
      }
      
      resolve(isWorking);
    });
    
    curl.stderr.on('data', () => {});
  });
}

async function testMetVersions() {
  console.log('\n🔍 1. 다양한 버전으로 알려진 URL 테스트...\n');
  
  const knownFile = 'sayu/met-artworks/met-chicago-205641.jpg';
  
  // 다양한 버전 번호 시도
  const versions = [
    'v1752840033', // 알려진 버전
    'v1752840032', 'v1752840034', 'v1752840035',
    'v1753000000', 'v1754000000', 'v1751000000'
  ];
  
  for (const version of versions) {
    const url = `${baseUrl}${version}/${knownFile}`;
    await testUrl(url, `버전 ${version} 테스트`);
    await new Promise(resolve => setTimeout(resolve, 200));
  }
}

async function testDifferentMetPatterns() {
  console.log('\n🔍 2. 다른 MET 파일명 패턴 시도...\n');
  
  // 알려진 작동하는 버전 사용
  const workingVersion = 'v1752840033/sayu/met-artworks/';
  
  // MET에 실제 있을 법한 유명 작품들
  const metArtworks = [
    // 미국 작품들
    'met-washington-crossing-delaware',
    'met-american-gothic', 
    'met-nighthawks',
    'met-whistlers-mother',
    
    // 유럽 거장들 (MET 소장)
    'met-van-gogh-starry-night',
    'met-monet-water-lilies',
    'met-degas-ballet-class',
    'met-picasso-les-demoiselles',
    
    // ID 기반 다른 패턴들
    'met-obj-205641', 'met-obj-205640', 'met-obj-205642',
    'met-id-205641', 'met-id-123456', 'met-id-345678',
    'met-art-205641', 'met-art-100001', 'met-art-200001',
    
    // 시카고 다른 패턴들
    'chicago-art-205641', 'chicago-205641', 
    'art-chicago-205641', 'artwork-chicago-205641',
    
    // MET 부서별
    'met-american-205641', 'met-european-205641',
    'met-painting-205641', 'met-sculpture-205641',
    
    // 간단한 숫자들
    'met-1', 'met-100', 'met-1000', 'met-10000',
    'artwork-1', 'artwork-100', 'art-1', 'art-100'
  ];
  
  for (const artwork of metArtworks) {
    const url = `${baseUrl}${workingVersion}${artwork}.jpg`;
    const success = await testUrl(url, `MET 패턴: ${artwork}`);
    
    // 성공하면 비슷한 패턴들 더 시도
    if (success) {
      console.log(`   🎯 성공 패턴 발견! ${artwork} 유사 패턴 테스트...`);
      
      const basePattern = artwork.replace(/\d+$/, '');
      const numbers = ['1', '2', '10', '100', '1000', '12345'];
      
      for (const num of numbers) {
        const similarUrl = `${baseUrl}${workingVersion}${basePattern}${num}.jpg`;
        await testUrl(similarUrl, `유사 패턴: ${basePattern}${num}`);
      }
      break;
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 10개씩 발견되면 중단
    if (discoveredUrls.length >= 10) break;
  }
}

async function testDifferentFolders() {
  console.log('\n🔍 3. 다른 폴더 구조 시도...\n');
  
  const baseVersion = 'v1752840033/sayu/';
  const knownId = '205641';
  
  // 다양한 폴더 구조
  const folderPatterns = [
    'met-artworks/met-chicago-205641.jpg', // 알려진 패턴
    'met-collection/met-chicago-205641.jpg',
    'met/artworks/chicago-205641.jpg', 
    'met/chicago/205641.jpg',
    'met/american/chicago-205641.jpg',
    'met/paintings/chicago-205641.jpg',
    
    // 다른 컬렉션들
    'met-artworks/american-205641.jpg',
    'met-artworks/european-205641.jpg', 
    'met-artworks/painting-205641.jpg',
    'met-artworks/modern-205641.jpg',
    
    // 간단한 구조
    'met/205641.jpg',
    'met/met-205641.jpg',
    'artworks/met-205641.jpg',
    'collection/met-205641.jpg'
  ];
  
  for (const pattern of folderPatterns) {
    const url = `${baseUrl}${baseVersion}${pattern}`;
    const success = await testUrl(url, `폴더 구조: ${pattern}`);
    
    if (success) {
      console.log(`   🎯 새로운 폴더 구조 발견!`);
      
      // 이 폴더에서 다른 ID들도 시도
      const folderPath = pattern.replace(knownId, '{ID}');
      const testIds = ['1', '100', '1000', '205640', '205642', '300000'];
      
      for (const testId of testIds) {
        const testPattern = folderPath.replace('{ID}', testId);
        const testUrl = `${baseUrl}${baseVersion}${testPattern}`;
        await testUrl(testUrl, `같은 폴더 다른 ID: ${testId}`);
      }
      break;
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

async function analyzeCloudinaryStructure() {
  console.log('\n🔍 4. Cloudinary API 구조 분석 시도...\n');
  
  // Cloudinary의 다른 엔드포인트들
  const apiEndpoints = [
    'https://res.cloudinary.com/dkdzgpj3n/image/list/sayu.json',
    'https://res.cloudinary.com/dkdzgpj3n/image/list/met-artworks.json',
    'https://res.cloudinary.com/dkdzgpj3n/image/upload/sayu/met-artworks/.json',
    'https://api.cloudinary.com/v1_1/dkdzgpj3n/resources/search?expression=folder:sayu/met-artworks',
    
    // 다른 이미지 포맷도 시도
    'v1752840033/sayu/met-artworks/met-chicago-205641.png',
    'v1752840033/sayu/met-artworks/met-chicago-205641.webp',
    'v1752840033/sayu/met-artworks/met-chicago-205641.gif'
  ];
  
  for (const endpoint of apiEndpoints) {
    const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;
    await testUrl(url, `API/구조 분석: ${endpoint}`);
    await new Promise(resolve => setTimeout(resolve, 200));
  }
}

async function testSimilarCollections() {
  console.log('\n🔍 5. 유사한 컬렉션 이름들 시도...\n');
  
  const baseVersion = 'v1752840033/sayu/';
  
  // MET와 유사한 다른 컬렉션들
  const collections = [
    'met-collection/met-chicago-205641.jpg',
    'metropolitan/chicago-205641.jpg',
    'museum/met-chicago-205641.jpg',
    'ny-met/chicago-205641.jpg',
    'met-ny/chicago-205641.jpg',
    'met-museum/chicago-205641.jpg',
    
    // 다른 주요 미술관들 (혹시 같이 있을 수도)
    'moma/moma-205641.jpg',
    'guggenheim/guggenheim-205641.jpg', 
    'whitney/whitney-205641.jpg',
    'brooklyn/brooklyn-205641.jpg'
  ];
  
  for (const collection of collections) {
    const url = `${baseUrl}${baseVersion}${collection}`;
    await testUrl(url, `컬렉션: ${collection}`);
    await new Promise(resolve => setTimeout(resolve, 150));
  }
}

// 메인 실행
async function runSmartDiscovery() {
  try {
    console.log('🚀 스마트 발견 시작...\n');
    
    await testMetVersions();
    await testDifferentMetPatterns();
    await testDifferentFolders();
    await analyzeCloudinaryStructure(); 
    await testSimilarCollections();
    
    // 결과 분석
    console.log('\n🏆 스마트 발견 결과');
    console.log('=====================================');
    console.log(`📊 총 테스트: ${totalTests}개 URL`);
    console.log(`✅ 발견: ${discoveredUrls.length}개`);
    console.log(`📈 성공률: ${Math.round(discoveredUrls.length / totalTests * 100)}%`);
    
    if (discoveredUrls.length > 0) {
      console.log('\n🎯 발견된 새로운 URL들:');
      discoveredUrls.forEach((item, i) => {
        console.log(`   ${i+1}. ${item.url} (${item.sizeMB}MB)`);
        if (item.description) console.log(`      -> ${item.description}`);
      });
      
      // 패턴 분석
      console.log('\n📋 발견된 패턴 분석:');
      const uniquePaths = [...new Set(discoveredUrls.map(item => {
        const path = item.url.replace(baseUrl, '');
        return path.replace(/\d+/g, '{id}').replace(/v\d+\//, 'v{version}/');
      }))];
      
      uniquePaths.forEach(pattern => {
        console.log(`   ✅ ${pattern}`);
      });
      
      console.log('\n🚀 다음 단계:');
      console.log('   1. 발견된 패턴으로 대량 스캔');
      console.log('   2. 메타데이터 추출');
      console.log('   3. APT 매칭');
      console.log('   4. 기존 컬렉션 통합');
      
    } else {
      console.log('\n❌ 추가 MET 작품 발견 실패');
      console.log('\n💡 분석 결론:');
      console.log('   - met-chicago-205641.jpg는 고립된 단일 파일일 가능성');
      console.log('   - 3,715개 작품들이 완전히 다른 명명 체계를 사용');
      console.log('   - Cloudinary Media Library에서 직접 확인 필요');
      
      console.log('\n🔧 대안 방법:');
      console.log('   1. 웹 UI에서 폴더 내용 직접 확인');
      console.log('   2. 다른 파일 하나 더 찾아서 패턴 파악');
      console.log('   3. Cloudinary Management API 사용');
      console.log('   4. 현재 773개 작품 최적화에 집중');
    }
    
    // 메타데이터 확인 (알려진 URL)
    console.log('\n📊 알려진 MET 작품 메타데이터 확인:');
    const knownUrl = 'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752840033/sayu/met-artworks/met-chicago-205641.jpg';
    console.log(`   🖼️ URL: ${knownUrl}`);
    console.log(`   📏 크기: 843x603px`);
    console.log(`   💾 용량: 188KB`);
    console.log(`   🏛️ 추정: 시카고 아트 인스티튜트 소장품`);
    console.log(`   🔍 메타데이터: 현재 없음 (별도 수집 필요)`);
    
  } catch (error) {
    console.error('\n❌ 스마트 발견 중 오류:', error.message);
  }
}

runSmartDiscovery();