/**
 * Artmap 프로젝트 전체 검토 및 DB 적용 테스트
 */

const fs = require('fs');
const path = require('path');

class ArtmapProjectReview {
  constructor() {
    this.baseDir = process.cwd();
    this.findings = {
      files: {},
      dataQuality: {},
      dbIntegration: {},
      issues: [],
      recommendations: []
    };
  }

  async reviewProject() {
    console.log('🔍 ARTMAP PROJECT COMPREHENSIVE REVIEW');
    console.log('=====================================\n');

    // 1. 생성된 파일들 검토
    await this.reviewGeneratedFiles();
    
    // 2. 데이터 품질 검토
    await this.reviewDataQuality();
    
    // 3. DB 통합 검토
    await this.reviewDatabaseIntegration();
    
    // 4. 최종 권고사항
    this.generateRecommendations();
    
    // 5. 보고서 생성
    this.generateReport();
  }

  async reviewGeneratedFiles() {
    console.log('📁 1. 생성된 파일들 검토');
    console.log('========================\n');

    const expectedFiles = [
      'multi-category-artmap-crawler.js',
      'artmap-multi-category-2025-07-26T12-50-55-240Z.json',
      'massive-artmap-global-collector.js', 
      'artmap-massive-collection-2025-07-26T13-10-43-101Z.json',
      'artmap-city-crawler.js',
      'artmap-city-collection-2025-07-26T13-14-58-571Z.json',
      'artmap-global-exhibitions-insert.sql',
      'ARTMAP_INTEGRATION_GUIDE.md'
    ];

    for (const file of expectedFiles) {
      const filePath = path.join(this.baseDir, file);
      const exists = fs.existsSync(filePath);
      
      if (exists) {
        const stats = fs.statSync(filePath);
        const size = Math.round(stats.size / 1024);
        console.log(`✅ ${file} (${size}KB)`);
        
        this.findings.files[file] = {
          exists: true,
          size: stats.size,
          modified: stats.mtime
        };
      } else {
        console.log(`❌ ${file} - MISSING`);
        this.findings.issues.push(`Missing file: ${file}`);
        this.findings.files[file] = { exists: false };
      }
    }
  }

  async reviewDataQuality() {
    console.log('\n📊 2. 데이터 품질 검토');
    console.log('=====================\n');

    try {
      // 초기 38개 데이터 검토
      const initialData = this.loadJsonFile('artmap-multi-category-2025-07-26T12-50-55-240Z.json');
      if (initialData) {
        console.log(`📈 초기 수집 데이터:`);
        console.log(`   전시 수: ${initialData.exhibitions?.length || 'N/A'}`);
        console.log(`   카테고리: ${Object.keys(initialData.stats?.categories || {}).join(', ')}`);
        console.log(`   상위 장소: ${initialData.stats?.topVenues?.slice(0,3).map(([name]) => name).join(', ')}`);
        
        this.findings.dataQuality.initial = {
          count: initialData.exhibitions?.length || 0,
          hasStructuredData: !!initialData.exhibitions,
          hasMetadata: !!initialData.metadata
        };
      }

      // 대량 수집 데이터 검토 (947개)
      const massiveData = this.loadJsonFile('artmap-city-collection-2025-07-26T13-14-58-571Z.json');
      if (massiveData) {
        console.log(`\n🚀 대량 수집 데이터:`);
        console.log(`   총 아이템: ${massiveData.metadata?.totalExhibitions || 'N/A'}`);
        console.log(`   처리된 도시: ${massiveData.metadata?.processedCities || 'N/A'}`);
        console.log(`   소요 시간: ${Math.round((massiveData.metadata?.durationSeconds || 0) / 60)}분`);
        
        // 상위 도시별 데이터 확인
        if (massiveData.cityResults) {
          console.log(`\n   🏆 상위 도시별 수집량:`);
          massiveData.cityResults
            .sort((a, b) => b.totalExhibitions - a.totalExhibitions)
            .slice(0, 5)
            .forEach((city, i) => {
              console.log(`     ${i + 1}. ${city.city}: ${city.totalExhibitions}개`);
            });
        }

        this.findings.dataQuality.massive = {
          count: massiveData.metadata?.totalExhibitions || 0,
          cities: massiveData.metadata?.processedCities || 0,
          hasValidStructure: !!massiveData.allExhibitions,
          sampleData: massiveData.allExhibitions?.slice(0, 3) || []
        };
      }

    } catch (error) {
      console.log(`❌ 데이터 품질 검토 중 오류: ${error.message}`);
      this.findings.issues.push(`Data quality review error: ${error.message}`);
    }
  }

  async reviewDatabaseIntegration() {
    console.log('\n🗄️  3. DB 통합 검토');
    console.log('==================\n');

    // SQL 파일 검토
    const sqlFile = 'artmap-global-exhibitions-insert.sql';
    if (fs.existsSync(sqlFile)) {
      const sqlContent = fs.readFileSync(sqlFile, 'utf8');
      
      // SQL 구조 분석
      const venueInserts = (sqlContent.match(/INSERT INTO global_venues/g) || []).length;
      const exhibitionInserts = (sqlContent.match(/INSERT INTO global_exhibitions/g) || []).length;
      const hasConflictHandling = sqlContent.includes('ON CONFLICT');
      const hasValidation = sqlContent.includes('SELECT') && sqlContent.includes('COUNT');

      console.log(`📋 SQL 파일 분석:`);
      console.log(`   global_venues 삽입: ${venueInserts}개 그룹`);
      console.log(`   global_exhibitions 삽입: ${exhibitionInserts}개 그룹`);
      console.log(`   중복 처리: ${hasConflictHandling ? '✅' : '❌'}`);
      console.log(`   결과 검증: ${hasValidation ? '✅' : '❌'}`);

      this.findings.dbIntegration.sqlFile = {
        exists: true,
        venueInserts,
        exhibitionInserts,
        hasConflictHandling,
        hasValidation,
        size: sqlContent.length
      };

      // SQL 문법 간단 검증
      const syntaxIssues = this.validateSqlSyntax(sqlContent);
      if (syntaxIssues.length > 0) {
        console.log(`\n⚠️  SQL 문법 문제:`);
        syntaxIssues.forEach(issue => console.log(`   - ${issue}`));
        this.findings.issues.push(...syntaxIssues);
      } else {
        console.log(`   SQL 문법: ✅ 정상`);
      }

    } else {
      console.log(`❌ SQL 파일 없음: ${sqlFile}`);
      this.findings.issues.push(`Missing SQL file: ${sqlFile}`);
    }

    // 데이터베이스 스키마 호환성 검토
    console.log(`\n🏗️  스키마 호환성:`);
    const schemaFile = 'src/migrations/create-global-venues-schema.sql';
    if (fs.existsSync(schemaFile)) {
      console.log(`   ✅ global_venues 스키마 확인됨`);
      this.findings.dbIntegration.schemaExists = true;
    } else {
      console.log(`   ❌ global_venues 스키마 파일 없음`);
      this.findings.issues.push('Missing global_venues schema file');
    }
  }

  validateSqlSyntax(sqlContent) {
    const issues = [];
    
    // 기본적인 SQL 문법 검증
    if (!sqlContent.includes('INSERT INTO global_venues')) {
      issues.push('global_venues INSERT 문이 없음');
    }
    
    if (!sqlContent.includes('INSERT INTO global_exhibitions')) {
      issues.push('global_exhibitions INSERT 문이 없음');
    }

    // 괄호 매칭 확인
    const openParens = (sqlContent.match(/\(/g) || []).length;
    const closeParens = (sqlContent.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      issues.push(`괄호 불일치: ( ${openParens}개, ) ${closeParens}개`);
    }

    // VALUES 문 확인
    const insertLines = sqlContent.split('\n').filter(line => line.trim().startsWith('INSERT INTO'));
    for (const line of insertLines) {
      if (!sqlContent.includes('VALUES') && !line.includes('SELECT')) {
        issues.push('INSERT 문에 VALUES 또는 SELECT가 없음');
      }
    }

    return issues;
  }

  generateRecommendations() {
    console.log('\n💡 4. 권고사항');
    console.log('==============\n');

    const recs = [];

    // 데이터 품질 기반 권고
    if (this.findings.dataQuality.massive?.count > 900) {
      recs.push('✅ 대량 데이터 수집 성공 - 정기 업데이트 시스템 구축 권장');
      console.log('✅ 대량 데이터 수집 성공 - 정기 업데이트 시스템 구축 권장');
    }

    // 파일 존재 여부 기반 권고
    const missingFiles = Object.entries(this.findings.files)
      .filter(([_, info]) => !info.exists)
      .map(([file, _]) => file);

    if (missingFiles.length > 0) {
      recs.push(`파일 복구 필요: ${missingFiles.join(', ')}`);
      console.log(`⚠️  파일 복구 필요: ${missingFiles.join(', ')}`);
    }

    // DB 통합 권고
    if (this.findings.issues.length === 0) {
      recs.push('✅ DB 통합 준비 완료 - 프로덕션 적용 가능');
      console.log('✅ DB 통합 준비 완료 - 프로덕션 적용 가능');
    } else {
      recs.push(`DB 통합 전 ${this.findings.issues.length}개 이슈 해결 필요`);
      console.log(`⚠️  DB 통합 전 ${this.findings.issues.length}개 이슈 해결 필요`);
    }

    // 추가 권고사항
    recs.push('정기 크롤링 스케줄 설정 (주 1회)');
    recs.push('데이터 품질 모니터링 시스템 구축');
    recs.push('중복 데이터 정리 프로세스 자동화');

    console.log('📋 추가 개선사항:');
    console.log('   - 정기 크롤링 스케줄 설정 (주 1회)');
    console.log('   - 데이터 품질 모니터링 시스템 구축');
    console.log('   - 중복 데이터 정리 프로세스 자동화');

    this.findings.recommendations = recs;
  }

  generateReport() {
    console.log('\n📋 5. 최종 보고서');
    console.log('=================\n');

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalDataCollected: (this.findings.dataQuality.initial?.count || 0) + 
                           (this.findings.dataQuality.massive?.count || 0),
        filesGenerated: Object.keys(this.findings.files).length,
        issuesFound: this.findings.issues.length,
        readyForProduction: this.findings.issues.length === 0
      },
      findings: this.findings
    };

    // 보고서 저장
    const reportFile = `artmap-project-review-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

    console.log(`🎯 프로젝트 상태: ${report.summary.readyForProduction ? '✅ 프로덕션 준비 완료' : '⚠️  개선 필요'}`);
    console.log(`📊 총 수집 데이터: ${report.summary.totalDataCollected.toLocaleString()}개`);
    console.log(`📁 생성된 파일: ${report.summary.filesGenerated}개`);
    console.log(`⚠️  발견된 이슈: ${report.summary.issuesFound}개`);
    console.log(`💾 상세 보고서: ${reportFile}`);

    return report;
  }

  loadJsonFile(filename) {
    try {
      if (fs.existsSync(filename)) {
        return JSON.parse(fs.readFileSync(filename, 'utf8'));
      }
    } catch (error) {
      console.log(`Error loading ${filename}: ${error.message}`);
    }
    return null;
  }
}

// 실행
async function main() {
  const reviewer = new ArtmapProjectReview();
  await reviewer.reviewProject();
}

if (require.main === module) {
  main();
}

module.exports = ArtmapProjectReview;