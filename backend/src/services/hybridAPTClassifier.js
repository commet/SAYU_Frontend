// Hybrid APT Classifier - 추론 엔진 + AI API 결합
const ArtistAPTInferenceEngine = require('./artistAPTInferenceEngine');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');

class HybridAPTClassifier {
  constructor() {
    // 추론 엔진
    this.inferenceEngine = new ArtistAPTInferenceEngine();
    
    // AI API 클라이언트
    this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    // 하이브리드 전략 설정
    this.strategy = {
      // 데이터 풍부도에 따른 전략
      richData: 'full_ai_analysis',      // 1000자+ bio
      mediumData: 'hybrid_analysis',     // 100-1000자 bio  
      limitedData: 'inference_with_ai',  // 1-100자 bio
      noData: 'pure_inference'           // bio 없음
    };
    
    // APT 축 정의
    this.axisDefinitions = {
      L_S: {
        name: '혼자 vs 함께',
        L: '독립적, 은둔적, 개인 작업실, 내향적',
        S: '협업, 그룹 활동, 사회적, 외향적'
      },
      A_R: {
        name: '추상 vs 구상',
        A: '비구상, 개념적, 형태 해체, 색채 중심',
        R: '사실주의, 구체적 묘사, 인물/풍경/정물'
      },
      E_M: {
        name: '감정 vs 의미',
        E: '직관적, 열정적, 감성적, 개인적 경험',
        M: '지적, 철학적, 개념 중심, 사회 비평'
      },
      F_C: {
        name: '자유 vs 체계',
        F: '실험적, 규칙 파괴, 즉흥적, 혁신적',
        C: '전통적, 기법 중시, 계획적, 정교한'
      }
    };
  }

  // 메인 분류 함수
  async classifyArtist(artistData) {
    console.log(`🎨 하이브리드 분류 시작: ${artistData.name}`);
    
    try {
      // 1. 데이터 풍부도 평가
      const dataRichness = this.evaluateDataRichness(artistData);
      console.log(`📊 데이터 풍부도: ${dataRichness.level} (${dataRichness.score}점)`);
      
      // 2. 전략 선택
      const strategy = this.strategy[dataRichness.level];
      console.log(`🎯 선택된 전략: ${strategy}`);
      
      // 3. 전략별 분석 실행
      let result;
      switch (strategy) {
        case 'full_ai_analysis':
          result = await this.fullAIAnalysis(artistData);
          break;
        case 'hybrid_analysis':
          result = await this.hybridAnalysis(artistData);
          break;
        case 'inference_with_ai':
          result = await this.inferenceWithAISupport(artistData);
          break;
        case 'pure_inference':
          result = await this.pureInferenceAnalysis(artistData);
          break;
      }
      
      // 4. 결과 검증 및 정제
      result = await this.validateAndRefine(result, artistData);
      
      // 5. 신뢰도 재계산
      result.confidence = this.calculateFinalConfidence(result, dataRichness);
      
      return result;
      
    } catch (error) {
      console.error(`❌ 분류 실패: ${error.message}`);
      // 실패 시 순수 추론으로 폴백
      return await this.pureInferenceAnalysis(artistData);
    }
  }

  // 데이터 풍부도 평가
  evaluateDataRichness(artistData) {
    let score = 0;
    let factors = [];
    
    // Bio 길이 (최대 40점)
    if (artistData.bio) {
      const bioLength = artistData.bio.length;
      if (bioLength >= 1000) {
        score += 40;
        factors.push('풍부한 전기');
      } else if (bioLength >= 500) {
        score += 30;
        factors.push('중간 전기');
      } else if (bioLength >= 100) {
        score += 20;
        factors.push('짧은 전기');
      } else {
        score += 10;
        factors.push('매우 짧은 전기');
      }
    }
    
    // 작품 데이터 (최대 20점)
    if (artistData.artwork_count) {
      if (artistData.artwork_count >= 20) {
        score += 20;
        factors.push('많은 작품');
      } else if (artistData.artwork_count >= 10) {
        score += 15;
        factors.push('적당한 작품');
      } else if (artistData.artwork_count > 0) {
        score += 10;
        factors.push('소수 작품');
      }
    }
    
    // 기본 정보 (각 10점)
    if (artistData.birth_year) {
      score += 10;
      factors.push('생년');
    }
    if (artistData.nationality) {
      score += 10;
      factors.push('국적');
    }
    if (artistData.era) {
      score += 10;
      factors.push('시대');
    }
    if (artistData.medium) {
      score += 10;
      factors.push('매체');
    }
    
    // 레벨 결정
    let level;
    if (score >= 70) level = 'richData';
    else if (score >= 40) level = 'mediumData';
    else if (score >= 20) level = 'limitedData';
    else level = 'noData';
    
    return { score, level, factors };
  }

  // 전략 1: 풍부한 데이터 - AI 전체 분석
  async fullAIAnalysis(artistData) {
    console.log('🤖 AI 전체 분석 시작...');
    
    // 1. 추론 엔진으로 초기 분석
    const inferenceResult = this.inferenceEngine.inferAPTFromLimitedData(artistData);
    
    // 2. OpenAI로 심층 분석
    const openAIResult = await this.analyzeWithOpenAI(artistData, inferenceResult);
    
    // 3. Gemini로 교차 검증
    const geminiResult = await this.analyzeWithGemini(artistData, inferenceResult);
    
    // 4. 결과 통합
    return this.mergeAnalysisResults({
      inference: inferenceResult,
      openai: openAIResult,
      gemini: geminiResult
    }, 'full');
  }

  // 전략 2: 중간 데이터 - 하이브리드 분석
  async hybridAnalysis(artistData) {
    console.log('🔀 하이브리드 분석 시작...');
    
    // 1. 추론 엔진으로 기본 분석
    const inferenceResult = this.inferenceEngine.inferAPTFromLimitedData(artistData);
    
    // 2. 가장 불확실한 축에 대해서만 AI 검증
    const uncertainAxes = this.findUncertainAxes(inferenceResult.axisScores);
    
    // 3. Gemini로 불확실한 축 검증 (무료 API 활용)
    const aiValidation = await this.validateAxesWithGemini(artistData, uncertainAxes);
    
    // 4. 결과 병합
    return this.mergeHybridResults(inferenceResult, aiValidation);
  }

  // 전략 3: 제한된 데이터 - 추론 + AI 보조
  async inferenceWithAISupport(artistData) {
    console.log('🔍 AI 보조 추론 시작...');
    
    // 1. 추론 엔진 실행
    const inferenceResult = this.inferenceEngine.inferAPTFromLimitedData(artistData);
    
    // 2. 추론 결과를 AI에게 검증 요청 (간단한 프롬프트)
    const validation = await this.quickValidateWithGemini(inferenceResult, artistData);
    
    // 3. 검증 결과 반영
    if (validation.isValid) {
      inferenceResult.confidence += 10;
      inferenceResult.aiValidation = validation.reason;
    } else {
      inferenceResult.confidence -= 10;
      inferenceResult.warnings = validation.concerns;
    }
    
    return inferenceResult;
  }

  // 전략 4: 데이터 없음 - 순수 추론
  async pureInferenceAnalysis(artistData) {
    console.log('🧠 순수 추론 분석...');
    
    const result = this.inferenceEngine.inferAPTFromLimitedData(artistData);
    result.analysisType = 'pure_inference';
    result.warning = '제한된 데이터로 인한 추론 기반 분류';
    
    return result;
  }

  // OpenAI 분석 (GPT-4)
  async analyzeWithOpenAI(artistData, initialInference) {
    try {
      const prompt = `
작가 정보를 바탕으로 SAYU APT(Art Persona Type) 분류를 수행해주세요.

작가: ${artistData.name}
전기: ${artistData.bio?.substring(0, 1500) || '정보 없음'}
국적: ${artistData.nationality || '알 수 없음'}
시대: ${artistData.era || '알 수 없음'}
생몰: ${artistData.birth_year || '?'} - ${artistData.death_year || '현재'}
작품 수: ${artistData.artwork_count || 0}개

초기 추론: ${initialInference.primaryAPT[0]} (신뢰도: ${initialInference.confidence}%)

4개 축을 -100에서 +100 사이로 평가하고, 감상 경험 관점에서 분석해주세요:
1. L/S축: 혼자(-100) vs 함께(+100) 감상하기 좋은 작품인가?
2. A/R축: 추상(-100) vs 구상(+100) 
3. E/M축: 감정(-100) vs 의미(+100) 중심의 감상
4. F/C축: 자유로운(-100) vs 체계적인(+100) 감상 방식

JSON 형식으로 응답:
{
  "axisScores": { "L_S": 0, "A_R": 0, "E_M": 0, "F_C": 0 },
  "aptType": "XXXX",
  "viewingExperience": "감상 경험 설명",
  "reasoning": "분류 근거"
}`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 1000,
        temperature: 0.3
      });

      return JSON.parse(response.choices[0].message.content);
      
    } catch (error) {
      console.error('OpenAI 분석 실패:', error.message);
      return null;
    }
  }

  // Gemini 분석
  async analyzeWithGemini(artistData, initialInference) {
    try {
      const model = this.gemini.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `
작가의 APT(Art Persona Type) 분류를 도와주세요.

작가: ${artistData.name}
정보: ${this.summarizeArtistData(artistData)}

현재 추론: ${initialInference.primaryAPT[0]}

다음 4개 축을 평가해주세요:
- L/S: 혼자 감상(-) vs 함께 감상(+)
- A/R: 추상적(-) vs 구상적(+)
- E/M: 감정적(-) vs 의미중심(+)
- F/C: 자유로운(-) vs 체계적(+)

각 축의 점수(-100~+100)와 최종 APT 코드(예: LAEF)를 제시해주세요.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // 텍스트 응답 파싱
      return this.parseGeminiResponse(text);
      
    } catch (error) {
      console.error('Gemini 분석 실패:', error.message);
      return null;
    }
  }

  // Gemini 응답 파싱
  parseGeminiResponse(text) {
    const scores = {
      L_S: 0,
      A_R: 0,
      E_M: 0,
      F_C: 0
    };
    
    // 점수 추출 정규식
    const scorePatterns = {
      L_S: /L\/S[:\s]+(-?\d+)/i,
      A_R: /A\/R[:\s]+(-?\d+)/i,
      E_M: /E\/M[:\s]+(-?\d+)/i,
      F_C: /F\/C[:\s]+(-?\d+)/i
    };
    
    for (const [axis, pattern] of Object.entries(scorePatterns)) {
      const match = text.match(pattern);
      if (match) {
        scores[axis] = parseInt(match[1]);
      }
    }
    
    // APT 코드 추출
    const aptMatch = text.match(/\b([LS][AR][EM][FC])\b/);
    const aptType = aptMatch ? aptMatch[1] : this.calculateAPTFromScores(scores);
    
    return {
      axisScores: scores,
      aptType,
      rawResponse: text
    };
  }

  // 축 점수로부터 APT 계산
  calculateAPTFromScores(scores) {
    let apt = '';
    apt += scores.L_S < 0 ? 'L' : 'S';
    apt += scores.A_R < 0 ? 'A' : 'R';
    apt += scores.E_M < 0 ? 'E' : 'M';
    apt += scores.F_C < 0 ? 'F' : 'C';
    return apt;
  }

  // 불확실한 축 찾기
  findUncertainAxes(axisScores) {
    const uncertain = [];
    
    for (const [axis, score] of Object.entries(axisScores)) {
      if (Math.abs(score) < 30) {
        uncertain.push({
          axis,
          score,
          uncertainty: 30 - Math.abs(score)
        });
      }
    }
    
    return uncertain.sort((a, b) => b.uncertainty - a.uncertainty);
  }

  // Gemini로 특정 축 검증
  async validateAxesWithGemini(artistData, uncertainAxes) {
    if (uncertainAxes.length === 0) return null;
    
    try {
      const model = this.gemini.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const axisQuestions = uncertainAxes.map(item => {
        const def = this.axisDefinitions[item.axis];
        return `${item.axis}: ${def.name} - 현재 점수 ${item.score}가 적절한가요?`;
      }).join('\n');
      
      const prompt = `
작가 ${artistData.name}의 다음 특성들이 맞는지 검증해주세요:

${axisQuestions}

작가 정보:
${this.summarizeArtistData(artistData)}

각 축에 대해 더 정확한 점수를 제시해주세요.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      return this.parseGeminiResponse(response.text());
      
    } catch (error) {
      console.error('축 검증 실패:', error.message);
      return null;
    }
  }

  // 빠른 검증 (Gemini)
  async quickValidateWithGemini(inferenceResult, artistData) {
    try {
      const model = this.gemini.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `
작가 ${artistData.name}을 ${inferenceResult.primaryAPT[0]} 유형으로 분류했습니다.
이것이 적절한 분류인지 간단히 평가해주세요.

알려진 정보: ${this.summarizeArtistData(artistData)}

답변 형식:
- 적절함/부적절함
- 이유 (한 문장)
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const isValid = text.includes('적절함') && !text.includes('부적절함');
      
      return {
        isValid,
        reason: text.trim()
      };
      
    } catch (error) {
      console.error('빠른 검증 실패:', error.message);
      return { isValid: true, reason: 'AI 검증 실패, 추론 결과 유지' };
    }
  }

  // 결과 병합 (전체 분석)
  mergeAnalysisResults(results, strategy) {
    const { inference, openai, gemini } = results;
    
    // 축 점수 평균 계산
    const mergedScores = { L_S: 0, A_R: 0, E_M: 0, F_C: 0 };
    let validResults = 0;
    
    if (inference?.axisScores) {
      for (const axis in mergedScores) {
        mergedScores[axis] += inference.axisScores[axis] * 0.3; // 30% 가중치
      }
      validResults++;
    }
    
    if (openai?.axisScores) {
      for (const axis in mergedScores) {
        mergedScores[axis] += openai.axisScores[axis] * 0.4; // 40% 가중치
      }
      validResults++;
    }
    
    if (gemini?.axisScores) {
      for (const axis in mergedScores) {
        mergedScores[axis] += gemini.axisScores[axis] * 0.3; // 30% 가중치
      }
      validResults++;
    }
    
    // APT 타입 결정
    const finalAPT = this.calculateAPTFromScores(mergedScores);
    
    // 종합 결과
    return {
      aptType: finalAPT,
      axisScores: mergedScores,
      primaryAPT: [finalAPT],
      secondaryAPT: this.findSecondaryAPTs(mergedScores),
      confidence: 70 + (validResults * 10),
      analysis: {
        strategy,
        sources: {
          inference: inference?.primaryAPT[0],
          openai: openai?.aptType,
          gemini: gemini?.aptType
        },
        reasoning: [
          inference?.reasoning,
          openai?.reasoning,
          gemini?.rawResponse
        ].filter(Boolean)
      },
      viewingExperience: openai?.viewingExperience || inference?.viewingExperience
    };
  }

  // 하이브리드 결과 병합
  mergeHybridResults(inferenceResult, aiValidation) {
    if (!aiValidation) return inferenceResult;
    
    // AI 검증된 축 점수 업데이트
    const updatedScores = { ...inferenceResult.axisScores };
    
    if (aiValidation.axisScores) {
      for (const [axis, score] of Object.entries(aiValidation.axisScores)) {
        if (score !== 0) {
          // 원래 점수와 AI 점수의 가중 평균
          updatedScores[axis] = (updatedScores[axis] * 0.6) + (score * 0.4);
        }
      }
    }
    
    // 새로운 APT 계산
    const newAPT = this.calculateAPTFromScores(updatedScores);
    
    return {
      ...inferenceResult,
      aptType: newAPT,
      primaryAPT: [newAPT],
      axisScores: updatedScores,
      confidence: inferenceResult.confidence + 15,
      aiValidation: 'Gemini 검증 완료'
    };
  }

  // 보조 APT 찾기
  findSecondaryAPTs(axisScores) {
    const secondary = [];
    
    // 각 축에서 점수가 애매한 경우 대안 생성
    for (const [axis, score] of Object.entries(axisScores)) {
      if (Math.abs(score) < 30) {
        // 현재 APT의 해당 축 문자를 반대로
        const current = this.calculateAPTFromScores(axisScores);
        const alternative = { ...axisScores };
        alternative[axis] = -score;
        const altAPT = this.calculateAPTFromScores(alternative);
        if (altAPT !== current) {
          secondary.push(altAPT);
        }
      }
    }
    
    return [...new Set(secondary)].slice(0, 3);
  }

  // 작가 데이터 요약
  summarizeArtistData(artistData) {
    const parts = [];
    
    if (artistData.nationality) parts.push(`국적: ${artistData.nationality}`);
    if (artistData.era) parts.push(`시대: ${artistData.era}`);
    if (artistData.birth_year) {
      parts.push(`생몰: ${artistData.birth_year}-${artistData.death_year || '현재'}`);
    }
    if (artistData.medium) parts.push(`매체: ${artistData.medium}`);
    if (artistData.bio) {
      parts.push(`소개: ${artistData.bio.substring(0, 200)}...`);
    }
    
    return parts.join(', ');
  }

  // 결과 검증 및 정제
  async validateAndRefine(result, artistData) {
    // APT 타입 유효성 검증
    const validTypes = ['LAEF', 'LAEC', 'LAMF', 'LAMC', 'LREF', 'LREC', 'LRMF', 'LRMC',
                        'SAEF', 'SAEC', 'SAMF', 'SAMC', 'SREF', 'SREC', 'SRMF', 'SRMC'];
    
    if (!validTypes.includes(result.aptType)) {
      console.warn(`⚠️ 잘못된 APT 타입: ${result.aptType}`);
      result.aptType = result.primaryAPT[0] || 'UNKNOWN';
    }
    
    // 축 점수 정규화
    for (const axis in result.axisScores) {
      result.axisScores[axis] = Math.max(-100, Math.min(100, result.axisScores[axis]));
    }
    
    return result;
  }

  // 최종 신뢰도 계산
  calculateFinalConfidence(result, dataRichness) {
    let confidence = result.confidence || 50;
    
    // 데이터 풍부도 반영
    confidence += (dataRichness.score / 100) * 20;
    
    // AI 소스 개수 반영
    if (result.analysis?.sources) {
      const aiSources = Object.values(result.analysis.sources).filter(Boolean).length;
      confidence += aiSources * 5;
    }
    
    // 축 점수 명확성 반영
    let clarity = 0;
    for (const score of Object.values(result.axisScores)) {
      if (Math.abs(score) > 50) clarity++;
    }
    confidence += clarity * 2.5;
    
    return Math.min(95, Math.round(confidence));
  }
}

module.exports = HybridAPTClassifier;