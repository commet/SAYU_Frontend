// Multi-APT Classifier - 다중 성향 분류 시스템
// 한 작가에 대해 주/부/제3 성향을 분석하여 더 풍부한 프로필 생성

const { GoogleGenerativeAI } = require('@google/generative-ai');
const ArtistDataEnricher = require('./artistDataEnricher');

class MultiAPTClassifier {
  constructor() {
    this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.gemini.getGenerativeModel({ model: "gemini-1.5-flash" });
    this.enricher = new ArtistDataEnricher();
    
    // 16개 APT 유형 정의
    this.aptTypes = [
      'LAEF', 'LAEC', 'LAMF', 'LAMC',
      'LREF', 'LREC', 'LRMF', 'LRMC',
      'SAEF', 'SAEC', 'SAMF', 'SAMC',
      'SREF', 'SREC', 'SRMF', 'SRMC'
    ];
    
    this.typeInfo = {
      'LAEF': { title: '몽환적 방랑자', animal: 'fox', name_ko: '여우' },
      'LAEC': { title: '감성 큐레이터', animal: 'cat', name_ko: '고양이' },
      'LAMF': { title: '직관적 탐구자', animal: 'owl', name_ko: '올빼미' },
      'LAMC': { title: '철학적 수집가', animal: 'turtle', name_ko: '거북이' },
      'LREF': { title: '고독한 관찰자', animal: 'chameleon', name_ko: '카멜레온' },
      'LREC': { title: '섬세한 감정가', animal: 'hedgehog', name_ko: '고슴도치' },
      'LRMF': { title: '디지털 탐험가', animal: 'octopus', name_ko: '문어' },
      'LRMC': { title: '학구적 연구자', animal: 'beaver', name_ko: '비버' },
      'SAEF': { title: '감성 나눔이', animal: 'butterfly', name_ko: '나비' },
      'SAEC': { title: '예술 네트워커', animal: 'penguin', name_ko: '펭귄' },
      'SAMF': { title: '영감 전도사', animal: 'parrot', name_ko: '앵무새' },
      'SAMC': { title: '문화 기획자', animal: 'deer', name_ko: '사슴' },
      'SREF': { title: '열정적 관람자', animal: 'dog', name_ko: '강아지' },
      'SREC': { title: '따뜻한 안내자', animal: 'duck', name_ko: '오리' },
      'SRMF': { title: '지식 멘토', animal: 'elephant', name_ko: '코끼리' },
      'SRMC': { title: '체계적 교육자', animal: 'eagle', name_ko: '독수리' }
    };
  }

  async classifyArtist(artistData) {
    console.log(`\n🎨 다중 APT 분류: ${artistData.name}`);
    
    try {
      // 1. 외부 데이터 수집
      const enrichedData = await this.enricher.enrichArtistData(
        this.extractActualArtistName(artistData.name),
        artistData
      );
      
      // 2. 축별 세부 점수 계산
      const detailedScores = await this.calculateDetailedScores(enrichedData);
      
      // 3. 상위 3개 APT 유형 도출
      const topAPTs = this.calculateTopAPTs(detailedScores);
      
      // 4. 각 유형별 설명 생성
      const enrichedAPTs = await this.enrichAPTDescriptions(topAPTs, enrichedData);
      
      return this.formatMultiAPTResult(enrichedAPTs, detailedScores, enrichedData);
      
    } catch (error) {
      console.error(`   ❌ 분류 오류: ${error.message}`);
      return this.createFallbackResult(artistData);
    }
  }

  async calculateDetailedScores(data) {
    const dataQuality = this.assessDataQuality(data);
    console.log(`   📊 데이터 품질: ${dataQuality}`);
    
    if (dataQuality === 'poor') {
      // 데이터가 부족한 경우 기본 추론
      return this.inferDetailedScores(data);
    }
    
    // AI를 통한 정밀 분석
    const prompt = `작가의 작품을 감상하는 사람의 관점에서 16가지 APT 성향을 분석해주세요.

작가: ${data.name}
정보: ${JSON.stringify(data, null, 2)}

각 축에 대해 -100에서 +100 사이의 세부 점수를 매겨주세요:

1. L/S축 (개인적 vs 사회적)
   - 혼자 조용히 감상 (-100) vs 함께 나누며 감상 (+100)
   - 세부 요소: 고독성(-), 내향성(-), 사교성(+), 공유성(+)

2. A/R축 (추상적 vs 구체적)
   - 추상적 사색 (-100) vs 구체적 서사 (+100)
   - 세부 요소: 개념성(-), 상징성(-), 현실성(+), 서사성(+)

3. E/M축 (감정적 vs 의미중심)
   - 감정적 공감 (-100) vs 지적 탐구 (+100)
   - 세부 요소: 정서성(-), 직관성(-), 분석성(+), 학구성(+)

4. F/C축 (자유로운 vs 체계적)
   - 자유로운 해석 (-100) vs 구조적 이해 (+100)
   - 세부 요소: 유연성(-), 즉흥성(-), 체계성(+), 규칙성(+)

응답 형식:
L/S 점수: [점수]
  - 고독성: [점수]
  - 내향성: [점수]
  - 사교성: [점수]
  - 공유성: [점수]
  근거: [설명]

A/R 점수: [점수]
  - 개념성: [점수]
  - 상징성: [점수]
  - 현실성: [점수]
  - 서사성: [점수]
  근거: [설명]

E/M 점수: [점수]
  - 정서성: [점수]
  - 직관성: [점수]
  - 분석성: [점수]
  - 학구성: [점수]
  근거: [설명]

F/C 점수: [점수]
  - 유연성: [점수]
  - 즉흥성: [점수]
  - 체계성: [점수]
  - 규칙성: [점수]
  근거: [설명]

종합 분석: [작가의 복합적 성향에 대한 설명]`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseDetailedScores(text);
      
    } catch (error) {
      console.error('   ⚠️ AI 분석 오류:', error.message);
      return this.inferDetailedScores(data);
    }
  }

  parseDetailedScores(text) {
    const scores = {
      L_S: { main: 0, sub: { loneliness: 0, introversion: 0, sociability: 0, sharing: 0 } },
      A_R: { main: 0, sub: { conceptual: 0, symbolic: 0, realistic: 0, narrative: 0 } },
      E_M: { main: 0, sub: { emotional: 0, intuitive: 0, analytical: 0, scholarly: 0 } },
      F_C: { main: 0, sub: { flexible: 0, improvisational: 0, systematic: 0, regular: 0 } },
      analysis: ''
    };
    
    // 주 점수 추출
    const mainPatterns = {
      L_S: /L\/S 점수:\s*([+-]?\d+)/i,
      A_R: /A\/R 점수:\s*([+-]?\d+)/i,
      E_M: /E\/M 점수:\s*([+-]?\d+)/i,
      F_C: /F\/C 점수:\s*([+-]?\d+)/i
    };
    
    for (const [axis, pattern] of Object.entries(mainPatterns)) {
      const match = text.match(pattern);
      if (match) {
        scores[axis].main = parseInt(match[1]);
      }
    }
    
    // 세부 점수 추출
    const subPatterns = {
      '고독성': (v) => scores.L_S.sub.loneliness = parseInt(v),
      '내향성': (v) => scores.L_S.sub.introversion = parseInt(v),
      '사교성': (v) => scores.L_S.sub.sociability = parseInt(v),
      '공유성': (v) => scores.L_S.sub.sharing = parseInt(v),
      '개념성': (v) => scores.A_R.sub.conceptual = parseInt(v),
      '상징성': (v) => scores.A_R.sub.symbolic = parseInt(v),
      '현실성': (v) => scores.A_R.sub.realistic = parseInt(v),
      '서사성': (v) => scores.A_R.sub.narrative = parseInt(v),
      '정서성': (v) => scores.E_M.sub.emotional = parseInt(v),
      '직관성': (v) => scores.E_M.sub.intuitive = parseInt(v),
      '분석성': (v) => scores.E_M.sub.analytical = parseInt(v),
      '학구성': (v) => scores.E_M.sub.scholarly = parseInt(v),
      '유연성': (v) => scores.F_C.sub.flexible = parseInt(v),
      '즉흥성': (v) => scores.F_C.sub.improvisational = parseInt(v),
      '체계성': (v) => scores.F_C.sub.systematic = parseInt(v),
      '규칙성': (v) => scores.F_C.sub.regular = parseInt(v)
    };
    
    for (const [name, setter] of Object.entries(subPatterns)) {
      const pattern = new RegExp(`${name}:\\s*([+-]?\\d+)`, 'i');
      const match = text.match(pattern);
      if (match) {
        setter(match[1]);
      }
    }
    
    // 종합 분석 추출
    const analysisMatch = text.match(/종합 분석:\s*(.+?)$/ims);
    if (analysisMatch) {
      scores.analysis = analysisMatch[1].trim();
    }
    
    return scores;
  }

  inferDetailedScores(data) {
    // 기본 추론 로직
    const artistType = this.categorizeArtist(data);
    const baseScores = this.getTypeBaseScores(artistType);
    
    // 세부 점수 추론
    return {
      L_S: {
        main: baseScores.L_S,
        sub: {
          loneliness: baseScores.L_S < 0 ? baseScores.L_S - 10 : 0,
          introversion: baseScores.L_S < 0 ? baseScores.L_S - 5 : 0,
          sociability: baseScores.L_S > 0 ? baseScores.L_S + 10 : 0,
          sharing: baseScores.L_S > 0 ? baseScores.L_S + 5 : 0
        }
      },
      A_R: {
        main: baseScores.A_R,
        sub: {
          conceptual: baseScores.A_R < 0 ? baseScores.A_R - 10 : 0,
          symbolic: baseScores.A_R < 0 ? baseScores.A_R - 5 : 0,
          realistic: baseScores.A_R > 0 ? baseScores.A_R + 10 : 0,
          narrative: baseScores.A_R > 0 ? baseScores.A_R + 5 : 0
        }
      },
      E_M: {
        main: baseScores.E_M,
        sub: {
          emotional: baseScores.E_M < 0 ? baseScores.E_M - 10 : 0,
          intuitive: baseScores.E_M < 0 ? baseScores.E_M - 5 : 0,
          analytical: baseScores.E_M > 0 ? baseScores.E_M + 10 : 0,
          scholarly: baseScores.E_M > 0 ? baseScores.E_M + 5 : 0
        }
      },
      F_C: {
        main: baseScores.F_C,
        sub: {
          flexible: baseScores.F_C < 0 ? baseScores.F_C - 10 : 0,
          improvisational: baseScores.F_C < 0 ? baseScores.F_C - 5 : 0,
          systematic: baseScores.F_C > 0 ? baseScores.F_C + 10 : 0,
          regular: baseScores.F_C > 0 ? baseScores.F_C + 5 : 0
        }
      },
      analysis: `${artistType} 유형의 일반적 특성 기반 추론`
    };
  }

  calculateTopAPTs(detailedScores) {
    const aptScores = [];
    
    // 16개 모든 APT에 대해 점수 계산
    for (const aptType of this.aptTypes) {
      const score = this.calculateAPTScore(aptType, detailedScores);
      aptScores.push({ type: aptType, score, details: this.getAPTDetails(aptType, detailedScores) });
    }
    
    // 점수 순으로 정렬하여 상위 3개 선택
    aptScores.sort((a, b) => b.score - a.score);
    const top3 = aptScores.slice(0, 3);
    
    // 가중치 계산 (상대적 비중)
    const totalScore = top3.reduce((sum, apt) => sum + apt.score, 0);
    
    return top3.map((apt, index) => ({
      ...apt,
      weight: totalScore > 0 ? apt.score / totalScore : 0.33,
      rank: index + 1
    }));
  }

  calculateAPTScore(aptType, scores) {
    // APT 유형과 점수의 매칭 정도 계산
    const targetScores = this.getAPTTargetScores(aptType);
    
    let totalDifference = 0;
    totalDifference += Math.abs(scores.L_S.main - targetScores.L_S) * 0.25;
    totalDifference += Math.abs(scores.A_R.main - targetScores.A_R) * 0.25;
    totalDifference += Math.abs(scores.E_M.main - targetScores.E_M) * 0.25;
    totalDifference += Math.abs(scores.F_C.main - targetScores.F_C) * 0.25;
    
    // 세부 점수도 고려
    const subScoreMatch = this.calculateSubScoreMatch(aptType, scores);
    
    // 100점 만점으로 변환 (차이가 적을수록 높은 점수)
    const mainMatch = Math.max(0, 100 - totalDifference);
    return mainMatch * 0.7 + subScoreMatch * 0.3;
  }

  getAPTTargetScores(aptType) {
    // 각 APT 유형의 이상적인 점수
    const targets = {
      'LAEF': { L_S: -70, A_R: -70, E_M: -80, F_C: -80 },
      'LAEC': { L_S: -50, A_R: -50, E_M: -70, F_C: 30 },
      'LAMF': { L_S: -60, A_R: -80, E_M: -20, F_C: -70 },
      'LAMC': { L_S: -40, A_R: -60, E_M: 40, F_C: 60 },
      'LREF': { L_S: -60, A_R: 60, E_M: -70, F_C: -40 },
      'LREC': { L_S: -30, A_R: 50, E_M: -60, F_C: 40 },
      'LRMF': { L_S: -40, A_R: 40, E_M: 30, F_C: -50 },
      'LRMC': { L_S: -20, A_R: 80, E_M: 70, F_C: 80 },
      'SAEF': { L_S: 60, A_R: -60, E_M: -90, F_C: -60 },
      'SAEC': { L_S: 70, A_R: -40, E_M: -50, F_C: 20 },
      'SAMF': { L_S: 80, A_R: -50, E_M: -30, F_C: -40 },
      'SAMC': { L_S: 70, A_R: -30, E_M: 50, F_C: 70 },
      'SREF': { L_S: 70, A_R: 70, E_M: -60, F_C: -30 },
      'SREC': { L_S: 50, A_R: 80, E_M: -50, F_C: 30 },
      'SRMF': { L_S: 60, A_R: 60, E_M: 60, F_C: -20 },
      'SRMC': { L_S: 40, A_R: 90, E_M: 80, F_C: 90 }
    };
    
    return targets[aptType] || { L_S: 0, A_R: 0, E_M: 0, F_C: 0 };
  }

  calculateSubScoreMatch(aptType, scores) {
    // 세부 점수와 APT 유형의 매칭 정도
    // 각 APT별로 중요한 세부 요소가 다름
    const emphasisMap = {
      'LAEF': ['loneliness', 'conceptual', 'emotional', 'flexible'],
      'LREC': ['introversion', 'realistic', 'emotional', 'systematic'],
      'SRMC': ['sharing', 'narrative', 'scholarly', 'regular'],
      // ... 나머지 유형들
    };
    
    const emphasis = emphasisMap[aptType] || [];
    let matchScore = 50; // 기본 점수
    
    // 강조 요소들의 매칭 정도 계산
    // (간단한 구현)
    
    return matchScore;
  }

  getAPTDetails(aptType, scores) {
    // APT와 현재 점수의 세부 매칭 정보
    const targetScores = this.getAPTTargetScores(aptType);
    
    return {
      L_S_match: 100 - Math.abs(scores.L_S.main - targetScores.L_S),
      A_R_match: 100 - Math.abs(scores.A_R.main - targetScores.A_R),
      E_M_match: 100 - Math.abs(scores.E_M.main - targetScores.E_M),
      F_C_match: 100 - Math.abs(scores.F_C.main - targetScores.F_C)
    };
  }

  async enrichAPTDescriptions(topAPTs, artistData) {
    // 각 APT에 대한 설명 생성
    const enrichedAPTs = [];
    
    for (const apt of topAPTs) {
      const typeInfo = this.typeInfo[apt.type];
      
      enrichedAPTs.push({
        type: apt.type,
        title: typeInfo.title,
        animal: typeInfo.animal,
        name_ko: typeInfo.name_ko,
        confidence: Math.round(apt.score),
        weight: apt.weight,
        rank: apt.rank,
        description: await this.generateAPTDescription(apt, artistData),
        matchDetails: apt.details
      });
    }
    
    return enrichedAPTs;
  }

  async generateAPTDescription(apt, artistData) {
    // 각 APT 유형별 작가 특성 설명
    const descriptions = {
      'LAEF': `${artistData.name}의 작품은 내면의 꿈과 환상을 탐구하며, 관람자에게 개인적이고 몽환적인 경험을 선사합니다.`,
      'LREC': `${artistData.name}는 섬세한 감정의 뉘앙스를 포착하여, 조용히 관찰하는 이들에게 깊은 울림을 전달합니다.`,
      'SRMC': `${artistData.name}의 작품은 체계적인 구조와 교육적 가치를 지니며, 함께 감상하고 학습하는 경험을 제공합니다.`,
      // ... 나머지 유형들
    };
    
    return descriptions[apt.type] || `${artistData.name}의 ${this.typeInfo[apt.type].title} 성향`;
  }

  categorizeArtist(data) {
    // 기존 로직 재사용
    if (data.movement) {
      const movement = data.movement.toLowerCase();
      if (movement.includes('impressionism')) return 'impressionist';
      if (movement.includes('cubism')) return 'cubist';
      // ...
    }
    
    if (data.era) {
      const era = data.era.toLowerCase();
      if (era.includes('renaissance')) return 'renaissance';
      if (era.includes('baroque')) return 'baroque';
      // ...
    }
    
    return 'unknown';
  }

  getTypeBaseScores(artistType) {
    const typeScores = {
      'impressionist': { L_S: -20, A_R: 20, E_M: -70, F_C: -60 },
      'cubist': { L_S: -50, A_R: -80, E_M: 30, F_C: -30 },
      'renaissance': { L_S: -10, A_R: 85, E_M: 50, F_C: 75 },
      'baroque': { L_S: 50, A_R: 90, E_M: -60, F_C: 40 },
      'unknown': { L_S: 0, A_R: 20, E_M: -20, F_C: 0 }
    };
    
    return typeScores[artistType] || typeScores['unknown'];
  }

  assessDataQuality(data) {
    let score = 0;
    
    if (data.bio && data.bio.length > 500) score += 40;
    else if (data.bio && data.bio.length > 200) score += 20;
    
    if (data.nationality) score += 10;
    if (data.era) score += 10;
    if (data.movement) score += 20;
    if (data.exhibitions > 50) score += 10;
    if (data.auctionRecords > 100) score += 10;
    
    if (score >= 60) return 'good';
    if (score >= 30) return 'moderate';
    return 'poor';
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

  formatMultiAPTResult(aptTypes, detailedScores, enrichedData) {
    return {
      name: enrichedData.name,
      actualArtistName: this.extractActualArtistName(enrichedData.name),
      primaryTypes: aptTypes,
      dimensions: {
        L: Math.round(50 - detailedScores.L_S.main / 2),
        S: Math.round(50 + detailedScores.L_S.main / 2),
        A: Math.round(50 - detailedScores.A_R.main / 2),
        R: Math.round(50 + detailedScores.A_R.main / 2),
        E: Math.round(50 - detailedScores.E_M.main / 2),
        M: Math.round(50 + detailedScores.E_M.main / 2),
        F: Math.round(50 - detailedScores.F_C.main / 2),
        C: Math.round(50 + detailedScores.F_C.main / 2)
      },
      detailedScores: detailedScores,
      analysis: {
        strategy: 'multi_apt_v1',
        reasoning: detailedScores.analysis,
        sources: enrichedData.sources || []
      }
    };
  }

  createFallbackResult(artistData) {
    // 오류 시 기본 결과
    return {
      name: artistData.name,
      actualArtistName: this.extractActualArtistName(artistData.name),
      primaryTypes: [
        {
          type: 'LREC',
          title: '섬세한 감정가',
          animal: 'hedgehog',
          name_ko: '고슴도치',
          confidence: 40,
          weight: 0.5,
          rank: 1
        },
        {
          type: 'SREC',
          title: '따뜻한 안내자',
          animal: 'duck',
          name_ko: '오리',
          confidence: 35,
          weight: 0.3,
          rank: 2
        },
        {
          type: 'LAEC',
          title: '감성 큐레이터',
          animal: 'cat',
          name_ko: '고양이',
          confidence: 30,
          weight: 0.2,
          rank: 3
        }
      ],
      dimensions: {
        L: 50, S: 50, A: 50, R: 50,
        E: 50, M: 50, F: 50, C: 50
      },
      analysis: {
        strategy: 'multi_apt_fallback',
        reasoning: '데이터 부족으로 기본값 적용'
      }
    };
  }
}

module.exports = MultiAPTClassifier;