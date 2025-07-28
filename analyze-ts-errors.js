const { execSync } = require('child_process');

console.log('🔍 TypeScript 에러 분석 시작...\n');

try {
  // TypeScript 에러 수집
  const errors = execSync('cd frontend && ./node_modules/.bin/tsc --noEmit 2>&1', { 
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024 // 10MB
  });
  
  // 에러 타입별 분류
  const errorTypes = {
    'TS18047': { name: 'Possibly null', count: 0, examples: [] },
    'TS2339': { name: 'Property does not exist', count: 0, examples: [] },
    'TS2305': { name: 'Module has no exported member', count: 0, examples: [] },
    'TS7006': { name: 'Implicit any type', count: 0, examples: [] },
    'TS2322': { name: 'Type not assignable', count: 0, examples: [] },
    'TS2307': { name: 'Cannot find module', count: 0, examples: [] },
    'TS2353': { name: 'Object literal extra properties', count: 0, examples: [] },
    'TS2345': { name: 'Argument type mismatch', count: 0, examples: [] }
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
      }
    }
  });
  
  // 결과 출력
  console.log('📊 에러 타입별 통계:\n');
  const sortedErrors = Object.entries(errorTypes)
    .filter(([_, data]) => data.count > 0)
    .sort((a, b) => b[1].count - a[1].count);
    
  sortedErrors.forEach(([code, data]) => {
    console.log(`${code} - ${data.name}: ${data.count}개`);
    console.log('예시:');
    data.examples.forEach((ex, i) => {
      console.log(`  ${i + 1}. ${ex}`);
    });
    console.log('');
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
  
  console.log(`\n총 에러 수: ${lines.filter(l => l.includes('error TS')).length}개`);
  
} catch (error) {
  // 에러가 있어도 분석은 계속
  console.log('TypeScript 에러 분석 중...');
}