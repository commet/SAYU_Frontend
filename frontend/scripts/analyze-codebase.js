#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class CodebaseAnalyzer {
  constructor(srcPath = './src') {
    this.srcPath = srcPath;
    this.stats = {
      totalFiles: 0,
      totalLines: 0,
      largeFiles: [],
      duplicateNames: {},
      unusedFiles: [],
      todoCount: 0,
      issuesByType: {
        performance: [],
        structure: [],
        cleanup: []
      }
    };
  }

  analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').length;
    const fileName = path.basename(filePath);
    
    this.stats.totalFiles++;
    this.stats.totalLines += lines;

    // 큰 파일 체크 (100줄 이상)
    if (lines > 100) {
      this.stats.largeFiles.push({
        file: filePath,
        lines: lines,
        size: `${(fs.statSync(filePath).size / 1024).toFixed(2)}KB`
      });
    }

    // 중복 파일명 체크
    const baseName = fileName.replace(/\.(ts|tsx|js|jsx)$/, '');
    if (this.stats.duplicateNames[baseName]) {
      this.stats.duplicateNames[baseName].push(filePath);
    } else {
      this.stats.duplicateNames[baseName] = [filePath];
    }

    // TODO/FIXME 카운트
    const todos = content.match(/TODO|FIXME|HACK|XXX/gi);
    if (todos) this.stats.todoCount += todos.length;

    // 성능 이슈 체크
    this.checkPerformanceIssues(content, filePath);
    
    // 구조 이슈 체크
    this.checkStructureIssues(content, filePath);
    
    // 정리 필요 체크
    this.checkCleanupIssues(content, filePath);
  }

  checkPerformanceIssues(content, filePath) {
    const issues = [];
    
    // 큰 번들 임포트
    if (content.includes("import * as")) {
      issues.push("전체 라이브러리 import 발견");
    }
    
    // 인라인 함수
    const inlineFunctions = content.match(/onClick=\{.*=>/g);
    if (inlineFunctions && inlineFunctions.length > 3) {
      issues.push("인라인 함수 과다 사용");
    }
    
    // memo 없이 복잡한 컴포넌트
    if (content.includes('useEffect') && content.includes('useState') && !content.includes('memo')) {
      issues.push("memo 최적화 없는 복잡한 컴포넌트");
    }

    if (issues.length > 0) {
      this.stats.issuesByType.performance.push({
        file: filePath,
        issues: issues
      });
    }
  }

  checkStructureIssues(content, filePath) {
    const issues = [];
    
    // 긴 컴포넌트 (100줄 이상)
    if (content.split('\n').length > 100) {
      issues.push("큰 컴포넌트 - 분할 필요");
    }
    
    // 하드코딩된 텍스트
    const koreanText = content.match(/['"`][^'"`]*[가-힣]+[^'"`]*['"`]/g);
    if (koreanText && koreanText.length > 5) {
      issues.push("하드코딩된 한국어 텍스트 - 다국어 처리 필요");
    }
    
    // 중복 CSS 클래스
    const classNames = content.match(/className="[^"]*"/g);
    if (classNames) {
      const duplicates = classNames.filter((item, index) => classNames.indexOf(item) !== index);
      if (duplicates.length > 0) {
        issues.push("중복 CSS 클래스");
      }
    }

    if (issues.length > 0) {
      this.stats.issuesByType.structure.push({
        file: filePath,
        issues: issues
      });
    }
  }

  checkCleanupIssues(content, filePath) {
    const issues = [];
    
    // console.log
    if (content.includes('console.log')) {
      issues.push("console.log 정리 필요");
    }
    
    // 사용되지 않는 import
    const imports = content.match(/import.*from/g);
    if (imports) {
      imports.forEach(imp => {
        const imported = imp.match(/import\s+{([^}]+)}/);
        if (imported) {
          const items = imported[1].split(',').map(s => s.trim());
          items.forEach(item => {
            if (!content.includes(item.replace(/\s+as\s+\w+/, '')) || content.indexOf(item) === content.lastIndexOf(item)) {
              issues.push(`사용되지 않는 import: ${item}`);
            }
          });
        }
      });
    }
    
    // 빈 useEffect
    if (content.includes('useEffect(() => {}, [])')) {
      issues.push("빈 useEffect");
    }

    if (issues.length > 0) {
      this.stats.issuesByType.cleanup.push({
        file: filePath,
        issues: issues
      });
    }
  }

  scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        this.scanDirectory(filePath);
      } else if (file.match(/\.(ts|tsx|js|jsx)$/)) {
        this.analyzeFile(filePath);
      }
    });
  }

  generateReport() {
    console.log('\n🔍 SAYU 코드베이스 분석 리포트\n');
    console.log('=' * 50);
    
    console.log(`📊 전체 통계:`);
    console.log(`   파일 수: ${this.stats.totalFiles}`);
    console.log(`   총 코드 라인: ${this.stats.totalLines.toLocaleString()}`);
    console.log(`   TODO/FIXME: ${this.stats.todoCount}개`);
    
    // 큰 파일들
    if (this.stats.largeFiles.length > 0) {
      console.log(`\n📦 큰 파일들 (100줄 이상):`);
      this.stats.largeFiles
        .sort((a, b) => b.lines - a.lines)
        .slice(0, 10)
        .forEach(file => {
          console.log(`   ${file.file}: ${file.lines}줄 (${file.size})`);
        });
    }
    
    // 중복 파일명
    const duplicates = Object.entries(this.stats.duplicateNames)
      .filter(([name, files]) => files.length > 1);
    
    if (duplicates.length > 0) {
      console.log(`\n🔄 중복 파일명:`);
      duplicates.forEach(([name, files]) => {
        console.log(`   ${name}: ${files.length}개 파일`);
        files.forEach(file => console.log(`     - ${file}`));
      });
    }
    
    // 이슈별 정리
    console.log(`\n⚡ 성능 이슈: ${this.stats.issuesByType.performance.length}개 파일`);
    console.log(`🏗️  구조 이슈: ${this.stats.issuesByType.structure.length}개 파일`);
    console.log(`🧹 정리 이슈: ${this.stats.issuesByType.cleanup.length}개 파일`);
    
    return this.stats;
  }

  generateActionPlan() {
    console.log('\n📋 액션 플랜\n');
    
    console.log('🔥 즉시 처리 (High Priority):');
    const highPriority = [
      ...this.stats.issuesByType.cleanup.slice(0, 5),
      ...this.stats.largeFiles.slice(0, 3).map(f => ({ file: f.file, issues: ['파일 분할 필요'] }))
    ];
    
    highPriority.forEach((item, i) => {
      console.log(`   ${i + 1}. ${path.basename(item.file)}`);
      item.issues.forEach(issue => console.log(`      - ${issue}`));
    });
    
    console.log('\n📅 다음 주 처리 (Medium Priority):');
    this.stats.issuesByType.structure.slice(0, 5).forEach((item, i) => {
      console.log(`   ${i + 1}. ${path.basename(item.file)}`);
      item.issues.forEach(issue => console.log(`      - ${issue}`));
    });
    
    console.log('\n⏰ 시간 날 때 (Low Priority):');
    this.stats.issuesByType.performance.slice(0, 3).forEach((item, i) => {
      console.log(`   ${i + 1}. ${path.basename(item.file)}`);
      item.issues.forEach(issue => console.log(`      - ${issue}`));
    });
  }

  run() {
    console.log('🚀 분석 시작...');
    this.scanDirectory(this.srcPath);
    this.generateReport();
    this.generateActionPlan();
    
    // JSON 파일로 상세 결과 저장
    fs.writeFileSync(
      'codebase-analysis.json', 
      JSON.stringify(this.stats, null, 2)
    );
    console.log('\n💾 상세 분석 결과가 codebase-analysis.json에 저장되었습니다.');
  }
}

// 실행
new CodebaseAnalyzer('./src').run();