/**
 * 🎯 스마트 Chicago 패턴 스캔
 * 실제 Cloudinary에 저장된 met-chicago-{숫자} 패턴 발견
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🎯 스마트 Chicago 패턴 스캔!');
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
        
        console.log(`✅ ${totalTests.toString().padStart(3)}: FOUND! ${url}`);
        console.log(`    💾 ${(fileSize / 1024 / 1024).toFixed(2)}MB | ID: ${url.match(/met-chicago-(\d+)/)?.[1]} | ${description}`);
      } else {
        // 실패는 너무 많으니 간단히
        if (totalTests % 100 === 0) {
          console.log(`❌ ${totalTests}개 테스트 완료...`);
        }
      }
      
      resolve(isWorking);
    });
    
    curl.stderr.on('data', () => {});
  });
}

async function scanByDigitPattern() {
  console.log('\n🔍 1. 자릿수별 체계적 스캔...\n');
  
  const knownId = 205641; // 알려진 성공 ID
  
  // 자릿수별 범위 설정
  const digitPatterns = [
    {
      name: '6자리 (20xxxx 대역)',
      range: { start: 200000, end: 210000, step: 1 },
      priority: 'HIGH' // 알려진 성공 ID가 여기에 있음
    },
    {
      name: '5자리 (5xxxx 대역)', 
      range: { start: 50000, end: 60000, step: 10 }, // 샘플링
      priority: 'MEDIUM'
    },
    {
      name: '5자리 (1xxxx 대역)',
      range: { start: 10000, end: 20000, step: 10 },
      priority: 'MEDIUM' 
    },
    {
      name: '4자리 (1xxx ~ 9xxx)',
      range: { start: 1000, end: 9999, step: 50 }, // 샘플링
      priority: 'LOW'
    }
  ];
  
  for (const pattern of digitPatterns) {
    console.log(`🔍 ${pattern.name} 스캔 시작...`);
    console.log(`   범위: ${pattern.range.start} ~ ${pattern.range.end} (step: ${pattern.range.step})`);
    
    let foundInThisPattern = 0;
    
    for (let id = pattern.range.start; id <= pattern.range.end; id += pattern.range.step) {
      const url = `${baseUrl}met-chicago-${id}.jpg`;
      const success = await testUrl(url, `${pattern.name} 스캔`);
      
      if (success) {
        foundInThisPattern++;
        console.log(`   🎉 ${pattern.name}에서 ${foundInThisPattern}번째 발견!`);
        
        // 성공한 ID 주변을 세밀하게 스캔 (step=1)
        if (pattern.range.step > 1) {
          console.log(`   🔍 성공 ID ${id} 주변 세밀 스캔...`);
          for (let fine = Math.max(pattern.range.start, id - 20); fine <= Math.min(pattern.range.end, id + 20); fine++) {
            if (fine === id) continue;
            
            const fineUrl = `${baseUrl}met-chicago-${fine}.jpg`;
            await testUrl(fineUrl, `세밀 스캔 ${fine}`);
          }
        }
        
        // 이 패턴에서 5개 발견하면 다음 패턴으로
        if (foundInThisPattern >= 5) {
          console.log(`   ✅ ${pattern.name}에서 충분히 발견, 다음 패턴으로 이동`);
          break;
        }
      }
      
      // 전체 20개 발견하면 중단
      if (discoveredUrls.length >= 20) {
        console.log('\n🎯 총 20개 발견! 스캔 완료');
        return;
      }
      
      // 서버 부하 방지
      await new Promise(resolve => setTimeout(resolve, pattern.range.step === 1 ? 100 : 50));
    }
    
    console.log(`   📊 ${pattern.name} 완료: ${foundInThisPattern}개 발견\n`);
  }
}

async function intelligentExpansion() {
  console.log('🧠 2. 지능형 확장 스캔...\n');
  
  if (discoveredUrls.length === 0) {
    console.log('❌ 이전 스캔에서 발견된 패턴이 없어 확장 불가');
    return;
  }
  
  // 발견된 ID들의 패턴 분석
  const foundIds = discoveredUrls.map(item => parseInt(item.objectId)).filter(id => !isNaN(id));
  foundIds.sort((a, b) => a - b);
  
  console.log(`📊 발견된 ID들: ${foundIds.join(', ')}`);
  
  if (foundIds.length >= 2) {
    // 최소값과 최대값 사이의 모든 ID 테스트
    const minId = foundIds[0];
    const maxId = foundIds[foundIds.length - 1];
    
    console.log(`🔍 ID 범위 ${minId} ~ ${maxId} 완전 스캔...`);
    
    for (let id = minId; id <= maxId; id++) {
      if (foundIds.includes(id)) continue; // 이미 확인된 것 제외
      
      const url = `${baseUrl}met-chicago-${id}.jpg`;
      await testUrl(url, `범위 완전 스캔 ${id}`);
      
      if (discoveredUrls.length >= 50) {
        console.log('🎯 50개 발견! 충분한 샘플 확보');
        break;
      }
    }
  }
  
  // 패턴 기반 예측
  if (foundIds.length >= 2) {
    console.log('\n🔮 패턴 기반 예측 스캔...');
    
    // 간격 패턴 찾기
    const gaps = [];
    for (let i = 1; i < foundIds.length; i++) {
      gaps.push(foundIds[i] - foundIds[i-1]);
    }
    
    if (gaps.length > 0) {
      const avgGap = Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
      console.log(`📊 평균 간격: ${avgGap}`);
      
      // 마지막 ID에서 평균 간격으로 예측
      const lastId = foundIds[foundIds.length - 1];
      for (let i = 1; i <= 10; i++) {
        const predictedId = lastId + (avgGap * i);
        const url = `${baseUrl}met-chicago-${predictedId}.jpg`;
        await testUrl(url, `예측 스캔 ${predictedId} (간격: ${avgGap})`);
      }
    }
  }
}

// 메인 실행
async function runSmartChicagoScan() {
  try {
    console.log('🚀 스마트 Chicago 패턴 스캔 시작...\n');
    console.log('🎯 목표: met-chicago-{숫자} 패턴의 실제 숫자 범위 발견\n');
    
    await scanByDigitPattern();
    await intelligentExpansion();
    
    // 결과 분석
    console.log('\n🏆 Chicago 패턴 스캔 결과');
    console.log('=====================================');
    console.log(`📊 총 테스트: ${totalTests}개 URL`);
    console.log(`✅ 발견: ${discoveredUrls.length}개`);
    console.log(`📈 성공률: ${discoveredUrls.length > 0 ? Math.round(discoveredUrls.length / totalTests * 100) : 0}%`);
    
    if (discoveredUrls.length > 0) {
      console.log('\n🎯 발견된 Chicago 시리즈:');
      discoveredUrls.forEach((item, i) => {
        console.log(`   ${(i+1).toString().padStart(2)}. ID: ${item.objectId.padStart(6)} | ${item.sizeMB}MB`);
        console.log(`       ${item.url}`);
      });
      
      // 숫자 패턴 분석
      const ids = discoveredUrls.map(item => parseInt(item.objectId)).filter(id => !isNaN(id));
      ids.sort((a, b) => a - b);
      
      console.log('\n📊 발견된 ID 패턴 분석:');
      console.log(`   🔢 ID 범위: ${ids[0]} ~ ${ids[ids.length - 1]}`);
      console.log(`   📏 자릿수 분포:`);
      
      const digitCounts = {};
      ids.forEach(id => {
        const digits = id.toString().length;
        digitCounts[digits] = (digitCounts[digits] || 0) + 1;
      });
      
      Object.entries(digitCounts).forEach(([digits, count]) => {
        console.log(`      ${digits}자리: ${count}개`);
      });
      
      // 확장 가능성 예측
      console.log('\n🚀 확장 가능성:');
      if (ids.length >= 2) {
        const density = ids.length / (ids[ids.length - 1] - ids[0] + 1);
        console.log(`   📊 ID 밀도: ${(density * 100).toFixed(2)}%`);
        console.log(`   🔮 예상 총 작품 수: ${Math.round(10000 * density)}개 (추정)`);
      }
      
      console.log('\n⚡ 다음 단계:');
      console.log('   1. 발견된 ID들의 MET API 메타데이터 수집');
      console.log('   2. 성공 패턴으로 전체 범위 체계적 스캔');  
      console.log('   3. SAYU 컬렉션에 통합');
      
    } else {
      console.log('\n❌ Chicago 시리즈 추가 발견 실패');
      console.log('💡 결론: met-chicago-205641.jpg가 정말 유일한 파일일 수 있음');
    }
    
    // 결과 저장
    const results = {
      scanDate: new Date().toISOString(),
      totalTested: totalTests,
      successCount: discoveredUrls.length,
      discoveredUrls,
      patterns: discoveredUrls.length > 0 ? {
        idRange: ids.length >= 2 ? `${ids[0]}-${ids[ids.length - 1]}` : 'single',
        digitDistribution: digitCounts,
        estimatedTotal: ids.length >= 2 ? Math.round(10000 * (ids.length / (ids[ids.length - 1] - ids[0] + 1))) : 1
      } : null
    };
    
    const resultsDir = path.join(__dirname, '../artvee-crawler/chicago-pattern-scan');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(resultsDir, 'chicago-pattern-results.json'),
      JSON.stringify(results, null, 2)
    );
    
    console.log('\n💾 결과 저장: chicago-pattern-scan/chicago-pattern-results.json');
    
  } catch (error) {
    console.error('❌ Chicago 패턴 스캔 중 오류:', error.message);
  }
}

runSmartChicagoScan();