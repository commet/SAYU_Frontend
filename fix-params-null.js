const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Next.js params possibly null 이슈 수정 시작...\n');

// TypeScript 에러에서 파일 목록 추출
let errors = '';
try {
  errors = execSync('cd frontend && powershell -Command "npx tsc --noEmit 2>&1 | Select-String TS18047"', {
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024
  });
} catch (e) {
  // 에러가 있어도 stdout에서 데이터 추출
  errors = e.stdout || '';
}

// 파일별로 에러 정리
const fileErrors = new Map();
errors.split('\n').forEach(line => {
  const match = line.match(/^(.+?)\((\d+),(\d+)\): error TS18047: '(params|searchParams)' is possibly 'null'/);
  if (match) {
    const [_, file, lineNum, colNum, paramType] = match;
    if (!fileErrors.has(file)) {
      fileErrors.set(file, []);
    }
    fileErrors.get(file).push({
      line: parseInt(lineNum),
      col: parseInt(colNum),
      type: paramType
    });
  }
});

console.log(`📋 수정이 필요한 파일: ${fileErrors.size}개\n`);

// 각 파일 수정
let fixedCount = 0;
fileErrors.forEach((errors, file) => {
  console.log(`\n📁 ${file}`);
  const filePath = path.join('frontend', file);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    // params 사용 찾기
    errors.forEach(error => {
      console.log(`  라인 ${error.line}: ${error.type} 수정`);
      
      // 해당 라인 찾기
      const lineIndex = error.line - 1;
      if (lineIndex < lines.length) {
        const line = lines[lineIndex];
        
        // params.xxx를 params?.xxx로 변경
        if (error.type === 'params') {
          lines[lineIndex] = line.replace(/params\./g, 'params?.');
        } else if (error.type === 'searchParams') {
          lines[lineIndex] = line.replace(/searchParams\./g, 'searchParams?.');
        }
      }
    });
    
    // 파일 저장
    const newContent = lines.join('\n');
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent);
      fixedCount++;
      console.log(`  ✅ 수정 완료`);
    }
  } catch (e) {
    console.log(`  ❌ 에러: ${e.message}`);
  }
});

console.log(`\n✨ 총 ${fixedCount}개 파일 수정 완료!`);
console.log('\n다시 타입 체크를 실행하여 결과를 확인하세요: npm run typecheck');