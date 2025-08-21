/**
 * 🎯 특정 ID 직접 테스트
 * 사용자가 제시한 5자리 숫자들 우선 확인
 */

const { spawn } = require('child_process');

console.log('🎯 특정 ID 직접 테스트!');
console.log('=====================================');

const baseUrl = 'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752840033/sayu/met-artworks/';
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
          sizeMB: (fileSize / 1024 / 1024).toFixed(2),
          objectId: url.match(/met-chicago-(\d+)/)?.[1]
        });
        
        console.log(`✅ ${totalTests}: FOUND! ${url}`);
        console.log(`    💾 ${(fileSize / 1024 / 1024).toFixed(2)}MB | ID: ${url.match(/met-chicago-(\d+)/)?.[1]}`);
      } else {
        console.log(`❌ ${totalTests}: Not found: ${url.split('/').pop()}`);
      }
      
      resolve(isWorking);
    });
    
    curl.stderr.on('data', () => {});
  });
}

async function testUserSuggestedIds() {
  console.log('\n🔍 사용자 제시 5자리 ID 테스트...\n');
  
  // 사용자가 언급한 5자리 ID들
  const suggestedIds = [
    '57854', '19432', '58540',
    // 비슷한 범위들도 추가
    '57855', '57856', '19433', '19434', '58541', '58542'
  ];
  
  for (const id of suggestedIds) {
    const url = `${baseUrl}met-chicago-${id}.jpg`;
    const success = await testUrl(url, `사용자 제시 ID ${id}`);
    
    if (success) {
      console.log(`🎉 사용자 제시 ID ${id} 성공!`);
      
      // 성공한 ID 주변 10개씩 테스트
      const baseNum = parseInt(id);
      console.log(`   🔍 성공 ID ${id} 주변 탐색...`);
      
      for (let offset = -5; offset <= 5; offset++) {
        if (offset === 0) continue;
        
        const adjacentId = baseNum + offset;
        if (adjacentId <= 0) continue;
        
        const adjacentUrl = `${baseUrl}met-chicago-${adjacentId}.jpg`;
        await testUrl(adjacentUrl, `${id} 주변 ${adjacentId}`);
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 200));
  }
}

async function testCommonPatterns() {
  console.log('\n🔍 일반적인 5자리 패턴 테스트...\n');
  
  // 5자리 숫자의 일반적인 패턴들
  const commonPatterns = [
    // 1만대
    '10000', '10001', '10010', '10100', '11111',
    // 2만대  
    '20000', '20001', '22222',
    // 5만대
    '50000', '50001', '55555',
    // 기타 패턴
    '12345', '54321', '11111', '99999'
  ];
  
  for (const id of commonPatterns) {
    const url = `${baseUrl}met-chicago-${id}.jpg`;
    await testUrl(url, `일반 패턴 ${id}`);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

async function expandSuccessfulRanges() {
  console.log('\n🚀 성공 범위 확장...\n');
  
  if (discoveredUrls.length === 0) {
    console.log('❌ 성공한 ID가 없어 확장 불가');
    return;
  }
  
  // 발견된 모든 ID들 분석
  const foundIds = discoveredUrls.map(item => parseInt(item.objectId)).filter(id => !isNaN(id));
  foundIds.sort((a, b) => a - b);
  
  console.log(`📊 발견된 ID들: ${foundIds.join(', ')}`);
  
  // 각 성공 ID를 중심으로 더 넓은 범위 스캔
  for (const centerId of foundIds) {
    console.log(`🔍 ID ${centerId} 중심으로 확장 스캔...`);
    
    // ±50 범위로 확장
    for (let offset = -50; offset <= 50; offset += 5) {
      if (offset === 0) continue;
      
      const testId = centerId + offset;
      if (testId <= 0) continue;
      
      // 이미 테스트한 ID는 건너뛰기
      if (foundIds.includes(testId)) continue;
      
      const url = `${baseUrl}met-chicago-${testId}.jpg`;
      await testUrl(url, `${centerId} 확장 ${testId}`);
      
      if (discoveredUrls.length >= 20) {
        console.log('🎯 20개 발견! 확장 중단');
        return;
      }
    }
  }
}

// 메인 실행
async function runSpecificIdTest() {
  try {
    console.log('🚀 특정 ID 테스트 시작...\n');
    
    await testUserSuggestedIds();
    
    if (discoveredUrls.length === 0) {
      await testCommonPatterns();
    }
    
    if (discoveredUrls.length > 0) {
      await expandSuccessfulRanges();
    }
    
    // 결과 분석
    console.log('\n🏆 특정 ID 테스트 결과');
    console.log('=====================================');
    console.log(`📊 총 테스트: ${totalTests}개`);
    console.log(`✅ 발견: ${discoveredUrls.length}개`);
    
    if (discoveredUrls.length > 0) {
      console.log('\n🎯 발견된 작품들:');
      discoveredUrls.forEach((item, i) => {
        console.log(`   ${i+1}. ID: ${item.objectId} | ${item.sizeMB}MB`);
        console.log(`      ${item.url}`);
      });
      
      const ids = discoveredUrls.map(item => parseInt(item.objectId)).sort((a, b) => a - b);
      console.log(`\n📊 ID 범위: ${ids[0]} ~ ${ids[ids.length - 1]}`);
      console.log(`📈 발견 밀도: ${(discoveredUrls.length / (ids[ids.length - 1] - ids[0] + 1) * 100).toFixed(2)}%`);
      
      console.log('\n⚡ 다음 단계:');
      console.log('1. 이 범위로 전체 스캔 실행');
      console.log('2. MET API 메타데이터 수집');
      console.log('3. SAYU 컬렉션 통합');
      
    } else {
      console.log('\n❌ 제시된 ID들에서 발견 실패');
      console.log('💡 다른 접근 방법 필요:');
      console.log('   1. Cloudinary 웹 UI 직접 확인');
      console.log('   2. 다른 패턴 시도 (met-xxx-{id} 등)');
    }
    
  } catch (error) {
    console.error('❌ 테스트 중 오류:', error.message);
  }
}

runSpecificIdTest();