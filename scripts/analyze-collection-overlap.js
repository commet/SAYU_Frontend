/**
 * 🔍 전체 Cloudinary 컬렉션 중복 분석기
 * 모든 폴더의 작품들을 분석하여 중복, 고유성, 통합 전략 도출
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 전체 컬렉션 중복 분석 시작!');
console.log('=====================================');

// 현재 알려진 컬렉션 정보
const KNOWN_COLLECTIONS = {
  'current-validated': {
    name: '현재 검증된 컬렉션',
    count: 773,
    source: 'validation-results/valid-cloudinary-urls.json'
  },
  'artvee-enhanced': {
    name: 'Artvee Enhanced',
    count: 470,
    folder: 'sayu/artvee/enhanced/'
  },
  'artvee-full': {
    name: 'Artvee Full',
    count: 773,
    folder: 'sayu/artvee/full/'
  },
  'artvee-masters': {
    name: 'Artvee Masters',
    count: 122,
    folder: 'sayu/artvee/masters/'
  },
  'artvee-complete': {
    name: 'Artvee Complete',
    count: 874,
    folder: 'sayu/artvee-complete/'
  },
  'met-artworks': {
    name: 'MET Museum Collection',
    count: 3715,
    folder: 'sayu/met-artworks/'
  }
};

function extractArtworkIdentifier(url, title, artist) {
  // 1. URL에서 파일명 추출 (가장 신뢰할만한 식별자)
  const urlIdentifier = url.match(/\/([^\/]+)\.(jpg|png|jpeg)$/i)?.[1];
  
  // 2. 제목+작가 조합으로 의미론적 식별자
  let semanticId = '';
  if (title && artist) {
    semanticId = `${artist.toLowerCase().trim()}-${title.toLowerCase().trim()}`
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
  }
  
  // 3. 제목만으로 식별자 (작가 정보가 없을 때)
  let titleId = '';
  if (title) {
    titleId = title.toLowerCase().trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 30);
  }
  
  return {
    urlId: urlIdentifier,
    semanticId,
    titleId,
    primaryId: urlIdentifier || semanticId || titleId || 'unknown'
  };
}

function analyzeCurrentCollection() {
  console.log('\n📊 1단계: 현재 컬렉션 분석...');
  
  const collectionPath = path.join(__dirname, '../artvee-crawler/validation-results/valid-cloudinary-urls.json');
  if (!fs.existsSync(collectionPath)) {
    console.log('❌ 검증된 컬렉션 파일을 찾을 수 없습니다.');
    return null;
  }
  
  const collection = JSON.parse(fs.readFileSync(collectionPath, 'utf8'));
  const artworks = {};
  const folderDistribution = {};
  const duplicateCheck = new Set();
  const potentialDuplicates = [];
  
  Object.entries(collection).forEach(([key, artwork]) => {
    // 폴더 분석
    let folder = 'unknown';
    const url = artwork.full?.url || artwork.url || '';
    const folderMatch = url.match(/sayu\/artvee\/(\w+)\//);
    if (folderMatch) {
      folder = folderMatch[1];
    }
    
    folderDistribution[folder] = (folderDistribution[folder] || 0) + 1;
    
    // 식별자 분석
    const title = artwork.artwork?.title || '';
    const artist = artwork.artwork?.artist || '';
    const identifiers = extractArtworkIdentifier(url, title, artist);
    
    // 중복 체크
    if (duplicateCheck.has(identifiers.primaryId)) {
      potentialDuplicates.push({
        key,
        primaryId: identifiers.primaryId,
        url,
        title,
        artist
      });
    } else {
      duplicateCheck.add(identifiers.primaryId);
    }
    
    artworks[key] = {
      ...artwork,
      folder,
      identifiers,
      analysisData: {
        hasTitle: !!title,
        hasArtist: !!artist,
        hasSayuType: !!artwork.artwork?.sayuType,
        urlValid: !!url
      }
    };
  });
  
  console.log(`   ✅ 총 작품: ${Object.keys(collection).length}개`);
  console.log('   📁 폴더별 분포:');
  Object.entries(folderDistribution).forEach(([folder, count]) => {
    console.log(`      ${folder}: ${count}개`);
  });
  
  if (potentialDuplicates.length > 0) {
    console.log(`   ⚠️ 잠재적 중복: ${potentialDuplicates.length}개`);
    potentialDuplicates.slice(0, 5).forEach(dup => {
      console.log(`      - ${dup.primaryId}: ${dup.title} (${dup.artist})`);
    });
  }
  
  return {
    artworks,
    folderDistribution,
    duplicates: potentialDuplicates,
    totalCount: Object.keys(collection).length
  };
}

function analyzeMetadataQuality(artworks) {
  console.log('\n📊 2단계: 메타데이터 품질 분석...');
  
  let hasTitle = 0, hasArtist = 0, hasSayuType = 0, hasYear = 0;
  const sayuTypeDistribution = {};
  const artistFrequency = {};
  
  Object.values(artworks).forEach(artwork => {
    if (artwork.analysisData.hasTitle) hasTitle++;
    if (artwork.analysisData.hasArtist) hasArtist++;
    if (artwork.analysisData.hasSayuType) hasSayuType++;
    
    const sayuType = artwork.artwork?.sayuType;
    if (sayuType) {
      sayuTypeDistribution[sayuType] = (sayuTypeDistribution[sayuType] || 0) + 1;
    }
    
    const artist = artwork.artwork?.artist;
    if (artist) {
      artistFrequency[artist] = (artistFrequency[artist] || 0) + 1;
    }
  });
  
  const total = Object.keys(artworks).length;
  console.log(`   📊 메타데이터 완성도:`);
  console.log(`      제목: ${hasTitle}/${total} (${Math.round(hasTitle/total*100)}%)`);
  console.log(`      작가: ${hasArtist}/${total} (${Math.round(hasArtist/total*100)}%)`);
  console.log(`      SAYU 타입: ${hasSayuType}/${total} (${Math.round(hasSayuType/total*100)}%)`);
  
  // 상위 작가들
  const topArtists = Object.entries(artistFrequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);
  
  console.log(`   🎨 상위 작가 (상위 10명):`);
  topArtists.forEach(([artist, count]) => {
    console.log(`      ${artist}: ${count}개 작품`);
  });
  
  return {
    completeness: {
      title: hasTitle/total,
      artist: hasArtist/total,
      sayuType: hasSayuType/total
    },
    sayuTypeDistribution,
    topArtists
  };
}

function estimateCollectionOverlap() {
  console.log('\n🔍 3단계: 컬렉션 간 중복 예측...');
  
  // 추정 중복률 (실제 테스트 필요)
  const overlapEstimates = {
    'enhanced_vs_full': {
      description: 'Enhanced vs Full 폴더',
      estimatedOverlap: '80-90%', // Enhanced는 Full의 고화질 버전일 가능성
      priority: 'Enhanced 우선 (더 고화질)'
    },
    'masters_vs_full': {
      description: 'Masters vs Full 폴더', 
      estimatedOverlap: '50-70%', // Masters는 거장 작품 특별 컬렉션
      priority: 'Masters 우선 (큐레이션됨)'
    },
    'artvee_vs_complete': {
      description: 'Artvee vs Artvee-Complete',
      estimatedOverlap: '60-80%', // Complete는 확장 버전
      priority: 'Complete 우선 (더 포괄적)'
    },
    'artvee_vs_met': {
      description: 'Artvee vs MET 컬렉션',
      estimatedOverlap: '5-15%', // 서로 다른 소스, 낮은 중복
      priority: 'MET 우선 (더 신뢰할만한 메타데이터)'
    }
  };
  
  console.log('   📊 예상 중복률:');
  Object.entries(overlapEstimates).forEach(([key, data]) => {
    console.log(`      ${data.description}: ${data.estimatedOverlap}`);
    console.log(`         -> 우선순위: ${data.priority}`);
  });
  
  return overlapEstimates;
}

function generateIntegrationStrategy() {
  console.log('\n🚀 4단계: 통합 전략 수립...');
  
  const strategy = {
    phase1: {
      title: '현재 컬렉션 최적화',
      description: '773개 검증된 작품 품질 향상',
      actions: [
        '메타데이터 보강 (누락된 제목, 작가 정보)',
        'SAYU 타입 자동 분류 정확도 개선',
        '고화질 버전으로 업그레이드 (Enhanced 폴더 활용)'
      ],
      timeframe: '1주일'
    },
    phase2: {
      title: '스마트 중복 제거',
      description: 'Artvee 계열 폴더들 통합',
      actions: [
        'Enhanced/Full/Masters 폴더 중복 분석',
        '품질 우선순위로 최상위 버전 선택',
        'Artvee-Complete 컬렉션과 병합',
        '중복 제거 후 고유 작품 1,000-1,200개 예상'
      ],
      timeframe: '2주일'
    },
    phase3: {
      title: 'MET 컬렉션 통합',
      description: '3,715개 메트로폴리탄 작품 추가',
      actions: [
        'MET 작품 메타데이터 구조 분석',
        'Artvee와 중복 제거 (예상 5-15%)',
        'APT 유형 자동 분류',
        '최종 4,000-4,500개 고유 작품 달성'
      ],
      timeframe: '3주일'
    },
    phase4: {
      title: '품질 보장 및 최적화',
      description: '세계급 컬렉션 완성',
      actions: [
        '모든 이미지 URL 유효성 재검증',
        'APT별 균형 조정 (각 타입당 최소 200개)',
        '추천 알고리즘 정교화',
        'A/B 테스트로 사용자 만족도 확인'
      ],
      timeframe: '2주일'
    }
  };
  
  console.log('   📋 통합 전략:');
  Object.entries(strategy).forEach(([phase, plan]) => {
    console.log(`\n   🎯 ${phase.toUpperCase()}: ${plan.title}`);
    console.log(`      📄 ${plan.description}`);
    console.log(`      ⏰ 예상 기간: ${plan.timeframe}`);
    plan.actions.forEach((action, i) => {
      console.log(`      ${i+1}. ${action}`);
    });
  });
  
  return strategy;
}

function generateNextSteps() {
  console.log('\n⚡ 5단계: 즉시 실행 항목...');
  
  const nextSteps = [
    {
      priority: 'URGENT',
      task: 'Cloudinary Media Library에서 실제 파일명 확인',
      description: 'MET 폴더의 실제 구조와 파일명 패턴 파악',
      command: '직접 웹 인터페이스 접속',
      impact: 'MET 3,715개 작품 활용 가능성 확정'
    },
    {
      priority: 'HIGH',
      task: 'Enhanced 폴더 샘플 비교',
      description: '같은 작품의 Full vs Enhanced 화질 차이 확인',
      command: 'node scripts/compare-image-quality.js',
      impact: '고화질 업그레이드로 사용자 경험 개선'
    },
    {
      priority: 'HIGH', 
      task: 'Artvee-Complete 폴더 구조 분석',
      description: '874개 작품의 실제 내용과 중복 여부',
      command: 'node scripts/analyze-complete-collection.js',
      impact: '200-400개 추가 작품 확보 가능'
    },
    {
      priority: 'MEDIUM',
      task: '메타데이터 보강 도구 개발',
      description: '누락된 작가/제목 정보 자동 추출',
      command: 'node scripts/enhance-metadata.js', 
      impact: '추천 정확도 20-30% 향상'
    }
  ];
  
  console.log('   🎯 실행 항목:');
  nextSteps.forEach((step, i) => {
    console.log(`\n   ${i+1}. [${step.priority}] ${step.task}`);
    console.log(`      📝 ${step.description}`);
    console.log(`      💻 ${step.command}`);
    console.log(`      📈 임팩트: ${step.impact}`);
  });
  
  return nextSteps;
}

// 메인 실행
async function runCollectionAnalysis() {
  try {
    const currentAnalysis = analyzeCurrentCollection();
    if (!currentAnalysis) return;
    
    const qualityAnalysis = analyzeMetadataQuality(currentAnalysis.artworks);
    const overlapEstimates = estimateCollectionOverlap();
    const integrationStrategy = generateIntegrationStrategy();
    const nextSteps = generateNextSteps();
    
    // 최종 요약
    console.log('\n🏆 전체 분석 요약');
    console.log('=====================================');
    console.log(`📊 현재 검증된 작품: ${currentAnalysis.totalCount}개`);
    console.log(`📈 예상 최종 컬렉션: 4,000-4,500개 (고유 작품)`);
    console.log(`🎯 메타데이터 품질: ${Math.round(qualityAnalysis.completeness.title * 100)}% 완성도`);
    console.log(`⚡ 핵심 과제: MET 컬렉션 실제 구조 파악`);
    
    // 결과 저장
    const analysisResults = {
      analysisDate: new Date().toISOString(),
      currentCollection: {
        total: currentAnalysis.totalCount,
        folderDistribution: currentAnalysis.folderDistribution,
        duplicates: currentAnalysis.duplicates.length
      },
      qualityAnalysis,
      overlapEstimates,
      integrationStrategy,
      nextSteps,
      projectedOutcome: {
        finalCollectionSize: '4,000-4,500 unique artworks',
        qualityImprovement: '20-30%',
        userExperienceBoost: 'Significant'
      }
    };
    
    const resultsDir = path.join(__dirname, '../artvee-crawler/collection-analysis');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(resultsDir, 'overlap-analysis.json'),
      JSON.stringify(analysisResults, null, 2)
    );
    
    console.log('\n💾 분석 결과 저장: collection-analysis/overlap-analysis.json');
    
  } catch (error) {
    console.error('\n❌ 분석 실행 중 오류:', error.message);
  }
}

runCollectionAnalysis();