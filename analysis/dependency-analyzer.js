#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

class DependencyAnalyzer {
  constructor() {
    this.dependencies = new Map();
    this.circularDeps = [];
    this.results = {
      timestamp: new Date().toISOString(),
      stats: {},
      circularDependencies: [],
      complexModules: [],
      isolatedModules: [],
      recommendations: []
    };
  }

  async analyze() {
    console.log('🔄 의존성 분석을 시작합니다...\n');
    
    await this.buildDependencyGraph();
    await this.findCircularDependencies();
    await this.analyzeComplexity();
    await this.generateRecommendations();
    
    return this.results;
  }

  async buildDependencyGraph() {
    console.log('📊 의존성 그래프 구성 중...');
    
    const files = glob.sync('**/*.{ts,tsx,js,jsx}', { 
      ignore: ['**/node_modules/**', '**/dist/**', '**/.next/**', '**/analysis/**'] 
    });
    
    let processedFiles = 0;
    
    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf8');
        const deps = this.extractDependencies(content, file);
        this.dependencies.set(file, deps);
        
        processedFiles++;
        if (processedFiles % 100 === 0) {
          console.log(`   처리됨: ${processedFiles}/${files.length} 파일`);
        }
      } catch (error) {
        console.warn(`⚠️  ${file} 처리 실패:`, error.message);
      }
    }
    
    console.log(`✅ ${processedFiles}개 파일의 의존성 그래프 구성 완료\n`);
  }

  extractDependencies(content, currentFile) {
    const dependencies = {
      local: [],
      external: [],
      relative: []
    };
    
    // import 구문 파싱
    const importRegex = /import\s+(?:[\w\s{},*]+\s+from\s+)?['"](.*?)['"];?/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];
      
      if (importPath.startsWith('.')) {
        // 상대 경로 - 로컬 의존성
        const resolvedPath = this.resolvePath(currentFile, importPath);
        dependencies.local.push({
          path: importPath,
          resolved: resolvedPath,
          file: currentFile
        });
      } else if (!importPath.startsWith('@') && !this.isNodeModule(importPath)) {
        // 절대 경로 - 프로젝트 내부
        dependencies.relative.push({
          path: importPath,
          file: currentFile
        });
      } else {
        // 외부 라이브러리
        dependencies.external.push({
          path: importPath,
          file: currentFile
        });
      }
    }
    
    // require 구문도 처리
    const requireRegex = /require\s*\(\s*['"](.*?)['"]\s*\)/g;
    while ((match = requireRegex.exec(content)) !== null) {
      const requirePath = match[1];
      if (requirePath.startsWith('.')) {
        const resolvedPath = this.resolvePath(currentFile, requirePath);
        dependencies.local.push({
          path: requirePath,
          resolved: resolvedPath,
          file: currentFile
        });
      }
    }
    
    return dependencies;
  }

  resolvePath(currentFile, relativePath) {
    const currentDir = path.dirname(currentFile);
    let resolved = path.resolve(currentDir, relativePath);
    
    // 확장자 추가 시도
    const extensions = ['.ts', '.tsx', '.js', '.jsx'];
    if (!path.extname(resolved)) {
      for (const ext of extensions) {
        const withExt = resolved + ext;
        if (fs.existsSync(withExt)) {
          return path.relative('.', withExt).replace(/\\/g, '/');
        }
      }
      
      // index 파일 시도
      for (const ext of extensions) {
        const indexFile = path.join(resolved, 'index' + ext);
        if (fs.existsSync(indexFile)) {
          return path.relative('.', indexFile).replace(/\\/g, '/');
        }
      }
    }
    
    return path.relative('.', resolved).replace(/\\/g, '/');
  }

  isNodeModule(importPath) {
    const nodeModules = [
      'react', 'next', 'express', 'fs', 'path', 'crypto',
      'axios', 'lodash', 'moment', 'uuid', '@types',
      'typescript', 'jest', 'eslint'
    ];
    
    return nodeModules.some(mod => importPath.startsWith(mod));
  }

  async findCircularDependencies() {
    console.log('🔄 순환 의존성 탐지 중...');
    
    const visited = new Set();
    const recursionStack = new Set();
    const cycles = [];
    
    for (const [file, deps] of this.dependencies) {
      if (!visited.has(file)) {
        const path = [];
        this.dfsCircular(file, visited, recursionStack, path, cycles);
      }
    }
    
    // 중복 제거 및 정리
    const uniqueCycles = this.deduplicateCycles(cycles);
    
    this.results.circularDependencies = uniqueCycles.map(cycle => ({
      files: cycle,
      severity: this.calculateCycleSeverity(cycle),
      suggestion: this.suggestCycleFix(cycle)
    }));
    
    console.log(`⚠️  순환 의존성 발견: ${uniqueCycles.length}개`);
    if (uniqueCycles.length > 0) {
      console.log('   상위 3개:');
      uniqueCycles.slice(0, 3).forEach((cycle, i) => {
        console.log(`   ${i + 1}. ${cycle.join(' → ')}`);
      });
    }
    console.log();
  }

  dfsCircular(node, visited, recursionStack, path, cycles) {
    visited.add(node);
    recursionStack.add(node);
    path.push(node);
    
    const deps = this.dependencies.get(node);
    if (deps) {
      for (const dep of deps.local) {
        const target = dep.resolved;
        
        if (recursionStack.has(target)) {
          // 순환 발견
          const cycleStart = path.indexOf(target);
          if (cycleStart !== -1) {
            const cycle = path.slice(cycleStart).concat([target]);
            cycles.push(cycle);
          }
        } else if (!visited.has(target)) {
          this.dfsCircular(target, visited, recursionStack, [...path], cycles);
        }
      }
    }
    
    recursionStack.delete(node);
  }

  deduplicateCycles(cycles) {
    const unique = [];
    const seen = new Set();
    
    for (const cycle of cycles) {
      // 순환을 정규화 (가장 작은 파일명으로 시작)
      const minIndex = cycle.indexOf(Math.min(...cycle));
      const normalized = cycle.slice(minIndex).concat(cycle.slice(0, minIndex));
      const key = normalized.join('→');
      
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(normalized);
      }
    }
    
    return unique;
  }

  calculateCycleSeverity(cycle) {
    // 순환의 길이와 관련된 파일들의 복잡도로 심각도 계산
    if (cycle.length <= 2) return 'low';
    if (cycle.length <= 4) return 'medium';
    return 'high';
  }

  suggestCycleFix(cycle) {
    if (cycle.length === 2) {
      return '두 파일 간의 직접적인 순환입니다. 공통 로직을 별도 파일로 추출하거나 인터페이스를 활용하세요.';
    } else if (cycle.length <= 4) {
      return '중간 정도 복잡도의 순환입니다. 의존성 주입이나 이벤트 시스템을 고려하세요.';
    } else {
      return '복잡한 순환 의존성입니다. 아키텍처 리팩토링이 필요합니다.';
    }
  }

  async analyzeComplexity() {
    console.log('📈 모듈 복잡도 분석 중...');
    
    const complexityStats = [];
    
    for (const [file, deps] of this.dependencies) {
      const totalDeps = deps.local.length + deps.relative.length;
      const externalDeps = deps.external.length;
      
      // 이 파일을 참조하는 다른 파일들의 수 계산
      let dependents = 0;
      for (const [otherFile, otherDeps] of this.dependencies) {
        if (otherFile !== file) {
          const references = otherDeps.local.filter(dep => 
            dep.resolved === file || dep.resolved.includes(file)
          );
          dependents += references.length;
        }
      }
      
      const complexity = {
        file,
        internalDependencies: totalDeps,
        externalDependencies: externalDeps,
        dependents,
        complexityScore: totalDeps * 2 + dependents
      };
      
      complexityStats.push(complexity);
    }
    
    // 복잡도로 정렬
    complexityStats.sort((a, b) => b.complexityScore - a.complexityScore);
    
    this.results.complexModules = complexityStats.slice(0, 20);
    this.results.isolatedModules = complexityStats.filter(m => 
      m.internalDependencies === 0 && m.dependents === 0
    ).slice(0, 10);
    
    console.log(`📊 복잡도 분석 완료:`);
    console.log(`   - 가장 복잡한 모듈: ${complexityStats[0]?.file || 'N/A'}`);
    console.log(`   - 고립된 모듈: ${this.results.isolatedModules.length}개`);
    console.log();
  }

  async generateRecommendations() {
    console.log('💡 개선 권장사항 생성 중...');
    
    const recommendations = [];
    
    // 순환 의존성 권장사항
    if (this.results.circularDependencies.length > 0) {
      recommendations.push({
        priority: 'high',
        category: 'circular-dependency',
        title: '순환 의존성 해결 필요',
        description: `${this.results.circularDependencies.length}개의 순환 의존성이 발견되었습니다.`,
        action: '의존성 주입, 인터페이스 분리, 또는 이벤트 기반 아키텍처로 해결',
        affectedFiles: this.results.circularDependencies.slice(0, 5).map(c => c.files).flat()
      });
    }
    
    // 복잡한 모듈 권장사항
    const highComplexityModules = this.results.complexModules.filter(m => m.complexityScore > 20);
    if (highComplexityModules.length > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'complexity',
        title: '복잡한 모듈 단순화 필요',
        description: `${highComplexityModules.length}개의 모듈이 과도하게 복잡합니다.`,
        action: '단일 책임 원칙에 따라 모듈을 분할하고 의존성을 줄이세요',
        affectedFiles: highComplexityModules.slice(0, 5).map(m => m.file)
      });
    }
    
    // 고립된 모듈 권장사항
    if (this.results.isolatedModules.length > 5) {
      recommendations.push({
        priority: 'low',
        category: 'unused-code',
        title: '사용되지 않는 모듈 정리',
        description: `${this.results.isolatedModules.length}개의 고립된 모듈이 발견되었습니다.`,
        action: '실제로 사용되지 않는다면 제거를 고려하세요',
        affectedFiles: this.results.isolatedModules.map(m => m.file)
      });
    }
    
    this.results.recommendations = recommendations;
    console.log(`✅ ${recommendations.length}개의 권장사항 생성 완료\n`);
  }

  async saveReport() {
    const reportPath = path.join('analysis', `dependency-report-${Date.now()}.json`);
    await fs.ensureDir('analysis');
    await fs.writeJSON(reportPath, this.results, { spaces: 2 });
    
    const summaryPath = path.join('analysis', 'dependency-summary.md');
    const summary = this.generateMarkdownSummary();
    await fs.writeFile(summaryPath, summary);
    
    console.log(`📋 의존성 분석 리포트: ${reportPath}`);
    console.log(`📋 의존성 요약: ${summaryPath}`);
    
    return { reportPath, summaryPath };
  }

  generateMarkdownSummary() {
    const { circularDependencies, complexModules, isolatedModules, recommendations } = this.results;
    
    return `# SAYU 의존성 분석 리포트
*생성일: ${new Date().toLocaleString('ko-KR')}*

## 🔄 순환 의존성
**발견된 순환**: ${circularDependencies.length}개

${circularDependencies.slice(0, 5).map((cycle, i) => `### ${i + 1}. ${cycle.severity} 심각도
**파일들**: ${cycle.files.join(' → ')}
**제안**: ${cycle.suggestion}
`).join('\n')}

## 📊 복잡한 모듈 (상위 10개)
${complexModules.slice(0, 10).map((mod, i) => `${i + 1}. \`${mod.file}\`
   - 내부 의존성: ${mod.internalDependencies}개
   - 참조하는 모듈: ${mod.dependents}개
   - 복잡도 점수: ${mod.complexityScore}
`).join('\n')}

## 🏝️ 고립된 모듈
${isolatedModules.length > 0 ? isolatedModules.map(mod => `- \`${mod.file}\``).join('\n') : '고립된 모듈이 발견되지 않았습니다.'}

## 💡 권장사항
${recommendations.map((rec, i) => `### ${i + 1}. ${rec.title} (${rec.priority})
**분류**: ${rec.category}
**설명**: ${rec.description}
**조치**: ${rec.action}
${rec.affectedFiles ? `**영향받는 파일**: ${rec.affectedFiles.slice(0, 3).join(', ')}${rec.affectedFiles.length > 3 ? ` 외 ${rec.affectedFiles.length - 3}개` : ''}` : ''}
`).join('\n')}

## 🎯 우선순위별 조치 계획
1. **긴급 (High)**: ${recommendations.filter(r => r.priority === 'high').length}개 항목
2. **중요 (Medium)**: ${recommendations.filter(r => r.priority === 'medium').length}개 항목  
3. **보통 (Low)**: ${recommendations.filter(r => r.priority === 'low').length}개 항목

---
*의존성 분석은 코드 개선의 첫 번째 단계입니다. 단계별로 차근차근 해결해 나가세요.*
`;
  }
}

// 실행
if (require.main === module) {
  (async () => {
    try {
      const analyzer = new DependencyAnalyzer();
      const results = await analyzer.analyze();
      const { reportPath, summaryPath } = await analyzer.saveReport();
      
      console.log('\n🎉 의존성 분석 완료!');
      console.log('\n📋 주요 발견사항:');
      results.recommendations.forEach((rec, i) => {
        console.log(`${i + 1}. [${rec.priority.toUpperCase()}] ${rec.title}`);
      });
      
    } catch (error) {
      console.error('❌ 분석 중 오류 발생:', error);
      process.exit(1);
    }
  })();
}

module.exports = DependencyAnalyzer;