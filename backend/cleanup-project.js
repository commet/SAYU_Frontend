const fs = require('fs').promises;
const path = require('path');

// 정리할 파일 패턴들
const DELETE_PATTERNS = [
  // 테스트 파일들
  /^test-.*\.js$/,
  /^check-.*\.js$/,
  /^analyze.*\.js$/,
  /^verify-.*\.js$/,
  
  // 임시/실험 파일들
  /^temp-.*\.js$/,
  /^tmp-.*\.js$/,
  /^experimental-.*\.js$/,
  /^try-.*\.js$/,
  /^debug-.*\.js$/,
  
  // 특정 중간 결과물들
  /^artmap-.*\.js$/,
  /^culture-api-.*\.js$/,
  /^google-places-.*\.js$/,
  /^harvard-.*\.js$/,
  /^cleveland-.*\.js$/,
  /^met-.*\.js$/,
  /^naver-.*\.js$/,
  /^seoul-.*\.js$/,
  /^tour-api-.*\.js$/,
  
  // APT 관련 중간 파일들 (최종 완성본 제외)
  /^apt-.*\.js$/,
  /^APT.*\.js$/,
  /.*-apt-.*\.js$/,
  /^run.*Classification\.js$/,
  /^.*Classifier\.js$/,
  /^.*APT.*\.js$/,
  
  // 수집 관련 중간 파일들
  /^collect-.*\.js$/,
  /^crawl-.*\.js$/,
  /^scrape-.*\.js$/,
  /^fetch-.*\.js$/,
  /^import-.*\.js$/,
  /^load-.*\.js$/,
  /^seed-.*\.js$/,
  /^setup-.*\.js$/,
  /^create-.*\.js$/,
  /^add-.*\.js$/,
  /^insert-.*\.js$/,
  /^populate-.*\.js$/,
  /^enhance-.*\.js$/,
  /^fix-.*\.js$/,
  /^update-.*\.js$/,
  /^clean-.*\.js$/,
  /^remove-.*\.js$/,
  /^delete-.*\.js$/,
  /^backup-.*\.js$/,
  /^save-.*\.js$/,
  /^upload-.*\.js$/,
  /^download-.*\.js$/,
  
  // 실행 스크립트들
  /^run-.*\.js$/,
  /^start-.*\.js$/,
  /^execute-.*\.js$/,
  /^apply-.*\.js$/,
  
  // JSON 결과 파일들
  /.*\.json$/,
  /.*\.csv$/,
  /.*\.html$/,
  /.*\.md$/,
  /.*\.sql$/,
  /.*\.log$/,
  /.*\.txt$/
];

// 유지할 핵심 파일들 (삭제 패턴에 걸려도 보존)
const KEEP_FILES = [
  'package.json',
  'package-lock.json',
  'README.md',
  'jest.config.js',
  'sayu-living-server.js',
  'schema.sql',
  'init-database.sql',
  'ecosystem.config.js',
  'docker-compose.yml',
  'Dockerfile.disabled',
  'Procfile',
  'railway.json',
  '.env.example',
  
  // 완성된 APT 시스템 파일들
  'generateThreeAPTProfiles.js',
  'addMissingFamousArtists.js',
  'addEssentialArtists.js',
  'addMissingImportantArtists.js',
  'restoreImportantArtists.js',
  'cleanupAPTDatabase.js',
  'listHighImportanceArtists.js',
  'checkMissingFamousArtists.js',
  'checkMultipleAPT.js',
  'analyzeThreeAPTSystem.js',
  'major_artists_wiki_data.csv'
];

// 유지할 디렉토리들
const KEEP_DIRECTORIES = [
  'src',
  'migrations',
  '__tests__',
  'public',
  'scripts',
  'temp-frontend',
  '../shared'  // 상위 디렉토리의 shared도 보호
];

async function shouldDelete(filePath, fileName) {
  // 유지할 파일이면 삭제하지 않음
  if (KEEP_FILES.includes(fileName)) {
    return false;
  }
  
  // 유지할 디렉토리 내부는 건드리지 않음
  for (const keepDir of KEEP_DIRECTORIES) {
    if (filePath.includes(path.sep + keepDir + path.sep) || 
        filePath.startsWith(keepDir + path.sep)) {
      return false;
    }
  }
  
  // 삭제 패턴에 매치되는지 확인
  return DELETE_PATTERNS.some(pattern => pattern.test(fileName));
}

async function analyzeFiles() {
  const backendDir = process.cwd();
  const files = await fs.readdir(backendDir, { withFileTypes: true });
  
  const toDelete = [];
  const toKeep = [];
  
  for (const file of files) {
    if (file.isFile()) {
      const filePath = path.join(backendDir, file.name);
      
      if (await shouldDelete(filePath, file.name)) {
        toDelete.push(file.name);
      } else {
        toKeep.push(file.name);
      }
    }
  }
  
  return { toDelete, toKeep };
}

async function cleanupProject() {
  console.log('🧹 SAYU 프로젝트 정리 시작\n');
  
  try {
    const { toDelete, toKeep } = await analyzeFiles();
    
    console.log(`📊 분석 결과:`);
    console.log(`  삭제 대상: ${toDelete.length}개 파일`);
    console.log(`  유지: ${toKeep.length}개 파일\n`);
    
    // 삭제 대상 미리보기 (처음 20개)
    if (toDelete.length > 0) {
      console.log('🗑️ 삭제될 파일들 (처음 20개):');
      toDelete.slice(0, 20).forEach((file, idx) => {
        console.log(`  ${idx + 1}. ${file}`);
      });
      
      if (toDelete.length > 20) {
        console.log(`  ... 그리고 ${toDelete.length - 20}개 더`);
      }
      console.log('');
    }
    
    // 유지될 핵심 파일들
    console.log('✅ 유지될 핵심 파일들:');
    toKeep.slice(0, 15).forEach((file, idx) => {
      console.log(`  ${idx + 1}. ${file}`);
    });
    
    if (toKeep.length > 15) {
      console.log(`  ... 그리고 ${toKeep.length - 15}개 더`);
    }
    
    console.log('\n⚠️  실제 삭제를 원한다면 --execute 플래그를 추가하세요');
    console.log('   예: node cleanup-project.js --execute');
    
    // 실제 삭제 실행
    if (process.argv.includes('--execute')) {
      console.log('\n🔥 실제 삭제 실행 중...\n');
      
      let deleted = 0;
      let failed = 0;
      
      for (const fileName of toDelete) {
        try {
          await fs.unlink(fileName);
          console.log(`✅ 삭제: ${fileName}`);
          deleted++;
        } catch (error) {
          console.log(`❌ 실패: ${fileName} - ${error.message}`);
          failed++;
        }
      }
      
      console.log(`\n📊 삭제 결과:`);
      console.log(`  ✅ 성공: ${deleted}개`);
      console.log(`  ❌ 실패: ${failed}개`);
      console.log(`  📁 남은 파일: ${toKeep.length}개`);
    }
    
  } catch (error) {
    console.error('❌ 오류:', error.message);
  }
}

// 실행
if (require.main === module) {
  cleanupProject();
}

module.exports = { cleanupProject };