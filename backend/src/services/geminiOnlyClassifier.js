// Gemini-Only APT Classifier
// OpenAI API 할당량 문제로 Gemini API만 사용하는 버전

const ArtistAPTInferenceEngine = require('./artistAPTInferenceEngine');
const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiOnlyClassifier {
  constructor() {
    // 추론 엔진
    this.inferenceEngine = new ArtistAPTInferenceEngine();
    
    // Gemini API 클라이언트
    this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.gemini.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // APT 정보
    this.aptTypes = {
      'LAEF': { title: '몽환적 방랑자', desc: '혼자서 추상 작품을 감정적으로 자유롭게' },
      'LAEC': { title: '감성 큐레이터', desc: '혼자서 추상 작품을 감정적으로 체계적으로' },
      'LAMF': { title: '직관적 탐구자', desc: '혼자서 추상 작품의 의미를 자유롭게' },
      'LAMC': { title: '철학적 수집가', desc: '혼자서 추상 작품의 의미를 체계적으로' },
      'LREF': { title: '고독한 관찰자', desc: '혼자서 구상 작품을 감정적으로 자유롭게' },
      'LREC': { title: '섬세한 감정가', desc: '혼자서 구상 작품을 감정적으로 체계적으로' },
      'LRMF': { title: '디지털 탐험가', desc: '혼자서 구상 작품의 의미를 자유롭게' },
      'LRMC': { title: '학구적 연구자', desc: '혼자서 구상 작품의 의미를 체계적으로' },
      'SAEF': { title: '감성 나눔이', desc: '함께 추상 작품의 감정을 자유롭게' },
      'SAEC': { title: '예술 네트워커', desc: '함께 추상 작품의 감정을 체계적으로' },
      'SAMF': { title: '영감 전도사', desc: '함께 추상 작품의 의미를 자유롭게' },
      'SAMC': { title: '문화 기획자', desc: '함께 추상 작품의 의미를 체계적으로' },
      'SREF': { title: '열정적 관람자', desc: '함께 구상 작품을 감정적으로 자유롭게' },
      'SREC': { title: '따뜻한 안내자', desc: '함께 구상 작품을 감정적으로 체계적으로' },
      'SRMF': { title: '지식 멘토', desc: '함께 구상 작품의 의미를 자유롭게' },
      'SRMC': { title: '체계적 교육자', desc: '함께 구상 작품의 의미를 체계적으로' }
    };
  }

  // 메인 분류 함수
  async classifyArtist(artistData) {
    console.log(`🎨 Gemini 분류 시작: ${artistData.name}`);
    
    try {
      // 1. 추론 엔진으로 초기 분석
      const inferenceResult = this.inferenceEngine.inferAPTFromLimitedData(artistData);
      console.log(`   📊 추론 결과: ${inferenceResult.primaryAPT[0]} (신뢰도: ${inferenceResult.confidence}%)`);
      
      // 2. 데이터가 충분하면 Gemini로 검증/강화
      if (artistData.bio && artistData.bio.length > 100) {
        const geminiResult = await this.analyzeWithGemini(artistData, inferenceResult);
        
        if (geminiResult) {
          // Gemini 결과와 추론 결과 병합
          return this.mergeResults(inferenceResult, geminiResult);
        }
      }
      
      // 3. Gemini 실패 시 추론 결과 반환
      return this.formatResult(inferenceResult);
      
    } catch (error) {
      console.error(`❌ 분류 실패: ${error.message}`);
      // 모든 실패 시 기본 추론 반환
      const fallback = this.inferenceEngine.inferAPTFromLimitedData(artistData);
      return this.formatResult(fallback);
    }
  }

  // Gemini 분석
  async analyzeWithGemini(artistData, inferenceResult) {
    try {
      const prompt = `
다음 작가를 16가지 APT(Art Persona Type) 중 하나로 분류해주세요.

작가: ${artistData.name}
국적: ${artistData.nationality || '알 수 없음'}
시대: ${artistData.era || '알 수 없음'}
생몰: ${artistData.birth_year || '?'} - ${artistData.death_year || '현재'}

전기 (일부):
${artistData.bio?.substring(0, 1000) || '정보 없음'}

현재 추론: ${inferenceResult.primaryAPT[0]} - ${this.aptTypes[inferenceResult.primaryAPT[0]]?.desc || ''}

다음 4개 축에 대해 점수를 매겨주세요 (-100 ~ +100):
1. L/S축: 혼자 감상(-100) vs 함께 감상(+100)
2. A/R축: 추상적(-100) vs 구상적(+100)  
3. E/M축: 감정적(-100) vs 의미중심(+100)
4. F/C축: 자유로운(-100) vs 체계적(+100)

응답 형식:
L/S: [점수]
A/R: [점수]  
E/M: [점수]
F/C: [점수]
APT: [4글자 코드]
이유: [한 문장 설명]`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseGeminiResponse(text);
      
    } catch (error) {
      console.error('   ⚠️ Gemini 분석 실패:', error.message);
      return null;
    }
  }

  // Gemini 응답 파싱
  parseGeminiResponse(text) {
    try {
      const lines = text.split('\n');
      const scores = { L_S: 0, A_R: 0, E_M: 0, F_C: 0 };
      let aptType = null;
      let reasoning = '';
      
      for (const line of lines) {
        // 축 점수 추출
        if (line.includes('L/S:')) {
          const match = line.match(/L\/S:\s*(-?\d+)/);
          if (match) scores.L_S = parseInt(match[1]);
        } else if (line.includes('A/R:')) {
          const match = line.match(/A\/R:\s*(-?\d+)/);
          if (match) scores.A_R = parseInt(match[1]);
        } else if (line.includes('E/M:')) {
          const match = line.match(/E\/M:\s*(-?\d+)/);
          if (match) scores.E_M = parseInt(match[1]);
        } else if (line.includes('F/C:')) {
          const match = line.match(/F\/C:\s*(-?\d+)/);
          if (match) scores.F_C = parseInt(match[1]);
        }
        
        // APT 코드 추출
        if (line.includes('APT:')) {
          const match = line.match(/APT:\s*([LSAR][AREF][EMFC])/);
          if (match) aptType = match[1];
        }
        
        // 이유 추출
        if (line.includes('이유:')) {
          reasoning = line.split('이유:')[1].trim();
        }
      }
      
      // APT가 없으면 점수로 계산
      if (!aptType) {
        aptType = this.calculateAPTFromScores(scores);
      }
      
      return {
        axisScores: scores,
        aptType,
        reasoning,
        source: 'gemini'
      };
      
    } catch (error) {
      console.error('   ⚠️ 응답 파싱 실패:', error.message);
      return null;
    }
  }

  // 축 점수로 APT 계산
  calculateAPTFromScores(scores) {
    let apt = '';
    apt += scores.L_S < 0 ? 'L' : 'S';
    apt += scores.A_R < 0 ? 'A' : 'R';
    apt += scores.E_M < 0 ? 'E' : 'M';
    apt += scores.F_C < 0 ? 'F' : 'C';
    return apt;
  }

  // 결과 병합
  mergeResults(inferenceResult, geminiResult) {
    // 가중 평균으로 축 점수 계산
    const mergedScores = {};
    const inferenceWeight = 0.4;
    const geminiWeight = 0.6;
    
    for (const axis of ['L_S', 'A_R', 'E_M', 'F_C']) {
      mergedScores[axis] = Math.round(
        (inferenceResult.axisScores[axis] * inferenceWeight) +
        (geminiResult.axisScores[axis] * geminiWeight)
      );
    }
    
    // 최종 APT 결정
    const finalAPT = this.calculateAPTFromScores(mergedScores);
    
    // 신뢰도 계산
    const baseConfidence = inferenceResult.confidence;
    const geminiBoost = 20;
    const consistency = finalAPT === inferenceResult.primaryAPT[0] ? 10 : 0;
    const confidence = Math.min(95, baseConfidence + geminiBoost + consistency);
    
    return {
      aptType: finalAPT,
      axisScores: mergedScores,
      primaryAPT: [finalAPT],
      secondaryAPT: this.findSecondaryAPTs(mergedScores),
      confidence,
      analysis: {
        strategy: 'gemini_enhanced',
        sources: {
          inference: inferenceResult.primaryAPT[0],
          gemini: geminiResult.aptType
        },
        reasoning: [
          ...inferenceResult.reasoning,
          geminiResult.reasoning
        ].filter(Boolean)
      },
      viewingExperience: inferenceResult.viewingExperience
    };
  }

  // 추론 결과 포맷
  formatResult(inferenceResult) {
    return {
      aptType: inferenceResult.primaryAPT[0],
      axisScores: inferenceResult.axisScores,
      primaryAPT: inferenceResult.primaryAPT,
      secondaryAPT: inferenceResult.secondaryAPT || [],
      confidence: inferenceResult.confidence,
      analysis: {
        strategy: 'inference_only',
        sources: { inference: inferenceResult.primaryAPT[0] },
        reasoning: inferenceResult.reasoning
      },
      viewingExperience: inferenceResult.viewingExperience
    };
  }

  // 보조 APT 찾기
  findSecondaryAPTs(axisScores) {
    const secondary = [];
    const primary = this.calculateAPTFromScores(axisScores);
    
    // 각 축에서 점수가 -20 ~ 20 사이면 대안 생성
    for (const [axis, score] of Object.entries(axisScores)) {
      if (Math.abs(score) < 20) {
        const alternative = { ...axisScores };
        alternative[axis] = -score;
        const altAPT = this.calculateAPTFromScores(alternative);
        if (altAPT !== primary && !secondary.includes(altAPT)) {
          secondary.push(altAPT);
        }
      }
    }
    
    return secondary.slice(0, 2);
  }
}

module.exports = GeminiOnlyClassifier;