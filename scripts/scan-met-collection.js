/**
 * 🏛️ MET 컬렉션 대량 스캔
 * 실제 URL 패턴 기반으로 MET 작품들 발견
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🏛️ MET 컬렉션 대량 스캔 시작!');
console.log('=====================================');

const baseUrl = 'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752840033/sayu/met-artworks/';
const knownPattern = 'met-chicago-{id}.jpg'; // 실제 발견된 패턴

let discoveredArtworks = [];
let totalTests = 0;
let successCount = 0;

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
        successCount++;
        
        // 파일 크기와 이미지 정보 추출
        const sizeMatch = responseData.match(/content-length: (\d+)/i);
        const fileSize = sizeMatch ? parseInt(sizeMatch[1]) : 0;
        
        // Server-Timing에서 이미지 정보 추출
        const timingMatch = responseData.match(/width=(\d+),height=(\d+)/);
        const width = timingMatch ? parseInt(timingMatch[1]) : 0;
        const height = timingMatch ? parseInt(timingMatch[2]) : 0;
        
        discoveredArtworks.push({
          url,
          description,
          fileSize,
          sizeMB: (fileSize / 1024 / 1024).toFixed(2),
          dimensions: { width, height },
          id: url.match(/met-chicago-(\d+)/)?.[1] || 'unknown'
        });
        
        console.log(`✅ ${totalTests.toString().padStart(3)}: FOUND! ${url}`);
        console.log(`    📏 ${width}x${height} | 💾 ${(fileSize / 1024 / 1024).toFixed(2)}MB | ${description}`);
      } else {
        console.log(`❌ ${totalTests.toString().padStart(3)}: Not found: ${url} ${description ? `- ${description}` : ''}`);
      }
      
      resolve(isWorking);
    });
    
    curl.stderr.on('data', () => {});
  });
}

async function scanChicagoSeries() {
  console.log('\n🔍 Chicago 시리즈 스캔 (met-chicago-{id}.jpg)...\n');
  
  // 알려진 작품 ID: 205641
  // 주변 ID들을 체계적으로 스캔
  const baseId = 205641;
  const scanRanges = [
    // 현재 ID 주변
    { start: baseId - 100, end: baseId + 100, step: 1 },
    // 더 넓은 범위 (10단위)
    { start: baseId - 1000, end: baseId + 1000, step: 10 },
    // 훨씬 넓은 범위 (100단위)
    { start: baseId - 10000, end: baseId + 10000, step: 100 },
    // 다른 시리즈 예상 범위
    { start: 200000, end: 210000, step: 100 },
    { start: 100000, end: 110000, step: 100 },
    { start: 300000, end: 310000, step: 100 }
  ];
  
  for (const range of scanRanges) {
    console.log(`\n🔍 범위 ${range.start}-${range.end} (step: ${range.step}) 스캔...`);
    
    for (let id = range.start; id <= range.end; id += range.step) {
      if (id <= 0) continue;
      
      const url = `${baseUrl}met-chicago-${id}.jpg`;
      const success = await testUrl(url, `Chicago Series ID ${id}`);
      
      // 성공한 경우 주변 ID들 추가 스캔
      if (success && range.step > 1) {
        console.log(`   🎯 발견! 주변 세부 스캔...`);
        for (let adjacent = Math.max(1, id - range.step + 1); adjacent < id + range.step; adjacent++) {
          if (adjacent === id) continue;
          const adjacentUrl = `${baseUrl}met-chicago-${adjacent}.jpg`;
          await testUrl(adjacentUrl, `Adjacent ID ${adjacent}`);
        }
      }
      
      // 너무 많이 발견되면 중단
      if (discoveredArtworks.length >= 100) {
        console.log('\n✅ 충분한 작품 발견! 스캔 중단');
        return;
      }
      
      // 서버 부하 방지
      await new Promise(resolve => setTimeout(resolve, range.step === 1 ? 200 : 100));
    }
    
    if (discoveredArtworks.length >= 50) break;
  }
}

async function scanOtherPatterns() {
  console.log('\n🔍 다른 패턴들 테스트...\n');
  
  // 다른 도시나 컬렉션 패턴들
  const otherPatterns = [
    'met-newyork-{id}.jpg',
    'met-american-{id}.jpg',
    'met-european-{id}.jpg',
    'met-painting-{id}.jpg',
    'met-sculpture-{id}.jpg',
    'met-{id}.jpg',
    'chicago-{id}.jpg',
    'artwork-{id}.jpg'
  ];
  
  // 알려진 ID 범위에서 다른 패턴들 테스트
  const testIds = [205641, 205640, 205642, 200000, 210000, 100000, 150000];
  
  for (const pattern of otherPatterns) {
    console.log(`\n🔍 패턴 테스트: ${pattern}`);
    
    for (const id of testIds) {
      const filename = pattern.replace('{id}', id);
      const url = baseUrl + filename;
      
      const success = await testUrl(url, `Pattern: ${pattern}, ID: ${id}`);
      
      // 성공하면 이 패턴으로 더 스캔
      if (success) {
        console.log(`   🎯 새 패턴 발견! ${pattern} 추가 스캔...`);
        
        for (let extraId = id + 1; extraId <= id + 20; extraId++) {
          const extraFilename = pattern.replace('{id}', extraId);
          const extraUrl = baseUrl + extraFilename;
          await testUrl(extraUrl, `Extra ${pattern} ID ${extraId}`);
        }
        break;
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    if (discoveredArtworks.length >= 200) break;
  }
}

async function analyzeMetadata() {
  console.log('\n📊 메타데이터 분석...');
  
  if (discoveredArtworks.length === 0) {
    console.log('❌ 발견된 작품이 없어 메타데이터 분석 불가');
    return;
  }
  
  // 파일 크기 분석
  const sizes = discoveredArtworks.map(art => art.fileSize);
  const avgSize = sizes.reduce((a, b) => a + b, 0) / sizes.length;
  const minSize = Math.min(...sizes);
  const maxSize = Math.max(...sizes);
  
  // 해상도 분석  
  const resolutions = discoveredArtworks.map(art => art.dimensions.width * art.dimensions.height);
  const avgResolution = resolutions.reduce((a, b) => a + b, 0) / resolutions.length;
  
  console.log(`\n📊 메타데이터 분석 결과:`);
  console.log(`   📁 총 발견 작품: ${discoveredArtworks.length}개`);
  console.log(`   💾 평균 파일 크기: ${(avgSize / 1024 / 1024).toFixed(2)}MB`);
  console.log(`   📏 크기 범위: ${(minSize / 1024 / 1024).toFixed(2)}MB ~ ${(maxSize / 1024 / 1024).toFixed(2)}MB`);
  console.log(`   🖼️ 평균 해상도: ${Math.round(Math.sqrt(avgResolution))}px 정도`);
  
  // ID 패턴 분석
  const ids = discoveredArtworks.map(art => parseInt(art.id)).filter(id => !isNaN(id));
  if (ids.length > 0) {
    ids.sort((a, b) => a - b);
    console.log(`   🔢 ID 범위: ${ids[0]} ~ ${ids[ids.length - 1]}`);
    
    // 연속성 분석
    let consecutive = 0;
    for (let i = 1; i < ids.length; i++) {
      if (ids[i] === ids[i-1] + 1) consecutive++;
    }
    console.log(`   📈 연속성: ${Math.round(consecutive / (ids.length - 1) * 100)}%`);
  }
}

// 메인 실행
async function runMetScan() {
  try {
    console.log('🚀 MET 컬렉션 스캔 시작...\n');
    
    await scanChicagoSeries();
    await scanOtherPatterns();
    await analyzeMetadata();
    
    // 결과 요약
    console.log('\n🏆 MET 스캔 결과');
    console.log('=====================================');
    console.log(`📊 총 테스트: ${totalTests}개 URL`);
    console.log(`✅ 발견: ${successCount}개`);
    console.log(`📈 성공률: ${Math.round(successCount / totalTests * 100)}%`);
    
    if (discoveredArtworks.length > 0) {
      console.log('\n🎯 발견된 MET 작품들 (상위 20개):');
      discoveredArtworks.slice(0, 20).forEach((artwork, i) => {
        console.log(`   ${(i+1).toString().padStart(2)}. ID: ${artwork.id} | ${artwork.sizeMB}MB | ${artwork.dimensions.width}x${artwork.dimensions.height}`);
        console.log(`       ${artwork.url}`);
      });
      
      // 패턴 분석
      const patterns = [...new Set(discoveredArtworks.map(art => {
        return art.url.replace(baseUrl, '').replace(/\d+/g, '{id}');
      }))];
      
      console.log('\n📋 발견된 URL 패턴들:');
      patterns.forEach(pattern => {
        const count = discoveredArtworks.filter(art => 
          art.url.includes(pattern.replace('{id}', ''))
        ).length;
        console.log(`   ✅ ${pattern} (${count}개)`);
      });
      
      // 통합 전략
      console.log('\n🚀 다음 단계:');
      console.log('   1. 발견된 패턴으로 전체 컬렉션 매핑');
      console.log('   2. 메타데이터 수집 (작품명, 작가, 연도 등)');
      console.log('   3. APT 유형별 분류');
      console.log('   4. 기존 773개 컬렉션과 통합');
      console.log(`   📈 예상 최종 컬렉션: ${773 + discoveredArtworks.length}+개`);
      
    } else {
      console.log('\n❌ 추가 MET 작품 발견 실패');
      console.log('   💡 대안:');
      console.log('      1. 다른 버전 번호 시도');
      console.log('      2. 파일명 구조 재분석');
      console.log('      3. MET API 직접 활용');
    }
    
    // 결과 저장
    if (discoveredArtworks.length > 0) {
      const resultsDir = path.join(__dirname, '../artvee-crawler/met-discovery');
      if (!fs.existsSync(resultsDir)) {
        fs.mkdirSync(resultsDir, { recursive: true });
      }
      
      fs.writeFileSync(
        path.join(resultsDir, 'met-artworks-discovered.json'),
        JSON.stringify({
          discoveryDate: new Date().toISOString(),
          totalTested: totalTests,
          successCount,
          successRate: Math.round(successCount / totalTests * 100),
          discoveredArtworks,
          patterns,
          metadata: {
            avgFileSize: discoveredArtworks.reduce((a, b) => a + b.fileSize, 0) / discoveredArtworks.length,
            totalSizeMB: discoveredArtworks.reduce((a, b) => a + b.fileSize, 0) / 1024 / 1024
          }
        }, null, 2)
      );
      
      console.log('\n💾 결과 저장: met-discovery/met-artworks-discovered.json');
    }
    
  } catch (error) {
    console.error('\n❌ MET 스캔 실행 중 오류:', error.message);
  }
}

runMetScan();