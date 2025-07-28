// APT Vector System - 벡터 기반 추천을 위한 핵심 시스템
const { openai, createEmbeddingWithRetry } = require('../config/openai');
const { SAYU_TYPES, SAYU_FUNCTIONS } = require('@sayu/shared');

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
    
    // 병렬로 설명 생성
    const descriptionPromises = Object.entries(SAYU_TYPES).map(([typeCode, typeData]) => {
      return {
        typeCode,
        description: this.buildTypeDescription(typeCode, typeData)
      };
    });
    
    descriptionPromises.forEach(({ typeCode, description }) => {
      aptDescriptions[typeCode] = description;
    });

    // 벡터 생성을 배치로 처리 (비용 절감)
    this.prototypeVectors = {};
    const batchSize = 5; // OpenAI API 제한 고려
    const entries = Object.entries(aptDescriptions);
    
    for (let i = 0; i < entries.length; i += batchSize) {
      const batch = entries.slice(i, i + batchSize);
      
      const embeddingPromises = batch.map(async ([type, description]) => {
        const response = await createEmbeddingWithRetry(description);
        return { type, embedding: response.data[0].embedding };
      });
      
      const results = await Promise.all(embeddingPromises);
      
      results.forEach(({ type, embedding }) => {
        this.prototypeVectors[type] = embedding;
      });
    }
    
    console.log(`✓ ${Object.keys(this.prototypeVectors).length}개 APT 프로토타입 벡터 초기화 완료`);
  }

  buildTypeDescription(typeCode, typeData) {
    // 4축 분해 - 더 정교한 설명
    const axes = {
      L_S: typeCode[0] === 'L' ? '혼자' : '함께',
      A_R: typeCode[1] === 'A' ? '추상' : '구상',
      E_M: typeCode[2] === 'E' ? '감정' : '의미',
      F_C: typeCode[3] === 'F' ? '자유' : '체계'
    };

    // 각 축의 세부 특성
    const axisDetails = this.getDetailedAxisTraits(typeCode);
    
    // 인지 기능 설명
    const dominantFunc = SAYU_FUNCTIONS[typeData.dominantFunction];
    const inferiorFunc = SAYU_FUNCTIONS[typeData.inferiorFunction];
    const consciousFuncs = typeData.consciousFunctions.map(f => SAYU_FUNCTIONS[f]);
    const unconsciousFuncs = typeData.unconsciousFunctions.map(f => SAYU_FUNCTIONS[f]);
    
    // 유형별 특화된 키워드
    const specializedKeywords = this.getTypeSpecificKeywords(typeCode);
    
    // 상세한 유형 설명 구성
    return `
APT 유형: ${typeData.name} (${typeCode}) - ${typeData.nameEn}
동물 상징: ${typeData.animal} ${typeData.emoji} (${typeData.animalEn})

=== 핵심 정체성 ===
${typeData.description}

=== 4축 상세 분석 ===
1. 사회적 차원 (${axes.L_S}): ${axisDetails.social}
2. 예술 스타일 (${axes.A_R}): ${axisDetails.style}
3. 반응 방식 (${axes.E_M}): ${axisDetails.response}
4. 관람 접근 (${axes.F_C}): ${axisDetails.approach}

=== 성격 특징 ===
주요 특성: ${typeData.characteristics.join(', ')}
특화 키워드: ${specializedKeywords.join(', ')}

=== 인지 기능 체계 ===
주도 기능 (${dominantFunc.code}): ${dominantFunc.description}
  - ${dominantFunc.name}
보조 의식 기능: ${consciousFuncs.slice(1, 3).map(f => f.code).join(', ')}
열등 기능 (${inferiorFunc.code}): ${inferiorFunc.description}
무의식 그림자: ${unconsciousFuncs.slice(0, 2).map(f => f.code).join(', ')}

=== 예술 감상 스타일 ===
${this.getArtAppreciationStyle(typeCode, axes)}

=== 선호 환경 및 조건 ===
${this.getPreferredEnvironment(typeCode, axes)}

=== 행동 패턴 ===
${this.getBehaviorPatterns(typeCode)}

=== 감정적 반응 특성 ===
${this.getEmotionalResponsePattern(typeCode)}
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
    // 각 유형별 최적화된 환경 설정
    const typeEnvironments = {
      'LAEF': '몽환적 조명의 조용한 현대미술관, 평일 늦은 오후의 추상화 전시실, 명상적 사운드스케이프가 있는 공간',
      'LAEC': '작품 정보가 체계적으로 정리된 개인 오디오 가이드 제공 갤러리, 조용한 아카이브룸',
      'LAMF': '철학적 테마의 특별전, 작가의 사상이 담긴 대형 설치 작품이 있는 한적한 공간',
      'LAMC': '학술 자료가 풍부한 대학 미술관, 큐레이터 노트가 상세한 기획전',
      'LREF': '자연광이 들어오는 조용한 회화 전시실, 세밀한 디테일을 볼 수 있는 조명 환경',
      'LREC': '작품별 상세 설명이 있는 클래식한 미술관, 체계적 동선의 개인 관람 코스',
      'LRMF': '다양한 해석이 가능한 상징주의 작품전, 자유로운 탐구가 가능한 복합 전시',
      'LRMC': '미술사 맥락이 명확한 회고전, 시대순으로 정리된 체계적 전시',
      'SAEF': '인터랙티브 미디어 아트와 관객 참여형 전시, 감정 공유가 활발한 오프닝 파티',
      'SAEC': '네트워킹 이벤트가 있는 갤러리, 체계적인 아트 토크와 워크숍',
      'SAMF': '실험적이고 도발적인 현대미술 그룹전, 자유로운 토론이 가능한 열린 공간',
      'SAMC': '교육 프로그램이 체계적인 미술관, 전문가 강연과 세미나가 정기적인 곳',
      'SREF': '친구들과 즐길 수 있는 대중적 기획전, 포토존이 있는 인스타그래머블한 전시',
      'SREC': '도슨트 투어가 잘 갖춰진 국립미술관, 가족 단위 관람객을 위한 프로그램',
      'SRMF': '스토리텔링이 풍부한 테마전, 지식 공유가 활발한 커뮤니티 갤러리',
      'SRMC': '체계적 교육 커리큘럼이 있는 미술관, 전문 강사진의 미술사 강좌'
    };
    
    return typeEnvironments[typeCode] || '각자의 취향에 맞는 다양한 전시 공간';
  }

  // 사용자의 퀴즈 응답을 벡터로 변환 - 최적화된 버전
  async createUserVector(quizResponses, aptType) {
    // 기본 벡터 복사 (메모리 최적화)
    const baseVector = new Float32Array(this.prototypeVectors[aptType]);
    
    // 유형별 특화 가중치 적용
    const typeWeights = this.getTypeSpecificWeights(aptType);
    
    // 배치 처리로 퀴즈 응답 적용
    const adjustmentBatches = this.prepareAdjustmentBatches(quizResponses, typeWeights, aptType);
    
    // 병렬 적용
    for (const batch of adjustmentBatches) {
      this.applyBatchAdjustments(baseVector, batch);
    }
    
    // 유형 일관성 보정 및 정규화
    const consistencyAdjusted = this.applyTypeConsistencyOptimized(baseVector, aptType);
    
    return Array.from(this.normalizeVectorOptimized(consistencyAdjusted));
  }
  
  prepareAdjustmentBatches(quizResponses, typeWeights, aptType) {
    const batches = [];
    const batchSize = 64; // 벡터 차원별로 배치
    
    for (const response of quizResponses) {
      const weight = response.weight || 1.0;
      const axis = response.axis;
      const questionType = response.questionType;
      
      if (this.dimensionWeights[axis]) {
        const { vector_indices } = this.dimensionWeights[axis];
        const [start, end] = vector_indices;
        const typeModifier = typeWeights[axis] || 1.0;
        const questionModifier = this.getQuestionTypeModifier(questionType, aptType);
        const adjustment = (weight - 1) * 0.15 * typeModifier * questionModifier;
        
        batches.push({
          start,
          end,
          adjustment,
          aptType
        });
      }
    }
    
    return batches;
  }
  
  applyBatchAdjustments(vector, batch) {
    const { start, end, adjustment, aptType } = batch;
    
    // SIMD 효과를 위한 언롤 루프
    const unrollFactor = 4;
    const unrolledEnd = start + Math.floor((end - start + 1) / unrollFactor) * unrollFactor;
    
    // 언롤된 루프
    for (let i = start; i < unrolledEnd; i += unrollFactor) {
      vector[i] *= (1 + adjustment);
      vector[i + 1] *= (1 + adjustment);
      vector[i + 2] *= (1 + adjustment);
      vector[i + 3] *= (1 + adjustment);
      
      // 중요 인덱스 강화
      if (this.isSignificantIndex(i, aptType)) vector[i] *= 1.05;
      if (this.isSignificantIndex(i + 1, aptType)) vector[i + 1] *= 1.05;
      if (this.isSignificantIndex(i + 2, aptType)) vector[i + 2] *= 1.05;
      if (this.isSignificantIndex(i + 3, aptType)) vector[i + 3] *= 1.05;
    }
    
    // 나머지 처리
    for (let i = unrolledEnd; i <= end; i++) {
      vector[i] *= (1 + adjustment);
      if (this.isSignificantIndex(i, aptType)) {
        vector[i] *= 1.05;
      }
    }
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

  // 벡터 간 유사도 계산 (코사인 유사도) - 최적화된 버전
  calculateSimilarity(vector1, vector2) {
    if (!vector1 || !vector2 || vector1.length !== vector2.length) {
      return 0;
    }

    // SIMD 최적화를 위한 언롤 루프
    const len = vector1.length;
    const unrollFactor = 4;
    const unrolledLen = Math.floor(len / unrollFactor) * unrollFactor;
    
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    // 언롤된 루프 (더 빠른 실행)
    for (let i = 0; i < unrolledLen; i += unrollFactor) {
      const v10 = vector1[i], v11 = vector1[i+1], v12 = vector1[i+2], v13 = vector1[i+3];
      const v20 = vector2[i], v21 = vector2[i+1], v22 = vector2[i+2], v23 = vector2[i+3];
      
      dotProduct += v10 * v20 + v11 * v21 + v12 * v22 + v13 * v23;
      norm1 += v10 * v10 + v11 * v11 + v12 * v12 + v13 * v13;
      norm2 += v20 * v20 + v21 * v21 + v22 * v22 + v23 * v23;
    }
    
    // 나머지 처리
    for (let i = unrolledLen; i < len; i++) {
      dotProduct += vector1[i] * vector2[i];
      norm1 += vector1[i] * vector1[i];
      norm2 += vector2[i] * vector2[i];
    }

    if (norm1 === 0 || norm2 === 0) return 0;
    
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  // 사용자에게 가장 적합한 작품 찾기 - 최적화된 버전
  async findBestArtworksOptimized(userVector, artworkVectors, limit = 10, options = {}) {
    const { useApproximation = false } = options;
    
    // 대용량 데이터의 경우 근사 알고리즘 사용
    if (useApproximation && artworkVectors.length > 1000) {
      return this.findBestArtworksApproximate(userVector, artworkVectors, limit);
    }
    
    // 병렬 처리를 위한 청크 분할
    const chunkSize = 100;
    const chunks = [];
    
    for (let i = 0; i < artworkVectors.length; i += chunkSize) {
      chunks.push(artworkVectors.slice(i, i + chunkSize));
    }
    
    // 병렬로 유사도 계산
    const chunkResults = await Promise.all(
      chunks.map(chunk => this.processChunk(userVector, chunk))
    );
    
    // 결과 병합 및 정렬
    const allSimilarities = chunkResults.flat();
    
    // 힐 기반 빠른 정렬 (O(n log k) 복잡도)
    return this.getTopK(allSimilarities, limit);
  }
  
  // 추가: 기존 메서드도 유지 (호환성)
  async findBestArtworks(userVector, artworkVectors, limit = 10) {
    return this.findBestArtworksOptimized(userVector, artworkVectors, limit);
  }
  
  async processChunk(userVector, chunk) {
    const similarities = [];
    
    for (const artwork of chunk) {
      const similarity = this.calculateSimilarity(userVector, artwork.vector);
      similarities.push({
        ...artwork,
        similarity,
        matchScore: Math.round(similarity * 100)
      });
    }
    
    return similarities;
  }
  
  // 근사 알고리즘 (LSH - Locality Sensitive Hashing)
  async findBestArtworksApproximate(userVector, artworkVectors, limit) {
    // 간단한 LSH 구현
    const hashBits = 8;
    const userHash = this.computeHash(userVector, hashBits);
    
    // 해시가 비슷한 후보만 선택
    const candidates = artworkVectors.filter(artwork => {
      const artworkHash = this.computeHash(artwork.vector, hashBits);
      const hammingDistance = this.hammingDistance(userHash, artworkHash);
      return hammingDistance <= 2; // 해밍 거리 2 이하
    });
    
    // 후보들에 대해서만 정확한 계산
    return this.findBestArtworks(userVector, candidates, limit);
  }
  
  // 힐 기반 top-k 선택
  getTopK(items, k) {
    if (items.length <= k) {
      return items.sort((a, b) => b.similarity - a.similarity);
    }
    
    // Min heap 사용
    const heap = items.slice(0, k).sort((a, b) => a.similarity - b.similarity);
    
    for (let i = k; i < items.length; i++) {
      if (items[i].similarity > heap[0].similarity) {
        heap[0] = items[i];
        // Heapify
        let idx = 0;
        while (true) {
          const left = 2 * idx + 1;
          const right = 2 * idx + 2;
          let smallest = idx;
          
          if (left < k && heap[left].similarity < heap[smallest].similarity) {
            smallest = left;
          }
          if (right < k && heap[right].similarity < heap[smallest].similarity) {
            smallest = right;
          }
          
          if (smallest === idx) break;
          
          [heap[idx], heap[smallest]] = [heap[smallest], heap[idx]];
          idx = smallest;
        }
      }
    }
    
    return heap.sort((a, b) => b.similarity - a.similarity);
  }
  
  // 해시 계산 (LSH용)
  computeHash(vector, bits) {
    let hash = 0;
    const step = Math.floor(vector.length / bits);
    
    for (let i = 0; i < bits; i++) {
      const idx = i * step;
      if (vector[idx] > 0) {
        hash |= (1 << i);
      }
    }
    
    return hash;
  }
  
  // 해밍 거리 계산
  hammingDistance(hash1, hash2) {
    let xor = hash1 ^ hash2;
    let distance = 0;
    
    while (xor) {
      distance += xor & 1;
      xor >>= 1;
    }
    
    return distance;
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

  // 가장 가까운 APT 유형 찾기 (누락된 메서드 구현)
  async findClosestAPT(userVector) {
    if (!this.prototypeVectors) {
      await this.initializePrototypes();
    }

    let maxSimilarity = -1;
    let closestType = null;
    const similarities = {};

    // 모든 프로토타입과 비교
    for (const [typeCode, prototypeVector] of Object.entries(this.prototypeVectors)) {
      const similarity = this.calculateSimilarity(userVector, prototypeVector);
      similarities[typeCode] = similarity;
      
      if (similarity > maxSimilarity) {
        maxSimilarity = similarity;
        closestType = typeCode;
      }
    }

    // 상위 3개 유형도 함께 반환 (추천용)
    const sortedTypes = Object.entries(similarities)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([type, score]) => ({
        type,
        score: Math.round(score * 100),
        typeInfo: SAYU_TYPES[type]
      }));

    return {
      primary: closestType,
      primaryScore: Math.round(maxSimilarity * 100),
      primaryInfo: SAYU_TYPES[closestType],
      alternatives: sortedTypes.slice(1),
      allScores: similarities
    };
  }

  // 헬퍼 함수들 - 최적화된 버전
  normalizeVectorOptimized(vector) {
    // Float32Array로 성능 향상
    const len = vector.length;
    let magnitude = 0;
    
    // 언롤 루프로 크기 계산
    const unrollFactor = 4;
    const unrolledLen = Math.floor(len / unrollFactor) * unrollFactor;
    
    for (let i = 0; i < unrolledLen; i += unrollFactor) {
      magnitude += vector[i] * vector[i] + 
                   vector[i+1] * vector[i+1] + 
                   vector[i+2] * vector[i+2] + 
                   vector[i+3] * vector[i+3];
    }
    
    for (let i = unrolledLen; i < len; i++) {
      magnitude += vector[i] * vector[i];
    }
    
    magnitude = Math.sqrt(magnitude);
    if (magnitude === 0) return vector;
    
    const invMagnitude = 1 / magnitude;
    const normalized = new Float32Array(len);
    
    // 언롤 정규화
    for (let i = 0; i < unrolledLen; i += unrollFactor) {
      normalized[i] = vector[i] * invMagnitude;
      normalized[i+1] = vector[i+1] * invMagnitude;
      normalized[i+2] = vector[i+2] * invMagnitude;
      normalized[i+3] = vector[i+3] * invMagnitude;
    }
    
    for (let i = unrolledLen; i < len; i++) {
      normalized[i] = vector[i] * invMagnitude;
    }
    
    return normalized;
  }
  
  normalizeVector(vector) {
    // 호환성을 위해 기존 메서드도 유지
    return Array.from(this.normalizeVectorOptimized(new Float32Array(vector)));
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

  // ==================== 새로운 메서드들 ====================

  // 축별 상세 특성 반환
  getDetailedAxisTraits(typeCode) {
    const traits = {
      social: {
        'L': '개인적 몰입을 통해 작품과 깊은 대화를 나누며, 타인의 시선에서 자유로운 순수한 감상을 추구',
        'S': '다른 이들과 감상을 나누며 시너지를 창출하고, 공동의 미적 경험을 통해 관계를 형성'
      },
      style: {
        'A': '형태와 색채의 자유로운 해석을 즐기며, 무의식과 상상력을 자극하는 추상적 표현에 매력을 느낌',
        'R': '현실의 재현과 구체적 형상에서 안정감을 찾으며, 정교한 기법과 사실적 묘사를 높이 평가'
      },
      response: {
        'E': '작품이 불러일으키는 즉각적 감정에 민감하게 반응하며, 직관적이고 정서적인 교감을 중시',
        'M': '작품의 상징과 메시지를 분석하고 해석하며, 지적 탐구와 의미 발견에서 만족을 얻음'
      },
      approach: {
        'F': '즉흥적이고 유연한 관람 방식을 선호하며, 우연한 발견과 예상치 못한 경험을 환영',
        'C': '계획적이고 체계적인 관람을 통해 효율성을 추구하며, 구조화된 경험에서 안정감을 느낌'
      }
    };

    return {
      social: traits.social[typeCode[0]],
      style: traits.style[typeCode[1]],
      response: traits.response[typeCode[2]],
      approach: traits.approach[typeCode[3]]
    };
  }

  // 유형별 특화 키워드
  getTypeSpecificKeywords(typeCode) {
    const keywords = {
      'LAEF': ['몽상가', '색채 민감성', '정서적 자유', '내적 여행', '감각적 직관'],
      'LAEC': ['감정 분석가', '미적 체계', '섬세한 관찰', '감성 아카이브', '정서적 큐레이션'],
      'LAMF': ['의미 탐험가', '철학적 사유', '상징 해석', '개념적 자유', '심층 통찰'],
      'LAMC': ['지식 수집가', '학술적 접근', '체계적 분석', '이론적 틀', '미술사적 맥락'],
      'LREF': ['세밀한 관찰자', '감각적 포착', '정서적 디테일', '시각적 시', '고요한 감동'],
      'LREC': ['미적 완벽주의자', '기법 분석', '감정적 정확성', '세부 감상', '구조적 아름다움'],
      'LRMF': ['이야기 발굴가', '자유로운 해석', '서사적 상상', '다층적 의미', '창의적 분석'],
      'LRMC': ['미술 연구자', '역사적 고찰', '학문적 깊이', '체계적 이해', '전문적 통찰'],
      'SAEF': ['감정 전파자', '공감적 교류', '집단적 감성', '열정적 공유', '정서적 연대'],
      'SAEC': ['감성 조직가', '네트워크 구축', '체계적 교류', '감정적 리더십', '커뮤니티 형성'],
      'SAMF': ['영감 촉매제', '의미 확산', '토론 주도', '아이디어 공유', '지적 자극'],
      'SAMC': ['문화 설계자', '교육적 기획', '체계적 전파', '지식 플랫폼', '학습 촉진'],
      'SREF': ['즐거운 동반자', '감동 공유', '순간 포착', '활기찬 교감', '기쁨의 전염'],
      'SREC': ['따뜻한 길잡이', '세심한 안내', '정서적 지원', '공감적 설명', '배려의 미학'],
      'SRMF': ['지혜로운 스토리텔러', '경험 공유', '통찰력 전달', '유연한 가르침', '대화적 학습'],
      'SRMC': ['전문 교육자', '체계적 전달', '지식 구조화', '명확한 설명', '학습 설계']
    };

    return keywords[typeCode] || ['독특한', '개성적인', '창의적인', '탐구적인', '감각적인'];
  }

  // 행동 패턴 상세 설명
  getBehaviorPatterns(typeCode) {
    const patterns = {
      'LAEF': '전시장에 들어서면 먼저 전체적인 분위기를 느끼고, 끌리는 작품 앞에서 오래 머물며 내적 대화를 나눕니다. 작품 설명은 나중에 읽거나 아예 읽지 않고 순수한 감상에 집중합니다.',
      'LAEC': '입장 전 전시 정보를 미리 조사하고, 감상 중 느낀 감정을 체계적으로 기록합니다. 작품별로 일정한 시간을 할애하며 빠짐없이 관람합니다.',
      'LAMF': '작품의 철학적 배경이나 작가의 사상에 깊은 관심을 보이며, 하나의 작품에서 다양한 의미를 발견하려 노력합니다. 도록이나 비평문을 즐겨 읽습니다.',
      'LAMC': '전시의 역사적 맥락과 미술사적 위치를 파악하며 관람합니다. 작품 정보를 꼼꼼히 읽고 사진으로 기록하며, 귀가 후 추가 자료를 찾아봅니다.',
      'LREF': '조용히 작품의 디테일을 관찰하며, 빛의 변화나 붓터치 하나하나에 주목합니다. 마음에 드는 작품은 여러 각도에서 반복해서 감상합니다.',
      'LREC': '오디오 가이드나 도슨트 설명을 선호하며, 작품의 제작 기법과 보존 상태까지 세심히 살핍니다. 전시 동선을 체계적으로 따라갑니다.',
      'LRMF': '작품 속 이야기를 상상하며 자유롭게 해석하고, 개인적 경험과 연결 짓습니다. 전시장을 자유롭게 돌아다니며 영감을 받습니다.',
      'LRMC': '작품의 시대적 배경과 양식을 분석하며, 다른 작품들과의 연관성을 찾습니다. 전시 카탈로그를 구매하여 깊이 있게 연구합니다.',
      'SAEF': '함께 온 사람들과 즉각적인 감상을 나누며, SNS에 감동적인 순간을 공유합니다. 인터랙티브 작품에서 특히 적극적으로 참여합니다.',
      'SAEC': '아트 토크나 오프닝 행사에 빠지지 않고 참석하며, 새로운 예술 애호가들과 네트워킹합니다. 감상 모임을 조직하거나 주도합니다.',
      'SAMF': '작품의 의미에 대해 열정적으로 토론하며, 다양한 해석을 제시합니다. 전시 관련 강연이나 워크숍에 적극 참여합니다.',
      'SAMC': '전시 교육 프로그램을 기획하거나 참여하며, 체계적인 감상법을 다른 이들과 공유합니다. 미술관 자원봉사나 도슨트 활동을 합니다.',
      'SREF': '친구들과 즐겁게 대화하며 관람하고, 포토존에서 추억을 남깁니다. 전시와 관련된 체험 활동에 적극적으로 참여합니다.',
      'SREC': '동행자들을 세심하게 배려하며 함께 감상하고, 각자의 감상을 존중합니다. 전시 정보를 친절하게 설명하며 공유합니다.',
      'SRMF': '작품에 얽힌 흥미로운 이야기를 들려주며, 다른 이들의 호기심을 자극합니다. 자유로운 분위기에서 지식을 나눕니다.',
      'SRMC': '미술사 지식을 바탕으로 전문적인 설명을 제공하며, 체계적인 감상 가이드를 제시합니다. 교육적 가치를 중시하며 관람합니다.'
    };

    return patterns[typeCode] || '각자의 독특한 방식으로 예술을 경험하고 즐깁니다.';
  }

  // 감정적 반응 패턴
  getEmotionalResponsePattern(typeCode) {
    const emotionalPatterns = {
      'LAEF': '작품 앞에서 깊은 감정의 파도를 경험하며, 때로는 눈물을 흘리거나 가슴이 벅차오름을 느낍니다. 감정이 자유롭게 흐르도록 허용합니다.',
      'LAEC': '느낀 감정을 세밀하게 구분하고 이름 붙이며, 감정의 뉘앙스와 변화를 체계적으로 인식합니다. 감정 일기를 작성하기도 합니다.',
      'LAMF': '작품이 던지는 실존적 질문에 지적으로 자극받으며, 철학적 사유와 감정이 융합된 복잡한 반응을 보입니다.',
      'LAMC': '감정보다는 작품의 의미와 가치에 초점을 맞추며, 이성적 분석을 통해 간접적으로 감동을 경험합니다.',
      'LREF': '섬세한 디테일에서 오는 미묘한 감동을 조용히 음미하며, 내면 깊숙이 스며드는 잔잔한 울림을 느낍니다.',
      'LREC': '아름다움의 기준에 따라 감정적으로 반응하며, 완벽한 기법이나 구성에서 큰 만족감을 얻습니다.',
      'LRMF': '작품 속 이야기에 감정이입하며 상상력을 발휘하고, 개인적 경험과 연결된 깊은 공감을 느낍니다.',
      'LRMC': '역사적 중요성이나 예술사적 가치를 인식할 때 지적 감동을 느끼며, 학문적 성취감을 경험합니다.',
      'SAEF': '감정을 즉각적으로 표현하며 주변 사람들과 공유하고, 집단적 감동 속에서 더 큰 기쁨을 느낍니다.',
      'SAEC': '타인의 감상을 듣고 자신의 감정을 정리하며, 공감대 형성을 통해 감동을 배가시킵니다.',
      'SAMF': '작품의 메시지에 지적으로 흥분하며, 새로운 관점을 발견할 때 큰 희열을 느낍니다.',
      'SAMC': '교육적 가치와 문화적 영향력을 고려하며 감동하고, 이를 체계적으로 전달할 방법을 고민합니다.',
      'SREF': '순수하고 즉각적인 기쁨을 표현하며, 밝고 긍정적인 에너지로 주변을 감염시킵니다.',
      'SREC': '따뜻하고 포용적인 감정을 느끼며, 다른 이들의 감동을 세심하게 배려하고 공감합니다.',
      'SRMF': '작품에서 발견한 의미를 흥미롭게 전달하며, 지적 호기심과 감동을 동시에 자극합니다.',
      'SRMC': '전문적 지식을 바탕으로 한 깊은 이해에서 오는 만족감을 느끼며, 이를 교육적으로 활용합니다.'
    };

    return emotionalPatterns[typeCode] || '각자의 방식으로 예술과 정서적 교감을 나눕니다.';
  }

  // 유형별 특화 가중치
  getTypeSpecificWeights(aptType) {
    // 각 유형이 특히 강하게 반응하는 축
    const typeWeights = {
      'LAEF': { L_S: 1.2, A_R: 1.15, E_M: 1.3, F_C: 1.2 },
      'LAEC': { L_S: 1.2, A_R: 1.15, E_M: 1.25, F_C: 1.3 },
      'LAMF': { L_S: 1.2, A_R: 1.2, E_M: 1.3, F_C: 1.15 },
      'LAMC': { L_S: 1.2, A_R: 1.2, E_M: 1.25, F_C: 1.3 },
      'LREF': { L_S: 1.25, A_R: 1.2, E_M: 1.3, F_C: 1.1 },
      'LREC': { L_S: 1.25, A_R: 1.2, E_M: 1.2, F_C: 1.3 },
      'LRMF': { L_S: 1.2, A_R: 1.25, E_M: 1.2, F_C: 1.15 },
      'LRMC': { L_S: 1.2, A_R: 1.25, E_M: 1.15, F_C: 1.35 },
      'SAEF': { L_S: 1.3, A_R: 1.1, E_M: 1.35, F_C: 1.2 },
      'SAEC': { L_S: 1.3, A_R: 1.1, E_M: 1.3, F_C: 1.25 },
      'SAMF': { L_S: 1.35, A_R: 1.15, E_M: 1.25, F_C: 1.15 },
      'SAMC': { L_S: 1.35, A_R: 1.15, E_M: 1.2, F_C: 1.3 },
      'SREF': { L_S: 1.4, A_R: 1.2, E_M: 1.3, F_C: 1.1 },
      'SREC': { L_S: 1.4, A_R: 1.2, E_M: 1.25, F_C: 1.25 },
      'SRMF': { L_S: 1.35, A_R: 1.25, E_M: 1.2, F_C: 1.1 },
      'SRMC': { L_S: 1.35, A_R: 1.25, E_M: 1.15, F_C: 1.35 }
    };

    return typeWeights[aptType] || { L_S: 1.0, A_R: 1.0, E_M: 1.0, F_C: 1.0 };
  }

  // 질문 유형에 따른 가중치 조정
  getQuestionTypeModifier(questionType, aptType) {
    // 질문 유형별 기본 가중치
    const baseModifiers = {
      'preference': 1.0,      // 선호도 질문
      'behavior': 1.1,        // 행동 패턴 질문
      'emotion': 1.15,        // 감정 반응 질문
      'cognition': 1.05,      // 인지 스타일 질문
      'social': 1.2,          // 사회적 상호작용 질문
      'artistic': 1.25        // 예술적 취향 질문
    };

    // 특정 유형이 특정 질문에 더 민감하게 반응
    const typeSpecificModifiers = {
      'LAEF': { 'emotion': 1.3, 'artistic': 1.2 },
      'SAMC': { 'social': 1.3, 'cognition': 1.2 },
      'LRMF': { 'cognition': 1.25, 'behavior': 1.15 },
      'SREC': { 'social': 1.25, 'emotion': 1.2 }
    };

    const baseModifier = baseModifiers[questionType] || 1.0;
    const typeModifier = typeSpecificModifiers[aptType]?.[questionType] || 1.0;
    
    return baseModifier * typeModifier;
  }

  // 중요 인덱스 판별
  isSignificantIndex(index, aptType) {
    // 각 유형별로 특히 중요한 벡터 인덱스 범위
    const significantRanges = {
      'LAEF': [[0, 15], [128, 143], [192, 207]],    // L, E, F 축 강화
      'LAEC': [[0, 15], [128, 143], [240, 255]],    // L, E, C 축 강화
      'LAMF': [[0, 15], [64, 79], [176, 191]],      // L, A, M 축 강화
      'LAMC': [[0, 15], [64, 79], [240, 255]],      // L, A, C 축 강화
      'SREF': [[48, 63], [112, 127], [128, 143]],   // S, R, E 축 강화
      'SRMC': [[48, 63], [112, 127], [240, 255]]    // S, R, C 축 강화
    };

    const ranges = significantRanges[aptType] || [];
    return ranges.some(([start, end]) => index >= start && index <= end);
  }

  // 유형 일관성 보정 - 최적화된 버전
  applyTypeConsistencyOptimized(vector, aptType) {
    const prototypeVector = this.prototypeVectors[aptType];
    const len = vector.length;
    const threshold = 0.5;
    const pullFactor = 0.2;
    const keepFactor = 0.8;
    
    // 벡터리제이션을 위한 언롤
    const unrollFactor = 4;
    const unrolledLen = Math.floor(len / unrollFactor) * unrollFactor;
    
    for (let i = 0; i < unrolledLen; i += unrollFactor) {
      // 언롤된 처리
      for (let j = 0; j < unrollFactor; j++) {
        const idx = i + j;
        const diff = Math.abs(vector[idx] - prototypeVector[idx]);
        if (diff > threshold) {
          vector[idx] = vector[idx] * keepFactor + prototypeVector[idx] * pullFactor;
        }
      }
    }
    
    // 나머지 처리
    for (let i = unrolledLen; i < len; i++) {
      const diff = Math.abs(vector[i] - prototypeVector[i]);
      if (diff > threshold) {
        vector[i] = vector[i] * keepFactor + prototypeVector[i] * pullFactor;
      }
    }
    
    return vector;
  }
  
  applyTypeConsistency(vector, aptType) {
    // 호환성을 위해 유지
    const floatVector = new Float32Array(vector);
    this.applyTypeConsistencyOptimized(floatVector, aptType);
    return Array.from(floatVector);
  }

  // 아티스트 매칭을 위한 고급 알고리즘
  async findBestArtistMatches(userVector, aptType, artists, options = {}) {
    const {
      limit = 10,
      diversityBoost = true,
      personalityWeight = 0.7,
      styleWeight = 0.3
    } = options;

    const matches = [];
    
    for (const artist of artists) {
      // 아티스트 벡터 생성 (작품 스타일 + APT 유형 고려)
      const artistVector = await this.createArtistVector(artist);
      
      // 기본 유사도 계산
      const baseSimilarity = this.calculateSimilarity(userVector, artistVector);
      
      // APT 유형 간 호환성 점수
      const aptCompatibility = this.calculateAPTCompatibility(aptType, artist.aptType);
      
      // 스타일 다양성 보너스
      const diversityScore = diversityBoost ? this.calculateDiversityScore(artist, matches) : 1.0;
      
      // 최종 점수 계산
      const finalScore = (baseSimilarity * personalityWeight + 
                         aptCompatibility * styleWeight) * diversityScore;
      
      matches.push({
        artist,
        scores: {
          overall: Math.round(finalScore * 100),
          personality: Math.round(baseSimilarity * 100),
          compatibility: Math.round(aptCompatibility * 100),
          diversity: Math.round(diversityScore * 100)
        },
        matchReasons: this.generateMatchReasons(aptType, artist.aptType, finalScore)
      });
    }
    
    // 점수 기준 정렬
    matches.sort((a, b) => b.scores.overall - a.scores.overall);
    
    return matches.slice(0, limit);
  }

  // 아티스트 벡터 생성
  async createArtistVector(artist) {
    const description = `
아티스트: ${artist.name}
APT 유형: ${artist.aptType} - ${SAYU_TYPES[artist.aptType]?.name || ''}

작품 스타일: ${artist.style || ''}
주요 주제: ${artist.themes?.join(', ') || ''}
기법: ${artist.techniques?.join(', ') || ''}

대표작: ${artist.representativeWorks?.join(', ') || ''}
전시 이력: ${artist.exhibitions?.slice(0, 3).join(', ') || ''}

예술 철학: ${artist.philosophy || ''}
영향받은 작가: ${artist.influences?.join(', ') || ''}
`;

    const response = await createEmbeddingWithRetry(description);
    return response.data[0].embedding;
  }

  // APT 유형 간 호환성 계산
  calculateAPTCompatibility(userType, artistType) {
    // 같은 유형: 높은 호환성
    if (userType === artistType) return 0.9;
    
    // 축별 호환성 계산
    let compatibility = 0;
    const axes = ['L_S', 'A_R', 'E_M', 'F_C'];
    
    for (let i = 0; i < 4; i++) {
      if (userType[i] === artistType[i]) {
        compatibility += 0.2; // 같은 축: +20%
      } else {
        // 반대 축도 흥미로운 조합이 될 수 있음
        compatibility += 0.1; // 다른 축: +10%
      }
    }
    
    // 특별한 시너지 조합
    const synergyPairs = {
      'LAEF': ['SAMF', 'SREF'],  // 몽환적 방랑자와 잘 맞는 유형
      'SRMC': ['LAMC', 'LRMC'],  // 체계적 교육자와 잘 맞는 유형
      'SAEF': ['LAEF', 'SREF']   // 감성 나눔이와 잘 맞는 유형
    };
    
    if (synergyPairs[userType]?.includes(artistType)) {
      compatibility += 0.2; // 시너지 보너스
    }
    
    return Math.min(compatibility, 1.0);
  }

  // 다양성 점수 계산
  calculateDiversityScore(artist, currentMatches) {
    if (currentMatches.length === 0) return 1.0;
    
    // 이미 매칭된 아티스트들과의 중복도 확인
    let diversityScore = 1.0;
    
    for (const match of currentMatches.slice(0, 5)) { // 상위 5개만 확인
      if (match.artist.style === artist.style) {
        diversityScore *= 0.9; // 같은 스타일 중복
      }
      if (match.artist.aptType === artist.aptType) {
        diversityScore *= 0.85; // 같은 APT 유형 중복
      }
    }
    
    return Math.max(diversityScore, 0.5); // 최소 50%
  }

  // 매칭 이유 생성
  generateMatchReasons(userType, artistType, score) {
    const reasons = [];
    const userInfo = SAYU_TYPES[userType];
    const artistInfo = SAYU_TYPES[artistType];
    
    if (score > 0.8) {
      reasons.push(`당신의 ${userInfo.name} 성향과 작가의 ${artistInfo.name} 스타일이 완벽한 조화를 이룹니다`);
    }
    
    // 축별 공통점 분석
    if (userType[0] === artistType[0]) {
      reasons.push(userType[0] === 'L' ? 
        '둘 다 개인적이고 깊이 있는 감상을 추구합니다' : 
        '함께 예술을 나누는 것을 좋아하는 공통점이 있습니다');
    }
    
    if (userType[1] === artistType[1]) {
      reasons.push(userType[1] === 'A' ? 
        '추상적 표현에 대한 공통된 애정을 가지고 있습니다' : 
        '구상적 묘사의 아름다움을 함께 추구합니다');
    }
    
    return reasons;
  }
}

module.exports = APTVectorSystem;