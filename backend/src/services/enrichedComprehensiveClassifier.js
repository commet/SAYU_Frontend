// Enriched Comprehensive Classifier - 외부 데이터 수집 통합 버전

const { GoogleGenerativeAI } = require('@google/generative-ai');
const ArtistDataEnricher = require('./artistDataEnricher');

class EnrichedComprehensiveClassifier {
  constructor() {
    this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.gemini.getGenerativeModel({ model: "gemini-1.5-flash" });
    this.enricher = new ArtistDataEnricher();
    
    // 세션 통계
    this.sessionStats = {
      aptDistribution: {},
      enrichmentSuccess: 0,
      enrichmentFailed: 0,
      apiCalls: 0
    };
  }

  async classifyArtist(artistData) {
    console.log(`\n🎨 강화 분류: ${artistData.name}`);
    
    try {
      // 1단계: 외부 데이터 수집
      const enrichedData = await this.enricher.enrichArtistData(
        this.extractActualArtistName(artistData.name),
        artistData
      );
      
      if (enrichedData.sources.length > 0) {
        console.log(`   ✅ 외부 소스: ${enrichedData.sources.join(', ')}`);
        this.sessionStats.enrichmentSuccess++;
      } else {
        this.sessionStats.enrichmentFailed++;
      }
      
      // 2단계: 데이터 품질 평가
      const dataQuality = this.assessEnrichedDataQuality(enrichedData);
      console.log(`   📊 데이터 품질: ${dataQuality}`);
      
      // 3단계: 분류 전략 선택
      let result;
      
      if (dataQuality === 'excellent') {
        // 매우 풍부한 데이터: 정밀 AI 분석
        result = await this.performDeepAnalysis(enrichedData);
      } else if (dataQuality === 'good') {
        // 양호한 데이터: 표준 AI 분석
        result = await this.performStandardAnalysis(enrichedData);
      } else if (dataQuality === 'moderate') {
        // 보통 데이터: 컨텍스트 기반 분석
        result = await this.performContextualAnalysis(enrichedData);
      } else {
        // 부족한 데이터: 지능형 추론
        result = this.performIntelligentInference(enrichedData);
      }
      
      // 4단계: SRMC 억제 및 다양성 보장
      if (result && result.aptType === 'SRMC' && this.shouldDiversify()) {
        result = this.diversifyResult(result, enrichedData);
      }
      
      // 통계 업데이트
      this.updateStatistics(result.aptType);
      
      return this.formatFinalResult(result, enrichedData);
      
    } catch (error) {
      console.error(`   ❌ 분류 오류: ${error.message}`);
      return this.createFallbackResult(artistData);
    }
  }

  assessEnrichedDataQuality(data) {
    let score = 0;
    
    // 기본 정보
    if (data.bio && data.bio.length > 1500) score += 30;
    else if (data.bio && data.bio.length > 800) score += 20;
    else if (data.bio && data.bio.length > 400) score += 10;
    else if (data.bio && data.bio.length > 200) score += 5;
    
    // 메타데이터
    if (data.nationality) score += 5;
    if (data.era) score += 10;
    if (data.movement) score += 10;
    if (data.birth_year && data.death_year) score += 5;
    
    // 외부 소스 데이터
    if (data.sources.includes('wikipedia')) score += 15;
    if (data.sources.includes('artnet')) score += 10;
    if (data.sources.includes('metmuseum')) score += 10;
    
    // 시장/전시 데이터
    if (data.auctionRecords > 100) score += 10;
    if (data.exhibitions > 50) score += 10;
    if (data.worksInMet > 10) score += 5;
    
    // 컨텍스트 정보
    if (data.contextualInfo && data.contextualInfo.length > 3) score += 10;
    
    if (score >= 80) return 'excellent';
    if (score >= 50) return 'good';
    if (score >= 25) return 'moderate';
    return 'poor';
  }

  async performDeepAnalysis(data) {
    console.log('   💎 심층 분석 수행');
    this.sessionStats.apiCalls++;
    
    const prompt = `당신은 미술사 전문가입니다. 다음 작가의 풍부한 정보를 바탕으로 정밀한 APT 분류를 수행하세요.

작가: ${data.name}

상세 정보:
- 국적: ${data.nationality || '불명'}
- 시대: ${data.era || '불명'}
- 운동/사조: ${data.movement || '불명'}
- 생몰: ${data.birth_year || '?'} - ${data.death_year || '?'}

전기 정보:
${data.bio || '없음'}

시장/전시 데이터:
- 경매 기록: ${data.auctionRecords || 0}건
- 전시 이력: ${data.exhibitions || 0}회
- Artnet 순위: ${data.ranking ? '#' + data.ranking : '순위 없음'}
- Met Museum 소장: ${data.worksInMet || 0}점

컨텍스트:
${data.contextualInfo ? data.contextualInfo.join(', ') : '없음'}

16가지 APT 유형과 특성:
LAEF(몽환적 방랑자): 내면 탐구, 실험적, 추상적
LAEC(감성 큐레이터): 감성적 선별, 개인적 취향
LAMF(직관적 탐구자): 철학적, 개념적, 직관 중시
LAMC(철학적 수집가): 체계적 수집, 의미 탐구
LREF(고독한 관찰자): 세밀한 관찰, 은둔적
LREC(섬세한 감정가): 미묘한 감정, 내성적
LRMF(디지털 탐험가): 기술 활용, 혁신적
LRMC(학구적 연구자): 학문적, 체계적 연구
SAEF(감성 나눔이): 감정 공유, 공감대 형성
SAEC(예술 네트워커): 연결, 커뮤니티 구축
SAMF(영감 전도사): 영감 전파, 열정적
SAMC(문화 기획자): 문화 행사, 조직적
SREF(열정적 관람자): 적극적 참여, 열정
SREC(따뜻한 안내자): 친근함, 교육적
SRMF(지식 멘토): 지식 전달, 멘토링
SRMC(체계적 교육자): 체계적 교육, 구조화

중요: SRMC는 전체의 70%를 차지하므로 명확한 교육적/체계적 특성이 없다면 피하세요.

작품 감상 경험 기준으로 평가:
L/S: 개인적 몰입(-100) vs 사회적 공유(+100)
A/R: 추상적 사색(-100) vs 구체적 서사(+100)
E/M: 감정적 공감(-100) vs 지적 탐구(+100)
F/C: 자유로운 해석(-100) vs 구조적 이해(+100)

응답 형식:
L/S: [점수] - [구체적 근거]
A/R: [점수] - [구체적 근거]
E/M: [점수] - [구체적 근거]
F/C: [점수] - [구체적 근거]
최종 APT: [4글자 코드]
종합 분석: [300자 이상의 상세한 분석]`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseDetailedResponse(text);
      
    } catch (error) {
      console.error('   ⚠️ AI 분석 오류:', error.message);
      return null;
    }
  }

  async performStandardAnalysis(data) {
    console.log('   🔍 표준 분석 수행');
    this.sessionStats.apiCalls++;
    
    const artistType = this.categorizeArtist(data);
    
    const prompt = `작가를 APT로 분류하세요.

작가: ${data.name}
유형: ${artistType}
정보: 
- ${data.nationality || '국적 불명'}, ${data.era || '시대 불명'}
- ${data.movement || '사조 불명'}
- ${data.bio ? data.bio.substring(0, 500) + '...' : '전기 없음'}

추가 정보:
- 전시: ${data.exhibitions || 0}회
- Met 소장: ${data.worksInMet || 0}점

APT 선택 (SRMC는 피하세요):
LAEF, LAEC, LAMF, LAMC, LREF, LREC, LRMF, LRMC
SAEF, SAEC, SAMF, SAMC, SREF, SREC, SRMF

L/S: [점수] (근거)
A/R: [점수] (근거)
E/M: [점수] (근거)
F/C: [점수] (근거)
APT: [4글자]`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseResponse(text);
      
    } catch (error) {
      console.error('   ⚠️ AI 분석 오류:', error.message);
      return null;
    }
  }

  async performContextualAnalysis(data) {
    console.log('   🎯 컨텍스트 분석 수행');
    
    const artistType = this.categorizeArtist(data);
    const contextPrompt = this.generateContextPrompt(data, artistType);
    
    // API 호출 최소화 - 30% 확률로만 API 사용
    if (Math.random() < 0.3 && this.sessionStats.apiCalls < 50) {
      this.sessionStats.apiCalls++;
      
      try {
        const result = await this.model.generateContent(contextPrompt);
        const response = await result.response;
        const text = response.text();
        
        return this.parseResponse(text);
      } catch (error) {
        console.error('   ⚠️ AI 오류, 추론 사용');
      }
    }
    
    // 컨텍스트 기반 추론
    return this.contextBasedInference(data, artistType);
  }

  performIntelligentInference(data) {
    console.log('   🧠 지능형 추론 적용');
    
    const artistType = this.categorizeArtist(data);
    
    // 풍부한 유형별 매핑
    const typePatterns = {
      'ancient': { 
        types: ['SREC', 'SRMF', 'SAMC', 'SRMC'],
        weights: [0.3, 0.3, 0.2, 0.2],
        scores: { L_S: 40, A_R: 85, E_M: 40, F_C: 70 }
      },
      'medieval': {
        types: ['LRMC', 'SAMC', 'SRMF'],
        weights: [0.4, 0.3, 0.3],
        scores: { L_S: 10, A_R: 90, E_M: 70, F_C: 85 }
      },
      'renaissance': {
        types: ['LRMC', 'LRMF', 'SRMF', 'LAMC'],
        weights: [0.3, 0.3, 0.2, 0.2],
        scores: { L_S: -10, A_R: 85, E_M: 50, F_C: 75 }
      },
      'baroque': {
        types: ['SREC', 'SREF', 'SAEF', 'SRMC'],
        weights: [0.3, 0.3, 0.3, 0.1],
        scores: { L_S: 50, A_R: 90, E_M: -60, F_C: 40 }
      },
      'rococo': {
        types: ['SAEF', 'SAEC', 'SREC'],
        weights: [0.4, 0.3, 0.3],
        scores: { L_S: 60, A_R: 70, E_M: -70, F_C: -20 }
      },
      'neoclassical': {
        types: ['SRMF', 'LRMC', 'SRMC'],
        weights: [0.4, 0.4, 0.2],
        scores: { L_S: 20, A_R: 95, E_M: 60, F_C: 90 }
      },
      'romantic': {
        types: ['LREF', 'LAEF', 'LREC', 'SAEF'],
        weights: [0.3, 0.3, 0.2, 0.2],
        scores: { L_S: -30, A_R: 40, E_M: -80, F_C: -40 }
      },
      'realist': {
        types: ['LREF', 'LREC', 'SREF'],
        weights: [0.4, 0.3, 0.3],
        scores: { L_S: -10, A_R: 90, E_M: -30, F_C: 50 }
      },
      'impressionist': {
        types: ['LAEF', 'LREF', 'SAEF', 'LAEC'],
        weights: [0.3, 0.3, 0.2, 0.2],
        scores: { L_S: -20, A_R: 20, E_M: -70, F_C: -60 }
      },
      'post_impressionist': {
        types: ['LAMF', 'LAEF', 'LRMF', 'LAMC'],
        weights: [0.3, 0.3, 0.2, 0.2],
        scores: { L_S: -40, A_R: -20, E_M: -50, F_C: -40 }
      },
      'expressionist': {
        types: ['LAEF', 'LAEC', 'SAEF'],
        weights: [0.4, 0.3, 0.3],
        scores: { L_S: -30, A_R: -40, E_M: -90, F_C: -70 }
      },
      'cubist': {
        types: ['LAMF', 'LAMC', 'LRMF'],
        weights: [0.4, 0.3, 0.3],
        scores: { L_S: -50, A_R: -80, E_M: 30, F_C: -30 }
      },
      'surrealist': {
        types: ['LAEF', 'LAMF', 'LAMC'],
        weights: [0.4, 0.3, 0.3],
        scores: { L_S: -60, A_R: -60, E_M: -40, F_C: -80 }
      },
      'abstract': {
        types: ['LAEF', 'LAMF', 'LAEC'],
        weights: [0.4, 0.3, 0.3],
        scores: { L_S: -70, A_R: -90, E_M: -30, F_C: -90 }
      },
      'pop_art': {
        types: ['SAEF', 'SAMF', 'SREF', 'SAEC'],
        weights: [0.3, 0.3, 0.2, 0.2],
        scores: { L_S: 70, A_R: 30, E_M: -50, F_C: -40 }
      },
      'contemporary': {
        types: ['LAEC', 'SAEC', 'LAMF', 'SAMF'],
        weights: [0.25, 0.25, 0.25, 0.25],
        scores: { L_S: 0, A_R: -40, E_M: -20, F_C: -30 }
      },
      'modern': {
        types: ['LAMF', 'LAEF', 'LRMF', 'LAEC'],
        weights: [0.3, 0.3, 0.2, 0.2],
        scores: { L_S: -40, A_R: -50, E_M: -10, F_C: -50 }
      },
      'attribution': {
        types: ['SREC', 'SREF', 'SAEC'],
        weights: [0.4, 0.3, 0.3],
        scores: { L_S: 60, A_R: 70, E_M: -40, F_C: 30 }
      }
    };
    
    const pattern = typePatterns[artistType] || {
      types: ['LREC', 'LAEC', 'SAEC', 'SREF'],
      weights: [0.25, 0.25, 0.25, 0.25],
      scores: { L_S: 0, A_R: 20, E_M: -20, F_C: 0 }
    };
    
    // 가중치 기반 선택
    const selectedType = this.weightedSelection(pattern.types, pattern.weights);
    
    // 시장 데이터 기반 조정
    if (data.auctionRecords > 200 || data.exhibitions > 100) {
      pattern.scores.L_S += 20; // 더 사회적
    }
    
    return {
      aptType: selectedType,
      axisScores: pattern.scores,
      confidence: 45,
      reasoning: `${artistType} 시대 특성 및 외부 데이터 기반 추론`
    };
  }

  categorizeArtist(data) {
    // 외부 데이터 우선 활용
    if (data.movement) {
      const movementMap = {
        'impressionism': 'impressionist',
        'post-impressionism': 'post_impressionist',
        'cubism': 'cubist',
        'surrealism': 'surrealist',
        'abstract expressionism': 'abstract',
        'pop art': 'pop_art',
        'romanticism': 'romantic',
        'realism': 'realist',
        'baroque': 'baroque',
        'renaissance': 'renaissance'
      };
      
      const movement = data.movement.toLowerCase();
      for (const [key, value] of Object.entries(movementMap)) {
        if (movement.includes(key)) return value;
      }
    }
    
    if (data.era) {
      const era = data.era.toLowerCase();
      if (era.includes('medieval')) return 'medieval';
      if (era.includes('renaissance')) return 'renaissance';
      if (era.includes('baroque')) return 'baroque';
      if (era.includes('romantic')) return 'romantic';
      if (era.includes('impressionis')) return 'impressionist';
      if (era.includes('modern')) return 'modern';
      if (era.includes('contemporary')) return 'contemporary';
    }
    
    const name = data.name.toLowerCase();
    if (name.match(/attributed|after|follower|workshop/i)) {
      return 'attribution';
    }
    
    if (data.birth_year) {
      if (data.birth_year < 1400) return 'medieval';
      if (data.birth_year < 1600) return 'renaissance';
      if (data.birth_year < 1750) return 'baroque';
      if (data.birth_year < 1850) return 'romantic';
      if (data.birth_year < 1900) return '19th_century';
      if (data.birth_year < 1945) return 'modern';
      return 'contemporary';
    }
    
    return 'unknown';
  }

  weightedSelection(types, weights) {
    const total = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * total;
    
    for (let i = 0; i < types.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return types[i];
      }
    }
    
    return types[0];
  }

  contextBasedInference(data, artistType) {
    // 컨텍스트 정보 활용
    const scores = { L_S: 0, A_R: 0, E_M: 0, F_C: 0 };
    let suggestedTypes = [];
    
    // 시장 활동성
    if (data.auctionRecords > 500) {
      scores.L_S += 40;
      suggestedTypes.push('SREF', 'SAEF');
    } else if (data.auctionRecords > 100) {
      scores.L_S += 20;
    }
    
    // 미술관 소장
    if (data.worksInMet > 50) {
      scores.F_C += 30;
      scores.E_M += 20;
      suggestedTypes.push('SRMC', 'SRMF');
    } else if (data.worksInMet > 10) {
      scores.F_C += 15;
    }
    
    // 전시 활동
    if (data.exhibitions > 100) {
      scores.L_S += 30;
      scores.A_R += 10;
      suggestedTypes.push('SAEC', 'SAMF');
    }
    
    // 시대별 기본값 적용
    const typeDefaults = this.getTypeDefaults(artistType);
    Object.keys(scores).forEach(axis => {
      scores[axis] += typeDefaults.scores[axis] * 0.7;
    });
    
    // 최종 APT 결정
    const calculatedAPT = this.calculateAPT(scores);
    const finalAPT = suggestedTypes.includes(calculatedAPT) ? 
      calculatedAPT : 
      this.selectLeastUsedType([...suggestedTypes, ...typeDefaults.types]);
    
    return {
      aptType: finalAPT,
      axisScores: scores,
      confidence: 55,
      reasoning: '외부 데이터와 컨텍스트 기반 추론'
    };
  }

  getTypeDefaults(artistType) {
    const defaults = {
      'baroque': {
        types: ['SREC', 'SREF', 'SAEF'],
        scores: { L_S: 50, A_R: 90, E_M: -60, F_C: 40 }
      },
      'impressionist': {
        types: ['LAEF', 'LREF', 'SAEF'],
        scores: { L_S: -20, A_R: 20, E_M: -70, F_C: -60 }
      },
      // ... 다른 시대들
    };
    
    return defaults[artistType] || {
      types: ['LREC', 'LAEC', 'SAEC'],
      scores: { L_S: 0, A_R: 20, E_M: -20, F_C: 0 }
    };
  }

  shouldDiversify() {
    const total = Object.values(this.sessionStats.aptDistribution)
      .reduce((a, b) => a + b, 0);
    const srmcCount = this.sessionStats.aptDistribution['SRMC'] || 0;
    
    return total > 0 && (srmcCount / total) > 0.12;
  }

  diversifyResult(result, data) {
    console.log('   🔄 다양성 조정');
    
    const alternatives = {
      'baroque': ['SREC', 'SREF'],
      'romantic': ['LREF', 'LAEF'],
      'impressionist': ['LAEF', 'LREF'],
      'modern': ['LAMF', 'LAEC'],
      'contemporary': ['LAEC', 'SAEC']
    };
    
    const artistType = this.categorizeArtist(data);
    const altTypes = alternatives[artistType] || ['LREC', 'LAEC'];
    const newType = this.selectLeastUsedType(altTypes);
    
    return {
      ...result,
      aptType: newType,
      confidence: result.confidence - 5,
      reasoning: result.reasoning + ' (다양성을 위해 조정됨)'
    };
  }

  selectLeastUsedType(candidates) {
    let minCount = Infinity;
    let selected = candidates[0];
    
    for (const type of candidates) {
      const count = this.sessionStats.aptDistribution[type] || 0;
      if (count < minCount) {
        minCount = count;
        selected = type;
      }
    }
    
    return selected;
  }

  parseDetailedResponse(text) {
    try {
      const result = {
        axisScores: { L_S: 0, A_R: 0, E_M: 0, F_C: 0 },
        aptType: null,
        reasoning: '',
        confidence: 75
      };
      
      // 축 점수 추출
      const patterns = {
        L_S: /L\/S:\s*([+-]?\d+)/i,
        A_R: /A\/R:\s*([+-]?\d+)/i,
        E_M: /E\/M:\s*([+-]?\d+)/i,
        F_C: /F\/C:\s*([+-]?\d+)/i
      };
      
      for (const [axis, pattern] of Object.entries(patterns)) {
        const match = text.match(pattern);
        if (match) {
          result.axisScores[axis] = parseInt(match[1]);
        }
      }
      
      // APT 추출
      const aptMatch = text.match(/최종 APT:\s*([LS][AR][EM][FC])/i);
      if (aptMatch) {
        result.aptType = aptMatch[1].toUpperCase();
      } else {
        result.aptType = this.calculateAPT(result.axisScores);
      }
      
      // 종합 분석 추출
      const analysisMatch = text.match(/종합 분석:\s*(.+?)$/ims);
      if (analysisMatch) {
        result.reasoning = analysisMatch[1].trim();
        result.confidence = 85;
      }
      
      return result;
      
    } catch (error) {
      return null;
    }
  }

  parseResponse(text) {
    try {
      const result = {
        axisScores: { L_S: 0, A_R: 0, E_M: 0, F_C: 0 },
        aptType: null,
        reasoning: '',
        confidence: 65
      };
      
      const patterns = {
        L_S: /L\/S:\s*([+-]?\d+)/i,
        A_R: /A\/R:\s*([+-]?\d+)/i,
        E_M: /E\/M:\s*([+-]?\d+)/i,
        F_C: /F\/C:\s*([+-]?\d+)/i
      };
      
      for (const [axis, pattern] of Object.entries(patterns)) {
        const match = text.match(pattern);
        if (match) {
          result.axisScores[axis] = parseInt(match[1]);
        }
      }
      
      const aptMatch = text.match(/APT:\s*([LS][AR][EM][FC])/i);
      if (aptMatch) {
        result.aptType = aptMatch[1].toUpperCase();
      } else {
        result.aptType = this.calculateAPT(result.axisScores);
      }
      
      return result;
      
    } catch (error) {
      return null;
    }
  }

  generateContextPrompt(data, artistType) {
    return `작가 분류:
${data.name} (${artistType})
소스: ${data.sources.join(', ')}
전시: ${data.exhibitions}회, Met: ${data.worksInMet}점

L/S: [점수]
A/R: [점수]
E/M: [점수]
F/C: [점수]
APT: [SRMC 제외]`;
  }

  calculateAPT(scores) {
    return (scores.L_S < 0 ? 'L' : 'S') +
           (scores.A_R < 0 ? 'A' : 'R') +
           (scores.E_M < 0 ? 'E' : 'M') +
           (scores.F_C < 0 ? 'F' : 'C');
  }

  updateStatistics(aptType) {
    this.sessionStats.aptDistribution[aptType] = 
      (this.sessionStats.aptDistribution[aptType] || 0) + 1;
  }

  extractActualArtistName(fullName) {
    const attributions = [
      'Attributed to ', 'After ', 'Follower of ', 'Circle of ',
      'School of ', 'Workshop of ', 'Studio of ', 'Manner of ',
      'Style of ', 'Copy after ', 'Imitator of ', 'In the style of '
    ];
    
    let actualName = fullName;
    for (const attr of attributions) {
      if (actualName.startsWith(attr)) {
        actualName = actualName.substring(attr.length);
        break;
      }
    }
    
    return actualName.trim();
  }

  createFallbackResult(artistData) {
    const fallbackTypes = ['LREC', 'LAEC', 'SAEC', 'SREF'];
    const randomType = fallbackTypes[Math.floor(Math.random() * fallbackTypes.length)];
    
    return {
      aptType: randomType,
      axisScores: { L_S: 0, A_R: 20, E_M: -20, F_C: 0 },
      confidence: 30,
      analysis: {
        strategy: 'fallback',
        actualArtistName: this.extractActualArtistName(artistData.name),
        reasoning: '분류 오류로 인한 기본값'
      }
    };
  }

  formatFinalResult(result, enrichedData) {
    return {
      aptType: result.aptType,
      axisScores: result.axisScores,
      confidence: result.confidence || 50,
      analysis: {
        strategy: 'enriched_comprehensive_v1',
        actualArtistName: this.extractActualArtistName(enrichedData.name),
        reasoning: result.reasoning || '분류 완료',
        sources: enrichedData.sources,
        enrichedData: {
          exhibitions: enrichedData.exhibitions,
          auctionRecords: enrichedData.auctionRecords,
          worksInMet: enrichedData.worksInMet,
          contextualInfo: enrichedData.contextualInfo
        }
      }
    };
  }
}

module.exports = EnrichedComprehensiveClassifier;