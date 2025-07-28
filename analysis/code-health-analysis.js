#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

class CodeHealthAnalyzer {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      overview: {},
      fileStats: {},
      duplicatePatterns: [],
      largeFiles: [],
      complexFunctions: [],
      unusedFiles: [],
      recommendations: []
    };
  }

  async analyze() {
    console.log('🔍 코드베이스 건강 상태 분석을 시작합니다...\n');
    
    await this.analyzeOverview();
    await this.analyzeFileStats();
    await this.findLargeFiles();
    await this.findComplexPatterns();
    await this.generateRecommendations();
    
    return this.results;
  }

  async analyzeOverview() {
    console.log('📊 전체 개요 분석 중...');
    
    const tsFiles = glob.sync('**/*.{ts,tsx}', { ignore: ['**/node_modules/**', '**/dist/**', '**/.next/**'] });
    const jsFiles = glob.sync('**/*.{js,jsx}', { ignore: ['**/node_modules/**', '**/dist/**', '**/.next/**'] });
    const mdFiles = glob.sync('**/*.md', { ignore: ['**/node_modules/**'] });
    
    this.results.overview = {
      totalTSFiles: tsFiles.length,
      totalJSFiles: jsFiles.length,
      totalMDFiles: mdFiles.length,
      totalCodeFiles: tsFiles.length + jsFiles.length,
      directories: {
        frontend: this.countFilesInDir('frontend'),
        backend: this.countFilesInDir('backend'),
        shared: this.countFilesInDir('shared'),
        docs: mdFiles.length
      }
    };
    
    console.log(`✅ 총 ${this.results.overview.totalCodeFiles}개 코드 파일 발견`);
    console.log(`   - TypeScript: ${this.results.overview.totalTSFiles}개`);
    console.log(`   - JavaScript: ${this.results.overview.totalJSFiles}개`);
    console.log(`   - Markdown: ${this.results.overview.totalMDFiles}개\n`);
  }

  countFilesInDir(dirName) {
    try {
      const files = glob.sync(`${dirName}/**/*.{ts,tsx,js,jsx}`, { 
        ignore: ['**/node_modules/**', '**/dist/**', '**/.next/**'] 
      });
      return files.length;
    } catch (error) {
      return 0;
    }
  }

  async analyzeFileStats() {
    console.log('📈 파일별 통계 분석 중...');
    
    const allFiles = glob.sync('**/*.{ts,tsx,js,jsx}', { 
      ignore: ['**/node_modules/**', '**/dist/**', '**/.next/**'] 
    });
    
    const stats = {
      bySize: [],
      byLines: [],
      totalLines: 0,
      averageFileSize: 0
    };
    
    for (const file of allFiles) {
      try {
        const content = await fs.readFile(file, 'utf8');
        const lines = content.split('\n').length;
        const size = Buffer.byteLength(content, 'utf8');
        
        stats.bySize.push({ file, size });
        stats.byLines.push({ file, lines });
        stats.totalLines += lines;
      } catch (error) {
        console.warn(`⚠️  ${file} 읽기 실패:`, error.message);
      }
    }
    
    stats.averageFileSize = Math.round(stats.totalLines / allFiles.length);
    stats.bySize.sort((a, b) => b.size - a.size);
    stats.byLines.sort((a, b) => b.lines - a.lines);
    
    this.results.fileStats = stats;
    console.log(`✅ 총 ${stats.totalLines.toLocaleString()}줄 코드 분석 완료`);
    console.log(`   - 평균 파일 크기: ${stats.averageFileSize}줄\n`);
  }

  async findLargeFiles() {
    console.log('🔍 대용량 파일 탐지 중...');
    
    const LARGE_FILE_THRESHOLD = 500; // 500줄 이상
    const largeFiles = this.results.fileStats.byLines
      .filter(item => item.lines > LARGE_FILE_THRESHOLD)
      .slice(0, 20); // 상위 20개만
    
    this.results.largeFiles = largeFiles;
    console.log(`⚠️  ${LARGE_FILE_THRESHOLD}줄 이상 대용량 파일: ${largeFiles.length}개`);
    
    if (largeFiles.length > 0) {
      console.log('   상위 5개:');
      largeFiles.slice(0, 5).forEach(({ file, lines }, index) => {
        console.log(`   ${index + 1}. ${file} (${lines}줄)`);
      });
    }
    console.log();
  }

  async findComplexPatterns() {
    console.log('🧩 복잡한 패턴 탐지 중...');
    
    const patterns = {
      longFunctions: [],
      deepNesting: [],
      manyImports: [],
      suspiciousPatterns: []
    };
    
    const allFiles = glob.sync('**/*.{ts,tsx,js,jsx}', { 
      ignore: ['**/node_modules/**', '**/dist/**', '**/.next/**'] 
    });
    
    for (const file of allFiles.slice(0, 100)) { // 샘플링으로 성능 최적화
      try {
        const content = await fs.readFile(file, 'utf8');
        
        // 긴 함수 탐지
        const functionMatches = content.match(/function\s+\w+[^{]*{[^}]*}/g) || [];
        functionMatches.forEach(func => {
          const lines = func.split('\n').length;
          if (lines > 50) {
            patterns.longFunctions.push({ file, lines, preview: func.substring(0, 100) });
          }
        });
        
        // 많은 import 탐지
        const importCount = (content.match(/^import\s+/gm) || []).length;
        if (importCount > 20) {
          patterns.manyImports.push({ file, imports: importCount });
        }
        
        // 수상한 패턴 탐지
        if (content.includes('TODO') || content.includes('FIXME') || content.includes('HACK')) {
          const todos = (content.match(/TODO|FIXME|HACK/g) || []).length;
          patterns.suspiciousPatterns.push({ file, todos });
        }
        
      } catch (error) {
        // 파일 읽기 실패는 무시
      }
    }
    
    this.results.complexFunctions = patterns.longFunctions.slice(0, 10);
    console.log(`⚠️  복잡한 패턴 발견:`);
    console.log(`   - 긴 함수: ${patterns.longFunctions.length}개`);
    console.log(`   - 많은 imports: ${patterns.manyImports.length}개`);
    console.log(`   - TODO/FIXME: ${patterns.suspiciousPatterns.reduce((sum, p) => sum + p.todos, 0)}개\n`);
  }

  async generateRecommendations() {
    console.log('💡 개선 권장사항 생성 중...');
    
    const recommendations = [];
    
    // 대용량 파일 권장사항
    if (this.results.largeFiles.length > 10) {
      recommendations.push({
        priority: 'high',
        category: 'file-size',
        title: '대용량 파일 분할 필요',
        description: `${this.results.largeFiles.length}개의 대용량 파일이 발견되었습니다. 단일 책임 원칙에 따라 분할을 고려하세요.`,
        action: 'large files를 기능별로 분할하고 shared utilities로 공통 로직 추출'
      });
    }
    
    // 전체적인 구조 권장사항
    if (this.results.overview.totalCodeFiles > 1000) {
      recommendations.push({
        priority: 'high',
        category: 'architecture',
        title: '프로젝트 구조 리팩토링 필요',
        description: `${this.results.overview.totalCodeFiles}개의 파일로 구성된 대규모 프로젝트입니다. 모듈화가 필요합니다.`,
        action: 'feature-based 폴더 구조로 리팩토링하고 공통 컴포넌트 분리'
      });
    }
    
    // TypeScript vs JavaScript 권장사항
    const jsRatio = this.results.overview.totalJSFiles / this.results.overview.totalCodeFiles;
    if (jsRatio > 0.3) {
      recommendations.push({
        priority: 'medium',
        category: 'typescript',
        title: 'TypeScript 마이그레이션 권장',
        description: `JavaScript 파일 비율이 ${Math.round(jsRatio * 100)}%입니다. 타입 안정성을 위해 TypeScript 마이그레이션을 고려하세요.`,
        action: 'JavaScript 파일들을 단계적으로 TypeScript로 마이그레이션'
      });
    }
    
    this.results.recommendations = recommendations;
    console.log(`✅ ${recommendations.length}개의 권장사항 생성 완료\n`);
  }

  async saveReport() {
    const reportPath = path.join('analysis', `code-health-report-${Date.now()}.json`);
    await fs.ensureDir('analysis');
    await fs.writeJSON(reportPath, this.results, { spaces: 2 });
    
    // 간단한 요약 리포트도 생성
    const summaryPath = path.join('analysis', 'summary.md');
    const summary = this.generateMarkdownSummary();
    await fs.writeFile(summaryPath, summary);
    
    console.log(`📋 상세 리포트: ${reportPath}`);
    console.log(`📋 요약 리포트: ${summaryPath}`);
    
    return { reportPath, summaryPath };
  }

  generateMarkdownSummary() {
    const { overview, fileStats, largeFiles, recommendations } = this.results;
    
    return `# SAYU 코드베이스 건강 상태 분석 리포트
*생성일: ${new Date().toLocaleString('ko-KR')}*

## 📊 전체 개요
- **총 코드 파일**: ${overview.totalCodeFiles.toLocaleString()}개
- **TypeScript 파일**: ${overview.totalTSFiles.toLocaleString()}개
- **JavaScript 파일**: ${overview.totalJSFiles.toLocaleString()}개
- **총 코드 라인**: ${fileStats.totalLines.toLocaleString()}줄
- **평균 파일 크기**: ${fileStats.averageFileSize}줄

## 🏗️ 디렉토리별 파일 수
- **Frontend**: ${overview.directories.frontend}개
- **Backend**: ${overview.directories.backend}개
- **Shared**: ${overview.directories.shared}개
- **Documentation**: ${overview.directories.docs}개

## ⚠️ 주요 문제점
${largeFiles.length > 0 ? `### 대용량 파일 (500줄 이상)
${largeFiles.slice(0, 10).map(f => `- \`${f.file}\` (${f.lines}줄)`).join('\n')}
` : ''}

## 💡 권장사항
${recommendations.map((r, i) => `### ${i + 1}. ${r.title} (${r.priority})
**분류**: ${r.category}
**설명**: ${r.description}
**조치**: ${r.action}
`).join('\n')}

## 🎯 다음 단계
1. **즉시 조치 필요**: ${recommendations.filter(r => r.priority === 'high').length}개 항목
2. **계획적 개선**: ${recommendations.filter(r => r.priority === 'medium').length}개 항목
3. **장기 계획**: ${recommendations.filter(r => r.priority === 'low').length}개 항목

---
*이 리포트는 자동 생성되었습니다. 정확한 분석을 위해 수동 검토가 필요할 수 있습니다.*
`;
  }
}

// 실행
if (require.main === module) {
  (async () => {
    try {
      const analyzer = new CodeHealthAnalyzer();
      const results = await analyzer.analyze();
      const { reportPath, summaryPath } = await analyzer.saveReport();
      
      console.log('\n🎉 분석 완료!');
      console.log('\n📋 주요 발견사항:');
      results.recommendations.forEach((rec, i) => {
        console.log(`${i + 1}. [${rec.priority.toUpperCase()}] ${rec.title}`);
      });
      
      console.log(`\n📁 상세 결과: ${reportPath}`);
      console.log(`📁 요약 결과: ${summaryPath}`);
      
    } catch (error) {
      console.error('❌ 분석 중 오류 발생:', error);
      process.exit(1);
    }
  })();
}

module.exports = CodeHealthAnalyzer;