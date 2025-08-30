/**
 * Quiz Scoring Adjustment
 * L/S 차원 불균형 보정을 위한 점수 조정 시스템
 */

export interface DimensionScore {
  L: number;
  S: number;
  A: number;
  R: number;
  E: number;
  M: number;
  F: number;
  C: number;
}

// 차원별 가중치 부스터 (L/S 차원 강화)
const DIMENSION_BOOSTERS = {
  L: 2.5,  // L/S 차원은 다른 차원의 절반 정도 가중치를 가지므로 2.5배 부스트
  S: 2.5,
  A: 1.0,
  R: 1.0,
  E: 1.5,  // E/M 차원도 약간 부족하므로 1.5배 부스트
  M: 1.5,
  F: 1.3,  // F/C 차원은 적당하므로 1.3배 부스트
  C: 1.3
};

// 차원별 차이를 강조하는 함수
function amplifyDifference(score1: number, score2: number, booster: number): [number, number] {
  // 먼저 부스터 적용
  const boosted1 = score1 * booster;
  const boosted2 = score2 * booster;
  
  // 차이가 작으면 더 크게 벌려줌
  const diff = Math.abs(boosted1 - boosted2);
  const total = boosted1 + boosted2;
  
  if (total === 0) return [0, 0];
  
  // 차이가 전체의 30% 미만이면 차이를 증폭
  if (diff / total < 0.3) {
    const amplifier = 2.0; // 차이를 2배로 증폭
    const avgScore = total / 2;
    
    if (boosted1 > boosted2) {
      return [avgScore + diff * amplifier / 2, avgScore - diff * amplifier / 2];
    } else {
      return [avgScore - diff * amplifier / 2, avgScore + diff * amplifier / 2];
    }
  }
  
  return [boosted1, boosted2];
}

export function adjustQuizScores(rawScores: DimensionScore): DimensionScore {
  const adjustedScores: DimensionScore = {} as DimensionScore;
  
  // L/S 차원 조정 (가장 불균형이 심한 차원)
  // 동점 방지를 위해 미세한 노이즈 추가
  const lNoise = rawScores.L === rawScores.S ? 0.1 : 0;
  const [adjL, adjS] = amplifyDifference(
    rawScores.L + lNoise, 
    rawScores.S, 
    DIMENSION_BOOSTERS.L
  );
  adjustedScores.L = adjL;
  adjustedScores.S = adjS;
  
  // A/R 차원 조정 (이미 충분하므로 부스터만 적용)
  adjustedScores.A = rawScores.A * DIMENSION_BOOSTERS.A;
  adjustedScores.R = rawScores.R * DIMENSION_BOOSTERS.R;
  
  // E/M 차원 조정
  const [adjE, adjM] = amplifyDifference(
    rawScores.E,
    rawScores.M,
    DIMENSION_BOOSTERS.E
  );
  adjustedScores.E = adjE;
  adjustedScores.M = adjM;
  
  // F/C 차원 조정
  const [adjF, adjC] = amplifyDifference(
    rawScores.F,
    rawScores.C,
    DIMENSION_BOOSTERS.F
  );
  adjustedScores.F = adjF;
  adjustedScores.C = adjC;
  
  return adjustedScores;
}

// 최종 성격 유형 결정
export function determinePersonalityType(adjustedScores: DimensionScore): string {
  const type = 
    (adjustedScores.L > adjustedScores.S ? 'L' : 'S') +
    (adjustedScores.A > adjustedScores.R ? 'A' : 'R') +
    (adjustedScores.M > adjustedScores.E ? 'M' : 'E') +
    (adjustedScores.F > adjustedScores.C ? 'F' : 'C');
  
  return type;
}

// 차원별 선호도 강도 계산 (0-100%)
export function calculateDimensionStrength(adjustedScores: DimensionScore): Record<string, number> {
  const strengths = {
    LS: Math.abs(adjustedScores.L - adjustedScores.S) / Math.max(adjustedScores.L, adjustedScores.S) * 100,
    AR: Math.abs(adjustedScores.A - adjustedScores.R) / Math.max(adjustedScores.A, adjustedScores.R) * 100,
    EM: Math.abs(adjustedScores.E - adjustedScores.M) / Math.max(adjustedScores.E, adjustedScores.M) * 100,
    FC: Math.abs(adjustedScores.F - adjustedScores.C) / Math.max(adjustedScores.F, adjustedScores.C) * 100
  };
  
  return strengths;
}

// 디버깅용: 조정 전후 점수 비교
export function debugScoreAdjustment(rawScores: DimensionScore) {
  const adjusted = adjustQuizScores(rawScores);
  const type = determinePersonalityType(adjusted);
  const strengths = calculateDimensionStrength(adjusted);
  
  console.log('🎯 Quiz Score Adjustment Debug:');
  console.log('Raw Scores:', rawScores);
  console.log('Adjusted Scores:', adjusted);
  console.log('Personality Type:', type);
  console.log('Dimension Strengths:', strengths);
  
  return { raw: rawScores, adjusted, type, strengths };
}