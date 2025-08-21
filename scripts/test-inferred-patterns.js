/**
 * 🧪 MET API 정보 기반 파일명 패턴 테스트
 * API에서 얻은 정보로 추론한 Cloudinary 파일명들 검증
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 MET API 기반 파일명 패턴 테스트');
console.log('=====================================');

const baseUrl = 'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752840033/sayu/met-artworks/';
let discoveredUrls = [];
let totalTests = 0;

// MET API에서 확인된 Object ID들과 정보
const KNOWN_OBJECTS = {
  205641: {
    title: 'Scapin',
    artist: 'Bow Porcelain Factory',
    department: 'European Sculpture and Decorative Arts',
    classification: 'Ceramics-Porcelain',
    date: '1750–55'
  },
  205640: {
    title: 'An urn overflowing with fruit and flowers',
    artist: 'Derby Porcelain Manufactory',
    department: 'European Sculpture and Decorative Arts', 
    classification: 'Ceramics-Porcelain',
    date: 'ca. 1825'
  },
  205639: {
    title: 'Covered vase (one of a pair)',
    artist: 'Worcester factory',
    department: 'European Sculpture and Decorative Arts',
    classification: 'Ceramics-Porcelain', 
    date: 'ca. 1765'
  },
  205642: {
    title: 'Virgin and Child',
    artist: 'Chelsea Porcelain Manufactory',
    department: 'European Sculpture and Decorative Arts',
    classification: 'Ceramics-Porcelain',
    date: 'ca. 1755'
  },
  205643: {
    title: 'William Augustus, Duke of Cumberland',
    artist: 'Chelsea Porcelain Manufactory', 
    department: 'European Sculpture and Decorative Arts',
    classification: 'Ceramics-Porcelain',
    date: 'ca. 1749–52'
  }
};

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
          sizeMB: (fileSize / 1024 / 1024).toFixed(2),
          objectId: url.match(/(\d+)\.jpg$/)?.[1]
        });
        
        console.log(`✅ ${totalTests.toString().padStart(3)}: FOUND! ${url}`);
        console.log(`    📏 ${(fileSize / 1024 / 1024).toFixed(2)}MB | 🎯 ${description}`);
      } else {
        console.log(`❌ ${totalTests.toString().padStart(3)}: Not found: ${url}`);
      }
      
      resolve(isWorking);
    });
    
    curl.stderr.on('data', () => {});
  });
}

async function testDepartmentPatterns() {
  console.log('\n🏛️ 1. 부서 기반 패턴 테스트...\n');
  
  // "european"이나 "ceramics" 등으로 축약된 패턴들
  const deptPatterns = [
    'met-european-{id}.jpg',
    'met-ceramics-{id}.jpg', 
    'met-porcelain-{id}.jpg',
    'met-sculpture-{id}.jpg',
    'met-decorative-{id}.jpg'
  ];
  
  const testIds = [205640, 205639, 205642, 205643, 205644];
  
  for (const pattern of deptPatterns) {
    console.log(`🔍 패턴 테스트: ${pattern}`);
    
    let patternSuccess = false;
    for (const id of testIds) {
      const filename = pattern.replace('{id}', id);
      const url = baseUrl + filename;
      const success = await testUrl(url, `부서 패턴: ${pattern}, ID: ${id}`);
      
      if (success) {
        patternSuccess = true;
        console.log(`   🎯 성공! 이 패턴으로 더 많은 ID 테스트...`);
        
        // 성공한 패턴으로 더 넓은 범위 테스트
        const extendedIds = [205635, 205636, 205637, 205638, 205645, 205646, 205647, 205648, 205649, 205650];
        for (const extId of extendedIds) {
          const extFilename = pattern.replace('{id}', extId);
          const extUrl = baseUrl + extFilename;
          await testUrl(extUrl, `확장 테스트: ${extId}`);
        }
        break;
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    if (patternSuccess) break;
    if (discoveredUrls.length >= 10) break;
  }
}

async function testSimplePatterns() {
  console.log('\n🔢 2. 단순 패턴 테스트...\n');
  
  // 더 간단한 패턴들
  const simplePatterns = [
    'met-obj-{id}.jpg',
    'met-art-{id}.jpg', 
    'met-{id}.jpg',
    'obj-{id}.jpg',
    'art-{id}.jpg',
    '{id}.jpg'  // 단순히 숫자만
  ];
  
  const testIds = [205640, 205639, 205642, 205641]; // 알려진 유효 ID들
  
  for (const pattern of simplePatterns) {
    console.log(`🔍 단순 패턴 테스트: ${pattern}`);
    
    for (const id of testIds) {
      const filename = pattern.replace('{id}', id);
      const url = baseUrl + filename;
      const success = await testUrl(url, `단순 패턴: ${pattern}, ID: ${id}`);
      
      if (success) {
        console.log(`   🎯 단순 패턴 성공! 대량 스캔 가능`);
        
        // 성공하면 더 넓은 ID 범위로 테스트
        const wideIds = Array.from({length: 20}, (_, i) => 205630 + i);
        for (const wideId of wideIds) {
          const wideFilename = pattern.replace('{id}', wideId);
          const wideUrl = baseUrl + wideFilename;
          await testUrl(wideUrl, `대량 스캔: ${wideId}`);
          
          if (discoveredUrls.length >= 20) break;
        }
        break;
      }
      
      await new Promise(resolve => setTimeout(resolve, 150));
    }
    
    if (discoveredUrls.length >= 10) break;
  }
}

async function testLocationBasedPatterns() {
  console.log('\n🌍 3. 지역/컬렉션 기반 패턴 테스트...\n');
  
  // "chicago"가 실제로 뭘 의미하는지 다시 생각해보기
  // 1. 시카고 아트 인스티튜트에서 온 작품?
  // 2. 시카고 관련 주제?
  // 3. 다른 의미?
  
  const locationPatterns = [
    // 다른 주요 미국 도시들
    'met-newyork-{id}.jpg',
    'met-boston-{id}.jpg', 
    'met-philadelphia-{id}.jpg',
    
    // 유럽 도시들 (도자기 제작지)
    'met-london-{id}.jpg',
    'met-worcester-{id}.jpg', // Worcester factory가 있었으니
    'met-chelsea-{id}.jpg',   // Chelsea Porcelain이 있었으니
    'met-bow-{id}.jpg',       // Bow Porcelain이 있었으니
    'met-derby-{id}.jpg',     // Derby Porcelain이 있었으니
    
    // 제작 공장명 기반
    'met-factory-{id}.jpg',
    'met-manufactory-{id}.jpg'
  ];
  
  const testIds = [205641, 205640, 205642]; // 핵심 ID들만
  
  for (const pattern of locationPatterns) {
    console.log(`🔍 지역 패턴 테스트: ${pattern}`);
    
    for (const id of testIds) {
      const filename = pattern.replace('{id}', id);
      const url = baseUrl + filename;
      const success = await testUrl(url, `지역 패턴: ${pattern.replace('-{id}.jpg', '')}, ID: ${id}`);
      
      if (success) {
        console.log(`   🎯 지역 패턴 발견! 이것이 실제 명명 규칙일 수 있음`);
        
        // 성공한 지역으로 더 많은 ID 테스트
        const extendedIds = Array.from({length: 15}, (_, i) => 205635 + i);
        for (const extId of extendedIds) {
          const extFilename = pattern.replace('{id}', extId);
          const extUrl = baseUrl + extFilename;
          await testUrl(extUrl, `지역 확장: ${extId}`);
        }
        break;
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    if (discoveredUrls.length >= 15) break;
  }
}

async function analyzeResults() {
  console.log('\n📊 결과 분석 및 메타데이터 매칭');
  console.log('=====================================');
  
  if (discoveredUrls.length > 0) {
    console.log(`✅ 발견된 새로운 작품: ${discoveredUrls.length}개\n`);
    
    discoveredUrls.forEach((artwork, i) => {
      const objectId = artwork.objectId;
      const knownInfo = KNOWN_OBJECTS[objectId];
      
      console.log(`${i+1}. ${artwork.url}`);
      console.log(`   💾 크기: ${artwork.sizeMB}MB`);
      
      if (knownInfo) {
        console.log(`   🎨 작품: ${knownInfo.title}`);
        console.log(`   👨‍🎨 작가: ${knownInfo.artist}`);
        console.log(`   🏛️ 부서: ${knownInfo.department}`);
        console.log(`   📅 연도: ${knownInfo.date}`);
        console.log(`   🔖 분류: ${knownInfo.classification}`);
      } else {
        console.log(`   ❓ 메타데이터: Object ID ${objectId} 정보 없음`);
      }
      console.log('');
    });
    
    // 패턴 분석
    const patterns = [...new Set(discoveredUrls.map(artwork => {
      return artwork.url.replace(baseUrl, '').replace(/\d+/g, '{id}');
    }))];
    
    console.log('📋 발견된 성공 패턴:');
    patterns.forEach(pattern => {
      const count = discoveredUrls.filter(art => 
        art.url.includes(pattern.replace('{id}', ''))
      ).length;
      console.log(`   ✅ ${pattern} (${count}개 작품)`);
    });
    
    // 확장 전략
    console.log('\n🚀 확장 전략:');
    console.log(`1. 발견된 패턴으로 전체 MET ID 범위 스캔 (1~497,397)`);
    console.log(`2. 각 발견 작품의 MET API 메타데이터 자동 수집`);
    console.log(`3. APT 유형별 자동 분류 (도자기 → 세련된 유형들)`);
    console.log(`4. 기존 773개 Artvee 컬렉션과 통합`);
    console.log(`📈 예상 최종 컬렉션: ${773 + discoveredUrls.length * 1000}+개 (대략 추정)`);
    
  } else {
    console.log('❌ 추가 작품 발견 실패');
    console.log('\n🤔 분석:');
    console.log('   - met-chicago-205641.jpg는 정말 고립된 파일일 수 있음');
    console.log('   - 3,715개 파일들이 완전히 다른 명명 체계 사용');
    console.log('   - Cloudinary 웹 UI에서 직접 확인이 가장 확실한 방법');
    
    console.log('\n💡 대안:');
    console.log('   1. 현재 773개 Artvee 컬렉션 최적화에 집중');
    console.log('   2. Enhanced/Masters 폴더 접근 방법 연구'); 
    console.log('   3. 다른 무료 미술관 API 통합 (구글 아트, 위키미디어)');
  }
}

// 메인 실행
async function runPatternTest() {
  try {
    console.log('🚀 MET 패턴 테스트 시작...\n');
    console.log(`📋 기준 정보: ${Object.keys(KNOWN_OBJECTS).length}개 Object ID의 메타데이터 확보`);
    console.log(`🎯 목표: 3,715개 MET 파일 중 실제 접근 가능한 것들 발견\n`);
    
    await testDepartmentPatterns();
    await testSimplePatterns();
    await testLocationBasedPatterns();
    await analyzeResults();
    
    // 결과 저장
    const results = {
      testDate: new Date().toISOString(),
      totalTested: totalTests,
      successCount: discoveredUrls.length,
      successRate: Math.round(discoveredUrls.length / totalTests * 100),
      discoveredArtworks: discoveredUrls,
      knownMetadata: KNOWN_OBJECTS,
      patterns: [...new Set(discoveredUrls.map(art => 
        art.url.replace(baseUrl, '').replace(/\d+/g, '{id}')
      ))]
    };
    
    const resultsDir = path.join(__dirname, '../artvee-crawler/met-pattern-test');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(resultsDir, 'pattern-test-results.json'),
      JSON.stringify(results, null, 2)
    );
    
    console.log('\n💾 결과 저장: met-pattern-test/pattern-test-results.json');
    
  } catch (error) {
    console.error('❌ 패턴 테스트 중 오류:', error.message);
  }
}

runPatternTest();