// Proper Gemini Classifier - 진짜 근거 있는 분류

const { GoogleGenerativeAI } = require('@google/generative-ai');

class ProperGeminiClassifier {
  constructor() {
    this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async classifyArtist(artistData) {
    console.log(`\n🎨 적절한 분류 시작: ${artistData.name}`);

    try {
      // 1. 실제 작가명 추출
      const actualArtistName = this.extractActualArtistName(artistData.name);
      const isAttribution = artistData.name !== actualArtistName;

      // 2. Gemini에게 진짜 분석 요청
      const geminiResult = await this.analyzeWithProperPrompt(
        { ...artistData, actualName: actualArtistName, isAttribution }
      );

      if (geminiResult && geminiResult.aptType !== 'UNKNOWN') {
        return this.formatResult(geminiResult, artistData);
      }

      // 3. 분류 불가능한 경우
      return {
        aptType: 'UNKNOWN',
        axisScores: { L_S: 0, A_R: 0, E_M: 0, F_C: 0 },
        confidence: 0,
        analysis: {
          strategy: 'insufficient_data',
          actualArtistName,
          reasoning: '정보 부족으로 분류 불가'
        }
      };

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

  async analyzeWithProperPrompt(artistData) {
    try {
      const prompt = `작가를 16가지 APT 중 하나로 분류해주세요.

작가: ${artistData.actualName || artistData.name}
${artistData.isAttribution ? `⚠️ 이것은 귀속 작품입니다 (원작가: ${artistData.actualName})` : ''}

정보:
${artistData.nationality ? `국적: ${artistData.nationality}` : '국적: 불명'}
${artistData.era ? `시대: ${artistData.era}` : '시대: 불명'}
${artistData.birth_year ? `생몰: ${artistData.birth_year} - ${artistData.death_year || '?'}` : '생몰: 불명'}
${artistData.movement ? `사조: ${artistData.movement}` : ''}
${artistData.bio ? `\n전기:\n${artistData.bio.substring(0, 1000)}` : '전기: 없음'}

평가 지침:
1. 생몰년, 국적, 시대 중 2개 이상 있으면 기본적인 추론 시도
2. 전기(bio)가 없어도 시대와 국적으로 일반적 경향 추론 가능
3. SRMC는 정말 교육적/체계적 특성이 명확할 때만 사용
4. 확실하지 않은 축은 중간값(-30~+30) 사용
5. 완전히 정보가 없는 경우에만 UNKNOWN 사용

특히 주의할 점:
- "Painter"가 이름에 있다고 해서 특정 유형으로 분류하지 마세요
- 고대 그리스 도자기 화가들도 다양한 성향을 가질 수 있습니다
- 귀속 작품이라고 해서 자동으로 특정 성향을 부여하지 마세요

추론 예시:
- 고대 그리스 도자기 화가: 일반적으로 구상적(R), 의미 중심(M) 경향
- 바로크 시대: 극적이고 감정적(E), 구상적(R) 경향
- 현대/컨템포러리: 다양하지만 추상(A), 자유로운(F) 경향 증가
- 귀속 작품: 원작보다 대중적(S) 경향이 있을 수 있음

평가 기준:
- L/S축: 혼자 감상(-100) vs 함께 감상(+100)
- A/R축: 추상적(-100) vs 구상적(+100)
- E/M축: 감정 중심(-100) vs 의미 중심(+100)
- F/C축: 자유로운(-100) vs 체계적(+100)

응답:
정보가 충분한 경우:
L/S: [점수와 근거]
A/R: [점수와 근거]
E/M: [점수와 근거]
F/C: [점수와 근거]
APT: [4글자]
분류 근거: [구체적 설명]

정보가 부족한 경우:
APT: UNKNOWN
분류 근거: [왜 분류할 수 없는지 설명]`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log(`   Gemini 응답:\n${text.substring(0, 300)}...`);

      return this.parseResponse(text);

    } catch (error) {
      console.error('   ⚠️ Gemini 오류:', error.message);
      return null;
    }
  }

  parseResponse(text) {
    try {
      // UNKNOWN 체크
      if (text.includes('APT: UNKNOWN') || text.includes('분류 불가')) {
        const reasonMatch = text.match(/분류 근거:\s*(.+?)$/ims);
        return {
          aptType: 'UNKNOWN',
          axisScores: { L_S: 0, A_R: 0, E_M: 0, F_C: 0 },
          reasoning: reasonMatch ? reasonMatch[1].trim() : '정보 부족'
        };
      }

      const result = {
        axisScores: { L_S: 0, A_R: 0, E_M: 0, F_C: 0 },
        aptType: null,
        reasoning: ''
      };

      // 축 점수와 근거 추출
      const patterns = {
        L_S: /L\/S:\s*(-?\d+)(?:\s*[^\n]*)?/i,
        A_R: /A\/R:\s*(-?\d+)(?:\s*[^\n]*)?/i,
        E_M: /E\/M:\s*(-?\d+)(?:\s*[^\n]*)?/i,
        F_C: /F\/C:\s*(-?\d+)(?:\s*[^\n]*)?/i
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
      } else if (Object.values(result.axisScores).some(v => v !== 0)) {
        // 축 점수가 있으면 계산
        result.aptType = this.calculateAPT(result.axisScores);
        console.log(`   APT 자동 계산: ${result.aptType}`);
      } else {
        // 점수가 모두 0이면 UNKNOWN
        result.aptType = 'UNKNOWN';
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
    const confidence = this.calculateConfidence(geminiResult, artistData);

    return {
      aptType: geminiResult.aptType,
      axisScores: geminiResult.axisScores,
      confidence,
      analysis: {
        strategy: 'proper_analysis_v1',
        actualArtistName: this.extractActualArtistName(artistData.name),
        reasoning: geminiResult.reasoning
      }
    };
  }

  calculateConfidence(result, artistData) {
    // UNKNOWN이면 신뢰도 0
    if (result.aptType === 'UNKNOWN') return 0;

    let confidence = 40; // 기본 신뢰도

    // 구체적인 근거가 있으면 신뢰도 증가
    if (result.reasoning && result.reasoning.length > 100) {
      confidence += 20;
    }

    // 데이터 품질에 따른 신뢰도
    if (artistData.bio && artistData.bio.length > 500) confidence += 20;
    else if (artistData.bio && artistData.bio.length > 100) confidence += 10;

    if (artistData.nationality) confidence += 5;
    if (artistData.era) confidence += 5;
    if (artistData.birth_year) confidence += 5;

    // 극단값이 아닌 중간값들이 많으면 신뢰도 감소
    const moderateScores = Object.values(result.axisScores)
      .filter(score => Math.abs(score) <= 30).length;
    if (moderateScores >= 3) confidence -= 10;

    return Math.min(90, Math.max(20, confidence));
  }
}

module.exports = ProperGeminiClassifier;
