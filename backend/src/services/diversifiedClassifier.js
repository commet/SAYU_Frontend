// Diversified Classifier - 더 다양한 APT 분포를 위한 분류기

const { GoogleGenerativeAI } = require('@google/generative-ai');

class DiversifiedClassifier {
  constructor() {
    this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // APT 분포 추적
    this.distributionTracker = {
      SRMC: 0,
      SREC: 0,
      SREF: 0,
      SAEF: 0,
      SAEC: 0,
      SAMF: 0,
      SAMC: 0,
      SRMF: 0,
      LRMC: 0,
      LREC: 0,
      LREF: 0,
      LAEF: 0,
      LAEC: 0,
      LAMF: 0,
      LAMC: 0,
      LRMF: 0
    };
  }

  async classifyArtist(artistData) {
    console.log(`\n🎨 다양성 분류: ${artistData.name}`);

    try {
      const actualArtistName = this.extractActualArtistName(artistData.name);
      const isAttribution = artistData.name !== actualArtistName;

      // 작가 유형과 특성 파악
      const artistType = this.categorizeArtist(artistData);
      const hasRichData = this.hasRichData(artistData);

      console.log(`   📋 유형: ${artistType}, 데이터 품질: ${hasRichData ? '풍부' : '부족'}`);

      if (hasRichData) {
        // 데이터가 풍부한 경우 Gemini 분석
        const result = await this.analyzeWithDiversityPrompt(
          { ...artistData, actualName: actualArtistName, isAttribution, artistType }
        );

        if (result && result.aptType) {
          // SRMC 억제
          if (result.aptType === 'SRMC' && this.getSRMCRatio() > 0.15) {
            return this.adjustAwayFromSRMC(result, artistData, artistType);
          }
          return this.formatResult(result, artistData);
        }
      }

      // 데이터가 부족한 경우 다양한 폴백
      return this.diverseFallback(artistData, artistType);

    } catch (error) {
      console.error(`   ❌ 오류: ${error.message}`);
      throw error;
    }
  }

  hasRichData(artistData) {
    return (artistData.bio && artistData.bio.length > 200) ||
           (artistData.nationality && artistData.era && artistData.birth_year) ||
           (artistData.movement);
  }

  getSRMCRatio() {
    const total = Object.values(this.distributionTracker).reduce((a, b) => a + b, 0);
    return total > 0 ? this.distributionTracker.SRMC / total : 0;
  }

  categorizeArtist(artistData) {
    const name = artistData.name.toLowerCase();

    if (name.includes('greek') || name.includes('athens')) return 'ancient_greek';
    if (name.match(/attributed|after|follower|workshop/i)) return 'attribution';

    if (artistData.era) {
      const era = artistData.era.toLowerCase();
      if (era.includes('renaissance')) return 'renaissance';
      if (era.includes('baroque')) return 'baroque';
      if (era.includes('impressionis')) return 'impressionist';
      if (era.includes('romantic')) return 'romantic';
      if (era.includes('modern') || era.includes('contemporary')) return 'modern';
      if (era.includes('abstract')) return 'abstract';
    }

    if (artistData.birth_year) {
      if (artistData.birth_year < 1600) return 'old_master';
      if (artistData.birth_year < 1800) return 'classical';
      if (artistData.birth_year < 1900) return '19th_century';
      if (artistData.birth_year < 1950) return 'modern';
      return 'contemporary';
    }

    return 'unknown';
  }

  extractActualArtistName(fullName) {
    const attributions = [
      'Attributed to ', 'After ', 'Follower of ', 'Circle of ',
      'School of ', 'Workshop of ', 'Studio of ', 'Manner of ',
      'Style of ', 'Copy after ', 'Imitator of '
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

  async analyzeWithDiversityPrompt(artistData) {
    try {
      const currentDistribution = this.getDistributionString();

      const prompt = `작가를 16가지 APT 중 하나로 분류해주세요.

작가: ${artistData.actualName || artistData.name}
유형: ${artistData.artistType}
${artistData.isAttribution ? '⚠️ 귀속 작품' : ''}

정보:
- 국적: ${artistData.nationality || '불명'}
- 시대: ${artistData.era || '불명'}
- 생몰: ${artistData.birth_year || '?'} - ${artistData.death_year || '?'}
${artistData.bio ? `- 전기: ${artistData.bio.substring(0, 800)}` : ''}

현재 APT 분포:
${currentDistribution}

⚠️ 중요 지침:
1. SRMC는 이미 과도하게 많으므로 정말 명확한 근거가 있을 때만 사용
2. 다음 유형들을 적극 고려해주세요:
   - LAEF (몽환적 방랑자): 독창적, 실험적, 내면 탐구
   - LREF (고독한 관찰자): 조용한 관찰자, 세밀한 묘사
   - SAEF (감성 나눔이): 감정 표현, 공감대 형성
   - LREC (섬세한 감정가): 미묘한 감정, 내성적
   - LAMF (직관적 탐구자): 철학적, 개념적
   - SREC (따뜻한 안내자): 친근함, 대중성

3. 극단적 점수를 두려워하지 마세요:
   - 추상적 작가는 A/R: -70~-90
   - 감정적 작가는 E/M: -60~-80
   - 실험적 작가는 F/C: -70~-90
   - 은둔형 작가는 L/S: -60~-80

평가 기준:
- L/S축: 혼자(-100) vs 함께(+100)
- A/R축: 추상(-100) vs 구상(+100)
- E/M축: 감정(-100) vs 의미(+100)
- F/C축: 자유(-100) vs 체계(+100)

응답 형식:
L/S: [점수] (근거)
A/R: [점수] (근거)
E/M: [점수] (근거)
F/C: [점수] (근거)
APT: [4글자]
분류 근거: [종합 설명]`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log(`   Gemini 응답: ${text.substring(0, 150)}...`);

      return this.parseResponse(text);

    } catch (error) {
      console.error('   ⚠️ Gemini 오류:', error.message);
      return null;
    }
  }

  getDistributionString() {
    const total = Object.values(this.distributionTracker).reduce((a, b) => a + b, 0);
    if (total === 0) return '아직 분류된 작가 없음';

    return Object.entries(this.distributionTracker)
      .filter(([_, count]) => count > 0)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([type, count]) => `${type}: ${Math.round(count * 100 / total)}%`)
      .join(', ');
  }

  parseResponse(text) {
    try {
      const result = {
        axisScores: { L_S: 0, A_R: 0, E_M: 0, F_C: 0 },
        aptType: null,
        reasoning: ''
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
      const aptMatch = text.match(/APT:\s*([LS][AR][EM][FC])/i);
      if (aptMatch) {
        result.aptType = aptMatch[1].toUpperCase();
      } else {
        result.aptType = this.calculateAPT(result.axisScores);
      }

      // 분류 근거
      const reasonMatch = text.match(/분류 근거:\s*(.+?)$/ims);
      if (reasonMatch) {
        result.reasoning = reasonMatch[1].trim();
      }

      return result;

    } catch (error) {
      console.error('파싱 오류:', error);
      return null;
    }
  }

  calculateAPT(scores) {
    return (scores.L_S < 0 ? 'L' : 'S') +
           (scores.A_R < 0 ? 'A' : 'R') +
           (scores.E_M < 0 ? 'E' : 'M') +
           (scores.F_C < 0 ? 'F' : 'C');
  }

  adjustAwayFromSRMC(result, artistData, artistType) {
    console.log('   🔄 SRMC 과다로 조정 중...');

    // 유형별로 가장 적합한 축 조정
    const adjustments = {
      'impressionist': { L_S: -40, E_M: -60 }, // LAEF로
      'modern': { A_R: -50, F_C: -40 }, // LAEF/LAMF로
      'baroque': { E_M: -50, L_S: 30 }, // SREC로
      'romantic': { L_S: -30, E_M: -70 }, // LREF로
      'abstract': { A_R: -80, F_C: -60 }, // LAEF로
      'attribution': { L_S: 40, E_M: -30 } // SREC로
    };

    const adj = adjustments[artistType] || { L_S: -20, A_R: -30 };

    Object.entries(adj).forEach(([axis, change]) => {
      result.axisScores[axis] += change;
    });

    result.aptType = this.calculateAPT(result.axisScores);
    result.analysis = {
      ...result.analysis,
      adjusted: true,
      originalType: 'SRMC'
    };

    return this.formatResult(result, artistData);
  }

  diverseFallback(artistData, artistType) {
    // 유형별 다양한 기본값
    const typeDefaults = {
      'ancient_greek': { apt: 'SREC', scores: { L_S: 40, A_R: 80, E_M: -30, F_C: 50 } },
      'renaissance': { apt: 'LRMC', scores: { L_S: -10, A_R: 85, E_M: 40, F_C: 70 } },
      'baroque': { apt: 'SREC', scores: { L_S: 50, A_R: 90, E_M: -60, F_C: 40 } },
      'impressionist': { apt: 'LAEF', scores: { L_S: -40, A_R: -10, E_M: -70, F_C: -50 } },
      'romantic': { apt: 'LREF', scores: { L_S: -30, A_R: 60, E_M: -80, F_C: -20 } },
      'modern': { apt: 'LAMF', scores: { L_S: -50, A_R: -60, E_M: -20, F_C: -70 } },
      'contemporary': { apt: 'LAEC', scores: { L_S: -20, A_R: -40, E_M: -50, F_C: 30 } },
      'abstract': { apt: 'LAEF', scores: { L_S: -60, A_R: -90, E_M: -60, F_C: -80 } },
      'attribution': { apt: 'SREC', scores: { L_S: 60, A_R: 70, E_M: -40, F_C: 30 } },
      '19th_century': { apt: 'LREC', scores: { L_S: -10, A_R: 70, E_M: -40, F_C: 40 } },
      'classical': { apt: 'SRMF', scores: { L_S: 30, A_R: 90, E_M: 60, F_C: -10 } },
      'old_master': { apt: 'LRMC', scores: { L_S: -20, A_R: 95, E_M: 50, F_C: 80 } }
    };

    // 분포가 적은 APT를 우선 선택
    const leastUsed = this.getLeastUsedAPT();
    const defaults = typeDefaults[artistType] ||
                    { apt: leastUsed, scores: this.getScoresForAPT(leastUsed) };

    // 분포 추적
    this.distributionTracker[defaults.apt]++;

    return {
      aptType: defaults.apt,
      axisScores: defaults.scores,
      confidence: 40,
      analysis: {
        strategy: 'diverse_fallback',
        actualArtistName: this.extractActualArtistName(artistData.name),
        reasoning: `${artistType} 유형의 특성과 APT 분포 균형을 고려한 추론`
      }
    };
  }

  getLeastUsedAPT() {
    const sorted = Object.entries(this.distributionTracker)
      .sort(([,a], [,b]) => a - b);
    return sorted[0][0];
  }

  getScoresForAPT(apt) {
    // APT에서 역산한 점수
    const scoreMap = {
      'L': -40, 'S': 40,
      'A': -50, 'R': 50,
      'E': -60, 'M': 60,
      'F': -70, 'C': 70
    };

    return {
      L_S: scoreMap[apt[0]],
      A_R: scoreMap[apt[1]],
      E_M: scoreMap[apt[2]],
      F_C: scoreMap[apt[3]]
    };
  }

  formatResult(geminiResult, artistData) {
    const confidence = this.calculateConfidence(geminiResult, artistData);

    // 분포 추적
    this.distributionTracker[geminiResult.aptType]++;

    return {
      aptType: geminiResult.aptType,
      axisScores: geminiResult.axisScores,
      confidence,
      analysis: {
        strategy: 'diversified_v1',
        actualArtistName: this.extractActualArtistName(artistData.name),
        reasoning: geminiResult.reasoning,
        adjusted: geminiResult.analysis?.adjusted || false
      }
    };
  }

  calculateConfidence(result, artistData) {
    let confidence = 50;

    if (artistData.bio && artistData.bio.length > 500) confidence += 20;
    else if (artistData.bio && artistData.bio.length > 100) confidence += 10;

    if (artistData.nationality) confidence += 5;
    if (artistData.era) confidence += 5;
    if (artistData.birth_year) confidence += 5;

    if (result.reasoning && result.reasoning.length > 100) confidence += 10;

    // 조정된 경우 신뢰도 감소
    if (result.analysis?.adjusted) confidence -= 10;

    return Math.min(85, Math.max(30, confidence));
  }
}

module.exports = DiversifiedClassifier;
