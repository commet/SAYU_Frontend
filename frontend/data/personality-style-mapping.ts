// 성격 유형과 아트 스타일 매핑
export const personalityStyleMapping: Record<string, {
  recommendedStyles: string[];
  reason: { ko: string; en: string };
}> = {
  // L (Lone) + A (Abstract) 조합 - 개인적이고 추상적인 성향
  'LAEF': {
    recommendedStyles: ['vangogh-postimpressionism', 'klimt-artnouveau', 'korean-minhwa'],
    reason: {
      ko: '내면의 감정을 풍부하게 표현하는 스타일이 어울려요',
      en: 'Styles that richly express inner emotions suit you'
    }
  },
  'LAEC': {
    recommendedStyles: ['monet-impressionism', 'klimt-artnouveau'],
    reason: {
      ko: '섬세한 감정을 아름답게 담아내는 스타일을 추천해요',
      en: 'Styles that beautifully capture delicate emotions'
    }
  },
  'LAMF': {
    recommendedStyles: ['picasso-cubism', 'mondrian-neoplasticism'],
    reason: {
      ko: '의미를 자유롭게 해석할 수 있는 추상적 스타일이 맞아요',
      en: 'Abstract styles that allow free interpretation of meaning'
    }
  },
  'LAMC': {
    recommendedStyles: ['mondrian-neoplasticism', 'pixel-art'],
    reason: {
      ko: '체계적이면서도 개인적인 의미를 담는 스타일을 추천해요',
      en: 'Systematic styles that hold personal meaning'
    }
  },

  // L (Lone) + R (Realistic) 조합 - 개인적이고 현실적인 성향
  'LREF': {
    recommendedStyles: ['vangogh-postimpressionism', 'korean-minhwa'],
    reason: {
      ko: '현실을 개인적 감정으로 재해석하는 스타일이 어울려요',
      en: 'Styles that reinterpret reality through personal emotions'
    }
  },
  'LREC': {
    recommendedStyles: ['monet-impressionism', 'korean-minhwa'],
    reason: {
      ko: '일상의 아름다움을 섬세하게 포착하는 스타일을 추천해요',
      en: 'Styles that delicately capture everyday beauty'
    }
  },
  'LRMF': {
    recommendedStyles: ['warhol-popart', 'pixel-art'],
    reason: {
      ko: '현실을 독특한 시각으로 재해석하는 스타일이 맞아요',
      en: 'Styles that reinterpret reality with unique perspective'
    }
  },
  'LRMC': {
    recommendedStyles: ['pixel-art', 'korean-minhwa'],
    reason: {
      ko: '전통과 현실을 체계적으로 표현하는 스타일을 추천해요',
      en: 'Styles that systematically express tradition and reality'
    }
  },

  // S (Social) + A (Abstract) 조합 - 사회적이고 추상적인 성향
  'SAEF': {
    recommendedStyles: ['warhol-popart', 'picasso-cubism'],
    reason: {
      ko: '대중과 소통하는 역동적인 스타일이 어울려요',
      en: 'Dynamic styles that communicate with the public'
    }
  },
  'SAEC': {
    recommendedStyles: ['klimt-artnouveau', 'monet-impressionism'],
    reason: {
      ko: '감정을 우아하게 공유하는 스타일을 추천해요',
      en: 'Styles that elegantly share emotions'
    }
  },
  'SAMF': {
    recommendedStyles: ['picasso-cubism', 'warhol-popart'],
    reason: {
      ko: '사회적 메시지를 담은 혁신적 스타일이 맞아요',
      en: 'Innovative styles with social messages'
    }
  },
  'SAMC': {
    recommendedStyles: ['mondrian-neoplasticism', 'warhol-popart'],
    reason: {
      ko: '질서 있는 사회적 표현을 담는 스타일을 추천해요',
      en: 'Styles with orderly social expression'
    }
  },

  // S (Social) + R (Realistic) 조합 - 사회적이고 현실적인 성향
  'SREF': {
    recommendedStyles: ['warhol-popart', 'korean-minhwa'],
    reason: {
      ko: '일상을 즐겁게 공유하는 스타일이 어울려요',
      en: 'Styles that joyfully share everyday life'
    }
  },
  'SREC': {
    recommendedStyles: ['korean-minhwa', 'monet-impressionism'],
    reason: {
      ko: '전통과 현실의 아름다움을 나누는 스타일을 추천해요',
      en: 'Styles that share beauty of tradition and reality'
    }
  },
  'SRMF': {
    recommendedStyles: ['warhol-popart', 'pixel-art'],
    reason: {
      ko: '현대 문화를 자유롭게 표현하는 스타일이 맞아요',
      en: 'Styles that freely express modern culture'
    }
  },
  'SRMC': {
    recommendedStyles: ['pixel-art', 'mondrian-neoplasticism'],
    reason: {
      ko: '디지털 시대의 질서를 담는 스타일을 추천해요',
      en: 'Styles that capture digital era order'
    }
  }
};

// 스타일별 성격 특성 매핑
export const stylePersonalityTraits: Record<string, {
  traits: { ko: string[]; en: string[] };
  description: { ko: string; en: string };
}> = {
  'monet-impressionism': {
    traits: {
      ko: ['감성적', '섬세한', '평화로운'],
      en: ['Emotional', 'Delicate', 'Peaceful']
    },
    description: {
      ko: '빛과 색의 순간적인 변화를 포착하여 감성적인 아름다움을 표현합니다',
      en: 'Captures momentary changes in light and color to express emotional beauty'
    }
  },
  'picasso-cubism': {
    traits: {
      ko: ['혁신적', '지적인', '다면적'],
      en: ['Innovative', 'Intellectual', 'Multifaceted']
    },
    description: {
      ko: '다양한 시각을 하나로 통합하여 새로운 관점을 제시합니다',
      en: 'Integrates multiple perspectives to present new viewpoints'
    }
  },
  'vangogh-postimpressionism': {
    traits: {
      ko: ['열정적', '표현력 강한', '감정적'],
      en: ['Passionate', 'Expressive', 'Emotional']
    },
    description: {
      ko: '강렬한 붓터치로 내면의 감정을 생생하게 표현합니다',
      en: 'Vividly expresses inner emotions through intense brushstrokes'
    }
  },
  'warhol-popart': {
    traits: {
      ko: ['대중적', '현대적', '유쾌한'],
      en: ['Popular', 'Contemporary', 'Playful']
    },
    description: {
      ko: '일상의 이미지를 예술로 승화시켜 대중과 소통합니다',
      en: 'Elevates everyday images to art to communicate with the public'
    }
  },
  'pixel-art': {
    traits: {
      ko: ['디지털 감성', '정교한', '레트로'],
      en: ['Digital', 'Precise', 'Retro']
    },
    description: {
      ko: '픽셀 하나하나로 디지털 시대의 감성을 표현합니다',
      en: 'Expresses digital era sensibility pixel by pixel'
    }
  },
  'korean-minhwa': {
    traits: {
      ko: ['전통적', '상징적', '생동감 있는'],
      en: ['Traditional', 'Symbolic', 'Vibrant']
    },
    description: {
      ko: '한국의 전통미와 민중의 소망을 담아 표현합니다',
      en: 'Expresses Korean traditional beauty and folk aspirations'
    }
  },
  'klimt-artnouveau': {
    traits: {
      ko: ['우아한', '장식적', '신비로운'],
      en: ['Elegant', 'Decorative', 'Mystical']
    },
    description: {
      ko: '황금빛 장식과 상징으로 우아한 아름다움을 표현합니다',
      en: 'Expresses elegant beauty through golden decorations and symbols'
    }
  },
  'mondrian-neoplasticism': {
    traits: {
      ko: ['질서정연한', '순수한', '균형적'],
      en: ['Orderly', 'Pure', 'Balanced']
    },
    description: {
      ko: '기본 요소들의 완벽한 균형으로 순수한 조화를 추구합니다',
      en: 'Pursues pure harmony through perfect balance of basic elements'
    }
  }
};