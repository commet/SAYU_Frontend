// Data Enriched Classifier - 외부 데이터 소스 정보를 활용한 분류

const { GoogleGenerativeAI } = require('@google/generative-ai');

class DataEnrichedClassifier {
  constructor() {
    this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.gemini.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  async classifyArtist(artistData) {
    console.log(`\n🎨 데이터 보강 분류: ${artistData.name}`);
    
    try {
      const actualArtistName = this.extractActualArtistName(artistData.name);
      const isAttribution = artistData.name !== actualArtistName;
      
      // 작가 유형 파악
      const artistType = this.categorizeArtist(artistData);
      console.log(`   📋 유형: ${artistType}`);
      
      // Gemini 분석 (외부 소스 참조 요청)
      const result = await this.analyzeWithEnrichedContext(
        { ...artistData, actualName: actualArtistName, isAttribution },
        artistType
      );
      
      if (result && result.aptType) {
        return this.formatResult(result, artistData);
      }
      
      // 폴백: 유형별 합리적 추론
      return this.intelligentFallback(artistData, artistType);
      
    } catch (error) {
      console.error(`   ❌ 오류: ${error.message}`);
      throw error;
    }
  }

  categorizeArtist(artistData) {
    const name = artistData.name.toLowerCase();
    
    // 고대 그리스/로마
    if (name.includes('greek') || name.includes('athens') || name.includes('etruscan')) {
      return 'ancient_greek';
    }
    
    // 귀속 작품
    if (name.match(/attributed|after|follower|workshop|circle|school|manner/i)) {
      return 'attribution';
    }
    
    // 시대별 분류
    if (artistData.era) {
      const era = artistData.era.toLowerCase();
      if (era.includes('renaissance')) return 'renaissance';
      if (era.includes('baroque')) return 'baroque';
      if (era.includes('impressionis')) return 'impressionist';
      if (era.includes('modern') || era.includes('contemporary')) return 'modern';
      if (era.includes('romantic')) return 'romantic';
      if (era.includes('neoclassic')) return 'neoclassical';
    }
    
    // 국적별 (시대 정보 없을 때)
    if (artistData.nationality) {
      if (artistData.birth_year && artistData.birth_year < 1800) return 'old_master';
      if (artistData.birth_year && artistData.birth_year > 1900) return 'modern';
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

  async analyzeWithEnrichedContext(artistData, artistType) {
    try {
      const prompt = this.buildEnrichedPrompt(artistData, artistType);
      
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

  buildEnrichedPrompt(artistData, artistType) {
    let prompt = `작가를 16가지 APT 중 하나로 분류해주세요.

작가: ${artistData.actualName || artistData.name}
${artistData.isAttribution ? '⚠️ 귀속 작품' : ''}

제공된 정보:
- 국적: ${artistData.nationality || '불명'}
- 시대: ${artistData.era || '불명'}
- 생몰: ${artistData.birth_year || '?'} - ${artistData.death_year || '?'}
${artistData.bio ? `- 전기: ${artistData.bio}` : ''}

참고할 외부 정보원:
- Artnet.com의 작가 프로필과 경매 기록
- Metropolitan Museum의 Timeline of Art History
- ArtFacts.net의 전시 이력
- 일반적인 미술사 지식

`;

    // 유형별 추가 맥락
    const contextMap = {
      'ancient_greek': `
고대 그리스 도자기 화가들의 일반적 특성:
- 주로 신화나 일상생활 묘사 (R: 구상적)
- 공방 시스템으로 작업 (S: 사회적 경향 있음)
- 장식적이면서도 서사적 (E/M: 균형)
- 정형화된 양식 따름 (C: 체계적 경향)`,
      
      'renaissance': `
르네상스 작가들의 일반적 특성:
- 고전 미술 부활, 사실주의 추구 (R: 구상적)
- 후원자 시스템 (S/L: 중간)
- 인문주의 영향 (M: 의미 중심 경향)
- 수학적 원근법 등 체계적 접근 (C: 체계적)`,
      
      'baroque': `
바로크 작가들의 일반적 특성:
- 극적이고 감정적 표현 (E: 감정적)
- 종교적/왕실 후원 (S: 사회적 경향)
- 빛과 그림자의 대비 (R: 구상적)
- 화려하고 장식적 (F/C: 중간)`,
      
      'impressionist': `
인상주의 작가들의 일반적 특성:
- 순간의 빛과 색채 포착 (E: 감정적)
- 야외 작업, 개인적 관찰 (L: 개인적 경향)
- 형태의 해체 시작 (A/R: 중간)
- 전통 거부, 자유로운 붓터치 (F: 자유로운)`,
      
      'modern': `
현대/컨템포러리 작가들의 일반적 특성:
- 다양한 매체와 개념 실험 (다양함)
- 개인 작가의 독특한 스타일 중시
- 전통적 구분 해체
- 각 작가별로 매우 다른 접근`,
      
      'attribution': `
귀속 작품의 일반적 특성:
- 원작가보다 대중적/상업적 경향
- 기술적 완성도는 다를 수 있음
- 주로 인기 있는 주제/스타일 반복
- 접근성 높은 작품 제작 경향`
    };
    
    if (contextMap[artistType]) {
      prompt += contextMap[artistType];
    }
    
    prompt += `

평가 지침:
1. 정보가 제한적이어도 시대/국적/유형에서 일반적 경향 추론
2. SRMC는 정말 교육적/체계적 특성이 명확할 때만
3. 불확실한 축은 중간값 사용 (-30 ~ +30)
4. 극단값은 확실한 근거가 있을 때만

평가:
L/S: [점수] (근거)
A/R: [점수] (근거)
E/M: [점수] (근거)
F/C: [점수] (근거)
APT: [4글자]
분류 근거: [종합적 설명]`;

    return prompt;
  }

  parseResponse(text) {
    try {
      const result = {
        axisScores: { L_S: 0, A_R: 0, E_M: 0, F_C: 0 },
        aptType: null,
        reasoning: ''
      };
      
      // 축 점수 추출 - 다양한 형식 지원
      const patterns = {
        L_S: /(?:\*\*)?L\/S:?\*?\*?\s*([+-]?\d+)/i,
        A_R: /(?:\*\*)?A\/R:?\*?\*?\s*([+-]?\d+)/i,
        E_M: /(?:\*\*)?E\/M:?\*?\*?\s*([+-]?\d+)/i,
        F_C: /(?:\*\*)?F\/C:?\*?\*?\s*([+-]?\d+)/i
      };
      
      for (const [axis, pattern] of Object.entries(patterns)) {
        const match = text.match(pattern);
        if (match) {
          result.axisScores[axis] = parseInt(match[1]);
          console.log(`   파싱된 ${axis}: ${match[1]}`);
        }
      }
      
      // APT 추출
      const aptMatch = text.match(/APT:\s*([LS][AR][EM][FC])/i);
      if (aptMatch) {
        result.aptType = aptMatch[1].toUpperCase();
      } else {
        result.aptType = this.calculateAPT(result.axisScores);
      }
      
      // 분류 근거 - 더 유연한 패턴
      const reasonMatch = text.match(/(?:분류 근거|근거|reasoning):\s*(.+?)$/ims);
      if (reasonMatch) {
        result.reasoning = reasonMatch[1].trim();
      } else {
        // ** 로 시작하는 설명 찾기
        const altReasonMatch = text.match(/\*\*\s*([^*]+?)\*\*/s);
        if (altReasonMatch) {
          result.reasoning = altReasonMatch[1].trim();
        }
      }
      
      console.log(`   최종 점수: L/S=${result.axisScores.L_S}, A/R=${result.axisScores.A_R}, E/M=${result.axisScores.E_M}, F/C=${result.axisScores.F_C}`);
      console.log(`   계산된 APT: ${result.aptType}`);
      
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

  intelligentFallback(artistData, artistType) {
    // 유형별 합리적 기본값 - 다양한 APT 분포
    const typeDefaults = {
      'ancient_greek': { L_S: 30, A_R: 70, E_M: 40, F_C: 60 }, // SRMC
      'renaissance': { L_S: -10, A_R: 80, E_M: 20, F_C: 70 }, // LRMC
      'baroque': { L_S: 40, A_R: 85, E_M: -60, F_C: 50 }, // SREC
      'impressionist': { L_S: -30, A_R: -20, E_M: -70, F_C: -50 }, // LAEF
      'modern': { L_S: -40, A_R: -60, E_M: -30, F_C: -40 }, // LAEF
      'attribution': { L_S: 60, A_R: 70, E_M: -30, F_C: 40 }, // SREC
      'old_master': { L_S: 10, A_R: 90, E_M: 30, F_C: 80 }, // SRMC
      'romantic': { L_S: -20, A_R: 40, E_M: -80, F_C: -30 }, // LREF
      'neoclassical': { L_S: 20, A_R: 85, E_M: 60, F_C: 90 }, // SRMC
      'unknown': { L_S: -10, A_R: 30, E_M: -20, F_C: 10 } // LREC
    };
    
    const scores = typeDefaults[artistType] || typeDefaults['unknown'];
    const aptType = this.calculateAPT(scores);
    
    return {
      aptType: aptType,
      axisScores: scores,
      confidence: 45,
      analysis: {
        strategy: 'intelligent_fallback',
        actualArtistName: this.extractActualArtistName(artistData.name),
        reasoning: `${artistType} 유형의 일반적 특성 기반 추론`
      }
    };
  }

  formatResult(geminiResult, artistData) {
    const confidence = this.calculateConfidence(geminiResult, artistData);
    
    return {
      aptType: geminiResult.aptType,
      axisScores: geminiResult.axisScores,
      confidence,
      analysis: {
        strategy: 'data_enriched_v1',
        actualArtistName: this.extractActualArtistName(artistData.name),
        reasoning: geminiResult.reasoning
      }
    };
  }

  calculateConfidence(result, artistData) {
    let confidence = 40;
    
    // 데이터 품질
    if (artistData.bio && artistData.bio.length > 100) confidence += 20;
    if (artistData.nationality) confidence += 10;
    if (artistData.era) confidence += 10;
    if (artistData.birth_year) confidence += 5;
    
    // 구체적 근거
    if (result.reasoning && result.reasoning.length > 100) confidence += 15;
    
    return Math.min(90, confidence);
  }
}

module.exports = DataEnrichedClassifier;