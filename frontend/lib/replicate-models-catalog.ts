// Replicate 모델 카탈로그 - 스타일 변환에 최적화된 모델들
// 2024년 최신 버전, 각 모델의 특징과 최적 사용 사례

export const REPLICATE_MODELS = {
  // 🎨 범용 스타일 변환 모델
  STYLE_TRANSFER: {
    'fofr/style-transfer': {
      name: 'Universal Style Transfer',
      description: '어떤 이미지의 스타일도 다른 이미지에 적용',
      cost: '$0.0072 per run',
      speed: '2-3초',
      bestFor: '일반적인 스타일 변환',
      gpu: 'Nvidia L40S',
      link: 'https://replicate.com/fofr/style-transfer'
    },
    
    'rossjillian/controlnet': {
      name: 'ControlNet Style Transfer',
      description: '구조를 완벽하게 유지하며 스타일만 변경',
      cost: '$0.002 per run',
      speed: '3-5초',
      bestFor: '정확한 구도 유지가 필요한 경우',
    },
  },

  // 🖼️ Stable Diffusion 계열 (최신/최강)
  STABLE_DIFFUSION: {
    'stability-ai/sdxl': {
      name: 'Stable Diffusion XL',
      version: '1.0',
      description: '최고 품질의 이미지 생성, img2img 지원',
      cost: '$0.00055/sec',
      bestFor: '고품질 아트워크',
      params: {
        refine: 'expert_ensemble_refiner',
        scheduler: 'K_EULER',
        num_inference_steps: 30,
      }
    },

    'stability-ai/stable-diffusion-3': {
      name: 'Stable Diffusion 3',
      description: '2024년 최신 모델, 텍스트 렌더링 개선',
      cost: '$0.035 per run',
      bestFor: '텍스트가 포함된 이미지',
      note: '더 비싸지만 품질 최고'
    },

    'black-forest-labs/flux-schnell': {
      name: 'FLUX Schnell',
      description: '초고속 생성, 품질 우수',
      cost: '$0.003 per run',
      speed: '1-2초',
      bestFor: '빠른 프로토타이핑',
    },

    'black-forest-labs/flux-pro': {
      name: 'FLUX Pro',
      description: '2024년 최강 모델, 프로페셔널 품질',
      cost: '$0.055 per run',
      bestFor: '상업용 고품질 아트',
    },
  },

  // 🎌 애니메/일러스트 특화
  ANIME_ILLUSTRATION: {
    'cjwbw/anything-v3-better-vae': {
      name: 'Anything V3',
      description: '애니메 스타일 특화, VAE 개선 버전',
      cost: '$0.002 per run',
      bestFor: '애니메/만화 스타일',
      styles: ['anime', 'manga', 'ghibli']
    },

    'lambdal/text-to-pokemon': {
      name: 'Pokemon Style',
      description: '포켓몬 스타일 일러스트',
      cost: '$0.001 per run',
      bestFor: '귀여운 캐릭터 스타일',
    },

    'cjwbw/waifu-diffusion': {
      name: 'Waifu Diffusion',
      description: '고품질 애니메 아트',
      cost: '$0.002 per run',
      bestFor: '디테일한 애니메 아트',
    },
  },

  // 🎭 특정 아티스트 스타일
  ARTIST_STYLES: {
    'tommorow/material-diffusion': {
      name: 'Material Design Style',
      description: '구글 Material Design 스타일',
      cost: '$0.001 per run',
      bestFor: 'UI/UX 디자인 스타일',
    },

    'andreasjansson/pixelart': {
      name: 'Pixel Art Generator',
      description: '픽셀 아트 변환',
      cost: '$0.001 per run',
      bestFor: '레트로 게임 스타일',
    },

    'prompthero/openjourney': {
      name: 'OpenJourney (Midjourney Style)',
      description: 'Midjourney 스타일 재현',
      cost: '$0.002 per run',
      bestFor: '판타지/몽환적 스타일',
    },
  },

  // 🔧 특수 기능 모델
  SPECIAL_FEATURES: {
    'tencentarc/photomaker': {
      name: 'PhotoMaker',
      description: '얼굴 보존하며 스타일 변경',
      cost: '$0.01 per run',
      bestFor: '프로필 사진 스타일화',
      note: '얼굴 특징 완벽 보존'
    },

    'zsxkib/instant-id': {
      name: 'Instant ID',
      description: '인물 ID 보존 스타일 변환',
      cost: '$0.008 per run',
      bestFor: '인물 사진 스타일화',
    },

    'jagilley/controlnet-pose': {
      name: 'ControlNet Pose',
      description: '포즈만 유지하고 스타일 변경',
      cost: '$0.003 per run',
      bestFor: '동작/포즈 유지',
    },

    'jagilley/controlnet-canny': {
      name: 'ControlNet Canny',
      description: '윤곽선 기반 스타일 변환',
      cost: '$0.003 per run',
      bestFor: '라인아트 스타일',
    },
  },

  // 🚀 최신 2024 모델
  LATEST_2024: {
    'playgroundai/playground-v2.5': {
      name: 'Playground v2.5',
      description: '2024년 출시, 포토리얼리스틱',
      cost: '$0.022 per run',
      bestFor: '사실적인 이미지',
    },

    'lucataco/sdxl-lightning-4step': {
      name: 'SDXL Lightning',
      description: '4단계만으로 생성, 초고속',
      cost: '$0.001 per run',
      speed: '1초 미만',
      bestFor: '실시간 생성',
    },

    'bytedance/sdxl-lightning-2step': {
      name: 'SDXL Lightning 2-Step',
      description: '2단계 생성, 최고속',
      cost: '$0.0005 per run',
      speed: '0.5초',
      bestFor: '즉각적인 프리뷰',
    },
  },

  // 🎨 LoRA 모델 (스타일 특화)
  LORA_MODELS: {
    'cloneofsimo/lora': {
      name: 'LoRA Training',
      description: '커스텀 스타일 학습',
      cost: '$2 per training',
      time: '2분',
      bestFor: '개인 스타일 생성',
    },

    'replicate/lora-training': {
      name: 'Official LoRA Training',
      description: '공식 LoRA 학습 파이프라인',
      cost: '$1.5 per training',
      bestFor: '브랜드 스타일 생성',
    },
  }
};

// 용도별 추천 모델
export const RECOMMENDED_BY_USE_CASE = {
  '프로필_사진': ['tencentarc/photomaker', 'zsxkib/instant-id'],
  '지브리_스타일': ['cjwbw/anything-v3-better-vae', 'prompthero/openjourney'],
  '빠른_생성': ['lucataco/sdxl-lightning-4step', 'black-forest-labs/flux-schnell'],
  '최고_품질': ['black-forest-labs/flux-pro', 'stability-ai/stable-diffusion-3'],
  '저렴한_옵션': ['andreasjansson/pixelart', 'bytedance/sdxl-lightning-2step'],
  '구도_유지': ['rossjillian/controlnet', 'jagilley/controlnet-canny'],
  '커스텀_스타일': ['cloneofsimo/lora', 'replicate/lora-training'],
};

// 비용 비교 차트
export const COST_COMPARISON = {
  'DALL-E 3 HD': 0.08,
  'FLUX Pro': 0.055,
  'Stable Diffusion 3': 0.035,
  'Playground v2.5': 0.022,
  'PhotoMaker': 0.01,
  'Style Transfer': 0.0072,
  'SDXL': 0.002,
  'Anything V3': 0.002,
  'Lightning 4-step': 0.001,
  'Lightning 2-step': 0.0005,
};

// 모델 선택 가이드
export function selectBestModel(requirements: {
  budget?: 'low' | 'medium' | 'high';
  speed?: 'fast' | 'normal' | 'quality';
  style?: string;
  preserveFace?: boolean;
  preservePose?: boolean;
}) {
  const { budget = 'medium', speed = 'normal', style, preserveFace, preservePose } = requirements;

  // 얼굴 보존이 중요한 경우
  if (preserveFace) {
    return 'tencentarc/photomaker';
  }

  // 포즈 보존이 중요한 경우
  if (preservePose) {
    return 'jagilley/controlnet-pose';
  }

  // 스타일별 추천
  if (style?.includes('anime') || style?.includes('ghibli')) {
    return 'cjwbw/anything-v3-better-vae';
  }

  if (style?.includes('pixel')) {
    return 'andreasjansson/pixelart';
  }

  // 예산별 추천
  if (budget === 'low') {
    return speed === 'fast' 
      ? 'bytedance/sdxl-lightning-2step'
      : 'lucataco/sdxl-lightning-4step';
  }

  if (budget === 'high') {
    return speed === 'quality'
      ? 'black-forest-labs/flux-pro'
      : 'stability-ai/stable-diffusion-3';
  }

  // 기본 추천
  return 'stability-ai/sdxl';
}