const { spawn } = require('child_process');
const path = require('path');

console.log('🔍 TypeScript 타입 체크 시작...\n');

const frontendPath = path.join(__dirname, 'frontend');
const tscPath = path.join(frontendPath, 'node_modules', '.bin', 'tsc');

// tsc 실행
const tsc = spawn(tscPath, ['--noEmit'], {
  cwd: frontendPath,
  shell: true,
  stdio: 'pipe'
});

let errorOutput = '';
let hasErrors = false;

// 에러 타입별 집계
const errorStats = {
  'TS18047': { name: 'Possibly null', count: 0 },
  'TS2339': { name: 'Property does not exist', count: 0 },
  'TS2305': { name: 'Module has no exported member', count: 0 },
  'TS7006': { name: 'Implicit any type', count: 0 },
  'TS2322': { name: 'Type not assignable', count: 0 },
  'TS2307': { name: 'Cannot find module', count: 0 },
  'TS2345': { name: 'Argument type mismatch', count: 0 },
  'Other': { name: 'Other errors', count: 0 }
};

// stderr 캡처
tsc.stderr.on('data', (data) => {
  errorOutput += data.toString();
});

// stdout 캡처
tsc.stdout.on('data', (data) => {
  errorOutput += data.toString();
});

// 프로세스 종료 시
tsc.on('close', (code) => {
  if (code !== 0) {
    hasErrors = true;
  }
  
  // 에러 분석
  const lines = errorOutput.split('\n');
  let totalErrors = 0;
  
  lines.forEach(line => {
    const match = line.match(/error (TS\d+):/);
    if (match) {
      totalErrors++;
      const errorCode = match[1];
      if (errorStats[errorCode]) {
        errorStats[errorCode].count++;
      } else {
        errorStats['Other'].count++;
      }
    }
  });
  
  // 결과 출력
  if (totalErrors > 0) {
    console.log('📊 에러 타입별 통계:\n');
    Object.entries(errorStats)
      .filter(([_, data]) => data.count > 0)
      .sort((a, b) => b[1].count - a[1].count)
      .forEach(([code, data]) => {
        console.log(`${code} - ${data.name}: ${data.count}개`);
      });
    
    console.log(`\n❌ 총 ${totalErrors}개의 타입 에러가 발견되었습니다.`);
    
    // 상위 5개 에러 샘플 출력
    console.log('\n📝 에러 예시 (상위 5개):\n');
    let errorCount = 0;
    lines.forEach(line => {
      if (line.includes('error TS') && errorCount < 5) {
        console.log(line.trim());
        errorCount++;
      }
    });
  } else {
    console.log('✅ 타입 체크 성공! 에러가 없습니다.');
  }
});