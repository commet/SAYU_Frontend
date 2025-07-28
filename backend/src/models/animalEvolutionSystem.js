// Animal Evolution System - 동물 캐릭터의 시각적 진화 시스템
const { SAYU_TYPES } = require('@sayu/shared');

class AnimalEvolutionSystem {
  constructor() {
    // 진화 단계 정의 (리소스 효율적인 5단계)
    this.evolutionStages = {
      1: {
        name: '아기',
        sizeScale: 0.7,
        features: {
          eyes: 'curious',
          posture: 'sitting',
          accessory: null,
          aura: null,
          environment: 'nest'
        },
        requiredPoints: 0
      },
      2: {
        name: '청소년',
        sizeScale: 0.85,
        features: {
          eyes: 'bright',
          posture: 'standing',
          accessory: 'scarf',
          aura: 'subtle_glow',
          environment: 'grass'
        },
        requiredPoints: 100
      },
      3: {
        name: '성체',
        sizeScale: 1.0,
        features: {
          eyes: 'confident',
          posture: 'dynamic',
          accessory: 'badge',
          aura: 'soft_particles',
          environment: 'garden'
        },
        requiredPoints: 500
      },
      4: {
        name: '숙련가',
        sizeScale: 1.0,
        features: {
          eyes: 'wise',
          posture: 'elegant',
          accessory: 'crown',
          aura: 'flowing_energy',
          environment: 'gallery'
        },
        requiredPoints: 1500
      },
      5: {
        name: '마스터',
        sizeScale: 1.0,
        features: {
          eyes: 'transcendent',
          posture: 'majestic',
          accessory: 'celestial_crown',
          aura: 'radiant_presence',
          environment: 'cosmic_gallery'
        },
        requiredPoints: 3000
      }
    };

    // 행동별 특수 효과 (임시적 변화)
    this.temporaryEffects = {
      artwork_like: {
        effect: 'heart_sparkles',
        duration: 2000,
        color: '#FF6B6B'
      },
      exhibition_visit: {
        effect: 'culture_aura',
        duration: 3000,
        color: '#4ECDC4'
      },
      milestone_achieved: {
        effect: 'star_burst',
        duration: 5000,
        color: '#FFE66D'
      },
      taste_expansion: {
        effect: 'rainbow_shimmer',
        duration: 4000,
        color: null // 다채로운 색상
      }
    };

    // APT별 색상 팔레트 (동물의 기본 색상)
    this.aptColorPalettes = {
      // L (혼자) 계열 - 차분한 색상
      'L': {
        primary: '#6C5CE7',
        secondary: '#A29BFE',
        accent: '#74B9FF'
      },
      // S (함께) 계열 - 따뜻한 색상
      'S': {
        primary: '#FD79A8',
        secondary: '#FDCB6E',
        accent: '#E17055'
      },
      // A (추상) 추가 색상
      'A': {
        glow: '#BB6BD9',
        shimmer: '#9B59B6'
      },
      // R (구상) 추가 색상
      'R': {
        glow: '#3498DB',
        shimmer: '#2980B9'
      }
    };

    // 취향 변화에 따른 패턴/무늬
    this.tastePatterns = {
      classical: 'dots',
      modern: 'stripes',
      abstract: 'swirls',
      diverse: 'mosaic'
    };
  }

  // ==================== 동물 상태 계산 ====================

  getAnimalState(userProfile) {
    const evolutionPoints = userProfile.evolutionPoints || 0;
    const stage = this.getEvolutionStage(evolutionPoints);
    const stageProgress = this.getStageProgress(evolutionPoints, stage);

    // 기본 상태
    const state = {
      animalType: userProfile.aptType,
      animalEmoji: SAYU_TYPES[userProfile.aptType].emoji,
      animalName: SAYU_TYPES[userProfile.aptType].animal,
      stage,
      stageData: this.evolutionStages[stage],
      progress: stageProgress,

      // 시각적 속성
      visual: {
        size: this.evolutionStages[stage].sizeScale,
        baseColor: this.getAnimalBaseColor(userProfile.aptType),
        patternType: this.getTastePattern(userProfile),
        patternOpacity: this.getPatternIntensity(userProfile),
        features: this.evolutionStages[stage].features,
        specialEffects: []
      },

      // 애니메이션 상태
      animation: {
        idle: this.getIdleAnimation(stage),
        interaction: null,
        mood: this.getAnimalMood(userProfile)
      },

      // 업적 표시
      achievements: {
        badges: this.getVisibleBadges(userProfile),
        titles: this.getEarnedTitles(userProfile)
      }
    };

    // 최근 행동에 따른 임시 효과 추가
    this.addRecentActionEffects(state, userProfile.recentActions);

    return state;
  }

  getEvolutionStage(points) {
    let stage = 1;
    for (const [level, data] of Object.entries(this.evolutionStages)) {
      if (points >= data.requiredPoints) {
        stage = parseInt(level);
      }
    }
    return stage;
  }

  getStageProgress(points, currentStage) {
    const current = this.evolutionStages[currentStage];
    const next = this.evolutionStages[currentStage + 1];

    if (!next) return 100; // 최고 단계

    const stagePoints = points - current.requiredPoints;
    const stageTotal = next.requiredPoints - current.requiredPoints;

    return Math.round((stagePoints / stageTotal) * 100);
  }

  // ==================== 시각적 요소 계산 ====================

  getAnimalBaseColor(aptType) {
    // APT의 첫 글자에 따른 기본 색상
    const baseColors = this.aptColorPalettes[aptType[0]];

    // 두 번째 글자에 따른 색상 조정
    const glowColor = this.aptColorPalettes[aptType[1]]?.glow;

    return {
      primary: baseColors.primary,
      secondary: baseColors.secondary,
      accent: baseColors.accent,
      glow: glowColor || baseColors.accent
    };
  }

  getTastePattern(userProfile) {
    // 사용자의 취향 다양성에 따른 패턴 결정
    const diversityScore = userProfile.tasteDiversity || 0;

    if (diversityScore < 0.3) return 'dots';
    if (diversityScore < 0.5) return 'stripes';
    if (diversityScore < 0.7) return 'swirls';
    return 'mosaic';
  }

  getPatternIntensity(userProfile) {
    // 취향의 강도에 따른 패턴 투명도
    const consistency = userProfile.consistencyScore || 0.5;
    return 0.2 + (consistency * 0.6); // 20% ~ 80%
  }

  getIdleAnimation(stage) {
    // 단계별 기본 애니메이션
    const animations = {
      1: 'gentle_bounce', // 아기: 통통 튀기
      2: 'sway',         // 청소년: 좌우 흔들기
      3: 'breathe',      // 성체: 숨쉬기
      4: 'float',        // 숙련가: 우아하게 떠있기
      5: 'glow_pulse'    // 마스터: 빛나며 맥동
    };

    return animations[stage] || 'breathe';
  }

  getAnimalMood(userProfile) {
    // 최근 활동에 따른 기분 상태
    const recentPoints = userProfile.weeklyPoints || 0;

    if (recentPoints > 100) return 'excited';
    if (recentPoints > 50) return 'happy';
    if (recentPoints > 10) return 'content';
    if (recentPoints > 0) return 'curious';
    return 'sleepy';
  }

  // ==================== 특수 효과 ====================

  addRecentActionEffects(state, recentActions = []) {
    if (!recentActions || recentActions.length === 0) return;

    const now = Date.now();

    recentActions.forEach(action => {
      const actionTime = new Date(action.timestamp).getTime();
      const timeSince = now - actionTime;

      const effect = this.temporaryEffects[action.type];
      if (effect && timeSince < effect.duration) {
        state.visual.specialEffects.push({
          type: effect.effect,
          opacity: 1 - (timeSince / effect.duration),
          color: effect.color
        });
      }
    });
  }

  // ==================== 업적 시각화 ====================

  getVisibleBadges(userProfile) {
    const badges = [];
    const milestones = userProfile.milestones || [];

    // 주요 마일스톤 뱃지 (최대 3개 표시)
    const badgeMap = {
      'first_evolution': { icon: '🌱', position: 'left' },
      'taste_expansion': { icon: '🎨', position: 'right' },
      'art_connoisseur': { icon: '👑', position: 'top' },
      'taste_master': { icon: '✨', position: 'center' }
    };

    milestones.forEach(milestone => {
      if (badgeMap[milestone] && badges.length < 3) {
        badges.push(badgeMap[milestone]);
      }
    });

    return badges;
  }

  getEarnedTitles(userProfile) {
    const stage = this.getEvolutionStage(userProfile.evolutionPoints || 0);
    const aptData = SAYU_TYPES[userProfile.aptType];

    return {
      stage: this.evolutionStages[stage].name,
      apt: aptData.name,
      special: this.getSpecialTitle(userProfile)
    };
  }

  getSpecialTitle(userProfile) {
    // 특별한 업적에 따른 칭호
    if (userProfile.exhibitionCount > 50) return '전시 마스터';
    if (userProfile.tasteDiversity > 0.8) return '만능 감상가';
    if (userProfile.consistencyScore > 0.9) return '일관된 탐구자';
    return null;
  }

  // ==================== 진화 애니메이션 ====================

  getEvolutionAnimation(oldStage, newStage) {
    return {
      type: 'stage_up',
      duration: 3000,
      effects: [
        {
          phase: 'charge',
          duration: 1000,
          effect: 'energy_gather'
        },
        {
          phase: 'transform',
          duration: 1500,
          effect: 'light_burst'
        },
        {
          phase: 'reveal',
          duration: 500,
          effect: 'sparkle_rain'
        }
      ],
      sounds: ['charge.mp3', 'transform.mp3', 'complete.mp3']
    };
  }

  // ==================== 효율적 렌더링을 위한 데이터 ====================

  getOptimizedRenderData(animalState) {
    // SVG 레이어 기반 렌더링을 위한 최적화된 데이터
    return {
      // 기본 레이어 (변하지 않는 부분)
      base: {
        type: animalState.animalType,
        emoji: animalState.animalEmoji,
        scale: animalState.visual.size
      },

      // 색상 레이어 (CSS 변수로 제어)
      colors: {
        '--primary': animalState.visual.baseColor.primary,
        '--secondary': animalState.visual.baseColor.secondary,
        '--accent': animalState.visual.baseColor.accent,
        '--glow': animalState.visual.baseColor.glow
      },

      // 패턴 레이어
      pattern: {
        type: animalState.visual.patternType,
        opacity: animalState.visual.patternOpacity
      },

      // 애니메이션 클래스
      animations: [
        `idle-${animalState.animation.idle}`,
        `mood-${animalState.animation.mood}`,
        animalState.stage > 3 ? 'has-aura' : ''
      ].filter(Boolean),

      // 액세서리와 효과
      accessories: animalState.visual.features.accessory,
      effects: animalState.visual.specialEffects,

      // 배경 환경
      environment: animalState.visual.features.environment
    };
  }

  // ==================== 저장용 간소화 데이터 ====================

  getCompactState(fullState) {
    // DB 저장용 최소 데이터
    return {
      s: fullState.stage,  // stage
      p: fullState.progress, // progress
      m: fullState.animation.mood, // mood
      e: fullState.visual.specialEffects.map(e => e.type) // effects
    };
  }

  expandCompactState(compact, aptType) {
    // 압축된 상태에서 전체 상태 복원
    return {
      stage: compact.s,
      progress: compact.p
      // ... 나머지는 aptType과 stage로부터 재생성
    };
  }
}

module.exports = AnimalEvolutionSystem;
