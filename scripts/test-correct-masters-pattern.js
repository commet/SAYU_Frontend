/**
 * 🎯 올바른 Masters URL 패턴으로 테스트
 * 발견된 패턴: v1753790141/sayu/artvee/masters/
 */

const { spawn } = require('child_process');

console.log('🎯 올바른 Masters URL 패턴 테스트!');
console.log('=====================================');

const CORRECT_PATTERN = 'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1753790141/sayu/artvee/masters/';
let discoveredArtworks = [];

// 사용자가 제공한 실제 파일명들
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
          url,
          description,
          fileSize,
          sizeMB: (fileSize / 1024 / 1024).toFixed(2),
          filename: url.split('/').pop()
        });
        
        console.log(`✅ FOUND! ${url.split('/').pop()}`);
        console.log(`    💾 ${(fileSize / 1024 / 1024).toFixed(2)}MB`);
      } else {
        console.log(`❌ Not found: ${url.split('/').pop()}`);
      }
      
      resolve(isWorking);
    });
    
    curl.stderr.on('data', () => {});
  });
}

async function testAllMastersFiles() {
  console.log('🚀 올바른 패턴으로 Masters 파일 테스트 시작...\n');
  console.log(`📁 URL 패턴: ${CORRECT_PATTERN}`);
  console.log(`📊 테스트 파일: ${MASTERS_FILES.length}개\n`);
  
  for (const filename of MASTERS_FILES) {
    const url = CORRECT_PATTERN + filename;
    await testUrl(url, `Masters: ${filename.replace('.jpg', '')}`);
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log('\n🏆 Masters 패턴 테스트 완료!');
  console.log('=====================================');
  console.log(`📊 총 테스트: ${MASTERS_FILES.length}개`);
  console.log(`✅ 성공: ${discoveredArtworks.length}개`);
  console.log(`❌ 실패: ${MASTERS_FILES.length - discoveredArtworks.length}개`);
  console.log(`📈 성공률: ${Math.round(discoveredArtworks.length / MASTERS_FILES.length * 100)}%`);
  
  if (discoveredArtworks.length > 0) {
    console.log('\n🎨 발견된 Masters 작품들:');
    discoveredArtworks.forEach((artwork, i) => {
      console.log(`   ${(i+1).toString().padStart(2)}. ${artwork.filename} (${artwork.sizeMB}MB)`);
    });
    
    console.log('\n⚡ 즉시 실행 가능:');
    console.log(`   1. ${discoveredArtworks.length}개 Masters 작품을 SAYU에 추가`);
    console.log(`   2. 거장 컬렉션으로 특별 분류`);
    console.log(`   3. 기존 773개 + Masters ${discoveredArtworks.length}개 = ${773 + discoveredArtworks.length}개`);
    
    // SAYU 통합 데이터 생성
    const sayuData = discoveredArtworks.map(artwork => ({
      id: artwork.filename.replace('.jpg', ''),
      title: artwork.filename.replace('.jpg', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      source: 'Artvee Masters Collection',
      url: artwork.url,
      fileSize: artwork.sizeMB,
      category: 'Masters',
      priority: 'High'
    }));
    
    console.log('\n📄 SAYU 통합 준비 완료:');
    sayuData.slice(0, 3).forEach(artwork => {
      console.log(`   - ${artwork.title}`);
    });
    
    return { success: true, artworks: discoveredArtworks, sayuData };
  } else {
    console.log('\n❌ Masters 작품 접근 여전히 실패');
    console.log('💡 다음 시도:');
    console.log('   - URL에서 중복 경로 확인');
    console.log('   - 다른 버전 번호 시도');
    
    return { success: false };
  }
}

// 실행
testAllMastersFiles().then(result => {
  if (result.success) {
    console.log('\n🎉 Masters 폴더 접근 성공!');
    console.log('📋 다음 단계: 이 작품들을 SAYU 컬렉션에 통합');
  }
}).catch(console.error);