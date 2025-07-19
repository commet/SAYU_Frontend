// APT Vector System - 벡터 기반 추천을 위한 핵심 시스템
const { openai, createEmbeddingWithRetry } = require('../config/openai');
const { SAYU_TYPES, SAYU_FUNCTIONS } = require('../../../shared/SAYUTypeDefinitions');

class APTVectorSystem {
  constructor() {
    // 각 APT 유형의 프로토타입 벡터 (실제로는 임베딩 API로 생성)
    this.prototypeVectors = null;
    this.dimensionWeights = {
      L_S: { vector_indices: [0, 63], weight: 0.25 },    // 혼자/함께
      A_R: { vector_indices: [64, 127], weight: 0.25 },  // 추상/구상
      E_M: { vector_indices: [128, 191], weight: 0.25 }, // 감정/의미
      F_C: { vector_indices: [192, 255], weight: 0.25 }  // 자유/체계
    };
  }

  async initializePrototypes() {
    // 각 APT 유형의 정확한 특성을 기반으로 상세 설명 생성
    const aptDescriptions = {};
    
    for (const [typeCode, typeData] of Object.entries(SAYU_TYPES)) {
      // 각 유형의 핵심 특성을 체계적으로 구성
      const description = this.buildTypeDescription(typeCode, typeData);
      aptDescriptions[typeCode] = description;
    }

    // OpenAI 임베딩으로 각 유형의 벡터 생성
    this.prototypeVectors = {};
    for (const [type, description] of Object.entries(aptDescriptions)) {
      const response = await createEmbeddingWithRetry(description);
      this.prototypeVectors[type] = response.data[0].embedding;
    }
  }

  buildTypeDescription(typeCode, typeData) {
    // 4축 분해
    const axes = {
      L_S: typeCode[0] === 'L' ? '혼자' : '함께',
      A_R: typeCode[1] === 'A' ? '추상' : '구상',
      E_M: typeCode[2] === 'E' ? '감정' : '의미',
      F_C: typeCode[3] === 'F' ? '자유' : '체계'
    };

    // 인지 기능 설명
    const dominantFunc = SAYU_FUNCTIONS[typeData.dominantFunction];
    const inferiorFunc = SAYU_FUNCTIONS[typeData.inferiorFunction];
    
    // 상세한 유형 설명 구성
    return `
APT 유형: ${typeData.name} (${typeCode})
동물 상징: ${typeData.animal} ${typeData.emoji}

핵심 특성:
- 감상 방식: ${axes.L_S}서 예술을 감상하는 것을 선호
- 작품 선호: ${axes.A_R}적인 작품에 더 끌림
- 반응 방식: ${axes.E_M}적 차원에서 작품을 경험
- 관람 스타일: ${axes.F_C}로운 방식으로 전시를 탐색

성격 특징: ${typeData.characteristics.join(', ')}
행동 패턴: ${typeData.description}

주요 인지 기능:
- 주도 기능 (${dominantFunc.code}): ${dominantFunc.description}
- 열등 기능 (${inferiorFunc.code}): ${inferiorFunc.description}

예술 감상 스타일:
${this.getArtAppreciationStyle(typeCode, axes)}

선호하는 환경:
${this.getPreferredEnvironment(typeCode, axes)}
`;
  }

  getArtAppreciationStyle(typeCode, axes) {
    const styles = {
      // L (혼자) 유형들
      'LAEF': '조용한 공간에서 추상 작품의 색채와 형태가 주는 감정적 울림을 자유롭게 느끼며, 개인적인 상상의 나래를 펼침',
      'LAEC': '추상 작품이 가진 감정적 요소들을 하나하나 세심하게 분석하며, 체계적으로 감상 노트를 작성',
      'LAMF': '추상 작품 속 숨겨진 의미와 작가의 의도를 자유롭게 해석하며, 철학적 사유를 즐김',
      'LAMC': '추상 작품의 상징과 의미를 학술적으로 분석하고, 미술사적 맥락 속에서 체계적으로 이해',
      'LREF': '구상 작품의 섬세한 디테일과 감정적 뉘앙스를 홀로 음미하며, 자유로운 감상에 빠짐',
      'LREC': '구상 작품의 기법과 감정 표현을 꼼꼼히 관찰하고, 체계적으로 감상 포인트를 정리',
      'LRMF': '구상 작품이 담고 있는 이야기와 상징적 의미를 자유롭게 탐구하며, 다양한 해석을 시도',
      'LRMC': '구상 작품의 역사적 배경과 의미를 학구적으로 연구하며, 체계적인 분석을 수행',
      
      // S (함께) 유형들
      'SAEF': '다른 사람들과 추상 작품이 주는 감정을 나누며, 자유로운 대화 속에서 새로운 영감을 발견',
      'SAEC': '추상 작품에 대한 감정적 반응을 체계적으로 공유하고, 감상 워크숍을 조직하여 운영',
      'SAMF': '추상 작품의 다양한 해석을 열정적으로 전파하며, 자유로운 토론을 통해 의미를 확장',
      'SAMC': '추상 작품의 의미를 교육적으로 전달하고, 체계적인 전시 프로그램을 기획',
      'SREF': '구상 작품을 보며 느끼는 감동을 즉흥적으로 표현하고, 함께 온 사람들과 즐거운 경험을 공유',
      'SREC': '구상 작품의 감정적 가치를 따뜻하게 안내하며, 체계적인 도슨트 역할을 수행',
      'SRMF': '구상 작품의 이야기를 흥미롭게 풀어내며, 자유로운 대화를 통해 지식을 나눔',
      'SRMC': '구상 작품의 의미와 가치를 전문적으로 교육하며, 체계적인 커리큘럼을 구성'
    };
    
    return styles[typeCode] || '독특한 방식으로 예술을 감상';
  }

  getPreferredEnvironment(typeCode, axes) {
    const environments = {
      // 기본 환경 설정
      L: '조용하고 한적한 갤러리, 평일 오전이나 늦은 오후의 여유로운 시간대',
      S: '활기찬 오프닝 행사, 도슨트 투어, 아트 토크가 있는 주말 미술관',
      A: '현대미술관, 실험적 갤러리, 미디어 아트 전시장',
      R: '고전 미술관, 구상 회화 전시, 조각 정원',
      E: '감성적 조명과 음악이 있는 몰입형 전시 공간',
      M: '작품 설명이 풍부한 교육적 전시, 아카이브 룸',
      F: '자유로운 동선의 열린 공간, 탐험적 구조의 전시장',
      C: '명확한 동선과 섹션이 구분된 체계적 전시 공간'
    };
    
    // 각 축의 특성을 조합
    return `${environments[typeCode[0]]}, ${environments[typeCode[1]]}, ${environments[typeCode[2]]}, ${environments[typeCode[3]]}`;
  }

  // 사용자의 퀴즈 응답을 벡터로 변환
  async createUserVector(quizResponses, aptType) {
    // 기본적으로는 해당 APT 프로토타입에서 시작
    const baseVector = [...this.prototypeVectors[aptType]];
    
    // 퀴즈 응답의 강도에 따라 미세 조정
    for (const response of quizResponses) {
      const weight = response.weight || 1.0;
      const axis = response.axis; // L_S, A_R, E_M, F_C 중 하나
      
      if (this.dimensionWeights[axis]) {
        const { vector_indices } = this.dimensionWeights[axis];
        const [start, end] = vector_indices;
        
        // 해당 차원의 벡터값을 응답 강도에 따라 조정
        for (let i = start; i <= end; i++) {
          baseVector[i] *= (1 + (weight - 1) * 0.1); // 최대 10% 조정
        }
      }
    }
    
    // 정규화
    return this.normalizeVector(baseVector);
  }

  // 작품을 벡터로 변환
  async createArtworkVector(artwork) {
    // 작품의 특성을 상세히 기술
    const artworkDescription = this.buildArtworkDescription(artwork);
    
    const response = await createEmbeddingWithRetry(artworkDescription);

    return response.data[0].embedding;
  }

  buildArtworkDescription(artwork) {
    // 작품의 다양한 측면을 포함한 상세 설명
    return `
작품 정보:
제목: ${artwork.title || '무제'}
작가: ${artwork.artist || '작자 미상'}
제작년도: ${artwork.date || '연도 미상'}
시대/양식: ${artwork.period || ''} ${artwork.style || ''}
장르: ${artwork.genre || ''}
매체: ${artwork.medium || ''}
크기: ${artwork.dimensions || ''}

작품 특성:
- 추상도: ${artwork.isAbstract ? '추상적' : '구상적'} 작품
- 감정적 톤: ${artwork.emotionalTone || '중립적'}
- 주제: ${artwork.subject || ''}
- 색채: ${artwork.colorPalette || ''}
- 구성: ${artwork.composition || ''}

설명: ${artwork.description || ''}
태그: ${(artwork.tags || []).join(', ')}

감상 포인트:
- 혼자 감상하기 좋은 정도: ${artwork.solitudeScore || 5}/10
- 토론 유발 가능성: ${artwork.discussionPotential || 5}/10
- 감정적 임팩트: ${artwork.emotionalImpact || 5}/10
- 지적 자극도: ${artwork.intellectualStimulation || 5}/10
- 관람 자유도: ${artwork.viewingFreedom || 5}/10
`;
  }

  // 벡터 간 유사도 계산 (코사인 유사도)
  calculateSimilarity(vector1, vector2) {
    if (!vector1 || !vector2 || vector1.length !== vector2.length) {
      return 0;
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < vector1.length; i++) {
      dotProduct += vector1[i] * vector2[i];
      norm1 += vector1[i] * vector1[i];
      norm2 += vector2[i] * vector2[i];
    }

    if (norm1 === 0 || norm2 === 0) return 0;
    
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  // 사용자에게 가장 적합한 작품 찾기
  async findBestArtworks(userVector, artworkVectors, limit = 10) {
    const similarities = [];
    
    for (const artwork of artworkVectors) {
      const similarity = this.calculateSimilarity(userVector, artwork.vector);
      similarities.push({
        ...artwork,
        similarity,
        matchScore: Math.round(similarity * 100) // 백분율로 표시
      });
    }
    
    // 유사도 높은 순으로 정렬
    similarities.sort((a, b) => b.similarity - a.similarity);
    
    return similarities.slice(0, limit);
  }

  // 사용자 벡터 진화 (행동 기반)
  async evolveUserVector(currentVector, userActions, aptType) {
    // 현재 APT 유형은 유지하면서 벡터만 미세 조정
    const evolutionRate = 0.02; // 2% 반영률 (천천히 진화)
    let evolvedVector = [...currentVector];
    
    for (const action of userActions) {
      if (action.type === 'artwork_like') {
        const artworkVector = await this.createArtworkVector(action.artwork);
        // 좋아한 작품 방향으로 살짝 이동
        for (let i = 0; i < evolvedVector.length; i++) {
          evolvedVector[i] = evolvedVector[i] * (1 - evolutionRate) + 
                           artworkVector[i] * evolutionRate;
        }
      } else if (action.type === 'artwork_skip') {
        const artworkVector = await this.createArtworkVector(action.artwork);
        // 스킵한 작품과 반대 방향으로 살짝 이동
        for (let i = 0; i < evolvedVector.length; i++) {
          evolvedVector[i] = evolvedVector[i] * (1 + evolutionRate) - 
                           artworkVector[i] * evolutionRate;
        }
      }
    }
    
    // 정규화 후 원래 APT 프로토타입과의 거리 확인
    evolvedVector = this.normalizeVector(evolvedVector);
    
    // 너무 멀어지지 않도록 제한 (원래 유형의 특성 유지)
    const prototypeVector = this.prototypeVectors[aptType];
    const similarity = this.calculateSimilarity(evolvedVector, prototypeVector);
    
    if (similarity < 0.7) { // 70% 이상 유사도 유지
      // 프로토타입 방향으로 당기기
      for (let i = 0; i < evolvedVector.length; i++) {
        evolvedVector[i] = evolvedVector[i] * 0.8 + prototypeVector[i] * 0.2;
      }
    }
    
    return this.normalizeVector(evolvedVector);
  }

  // 헬퍼 함수들
  normalizeVector(vector) {
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    if (magnitude === 0) return vector;
    return vector.map(val => val / magnitude);
  }

  // 전시 벡터 생성
  async createExhibitionVector(exhibition) {
    const description = `
전시 정보:
제목: ${exhibition.title}
미술관: ${exhibition.museum}
기간: ${exhibition.period || ''}
주제: ${exhibition.theme || ''}
큐레이터 노트: ${exhibition.curatorNote || ''}

참여 작가: ${(exhibition.artists || []).join(', ')}
주요 작품: ${(exhibition.featuredWorks || []).join(', ')}

전시 특성:
- 규모: ${exhibition.scale || '중형'} 전시
- 인터랙티브 요소: ${exhibition.hasInteractive ? '있음' : '없음'}
- 교육 프로그램: ${exhibition.hasEducation ? '있음' : '없음'}
- 도슨트: ${exhibition.hasDocent ? '있음' : '없음'}
`;

    const response = await createEmbeddingWithRetry(description);

    return response.data[0].embedding;
  }
}

module.exports = APTVectorSystem;