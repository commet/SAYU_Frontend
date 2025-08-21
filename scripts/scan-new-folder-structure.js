/**
 * 🎯 새로운 폴더 구조 스캔
 * full/masters와 full/artvee-complete 폴더의 작품들 발견
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🎯 새로운 폴더 구조 스캔!');
console.log('=====================================');

const baseUrl = 'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752486974/sayu/artvee/full/';
let discoveredArtworks = [];
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
        
        discoveredArtworks.push({
          url,
          description,
          fileSize,
          sizeMB: (fileSize / 1024 / 1024).toFixed(2),
          folder: url.includes('/masters/') ? 'masters' : 'artvee-complete',
          filename: url.split('/').pop()
        });
        
        console.log(`✅ ${totalTests.toString().padStart(3)}: FOUND! ${url}`);
        console.log(`    💾 ${(fileSize / 1024 / 1024).toFixed(2)}MB | 📁 ${url.includes('/masters/') ? 'Masters' : 'Complete'}`);
      } else {
        console.log(`❌ ${totalTests.toString().padStart(3)}: Not found: ${url.split('/').pop()}`);
      }
      
      resolve(isWorking);
    });
    
    curl.stderr.on('data', () => {});
  });
}

async function testMastersFolder() {
  console.log('\n🎨 1. Masters 폴더 테스트...\n');
  
  // 유명한 거장 작품들 예상 파일명
  const masterArtworks = [
    'mona-lisa.jpg',
    'starry-night.jpg', 
    'water-lilies.jpg',
    'sunflowers.jpg',
    'the-scream.jpg',
    'guernica.jpg',
    'birth-of-venus.jpg',
    'last-supper.jpg',
    'girl-with-pearl-earring.jpg',
    'the-kiss.jpg',
    'american-gothic.jpg',
    'nighthawks.jpg',
    'the-great-wave.jpg',
    'persistence-of-memory.jpg',
    'creation-of-adam.jpg',
    // 숫자 패턴들
    'masters-1.jpg', 'masters-2.jpg', 'masters-3.jpg',
    '1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg'
  ];
  
  for (const artwork of masterArtworks) {
    const url = `${baseUrl}masters/${artwork}`;
    await testUrl(url, `Masters: ${artwork}`);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (discoveredArtworks.filter(a => a.folder === 'masters').length >= 5) {
      console.log('🎯 Masters에서 충분히 발견! 다음으로 이동');
      break;
    }
  }
}

async function testCompleteFolder() {
  console.log('\n📚 2. Artvee-Complete 폴더 테스트...\n');
  
  // Complete 폴더 예상 파일명들
  const completeArtworks = [
    'complete-1.jpg', 'complete-2.jpg', 'complete-3.jpg',
    'artwork-1.jpg', 'artwork-2.jpg', 'artwork-3.jpg',
    'artvee-1.jpg', 'artvee-2.jpg', 'artvee-3.jpg',
    '001.jpg', '002.jpg', '003.jpg',
    '1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg',
    // 기존 작품명들과 유사한 패턴
    'a-peasant-woman.jpg',
    'the-mona-lisa.jpg',
    'van-gogh-1.jpg',
    'monet-1.jpg'
  ];
  
  for (const artwork of completeArtworks) {
    const url = `${baseUrl}artvee-complete/${artwork}`;
    await testUrl(url, `Complete: ${artwork}`);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (discoveredArtworks.filter(a => a.folder === 'artvee-complete').length >= 5) {
      console.log('🎯 Complete에서 충분히 발견! 스캔 완료');
      break;
    }
  }
}

async function expandSuccessfulPatterns() {
  console.log('\n🚀 3. 성공 패턴 확장...\n');
  
  if (discoveredArtworks.length === 0) {
    console.log('❌ 성공한 패턴이 없어 확장 불가');
    return;
  }
  
  // 성공한 파일명 패턴 분석
  const successfulFilenames = discoveredArtworks.map(a => a.filename);
  console.log(`📊 성공한 파일명들: ${successfulFilenames.join(', ')}`);
  
  // 숫자 패턴이 성공했다면 연속으로 테스트
  const numberPattern = successfulFilenames.find(name => /^\d+\.jpg$/.test(name));
  if (numberPattern) {
    const baseNumber = parseInt(numberPattern);
    console.log(`🔍 숫자 패턴 ${baseNumber} 기반으로 확장 테스트...`);
    
    const successFolder = discoveredArtworks.find(a => a.filename === numberPattern).folder;
    
    for (let num = baseNumber + 1; num <= baseNumber + 20; num++) {
      const url = `${baseUrl}${successFolder}/${num}.jpg`;
      await testUrl(url, `확장: ${num}.jpg`);
      
      if (discoveredArtworks.length >= 20) {
        console.log('🎯 충분한 작품 발견! 확장 중단');
        break;
      }
    }
  }
  
  // 명명 패턴이 성공했다면 유사한 것들 테스트
  const namedPattern = successfulFilenames.find(name => name.includes('-'));
  if (namedPattern) {
    console.log(`🔍 명명 패턴 ${namedPattern} 기반으로 확장 테스트...`);
    
    const basePattern = namedPattern.replace(/\d+/, '');
    const successFolder = discoveredArtworks.find(a => a.filename === namedPattern).folder;
    
    for (let num = 1; num <= 10; num++) {
      const testName = basePattern.replace('.jpg', `-${num}.jpg`);
      const url = `${baseUrl}${successFolder}/${testName}`;
      await testUrl(url, `패턴 확장: ${testName}`);
    }
  }
}

// 메인 실행
async function scanNewFolderStructure() {
  try {
    console.log('🚀 새로운 폴더 구조 스캔 시작...\n');
    console.log('📁 대상 폴더:');
    console.log('   1. sayu/artvee/full/masters/ (122개 예상)');
    console.log('   2. sayu/artvee/full/artvee-complete/ (874개 예상)');
    console.log('');
    
    await testMastersFolder();
    await testCompleteFolder();
    await expandSuccessfulPatterns();
    
    // 결과 분석
    console.log('\n🏆 새로운 폴더 스캔 결과');
    console.log('=====================================');
    console.log(`📊 총 테스트: ${totalTests}개 URL`);
    console.log(`✅ 발견: ${discoveredArtworks.length}개`);
    console.log(`📈 성공률: ${Math.round(discoveredArtworks.length / totalTests * 100)}%`);
    
    if (discoveredArtworks.length > 0) {
      const masterCount = discoveredArtworks.filter(a => a.folder === 'masters').length;
      const completeCount = discoveredArtworks.filter(a => a.folder === 'artvee-complete').length;
      
      console.log('\n📁 폴더별 발견 현황:');
      console.log(`   🎨 Masters: ${masterCount}개`);
      console.log(`   📚 Complete: ${completeCount}개`);
      
      console.log('\n🎯 발견된 작품들:');
      discoveredArtworks.forEach((artwork, i) => {
        console.log(`   ${(i+1).toString().padStart(2)}. [${artwork.folder.toUpperCase()}] ${artwork.filename} (${artwork.sizeMB}MB)`);
      });
      
      console.log('\n🚀 즉시 실행 가능:');
      console.log(`   1. ${discoveredArtworks.length}개 새로운 작품을 SAYU에 추가`);
      console.log(`   2. 기존 773개 + 새로운 ${discoveredArtworks.length}개 = ${773 + discoveredArtworks.length}개 총 컬렉션`);
      console.log(`   3. 성공한 패턴으로 전체 폴더 스캔`);
      console.log(`   4. Masters 작품들을 "거장 컬렉션"으로 특별 분류`);
      
      // 예상 확장 가능성
      if (masterCount > 0) {
        console.log(`\n📈 Masters 폴더 확장 가능성:`);
        console.log(`   - 현재 ${masterCount}개 발견`);
        console.log(`   - 예상 총 122개 중 ${Math.round(masterCount/122*100)}% 접근 가능`);
        console.log(`   - 전체 스캔시 약 ${Math.round(122 * masterCount / Math.max(1, masterCount))}개 추가 가능`);
      }
      
      if (completeCount > 0) {
        console.log(`\n📈 Complete 폴더 확장 가능성:`);
        console.log(`   - 현재 ${completeCount}개 발견`);
        console.log(`   - 예상 총 874개 중 ${Math.round(completeCount/874*100)}% 접근 가능`);
        console.log(`   - 전체 스캔시 약 ${Math.round(874 * completeCount / Math.max(1, completeCount))}개 추가 가능`);
      }
      
    } else {
      console.log('\n❌ 새로운 폴더에서 작품 발견 실패');
      console.log('💡 가능한 원인:');
      console.log('   1. 파일명 패턴이 예상과 다름');
      console.log('   2. 폴더 구조가 더 복잡함');
      console.log('   3. 버전 번호가 다름');
      
      console.log('\n🔧 해결 방안:');
      console.log('   1. Cloudinary Media Library에서 실제 파일명 몇 개 확인');
      console.log('   2. 다른 버전 번호들 시도');
      console.log('   3. 브라우저 Network 탭으로 실제 요청 URL 확인');
    }
    
    // 결과 저장
    const results = {
      scanDate: new Date().toISOString(),
      totalTested: totalTests,
      totalFound: discoveredArtworks.length,
      byFolder: {
        masters: discoveredArtworks.filter(a => a.folder === 'masters').length,
        complete: discoveredArtworks.filter(a => a.folder === 'artvee-complete').length
      },
      discoveredArtworks,
      nextSteps: discoveredArtworks.length > 0 ? 'Ready for SAYU integration' : 'Need pattern discovery'
    };
    
    const resultsDir = path.join(__dirname, '../artvee-crawler/new-folder-scan');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(resultsDir, 'new-folder-scan-results.json'),
      JSON.stringify(results, null, 2)
    );
    
    console.log('\n💾 결과 저장: new-folder-scan/new-folder-scan-results.json');
    
  } catch (error) {
    console.error('❌ 폴더 스캔 중 오류:', error.message);
  }
}

scanNewFolderStructure();