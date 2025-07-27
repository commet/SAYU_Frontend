// Balanced Gemini Classifier - SRMC 과다 분류 문제 해결
const ArtistAPTInferenceEngine = require('./artistAPTInferenceEngine');
const { GoogleGenerativeAI } = require('@google/generative-ai');

class BalancedGeminiClassifier {
  constructor() {
    this.inferenceEngine = new ArtistAPTInferenceEngine();
    this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.gemini.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  async classifyArtist(artistData) {
    console.log(`\n🎨 균형잡힌 분류 시작: ${artistData.name}`);
    
    try {
      // 1. 실제 작가명 추출
      const actualArtistName = this.extractActualArtistName(artistData.name);
      const isAttribution = artistData.name !== actualArtistName;
      
      if (isAttribution) {
        console.log(`   🏷️ 귀속 작품 → ${actualArtistName}`);
      }
      
      // 2. 데이터 품질 평가
      const dataQuality = this.assessDataQuality(artistData);
      console.log(`   📊 데이터 품질: ${dataQuality.level} (점수: ${dataQuality.score}/10)`);
      
      // 3. AI 분석 (개선된 프롬프트)
      const geminiResult = await this.analyzeWithGemini(
        { ...artistData, actualName: actualArtistName }, 
        dataQuality,
        isAttribution
      );
      
      if (geminiResult) {
        return this.formatResult(geminiResult, artistData);
      }
      
      // 4. 폴백: 규칙 기반 (다양성 보장)
      const ruleResult = this.diversifiedRuleBasedInference(artistData);
      return this.formatResult(ruleResult, artistData);
      
    } catch (error) {
      console.error(`   ❌ 오류: ${error.message}`);
      throw error;
    }
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

  assessDataQuality(artistData) {
    let score = 0;
    const factors = [];
    
    // Bio 품질 (0-3점)
    const bioLength = artistData.bio?.length || 0;
    if (bioLength > 500) { score += 3; factors.push('풍부한 전기'); }
    else if (bioLength > 100) { score += 2; factors.push('기본 전기'); }
    else if (bioLength > 0) { score += 1; factors.push('짧은 전기'); }
    
    // 메타데이터 (각 1점)
    if (artistData.nationality) { score += 1; factors.push('국적'); }
    if (artistData.era) { score += 1; factors.push('시대'); }
    if (artistData.birth_year) { score += 1; factors.push('생년'); }
    if (artistData.death_year) { score += 1; factors.push('몰년'); }
    if (artistData.movement) { score += 1; factors.push('사조'); }
    
    // Wikipedia 데이터 (2점)
    if (artistData.wikipedia_entry) { score += 2; factors.push('위키피디아'); }
    
    const level = score >= 7 ? 'high' : score >= 4 ? 'medium' : 'low';
    
    return { score, level, factors };
  }

  async analyzeWithGemini(artistData, dataQuality, isAttribution) {
    try {
      const prompt = this.buildBalancedPrompt(artistData, dataQuality, isAttribution);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseResponse(text);
      
    } catch (error) {
      console.error('   ⚠️ Gemini 오류:', error.message);
      return null;
    }
  }

  buildBalancedPrompt(artistData, dataQuality, isAttribution) {
    let prompt = `작가를 16가지 APT(Art Persona Type) 중 하나로 분류해주세요.

⚠️ 중요: SRMC(체계적 교육자)는 전체의 10% 미만이어야 합니다. 
특히 귀속 작품이나 데이터가 부족한 경우 SRMC를 기본값으로 사용하지 마세요.

16가지 APT 유형과 예상 분포:
- LAEF (몽환적 방랑자): 10-15% - 추상적이고 감정적인 예술가
- LAEC (감성 큐레이터): 5-10% - 추상적이지만 체계적인 수집가
- LAMF (직관적 탐구자): 5-10% - 추상적 의미 탐구자
- LAMC (철학적 수집가): 3-5% - 추상적 철학자
- LREF (고독한 관찰자): 10-15% - 구상적 관찰자
- LREC (섬세한 감정가): 5-10% - 구상적 감성주의자
- LRMF (디지털 탐험가): 3-5% - 구상적 의미 탐구자
- LRMC (학구적 연구자): 5-10% - 구상적 학자
- SAEF (감성 나눔이): 5-10% - 추상적 감정 공유자
- SAEC (예술 네트워커): 3-5% - 추상적 네트워커
- SAMF (영감 전도사): 10-15% - 추상적 의미 전달자
- SAMC (문화 기획자): 5-10% - 추상적 기획자
- SREF (열정적 관람자): 10-15% - 구상적 감정 공유자
- SREC (따뜻한 안내자): 5-10% - 구상적 감성 안내자
- SRMF (지식 멘토): 5-10% - 구상적 의미 전달자
- SRMC (체계적 교육자): 5-10% - 구상적 체계 교육자

작가: ${artistData.actualName || artistData.name}
`;

    // 귀속 작품 특별 처리
    if (isAttribution) {
      prompt += `\n🏷️ 이것은 귀속 작품입니다. 원작가의 스타일을 따르지만 완전히 동일하지는 않습니다.
귀속 작품은 보통 더 접근하기 쉽고 대중적인 성향을 띕니다.\n`;
    }
    
    // 기본 정보
    if (artistData.nationality) prompt += `국적: ${artistData.nationality}\n`;
    if (artistData.era) prompt += `시대: ${artistData.era}\n`;
    if (artistData.birth_year || artistData.death_year) {
      prompt += `생몰: ${artistData.birth_year || '?'} - ${artistData.death_year || '?'}\n`;
    }
    
    // 전기 정보
    if (artistData.bio) {
      prompt += `\n전기:\n${artistData.bio.substring(0, 1000)}\n`;
    }
    
    // 데이터 부족 시 가이드
    if (dataQuality.level === 'low') {
      prompt += `\n⚠️ 데이터가 부족합니다. 다음 원칙을 따라주세요:
1. SRMC를 기본값으로 사용하지 마세요
2. 시대와 국적에서 일반적인 경향을 추론하세요
3. 귀속 작품은 원작가보다 더 대중적/접근하기 쉬운 성향으로 분류하세요
4. 불확실한 경우 중간 성향(L/S, A/R, E/M, F/C 모두 -30~30 사이)으로 평가하세요\n`;
    }
    
    prompt += `
평가 기준:
- L/S축: 혼자 감상(-100) vs 함께 감상(+100)
- A/R축: 추상적(-100) vs 구상적(+100)  
- E/M축: 감정 중심(-100) vs 의미 중심(+100)
- F/C축: 자유로운(-100) vs 체계적(+100)

응답 형식:
L/S: [점수]
A/R: [점수]
E/M: [점수]
F/C: [점수]
APT: [4글자 코드]
분류 근거: [간단한 설명]`;

    return prompt;
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
        L_S: /L\/S:\s*(-?\d+)/i,
        A_R: /A\/R:\s*(-?\d+)/i,
        E_M: /E\/M:\s*(-?\d+)/i,
        F_C: /F\/C:\s*(-?\d+)/i
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

  diversifiedRuleBasedInference(artistData) {
    // SRMC 편향을 피하기 위한 다양한 기본값
    const defaultTypes = [
      'LAEF', 'LREF', 'SAEF', 'SREF', // 감정적 유형들
      'LAMF', 'SAMF', 'LRMF', 'SRMF', // 의미 중심 유형들
      'LAEC', 'LREC', 'SAEC', 'SREC'  // 큐레이터/안내자 유형들
    ];
    
    // 해시 기반으로 일관된 랜덤 선택
    const hash = artistData.name.split('').reduce((a, b) => {
      return ((a << 5) - a) + b.charCodeAt(0);
    }, 0);
    
    const defaultType = defaultTypes[Math.abs(hash) % defaultTypes.length];
    
    return {
      aptType: defaultType,
      axisScores: this.getDefaultScores(defaultType),
      reasoning: '데이터 부족으로 인한 추정'
    };
  }

  getDefaultScores(aptType) {
    const [l_s, a_r, e_m, f_c] = aptType.split('');
    return {
      L_S: l_s === 'L' ? -30 : 30,
      A_R: a_r === 'A' ? -30 : 30,
      E_M: e_m === 'E' ? -30 : 30,
      F_C: f_c === 'F' ? -30 : 30
    };
  }

  formatResult(geminiResult, artistData) {
    const confidence = this.calculateConfidence(geminiResult, artistData);
    
    return {
      aptType: geminiResult.aptType,
      axisScores: geminiResult.axisScores,
      confidence,
      analysis: {
        strategy: 'balanced_gemini_v1',
        actualArtistName: this.extractActualArtistName(artistData.name),
        reasoning: geminiResult.reasoning
      }
    };
  }

  calculateConfidence(result, artistData) {
    let confidence = 50;
    
    // 데이터 품질에 따른 기본 신뢰도
    const dataQuality = this.assessDataQuality(artistData);
    confidence += dataQuality.score * 3;
    
    // 명확한 축 점수
    Object.values(result.axisScores).forEach(score => {
      if (Math.abs(score) > 50) confidence += 5;
    });
    
    // 상세한 근거
    if (result.reasoning && result.reasoning.length > 50) {
      confidence += 10;
    }
    
    return Math.min(95, confidence);
  }
}

module.exports = BalancedGeminiClassifier;