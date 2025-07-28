// Animal Evolution Visual System - 기존 이미지를 활용한 진화 시각화
const { SAYU_TYPES } = require('@sayu/shared');

class AnimalEvolutionVisual {
  constructor() {
    // 기존 동물 이미지를 활용한 진화 표현 전략
    this.visualStrategy = {
      // 1. CSS 필터로 진화 단계 표현
      stageFilters: {
        1: { // 아기 - 부드럽고 파스텔톤
          filter: 'brightness(1.2) contrast(0.8) saturate(0.7)',
          opacity: 0.9,
          blur: '0.5px'
        },
        2: { // 청소년 - 밝고 생기있게
          filter: 'brightness(1.1) contrast(0.9) saturate(0.9)',
          opacity: 0.95,
          blur: '0px'
        },
        3: { // 성체 - 원본 그대로
          filter: 'none',
          opacity: 1,
          blur: '0px'
        },
        4: { // 숙련가 - 선명하고 깊이있게
          filter: 'contrast(1.1) saturate(1.1)',
          opacity: 1,
          blur: '0px'
        },
        5: { // 마스터 - 빛나고 신비롭게
          filter: 'contrast(1.2) saturate(1.2) hue-rotate(10deg)',
          opacity: 1,
          blur: '0px'
        }
      },

      // 2. 오버레이 효과로 변화 표현
      overlayEffects: {
        1: {
          gradient: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
          animation: 'pulse 3s ease-in-out infinite'
        },
        2: {
          gradient: 'radial-gradient(circle, rgba(255,220,100,0.2) 0%, transparent 70%)',
          animation: 'glow 2.5s ease-in-out infinite'
        },
        3: {
          gradient: 'radial-gradient(circle, rgba(100,200,255,0.15) 0%, transparent 70%)',
          animation: 'breathe 4s ease-in-out infinite'
        },
        4: {
          gradient: 'radial-gradient(circle, rgba(200,100,255,0.2) 0%, transparent 60%)',
          animation: 'shimmer 3s ease-in-out infinite'
        },
        5: {
          gradient: 'conic-gradient(from 0deg, rgba(255,100,200,0.3), rgba(100,200,255,0.3), rgba(255,200,100,0.3), rgba(255,100,200,0.3))',
          animation: 'rotate 10s linear infinite'
        }
      },

      // 3. 추가 장식 요소 (SVG 오버레이)
      decorations: {
        badges: {
          'first_evolution': {
            svg: '<circle cx="20" cy="20" r="15" fill="#FFD700" opacity="0.8"/><text x="20" y="25" text-anchor="middle" fill="#FFF" font-size="20">★</text>',
            position: { bottom: '10%', right: '10%' }
          },
          'taste_expansion': {
            svg: '<rect x="5" y="5" width="30" height="30" rx="5" fill="#FF6B6B" opacity="0.8"/><text x="20" y="25" text-anchor="middle" fill="#FFF" font-size="18">🎨</text>',
            position: { top: '10%', right: '10%' }
          },
          'art_connoisseur': {
            svg: '<polygon points="20,5 30,15 25,30 15,30 10,15" fill="#9B59B6" opacity="0.8"/><text x="20" y="23" text-anchor="middle" fill="#FFF" font-size="16">♦</text>',
            position: { top: '5%', left: '50%', transform: 'translateX(-50%)' }
          }
        },

        accessories: {
          'scarf': {
            svg: '<path d="M10,35 Q20,40 30,35" stroke="#E74C3C" stroke-width="3" fill="none" opacity="0.7"/>',
            position: { bottom: '30%', left: '50%', transform: 'translateX(-50%)' }
          },
          'crown': {
            svg: '<path d="M10,10 L15,5 L20,10 L25,5 L30,10 L30,15 L10,15 Z" fill="#F1C40F" opacity="0.9"/>',
            position: { top: '-5%', left: '50%', transform: 'translateX(-50%)' }
          }
        },

        auras: {
          'subtle_glow': {
            svg: '<circle cx="50" cy="50" r="45" fill="none" stroke="url(#glowGradient)" stroke-width="2" opacity="0.5"/>',
            defs: '<radialGradient id="glowGradient"><stop offset="0%" stop-color="#FFE66D"/><stop offset="100%" stop-color="#FF6B6B"/></radialGradient>'
          },
          'flowing_energy': {
            svg: '<ellipse cx="50" cy="50" rx="48" ry="45" fill="none" stroke="url(#energyGradient)" stroke-width="3" stroke-dasharray="5,5" opacity="0.6"/>',
            defs: '<linearGradient id="energyGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#4ECDC4"/><stop offset="50%" stop-color="#44A08D"/><stop offset="100%" stop-color="#556270"/></linearGradient>',
            animation: 'dash 20s linear infinite'
          }
        }
      },

      // 4. 파티클 효과 (Canvas 또는 CSS)
      particleEffects: {
        'heart_sparkles': {
          particle: '❤️',
          count: 5,
          duration: 2000,
          path: 'float-up'
        },
        'star_burst': {
          particle: '✨',
          count: 8,
          duration: 3000,
          path: 'explode'
        },
        'culture_aura': {
          particle: '🎭',
          count: 3,
          duration: 4000,
          path: 'orbit'
        }
      }
    };

    // 이미지 경로 매핑
    this.imagePaths = {
      'LAEF': '/images/personality-animals/main/1. LAEF (Fox).png',
      'LAEC': '/images/personality-animals/main/2. LAEC (Cat).png',
      'LAMF': '/images/personality-animals/main/3. LAMF (Owl).png',
      'LAMC': '/images/personality-animals/main/4. LAMC (Turtle).png',
      'LREF': '/images/personality-animals/main/5. LREF (Chameleon).png',
      'LREC': '/images/personality-animals/main/6. LREC (Hedgehog).png',
      'LRMF': '/images/personality-animals/main/7. LRMF (Octopus).png',
      'LRMC': '/images/personality-animals/main/8. LRMC (Beaver).png',
      'SAEF': '/images/personality-animals/main/9. SAEF (Butterfly).png',
      'SAEC': '/images/personality-animals/main/10. SAEC (Penguin).png',
      'SAMF': '/images/personality-animals/main/11. SAMF (Parrot).png',
      'SAMC': '/images/personality-animals/main/12. SAMC (Deer).png',
      'SREF': '/images/personality-animals/main/13. SREF (Dog).png',
      'SREC': '/images/personality-animals/main/14. SREC (Duck).png',
      'SRMF': '/images/personality-animals/main/15. SRMF (Elephant).png',
      'SRMC': '/images/personality-animals/main/16. SRMC (Eagle).png'
    };
  }

  // 동물 진화 상태를 시각적 데이터로 변환
  getVisualData(aptType, evolutionStage, achievements = []) {
    const baseImage = this.imagePaths[aptType];
    const stageFilter = this.visualStrategy.stageFilters[evolutionStage];
    const overlay = this.visualStrategy.overlayEffects[evolutionStage];

    const visualData = {
      baseImage,
      containerStyles: {
        filter: stageFilter.filter,
        opacity: stageFilter.opacity,
        transform: `scale(${0.7 + (evolutionStage * 0.075)})` // 0.7 → 1.075
      },

      overlayStyles: {
        background: overlay.gradient,
        animation: overlay.animation
      },

      decorations: [],

      cssClasses: [
        `evolution-stage-${evolutionStage}`,
        `apt-type-${aptType.toLowerCase()}`
      ]
    };

    // 업적에 따른 장식 추가
    achievements.forEach(achievement => {
      if (this.visualStrategy.decorations.badges[achievement]) {
        visualData.decorations.push({
          type: 'badge',
          data: this.visualStrategy.decorations.badges[achievement]
        });
      }
    });

    // 단계별 액세서리 추가
    if (evolutionStage >= 2 && this.visualStrategy.decorations.accessories.scarf) {
      visualData.decorations.push({
        type: 'accessory',
        data: this.visualStrategy.decorations.accessories.scarf
      });
    }

    if (evolutionStage >= 4 && this.visualStrategy.decorations.accessories.crown) {
      visualData.decorations.push({
        type: 'accessory',
        data: this.visualStrategy.decorations.accessories.crown
      });
    }

    // 오라 효과 추가 (3단계 이상)
    if (evolutionStage >= 3) {
      const auraType = evolutionStage === 3 ? 'subtle_glow' : 'flowing_energy';
      visualData.decorations.push({
        type: 'aura',
        data: this.visualStrategy.decorations.auras[auraType]
      });
    }

    return visualData;
  }

  // 진화 전환 애니메이션
  getEvolutionTransition(fromStage, toStage) {
    return {
      duration: 2000,
      steps: [
        {
          at: 0,
          filter: this.visualStrategy.stageFilters[fromStage].filter,
          scale: 0.7 + (fromStage * 0.075)
        },
        {
          at: 0.5,
          filter: 'brightness(2) contrast(1.5)',
          scale: 1.2
        },
        {
          at: 1,
          filter: this.visualStrategy.stageFilters[toStage].filter,
          scale: 0.7 + (toStage * 0.075)
        }
      ]
    };
  }

  // 특수 효과 애니메이션 데이터
  getSpecialEffect(effectType, triggerPosition) {
    const effect = this.visualStrategy.particleEffects[effectType];
    if (!effect) return null;

    return {
      particles: Array(effect.count).fill(null).map((_, i) => ({
        id: `${effectType}-${i}`,
        emoji: effect.particle,
        startPosition: this.calculateParticleStart(triggerPosition, effect.path, i),
        animation: this.getParticleAnimation(effect.path, i, effect.duration)
      }))
    };
  }

  calculateParticleStart(basePos, path, index) {
    const angle = (360 / 8) * index;
    const radius = 20;

    if (path === 'explode') {
      return {
        x: basePos.x + Math.cos(angle * Math.PI / 180) * radius,
        y: basePos.y + Math.sin(angle * Math.PI / 180) * radius
      };
    }

    return basePos;
  }

  getParticleAnimation(path, index, duration) {
    const animations = {
      'float-up': {
        keyframes: [
          { transform: 'translateY(0) scale(1)', opacity: 1 },
          { transform: 'translateY(-50px) scale(0.5)', opacity: 0 }
        ],
        options: { duration, delay: index * 200 }
      },
      'explode': {
        keyframes: [
          { transform: 'translate(0, 0) scale(0)', opacity: 1 },
          { transform: `translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) scale(1)`, opacity: 1 },
          { transform: `translate(${Math.random() * 200 - 100}px, ${Math.random() * 200 - 100}px) scale(0)`, opacity: 0 }
        ],
        options: { duration, delay: index * 100 }
      },
      'orbit': {
        keyframes: [
          { transform: 'rotate(0deg) translateX(30px) rotate(0deg)' },
          { transform: 'rotate(360deg) translateX(30px) rotate(-360deg)' }
        ],
        options: { duration: duration * 2, iterations: Infinity }
      }
    };

    return animations[path] || animations['float-up'];
  }
}

module.exports = AnimalEvolutionVisual;
