/**
 * Enhanced Quiz Scoring System
 * 더 균형잡힌 16가지 성격 유형 분포를 위한 개선된 점수 시스템
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

// 각 차원별 질문 응답 히스토리를 고려한 점수 계산
export function calculateEnhancedScore(
  rawScores: DimensionScore,
  responses: Array<{ weight: Record<string, number> }>
): string {
  // 1단계: 기본 점수 정규화 (모든 차원을 0-100 스케일로)
  const normalized = normalizeScores(rawScores);
  
  // 2단계: L/S 차원 특별 처리
  // L/S 질문이 적으므로 해당 질문에서의 선택 강도를 더 크게 반영
  const lsEnhanced = enhanceLSDimension(normalized, responses);
  
  // 3단계: 각 차원에서 명확한 우위 결정
  const type = 
    (lsEnhanced.L > lsEnhanced.S ? 'L' : 'S') +
    (normalized.A > normalized.R ? 'A' : 'R') +
    (normalized.E > normalized.M ? 'E' : 'M') +
    (normalized.F > normalized.C ? 'F' : 'C');
    
  return type;
}

// 점수 정규화 함수
function normalizeScores(rawScores: DimensionScore): DimensionScore {
  // 실제 퀴즈 데이터 분석 결과에 따른 정확한 최대값
  const maxScores = {
    L: 10, S: 10,   // L/S 실제 최대: Q2(3) + Q3(3) + Q10(4) = 10점
    A: 10, R: 10,   // A/R 실제 최대: Q1(2) + Q4(3) + Q5(2) + Q9(1) + Q10(2) = 10점
    E: 8, M: 8,     // E/M 실제 최대: Q5(1) + Q6(3) + Q7(2) + Q10(2) = 8점 (개선 필요)
    F: 7, C: 7      // F/C 실제 최대: Q1(1) + Q7(1) + Q8(3) + Q9(2) = 7점 (개선 필요)
  };
  
  return {
    L: (rawScores.L / maxScores.L) * 100,
    S: (rawScores.S / maxScores.S) * 100,
    A: (rawScores.A / maxScores.A) * 100,
    R: (rawScores.R / maxScores.R) * 100,
    E: (rawScores.E / maxScores.E) * 100,
    M: (rawScores.M / maxScores.M) * 100,
    F: (rawScores.F / maxScores.F) * 100,
    C: (rawScores.C / maxScores.C) * 100
  };
}

// L/S 차원 강화 함수 (간소화된 버전)
function enhanceLSDimension(
  normalized: DimensionScore,
  responses: Array<{ weight: Record<string, number> }>
): DimensionScore {
  const enhanced = { ...normalized };
  
  // 동점 시에만 미세한 차이 생성 (일관성 유지)
  if (Math.abs(enhanced.L - enhanced.S) < 2) {
    // 응답 패턴을 기반으로 한 미세 조정
    const lsResponses = responses.filter(r => r.weight.L || r.weight.S);
    
    if (lsResponses.length > 0) {
      // 가장 최근 L/S 관련 응답의 가중치를 참고
      const lastLSResponse = lsResponses[lsResponses.length - 1];
      if (lastLSResponse.weight.L > lastLSResponse.weight.S) {
        enhanced.L += 1;
      } else {
        enhanced.S += 1;
      }
    } else {
      // L/S 응답이 없다면 기본적으로 L 선호 (더 안전한 기본값)
      enhanced.L += 1;
    }
  }
  
  return enhanced;
}

// 점수 분포 분석 함수 (디버깅용)
export function analyzeScoreDistribution(
  rawScores: DimensionScore,
  responses: Array<{ weight: Record<string, number> }>
): {
  rawType: string;
  enhancedType: string;
  dimensionStrengths: Record<string, number>;
} {
  // 원래 방식으로 타입 결정
  const rawType = 
    (rawScores.L > rawScores.S ? 'L' : 'S') +
    (rawScores.A > rawScores.R ? 'A' : 'R') +
    (rawScores.E > rawScores.M ? 'E' : 'M') +
    (rawScores.F > rawScores.C ? 'F' : 'C');
    
  // 개선된 방식으로 타입 결정
  const enhancedType = calculateEnhancedScore(rawScores, responses);
  
  // 각 차원의 선호 강도
  const normalized = normalizeScores(rawScores);
  const dimensionStrengths = {
    LS: Math.abs(normalized.L - normalized.S),
    AR: Math.abs(normalized.A - normalized.R),
    EM: Math.abs(normalized.E - normalized.M),
    FC: Math.abs(normalized.F - normalized.C)
  };
  
  return {
    rawType,
    enhancedType,
    dimensionStrengths
  };
}