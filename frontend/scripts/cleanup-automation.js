#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class AutoCleanup {
  constructor(srcPath = './src') {
    this.srcPath = srcPath;
    this.changes = [];
    this.backupDir = './backup-' + Date.now();
  }

  // 백업 생성
  createBackup() {
    console.log('💾 백업 생성 중...');
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
    
    this.copyDirectory(this.srcPath, path.join(this.backupDir, 'src'));
    console.log(`✅ 백업 완료: ${this.backupDir}`);
  }

  copyDirectory(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    const files = fs.readdirSync(src);
    files.forEach(file => {
      const srcFile = path.join(src, file);
      const destFile = path.join(dest, file);
      
      if (fs.statSync(srcFile).isDirectory()) {
        this.copyDirectory(srcFile, destFile);
      } else {
        fs.copyFileSync(srcFile, destFile);
      }
    });
  }

  // 1. console.log 제거
  removeConsoleLogs(content, filePath) {
    const original = content;
    
    // console.log, console.warn, console.error 제거 (단, console.error는 에러 핸들링에서 제외)
    const cleaned = content
      .replace(/^\s*console\.log\([^)]*\);\s*$/gm, '') // 단독 라인
      .replace(/console\.log\([^)]*\);\s*/g, '') // 인라인
      .replace(/^\s*console\.warn\([^)]*\);\s*$/gm, '')
      .replace(/console\.warn\([^)]*\);\s*/g, '');
    
    if (original !== cleaned) {
      this.changes.push({
        type: 'CONSOLE_REMOVAL',
        file: filePath,
        description: 'console.log/warn 제거'
      });
    }
    
    return cleaned;
  }

  // 2. 사용되지 않는 imports 정리
  cleanupImports(content, filePath) {
    const lines = content.split('\n');
    const importLines = [];
    const codeLines = [];
    let inImportSection = false;
    
    lines.forEach(line => {
      if (line.trim().startsWith('import ') || line.trim().startsWith('export ')) {
        importLines.push(line);
        inImportSection = true;
      } else if (inImportSection && line.trim() === '') {
        importLines.push(line);
      } else {
        inImportSection = false;
        codeLines.push(line);
      }
    });
    
    const codeContent = codeLines.join('\n');
    const cleanedImports = [];
    
    importLines.forEach(line => {
      if (line.trim() === '') {
        cleanedImports.push(line);
        return;
      }
      
      // import { A, B, C } from 'module' 형태 처리
      const namedImportMatch = line.match(/import\s+{\s*([^}]+)\s*}\s+from\s+['"`]([^'"`]+)['"`]/);
      if (namedImportMatch) {
        const importedItems = namedImportMatch[1]
          .split(',')
          .map(item => item.trim().split(' as ')[0].trim())
          .filter(item => {
            // 코드에서 실제 사용되는지 체크
            const regex = new RegExp(`\\b${item}\\b`);
            return regex.test(codeContent);
          });
        
        if (importedItems.length > 0) {
          const newLine = `import { ${importedItems.join(', ')} } from '${namedImportMatch[2]}';`;
          cleanedImports.push(newLine);
          
          if (importedItems.length !== namedImportMatch[1].split(',').length) {
            this.changes.push({
              type: 'IMPORT_CLEANUP',
              file: filePath,
              description: `사용되지 않는 import 제거: ${namedImportMatch[2]}`
            });
          }
        } else {
          this.changes.push({
            type: 'IMPORT_REMOVAL',
            file: filePath,
            description: `전체 import 제거: ${namedImportMatch[2]}`
          });
        }
      } else {
        // default import나 전체 import는 그대로 유지
        cleanedImports.push(line);
      }
    });
    
    return cleanedImports.join('\n') + '\n' + codeContent;
  }

  // 3. 중복 클래스명 통합
  optimizeClassNames(content, filePath) {
    const classPatterns = content.match(/className="[^"]*"/g);
    if (!classPatterns) return content;
    
    const classMap = {};
    classPatterns.forEach(pattern => {
      const classes = pattern.match(/"([^"]*)"/)[1];
      if (classMap[classes]) {
        classMap[classes].count++;
      } else {
        classMap[classes] = { count: 1, pattern };
      }
    });
    
    // 3번 이상 반복되는 클래스는 상수로 추출 제안
    const frequentClasses = Object.entries(classMap)
      .filter(([classes, info]) => info.count >= 3)
      .map(([classes]) => classes);
    
    if (frequentClasses.length > 0) {
      this.changes.push({
        type: 'CLASS_OPTIMIZATION',
        file: filePath,
        description: `반복 클래스 발견: ${frequentClasses.slice(0, 3).join(', ')}`
      });
    }
    
    return content;
  }

  // 4. 타입 정의 개선
  improveTypes(content, filePath) {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return content;
    
    let improved = content;
    
    // any 타입 체크
    const anyUsage = content.match(/:\s*any/g);
    if (anyUsage && anyUsage.length > 0) {
      this.changes.push({
        type: 'TYPE_IMPROVEMENT',
        file: filePath,
        description: `any 타입 ${anyUsage.length}개 발견 - 구체적 타입 정의 필요`
      });
    }
    
    // interface vs type 일관성 체크
    const interfaceCount = (content.match(/interface\s+\w+/g) || []).length;
    const typeCount = (content.match(/type\s+\w+\s*=/g) || []).length;
    
    if (interfaceCount > 0 && typeCount > 0) {
      this.changes.push({
        type: 'TYPE_CONSISTENCY',
        file: filePath,
        description: 'interface와 type 혼용 - 일관성 필요'
      });
    }
    
    return improved;
  }

  // 5. 파일 처리
  processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // 각 정리 작업 실행
    content = this.removeConsoleLogs(content, filePath);
    content = this.cleanupImports(content, filePath);
    content = this.optimizeClassNames(content, filePath);
    content = this.improveTypes(content, filePath);
    
    // 변경사항이 있으면 파일 업데이트
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`🧹 정리 완료: ${path.basename(filePath)}`);
    }
  }

  // 6. 디렉토리 스캔
  scanAndClean(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        this.scanAndClean(filePath);
      } else if (file.match(/\.(ts|tsx|js|jsx)$/)) {
        this.processFile(filePath);
      }
    });
  }

  // 7. 리포트 생성
  generateCleanupReport() {
    console.log('\n📊 정리 완료 리포트\n');
    console.log('=' * 40);
    
    const changesByType = {};
    this.changes.forEach(change => {
      if (!changesByType[change.type]) {
        changesByType[change.type] = [];
      }
      changesByType[change.type].push(change);
    });
    
    Object.entries(changesByType).forEach(([type, changes]) => {
      const typeNames = {
        'CONSOLE_REMOVAL': '🚫 Console.log 제거',
        'IMPORT_CLEANUP': '📦 Import 정리',
        'IMPORT_REMOVAL': '🗑️  Import 제거',
        'CLASS_OPTIMIZATION': '🎨 클래스 최적화',
        'TYPE_IMPROVEMENT': '📝 타입 개선',
        'TYPE_CONSISTENCY': '🔄 타입 일관성'
      };
      
      console.log(`${typeNames[type] || type}: ${changes.length}개 파일`);
      changes.slice(0, 5).forEach(change => {
        console.log(`   - ${path.basename(change.file)}: ${change.description}`);
      });
      if (changes.length > 5) {
        console.log(`   ... 및 ${changes.length - 5}개 더`);
      }
      console.log('');
    });
    
    // 변경사항 JSON으로 저장
    fs.writeFileSync(
      'cleanup-report.json',
      JSON.stringify({
        timestamp: new Date().toISOString(),
        totalChanges: this.changes.length,
        changesByType,
        backupLocation: this.backupDir
      }, null, 2)
    );
    
    console.log(`💾 상세 리포트: cleanup-report.json`);
    console.log(`🔙 백업 위치: ${this.backupDir}`);
  }

  // 8. 실행
  run(options = {}) {
    console.log('🧹 SAYU 자동 정리 시작...\n');
    
    // 백업 생성
    if (options.backup !== false) {
      this.createBackup();
    }
    
    // 정리 실행
    console.log('\n🔄 코드 정리 중...');
    this.scanAndClean(this.srcPath);
    
    // 리포트 생성
    this.generateCleanupReport();
    
    console.log('\n✨ 자동 정리 완료!');
    console.log('📝 변경사항을 검토한 후 git commit을 진행하세요.');
  }
}

// 실행
const cleanup = new AutoCleanup('./src');
cleanup.run();