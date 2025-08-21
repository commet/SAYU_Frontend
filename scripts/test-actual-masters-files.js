/**
 * 🎨 실제 Masters 파일명으로 테스트
 * 사용자가 제공한 실제 파일명들로 URL 접근 테스트
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🎨 실제 Masters 파일명으로 테스트!');
console.log('=====================================');

const baseUrl = 'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752486974/sayu/artvee/full/masters/';
let discoveredArtworks = [];

// 사용자가 제공한 실제 파일명들
const ACTUAL_MASTERS_FILES = [
  'portrait-after-a-costume-ball-portrait-of-madame-dietz-monnin.jpg',
  'roses-5.jpg',
  'charing-cross-bridge.jpg',
  'on-the-stage.jpg',
  'grapes-lemons-pears-and-apples.jpg',
  'wheat-field-with-cypresses.jpg',
  'mademoiselle-malo.jpg',
  'madame-rene-de-gas.jpg',
  'vineyards-at-auvers.jpg',
  'madame-camus.jpg',
  'the-terrace-at-saint-germain-spring.jpg',
  'harlequin.jpg',
  'girl-in-red.jpg'
];

function testUrl(url, description = '') {
  return new Promise((resolve) => {
    const curl = spawn('curl', ['-I', url], { stdio: 'pipe' });
    let responseData = '';
    
    curl.stdout.on('data', (data) => {
      responseData += data.toString();
    });
    
    curl.on('close', () => {
      const isWorking = responseData.includes('HTTP/1.1 200') || responseData.includes('HTTP/2 200');
      
      if (isWorking) {
        const sizeMatch = responseData.match(/content-length: (\d+)/i);
        const fileSize = sizeMatch ? parseInt(sizeMatch[1]) : 0;
        
        discoveredArtworks.push({
          url,
          description,
          fileSize,
          sizeMB: (fileSize / 1024 / 1024).toFixed(2),
          filename: url.split('/').pop()
        });
        
        console.log(`✅ FOUND! ${url.split('/').pop()}`);
        console.log(`    💾 ${(fileSize / 1024 / 1024).toFixed(2)}MB | 🎨 ${description}`);
      } else {
        console.log(`❌ Not found: ${url.split('/').pop()}`);
      }
      
      resolve(isWorking);
    });
    
    curl.stderr.on('data', () => {});
  });
}

async function testActualMastersFiles() {
  console.log('🚀 실제 Masters 파일명 테스트 시작...\n');
  console.log(`📁 테스트 경로: ${baseUrl}`);
  console.log(`📊 테스트 파일: ${ACTUAL_MASTERS_FILES.length}개\n`);
  
  for (const filename of ACTUAL_MASTERS_FILES) {
    const url = baseUrl + filename;
    await testUrl(url, `Masters: ${filename.replace('.jpg', '')}`);
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log('\n🏆 Masters 파일 테스트 완료!');
  console.log('=====================================');
  console.log(`📊 총 테스트: ${ACTUAL_MASTERS_FILES.length}개`);
  console.log(`✅ 성공: ${discoveredArtworks.length}개`);
  console.log(`❌ 실패: ${ACTUAL_MASTERS_FILES.length - discoveredArtworks.length}개`);
  console.log(`📈 성공률: ${Math.round(discoveredArtworks.length / ACTUAL_MASTERS_FILES.length * 100)}%`);
  
  if (discoveredArtworks.length > 0) {
    console.log('\n🎨 발견된 Masters 작품들:');
    discoveredArtworks.forEach((artwork, i) => {
      console.log(`   ${(i+1).toString().padStart(2)}. ${artwork.filename} (${artwork.sizeMB}MB)`);
    });
    
    console.log('\n⚡ 즉시 실행 가능:');
    console.log(`   1. ${discoveredArtworks.length}개 Masters 작품을 SAYU에 추가`);
    console.log(`   2. 거장 컬렉션으로 특별 분류`);
    console.log(`   3. 기존 773개 + Masters ${discoveredArtworks.length}개 = ${773 + discoveredArtworks.length}개`);
    console.log(`   4. 성공한 패턴으로 전체 122개 Masters 스캔`);
    
    return true;
  } else {
    console.log('\n❌ Masters 파일 접근 실패');
    console.log('💡 가능한 원인:');
    console.log('   - 버전 번호가 다를 수 있음');
    console.log('   - 폴더 경로가 다를 수 있음');
    console.log('   - 파일 확장자가 다를 수 있음');
    
    return false;
  }
}

async function tryDifferentVersions() {
  console.log('\n🔍 다른 버전 번호들 시도...\n');
  
  const versions = [
    'v1752486974', // 현재 사용 중
    'v1752486979', // 기존 작업 버전
    'v1752487860', // 다른 발견된 버전
    'v1752490798', // 또 다른 버전
    '' // 버전 없이
  ];
  
  const testFile = ACTUAL_MASTERS_FILES[0]; // 첫 번째 파일로 테스트
  
  for (const version of versions) {
    const versionPath = version ? `${version}/` : '';
    const url = `https://res.cloudinary.com/dkdzgpj3n/image/upload/${versionPath}sayu/artvee/full/masters/${testFile}`;
    
    console.log(`🔍 버전 테스트: ${version || '버전없음'}`);
    const success = await testUrl(url, `버전 ${version} 테스트`);
    
    if (success) {
      console.log(`✅ 성공! 버전 ${version}에서 접근 가능`);
      console.log(`🚀 이 버전으로 모든 Masters 파일 테스트...`);
      
      const successfulBaseUrl = `https://res.cloudinary.com/dkdzgpj3n/image/upload/${versionPath}sayu/artvee/full/masters/`;
      
      // 성공한 버전으로 모든 파일 테스트
      for (const filename of ACTUAL_MASTERS_FILES.slice(1)) { // 첫 번째는 이미 테스트했으니 제외
        const successUrl = successfulBaseUrl + filename;
        await testUrl(successUrl, `성공 버전: ${filename}`);
      }
      
      break;
    }
    
    await new Promise(resolve => setTimeout(resolve, 300));
  }
}

// 메인 실행
async function testMastersWithActualFiles() {
  try {
    const success = await testActualMastersFiles();
    
    if (!success) {
      await tryDifferentVersions();
    }
    
    // 최종 결과
    console.log('\n🎯 최종 Masters 테스트 결과');
    console.log('=====================================');
    
    if (discoveredArtworks.length > 0) {
      console.log('🎉 Masters 폴더 접근 성공!');
      console.log(`📈 발견된 작품: ${discoveredArtworks.length}개`);
      console.log(`🎨 총 예상 Masters: 122개`);
      console.log(`📊 현재 발견률: ${Math.round(discoveredArtworks.length / 122 * 100)}%`);
      
      // SAYU 통합 준비
      console.log('\n🚀 SAYU 통합 준비:');
      const sayuData = discoveredArtworks.map(artwork => ({
        id: artwork.filename.replace('.jpg', ''),
        title: artwork.filename.replace('.jpg', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        source: 'Artvee Masters Collection',
        url: artwork.url,
        fileSize: artwork.sizeMB,
        category: 'Masters',
        priority: 'High'
      }));
      
      console.log('   📄 변환된 작품들:');
      sayuData.slice(0, 5).forEach(artwork => {
        console.log(`      - ${artwork.title}`);
      });
      
      // 결과 저장
      const results = {
        testDate: new Date().toISOString(),
        totalTested: ACTUAL_MASTERS_FILES.length,
        successCount: discoveredArtworks.length,
        successRate: Math.round(discoveredArtworks.length / ACTUAL_MASTERS_FILES.length * 100),
        discoveredArtworks,
        sayuIntegrationData: sayuData
      };
      
      const resultsDir = path.join(__dirname, '../artvee-crawler/masters-integration');
      if (!fs.existsSync(resultsDir)) {
        fs.mkdirSync(resultsDir, { recursive: true });
      }
      
      fs.writeFileSync(
        path.join(resultsDir, 'masters-test-results.json'),
        JSON.stringify(results, null, 2)
      );
      
      console.log('\n💾 결과 저장: masters-integration/masters-test-results.json');
      console.log('📋 다음 단계: 이 데이터로 SAYU 컬렉션 확장!');
      
    } else {
      console.log('❌ Masters 폴더 접근 여전히 실패');
      console.log('🔧 추가 시도 방법:');
      console.log('   1. Cloudinary Media Library에서 실제 URL 확인');
      console.log('   2. 파일 확장자 다른 것들 시도 (.png, .jpeg 등)');
      console.log('   3. 폴더 경로 재확인');
    }
    
  } catch (error) {
    console.error('❌ Masters 테스트 중 오류:', error.message);
  }
}

testMastersWithActualFiles();