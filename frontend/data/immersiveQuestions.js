export const immersiveQuestions = [
  // Opening Questions - Setting the Mood
  {
    id: 'twilight_doors',
    type: 'visual_choice',
    narrative: {
      ko: '황혼의 미술관. 두 개의 문이 있다.',
      en: 'Museum at twilight. Two doors await.'
    },
    targetAxes: ['LS'],
    choices: [
      {
        id: 'A',
        visual: {
          gradient: ['#FF6B6B', '#4ECDC4', '#FFE66D'],
          animation: 'pulse_warm',
          icon: 'users'
        },
        hover_text: '소리가 들린다',
        weight: { S: 3, E: 1 }
      },
      {
        id: 'B',
        visual: {
          gradient: ['#2E86AB', '#A23B72', '#F18F01'],
          animation: 'shimmer_cool',
          icon: 'moon'
        },
        hover_text: '고요가 부른다',
        weight: { L: 3, M: 1 }
      }
    ]
  },
  
  // Art Appreciation Style
  {
    id: 'artwork_encounter',
    type: 'visual_choice',
    narrative: {
      ko: '작품 앞. 첫 눈길이 머무는 곳은?',
      en: 'Before the artwork. Where does your gaze linger?'
    },
    targetAxes: ['AR'],
    choices: [
      {
        id: 'A',
        visual: {
          gradient: ['#667eea', '#764ba2'],
          animation: 'float',
          icon: 'heart'
        },
        hover_text: '색과 형태의 지
',
        weight: { A: 3, F: 1 }
      },
      {
        id: 'B',
        visual: {
          gradient: ['#43e97b', '#38f9d7'],
          animation: 'rotate',
          icon: 'brain'
        },
        hover_text: '의미와 맥락의 실',
        weight: { R: 3, C: 1 }
      }
    ]
  },

  // Emotional Response
  {
    id: 'emotional_reaction',
    type: 'visual_choice',
    narrative: {
      ko: '감동적인 작품 앞에서. 당신의 반응은?',
      en: 'Before a moving piece. Your response?'
    },
    targetAxes: ['ME'],
    choices: [
      {
        id: 'A',
        visual: {
          gradient: ['#f093fb', '#f5576c'],
          animation: 'pulse_warm',
          icon: 'wave'
        },
        hover_text: '감정에 몸을 맡긴다',
        weight: { E: 3, A: 1 }
      },
      {
        id: 'B',
        visual: {
          gradient: ['#4facfe', '#00f2fe'],
          animation: 'shimmer_cool',
          icon: 'compass'
        },
        hover_text: '분석하며 이해한다',
        weight: { M: 3, R: 1 }
      }
    ]
  },

  // Decision Making
  {
    id: 'gallery_choice',
    type: 'visual_choice',
    narrative: {
      ko: '두 전시실. 하나만 선택해야 한다면?',
      en: 'Two exhibitions. You must choose one.'
    },
    targetAxes: ['FC'],
    choices: [
      {
        id: 'A',
        visual: {
          gradient: ['#FA709A', '#FEE140'],
          animation: 'float',
          icon: 'star'
        },
        hover_text: '새롭고 실험적인',
        weight: { F: 3, A: 1 }
      },
      {
        id: 'B',
        visual: {
          gradient: ['#30cfd0', '#330867'],
          animation: 'rotate',
          icon: 'book'
        },
        hover_text: '고전적이고 체계적인',
        weight: { C: 3, R: 1 }
      }
    ]
  },

  // Social Context
  {
    id: 'gallery_companion',
    type: 'visual_choice',
    narrative: {
      ko: '미술관 동행. 누구와 함께?',
      en: 'Museum visit. Who joins you?'
    },
    subNarrative: {
      ko: '또는 혼자?',
      en: 'Or alone?'
    },
    targetAxes: ['LS'],
    choices: [
      {
        id: 'A',
        visual: {
          gradient: ['#f83600', '#f9d423'],
          animation: 'pulse_warm',
          icon: 'users'
        },
        hover_text: '친구들과 함께',
        weight: { S: 3, F: 1 }
      },
      {
        id: 'B',
        visual: {
          gradient: ['#0f3443', '#34e89e'],
          animation: 'shimmer_cool',
          icon: 'moon'
        },
        hover_text: '나만의 시간',
        weight: { L: 3, M: 1 }
      }
    ]
  },

  // Learning Style
  {
    id: 'artwork_understanding',
    type: 'visual_choice',
    narrative: {
      ko: '작품을 이해하는 방법. 어느 쪽?',
      en: 'Understanding art. Which way?'
    },
    targetAxes: ['AR'],
    choices: [
      {
        id: 'A',
        visual: {
          gradient: ['#ff0844', '#ffb199'],
          animation: 'float',
          icon: 'palette'
        },
        hover_text: '느낌으로 접근',
        weight: { A: 3, E: 1 }
      },
      {
        id: 'B',
        visual: {
          gradient: ['#7028e4', '#e5b2ca'],
          animation: 'rotate',
          icon: 'brain'
        },
        hover_text: '지식으로 접근',
        weight: { R: 3, C: 1 }
      }
    ]
  },

  // Time Preference
  {
    id: 'visit_timing',
    type: 'visual_choice',
    narrative: {
      ko: '방문 시간. 언제가 좋을까?',
      en: 'Visit time. When do you prefer?'
    },
    targetAxes: ['ME'],
    choices: [
      {
        id: 'A',
        visual: {
          gradient: ['#ffd89b', '#19547b'],
          animation: 'pulse_warm',
          icon: 'sun'
        },
        hover_text: '활기찬 낮',
        weight: { E: 2, S: 2 }
      },
      {
        id: 'B',
        visual: {
          gradient: ['#13547a', '#80d0c7'],
          animation: 'shimmer_cool',
          icon: 'moon'
        },
        hover_text: '고요한 저녁',
        weight: { M: 2, L: 2 }
      }
    ]
  },

  // Art Selection Process
  {
    id: 'choosing_artwork',
    type: 'visual_choice',
    narrative: {
      ko: '좋아하는 작품을 찾는 방법은?',
      en: 'Finding art you love. How?'
    },
    targetAxes: ['FC'],
    choices: [
      {
        id: 'A',
        visual: {
          gradient: ['#fc466b', '#3f5efb'],
          animation: 'float',
          icon: 'heart'
        },
        hover_text: '직관적 끌림',
        weight: { F: 3, A: 1 }
      },
      {
        id: 'B',
        visual: {
          gradient: ['#11998e', '#38ef7d'],
          animation: 'rotate',
          icon: 'compass'
        },
        hover_text: '체계적 탐색',
        weight: { C: 3, R: 1 }
      }
    ]
  },

  // Experience Priority
  {
    id: 'museum_priority',
    type: 'visual_choice',
    narrative: {
      ko: '미술관에서 가장 중요한 것은?',
      en: 'At the museum, what matters most?'
    },
    targetAxes: ['LS'],
    choices: [
      {
        id: 'A',
        visual: {
          gradient: ['#ee0979', '#ff6a00'],
          animation: 'pulse_warm',
          icon: 'users'
        },
        hover_text: '공유와 대화',
        weight: { S: 3, E: 1 }
      },
      {
        id: 'B',
        visual: {
          gradient: ['#8e2de2', '#4a00e0'],
          animation: 'shimmer_cool',
          icon: 'star'
        },
        hover_text: '개인적 몰입',
        weight: { L: 3, M: 1 }
      }
    ]
  },

  // Final Question - Integration
  {
    id: 'art_journey_end',
    type: 'visual_choice',
    narrative: {
      ko: '예술 여행의 끝. 무엇이 남을까?',
      en: 'End of art journey. What remains?'
    },
    targetAxes: ['AR'],
    choices: [
      {
        id: 'A',
        visual: {
          gradient: ['#f953c6', '#b91d73'],
          animation: 'float',
          icon: 'heart'
        },
        hover_text: '감정의 잔상',
        weight: { A: 2, E: 2 }
      },
      {
        id: 'B',
        visual: {
          gradient: ['#00b09b', '#96c93d'],
          animation: 'rotate',
          icon: 'book'
        },
        hover_text: '지식의 축적',
        weight: { R: 2, C: 2 }
      }
    ]
  }
];