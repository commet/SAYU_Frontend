/**
 * 🔍 고급 URL 발견 시스템
 * 다양한 방법으로 숨겨진 Cloudinary 자산들의 URL 패턴 발견
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 고급 URL 발견 시스템 시작!');
console.log('====================================');

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
        
        console.log(`✅ ${totalTests.toString().padStart(3)}: FOUND! ${url} (${(fileSize / 1024 / 1024).toFixed(2)}MB) ${description ? `- ${description}` : ''}`);
      } else {
        console.log(`❌ ${totalTests.toString().padStart(3)}: Not found: ${url} ${description ? `- ${description}` : ''}`);
      }
      
      resolve(isWorking);
    });
    
    curl.stderr.on('data', () => {});
  });
}

// 1. 다양한 Cloudinary 변형 URL 시도
async function tryCloudinaryVariations() {
  console.log('\n🔧 1. Cloudinary URL 변형 시도...');
  
  const variations = [
    // 다른 버전들
    'v1752486974', 'v1753788759', 'v1753790055',
    // 변형 매개변수들
    'c_fill,w_800,h_600', 'q_80', 'f_auto',
    // 다른 포맷들  
    'fl_progressive', 'dpr_2.0'
  ];
  
  // 알려진 작동하는 작품으로 테스트
  const knownArtwork = 'a-peasant-woman-digging-in-front-of-her-cottage';
  
  for (const variation of variations) {
    const testUrls = [
      `${baseUrl}${variation}/sayu/artvee/enhanced/${knownArtwork}.jpg`,
      `${baseUrl}sayu/artvee/enhanced/${variation}/${knownArtwork}.jpg`,
      `${baseUrl}sayu/artvee/enhanced/${knownArtwork}.jpg?${variation}`
    ];
    
    for (const url of testUrls) {
      await testUrl(url, `변형 테스트: ${variation}`);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
}

// 2. MET 컬렉션 체계적 패턴 탐색
async function systematicMETSearch() {
  console.log('\n🏛️ 2. MET 컬렉션 체계적 탐색...');
  
  // MET 객체 ID 기반 패턴들 (실제 MET에서 사용하는 형식)
  const metPatterns = [
    // MET Object ID 형식 (실제 박물관에서 사용)
    'sayu/met-artworks/{id}.jpg',
    'sayu/met-artworks/obj_{id}.jpg', 
    'sayu/met-artworks/met_{id}.jpg',
    'sayu/met-artworks/object_{id}.jpg',
    
    // 부서별 분류
    'sayu/met-artworks/paintings/{id}.jpg',
    'sayu/met-artworks/european/{id}.jpg',
    'sayu/met-artworks/american/{id}.jpg',
    'sayu/met-artworks/asian/{id}.jpg',
    'sayu/met-artworks/modern/{id}.jpg',
    
    // 연도별 분류
    'sayu/met-artworks/1800s/{id}.jpg',
    'sayu/met-artworks/1900s/{id}.jpg',
    
    // 작가별 분류
    'sayu/met-artworks/van-gogh/{id}.jpg',
    'sayu/met-artworks/monet/{id}.jpg',
    'sayu/met-artworks/picasso/{id}.jpg'
  ];
  
  // MET의 실제 Object ID 범위는 1-1000000+ 이므로 샘플링
  const sampleIds = [
    // 낮은 번호들
    '1', '10', '100', '1000', '10000',
    // 일반적인 범위
    '45734', '123456', '234567', '345678', '456789',
    // 높은 번호들  
    '500000', '600000', '700000', '800000', '900000',
    // 패딩된 형식들
    '001', '0001', '00001', '000001'
  ];
  
  for (const pattern of metPatterns.slice(0, 5)) { // 처음 5개 패턴만 테스트
    console.log(`\n🔍 패턴 테스트: ${pattern}`);
    
    for (const id of sampleIds.slice(0, 8)) { // 각 패턴당 8개씩
      const url = baseUrl + pattern.replace('{id}', id);
      const success = await testUrl(url, `MET ID ${id}`);
      
      // 성공하면 주변 ID들도 테스트
      if (success) {
        console.log(`   🎯 성공! 주변 ID들 테스트...`);
        const numId = parseInt(id.replace(/^0+/, '') || '0');
        
        for (let adjacent = numId + 1; adjacent <= numId + 5; adjacent++) {
          const adjacentUrl = baseUrl + pattern.replace('{id}', adjacent.toString());
          await testUrl(adjacentUrl, `인접 ID ${adjacent}`);
        }
        break; // 이 패턴에서 성공했으므로 다음 패턴으로
      }
      
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    if (discoveredUrls.length >= 20) {
      console.log('✅ 충분한 URL 발견, 테스트 중단');
      break;
    }
  }
}

// 3. 알려진 유명 작품명으로 역추적
async function famousArtworkReverse() {
  console.log('\n🎨 3. 유명 작품명 역추적...');
  
  // 실제 MET 소장 유명 작품들
  const famousMetArtworks = [
    'washington-crossing-delaware',
    'self-portrait-straw-hat',
    'the-harvesters', 
    'young-mother-sewing',
    'madame-x',
    'the-death-of-socrates',
    'venus-and-adonis',
    'aristotle-bust-homer',
    'autumn-rhythm',
    'cypress-trees'
  ];
  
  const folders = [
    'sayu/met-artworks/',
    'sayu/met-artworks/paintings/',
    'sayu/met-artworks/american/',
    'sayu/met-artworks/european/'
  ];
  
  for (const artwork of famousMetArtworks) {
    for (const folder of folders) {
      const variations = [
        `${folder}${artwork}.jpg`,
        `${folder}${artwork}-1.jpg`,
        `${folder}${artwork}_met.jpg`,
        `${folder}${artwork.replace(/-/g, '_')}.jpg`
      ];
      
      for (const variation of variations) {
        await testUrl(baseUrl + variation, `유명작품: ${artwork}`);
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
    if (discoveredUrls.length >= 10) break;
  }
}

// 4. 기존 작업에서 힌트 찾기
async function analyzeExistingPatterns() {
  console.log('\n🔍 4. 기존 패턴 분석...');
  
  // 현재 작동하는 URL들의 패턴 분석
  const currentUrls = [
    'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752486974/sayu/artvee/full/a-peasant-woman-digging-in-front-of-her-cottage.jpg',
    'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752486979/sayu/artvee/full/adeline-ravoux.jpg'
  ];
  
  // 버전 번호 추출 및 주변 버전들 테스트
  for (const url of currentUrls) {
    const versionMatch = url.match(/v(\d+)/);
    if (versionMatch) {
      const version = parseInt(versionMatch[1]);
      const basePath = url.replace(/v\d+/, 'v{VERSION}').replace('/full/', '/{FOLDER}/');
      
      // 비슷한 버전 번호들로 다른 폴더 테스트
      const similarVersions = [version - 1000, version + 1000, version - 10000, version + 10000];
      const folders = ['enhanced', 'masters', 'met-artworks'];
      
      for (const testVersion of similarVersions) {
        for (const folder of folders) {
          const testUrl = basePath
            .replace('{VERSION}', testVersion.toString())
            .replace('{FOLDER}', folder);
          
          await testUrl(testUrl, `버전 분석: v${testVersion}, ${folder}`);
        }
      }
    }
  }
}

// 5. Cloudinary API 직접 시도 (관리 API)
async function tryCloudinaryAPI() {
  console.log('\n🔧 5. Cloudinary Management API 시도...');
  
  // 공개적으로 접근 가능한 정보 수집 시도
  const apiUrls = [
    'https://api.cloudinary.com/v1_1/dkdzgpj3n/resources/search',
    'https://res.cloudinary.com/dkdzgpj3n/image/list/sayu.json',
    'https://res.cloudinary.com/dkdzgpj3n/folder/list/sayu.json'
  ];
  
  for (const apiUrl of apiUrls) {
    await testUrl(apiUrl, 'API 접근 시도');
  }
}

// 메인 실행
async function runAdvancedDiscovery() {
  try {
    console.log('🚀 고급 발견 시스템 시작...\n');
    
    await tryCloudinaryVariations();
    await systematicMETSearch();
    await famousArtworkReverse();
    await analyzeExistingPatterns();
    await tryCloudinaryAPI();
    
    // 결과 분석
    console.log('\n🏆 고급 발견 결과');
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
      const patterns = discoveredUrls.map(item => {
        const path = item.url.replace(baseUrl, '');
        return path.replace(/\/[^\/]+\.jpg$/, '/{filename}.jpg');
      });
      
      const uniquePatterns = [...new Set(patterns)];
      console.log('\n📋 발견된 새로운 패턴들:');
      uniquePatterns.forEach(pattern => {
        console.log(`   ✅ ${pattern}`);
      });
      
      // 자동 확장 제안
      console.log('\n🚀 자동 확장 가능성:');
      if (discoveredUrls.some(u => u.url.includes('/met-artworks/'))) {
        console.log('   🎯 MET 컬렉션 접근 가능! 대량 스캔 시작 가능');
      }
      if (discoveredUrls.some(u => u.url.includes('/enhanced/'))) {
        console.log('   📈 Enhanced 폴더 접근 가능! 화질 업그레이드 가능');
      }
      
    } else {
      console.log('\n💡 대안 방법 제안:');
      console.log('   1. Cloudinary 계정 관리자에게 API 키 요청');
      console.log('   2. 다른 CDN 엔드포인트 확인');
      console.log('   3. 웹 스크래핑으로 실제 파일명 수집');
      console.log('   4. MET 공식 API 활용 (collection.metmuseum.org)');
    }
    
    // 결과 저장
    if (discoveredUrls.length > 0) {
      const resultsDir = path.join(__dirname, '../artvee-crawler/url-discovery');
      if (!fs.existsSync(resultsDir)) {
        fs.mkdirSync(resultsDir, { recursive: true });
      }
      
      fs.writeFileSync(
        path.join(resultsDir, 'discovered-urls.json'),
        JSON.stringify({
          discoveryDate: new Date().toISOString(),
          totalTested: totalTests,
          successCount: discoveredUrls.length,
          discoveredUrls,
          patterns: uniquePatterns
        }, null, 2)
      );
      
      console.log('\n💾 결과 저장: url-discovery/discovered-urls.json');
    }
    
  } catch (error) {
    console.error('\n❌ 발견 시스템 실행 중 오류:', error.message);
  }
}

runAdvancedDiscovery();