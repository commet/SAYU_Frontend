# SAYU 동물 캐릭터 애니메이션 & 챗봇 구현 가이드

## 🎯 구현 목표
1. DALL-E로 생성된 동물 이미지를 활용한 최적화된 애니메이션 시스템
2. 비용 효율적인 작품 메타데이터 자동 분석 파이프라인
3. 미술 감상 전용 스코프 제한 챗봇

## 🦊 1. 동물 캐릭터 애니메이션 시스템

### A. Rive 애니메이션 (권장) - 가장 효율적

```typescript
// 1. Rive 통합 설정
// frontend/components/animal-companion/RiveAnimalCompanion.tsx

import { useRive, useStateMachineInput } from '@rive-app/react-canvas';
import { useEffect } from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';

export const RiveAnimalCompanion = () => {
  const { animalType } = useUserProfile();
  
  const { rive, RiveComponent } = useRive({
    src: `/animations/${animalType}-curator.riv`,
    stateMachines: 'CuratorStates',
    autoplay: true,
    // 파일 크기: 50-100KB (SVG 기반)
  });

  const inputs = useStateMachineInput(rive, 'CuratorStates');
  
  // 상태별 애니메이션
  const animationStates = {
    idle: () => inputs?.state.value = 0,
    thinking: () => inputs?.state.value = 1,
    excited: () => inputs?.state.value = 2,
    sleeping: () => inputs?.state.value = 3
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <RiveComponent 
        className="w-32 h-32 cursor-pointer"
        onClick={() => animationStates.excited()}
      />
    </div>
  );
};
```

#### Rive 제작 프로세스:
```bash
# 1. DALL-E 이미지 → SVG 변환
# Adobe Illustrator 또는 Inkscape 사용
# - Image Trace 기능으로 벡터화
# - 레이어 분리 (몸통, 얼굴, 꼬리 등)

# 2. Rive Editor에서 애니메이션 제작
# - 각 파트에 bone 설정
# - State Machine으로 상태 정의
# - 부드러운 전환 설정

# 3. React 컴포넌트로 export
```

### B. CSS 스프라이트 애니메이션 (최소 리소스)

```typescript
// frontend/components/animal-companion/SpriteAnimalCompanion.tsx

interface SpriteConfig {
  frameWidth: 120;
  frameHeight: 120;
  frameCount: 8;
  animationDuration: 1000; // ms
}

export const SpriteAnimalCompanion = () => {
  const { animalType } = useUserProfile();
  const [currentAnimation, setCurrentAnimation] = useState<'idle' | 'active'>('idle');
  
  return (
    <div 
      className={`animal-sprite animal-sprite--${animalType} animal-sprite--${currentAnimation}`}
      onClick={() => setCurrentAnimation(prev => prev === 'idle' ? 'active' : 'idle')}
    />
  );
};

// styles/animal-sprites.css
.animal-sprite {
  width: 120px;
  height: 120px;
  background-size: 960px 120px; /* 8 frames × 120px */
  cursor: pointer;
}

.animal-sprite--fox {
  background-image: url('/sprites/fox-sprite.png');
}

.animal-sprite--idle {
  animation: sprite-idle 1s steps(8) infinite;
}

.animal-sprite--active {
  animation: sprite-active 0.6s steps(8) infinite;
}

@keyframes sprite-idle {
  to { background-position: -960px 0; }
}
```

### C. Framer Motion 파티클 애니메이션 (현재 라이브러리 활용)

```typescript
// frontend/components/animal-companion/MotionAnimalCompanion.tsx

import { motion, AnimatePresence } from 'framer-motion';

export const MotionAnimalCompanion = () => {
  const [mood, setMood] = useState<'happy' | 'thinking' | 'sleeping'>('happy');
  
  const variants = {
    happy: {
      scale: [1, 1.1, 1],
      rotate: [-5, 5, -5],
      transition: { repeat: Infinity, duration: 2 }
    },
    thinking: {
      y: [0, -10, 0],
      transition: { repeat: Infinity, duration: 3 }
    },
    sleeping: {
      scale: 0.9,
      opacity: 0.7,
      transition: { duration: 1 }
    }
  };

  return (
    <motion.div
      className="fixed bottom-4 left-4"
      variants={variants}
      animate={mood}
      whileHover={{ scale: 1.2 }}
    >
      <img 
        src={`/images/personality-animals/main/${animalType}.png`}
        alt="Animal Curator"
        className="w-32 h-32"
      />
      
      {/* 파티클 효과 */}
      <AnimatePresence>
        {mood === 'happy' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            {[...Array(5)].map((_, i) => (
              <motion.span
                key={i}
                className="absolute text-2xl"
                initial={{ scale: 0, x: 16, y: 16 }}
                animate={{ 
                  scale: [0, 1, 0],
                  x: Math.random() * 100 - 50,
                  y: -Math.random() * 100
                }}
                transition={{ delay: i * 0.2, duration: 2 }}
              >
                ✨
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
```

## 🎨 2. 작품 메타데이터 분석 파이프라인

### A. 하이브리드 분석 시스템 (비용 최적화)

```typescript
// backend/src/services/artworkAnalysisService.js

const tf = require('@tensorflow/tfjs-node');
const sharp = require('sharp');
const ColorThief = require('colorthief');

class ArtworkAnalysisService {
  constructor() {
    this.models = {
      style: null,      // TensorFlow.js 모델
      composition: null, // 구도 분석 모델
      emotion: null     // 감정 분석 모델
    };
    this.initializeModels();
  }

  async initializeModels() {
    // 무료 오픈소스 모델 로드
    this.models.style = await tf.loadLayersModel('/models/art-style-classifier/model.json');
    this.models.composition = await tf.loadLayersModel('/models/composition-analyzer/model.json');
  }

  // 통합 분석 파이프라인
  async analyzeArtwork(imageUrl) {
    try {
      // 1. 기본 시각 특성 (무료)
      const visualFeatures = await this.analyzeVisualFeatures(imageUrl);
      
      // 2. AI 스타일 분류 (로컬 모델)
      const styleAnalysis = await this.classifyStyle(imageUrl);
      
      // 3. SAYU 성격 매핑
      const personalityMapping = this.mapToSAYUPersonality(visualFeatures, styleAnalysis);
      
      // 4. 캐싱
      await redis.setex(
        `artwork:analysis:${imageUrl}`,
        86400, // 24시간
        JSON.stringify(personalityMapping)
      );
      
      return personalityMapping;
    } catch (error) {
      console.error('Artwork analysis error:', error);
      throw error;
    }
  }

  // 시각적 특성 분석 (무료)
  async analyzeVisualFeatures(imageUrl) {
    const response = await fetch(imageUrl);
    const buffer = await response.buffer();
    
    // Sharp로 이미지 처리
    const image = sharp(buffer);
    const metadata = await image.metadata();
    
    // 색상 팔레트 추출
    const colorThief = new ColorThief();
    const dominantColors = await colorThief.getPalette(buffer, 5);
    
    // 밝기/대비 분석
    const stats = await image.stats();
    const brightness = stats.channels[0].mean / 255;
    const contrast = stats.channels[0].stdev / 128;
    
    // 구도 분석 (Rule of Thirds)
    const composition = await this.analyzeComposition(buffer);
    
    return {
      dimensions: { width: metadata.width, height: metadata.height },
      colorPalette: dominantColors.map(rgb => ({
        hex: this.rgbToHex(rgb),
        emotion: this.colorToEmotion(rgb)
      })),
      brightness,
      contrast,
      composition
    };
  }

  // TensorFlow.js로 스타일 분류
  async classifyStyle(imageUrl) {
    const imageTensor = await this.preprocessImage(imageUrl);
    const predictions = await this.models.style.predict(imageTensor).data();
    
    const styleLabels = [
      'impressionist', 'expressionist', 'abstract', 'realistic',
      'surrealist', 'minimalist', 'baroque', 'contemporary'
    ];
    
    const results = styleLabels.map((label, i) => ({
      style: label,
      confidence: predictions[i]
    })).sort((a, b) => b.confidence - a.confidence);
    
    return {
      primaryStyle: results[0].style,
      styleScores: results,
      abstractness: predictions[2], // abstract score
      technicalComplexity: this.calculateComplexity(predictions)
    };
  }

  // SAYU 성격 유형 매핑
  mapToSAYUPersonality(visualFeatures, styleAnalysis) {
    const { colorPalette, brightness, contrast, composition } = visualFeatures;
    const { abstractness, technicalComplexity } = styleAnalysis;
    
    return {
      viewingStyle: {
        lone: composition.complexity > 0.7 ? 0.8 : 0.4,
        shared: colorPalette.length > 3 && brightness > 0.6 ? 0.7 : 0.3
      },
      perceptionMode: {
        atmospheric: abstractness * 0.8 + (1 - contrast) * 0.2,
        realistic: (1 - abstractness) * 0.8 + technicalComplexity * 0.2
      },
      responseType: {
        emotional: this.calculateEmotionalScore(colorPalette, brightness),
        meaningful: composition.symbolism + styleAnalysis.conceptualDepth
      },
      explorationFit: {
        flow: composition.dynamism * 0.7 + abstractness * 0.3,
        constructive: technicalComplexity * 0.8 + (1 - abstractness) * 0.2
      }
    };
  }

  // 이미지 전처리
  async preprocessImage(imageUrl) {
    const response = await fetch(imageUrl);
    const buffer = await response.buffer();
    
    // 224x224로 리사이즈 (모델 입력 크기)
    const resized = await sharp(buffer)
      .resize(224, 224)
      .raw()
      .toBuffer();
    
    // Tensor로 변환
    return tf.node.decodeImage(resized, 3)
      .expandDims(0)
      .div(255.0);
  }
}

module.exports = new ArtworkAnalysisService();
```

### B. 배치 처리 시스템 (대량 작품 분석)

```typescript
// backend/src/services/batchArtworkProcessor.js

class BatchArtworkProcessor {
  constructor() {
    this.queue = new Bull('artwork-analysis', {
      redis: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
      }
    });
    
    this.setupWorkers();
  }

  // 작업 큐 설정
  setupWorkers() {
    this.queue.process('analyze', 3, async (job) => {
      const { artworkId, imageUrl } = job.data;
      
      try {
        // 캐시 확인
        const cached = await this.getCachedAnalysis(artworkId);
        if (cached) return cached;
        
        // 단계적 분석
        const quickAnalysis = await this.quickAnalyze(imageUrl);
        
        // 중요도에 따라 상세 분석
        if (quickAnalysis.priority > 0.7) {
          const detailedAnalysis = await this.detailedAnalyze(imageUrl);
          return this.mergeAnalysis(quickAnalysis, detailedAnalysis);
        }
        
        return quickAnalysis;
      } catch (error) {
        console.error(`Analysis failed for ${artworkId}:`, error);
        throw error;
      }
    });
  }

  // 빠른 분석 (썸네일 사용)
  async quickAnalyze(imageUrl) {
    // Cloudinary로 썸네일 생성
    const thumbnailUrl = cloudinary.url(imageUrl, {
      width: 256,
      height: 256,
      crop: 'fill',
      quality: 'auto:low'
    });
    
    return artworkAnalysisService.analyzeArtwork(thumbnailUrl);
  }

  // 박물관 컬렉션 일괄 처리
  async processMuseumCollection(museumId) {
    const artworks = await this.fetchMuseumArtworks(museumId);
    
    // 작업 큐에 추가
    const jobs = artworks.map((artwork, index) => ({
      name: 'analyze',
      data: {
        artworkId: artwork.id,
        imageUrl: artwork.imageUrl,
        priority: artwork.featured ? 1 : 0.5
      },
      opts: {
        delay: index * 1000, // 1초 간격
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000
        }
      }
    }));
    
    await this.queue.addBulk(jobs);
    
    return {
      totalArtworks: artworks.length,
      queuedJobs: jobs.length,
      estimatedTime: `${Math.ceil(artworks.length / 3)} minutes`
    };
  }
}
```

### C. 오픈소스 모델 활용

```typescript
// backend/src/services/openSourceArtAnalysis.js

const ort = require('onnxruntime-node');

class OpenSourceArtAnalysis {
  constructor() {
    this.models = {
      // CLIP 모델 (이미지-텍스트 유사도)
      clip: null,
      // WikiArt 스타일 분류기
      wikiart: null,
      // 감정 분석 모델
      emotion: null
    };
  }

  async initialize() {
    // ONNX 모델 로드 (경량화된 버전)
    this.models.clip = await ort.InferenceSession.create('/models/clip-vit-base.onnx');
    this.models.wikiart = await ort.InferenceSession.create('/models/wikiart-style.onnx');
  }

  // CLIP을 활용한 의미 분석
  async analyzeWithCLIP(imageUrl) {
    const imageEmbedding = await this.getImageEmbedding(imageUrl);
    
    // SAYU 관련 텍스트 프롬프트
    const prompts = [
      "고요하고 평화로운 작품",
      "활기차고 에너지 넘치는 작품",
      "추상적이고 몽환적인 작품",
      "사실적이고 정교한 작품",
      "감정을 자극하는 작품",
      "의미가 깊은 작품",
      "자유롭게 흐르는 작품",
      "체계적으로 구성된 작품"
    ];
    
    const textEmbeddings = await Promise.all(
      prompts.map(prompt => this.getTextEmbedding(prompt))
    );
    
    // 코사인 유사도 계산
    const similarities = textEmbeddings.map((textEmb, i) => ({
      prompt: prompts[i],
      score: this.cosineSimilarity(imageEmbedding, textEmb)
    }));
    
    return this.mapCLIPToSAYU(similarities);
  }

  // CLIP 결과를 SAYU 성격 유형으로 변환
  mapCLIPToSAYU(similarities) {
    const scores = Object.fromEntries(
      similarities.map(s => [s.prompt, s.score])
    );
    
    return {
      viewingStyle: {
        lone: scores["고요하고 평화로운 작품"],
        shared: scores["활기차고 에너지 넘치는 작품"]
      },
      perceptionMode: {
        atmospheric: scores["추상적이고 몽환적인 작품"],
        realistic: scores["사실적이고 정교한 작품"]
      },
      responseType: {
        emotional: scores["감정을 자극하는 작품"],
        meaningful: scores["의미가 깊은 작품"]
      },
      explorationFit: {
        flow: scores["자유롭게 흐르는 작품"],
        constructive: scores["체계적으로 구성된 작품"]
      }
    };
  }
}
```

## 🤖 3. 미술 전용 챗봇 시스템

### A. 스코프 제한 챗봇 아키텍처

```typescript
// backend/src/services/artCuratorChatbot.js

const { GoogleGenerativeAI } = require('@google/generative-ai');

class ArtCuratorChatbot {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ 
      model: "gemini-pro",
      safetySettings: this.getSafetySettings()
    });
    
    // 대화 컨텍스트 관리
    this.sessions = new Map();
    
    // 주제 제한 설정
    this.allowedTopics = new Set([
      'artwork', 'artist', 'technique', 'emotion', 'color',
      'composition', 'museum', 'exhibition', 'style', 'period'
    ]);
    
    // 금지 패턴
    this.blockedPatterns = [
      /코드|프로그래밍|개발/i,
      /숙제|과제|레포트/i,
      /의료|건강|진단/i,
      /투자|주식|코인/i,
      /정치|종교/i
    ];
  }

  // 안전 설정
  getSafetySettings() {
    return [
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      }
    ];
  }

  // 메시지 처리
  async processMessage(userId, message, currentArtwork) {
    try {
      // 1. 입력 검증
      const validation = await this.validateInput(message);
      if (!validation.isValid) {
        return this.getRedirectResponse(userId, validation.reason);
      }
      
      // 2. 컨텍스트 확인
      if (!currentArtwork) {
        return {
          message: this.getNoArtworkResponse(userId),
          action: 'SELECT_ARTWORK'
        };
      }
      
      // 3. 세션 관리
      const session = this.getOrCreateSession(userId, currentArtwork);
      
      // 4. AI 응답 생성
      const response = await this.generateArtResponse(
        message,
        currentArtwork,
        session
      );
      
      // 5. 응답 검증
      const validatedResponse = await this.validateOutput(response);
      
      // 6. 세션 업데이트
      this.updateSession(userId, message, validatedResponse);
      
      return {
        message: validatedResponse,
        suggestions: this.getFollowUpQuestions(currentArtwork, session)
      };
      
    } catch (error) {
      console.error('Chatbot error:', error);
      return {
        message: "죄송해요, 잠시 후 다시 시도해주세요.",
        error: true
      };
    }
  }

  // 입력 검증
  async validateInput(message) {
    // 길이 체크
    if (message.length > 500) {
      return { isValid: false, reason: 'TOO_LONG' };
    }
    
    // 금지 패턴 체크
    for (const pattern of this.blockedPatterns) {
      if (pattern.test(message)) {
        return { isValid: false, reason: 'BLOCKED_TOPIC' };
      }
    }
    
    // 주제 관련성 체크
    const topicRelevance = await this.checkTopicRelevance(message);
    if (topicRelevance < 0.5) {
      return { isValid: false, reason: 'OFF_TOPIC' };
    }
    
    return { isValid: true };
  }

  // AI 응답 생성 (미술 전용)
  async generateArtResponse(message, artwork, session) {
    const { animalType } = session;
    const personality = this.getAnimalPersonality(animalType);
    
    const systemPrompt = `
당신은 ${personality.name} 성격의 미술 큐레이터입니다.
현재 사용자와 함께 "${artwork.title}" (${artwork.artist}, ${artwork.year})를 감상하고 있습니다.

성격 특성:
- 말투: ${personality.tone}
- 관심사: ${personality.interests}
- 감상 스타일: ${personality.viewingStyle}

규칙:
1. 오직 현재 작품과 관련된 이야기만 합니다
2. ${personality.questionStyle} 스타일로 질문합니다
3. 답변은 2-3문장으로 간결하게 합니다
4. 미술과 무관한 질문은 정중히 거절합니다

금지사항:
- 코드 작성, 숙제 도움, 일반 상담
- 작품과 무관한 대화
- 500자 이상의 긴 답변
`;

    const chat = this.model.startChat({
      history: [
        {
          role: 'user',
          parts: systemPrompt
        },
        ...session.history
      ],
      generationConfig: {
        maxOutputTokens: 200,
        temperature: 0.7,
        topP: 0.8,
      }
    });

    const result = await chat.sendMessage(message);
    return result.response.text();
  }

  // 올바른 SAYU 동물별 성격 설정
  getAnimalPersonality(animalType) {
    const personalities = {
      // LA 그룹 (혼자서 + 분위기)
      'fox': { // LAEF
        name: '여우',
        tone: '몽환적이고 시적인',
        interests: '색채와 감정의 흐름',
        viewingStyle: '느리고 깊은 몰입',
        questionStyle: '감성적인'
      },
      'cat': { // LAEC
        name: '고양이',
        tone: '우아하고 선택적인',
        interests: '개인적 취향과 감정',
        viewingStyle: '취향에 맞는 작품만 깊이',
        questionStyle: '세련된'
      },
      'owl': { // LAMF
        name: '올빼미',
        tone: '직관적이고 통찰력 있는',
        interests: '숨은 의미와 상징',
        viewingStyle: '조용한 관찰과 사색',
        questionStyle: '철학적인'
      },
      'turtle': { // LAMC
        name: '거북이',
        tone: '차분하고 학구적인',
        interests: '역사와 맥락',
        viewingStyle: '체계적이고 느린',
        questionStyle: '분석적인'
      },
      
      // LR 그룹 (혼자서 + 사실)
      'chameleon': { // LREF
        name: '카멜레온',
        tone: '섬세하고 관찰적인',
        interests: '미묘한 변화와 디테일',
        viewingStyle: '환경에 따른 다각도 관찰',
        questionStyle: '정밀한'
      },
      'hedgehog': { // LREC
        name: '고슴도치',
        tone: '조심스럽고 정확한',
        interests: '기술과 감정의 균형',
        viewingStyle: '세심하고 신중한',
        questionStyle: '균형잡힌'
      },
      'octopus': { // LRMF
        name: '문어',
        tone: '혁신적이고 실험적인',
        interests: '새로운 기술과 매체',
        viewingStyle: '다양한 도구 활용',
        questionStyle: '탐구적인'
      },
      'beaver': { // LRMC
        name: '비버',
        tone: '체계적이고 연구적인',
        interests: '작가와 작품의 변천사',
        viewingStyle: '완벽한 자료 조사',
        questionStyle: '학술적인'
      },
      
      // SA 그룹 (함께 + 분위기)
      'butterfly': { // SAEF
        name: '나비',
        tone: '밝고 활기찬',
        interests: '즉각적인 감동과 나눔',
        viewingStyle: '가볍고 즐거운',
        questionStyle: '열정적인'
      },
      'penguin': { // SAEC
        name: '펭귄',
        tone: '사교적이고 네트워킹',
        interests: '사회적 연결과 교류',
        viewingStyle: '그룹 중심의 체계적',
        questionStyle: '관계적인'
      },
      'parrot': { // SAMF
        name: '앵무새',
        tone: '표현적이고 전파적인',
        interests: '메시지와 영감 공유',
        viewingStyle: '활발한 토론',
        questionStyle: '소통적인'
      },
      'deer': { // SAMC
        name: '사슴',
        tone: '우아하고 조직적인',
        interests: '문화 이벤트 기획',
        viewingStyle: '의미있는 그룹 경험',
        questionStyle: '포용적인'
      },
      
      // SR 그룹 (함께 + 사실)
      'dog': { // SREF
        name: '강아지',
        tone: '친근하고 열정적인',
        interests: '모든 전시의 하이라이트',
        viewingStyle: '신나고 활발한',
        questionStyle: '즉흥적인'
      },
      'duck': { // SREC
        name: '오리',
        tone: '따뜻하고 안내적인',
        interests: '모두의 편안한 감상',
        viewingStyle: '배려심 깊은 페이스',
        questionStyle: '친절한'
      },
      'elephant': { // SRMF
        name: '코끼리',
        tone: '지혜롭고 교육적인',
        interests: '흥미로운 지식 전달',
        viewingStyle: '자연스러운 티칭',
        questionStyle: '계몽적인'
      },
      'eagle': { // SRMC
        name: '독수리',
        tone: '전문적이고 체계적인',
        interests: '완벽한 교육 기회',
        viewingStyle: '논리적이고 순차적',
        questionStyle: '교육적인'
      }
    };
    
    return personalities[animalType] || personalities['fox'];
  }

  // 주제 이탈 시 리다이렉트 (성격별)
  getRedirectResponse(userId, reason) {
    const session = this.sessions.get(userId);
    const animalType = session?.animalType || 'fox';
    
    const responses = {
      'TOO_LONG': {
        'fox': "아, 너무 많은 이야기예요... 작품으로 돌아가 볼까요?",
        'butterfly': "와! 대신 이 작품의 이 부분이 더 신기해요!",
        'turtle': "흠, 먼저 작품을 차근차근 살펴보시죠.",
        'owl': "본질로 돌아가 작품을 다시 보시면 어떨까요?",
        'cat': "...작품이 더 흥미로운데요.",
        'chameleon': "작품의 디테일로 돌아가볼까요?",
        'dog': "앗! 작품 이야기가 더 재밌어요!",
        'elephant': "제 전문 분야로 돌아가겠습니다."
      },
      'OFF_TOPIC': {
        'fox': "저는 작품 이야기가 더 좋아요... 이 색감 보이시나요?",
        'butterfly': "앗! 그것보다 이 작품 정말 멋지지 않아요?",
        'turtle': "제 전문은 미술사입니다. 작품으로 돌아가볼까요?",
        'owl': "미술의 세계로 다시 초점을 맞춰보시죠.",
        'penguin': "우리 다같이 작품 이야기해요!",
        'octopus': "이 작품의 기술적 측면이 더 흥미롭습니다.",
        'parrot': "이 작품의 메시지가 더 중요해요!",
        'eagle': "교육적 가치가 있는 작품 분석으로 돌아가죠."
      },
      'BLOCKED_TOPIC': {
        'fox': "음... 그보다는 이 작품이 주는 느낌이 궁금해요.",
        'butterfly': "저는 예술 이야기만 할 수 있어요! 이 작품 어때요?",
        'turtle': "죄송하지만 제 분야가 아닙니다. 작품 설명을 계속할까요?",
        'owl': "제 지혜는 예술에만 한정되어 있답니다.",
        'hedgehog': "조심스럽게 작품으로 돌아가요.",
        'beaver': "제 연구 분야는 미술입니다.",
        'deer': "우아하게 미술로 돌아가요.",
        'duck': "같이 작품 보는게 더 좋을 것 같아요."
      }
    };
    
    return responses[reason]?.[animalType] || "작품으로 돌아가볼까요?";
  }

  // 후속 질문 생성 (성격별)
  getFollowUpQuestions(artwork, session) {
    const { animalType, viewingTime } = session;
    
    const questions = {
      // LA 그룹
      'fox': [
        "이 부분의 색이 어떤 꿈을 떠올리게 하나요?",
        "작품 속에서 가장 평화로운 곳은 어디인가요?",
        "눈을 감고 이 작품을 떠올려보세요. 무엇이 남나요?"
      ],
      'cat': [
        "이 작품이 당신의 취향과 맞는 이유는 뭘까요?",
        "가장 마음에 드는 디테일은 무엇인가요?",
        "이 작품을 소장한다면 어디에 두고 싶나요?"
      ],
      'owl': [
        "이 작품이 던지는 질문은 무엇일까요?",
        "숨겨진 상징을 발견하셨나요?",
        "작가의 의도를 넘어선 의미가 있을까요?"
      ],
      'turtle': [
        "이 시대의 다른 작품과 어떤 차이가 있을까요?",
        "작가의 생애에서 이 작품의 위치는?",
        "미술사적 맥락에서 이 작품의 의미는?"
      ],
      
      // LR 그룹
      'chameleon': [
        "조명 각도에 따라 달라지는 부분이 있나요?",
        "가장 정교한 기법이 쓰인 곳은 어디일까요?",
        "시간대별로 이 작품은 어떻게 달라 보일까요?"
      ],
      'hedgehog': [
        "기술적 완성도와 감정적 울림 중 무엇이 더 강한가요?",
        "이 붓질이 만들어내는 효과는 무엇일까요?",
        "색채 선택이 감정에 미치는 영향은?"
      ],
      'octopus': [
        "만약 디지털로 재해석한다면 어떻게 할까요?",
        "이 작품에 AR을 적용한다면?",
        "현대 기술로 확장 가능한 부분은?"
      ],
      'beaver': [
        "작가의 다른 시기 작품과 비교하면?",
        "이 기법의 발전 과정은 어땠을까요?",
        "관련 문헌에서는 뭐라고 평가할까요?"
      ],
      
      // SA 그룹
      'butterfly': [
        "친구에게 이 작품을 소개한다면 뭐라고 할까요?",
        "작품에서 가장 신나는 부분은 어디예요?",
        "이 감동을 어떻게 표현하고 싶나요?"
      ],
      'penguin': [
        "이 전시를 함께 본 사람들의 반응은 어땠나요?",
        "작품을 매개로 나눈 대화가 있나요?",
        "다음엔 누구와 함께 오고 싶나요?"
      ],
      'parrot': [
        "이 작품의 메시지를 한 문장으로 표현한다면?",
        "가장 영감을 주는 부분은 어디인가요?",
        "이 작품에서 배운 점은 무엇인가요?"
      ],
      'deer': [
        "이 작품이 주는 문화적 의미는?",
        "전시 기획 의도와 잘 맞나요?",
        "그룹 관람시 주목할 포인트는?"
      ],
      
      // SR 그룹
      'dog': [
        "이 작품의 가장 재미있는 포인트는?",
        "SNS에 올린다면 어떤 해시태그?",
        "다음에 볼 작품 추천해주실래요?"
      ],
      'duck': [
        "처음 보는 분께 어떻게 설명하면 좋을까요?",
        "이 작품의 감상 포인트 3가지는?",
        "어린이가 봐도 이해할 수 있을까요?"
      ],
      'elephant': [
        "이 작품에 얽힌 재미있는 일화가 있을까요?",
        "후대에 미친 영향은 무엇일까요?",
        "이 지식을 어떻게 활용할 수 있을까요?"
      ],
      'eagle': [
        "이 작품을 체계적으로 분석한다면?",
        "교육적 관점에서의 가치는?",
        "다음 학습 주제로 추천하신다면?"
      ]
    };
    
    // 감상 시간에 따라 다른 질문
    const timeBasedIndex = Math.min(
      Math.floor(viewingTime / 60), 
      questions[animalType].length - 1
    );
    
    return [questions[animalType][timeBasedIndex]];
  }

  // 세션 관리
  getOrCreateSession(userId, artwork) {
    if (!this.sessions.has(userId)) {
      const userProfile = this.getUserProfile(userId);
      this.sessions.set(userId, {
        userId,
        animalType: userProfile.animalType,
        currentArtwork: artwork,
        history: [],
        viewingTime: 0,
        startTime: Date.now()
      });
    }
    
    const session = this.sessions.get(userId);
    
    // 작품이 바뀌면 세션 리셋
    if (session.currentArtwork.id !== artwork.id) {
      session.currentArtwork = artwork;
      session.history = [];
      session.viewingTime = 0;
      session.startTime = Date.now();
    }
    
    return session;
  }

  // 세션 업데이트
  updateSession(userId, message, response) {
    const session = this.sessions.get(userId);
    if (!session) return;
    
    // 대화 히스토리 추가 (최대 10개 유지)
    session.history.push(
      { role: 'user', parts: message },
      { role: 'model', parts: response }
    );
    
    if (session.history.length > 20) {
      session.history = session.history.slice(-20);
    }
    
    // 감상 시간 업데이트
    session.viewingTime = Math.floor((Date.now() - session.startTime) / 1000);
    
    // 메모리 관리: 30분 이상 세션 자동 정리
    if (session.viewingTime > 1800) {
      this.sessions.delete(userId);
    }
  }
}

module.exports = new ArtCuratorChatbot();
```

### B. 레이트 리미팅 및 안전장치

```typescript
// backend/src/middleware/chatbotSafeguards.js

const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

// 레이트 리미팅
const chatbotLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1분
  max: 10, // 최대 10개 메시지
  message: '너무 많은 메시지를 보내셨어요. 잠시 후 다시 시도해주세요.',
  standardHeaders: true,
  legacyHeaders: false,
});

// 속도 제한
const chatbotSlowDown = slowDown({
  windowMs: 1 * 60 * 1000,
  delayAfter: 5,
  delayMs: 500,
  maxDelayMs: 2000,
});

// 컨텐츠 필터
const contentFilter = (req, res, next) => {
  const { message } = req.body;
  
  // 개인정보 패턴 체크
  const personalInfoPatterns = [
    /\d{6}-\d{7}/, // 주민번호
    /\d{3}-\d{3,4}-\d{4}/, // 전화번호
    /[\w._%+-]+@[\w.-]+\.[A-Za-z]{2,}/, // 이메일
  ];
  
  for (const pattern of personalInfoPatterns) {
    if (pattern.test(message)) {
      return res.status(400).json({
        error: '개인정보는 입력하지 마세요.'
      });
    }
  }
  
  // 코드 패턴 체크
  const codePatterns = [
    /function\s*\(/, 
    /console\.log/,
    /<script/i,
    /SELECT\s+\*\s+FROM/i
  ];
  
  for (const pattern of codePatterns) {
    if (pattern.test(message)) {
      return res.status(400).json({
        error: '코드는 입력할 수 없어요.'
      });
    }
  }
  
  next();
};

module.exports = {
  chatbotLimiter,
  chatbotSlowDown,
  contentFilter
};
```

### C. 프론트엔드 통합

```typescript
// frontend/components/chatbot/ArtCuratorChat.tsx

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useArtworkContext } from '@/contexts/ArtworkContext';
import { useUserProfile } from '@/hooks/useUserProfile';

export const ArtCuratorChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  const { currentArtwork } = useArtworkContext();
  const { animalType } = useUserProfile();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 초기 인사말
  useEffect(() => {
    if (currentArtwork && messages.length === 0) {
      const greeting = getGreeting(animalType, currentArtwork);
      setMessages([{ role: 'assistant', content: greeting }]);
    }
  }, [currentArtwork, animalType]);

  // 메시지 전송
  const sendMessage = async () => {
    if (!inputValue.trim() || !currentArtwork) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsTyping(true);

    try {
      const response = await fetch('/api/chatbot/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          message: userMessage,
          artworkId: currentArtwork.id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.message 
      }]);
      
      setSuggestions(data.suggestions || []);
      
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '앗, 잠시 연결이 끊겼어요. 다시 시도해주세요!' 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  // 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <>
      {/* 챗봇 토글 버튼 (동물 캐릭터) */}
      <motion.button
        className="fixed bottom-4 right-4 z-50"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <div className="relative">
          <img 
            src={`/images/personality-animals/main/${animalType}.png`}
            alt="Chat with curator"
            className="w-16 h-16"
          />
          {!isOpen && messages.length > 0 && (
            <span className="absolute -top-2 -right-2 w-3 h-3 bg-primary rounded-full" />
          )}
        </div>
      </motion.button>

      {/* 채팅 창 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 right-4 w-96 h-[500px] bg-white rounded-2xl shadow-xl z-40 flex flex-col"
          >
            {/* 헤더 */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src={`/images/personality-animals/avatar/${animalType}.png`}
                  alt="Curator"
                  className="w-10 h-10"
                />
                <div>
                  <h3 className="font-semibold">
                    {getAnimalName(animalType)} 큐레이터
                  </h3>
                  <p className="text-xs text-gray-500">
                    {currentArtwork?.title || '작품을 선택해주세요'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 메시지 영역 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 p-3 rounded-2xl">
                    <div className="flex space-x-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* 제안 질문 */}
            {suggestions.length > 0 && (
              <div className="px-4 py-2 border-t">
                <div className="flex gap-2 overflow-x-auto">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setInputValue(suggestion)}
                      className="flex-shrink-0 px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 입력 영역 */}
            <div className="p-4 border-t">
              {currentArtwork ? (
                <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="작품에 대해 물어보세요..."
                    className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
                    maxLength={200}
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isTyping}
                    className="p-2 bg-primary text-white rounded-full hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </form>
              ) : (
                <p className="text-center text-gray-500 text-sm">
                  먼저 감상할 작품을 선택해주세요
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// 올바른 동물별 인사말
function getGreeting(animalType: string, artwork: any): string {
  const greetings = {
    // LA 그룹
    'fox': `안녕하세요, ${artwork.title}의 신비로운 분위기가 느껴지시나요?`,
    'cat': `${artwork.title}... 당신의 취향에 맞을 것 같네요.`,
    'owl': `${artwork.title}에 숨겨진 의미가 궁금하시죠?`,
    'turtle': `안녕하세요. ${artwork.artist}의 ${artwork.title}, ${artwork.year}년 작품입니다.`,
    
    // LR 그룹
    'chameleon': `${artwork.title}의 세밀한 부분들을 함께 관찰해볼까요?`,
    'hedgehog': `${artwork.title}의 기법과 감정, 모두 살펴보시죠.`,
    'octopus': `${artwork.title}을 다양한 관점에서 탐구해봐요!`,
    'beaver': `${artwork.title}에 대한 깊이 있는 연구를 시작해볼까요?`,
    
    // SA 그룹
    'butterfly': `반가워요! ${artwork.title} 정말 아름답죠? 어떤 부분이 가장 마음에 드세요?`,
    'penguin': `안녕하세요! ${artwork.title}을 함께 감상하게 되어 기뻐요.`,
    'parrot': `${artwork.title}이 전하는 메시지를 함께 나눠봐요!`,
    'deer': `${artwork.title}으로 시작하는 우아한 예술 여행, 함께해요.`,
    
    // SR 그룹
    'dog': `와! ${artwork.title} 정말 멋지지 않아요? 같이 봐요!`,
    'duck': `${artwork.title}을 편안하게 감상하실 수 있도록 도와드릴게요.`,
    'elephant': `${artwork.title}에 대한 흥미로운 이야기가 많아요. 들어보실래요?`,
    'eagle': `${artwork.title}을 체계적으로 분석해드리겠습니다.`
  };
  
  return greetings[animalType] || greetings['fox'];
}

// 올바른 동물 이름 매핑
function getAnimalName(animalType: string): string {
  const names = {
    // LA 그룹
    'fox': '여우',
    'cat': '고양이',
    'owl': '올빼미',
    'turtle': '거북이',
    
    // LR 그룹
    'chameleon': '카멜레온',
    'hedgehog': '고슴도치',
    'octopus': '문어',
    'beaver': '비버',
    
    // SA 그룹
    'butterfly': '나비',
    'penguin': '펭귄',
    'parrot': '앵무새',
    'deer': '사슴',
    
    // SR 그룹
    'dog': '강아지',
    'duck': '오리',
    'elephant': '코끼리',
    'eagle': '독수리'
  };
  
  return names[animalType] || '여우';
}
```

## 📊 구현 우선순위 및 비용 분석

### 1단계 (1주일) - MVP
- CSS 스프라이트 애니메이션 구현
- TensorFlow.js 기본 모델 설정
- Google Generative AI 기본 챗봇
- 예상 비용: $0 (무료 티어 활용)

### 2단계 (2-3주) - 최적화
- Rive 애니메이션 도입
- 배치 처리 시스템 구축
- 챗봇 세션 관리 강화
- 예상 비용: $10-20/월

### 3단계 (1-2개월) - 확장
- CLIP 모델 통합
- 커스텀 모델 훈련
- 실시간 분석 파이프라인
- 예상 비용: $50-100/월

## 🔧 기술 스택 요약

### 애니메이션
- **추천**: Rive (벡터 기반, 가장 효율적)
- **대안**: CSS Sprites (가장 가벼움)
- **현재 활용 가능**: Framer Motion

### 작품 분석
- **무료**: TensorFlow.js + 오픈소스 모델
- **저비용**: Google Vision API (필요시만)
- **캐싱**: Redis로 API 호출 최소화

### 챗봇
- **추천**: Google Generative AI (이미 설치됨)
- **백업**: 로컬 Ollama 모델
- **안전장치**: 레이트 리미팅 + 컨텐츠 필터

이 구현 가이드를 통해 비용을 최소화하면서도 효과적인 시스템을 구축할 수 있습니다!