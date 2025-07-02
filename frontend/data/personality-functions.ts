// 🎨 SAYU Cognitive Functions System
// 8가지 인지기능 체계와 유형별 기능 순서

export interface CognitiveFunction {
  code: string;
  name: string;
  name_ko: string;
  description: string;
  description_ko: string;
}

export const cognitiveFunctions: Record<string, CognitiveFunction> = {
  Le: {
    code: 'Le',
    name: 'Lone external',
    name_ko: '혼자서 외부 관찰',
    description: 'Observing art independently from an external perspective',
    description_ko: '독립적으로 외부 관점에서 예술을 관찰'
  },
  Li: {
    code: 'Li',
    name: 'Lone internal',
    name_ko: '혼자서 내면 탐구',
    description: 'Exploring inner feelings while viewing art alone',
    description_ko: '혼자 작품을 보며 내면의 감정 탐구'
  },
  Se: {
    code: 'Se',
    name: 'Shared external',
    name_ko: '함께 외부 교류',
    description: 'Exchanging observations with others',
    description_ko: '다른 사람들과 관찰 내용을 교류'
  },
  Si: {
    code: 'Si',
    name: 'Shared internal',
    name_ko: '함께 내면 공유',
    description: 'Sharing inner experiences with others',
    description_ko: '내면의 경험을 다른 사람들과 공유'
  },
  Ae: {
    code: 'Ae',
    name: 'Abstract external',
    name_ko: '추상의 표현',
    description: 'Expressing abstract concepts and atmospheres',
    description_ko: '추상적 개념과 분위기를 표현'
  },
  Ai: {
    code: 'Ai',
    name: 'Abstract internal',
    name_ko: '추상의 수용',
    description: 'Receiving and internalizing abstract impressions',
    description_ko: '추상적 인상을 받아들이고 내면화'
  },
  Re: {
    code: 'Re',
    name: 'Representational external',
    name_ko: '구상의 전달',
    description: 'Communicating concrete facts and narratives',
    description_ko: '구체적 사실과 이야기를 전달'
  },
  Ri: {
    code: 'Ri',
    name: 'Representational internal',
    name_ko: '구상의 분석',
    description: 'Analyzing concrete details and meanings',
    description_ko: '구체적 디테일과 의미를 분석'
  },
  Ee: {
    code: 'Ee',
    name: 'Emotional external',
    name_ko: '감정의 표현',
    description: 'Expressing emotions outwardly',
    description_ko: '감정을 외부로 표현'
  },
  Ei: {
    code: 'Ei',
    name: 'Emotional internal',
    name_ko: '감정의 수용',
    description: 'Processing emotions internally',
    description_ko: '감정을 내면에서 처리'
  },
  Me: {
    code: 'Me',
    name: 'Meaning external',
    name_ko: '의미의 전달',
    description: 'Sharing interpretations and meanings',
    description_ko: '해석과 의미를 공유'
  },
  Mi: {
    code: 'Mi',
    name: 'Meaning internal',
    name_ko: '의미의 탐구',
    description: 'Seeking personal understanding and significance',
    description_ko: '개인적 이해와 의의를 탐구'
  },
  Fe: {
    code: 'Fe',
    name: 'Flow external',
    name_ko: '흐름의 표현',
    description: 'Spontaneous external expression',
    description_ko: '자발적인 외부 표현'
  },
  Fi: {
    code: 'Fi',
    name: 'Flow internal',
    name_ko: '흐름의 수용',
    description: 'Internal flow and intuitive reception',
    description_ko: '내면의 흐름과 직관적 수용'
  },
  Ce: {
    code: 'Ce',
    name: 'Constructive external',
    name_ko: '체계의 구축',
    description: 'Building systematic frameworks',
    description_ko: '체계적인 틀을 구축'
  },
  Ci: {
    code: 'Ci',
    name: 'Constructive internal',
    name_ko: '체계의 적용',
    description: 'Applying structured thinking internally',
    description_ko: '구조적 사고를 내면에 적용'
  }
};

// 유형별 인지기능 순서 (주기능 2점, 보조기능 1점, 3차기능 -1점, 열등기능 -2점)
export interface FunctionStack {
  primary: string;    // 2점
  auxiliary: string;  // 1점
  tertiary: string;   // -1점
  inferior: string;   // -2점
}

export const typeFunctionStacks: Record<string, FunctionStack> = {
  // Lone + Abstract + Emotional + Flow
  LAEF: {
    primary: 'Li',    // 혼자서 내면 탐구
    auxiliary: 'Ai',  // 추상의 수용
    tertiary: 'Ee',   // 감정 표현 (약함)
    inferior: 'Ce'    // 체계 구축 (열등)
  },
  // Lone + Abstract + Emotional + Constructive
  LAEC: {
    primary: 'Li',    // 혼자서 내면 탐구
    auxiliary: 'Ai',  // 추상의 수용
    tertiary: 'Ei',   // 감정 수용
    inferior: 'Se'    // 함께 외부 교류 (열등)
  },
  // Lone + Abstract + Meaning + Flow
  LAMF: {
    primary: 'Li',    // 혼자서 내면 탐구
    auxiliary: 'Ai',  // 추상의 수용
    tertiary: 'Mi',   // 의미 탐구
    inferior: 'Se'    // 함께 외부 교류 (열등)
  },
  // Lone + Abstract + Meaning + Constructive
  LAMC: {
    primary: 'Li',    // 혼자서 내면 탐구
    auxiliary: 'Ci',  // 체계의 적용
    tertiary: 'Mi',   // 의미 탐구
    inferior: 'Se'    // 함께 외부 교류 (열등)
  },
  // Lone + Representational + Emotional + Flow
  LREF: {
    primary: 'Li',    // 혼자서 내면 탐구
    auxiliary: 'Ri',  // 구상의 분석
    tertiary: 'Ei',   // 감정 수용
    inferior: 'Se'    // 함께 외부 교류 (열등)
  },
  // Lone + Representational + Emotional + Constructive
  LREC: {
    primary: 'Li',    // 혼자서 내면 탐구
    auxiliary: 'Ri',  // 구상의 분석
    tertiary: 'Ci',   // 체계의 적용
    inferior: 'Fe'    // 흐름의 표현 (열등)
  },
  // Lone + Representational + Meaning + Flow
  LRMF: {
    primary: 'Le',    // 혼자서 외부 관찰
    auxiliary: 'Ri',  // 구상의 분석
    tertiary: 'Fi',   // 흐름의 수용
    inferior: 'Se'    // 함께 외부 교류 (열등)
  },
  // Lone + Representational + Meaning + Constructive
  LRMC: {
    primary: 'Li',    // 혼자서 내면 탐구
    auxiliary: 'Ci',  // 체계의 적용
    tertiary: 'Re',   // 구상의 전달
    inferior: 'Fe'    // 흐름의 표현 (열등)
  },
  // Social + Abstract + Emotional + Flow
  SAEF: {
    primary: 'Se',    // 함께 외부 교류
    auxiliary: 'Ae',  // 추상의 표현
    tertiary: 'Ee',   // 감정 표현
    inferior: 'Ci'    // 체계의 적용 (열등)
  },
  // Social + Abstract + Emotional + Constructive
  SAEC: {
    primary: 'Se',    // 함께 외부 교류
    auxiliary: 'Ce',  // 체계의 구축
    tertiary: 'Ae',   // 추상의 표현
    inferior: 'Li'    // 혼자서 내면 탐구 (열등)
  },
  // Social + Abstract + Meaning + Flow
  SAMF: {
    primary: 'Se',    // 함께 외부 교류
    auxiliary: 'Me',  // 의미의 전달
    tertiary: 'Fe',   // 흐름의 표현
    inferior: 'Li'    // 혼자서 내면 탐구 (열등)
  },
  // Social + Abstract + Meaning + Constructive
  SAMC: {
    primary: 'Se',    // 함께 외부 교류
    auxiliary: 'Ce',  // 체계의 구축
    tertiary: 'Me',   // 의미의 전달
    inferior: 'Fi'    // 흐름의 수용 (열등)
  },
  // Social + Representational + Emotional + Flow
  SREF: {
    primary: 'Se',    // 함께 외부 교류
    auxiliary: 'Ee',  // 감정의 표현
    tertiary: 'Re',   // 구상의 전달
    inferior: 'Ci'    // 체계의 적용 (열등)
  },
  // Social + Representational + Emotional + Constructive
  SREC: {
    primary: 'Se',    // 함께 외부 교류
    auxiliary: 'Ce',  // 체계의 구축
    tertiary: 'Ee',   // 감정의 표현
    inferior: 'Li'    // 혼자서 내면 탐구 (열등)
  },
  // Social + Representational + Meaning + Flow
  SRMF: {
    primary: 'Se',    // 함께 외부 교류
    auxiliary: 'Re',  // 구상의 전달
    tertiary: 'Me',   // 의미의 전달
    inferior: 'Li'    // 혼자서 내면 탐구 (열등)
  },
  // Social + Representational + Meaning + Constructive
  SRMC: {
    primary: 'Se',    // 함께 외부 교류
    auxiliary: 'Ce',  // 체계의 구축
    tertiary: 'Re',   // 구상의 전달
    inferior: 'Li'    // 혼자서 내면 탐구 (열등)
  }
};

// 기능 가중치
export const functionWeights = {
  primary: 2,
  auxiliary: 1,
  tertiary: -1,
  inferior: -2
};