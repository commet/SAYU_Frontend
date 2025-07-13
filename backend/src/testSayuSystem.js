// testSayuSystem.js

const SAYUTypes = require('./models/sayuTypes');
const SAYURelationships = require('./models/sayuRelationships');
const SAYUArtworkMatcher = require('./models/sayuArtworkMatcher');

function main() {
    // 시스템 초기화
    const typesSystem = new SAYUTypes();
    const relationshipsSystem = new SAYURelationships(typesSystem);
    const artworkMatcher = new SAYUArtworkMatcher(typesSystem);
    
    // 예시: 특정 유형 분석
    const userType = 'LAEF';
    
    // 유형 정보 출력
    const typeInfo = typesSystem.getTypeInfo(userType);
    console.log(`\n${userType}: ${typeInfo.name}`);
    console.log(`설명: ${typeInfo.description}`);
    console.log(`주기능: ${typesSystem.functions[typeInfo.conscious[0]]}`);
    console.log(`열등기능: ${typesSystem.functions[typeInfo.conscious[3]]}`);
    
    // 성장 영역
    const growth = typesSystem.getGrowthAreas(userType);
    console.log(`\n성장 영역: ${growth.description}`);
    
    // 최고의 매치 찾기
    const bestMatches = relationshipsSystem.getBestMatches(userType);
    console.log(`\n${userType}와 잘 맞는 유형:`);
    bestMatches.forEach(match => {
        console.log(`- ${match.type}: ${match.name} (호환성: ${match.compatibility.toFixed(2)})`);
    });
    
    // 작품 매칭 예시
    const sampleArtwork = {
        abstractionLevel: 0.8,
        emotionalIntensity: 0.9,
        requiresContemplation: 0.7,
        explorationFriendly: 0.8
    };
    
    const artworkScores = artworkMatcher.analyzeArtworkForTypes(sampleArtwork);
    console.log(`\n이 작품과 가장 잘 맞는 유형:`);
    
    // 점수 기준 정렬
    const sortedTypes = Object.entries(artworkScores)
        .sort((a, b) => b[1].total - a[1].total)
        .slice(0, 3);
    
    sortedTypes.forEach(([typeCode, scores]) => {
        const typeName = typesSystem.typeFunctions[typeCode].name;
        console.log(`- ${typeCode}: ${typeName} (점수: ${scores.total.toFixed(2)})`);
    });
    
    // 모든 16가지 유형 출력
    console.log('\n\n=== SAYU 16가지 유형 전체 목록 ===\n');
    Object.entries(typesSystem.typeFunctions).forEach(([code, info]) => {
        console.log(`${code}: ${info.name}`);
        console.log(`  설명: ${info.description}`);
        console.log(`  의식 기능: ${info.conscious.map(f => typesSystem.functions[f]).join(' → ')}`);
        console.log(`  무의식 기능: ${info.unconscious.map(f => typesSystem.functions[f]).join(' → ')}`);
        console.log('');
    });
}

// 실행
main();