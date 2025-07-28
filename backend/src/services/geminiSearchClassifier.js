// Gemini Search Classifier - 검색 기능을 활용한 작가 분류
const ArtistAPTInferenceEngine = require('./artistAPTInferenceEngine');
const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiSearchClassifier {
  constructor() {
    this.inferenceEngine = new ArtistAPTInferenceEngine();
    this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async classifyArtist(artistData) {
    console.log(`\n🎨 분류 시작: ${artistData.name}`);

    try {
      // 1. 실제 작가명 추출
      const actualArtistName = this.extractActualArtistName(artistData.name);
      console.log(`   👤 실제 작가: ${actualArtistName}`);

      // 2. 데이터가 부족한 경우 검색 요청
      const needsSearch = this.needsSearching(artistData);

      // 3. AI 분석 (검색 포함)
      const geminiResult = await this.analyzeWithGemini(
        { ...artistData, actualName: actualArtistName },
        needsSearch
      );

      if (geminiResult) {
        return this.formatResult(geminiResult, artistData);
      }

      // 4. 폴백: 규칙 기반 추론
      const ruleResult = this.inferenceEngine.inferAPTFromLimitedData(artistData);
      return this.formatResult(ruleResult, artistData);

    } catch (error) {
      console.error(`   ❌ 오류: ${error.message}`);
      throw error;
    }
  }

  extractActualArtistName(fullName) {
    // 귀속 관계 용어 제거
    const attributions = [
      'Attributed to ',
      'After ',
      'Follower of ',
      'Circle of ',
      'School of ',
      'Workshop of ',
      'Studio of ',
      'Manner of ',
      'Style of ',
      'Copy after ',
      'Imitator of '
    ];

    let actualName = fullName;
    for (const attr of attributions) {
      if (actualName.startsWith(attr)) {
        actualName = actualName.substring(attr.length);
        break;
      }
    }

    // Workshop 등 뒤에 오는 경우 처리
    actualName = actualName.replace(/ Workshop.*$/, '')
      .replace(/ School.*$/, '')
      .replace(/ Studio.*$/, '');

    return actualName.trim();
  }

  needsSearching(artistData) {
    // 검색이 필요한 조건
    const bioLength = artistData.bio?.length || 0;
    const hasBasicInfo = artistData.birth_year || artistData.nationality || artistData.era;

    return bioLength < 100 && !hasBasicInfo;
  }

  async analyzeWithGemini(artistData, needsSearch) {
    try {
      const prompt = this.buildPrompt(artistData, needsSearch);

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return this.parseResponse(text);

    } catch (error) {
      console.error('   ⚠️ Gemini 오류:', error.message);
      return null;
    }
  }

  buildPrompt(artistData, needsSearch) {
    let prompt = '';

    if (needsSearch) {
      prompt = `
작가 "${artistData.actualName}"에 대해 알려진 정보를 검색하고, APT 분류를 수행해주세요.

현재 정보:
- 전체 이름: ${artistData.name}
- 국적: ${artistData.nationality || '알 수 없음'}
- 시대: ${artistData.era || '알 수 없음'}
- 생몰: ${artistData.birth_year || '?'} - ${artistData.death_year || '?'}

다음을 검색/추론해주세요:
1. 이 작가의 주요 작품 스타일
2. 활동 시대와 예술 사조
3. 작업 방식 (혼자/협업)
4. 대표작의 특징

그리고 APT 분류를 위한 4개 축 평가:
`;
    } else {
      prompt = `
작가 "${artistData.actualName}"를 APT 분류해주세요.

정보:
- 국적: ${artistData.nationality || '알 수 없음'}
- 시대: ${artistData.era || '알 수 없음'}
- 생몰: ${artistData.birth_year || '?'} - ${artistData.death_year || '?'}
${artistData.bio ? `\n전기:\n${artistData.bio.substring(0, 800)}\n` : ''}

APT 분류를 위한 4개 축 평가:
`;
    }

    prompt += `
- L/S축: 혼자 감상(-100) vs 함께 감상(+100)
- A/R축: 추상적(-100) vs 구상적(+100)
- E/M축: 감정 중심(-100) vs 의미 중심(+100)
- F/C축: 자유로운(-100) vs 체계적(+100)

응답 형식:
검색 결과: [발견한 정보 요약]
L/S: [점수]
A/R: [점수]
E/M: [점수]
F/C: [점수]
APT: [4글자 코드]
분류 근거: [구체적 이유]`;

    return prompt;
  }

  parseResponse(text) {
    try {
      const lines = text.split('\n');
      const result = {
        searchInfo: '',
        axisScores: { L_S: 0, A_R: 0, E_M: 0, F_C: 0 },
        aptType: null,
        reasoning: ''
      };

      // 검색 결과 추출
      const searchMatch = text.match(/검색 결과:\s*(.+?)(?=L\/S:|$)/is);
      if (searchMatch) {
        result.searchInfo = searchMatch[1].trim();
      }

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
        // 점수로 계산
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

  formatResult(geminiResult, artistData) {
    // geminiResult가 추론 엔진 결과인 경우
    if (geminiResult.primaryAPT) {
      return {
        aptType: geminiResult.primaryAPT[0],
        axisScores: geminiResult.axisScores,
        confidence: geminiResult.confidence,
        analysis: {
          strategy: 'rule_based_fallback',
          actualArtistName: this.extractActualArtistName(artistData.name)
        }
      };
    }

    // Gemini 결과인 경우
    const confidence = this.calculateConfidence(geminiResult, artistData);

    return {
      aptType: geminiResult.aptType,
      axisScores: geminiResult.axisScores,
      confidence,
      analysis: {
        strategy: geminiResult.searchInfo ? 'gemini_with_search' : 'gemini_direct',
        actualArtistName: this.extractActualArtistName(artistData.name),
        searchInfo: geminiResult.searchInfo,
        reasoning: geminiResult.reasoning
      }
    };
  }

  calculateConfidence(result, artistData) {
    let confidence = 50;

    // 검색 정보가 있으면 +20
    if (result.searchInfo && result.searchInfo.length > 50) {
      confidence += 20;
    }

    // 명확한 축 점수 (+축별로 최대 5점)
    Object.values(result.axisScores).forEach(score => {
      if (Math.abs(score) > 50) confidence += 5;
    });

    // 상세한 근거 (+10)
    if (result.reasoning && result.reasoning.length > 100) {
      confidence += 10;
    }

    return Math.min(95, confidence);
  }
}

module.exports = GeminiSearchClassifier;
