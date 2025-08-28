/**
 * Balanced Quiz Scoring System for New Enhanced Questions
 * 새로운 균형잡힌 퀴즈 시스템을 위한 점수 계산
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

// 새로운 퀴즈 구조에 맞는 점수 계산
export function calculateBalancedScore(
  rawScores: DimensionScore
): string {
  // 새로운 퀴즈 구조의 실제 최대값
  // L-S: 각 7점 (Q1:3, Q5:3, Q6:2, Q10:3, Q14:2 중 일부)
  // A-R: 13점 분포
  // E-M: 13점 분포  
  // F-C: 13점 분포
  
  // 각 차원에서 우위 결정 (단순 비교)
  const type = 
    (rawScores.L > rawScores.S ? 'L' : 'S') +
    (rawScores.A > rawScores.R ? 'A' : 'R') +
    (rawScores.E > rawScores.M ? 'E' : 'M') +
    (rawScores.F > rawScores.C ? 'F' : 'C');
    
  return type;
}

// 정규화된 점수 계산 (0-100 스케일)
export function getNormalizedScores(rawScores: DimensionScore): DimensionScore {
  // 새로운 균형잡힌 최대값
  const maxScores = {
    L: 7, S: 7,     // Q1(3) + Q5(3) + Q6(2) + Q10(3) + Q14(2) = 14점을 양분
    A: 13, R: 13,   // 전체 13점
    E: 13, M: 13,   // 전체 13점  
    F: 13, C: 13    // 전체 13점
  };
  
  return {
    L: Math.min((rawScores.L / maxScores.L) * 100, 100),
    S: Math.min((rawScores.S / maxScores.S) * 100, 100),
    A: Math.min((rawScores.A / maxScores.A) * 100, 100),
    R: Math.min((rawScores.R / maxScores.R) * 100, 100),
    E: Math.min((rawScores.E / maxScores.E) * 100, 100),
    M: Math.min((rawScores.M / maxScores.M) * 100, 100),
    F: Math.min((rawScores.F / maxScores.F) * 100, 100),
    C: Math.min((rawScores.C / maxScores.C) * 100, 100)
  };
}

// 차원별 강도 계산 (얼마나 명확하게 한쪽으로 기울었는지)
export function getDimensionStrengths(normalized: DimensionScore): {
  LS: number;
  AR: number;
  EM: number;
  FC: number;
} {
  return {
    LS: Math.abs(normalized.L - normalized.S),
    AR: Math.abs(normalized.A - normalized.R),
    EM: Math.abs(normalized.E - normalized.M),
    FC: Math.abs(normalized.F - normalized.C)
  };
}

// 디버깅용 상세 분석
export function analyzeResults(
  rawScores: DimensionScore
): {
  type: string;
  normalized: DimensionScore;
  strengths: ReturnType<typeof getDimensionStrengths>;
  confidence: string;
} {
  const normalized = getNormalizedScores(rawScores);
  const type = calculateBalancedScore(rawScores);
  const strengths = getDimensionStrengths(normalized);
  
  // 전체적인 확신도 계산
  const avgStrength = (strengths.LS + strengths.AR + strengths.EM + strengths.FC) / 4;
  const confidence = avgStrength > 30 ? 'High' : avgStrength > 15 ? 'Medium' : 'Low';
  
  return {
    type,
    normalized,
    strengths,
    confidence
  };
}