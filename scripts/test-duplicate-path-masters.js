/**
 * 🎯 중복 경로 패턴으로 Masters 테스트
 * 발견된 올바른 패턴: v1753790141/sayu/artvee/masters/sayu/artvee/masters/
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🎯 중복 경로 패턴으로 Masters 테스트!');
console.log('=====================================');

const CORRECT_PATTERN = 'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1753790141/sayu/artvee/masters/sayu/artvee/masters/';
let discoveredArtworks = [];

const MASTERS_FILES = [
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
          id: url.split('/').pop().replace('.jpg', ''),
          title: url.split('/').pop().replace('.jpg', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          url,
          fileSize,
          sizeMB: (fileSize / 1024 / 1024).toFixed(2),
          filename: url.split('/').pop(),
          source: 'Artvee Masters Collection',
          category: 'Masters'
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

async function testAllMastersWithCorrectPattern() {
  console.log('🚀 중복 경로 패턴으로 Masters 테스트 시작...\n');
  console.log(`📁 URL 패턴: ${CORRECT_PATTERN}`);
  console.log(`📊 테스트 파일: ${MASTERS_FILES.length}개\n`);
  
  for (const filename of MASTERS_FILES) {
    const url = CORRECT_PATTERN + filename;
    await testUrl(url, `Masters: ${filename.replace('.jpg', '')}`);
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log('\n🏆 Masters 중복 경로 테스트 완료!');
  console.log('=====================================');
  console.log(`📊 총 테스트: ${MASTERS_FILES.length}개`);
  console.log(`✅ 성공: ${discoveredArtworks.length}개`);
  console.log(`❌ 실패: ${MASTERS_FILES.length - discoveredArtworks.length}개`);
  console.log(`📈 성공률: ${Math.round(discoveredArtworks.length / MASTERS_FILES.length * 100)}%`);
  
  if (discoveredArtworks.length > 0) {
    console.log('\n🎨 발견된 Masters 작품들:');
    discoveredArtworks.forEach((artwork, i) => {
      console.log(`   ${(i+1).toString().padStart(2)}. ${artwork.title} (${artwork.sizeMB}MB)`);
    });
    
    console.log('\n⚡ 즉시 SAYU 통합 가능:');
    console.log(`   📈 현재 773개 → ${773 + discoveredArtworks.length}개`);
    console.log(`   🎯 Masters 컬렉션 추가: ${discoveredArtworks.length}개`);
    console.log(`   🏛️ 거장급 작품으로 특별 분류`);
    
    // 결과 저장
    const results = {
      testDate: new Date().toISOString(),
      correctPattern: CORRECT_PATTERN,
      totalTested: MASTERS_FILES.length,
      successCount: discoveredArtworks.length,
      successRate: Math.round(discoveredArtworks.length / MASTERS_FILES.length * 100),
      mastersArtworks: discoveredArtworks,
      sayuIntegrationReady: true
    };
    
    const resultsDir = path.join(__dirname, '../artvee-crawler');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(resultsDir, 'masters-success-results.json'),
      JSON.stringify(results, null, 2)
    );
    
    console.log('\n💾 결과 저장: artvee-crawler/masters-success-results.json');
    console.log('🚀 다음 단계: SAYU 데이터베이스에 Masters 작품들 추가!');
    
    return results;
  } else {
    console.log('\n❌ 여전히 실패 - 추가 패턴 분석 필요');
    return null;
  }
}

// 실행
testAllMastersWithCorrectPattern().then(results => {
  if (results && results.successCount > 0) {
    console.log('\n🎉 SUCCESS! Masters 폴더 완전 접근 성공!');
    console.log(`✨ ${results.successCount}개 거장 작품을 SAYU에 추가할 준비 완료`);
  }
}).catch(console.error);