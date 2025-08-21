/**
 * 🏛️ MET 컬렉션 첫 100개 작품 테스트
 * 메트로폴리탄 미술관 작품들이 실제로 접근 가능한지 확인
 */

const { spawn } = require('child_process');

console.log('🏛️ MET 컬렉션 테스트 시작!');
console.log('================================');

// MET 컬렉션 예상 URL 패턴들 테스트
const testPatterns = [
  // 일반적인 패턴들
  'sayu/met-artworks/met-{id}.jpg',
  'sayu/met-artworks/{id}.jpg', 
  'sayu/met-artworks/artwork-{id}.jpg',
  'sayu/met-artworks/met-artwork-{id}.jpg',
  // 특별한 패턴들
  'sayu/met-artworks/paintings/{id}.jpg',
  'sayu/met-artworks/sculptures/{id}.jpg',
  'sayu/met-artworks/american/{id}.jpg',
  'sayu/met-artworks/european/{id}.jpg'
];

const baseUrl = 'https://res.cloudinary.com/dkdzgpj3n/image/upload/';
let successCount = 0;
let testCount = 0;
const workingUrls = [];
const failedUrls = [];

function testUrl(url) {
  return new Promise((resolve) => {
    const curl = spawn('curl', ['-I', url], { stdio: 'pipe' });
    let responseData = '';
    
    curl.stdout.on('data', (data) => {
      responseData += data.toString();
    });
    
    curl.on('close', () => {
      const isWorking = responseData.includes('HTTP/1.1 200') || responseData.includes('HTTP/2 200');
      testCount++;
      
      if (isWorking) {
        successCount++;
        workingUrls.push(url);
        console.log(`✅ ${testCount.toString().padStart(3)}: FOUND! ${url}`);
      } else {
        failedUrls.push(url);
        console.log(`❌ ${testCount.toString().padStart(3)}: Not found: ${url}`);
      }
      
      resolve(isWorking);
    });
    
    curl.stderr.on('data', () => {
      // Suppress curl errors
    });
  });
}

async function testMETSamples() {
  console.log('🧪 다양한 URL 패턴 테스트...\n');
  
  // 각 패턴당 여러 ID 테스트
  const testIds = [
    '1', '2', '3', '4', '5',
    '01', '02', '03', '04', '05',
    '001', '002', '003', '004', '005',
    '0001', '0002', '0003', '0004', '0005',
    '10', '20', '50', '100', '200',
    '1000', '2000', '5000'
  ];
  
  for (const pattern of testPatterns) {
    console.log(`\n🔍 패턴 테스트: ${pattern}`);
    
    for (const id of testIds.slice(0, 5)) { // 각 패턴당 5개씩만
      const url = baseUrl + pattern.replace('{id}', id);
      await testUrl(url);
      
      // 성공하면 이 패턴으로 더 테스트
      if (workingUrls.length > 0 && workingUrls[workingUrls.length - 1] === url) {
        console.log(`   🎯 작동하는 패턴 발견! 더 테스트...`);
        
        // 이 패턴으로 10개 더 테스트
        for (let extraId = parseInt(id) + 1; extraId <= parseInt(id) + 10; extraId++) {
          const extraUrl = baseUrl + pattern.replace('{id}', extraId.toString());
          await testUrl(extraUrl);
        }
        break; // 패턴이 작동하면 다음 패턴으로
      }
      
      // 서버 부하 방지
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    if (workingUrls.length >= 20) {
      console.log('\n🎉 충분한 작동 URL을 찾았습니다!');
      break;
    }
  }
  
  // 결과 요약
  console.log('\n🏆 테스트 결과');
  console.log('=====================================');
  console.log(`📊 총 테스트: ${testCount}개 URL`);
  console.log(`✅ 성공: ${successCount}개`);
  console.log(`❌ 실패: ${failedUrls.length}개`);
  console.log(`📈 성공률: ${Math.round(successCount / testCount * 100)}%`);
  
  if (workingUrls.length > 0) {
    console.log('\n🎯 작동하는 MET 작품 URL 발견!');
    workingUrls.slice(0, 10).forEach((url, i) => {
      console.log(`   ${i+1}. ${url}`);
    });
    
    if (workingUrls.length > 10) {
      console.log(`   ... 그리고 ${workingUrls.length - 10}개 더!`);
    }
    
    // 패턴 분석
    const patterns = workingUrls.map(url => {
      const match = url.match(/sayu\/met-artworks\/(.*)/);
      return match ? match[1] : 'unknown';
    });
    
    const uniquePatterns = [...new Set(patterns.map(p => p.replace(/\d+/g, '{id}')))];
    
    console.log('\n📋 발견된 작동 패턴:');
    uniquePatterns.forEach(pattern => {
      console.log(`   ✅ sayu/met-artworks/${pattern}`);
    });
    
    // 다음 단계 제안
    console.log('\n🚀 다음 단계 제안:');
    console.log('   1. 작동 패턴으로 전체 MET 컬렉션 스캔');
    console.log('   2. 메타데이터 추출 (제목, 작가, 연도)');
    console.log('   3. APT 유형별 자동 분류');
    console.log('   4. 통합 JSON 생성');
    
  } else {
    console.log('\n❌ MET 작품 URL을 찾지 못했습니다.');
    console.log('   💡 다른 접근 방법 필요:');
    console.log('      1. Cloudinary Media Library에서 직접 확인');
    console.log('      2. 다른 URL 패턴 시도');
    console.log('      3. API를 통한 폴더 구조 분석');
  }
  
  return {
    testCount,
    successCount,
    workingUrls,
    patterns: workingUrls.length > 0 ? uniquePatterns : []
  };
}

// 실행
testMETSamples().catch(console.error);