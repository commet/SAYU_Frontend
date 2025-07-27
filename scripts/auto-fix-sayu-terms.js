#!/usr/bin/env node

/**
 * SAYU 용어 자동 수정 스크립트
 * 모든 잘못된 용어를 올바른 용어로 자동 교체합니다.
 */

const fs = require('fs');
const path = require('path');

const REPLACEMENTS = {
  // APT 시스템 관련 용어만 교체 (Free tier, Free sign up 등은 제외)
  'Free vs': 'Flow vs',
  'Free-flowing': 'Flow-based',
  '자유(Free)': '흐름(Flow)',
  '자유로운 (Flexible)': '유동적인 (Flow)',
  'Flexible vs Structured': 'Flow vs Constructive',
  'F_vs_S': 'F_vs_C',
  'Mental': 'Meaning-driven',
  'Grounded': 'Lone',
  'Logic': 'Lone',
  'Logical': 'Meaning-driven',
  'Emotional vs Logical': 'Emotional vs Meaning-driven',
  'Flexible': 'Flow'
};

let fixCount = 0;
const fixes = [];

function fixFile(filePath) {
  if (!filePath.endsWith('.js') && !filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) {
    return;
  }
  
  // 제외할 파일들
  if (filePath.includes('validateSAYUIntegrity') || 
      filePath.includes('auto-fix-sayu-terms') ||
      filePath.includes('node_modules') ||
      filePath.includes('.next')) {
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  let fileFixed = false;
  
  // APT 시스템 관련 교체만 수행
  for (const [wrong, correct] of Object.entries(REPLACEMENTS)) {
    const regex = new RegExp(wrong.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    
    if (content.match(regex)) {
      // 특별 케이스: Free가 APT 시스템과 관련된 경우만 교체
      if (wrong.includes('Free')) {
        // APT 컨텍스트인지 확인 (축, axis, vs 등이 있는 경우)
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          if (line.match(regex) && 
              (line.includes('축') || line.includes('axis') || line.includes('vs') || 
               line.includes('F/C') || line.includes('Flexible'))) {
            content = content.replace(regex, correct);
            fileFixed = true;
          }
        });
      } else {
        content = content.replace(regex, correct);
        fileFixed = true;
      }
    }
  }
  
  if (fileFixed) {
    fs.writeFileSync(filePath, content, 'utf8');
    fixes.push({
      file: filePath,
      changes: content !== originalContent
    });
    fixCount++;
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!['node_modules', '.git', 'dist', 'build', '.next'].includes(file)) {
        walkDir(filePath);
      }
    } else {
      fixFile(filePath);
    }
  });
}

console.log('🔧 SAYU 용어 자동 수정 시작...\n');

const projectRoot = path.join(__dirname, '..');
walkDir(projectRoot);

if (fixCount === 0) {
  console.log('✅ 수정할 파일이 없습니다. 모든 파일이 이미 올바른 용어를 사용 중입니다.');
} else {
  console.log(`✅ ${fixCount}개 파일의 용어를 수정했습니다.\n`);
  
  console.log('수정된 파일 목록:');
  fixes.forEach(fix => {
    if (fix.changes) {
      console.log(`  📝 ${fix.file}`);
    }
  });
  
  console.log('\n🎯 SAYU 용어 자동 수정 완료!');
}