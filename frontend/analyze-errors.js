const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 TypeScript 에러 분석 시작...\n');

try {
  // TypeScript 에러를 파일로 저장
  try {
    execSync('./node_modules/.bin/tsc --noEmit 2> ts-errors.txt', { 
      encoding: 'utf8',
      stdio: 'ignore'
    });
  } catch (e) {
    // tsc가 에러를 반환해도 계속 진행
  }
  
  // 에러 파일 읽기
  const errors = fs.readFileSync('ts-errors.txt', 'utf8');
  
  // 에러 타입별 분류
  const errorTypes = {
    'TS18047': { name: 'Possibly null', count: 0, examples: [] },
    'TS2339': { name: 'Property does not exist', count: 0, examples: [] },
    'TS2305': { name: 'Module has no exported member', count: 0, examples: [] },
    'TS7006': { name: 'Implicit any type', count: 0, examples: [] },
    'TS2322': { name: 'Type not assignable', count: 0, examples: [] },
    'TS2307': { name: 'Cannot find module', count: 0, examples: [] },
    'TS2353': { name: 'Object literal extra properties', count: 0, examples: [] },
    'TS2345': { name: 'Argument type mismatch', count: 0, examples: [] },
    'TS2304': { name: 'Cannot find name', count: 0, examples: [] },
    'TS18046': { name: 'Type is unknown', count: 0, examples: [] }
  };
  
  // 에러 라인 파싱
  const lines = errors.split('\n');
  lines.forEach(line => {
    const match = line.match(/error (TS\d+):/);
    if (match) {
      const errorCode = match[1];
      if (errorTypes[errorCode]) {
        errorTypes[errorCode].count++;
        if (errorTypes[errorCode].examples.length < 3) {
          errorTypes[errorCode].examples.push(line.trim());
        }
      } else {
        // 알려지지 않은 에러 타입
        if (!errorTypes['Other']) {
          errorTypes['Other'] = { name: 'Other errors', count: 0, examples: [] };
        }
        errorTypes['Other'].count++;
        if (errorTypes['Other'].examples.length < 3) {
          errorTypes['Other'].examples.push(line.trim());
        }
      }
    }
  });
  
  // 결과 출력
  console.log('📊 에러 타입별 통계:\n');
  const sortedErrors = Object.entries(errorTypes)
    .filter(([_, data]) => data.count > 0)
    .sort((a, b) => b[1].count - a[1].count);
    
  let totalErrors = 0;
  sortedErrors.forEach(([code, data]) => {
    console.log(`${code} - ${data.name}: ${data.count}개`);
    if (data.examples.length > 0) {
      console.log('예시:');
      data.examples.forEach((ex, i) => {
        console.log(`  ${i + 1}. ${ex.substring(0, 150)}${ex.length > 150 ? '...' : ''}`);
      });
    }
    console.log('');
    totalErrors += data.count;
  });
  
  // 파일별 에러 집계
  const fileErrors = {};
  lines.forEach(line => {
    const match = line.match(/^(.+?)\(\d+,\d+\): error/);
    if (match) {
      const file = match[1];
      fileErrors[file] = (fileErrors[file] || 0) + 1;
    }
  });
  
  console.log('\n📁 에러가 많은 파일 TOP 10:\n');
  const sortedFiles = Object.entries(fileErrors)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
    
  sortedFiles.forEach(([file, count]) => {
    console.log(`${count}개 - ${file}`);
  });
  
  console.log(`\n✨ 총 에러 수: ${totalErrors}개`);
  
  // 정리
  fs.unlinkSync('ts-errors.txt');
  
} catch (error) {
  console.error('분석 중 오류:', error.message);
}