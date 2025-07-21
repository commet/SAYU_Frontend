/**
 * Quiz Adjustment System Test
 * 16가지 성격 유형이 골고루 나오는지 시뮬레이션
 */

// 퀴즈 질문 가중치 (현재 시스템)
const questionWeights = [
  { L: 3, S: 3 },           // Q1
  { F: 3, C: 3 },           // Q2
  { A: 4, R: 4, E: 1, M: 1 }, // Q3 (A:3,E:1 + R:3,M:1)
  { E: 3, M: 3, A: 1, R: 1 }, // Q4
  { F: 3, C: 3, A: 1, R: 1 }, // Q5
  { L: 2, S: 2, M: 1, E: 1 }, // Q6
  { A: 3, R: 3, F: 1, C: 1 }, // Q7
  { A: 4, R: 3, E: 2, M: 2 }, // Q8
  { E: 3, M: 3, L: 1, S: 1 }, // Q9
  { F: 3, C: 3, A: 1, R: 1, L: 1, S: 1 }, // Q10
  { E: 2, M: 2, A: 1, R: 2 }, // Q11
  { F: 2, C: 2, S: 1, L: 1 }, // Q12
  { A: 2, R: 2, F: 1, C: 1 }, // Q13
  { A: 1, R: 1, E: 2, M: 2 }, // Q14
  { F: 2, C: 2, S: 1, L: 1, A: 1, R: 1 }  // Q15
];

// 점수 조정 시스템 (JavaScript로 간단히 구현)
const DIMENSION_BOOSTERS = {
  L: 2.2, S: 2.2,
  A: 1.0, R: 1.0,
  E: 1.4, M: 1.4,
  F: 1.2, C: 1.2
};

function amplifyDifference(score1, score2, booster) {
  const boosted1 = score1 * booster;
  const boosted2 = score2 * booster;
  
  const diff = Math.abs(boosted1 - boosted2);
  const total = boosted1 + boosted2;
  
  if (total === 0) return [0, 0];
  
  if (diff / total < 0.2) {
    const amplifier = 1.5;
    const avgScore = total / 2;
    
    if (boosted1 > boosted2) {
      return [avgScore + diff * amplifier / 2, avgScore - diff * amplifier / 2];
    } else {
      return [avgScore - diff * amplifier / 2, avgScore + diff * amplifier / 2];
    }
  }
  
  return [boosted1, boosted2];
}

function adjustScores(rawScores) {
  const adjusted = {};
  
  // L/S 차원 조정
  const [adjL, adjS] = amplifyDifference(rawScores.L, rawScores.S, DIMENSION_BOOSTERS.L);
  adjusted.L = adjL;
  adjusted.S = adjS;
  
  // A/R 차원 조정
  adjusted.A = rawScores.A * DIMENSION_BOOSTERS.A;
  adjusted.R = rawScores.R * DIMENSION_BOOSTERS.R;
  
  // E/M 차원 조정
  const [adjE, adjM] = amplifyDifference(rawScores.E, rawScores.M, DIMENSION_BOOSTERS.E);
  adjusted.E = adjE;
  adjusted.M = adjM;
  
  // F/C 차원 조정
  const [adjF, adjC] = amplifyDifference(rawScores.F, rawScores.C, DIMENSION_BOOSTERS.F);
  adjusted.F = adjF;
  adjusted.C = adjC;
  
  return adjusted;
}

function determineType(scores) {
  return (
    (scores.L > scores.S ? 'L' : 'S') +
    (scores.A > scores.R ? 'A' : 'R') +
    (scores.E > scores.M ? 'E' : 'M') +
    (scores.F > scores.C ? 'F' : 'C')
  );
}

// 랜덤 응답 시뮬레이션
function simulateRandomResponses(numSimulations = 10000) {
  const typeCount = {};
  const rawTypeCount = {};
  
  for (let i = 0; i < numSimulations; i++) {
    const rawScores = { L: 0, S: 0, A: 0, R: 0, E: 0, M: 0, F: 0, C: 0 };
    
    // 각 질문에 랜덤하게 답변
    questionWeights.forEach(question => {
      const options = Object.keys(question);
      const chosen = options[Math.floor(Math.random() * options.length)];
      rawScores[chosen] += question[chosen];
    });
    
    // 원점수로 타입 결정
    const rawType = determineType(rawScores);
    rawTypeCount[rawType] = (rawTypeCount[rawType] || 0) + 1;
    
    // 조정된 점수로 타입 결정
    const adjustedScores = adjustScores(rawScores);
    const adjustedType = determineType(adjustedScores);
    typeCount[adjustedType] = (typeCount[adjustedType] || 0) + 1;
  }
  
  return { raw: rawTypeCount, adjusted: typeCount };
}

// 극단적 케이스 테스트
function testExtremeCase(preference) {
  const rawScores = { L: 0, S: 0, A: 0, R: 0, E: 0, M: 0, F: 0, C: 0 };
  
  // 특정 선호도에 따라 답변
  questionWeights.forEach(question => {
    Object.keys(question).forEach(trait => {
      if (preference.includes(trait)) {
        rawScores[trait] += question[trait];
      }
    });
  });
  
  const adjustedScores = adjustScores(rawScores);
  const type = determineType(adjustedScores);
  
  return { rawScores, adjustedScores, type };
}

// 테스트 실행
console.log('🧪 SAYU Quiz Adjustment System Test\n');

// 1. 랜덤 시뮬레이션
console.log('1. Random Response Simulation (10,000 times)');
console.log('=' .repeat(50));
const results = simulateRandomResponses(10000);

console.log('\n📊 Raw Score Distribution:');
Object.entries(results.raw)
  .sort(([,a], [,b]) => b - a)
  .forEach(([type, count]) => {
    const percent = (count / 10000 * 100).toFixed(1);
    console.log(`${type}: ${count} (${percent}%)`);
  });

console.log('\n📊 Adjusted Score Distribution:');
Object.entries(results.adjusted)
  .sort(([,a], [,b]) => b - a)
  .forEach(([type, count]) => {
    const percent = (count / 10000 * 100).toFixed(1);
    console.log(`${type}: ${count} (${percent}%)`);
  });

// 2. 극단적 L 선호 테스트
console.log('\n\n2. Extreme L Preference Test');
console.log('=' .repeat(50));
const extremeL = testExtremeCase(['L', 'A', 'E', 'F']);
console.log('Preference: L, A, E, F');
console.log('Raw Scores:', extremeL.rawScores);
console.log('Adjusted Scores:', Object.entries(extremeL.adjustedScores)
  .map(([k, v]) => `${k}: ${v.toFixed(1)}`).join(', '));
console.log('Final Type:', extremeL.type);

// 3. 극단적 S 선호 테스트
console.log('\n3. Extreme S Preference Test');
console.log('=' .repeat(50));
const extremeS = testExtremeCase(['S', 'R', 'M', 'C']);
console.log('Preference: S, R, M, C');
console.log('Raw Scores:', extremeS.rawScores);
console.log('Adjusted Scores:', Object.entries(extremeS.adjustedScores)
  .map(([k, v]) => `${k}: ${v.toFixed(1)}`).join(', '));
console.log('Final Type:', extremeS.type);

// 4. 16가지 유형 모두 나오는지 확인
console.log('\n\n4. All 16 Types Coverage Check');
console.log('=' .repeat(50));
const allTypes = ['LAEF', 'LAEC', 'LAMF', 'LAMC', 'LREF', 'LREC', 'LRMF', 'LRMC',
                  'SAEF', 'SAEC', 'SAMF', 'SAMC', 'SREF', 'SREC', 'SRMF', 'SRMC'];

const missingTypes = allTypes.filter(type => !results.adjusted[type]);
const rareTypes = allTypes.filter(type => 
  results.adjusted[type] && results.adjusted[type] < 100
);

console.log(`✅ Types found: ${Object.keys(results.adjusted).length}/16`);
if (missingTypes.length > 0) {
  console.log(`❌ Missing types: ${missingTypes.join(', ')}`);
}
if (rareTypes.length > 0) {
  console.log(`⚠️  Rare types (<1%): ${rareTypes.join(', ')}`);
}

// 5. L/S 분포 개선 확인
console.log('\n\n5. L/S Distribution Improvement');
console.log('=' .repeat(50));
const rawLCount = Object.entries(results.raw)
  .filter(([type]) => type.startsWith('L'))
  .reduce((sum, [, count]) => sum + count, 0);
const rawSCount = Object.entries(results.raw)
  .filter(([type]) => type.startsWith('S'))
  .reduce((sum, [, count]) => sum + count, 0);

const adjLCount = Object.entries(results.adjusted)
  .filter(([type]) => type.startsWith('L'))
  .reduce((sum, [, count]) => sum + count, 0);
const adjSCount = Object.entries(results.adjusted)
  .filter(([type]) => type.startsWith('S'))
  .reduce((sum, [, count]) => sum + count, 0);

console.log('Raw scores:');
console.log(`  L types: ${rawLCount} (${(rawLCount/10000*100).toFixed(1)}%)`);
console.log(`  S types: ${rawSCount} (${(rawSCount/10000*100).toFixed(1)}%)`);
console.log('\nAdjusted scores:');
console.log(`  L types: ${adjLCount} (${(adjLCount/10000*100).toFixed(1)}%)`);
console.log(`  S types: ${adjSCount} (${(adjSCount/10000*100).toFixed(1)}%)`);

console.log('\n✨ Test Complete!');