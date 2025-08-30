// 퀴즈 점수 분포 테스트 스크립트
import { narrativeQuestions } from './data/narrative-quiz-questions-enhanced.js';

// 모든 가능한 APT 타입
const allAPTTypes = [
  'LAEF', 'LAEC', 'LAMF', 'LAMC',
  'LREF', 'LREC', 'LRMF', 'LRMC',
  'SAEF', 'SAEC', 'SAMF', 'SAMC',
  'SREF', 'SREC', 'SRMF', 'SRMC'
];

// 각 질문에서 가능한 점수 수집
function analyzeQuestionWeights() {
  console.log('📊 질문별 가중치 분석\n');
  console.log('='.repeat(60));
  
  narrativeQuestions.forEach((q, idx) => {
    console.log(`\n질문 ${idx + 1}:`);
    q.options.forEach(opt => {
      const weights = Object.entries(opt.weight)
        .map(([k, v]) => `${k}:${v}`)
        .join(', ');
      console.log(`  - ${opt.id}: ${weights}`);
    });
  });
}

// 랜덤 응답 시뮬레이션
function simulateRandomResponses(iterations = 1000) {
  const results = {};
  
  for (let i = 0; i < iterations; i++) {
    const answers = [];
    const scores = { L: 0, S: 0, A: 0, R: 0, E: 0, M: 0, F: 0, C: 0 };
    
    // 랜덤하게 답변 선택
    narrativeQuestions.forEach(q => {
      const randomOption = q.options[Math.floor(Math.random() * q.options.length)];
      answers.push(randomOption.id);
      
      // 점수 계산
      Object.entries(randomOption.weight).forEach(([axis, value]) => {
        scores[axis] += value;
      });
    });
    
    // APT 타입 결정 (수정된 로직 적용)
    const type = [
      scores.L > scores.S ? 'L' : 'S',
      scores.A > scores.R ? 'A' : 'R',
      scores.M > scores.E ? 'M' : 'E',  // 수정됨!
      scores.F > scores.C ? 'F' : 'C'
    ].join('');
    
    results[type] = (results[type] || 0) + 1;
  }
  
  return results;
}

// 특정 성향으로 답변할 때의 결과
function simulateTargetedResponses() {
  const targetedResults = {};
  
  // 각 축별로 극단적인 선택을 했을 때
  const extremePatterns = [
    { name: 'All L', preference: { L: true, A: true, M: true, F: true } },
    { name: 'All S', preference: { L: false, A: false, M: false, F: false } },
    { name: 'Mixed 1', preference: { L: true, A: false, M: true, F: false } },
    { name: 'Mixed 2', preference: { L: false, A: true, M: false, F: true } }
  ];
  
  extremePatterns.forEach(pattern => {
    const scores = { L: 0, S: 0, A: 0, R: 0, E: 0, M: 0, F: 0, C: 0 };
    
    narrativeQuestions.forEach(q => {
      // 선호도에 맞는 옵션 선택
      let selectedOption = q.options[0]; // 기본값
      let maxScore = -999;
      
      q.options.forEach(opt => {
        let score = 0;
        if (pattern.preference.L && opt.weight.L) score += opt.weight.L;
        if (!pattern.preference.L && opt.weight.S) score += opt.weight.S;
        if (pattern.preference.A && opt.weight.A) score += opt.weight.A;
        if (!pattern.preference.A && opt.weight.R) score += opt.weight.R;
        if (pattern.preference.M && opt.weight.M) score += opt.weight.M;
        if (!pattern.preference.M && opt.weight.E) score += opt.weight.E;
        if (pattern.preference.F && opt.weight.F) score += opt.weight.F;
        if (!pattern.preference.F && opt.weight.C) score += opt.weight.C;
        
        if (score > maxScore) {
          maxScore = score;
          selectedOption = opt;
        }
      });
      
      // 점수 계산
      Object.entries(selectedOption.weight).forEach(([axis, value]) => {
        scores[axis] += value;
      });
    });
    
    // APT 타입 결정
    const type = [
      scores.L > scores.S ? 'L' : 'S',
      scores.A > scores.R ? 'A' : 'R',
      scores.M > scores.E ? 'M' : 'E',  // 수정됨!
      scores.F > scores.C ? 'F' : 'C'
    ].join('');
    
    targetedResults[pattern.name] = { type, scores };
  });
  
  return targetedResults;
}

// 메인 실행
console.log('\n🎯 SAYU 퀴즈 점수 분포 분석');
console.log('='.repeat(60));

// 1. 질문 가중치 분석
analyzeQuestionWeights();

// 2. 랜덤 응답 시뮬레이션
console.log('\n\n📈 랜덤 응답 1000회 시뮬레이션 결과');
console.log('='.repeat(60));
const randomResults = simulateRandomResponses(1000);

// 결과를 빈도순으로 정렬
const sortedResults = Object.entries(randomResults)
  .sort((a, b) => b[1] - a[1]);

sortedResults.forEach(([type, count]) => {
  const percentage = (count / 10).toFixed(1);
  const bar = '█'.repeat(Math.floor(count / 20));
  console.log(`${type}: ${bar} ${count}회 (${percentage}%)`);
});

// 누락된 타입 확인
console.log('\n🔍 분포 분석:');
const missingTypes = allAPTTypes.filter(type => !randomResults[type]);
if (missingTypes.length > 0) {
  console.log(`⚠️  나타나지 않은 타입: ${missingTypes.join(', ')}`);
} else {
  console.log('✅ 모든 16개 타입이 나타남');
}

// 분포 균등성 체크
const counts = Object.values(randomResults);
const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
const stdDev = Math.sqrt(counts.reduce((sum, count) => sum + Math.pow(count - avg, 2), 0) / counts.length);
console.log(`📊 평균 출현: ${avg.toFixed(1)}회`);
console.log(`📊 표준편차: ${stdDev.toFixed(1)}`);

// 3. 타겟 응답 테스트
console.log('\n\n🎯 극단적 선택 패턴 테스트');
console.log('='.repeat(60));
const targetedResults = simulateTargetedResponses();

Object.entries(targetedResults).forEach(([pattern, result]) => {
  console.log(`\n${pattern}:`);
  console.log(`  결과 타입: ${result.type}`);
  console.log(`  점수: L=${result.scores.L}, S=${result.scores.S}, A=${result.scores.A}, R=${result.scores.R}`);
  console.log(`        E=${result.scores.E}, M=${result.scores.M}, F=${result.scores.F}, C=${result.scores.C}`);
});

console.log('\n\n✅ 분석 완료!');