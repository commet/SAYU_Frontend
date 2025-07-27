// Artist APT Inference Engine - 제한된 정보로부터 감상 경험을 추론하는 고급 추론 엔진

class ArtistAPTInferenceEngine {
  constructor() {
    // 추론 규칙 세트
    this.inferenceRules = {
      // 1. 시대/운동 → 감상 경험
      eraToExperience: {
        'Renaissance': {
          viewingModes: ['analytical', 'contemplative'],
          cognitiveLoad: 'high',
          emotionalTone: 'balanced',
          socialContext: 'educational',
          primaryAPT: ['LRMC', 'SRMC', 'LREC'],
          reasoning: '르네상스: 정밀한 기법과 인문주의적 의미 → 체계적 분석과 교육적 가치'
        },
        'Impressionism': {
          viewingModes: ['sensory', 'emotional'],
          cognitiveLoad: 'medium',
          emotionalTone: 'peaceful',
          socialContext: 'personal',
          primaryAPT: ['LREF', 'LAEF', 'SREF'],
          reasoning: '인상주의: 빛과 순간의 포착 → 감각적 몰입과 정서적 공감'
        },
        'Abstract Expressionism': {
          viewingModes: ['emotional', 'somatic'],
          cognitiveLoad: 'low',
          emotionalTone: 'intense',
          socialContext: 'individual',
          primaryAPT: ['LAEF', 'LAMF', 'SAEF'],
          reasoning: '추상표현주의: 감정의 직접적 표출 → 즉각적 감정 반응과 신체적 경험'
        },
        'Cubism': {
          viewingModes: ['analytical', 'exploratory'],
          cognitiveLoad: 'very_high',
          emotionalTone: 'intellectual',
          socialContext: 'discourse',
          primaryAPT: ['LAMF', 'SAMF', 'LAMC'],
          reasoning: '입체주의: 형태의 해체와 재구성 → 지적 도전과 새로운 시각'
        },
        'Surrealism': {
          viewingModes: ['psychological', 'imaginative'],
          cognitiveLoad: 'medium',
          emotionalTone: 'uncanny',
          socialContext: 'introspective',
          primaryAPT: ['LAMF', 'LAEF', 'SAMF'],
          reasoning: '초현실주의: 무의식과 꿈의 표현 → 심리적 탐구와 상상력 자극'
        },
        'Pop Art': {
          viewingModes: ['ironic', 'cultural'],
          cognitiveLoad: 'low',
          emotionalTone: 'playful',
          socialContext: 'social',
          primaryAPT: ['SAMC', 'SREF', 'SAMF'],
          reasoning: '팝아트: 대중문화의 재맥락화 → 문화적 대화와 아이러니한 즐거움'
        },
        'Baroque': {
          viewingModes: ['dramatic', 'immersive'],
          cognitiveLoad: 'medium',
          emotionalTone: 'theatrical',
          socialContext: 'collective',
          primaryAPT: ['SREC', 'SAEC', 'SREF'],
          reasoning: '바로크: 극적인 빛과 감정 → 드라마틱한 몰입과 집단적 경험'
        },
        'Minimalism': {
          viewingModes: ['meditative', 'phenomenological'],
          cognitiveLoad: 'low',
          emotionalTone: 'neutral',
          socialContext: 'personal',
          primaryAPT: ['LAMC', 'LRMC', 'LAMF'],
          reasoning: '미니멀리즘: 본질로의 환원 → 명상적 관조와 현상학적 경험'
        },
        'Contemporary': {
          viewingModes: ['participatory', 'critical'],
          cognitiveLoad: 'variable',
          emotionalTone: 'challenging',
          socialContext: 'interactive',
          primaryAPT: ['SAMF', 'SAMC', 'SAEF'],
          reasoning: '현대미술: 관객 참여와 비평적 사고 → 능동적 참여와 사회적 성찰'
        }
      },

      // 2. 국적/문화권 → 감상 맥락
      nationalityToContext: {
        'American': {
          themes: ['individualism', 'innovation', 'pop culture'],
          approachability: 'high',
          culturalCodes: 'explicit',
          additionalAPT: ['S', 'F'] // 사회적, 자유로운 경향
        },
        'French': {
          themes: ['sophistication', 'philosophy', 'aesthetics'],
          approachability: 'medium',
          culturalCodes: 'layered',
          additionalAPT: ['M', 'C'] // 의미 중심, 체계적 경향
        },
        'Japanese': {
          themes: ['minimalism', 'nature', 'spirituality'],
          approachability: 'medium',
          culturalCodes: 'subtle',
          additionalAPT: ['L', 'E'] // 개인적, 감성적 경향
        },
        'German': {
          themes: ['philosophy', 'expression', 'structure'],
          approachability: 'low',
          culturalCodes: 'complex',
          additionalAPT: ['M', 'C'] // 의미 중심, 체계적 경향
        },
        'Italian': {
          themes: ['beauty', 'tradition', 'emotion'],
          approachability: 'high',
          culturalCodes: 'direct',
          additionalAPT: ['E', 'C'] // 감정적, 전통적 경향
        },
        'Spanish': {
          themes: ['passion', 'drama', 'tradition'],
          approachability: 'high',
          culturalCodes: 'expressive',
          additionalAPT: ['E', 'F'] // 감정적, 자유로운 경향
        },
        'Dutch': {
          themes: ['observation', 'daily life', 'light'],
          approachability: 'high',
          culturalCodes: 'precise',
          additionalAPT: ['R', 'C'] // 구상적, 체계적 경향
        },
        'Russian': {
          themes: ['soul', 'suffering', 'spirituality'],
          approachability: 'low',
          culturalCodes: 'symbolic',
          additionalAPT: ['L', 'E'] // 개인적, 감정적 경향
        }
      },

      // 3. 생애 패턴 → 작품 특성
      lifePatternToWork: {
        'short_tragic': { // 짧고 비극적 (고흐, 모딜리아니)
          intensity: 'extreme',
          authenticity: 'raw',
          viewingExperience: 'empathetic',
          emotionalResonance: 'deep',
          primaryAPT: ['LAEF', 'LAEC']
        },
        'long_evolving': { // 길고 변화무쌍 (피카소, 모네)
          intensity: 'variable',
          authenticity: 'experimental',
          viewingExperience: 'exploratory',
          emotionalResonance: 'diverse',
          primaryAPT: ['SAMF', 'LAMF']
        },
        'reclusive': { // 은둔형 (세잔, 모란디)
          intensity: 'sustained',
          authenticity: 'meditative',
          viewingExperience: 'contemplative',
          emotionalResonance: 'quiet',
          primaryAPT: ['LREC', 'LAEC']
        },
        'social_activist': { // 사회 활동가형 (워홀, 키스 해링)
          intensity: 'communicative',
          authenticity: 'strategic',
          viewingExperience: 'engaging',
          emotionalResonance: 'collective',
          primaryAPT: ['SAMC', 'SAMF']
        }
      },

      // 4. 매체/기법 → 감각 경험
      mediumToSensory: {
        'oil': {
          texture: 'rich',
          temporality: 'slow',
          presence: 'substantial',
          viewingDistance: 'variable',
          favoredAPT: ['C'] // 체계적 감상 선호
        },
        'watercolor': {
          texture: 'transparent',
          temporality: 'immediate',
          presence: 'delicate',
          viewingDistance: 'intimate',
          favoredAPT: ['E', 'F'] // 감성적, 자유로운 감상
        },
        'sculpture': {
          texture: 'tactile',
          temporality: 'eternal',
          presence: 'physical',
          viewingDistance: 'circular',
          favoredAPT: ['R', 'S'] // 구상적, 사회적 감상
        },
        'print': {
          texture: 'graphic',
          temporality: 'reproducible',
          presence: 'democratic',
          viewingDistance: 'close',
          favoredAPT: ['M', 'S'] // 의미 중심, 사회적 감상
        },
        'mixed media': {
          texture: 'complex',
          temporality: 'layered',
          presence: 'experimental',
          viewingDistance: 'investigative',
          favoredAPT: ['A', 'F'] // 추상적, 자유로운 감상
        }
      },

      // 5. 작품 수량 → 감상 깊이
      productivityToDepth: {
        'prolific': { // 다작 (피카소: 5만점+)
          selectionStrategy: 'curated',
          viewingPace: 'selective',
          discoveryPotential: 'high',
          intimacyLevel: 'varied'
        },
        'limited': { // 소수 (베르메르: 34점)
          selectionStrategy: 'comprehensive',
          viewingPace: 'thorough',
          discoveryPotential: 'deep',
          intimacyLevel: 'intense'
        },
        'moderate': { // 중간
          selectionStrategy: 'thematic',
          viewingPace: 'balanced',
          discoveryPotential: 'steady',
          intimacyLevel: 'consistent'
        }
      }
    };

    // 복합 추론을 위한 가중치 (총 100%)
    this.weights = {
      // 핵심 지표 (70%)
      era: 0.35,           // 시대/예술사조 - 감상 모드의 근본 결정
      lifePattern: 0.20,   // 생애 패턴 - 작품의 정서적 톤과 강도
      medium: 0.15,        // 매체/기법 - 물리적 감상 경험
      
      // 보조 지표 (30%)
      biography: 0.15,     // 전기 내용 - 키워드 기반 성향 추출
      nationality: 0.10,   // 국적 - 문화적 맥락 참고
      productivity: 0.05   // 생산성 - 감상 전략 참고
    };
    
    // 전기 텍스트 분석을 위한 확장된 키워드
    this.biographyKeywords = {
      // L/S 축 (혼자 vs 함께)
      L: [
        // 직접적 표현
        'solitary', 'isolated', 'reclusive', 'hermit', 'alone', 'private', 'withdrawn',
        'individual', 'independent', 'introspective', 'contemplative', 'meditative',
        // 생활 패턴
        'studio', 'retreat', 'seclusion', 'privacy', 'quiet', 'personal space',
        'worked alone', 'rarely exhibited', 'avoided', 'shy', 'introverted',
        // 은유적 표현
        'inner world', 'self-taught', 'outsider', 'loner', 'solitude', 'isolation'
      ],
      S: [
        // 직접적 표현
        'collaborative', 'group', 'collective', 'social', 'community', 'workshop', 'school',
        'together', 'partnership', 'cooperation', 'team', 'society', 'public',
        // 활동 관련
        'founded', 'organized', 'taught', 'mentor', 'students', 'followers',
        'exhibition', 'salon', 'gathering', 'meeting', 'party', 'café',
        // 소속/관계
        'member', 'association', 'movement', 'circle', 'network', 'friends',
        'colleague', 'collaborator', 'assistant', 'studio assistant', 'workshop'
      ],
      
      // A/R 축 (추상 vs 구상)
      A: [
        // 스타일 용어
        'abstract', 'non-figurative', 'experimental', 'avant-garde', 'conceptual',
        'abstraction', 'non-representational', 'geometric', 'expressionist', 'minimalist',
        // 기법/접근
        'distorted', 'simplified', 'reduced', 'essence', 'form', 'color field',
        'gestural', 'automatic', 'subconscious', 'spiritual', 'pure', 'absolute',
        // 움직임/학파
        'cubism', 'suprematism', 'constructivism', 'abstract expressionism',
        'color theory', 'composition', 'rhythm', 'harmony', 'dynamic', 'energy'
      ],
      R: [
        // 스타일 용어
        'realistic', 'naturalistic', 'figurative', 'portrait', 'landscape', 'still life',
        'realism', 'representation', 'lifelike', 'accurate', 'detailed', 'precise',
        // 주제
        'figure', 'human', 'nature', 'scenery', 'cityscape', 'seascape',
        'animal', 'botanical', 'architectural', 'genre painting', 'historical',
        // 기법
        'observation', 'study from life', 'plein air', 'photorealistic', 'illusionistic',
        'perspective', 'anatomy', 'proportion', 'likeness', 'resemblance'
      ],
      
      // E/M 축 (감정 vs 의미)
      E: [
        // 감정 표현
        'emotional', 'passionate', 'expressive', 'intuitive', 'spontaneous', 'feeling',
        'sensual', 'romantic', 'dramatic', 'intense', 'vibrant', 'energetic',
        // 프로세스
        'impulsive', 'instinctive', 'immediate', 'direct', 'raw', 'visceral',
        'personal', 'intimate', 'subjective', 'psychological', 'inner', 'soul',
        // 영향/효과
        'moving', 'touching', 'powerful', 'evocative', 'atmospheric', 'mood',
        'sensation', 'experience', 'lived', 'felt', 'suffered', 'joy'
      ],
      M: [
        // 지적 접근
        'intellectual', 'theoretical', 'philosophical', 'conceptual', 'analytical', 'critical',
        'rational', 'logical', 'systematic', 'methodical', 'calculated', 'planned',
        // 주제/내용
        'political', 'social commentary', 'allegory', 'symbolism', 'metaphor', 'narrative',
        'discourse', 'critique', 'statement', 'message', 'meaning', 'significance',
        // 참조/연구
        'research', 'study', 'reference', 'quotation', 'appropriation', 'context',
        'history', 'culture', 'society', 'philosophy', 'theory', 'idea'
      ],
      
      // F/C 축 (자유 vs 체계)
      F: [
        // 혁신성
        'experimental', 'innovative', 'revolutionary', 'radical', 'unconventional', 'bold',
        'pioneering', 'groundbreaking', 'original', 'unique', 'unprecedented', 'new',
        // 프로세스
        'spontaneous', 'improvised', 'chance', 'random', 'accidental', 'discovered',
        'breaking rules', 'challenging', 'provocative', 'controversial', 'shocking',
        // 태도
        'rebellious', 'nonconformist', 'independent', 'free', 'unrestrained', 'wild',
        'adventurous', 'risk-taking', 'boundary-pushing', 'transgressive', 'subversive'
      ],
      C: [
        // 전통성
        'traditional', 'classical', 'academic', 'meticulous', 'systematic', 'disciplined',
        'conventional', 'established', 'orthodox', 'formal', 'rigorous', 'precise',
        // 기법/훈련
        'trained', 'studied', 'apprentice', 'master', 'technique', 'craft',
        'skill', 'expertise', 'proficiency', 'excellence', 'perfection', 'mastery',
        // 프로세스
        'methodical', 'careful', 'deliberate', 'planned', 'structured', 'organized',
        'consistent', 'refined', 'polished', 'finished', 'complete', 'accomplished'
      ]
    };
  }

  // 메인 추론 함수
  inferAPTFromLimitedData(artistData) {
    const inference = {
      primaryAPT: [],
      secondaryAPT: [],
      tertiaryAPT: [],
      confidence: 0,
      reasoning: [],
      viewingExperience: {},
      axisScores: { L_S: 0, A_R: 0, E_M: 0, F_C: 0 }
    };

    // 1. 시대 기반 추론 (35%)
    if (artistData.era) {
      const eraInference = this.inferFromEra(artistData.era);
      if (eraInference) {
        inference.primaryAPT.push(...eraInference.primaryAPT);
        inference.reasoning.push(eraInference.reasoning);
        inference.viewingExperience = { ...eraInference };
        inference.confidence += 35;
      }
    }

    // 2. 생애 패턴 추론 (20%)
    const lifePattern = this.inferLifePattern(artistData);
    if (lifePattern) {
      const lifeInference = this.inferFromLifePattern(lifePattern);
      this.mergeInferences(inference, lifeInference);
      inference.confidence += 20;
    }

    // 3. 매체 추론 (15%)
    if (artistData.medium) {
      const mediumInference = this.inferFromMedium(artistData.medium);
      if (mediumInference) {
        this.adjustAPTByMedium(inference, mediumInference);
        inference.confidence += 15;
      }
    }

    // 4. 전기 텍스트 키워드 분석 (15%)
    if (artistData.bio) {
      const bioInference = this.analyzebiographyKeywords(artistData.bio);
      this.mergeInferences(inference, bioInference);
      inference.confidence += 15;
    }

    // 5. 국적 기반 추론 (10%)
    if (artistData.nationality) {
      const nationalityInference = this.inferFromNationality(artistData.nationality);
      if (nationalityInference) {
        this.adjustAPTByContext(inference, nationalityInference);
        inference.confidence += 10;
      }
    }

    // 6. 생산성 추론 (5%)
    if (artistData.productivity_estimate) {
      const productivityInference = this.inferFromProductivity(artistData.productivity_estimate);
      if (productivityInference) {
        inference.viewingExperience.productivityInsight = productivityInference;
        inference.confidence += 5;
      }
    }

    // 7. 이름만으로도 추론 (유명 작가의 경우)
    const nameInference = this.inferFromName(artistData.name);
    if (nameInference) {
      this.mergeInferences(inference, nameInference);
      inference.confidence += 10;
    }

    // 8. 복합 추론 및 정제
    this.refineInference(inference);

    return inference;
  }

  // 시대로부터 추론
  inferFromEra(era) {
    // 직접 매칭
    if (this.inferenceRules.eraToExperience[era]) {
      return this.inferenceRules.eraToExperience[era];
    }

    // 유사 시대 찾기
    const eraKeywords = {
      'Modern': ['Modern', 'Modernism', 'Modernist'],
      'Contemporary': ['Contemporary', 'Living', 'Present'],
      'Renaissance': ['Renaissance', 'Quattrocento', 'Cinquecento'],
      'Impressionism': ['Impressionism', 'Post-Impressionism', 'Neo-Impressionism'],
      'Baroque': ['Baroque', 'Rococo']
    };

    for (const [key, keywords] of Object.entries(eraKeywords)) {
      if (keywords.some(kw => era.includes(kw))) {
        return this.inferenceRules.eraToExperience[key];
      }
    }

    return null;
  }

  // 생애 패턴 추론
  inferLifePattern(artistData) {
    if (!artistData.birth_year) return null;

    const lifespan = artistData.death_year 
      ? artistData.death_year - artistData.birth_year 
      : new Date().getFullYear() - artistData.birth_year;

    // 짧고 비극적
    if (lifespan < 40 && artistData.death_year) {
      return 'short_tragic';
    }

    // 길고 변화무쌍
    if (lifespan > 70) {
      return 'long_evolving';
    }

    // bio에서 패턴 찾기
    if (artistData.bio) {
      const bioLower = artistData.bio.toLowerCase();
      if (bioLower.includes('reclusive') || bioLower.includes('isolated')) {
        return 'reclusive';
      }
      if (bioLower.includes('activist') || bioLower.includes('political')) {
        return 'social_activist';
      }
    }

    return null;
  }

  // 이름 기반 추론 (유명 작가)
  inferFromName(name) {
    const famousArtists = {
      'Vincent van Gogh': {
        primaryAPT: ['LAEF', 'LREF', 'LAMF'],
        viewingExperience: {
          emotionalTone: 'intense',
          viewingModes: ['emotional', 'empathetic']
        }
      },
      'Pablo Picasso': {
        primaryAPT: ['SAMF', 'LAMF', 'SAMC'],
        viewingExperience: {
          cognitiveLoad: 'high',
          viewingModes: ['analytical', 'exploratory']
        }
      },
      'Claude Monet': {
        primaryAPT: ['LREF', 'LAEF', 'SREF'],
        viewingExperience: {
          emotionalTone: 'peaceful',
          viewingModes: ['sensory', 'meditative']
        }
      },
      'Andy Warhol': {
        primaryAPT: ['SAMC', 'SAMF', 'SREF'],
        viewingExperience: {
          socialContext: 'cultural',
          viewingModes: ['ironic', 'cultural']
        }
      },
      'Frida Kahlo': {
        primaryAPT: ['LAEC', 'LAEF', 'SAEF'],
        viewingExperience: {
          emotionalTone: 'personal',
          viewingModes: ['empathetic', 'symbolic']
        }
      }
    };

    // 완전 일치
    if (famousArtists[name]) {
      return famousArtists[name];
    }

    // 부분 일치
    for (const [artistName, data] of Object.entries(famousArtists)) {
      if (name.includes(artistName.split(' ').pop())) { // 성만 일치
        return { ...data, confidence: 0.7 };
      }
    }

    return null;
  }

  // 추론 정제 및 중복 제거
  refineInference(inference) {
    // APT 중복 제거 및 빈도 기반 정렬
    const aptFrequency = {};
    inference.primaryAPT.forEach(apt => {
      aptFrequency[apt] = (aptFrequency[apt] || 0) + 1;
    });

    // 빈도순 정렬
    const sortedAPT = Object.entries(aptFrequency)
      .sort(([,a], [,b]) => b - a)
      .map(([apt,]) => apt);

    // 상위 3개를 primary로
    inference.primaryAPT = sortedAPT.slice(0, 3);
    
    // 다음 3개를 secondary로
    inference.secondaryAPT = sortedAPT.slice(3, 6);
    
    // 신뢰도 조정
    inference.confidence = Math.min(95, inference.confidence);
  }

  // 컨텍스트별 APT 조정
  adjustAPTByContext(inference, contextData) {
    if (contextData.additionalAPT) {
      contextData.additionalAPT.forEach(trait => {
        // 기존 APT에 특성 추가
        inference.primaryAPT = inference.primaryAPT.map(apt => {
          if (trait === 'S' && apt[0] === 'L') {
            inference.secondaryAPT.push(apt.replace('L', 'S'));
          }
          return apt;
        });
      });
    }
  }

  // 추론 병합
  mergeInferences(target, source) {
    if (source.primaryAPT) {
      target.primaryAPT.push(...source.primaryAPT);
    }
    if (source.viewingExperience) {
      target.viewingExperience = {
        ...target.viewingExperience,
        ...source.viewingExperience
      };
    }
    if (source.reasoning) {
      target.reasoning.push(source.reasoning);
    }
    if (source.axisScores) {
      Object.keys(source.axisScores).forEach(axis => {
        target.axisScores[axis] += source.axisScores[axis];
      });
    }
  }

  // 전기 텍스트 키워드 분석
  analyzebiographyKeywords(bio) {
    const bioLower = bio.toLowerCase();
    const axisScores = { L_S: 0, A_R: 0, E_M: 0, F_C: 0 };
    const foundKeywords = { L: [], S: [], A: [], R: [], E: [], M: [], F: [], C: [] };
    
    // 각 축의 키워드 검색 및 점수 계산
    for (const [axis, keywords] of Object.entries(this.biographyKeywords)) {
      keywords.forEach(keyword => {
        // 단어 경계를 고려한 검색
        const regex = new RegExp(`\\b${keyword}\\b`, 'i');
        if (regex.test(bioLower)) {
          foundKeywords[axis].push(keyword);
          
          // 축별 점수 조정
          switch(axis) {
            case 'L': axisScores.L_S -= 15; break;
            case 'S': axisScores.L_S += 15; break;
            case 'A': axisScores.A_R -= 15; break;
            case 'R': axisScores.A_R += 15; break;
            case 'E': axisScores.E_M -= 15; break;
            case 'M': axisScores.E_M += 15; break;
            case 'F': axisScores.F_C -= 15; break;
            case 'C': axisScores.F_C += 15; break;
          }
        }
      });
    }
    
    // 점수 정규화
    Object.keys(axisScores).forEach(axis => {
      axisScores[axis] = Math.max(-100, Math.min(100, axisScores[axis]));
    });
    
    // APT 유형 추론
    const aptCode = this.determineAPTFromScores(axisScores);
    
    return {
      primaryAPT: [aptCode],
      axisScores,
      reasoning: `전기 키워드 분석: ${this.summarizeKeywords(foundKeywords)}`,
      viewingExperience: {
        biographicalInsight: this.interpretKeywordFindings(foundKeywords)
      }
    };
  }

  // 축 점수로부터 APT 결정
  determineAPTFromScores(axisScores) {
    let aptCode = '';
    aptCode += axisScores.L_S < 0 ? 'L' : 'S';
    aptCode += axisScores.A_R < 0 ? 'A' : 'R';
    aptCode += axisScores.E_M < 0 ? 'E' : 'M';
    aptCode += axisScores.F_C < 0 ? 'F' : 'C';
    return aptCode;
  }

  // 키워드 요약
  summarizeKeywords(foundKeywords) {
    const summary = [];
    if (foundKeywords.L.length > foundKeywords.S.length) {
      summary.push(`독립적(${foundKeywords.L.slice(0, 3).join(', ')})`);
    } else if (foundKeywords.S.length > 0) {
      summary.push(`사회적(${foundKeywords.S.slice(0, 3).join(', ')})`);
    }
    
    if (foundKeywords.A.length > foundKeywords.R.length) {
      summary.push(`추상적(${foundKeywords.A.slice(0, 3).join(', ')})`);
    } else if (foundKeywords.R.length > 0) {
      summary.push(`구상적(${foundKeywords.R.slice(0, 3).join(', ')})`);
    }
    
    if (foundKeywords.E.length > foundKeywords.M.length) {
      summary.push(`감성적(${foundKeywords.E.slice(0, 3).join(', ')})`);
    } else if (foundKeywords.M.length > 0) {
      summary.push(`의미중심(${foundKeywords.M.slice(0, 3).join(', ')})`);
    }
    
    if (foundKeywords.F.length > foundKeywords.C.length) {
      summary.push(`자유로운(${foundKeywords.F.slice(0, 3).join(', ')})`);
    } else if (foundKeywords.C.length > 0) {
      summary.push(`체계적(${foundKeywords.C.slice(0, 3).join(', ')})`);
    }
    
    return summary.join(', ');
  }

  // 키워드 발견 해석
  interpretKeywordFindings(foundKeywords) {
    const dominantTraits = [];
    
    // 가장 많이 발견된 특성 파악
    const counts = {};
    Object.entries(foundKeywords).forEach(([key, keywords]) => {
      if (keywords.length > 0) {
        counts[key] = keywords.length;
      }
    });
    
    // 상위 특성 추출
    const sorted = Object.entries(counts).sort(([,a], [,b]) => b - a);
    sorted.slice(0, 3).forEach(([trait, count]) => {
      const traitMap = {
        L: '독립적 작업 성향',
        S: '사회적 교류 성향',
        A: '추상적 표현 추구',
        R: '구상적 묘사 중시',
        E: '감정적 표현 우선',
        M: '의미와 개념 탐구',
        F: '자유로운 실험 정신',
        C: '체계적 접근 방식'
      };
      dominantTraits.push(traitMap[trait]);
    });
    
    return dominantTraits.join(', ');
  }

  // 매체로부터 추론
  inferFromMedium(medium) {
    if (!medium) return null;
    
    const mediumLower = medium.toLowerCase();
    
    // 매체별 매칭
    for (const [key, data] of Object.entries(this.inferenceRules.mediumToSensory)) {
      if (mediumLower.includes(key)) {
        return data;
      }
    }
    
    // 추가 매체 매칭
    if (mediumLower.includes('digital') || mediumLower.includes('video')) {
      return {
        texture: 'virtual',
        temporality: 'dynamic',
        presence: 'immersive',
        viewingDistance: 'variable',
        favoredAPT: ['A', 'F']
      };
    }
    
    if (mediumLower.includes('installation')) {
      return {
        texture: 'environmental',
        temporality: 'experiential',
        presence: 'participatory',
        viewingDistance: 'immersive',
        favoredAPT: ['S', 'F']
      };
    }
    
    return null;
  }

  // 매체별 APT 조정
  adjustAPTByMedium(inference, mediumData) {
    if (mediumData.favoredAPT) {
      mediumData.favoredAPT.forEach(trait => {
        // 해당 특성을 가진 APT 유형 추가
        const matchingAPTs = this.findAPTsWithTrait(trait);
        inference.primaryAPT.push(...matchingAPTs);
      });
    }
    
    if (mediumData.viewingDistance) {
      inference.viewingExperience.physicalEngagement = mediumData.viewingDistance;
    }
  }

  // 특정 특성을 가진 APT 찾기
  findAPTsWithTrait(trait) {
    const aptTypes = [];
    const allTypes = ['LAEF', 'LAEC', 'LAMF', 'LAMC', 'LREF', 'LREC', 'LRMF', 'LRMC',
                      'SAEF', 'SAEC', 'SAMF', 'SAMC', 'SREF', 'SREC', 'SRMF', 'SRMC'];
    
    allTypes.forEach(type => {
      if (type.includes(trait)) {
        aptTypes.push(type);
      }
    });
    
    return aptTypes.slice(0, 2); // 상위 2개만 반환
  }

  // 생산성으로부터 추론
  inferFromProductivity(productivityEstimate) {
    const level = parseInt(productivityEstimate);
    
    if (level > 1000) {
      return this.inferenceRules.productivityToDepth.prolific;
    } else if (level < 100) {
      return this.inferenceRules.productivityToDepth.limited;
    } else {
      return this.inferenceRules.productivityToDepth.moderate;
    }
  }

  // 국적으로부터 추론
  inferFromNationality(nationality) {
    // 직접 매칭
    if (this.inferenceRules.nationalityToContext[nationality]) {
      return this.inferenceRules.nationalityToContext[nationality];
    }
    
    // 유사 국적 찾기
    const nationalityMap = {
      'USA': 'American',
      'United States': 'American',
      'France': 'French',
      'Japan': 'Japanese',
      'Germany': 'German',
      'Italy': 'Italian',
      'Spain': 'Spanish',
      'Netherlands': 'Dutch',
      'Russia': 'Russian',
      'UK': 'British',
      'United Kingdom': 'British',
      'England': 'British'
    };
    
    const mapped = nationalityMap[nationality];
    if (mapped && this.inferenceRules.nationalityToContext[mapped]) {
      return this.inferenceRules.nationalityToContext[mapped];
    }
    
    // 기본값
    return {
      themes: ['universal'],
      approachability: 'medium',
      culturalCodes: 'diverse',
      additionalAPT: []
    };
  }

  // 생애 패턴으로부터 추론
  inferFromLifePattern(pattern) {
    if (!pattern || !this.inferenceRules.lifePatternToWork[pattern]) {
      return null;
    }
    
    const patternData = this.inferenceRules.lifePatternToWork[pattern];
    return {
      primaryAPT: patternData.primaryAPT || [],
      viewingExperience: {
        intensity: patternData.intensity,
        authenticity: patternData.authenticity,
        viewingMode: patternData.viewingExperience,
        emotionalResonance: patternData.emotionalResonance
      },
      reasoning: `생애 패턴 (${pattern}): ${patternData.viewingExperience} 감상 경험`
    };
  }
}

module.exports = ArtistAPTInferenceEngine;