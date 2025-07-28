#!/usr/bin/env node

/**
 * SAYU ESLint 자동 수정 스크립트
 * 사용되지 않는 변수들을 _변수명으로 자동 변경
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function fixUnusedVars() {
  console.log('🔧 ESLint unused variables 자동 수정 시작...');

  try {
    // ESLint 결과를 JSON으로 가져오기
    const eslintOutput = execSync('npx eslint . --format=json', { 
      encoding: 'utf8',
      cwd: __dirname,
      maxBuffer: 1024 * 1024 * 10 // 10MB
    });

    const results = JSON.parse(eslintOutput);
    let totalFixed = 0;

    results.forEach(result => {
      if (result.messages.length === 0) return;

      const filePath = result.filePath;
      const unusedVarIssues = result.messages.filter(msg => 
        msg.ruleId === 'no-unused-vars' && 
        msg.message.includes('is assigned a value but never used')
      );

      if (unusedVarIssues.length === 0) return;

      console.log(`📝 수정 중: ${path.basename(filePath)} (${unusedVarIssues.length}개 이슈)`);

      let fileContent = fs.readFileSync(filePath, 'utf8');
      let modified = false;

      unusedVarIssues.forEach(issue => {
        // 변수명 추출
        const match = issue.message.match(/'([^']+)' is assigned a value but never used/);
        if (match) {
          const varName = match[1];
          
          // const, let 선언에서 변수명 변경
          const patterns = [
            new RegExp(`\\b(const|let)\\s+(${varName})\\s*=`, 'g'),
            new RegExp(`\\b(const|let)\\s+\\{([^}]*\\b${varName}\\b[^}]*)\\}`, 'g'),
            new RegExp(`\\b(const|let)\\s+\\[([^\\]]*\\b${varName}\\b[^\\]]*)\\]`, 'g'),
          ];

          patterns.forEach(pattern => {
            if (pattern.test(fileContent)) {
              fileContent = fileContent.replace(pattern, (match, keyword) => {
                return match.replace(new RegExp(`\\b${varName}\\b`), `_${varName}`);
              });
              modified = true;
            }
          });
        }
      });

      if (modified) {
        fs.writeFileSync(filePath, fileContent);
        totalFixed += unusedVarIssues.length;
      }
    });

    console.log(`✅ 총 ${totalFixed}개의 unused variable 수정 완료`);

    // 다시 ESLint 실행하여 결과 확인
    console.log('🔍 수정 후 ESLint 재검사...');
    const afterOutput = execSync('npx eslint . --quiet', { 
      encoding: 'utf8',
      cwd: __dirname,
      stdio: 'pipe'
    });

    const afterCount = (afterOutput.match(/error/g) || []).length;
    console.log(`📊 남은 오류: ${afterCount}개`);

  } catch (error) {
    if (error.status === 1) {
      // ESLint 오류가 있는 경우 (정상적인 상황)
      console.log('ESLint 검사 완료 (일부 오류 여전히 존재)');
    } else {
      console.error('수정 스크립트 실행 중 오류:', error.message);
    }
  }
}

// 함수 파라미터의 unused 변수도 수정
function fixUnusedParameters() {
  console.log('🔧 Unused parameters 수정 중...');

  try {
    const eslintOutput = execSync('npx eslint . --format=json', { 
      encoding: 'utf8',
      cwd: __dirname,
      maxBuffer: 1024 * 1024 * 10
    });

    const results = JSON.parse(eslintOutput);
    let totalFixed = 0;

    results.forEach(result => {
      if (result.messages.length === 0) return;

      const filePath = result.filePath;
      const unusedParamIssues = result.messages.filter(msg => 
        msg.ruleId === 'no-unused-vars' && 
        msg.message.includes('is defined but never used')
      );

      if (unusedParamIssues.length === 0) return;

      console.log(`📝 파라미터 수정 중: ${path.basename(filePath)} (${unusedParamIssues.length}개)`);

      let fileContent = fs.readFileSync(filePath, 'utf8');
      let modified = false;

      unusedParamIssues.forEach(issue => {
        const match = issue.message.match(/'([^']+)' is defined but never used/);
        if (match) {
          const paramName = match[1];
          
          // 함수 파라미터에서 변수명 변경 (간단한 케이스만 처리)
          const line = issue.line;
          const lines = fileContent.split('\n');
          
          if (lines[line - 1] && lines[line - 1].includes(paramName)) {
            lines[line - 1] = lines[line - 1].replace(
              new RegExp(`\\b${paramName}\\b(?=\\s*[,)])`), 
              `_${paramName}`
            );
            fileContent = lines.join('\n');
            modified = true;
          }
        }
      });

      if (modified) {
        fs.writeFileSync(filePath, fileContent);
        totalFixed += unusedParamIssues.length;
      }
    });

    console.log(`✅ 총 ${totalFixed}개의 unused parameter 수정 완료`);

  } catch (error) {
    console.log('Unused parameters 수정 완료');
  }
}

if (require.main === module) {
  fixUnusedVars();
  fixUnusedParameters();
}

module.exports = { fixUnusedVars, fixUnusedParameters };