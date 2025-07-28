const { execSync } = require('child_process');

console.log('🔍 남은 TypeScript 에러 분석 중...\n');

try {
  // TypeScript 에러 수집
  let errors = '';
  try {
    execSync('cd frontend && powershell -Command "npx tsc --noEmit"', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
  } catch (e) {
    errors = e.stderr || '';
  }

  // 에러 타입별 분류
  const errorTypes = {
    'TS2339': { name: 'Property does not exist', count: 0, examples: [] },
    'TS2305': { name: 'Module has no exported member', count: 0, examples: [] },
    'TS7006': { name: 'Implicit any type', count: 0, examples: [] },
    'TS2322': { name: 'Type not assignable', count: 0, examples: [] },
    'TS2307': { name: 'Cannot find module', count: 0, examples: [] },
    'TS2345': { name: 'Argument type mismatch', count: 0, examples: [] },
    'TS2304': { name: 'Cannot find name', count: 0, examples: [] },
    'TS18046': { name: 'Type is unknown', count: 0, examples: [] },
    'TS2353': { name: 'Object literal extra properties', count: 0, examples: [] }
  };

  // 에러 파싱
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
    console.log(`${code} (${data.name}): ${data.count}개`);
    if (data.examples.length > 0) {
      console.log('예시:');
      data.examples.forEach(ex => {
        console.log(`  - ${ex.substring(0, 120)}${ex.length > 120 ? '...' : ''}`);
      });
    }
    console.log('');
  });

  // 가장 많은 에러 타입
  if (sortedErrors.length > 0) {
    console.log(`\n🎯 가장 많은 에러: ${sortedErrors[0][0]} (${sortedErrors[0][1].name}) - ${sortedErrors[0][1].count}개`);
  }

} catch (error) {
  console.error('분석 중 오류:', error.message);
}