// Step 14-A: 고위험 9개 파일 상호의존성 Ultra-careful 분석
console.log('🔍 Step 14-A Ultra-careful 분석: 고위험 9개 파일 상호의존성...');

const fs = require('fs');
const path = require('path');

const highRiskFiles = [
  'backend/src/models/aptEvolutionSystem.js',
  'backend/src/models/aptVectorSystem.js', 
  'backend/src/models/aptDataAccess.js',
  'backend/src/models/evolutionRewardSystem.js',
  'backend/src/models/animalEvolutionSystem.js',
  'backend/src/models/sayuTypes.js',
  'backend/src/models/animalEvolutionVisual.js',
  'backend/src/services/aptCacheService.js',
  'backend/src/routes/aptRecommendationRoutes.js'
];

try {
  console.log('🔍 Phase 1: 각 파일의 현재 import 상태 분석...');
  
  const fileAnalysis = [];
  
  for (let i = 0; i < highRiskFiles.length; i++) {
    const filePath = highRiskFiles[i];
    const fullPath = path.join(__dirname, filePath);
    
    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\\n').slice(0, 20); // 첫 20줄만 분석
      
      // Import 분석
      const hasOldImport = content.includes("require('../../../shared/SAYUTypeDefinitions')") ||
                          content.includes("require('../../shared/SAYUTypeDefinitions')");
      const hasNewImport = content.includes("require('@sayu/shared')");
      
      // 사용되는 SAYU exports 분석
      const usesSayuTypes = content.includes('SAYU_TYPES');
      const usesValidTypeCodes = content.includes('VALID_TYPE_CODES');
      const usesGetSayuType = content.includes('getSAYUType');
      const usesSayuFunctions = content.includes('SAYU_FUNCTIONS');
      
      // 다른 내부 파일 의존성 분석
      const internalDependencies = [];
      lines.forEach(line => {
        if (line.includes('require(') && (line.includes('./') || line.includes('../'))) {
          const match = line.match(/require\\(['"]([^'"]+)['"]\\)/);
          if (match) {
            internalDependencies.push(match[1]);
          }
        }
      });
      
      const analysis = {
        file: filePath,
        fileName: path.basename(filePath),
        fileSize: content.length,
        lineCount: content.split('\\n').length,
        category: filePath.includes('/models/') ? 'Model' : 
                 filePath.includes('/services/') ? 'Service' : 'Route',
        hasOldImport,
        hasNewImport,
        needsChange: hasOldImport && !hasNewImport,
        alreadyChanged: hasNewImport,
        sayuExports: {
          SAYU_TYPES: usesSayuTypes,
          VALID_TYPE_CODES: usesValidTypeCodes,
          getSAYUType: usesGetSayuType,
          SAYU_FUNCTIONS: usesSayuFunctions
        },
        internalDependencies,
        riskLevel: filePath.includes('Vector') || filePath.includes('Evolution') ? 'VERY_HIGH' :
                  filePath.includes('Cache') || filePath.includes('Routes') ? 'HIGH' : 'MEDIUM'
      };
      
      fileAnalysis.push(analysis);
      
    } catch (error) {
      console.log(`❌ ${path.basename(filePath)}: 파일 읽기 실패 - ${error.message}`);
    }
  }
  
  console.log('\\n📊 Phase 2: 파일별 분석 결과...');
  
  fileAnalysis.forEach((analysis, index) => {
    console.log(`\\n📄 ${index + 1}. ${analysis.fileName}:`);
    console.log(`   - 카테고리: ${analysis.category}`);
    console.log(`   - 파일 크기: ${analysis.fileSize} chars (${analysis.lineCount} lines)`);
    console.log(`   - 위험도: ${analysis.riskLevel}`);
    console.log(`   - 기존 import: ${analysis.hasOldImport ? '✅ 발견' : '❌ 없음'}`);
    console.log(`   - 새로운 import: ${analysis.hasNewImport ? '⚠️ 이미 변경됨' : '🔄 변경 필요'}`);
    console.log(`   - 변경 필요: ${analysis.needsChange ? '✅' : '❌'}`);
    
    const usedExports = Object.entries(analysis.sayuExports)
      .filter(([key, value]) => value)
      .map(([key]) => key);
    console.log(`   - 사용 exports: ${usedExports.join(', ') || 'None'}`);
    console.log(`   - 내부 의존성: ${analysis.internalDependencies.length}개`);
  });
  
  console.log('\\n🎯 Phase 3: 변경 우선순위 결정...');
  
  const needsChange = fileAnalysis.filter(f => f.needsChange);
  const alreadyChanged = fileAnalysis.filter(f => f.alreadyChanged);
  
  console.log(`   - 변경 필요: ${needsChange.length}개`);
  console.log(`   - 이미 변경됨: ${alreadyChanged.length}개`);
  
  if (needsChange.length === 0) {
    console.log('\\n🎉 모든 고위험 파일이 이미 @sayu/shared를 사용하고 있습니다!');
    console.log('💡 추가 변경이 필요하지 않습니다.');
    return;
  }
  
  // 위험도와 의존성에 따른 순서 결정
  const sortedByRisk = needsChange.sort((a, b) => {
    const riskOrder = { 'MEDIUM': 1, 'HIGH': 2, 'VERY_HIGH': 3 };
    if (riskOrder[a.riskLevel] !== riskOrder[b.riskLevel]) {
      return riskOrder[a.riskLevel] - riskOrder[b.riskLevel]; // 낮은 위험도부터
    }
    return a.internalDependencies.length - b.internalDependencies.length; // 의존성 적은 것부터
  });
  
  console.log('\\n🔄 권장 변경 순서 (위험도 + 의존성 기준):');
  sortedByRisk.forEach((file, index) => {
    console.log(`   ${index + 1}. ${file.fileName} (${file.riskLevel}, ${file.internalDependencies.length}개 의존성)`);
  });
  
  console.log('\\n✅ Ultra-careful 분석 완료!');
  console.log('💡 다음 단계에서 가장 안전한 파일부터 차례대로 변경 예정');
  
} catch (error) {
  console.error('❌ 분석 실패:', error.message);
  process.exit(1);
}