// 🎨 SAYU Chemistry Calculator
// 인지기능 기반 궁합 점수 계산 시스템

import { typeFunctionStacks, functionWeights } from './personality-functions';

export interface ChemistryScore {
  total: number;
  breakdown: {
    primary: number;
    auxiliary: number;
    tertiary: number;
    inferior: number;
    bonus: number;
  };
  level: 'platinum' | 'gold' | 'silver' | 'bronze';
  percentage: number;
}

// 기능 간 상호작용 보정값
const interactionMultipliers = {
  // 같은 축, 반대 성향 (보완적)
  'Le-Se': 2, 'Li-Si': 2, 'Se-Le': 2, 'Si-Li': 2,
  'Ae-Re': 2, 'Ai-Ri': 2, 'Re-Ae': 2, 'Ri-Ai': 2,
  'Ee-Me': 2, 'Ei-Mi': 2, 'Me-Ee': 2, 'Mi-Ei': 2,
  'Fe-Ce': 2, 'Fi-Ci': 2, 'Ce-Fe': 2, 'Ci-Fi': 2,
  
  // 같은 축, 같은 성향 (이해는 쉽지만 성장 제한)
  'Le-Li': 1, 'Li-Le': 1, 'Se-Si': 1, 'Si-Se': 1,
  'Ae-Ai': 1, 'Ai-Ae': 1, 'Re-Ri': 1, 'Ri-Re': 1,
  'Ee-Ei': 1, 'Ei-Ee': 1, 'Me-Mi': 1, 'Mi-Me': 1,
  'Fe-Fi': 1, 'Fi-Fe': 1, 'Ce-Ci': 1, 'Ci-Ce': 1,
  
  // 다른 축 (새로운 관점 제공)
  'default': 1.5
};

// 특별 보너스 계산
function calculateSpecialBonus(type1: string, type2: string): number {
  let bonus = 0;
  
  // 극과 극의 만남 (모든 차원이 반대)
  const dimensions1 = type1.split('');
  const dimensions2 = type2.split('');
  
  let oppositeCount = 0;
  if ((dimensions1[0] === 'L' && dimensions2[0] === 'S') || 
      (dimensions1[0] === 'S' && dimensions2[0] === 'L')) oppositeCount++;
  if ((dimensions1[1] === 'A' && dimensions2[1] === 'R') || 
      (dimensions1[1] === 'R' && dimensions2[1] === 'A')) oppositeCount++;
  if ((dimensions1[2] === 'E' && dimensions2[2] === 'M') || 
      (dimensions1[2] === 'M' && dimensions2[2] === 'E')) oppositeCount++;
  if ((dimensions1[3] === 'F' && dimensions2[3] === 'C') || 
      (dimensions1[3] === 'C' && dimensions2[3] === 'F')) oppositeCount++;
  
  if (oppositeCount === 4) bonus += 3; // 완전 정반대
  else if (oppositeCount === 3) bonus += 2; // 대부분 반대
  else if (oppositeCount === 0) bonus -= 2; // 완전히 같음 (성장 제한)
  
  return bonus;
}

// 두 기능 간 상호작용 점수 계산
function calculateFunctionInteraction(
  func1: string, 
  weight1: number, 
  func2: string, 
  weight2: number
): number {
  const key = `${func1}-${func2}`;
  const multiplier = interactionMultipliers[key as keyof typeof interactionMultipliers] || 
                     interactionMultipliers.default;
  
  return weight1 * weight2 * multiplier;
}

// 궁합 점수 계산
export function calculateChemistry(type1: string, type2: string): ChemistryScore {
  const stack1 = typeFunctionStacks[type1];
  const stack2 = typeFunctionStacks[type2];
  
  if (!stack1 || !stack2) {
    throw new Error(`Invalid types: ${type1}, ${type2}`);
  }
  
  const breakdown = {
    primary: calculateFunctionInteraction(
      stack1.primary, functionWeights.primary,
      stack2.primary, functionWeights.primary
    ),
    auxiliary: calculateFunctionInteraction(
      stack1.auxiliary, functionWeights.auxiliary,
      stack2.auxiliary, functionWeights.auxiliary
    ),
    tertiary: calculateFunctionInteraction(
      stack1.tertiary, functionWeights.tertiary,
      stack2.tertiary, functionWeights.tertiary
    ),
    inferior: calculateFunctionInteraction(
      stack1.inferior, functionWeights.inferior,
      stack2.inferior, functionWeights.inferior
    ),
    bonus: calculateSpecialBonus(type1, type2)
  };
  
  const total = Object.values(breakdown).reduce((sum, val) => sum + val, 0);
  
  // 레벨 결정
  let level: ChemistryScore['level'];
  if (total >= 18) level = 'platinum';
  else if (total >= 14) level = 'gold';
  else if (total >= 10) level = 'silver';
  else level = 'bronze';
  
  // 백분율 계산 (최대 20점 기준)
  const percentage = Math.min(100, Math.max(0, Math.round((total / 20) * 100)));
  
  return {
    total,
    breakdown,
    level,
    percentage
  };
}

// 모든 유형과의 궁합 계산
export function calculateAllChemistries(type: string): Record<string, ChemistryScore> {
  const allTypes = Object.keys(typeFunctionStacks);
  const chemistries: Record<string, ChemistryScore> = {};
  
  for (const otherType of allTypes) {
    if (otherType !== type) {
      chemistries[otherType] = calculateChemistry(type, otherType);
    }
  }
  
  return chemistries;
}

// 최고/최저 궁합 찾기
export function findBestAndWorstMatches(type: string) {
  const allChemistries = calculateAllChemistries(type);
  const sorted = Object.entries(allChemistries)
    .sort(([, a], [, b]) => b.total - a.total);
  
  return {
    best: sorted.slice(0, 5).map(([type, score]) => ({ type, score })),
    worst: sorted.slice(-5).map(([type, score]) => ({ type, score }))
  };
}