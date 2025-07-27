/**
 * SAYU APT 시스템 무결성 실시간 검증
 * 이 파일은 모든 APT 관련 파일에서 import되어 자동으로 검증을 수행합니다.
 */

const FORBIDDEN_TERMS = {
  'Free': 'Flow',
  'Mental': 'Meaning-driven', 
  'Grounded': 'Lone',
  'Logic': 'Lone',
  'Flexible': 'Flow'
};

const CORRECT_AXES = {
  'L/S': 'Lone (Individual, introspective) vs Social (Interactive, collaborative)',
  'A/R': 'Abstract (Atmospheric, symbolic) vs Representational (Realistic, concrete)',
  'E/M': 'Emotional (Affective, feeling-based) vs Meaning-driven (Analytical, rational)',
  'F/C': 'Flow (Fluid, spontaneous) vs Constructive (Structured, systematic)'
};

// 전역 검증 함수
global.validateSAYUAxis = function(axisName, definition) {
  // 금지된 용어 검사
  for (const [forbidden, correct] of Object.entries(FORBIDDEN_TERMS)) {
    if (definition.includes(forbidden)) {
      throw new Error(`
        ❌ SAYU 시스템 오류: "${forbidden}"는 잘못된 용어입니다!
        ✅ 올바른 용어: "${correct}"
        파일: ${new Error().stack.split('\n')[3]}
      `);
    }
  }
  
  // 올바른 축 이름 검사
  if (!Object.keys(CORRECT_AXES).includes(axisName)) {
    throw new Error(`
      ❌ SAYU 시스템 오류: "${axisName}"는 유효하지 않은 축입니다!
      ✅ 유효한 축: ${Object.keys(CORRECT_AXES).join(', ')}
    `);
  }
};

// APT 타입 검증
global.validateSAYUType = function(typeCode) {
  if (!typeCode.match(/^[LS][AR][EM][FC]$/)) {
    throw new Error(`
      ❌ SAYU 시스템 오류: "${typeCode}"는 잘못된 APT 타입입니다!
      ✅ 올바른 형식: [L/S][A/R][E/M][F/C] (예: LAEF, SRMC)
    `);
  }
};

// 자동 실행 검증
if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
  console.log('🛡️ SAYU APT 무결성 검증 활성화됨');
}

module.exports = {
  FORBIDDEN_TERMS,
  CORRECT_AXES,
  validateSAYUAxis,
  validateSAYUType
};