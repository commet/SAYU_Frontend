// Comprehensive Classifier - 최종 통합 분류기
// 외부 데이터 참조 + 다양성 보장 + Gemini API 활용

const { GoogleGenerativeAI } = require('@google/generative-ai');

class ComprehensiveClassifier {
  constructor() {
    this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // 현재 세션의 APT 분포
    this.sessionDistribution = {};

    // 전체 DB의 APT 분포 (초기값)
    this.globalDistribution = {
      SRMC: 0.72,  // 현재 72%
      others: 0.28
    };
  }

  async classifyArtist(artistData) {
    console.log(`\n🎨 종합 분류: ${artistData.name}`);

    try {
      const actualArtistName = this.extractActualArtistName(artistData.name);
      const isAttribution = artistData.name !== actualArtistName;
      const artistType = this.categorizeArtist(artistData);
      const dataQuality = this.assessDataQuality(artistData);

      console.log(`   📋 유형: ${artistType}, 데이터: ${dataQuality}, 귀속: ${isAttribution ? '예' : '아니오'}`);

      // 전략 선택
      let result;

      if (dataQuality === 'rich') {
        // 풍부한 데이터: Gemini 정밀 분석
        result = await this.geminiPrecisionAnalysis(artistData, artistType);
      } else if (dataQuality === 'moderate') {
        // 중간 데이터: Gemini + 컨텍스트 보강
        result = await this.geminiContextualAnalysis(artistData, artistType);
      } else {
        // 부족한 데이터: 지능형 추론
        result = this.intelligentInference(artistData, artistType);
      }

      // SRMC 억제 및 다양성 보장
      if (result.aptType === 'SRMC' && this.shouldAvoidSRMC()) {
        result = this.diversifyFromSRMC(result, artistType);
      }

      // 세션 분포 업데이트
      this.updateDistribution(result.aptType);

      return this.formatResult(result, artistData);

    } catch (error) {
      console.error(`   ❌ 오류: ${error.message}`);
      // 오류 시에도 기본 분류 제공
      return this.safetyFallback(artistData);
    }
  }

  assessDataQuality(artistData) {
    let score = 0;

    // 전기 정보
    if (artistData.bio) {
      if (artistData.bio.length > 1000) score += 40;
      else if (artistData.bio.length > 500) score += 30;
      else if (artistData.bio.length > 200) score += 20;
      else if (artistData.bio.length > 100) score += 10;
    }

    // 메타데이터
    if (artistData.nationality) score += 10;
    if (artistData.era) score += 10;
    if (artistData.movement) score += 15;
    if (artistData.birth_year && artistData.death_year) score += 10;
    if (artistData.birth_year) score += 5;

    // 추가 정보
    if (artistData.style) score += 10;
    if (artistData.medium) score += 5;

    if (score >= 50) return 'rich';
    if (score >= 20) return 'moderate';
    return 'poor';
  }

  categorizeArtist(artistData) {
    const name = artistData.name.toLowerCase();

    // 귀속 작품
    if (name.match(/attributed|after|follower|workshop|circle|school|manner|style|copy/i)) {
      return 'attribution';
    }

    // 고대
    if (name.includes('greek') || name.includes('athens') || name.includes('etruscan')) {
      return 'ancient';
    }

    // 시대별
    if (artistData.era) {
      const era = artistData.era.toLowerCase();
      if (era.includes('medieval')) return 'medieval';
      if (era.includes('renaissance')) return 'renaissance';
      if (era.includes('baroque')) return 'baroque';
      if (era.includes('rococo')) return 'rococo';
      if (era.includes('neoclassic')) return 'neoclassical';
      if (era.includes('romantic')) return 'romantic';
      if (era.includes('realis')) return 'realist';
      if (era.includes('impressionis')) return 'impressionist';
      if (era.includes('post-impressionis')) return 'post_impressionist';
      if (era.includes('expressionis')) return 'expressionist';
      if (era.includes('cubis')) return 'cubist';
      if (era.includes('surrealis')) return 'surrealist';
      if (era.includes('abstract')) return 'abstract';
      if (era.includes('pop')) return 'pop_art';
      if (era.includes('contemporary')) return 'contemporary';
      if (era.includes('modern')) return 'modern';
    }

    // 생년 기반
    if (artistData.birth_year) {
      if (artistData.birth_year < 1400) return 'medieval';
      if (artistData.birth_year < 1600) return 'renaissance';
      if (artistData.birth_year < 1750) return 'baroque';
      if (artistData.birth_year < 1800) return 'classical';
      if (artistData.birth_year < 1850) return 'romantic';
      if (artistData.birth_year < 1900) return '19th_century';
      if (artistData.birth_year < 1945) return 'modern';
      if (artistData.birth_year < 1980) return 'contemporary';
      return 'contemporary';
    }

    return 'unknown';
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

  async geminiPrecisionAnalysis(artistData, artistType) {
    const prompt = `전문가 수준의 작가 분석을 수행해주세요.

작가: ${this.extractActualArtistName(artistData.name)}
전체 정보:
${JSON.stringify(artistData, null, 2)}

참고 데이터 소스:
- Artnet의 경매 기록과 전시 이력
- Metropolitan Museum Timeline of Art History
- ArtFacts.net의 순위와 영향력 지표
- 주요 미술관 컬렉션 정보

16가지 APT 유형:
LAEF(몽환적 방랑자), LAEC(감성 큐레이터), LAMF(직관적 탐구자), LAMC(철학적 수집가)
LREF(고독한 관찰자), LREC(섬세한 감정가), LRMF(디지털 탐험가), LRMC(학구적 연구자)
SAEF(감성 나눔이), SAEC(예술 네트워커), SAMF(영감 전도사), SAMC(문화 기획자)
SREF(열정적 관람자), SREC(따뜻한 안내자), SRMF(지식 멘토), SRMC(체계적 교육자)

중요: SRMC는 전체의 72%를 차지하고 있으므로 매우 신중하게 선택하세요.

작품 감상 경험 기준 평가:
L/S: 개인적 몰입(-100) vs 사회적 공유(+100)
A/R: 추상적 사색(-100) vs 구체적 서사(+100)
E/M: 감정적 공감(-100) vs 지적 탐구(+100)
F/C: 자유로운 해석(-100) vs 구조적 이해(+100)

응답:
L/S: [점수] (구체적 근거)
A/R: [점수] (구체적 근거)
E/M: [점수] (구체적 근거)
F/C: [점수] (구체적 근거)
APT: [4글자]
종합 분석: [200자 이상의 상세 설명]`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log(`   💎 정밀 분석 완료`);
      return this.parseGeminiResponse(text);

    } catch (error) {
      console.error('   ⚠️ Gemini 오류:', error.message);
      return null;
    }
  }

  async geminiContextualAnalysis(artistData, artistType) {
    const context = this.getTypeContext(artistType);

    const prompt = `작가를 분류해주세요. 제한된 정보지만 시대적 맥락을 고려하세요.

작가: ${this.extractActualArtistName(artistData.name)}
유형: ${artistType}
정보: ${JSON.stringify(artistData, null, 2)}

${artistType} 시대/유형의 일반적 특성:
${context}

16가지 APT 중 선택 (SRMC는 피하세요):
LAEF, LAEC, LAMF, LAMC, LREF, LREC, LRMF, LRMC
SAEF, SAEC, SAMF, SAMC, SREF, SREC, SRMF, SRMC

평가 축:
L/S: 개인적(-100) vs 사회적(+100)
A/R: 추상적(-100) vs 구체적(+100)
E/M: 감정적(-100) vs 지적(+100)
F/C: 자유로운(-100) vs 구조적(+100)

응답:
L/S: [점수] (근거)
A/R: [점수] (근거)
E/M: [점수] (근거)
F/C: [점수] (근거)
APT: [4글자]`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log(`   🔍 맥락 분석 완료`);
      return this.parseGeminiResponse(text);

    } catch (error) {
      console.error('   ⚠️ Gemini 오류:', error.message);
      return null;
    }
  }

  parseGeminiResponse(text) {
    try {
      const result = {
        axisScores: { L_S: 0, A_R: 0, E_M: 0, F_C: 0 },
        aptType: null,
        reasoning: '',
        confidence: 70
      };

      // 축 점수 추출 (다양한 형식 지원)
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
      const aptMatch = text.match(/APT:\s*([LS][AR][EM][FC])/i);
      if (aptMatch) {
        result.aptType = aptMatch[1].toUpperCase();
      } else {
        result.aptType = this.calculateAPT(result.axisScores);
      }

      // 종합 분석 추출
      const analysisMatch = text.match(/종합 분석:\s*(.+?)$/ims);
      if (analysisMatch) {
        result.reasoning = analysisMatch[1].trim();
      }

      return result;

    } catch (error) {
      console.error('파싱 오류:', error);
      return null;
    }
  }

  intelligentInference(artistData, artistType) {
    console.log('   🧠 지능형 추론 적용');

    // 유형별 특성 기반 추론
    const typePatterns = {
      'ancient': {
        types: ['SREC', 'SRMC', 'SRMF'],
        scores: { L_S: 40, A_R: 80, E_M: 30, F_C: 60 }
      },
      'medieval': {
        types: ['LRMC', 'SRMC', 'SAMC'],
        scores: { L_S: 20, A_R: 90, E_M: 70, F_C: 80 }
      },
      'renaissance': {
        types: ['LRMC', 'LRMF', 'SRMF'],
        scores: { L_S: -10, A_R: 85, E_M: 40, F_C: 70 }
      },
      'baroque': {
        types: ['SREC', 'SREF', 'SAEF'],
        scores: { L_S: 50, A_R: 90, E_M: -60, F_C: 40 }
      },
      'rococo': {
        types: ['SAEF', 'SAEC', 'SREC'],
        scores: { L_S: 60, A_R: 70, E_M: -70, F_C: -20 }
      },
      'neoclassical': {
        types: ['SRMF', 'LRMC', 'SRMC'],
        scores: { L_S: 20, A_R: 95, E_M: 60, F_C: 90 }
      },
      'romantic': {
        types: ['LREF', 'LAEF', 'LREC'],
        scores: { L_S: -30, A_R: 40, E_M: -80, F_C: -40 }
      },
      'realist': {
        types: ['LREF', 'LREC', 'SREF'],
        scores: { L_S: -10, A_R: 90, E_M: -30, F_C: 50 }
      },
      'impressionist': {
        types: ['LAEF', 'LREF', 'SAEF'],
        scores: { L_S: -20, A_R: 20, E_M: -70, F_C: -60 }
      },
      'post_impressionist': {
        types: ['LAMF', 'LAEF', 'LRMF'],
        scores: { L_S: -40, A_R: -20, E_M: -50, F_C: -40 }
      },
      'expressionist': {
        types: ['LAEF', 'LAEC', 'SAEF'],
        scores: { L_S: -30, A_R: -40, E_M: -90, F_C: -70 }
      },
      'cubist': {
        types: ['LAMF', 'LAMC', 'LRMF'],
        scores: { L_S: -50, A_R: -80, E_M: 30, F_C: -30 }
      },
      'surrealist': {
        types: ['LAEF', 'LAMF', 'LAMC'],
        scores: { L_S: -60, A_R: -60, E_M: -40, F_C: -80 }
      },
      'abstract': {
        types: ['LAEF', 'LAMF', 'LAEC'],
        scores: { L_S: -70, A_R: -90, E_M: -30, F_C: -90 }
      },
      'pop_art': {
        types: ['SAEF', 'SAMF', 'SREF'],
        scores: { L_S: 70, A_R: 30, E_M: -50, F_C: -40 }
      },
      'contemporary': {
        types: ['LAEC', 'SAEC', 'LAMF', 'SAMF'],
        scores: { L_S: 0, A_R: -40, E_M: -20, F_C: -30 }
      },
      'modern': {
        types: ['LAMF', 'LAEF', 'LRMF'],
        scores: { L_S: -40, A_R: -50, E_M: -10, F_C: -50 }
      },
      'attribution': {
        types: ['SREC', 'SREF', 'SAEC'],
        scores: { L_S: 60, A_R: 70, E_M: -40, F_C: 30 }
      },
      'unknown': {
        types: ['LREC', 'LAEC', 'SAEC', 'SREF'],
        scores: { L_S: 0, A_R: 20, E_M: -20, F_C: 0 }
      }
    };

    const pattern = typePatterns[artistType] || typePatterns['unknown'];

    // 세션 분포를 고려한 유형 선택
    const leastUsedType = this.selectLeastUsedType(pattern.types);

    return {
      aptType: leastUsedType,
      axisScores: pattern.scores,
      confidence: 45,
      reasoning: `${artistType} 유형의 일반적 특성과 APT 분포 균형을 고려한 추론`
    };
  }

  getTypeContext(artistType) {
    const contexts = {
      'renaissance': '인문주의, 원근법, 고전 부활, 후원자 시스템',
      'baroque': '극적 명암, 감정 표현, 종교적 열정, 역동성',
      'impressionist': '빛과 색채, 순간 포착, 야외 작업, 일상 주제',
      'modern': '실험성, 추상화, 개념 중시, 전통 거부',
      'contemporary': '다원성, 매체 확장, 사회 비판, 글로벌화'
    };

    return contexts[artistType] || '시대적 맥락 정보 부족';
  }

  shouldAvoidSRMC() {
    const total = Object.values(this.sessionDistribution).reduce((a, b) => a + b, 0);
    const srmcCount = this.sessionDistribution['SRMC'] || 0;
    const srmcRatio = total > 0 ? srmcCount / total : 0;

    // 전체 15% 이상이면 억제
    return srmcRatio > 0.15 || this.globalDistribution.SRMC > 0.5;
  }

  diversifyFromSRMC(result, artistType) {
    console.log('   🔄 SRMC 과다로 다양성 조정');

    // 유형별 대안 매핑
    const alternatives = {
      'baroque': 'SREC',
      'romantic': 'LREF',
      'impressionist': 'LAEF',
      'modern': 'LAMF',
      'contemporary': 'LAEC',
      'default': 'LREC'
    };

    const newType = alternatives[artistType] || alternatives['default'];

    // 해당 APT에 맞는 점수 조정
    const adjustments = {
      'SREC': { L_S: 40, A_R: 70, E_M: -50, F_C: 20 },
      'LREF': { L_S: -30, A_R: 60, E_M: -70, F_C: -20 },
      'LAEF': { L_S: -50, A_R: -30, E_M: -80, F_C: -60 },
      'LAMF': { L_S: -40, A_R: -60, E_M: -20, F_C: -70 },
      'LAEC': { L_S: -20, A_R: -40, E_M: -60, F_C: 30 },
      'LREC': { L_S: -10, A_R: 50, E_M: -50, F_C: 40 }
    };

    return {
      aptType: newType,
      axisScores: adjustments[newType],
      confidence: result.confidence - 10,
      reasoning: `${result.reasoning} (SRMC 과다로 조정됨)`,
      adjusted: true
    };
  }

  selectLeastUsedType(candidates) {
    // 후보 중 가장 적게 사용된 유형 선택
    let minCount = Infinity;
    let selected = candidates[0];

    for (const type of candidates) {
      const count = this.sessionDistribution[type] || 0;
      if (count < minCount) {
        minCount = count;
        selected = type;
      }
    }

    return selected;
  }

  updateDistribution(aptType) {
    this.sessionDistribution[aptType] = (this.sessionDistribution[aptType] || 0) + 1;
  }

  calculateAPT(scores) {
    return (scores.L_S < 0 ? 'L' : 'S') +
           (scores.A_R < 0 ? 'A' : 'R') +
           (scores.E_M < 0 ? 'E' : 'M') +
           (scores.F_C < 0 ? 'F' : 'C');
  }

  safetyFallback(artistData) {
    // 오류 시 안전한 기본값
    const fallbackTypes = ['LREC', 'LAEC', 'SAEC', 'SREF'];
    const randomType = fallbackTypes[Math.floor(Math.random() * fallbackTypes.length)];

    return {
      aptType: randomType,
      axisScores: { L_S: 0, A_R: 20, E_M: -20, F_C: 0 },
      confidence: 30,
      analysis: {
        strategy: 'safety_fallback',
        actualArtistName: this.extractActualArtistName(artistData.name),
        reasoning: '분류 오류로 인한 기본값'
      }
    };
  }

  formatResult(result, artistData) {
    return {
      aptType: result.aptType,
      axisScores: result.axisScores,
      confidence: result.confidence || 50,
      analysis: {
        strategy: 'comprehensive_v1',
        actualArtistName: this.extractActualArtistName(artistData.name),
        reasoning: result.reasoning || '분류 완료',
        adjusted: result.adjusted || false
      }
    };
  }
}

module.exports = ComprehensiveClassifier;
