// Enhanced Gemini Classifier - 모든 작가에게 AI 추론 적용
const ArtistAPTInferenceEngine = require('./artistAPTInferenceEngine');
const { GoogleGenerativeAI } = require('@google/generative-ai');

class EnhancedGeminiClassifier {
  constructor() {
    // 규칙 기반 추론 엔진
    this.inferenceEngine = new ArtistAPTInferenceEngine();
    
    // Gemini API
    this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.gemini.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  async classifyArtist(artistData) {
    console.log(`🎨 Enhanced Gemini 분류: ${artistData.name}`);
    
    try {
      // 1. 규칙 기반 추론 (빠른 초기 판단)
      const ruleBasedResult = this.inferenceEngine.inferAPTFromLimitedData(artistData);
      console.log(`   📐 규칙 추론: ${ruleBasedResult.primaryAPT[0]} (${ruleBasedResult.confidence}%)`);
      
      // 2. Gemini AI 추론 (모든 작가에 적용)
      const geminiResult = await this.geminiInference(artistData, ruleBasedResult);
      
      if (geminiResult) {
        console.log(`   🤖 AI 추론: ${geminiResult.aptType}`);
        
        // 3. 두 결과 통합
        return this.integrateResults(ruleBasedResult, geminiResult, artistData);
      }
      
      // Gemini 실패 시 규칙 기반만 사용
      return this.formatResult(ruleBasedResult, 'rule_based_only');
      
    } catch (error) {
      console.error(`❌ 분류 실패: ${error.message}`);
      const fallback = this.inferenceEngine.inferAPTFromLimitedData(artistData);
      return this.formatResult(fallback, 'fallback');
    }
  }

  async geminiInference(artistData, ruleBasedResult) {
    try {
      // Bio가 있든 없든 사용 가능한 모든 정보로 프롬프트 구성
      const prompt = this.buildSmartPrompt(artistData, ruleBasedResult);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseGeminiResponse(text);
      
    } catch (error) {
      console.error('   ⚠️ Gemini 실패:', error.message);
      return null;
    }
  }

  buildSmartPrompt(artistData, ruleBasedResult) {
    // 데이터 품질에 따라 다른 프롬프트 전략
    const hasRichBio = artistData.bio && artistData.bio.length > 500;
    const hasBasicBio = artistData.bio && artistData.bio.length > 0;
    const hasMetadata = artistData.era || artistData.nationality || artistData.birth_year;
    
    let prompt = `작가를 16가지 APT(Art Persona Type) 중 하나로 분류해주세요.\n\n`;
    
    // 기본 정보
    prompt += `작가: ${artistData.name}\n`;
    
    if (artistData.nationality) prompt += `국적: ${artistData.nationality}\n`;
    if (artistData.era) prompt += `시대/사조: ${artistData.era}\n`;
    if (artistData.birth_year || artistData.death_year) {
      prompt += `생몰: ${artistData.birth_year || '?'} - ${artistData.death_year || '현재'}\n`;
    }
    
    // 전기 정보 (있는 경우)
    if (hasRichBio) {
      prompt += `\n전기:\n${artistData.bio.substring(0, 1200)}\n`;
    } else if (hasBasicBio) {
      prompt += `\n전기 (제한적):\n${artistData.bio}\n`;
    }
    
    // 메타데이터만 있는 경우 추론 가이드 제공
    if (!hasBasicBio && hasMetadata) {
      prompt += `\n제한된 정보를 바탕으로 다음을 추론해주세요:\n`;
      
      if (artistData.era) {
        prompt += `- ${artistData.era} 시대 작가들의 일반적인 작업 방식과 감상 경험\n`;
      }
      if (artistData.nationality) {
        prompt += `- ${artistData.nationality} 문화권 예술의 특성\n`;
      }
      if (artistData.birth_year && artistData.death_year) {
        const lifespan = artistData.death_year - artistData.birth_year;
        if (lifespan < 40) {
          prompt += `- 짧은 생애(${lifespan}년)가 작품에 미친 영향\n`;
        } else if (lifespan > 80) {
          prompt += `- 긴 생애(${lifespan}년) 동안의 스타일 변화 가능성\n`;
        }
      }
    }
    
    // 규칙 기반 추론 결과 참고
    prompt += `\n초기 분석: ${ruleBasedResult.primaryAPT[0]} (이유: ${ruleBasedResult.reasoning.join(', ')})\n`;
    
    // 평가 기준
    prompt += `
감상 경험 관점에서 4개 축을 평가해주세요:
- L/S축: 혼자 감상하기 좋은(-100) vs 함께 감상하기 좋은(+100)
- A/R축: 추상적(-100) vs 구상적(+100)
- E/M축: 감정 중심(-100) vs 의미/개념 중심(+100)
- F/C축: 자유로운 감상(-100) vs 체계적 감상(+100)

응답:
L/S: [점수]
A/R: [점수]
E/M: [점수]
F/C: [점수]
APT: [LAEF 같은 4글자]
근거: [추론 근거를 구체적으로]`;

    return prompt;
  }

  parseGeminiResponse(text) {
    try {
      const scores = { L_S: 0, A_R: 0, E_M: 0, F_C: 0 };
      let aptType = null;
      let reasoning = '';
      
      // 점수 추출
      const scorePatterns = {
        L_S: /L\/S:\s*(-?\d+)/i,
        A_R: /A\/R:\s*(-?\d+)/i,
        E_M: /E\/M:\s*(-?\d+)/i,
        F_C: /F\/C:\s*(-?\d+)/i
      };
      
      for (const [axis, pattern] of Object.entries(scorePatterns)) {
        const match = text.match(pattern);
        if (match) scores[axis] = parseInt(match[1]);
      }
      
      // APT 추출
      const aptMatch = text.match(/APT:\s*([LS][AR][EM][FC])/i);
      if (aptMatch) aptType = aptMatch[1].toUpperCase();
      
      // 근거 추출
      const reasonMatch = text.match(/근거:\s*(.+?)(?:\n|$)/i);
      if (reasonMatch) reasoning = reasonMatch[1].trim();
      
      if (!aptType) {
        aptType = this.calculateAPTFromScores(scores);
      }
      
      return { axisScores: scores, aptType, reasoning };
      
    } catch (error) {
      console.error('파싱 오류:', error);
      return null;
    }
  }

  integrateResults(ruleBasedResult, geminiResult, artistData) {
    // 데이터 품질에 따른 가중치 동적 조정
    const bioLength = artistData.bio?.length || 0;
    const hasEra = !!artistData.era;
    const hasNationality = !!artistData.nationality;
    
    let ruleWeight, aiWeight;
    
    if (bioLength > 500) {
      // 풍부한 데이터: AI 중시
      ruleWeight = 0.3;
      aiWeight = 0.7;
    } else if (bioLength > 0 || (hasEra && hasNationality)) {
      // 중간 데이터: 균형
      ruleWeight = 0.4;
      aiWeight = 0.6;
    } else {
      // 빈약한 데이터: AI가 더 나은 추론 가능
      ruleWeight = 0.2;
      aiWeight = 0.8;
    }
    
    // 축 점수 통합
    const integratedScores = {};
    for (const axis of ['L_S', 'A_R', 'E_M', 'F_C']) {
      integratedScores[axis] = Math.round(
        ruleBasedResult.axisScores[axis] * ruleWeight +
        geminiResult.axisScores[axis] * aiWeight
      );
    }
    
    // 최종 APT
    const finalAPT = this.calculateAPTFromScores(integratedScores);
    
    // 신뢰도 계산
    const baseConfidence = 50;
    const dataBonus = Math.min(30, bioLength / 50); // 최대 30점
    const consistencyBonus = (finalAPT === geminiResult.aptType) ? 15 : 0;
    const confidence = Math.min(95, baseConfidence + dataBonus + consistencyBonus);
    
    return {
      aptType: finalAPT,
      axisScores: integratedScores,
      confidence,
      analysis: {
        strategy: 'enhanced_gemini',
        weights: { rule: ruleWeight, ai: aiWeight },
        sources: {
          rule_based: ruleBasedResult.primaryAPT[0],
          gemini: geminiResult.aptType,
          final: finalAPT
        },
        reasoning: {
          rule: ruleBasedResult.reasoning,
          ai: geminiResult.reasoning
        }
      }
    };
  }

  calculateAPTFromScores(scores) {
    return (scores.L_S < 0 ? 'L' : 'S') +
           (scores.A_R < 0 ? 'A' : 'R') +
           (scores.E_M < 0 ? 'E' : 'M') +
           (scores.F_C < 0 ? 'F' : 'C');
  }

  formatResult(result, strategy = 'unknown') {
    return {
      aptType: result.primaryAPT?.[0] || 'UNKNOWN',
      axisScores: result.axisScores || { L_S: 0, A_R: 0, E_M: 0, F_C: 0 },
      confidence: result.confidence || 50,
      analysis: {
        strategy,
        ...result.analysis
      }
    };
  }
}

module.exports = EnhancedGeminiClassifier;