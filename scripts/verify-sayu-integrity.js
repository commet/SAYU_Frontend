#!/usr/bin/env node

/**
 * SAYU 시스템 전체 무결성 검사 스크립트
 * 프로젝트 내 모든 파일에서 잘못된 용어 사용을 검사합니다.
 */

const fs = require('fs');
const path = require('path');
const { FORBIDDEN_TERMS } = require('../shared/validateSAYUIntegrity');

let errorCount = 0;
const errors = [];

function checkFile(filePath) {
  if (!filePath.endsWith('.js') && !filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) {
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    for (const [forbidden, correct] of Object.entries(FORBIDDEN_TERMS)) {
      // 주석이나 문자열 내부가 아닌 경우만 검사
      if (line.includes(`${forbidden}`) && 
          (line.includes('축') || line.includes('axis') || line.includes('vs') || line.includes('='))) {
        
        // validateSAYUIntegrity.js 자체는 제외
        if (!filePath.includes('validateSAYUIntegrity')) {
          errors.push({
            file: filePath,
            line: index + 1,
            content: line.trim(),
            forbidden,
            correct
          });
          errorCount++;
        }
      }
    }
  });
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    // 제외할 디렉토리
    if (stat.isDirectory()) {
      if (!['node_modules', '.git', 'dist', 'build'].includes(file)) {
        walkDir(filePath);
      }
    } else {
      checkFile(filePath);
    }
  });
}

console.log('🔍 SAYU 시스템 무결성 검사 시작...\n');

// 프로젝트 루트에서 시작
const projectRoot = path.join(__dirname, '..');
walkDir(projectRoot);

if (errorCount === 0) {
  console.log('✅ 모든 파일이 올바른 SAYU 용어를 사용하고 있습니다!');
} else {
  console.log(`❌ ${errorCount}개의 잘못된 용어 사용이 발견되었습니다:\n`);
  
  errors.forEach(error => {
    console.log(`📄 ${error.file}:${error.line}`);
    console.log(`   잘못됨: "${error.forbidden}"`);
    console.log(`   올바름: "${error.correct}"`);
    console.log(`   내용: ${error.content}\n`);
  });
  
  process.exit(1);
}