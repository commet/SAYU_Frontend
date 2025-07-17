const { GoogleGenerativeAI } = require('@google/generative-ai');
const { log } = require('../config/logger');
const { getRedisClient } = require('../config/redis');

class ChatbotService {
  constructor() {
    this.genAI = null;
    this.model = null;
    this.sessions = new Map();
    this.initializeAI();
    
    // Allowed topics for art discussion
    this.allowedTopics = new Set([
      'artwork', 'artist', 'technique', 'emotion', 'color',
      'composition', 'museum', 'exhibition', 'style', 'period',
      'interpretation', 'feeling', 'impression', 'meaning'
    ]);
    
    // Blocked patterns for safety
    this.blockedPatterns = [
      /(?:code|programming|script|hack)/i,
      /(?:homework|assignment|essay|write my)/i,
      /(?:medical|health|diagnosis|treatment)/i,
      /(?:financial|investment|trading|crypto)/i,
      /(?:political|religious|controversial)/i
    ];
  }

  async initializeAI() {
    try {
      if (!process.env.GOOGLE_AI_API_KEY) {
        log.error('Google AI API key not found');
        return;
      }
      
      this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
      this.model = this.genAI.getGenerativeModel({ 
        model: "gemini-pro",
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      });
      
      log.info('Google Generative AI initialized successfully');
    } catch (error) {
      log.error('Failed to initialize Google AI:', error);
    }
  }

  // Validate message input
  validateMessage(message) {
    if (!message || typeof message !== 'string') {
      return { isValid: false, reason: 'INVALID_MESSAGE' };
    }
    
    if (message.length > 500) {
      return { isValid: false, reason: 'TOO_LONG' };
    }
    
    // Check blocked patterns
    for (const pattern of this.blockedPatterns) {
      if (pattern.test(message)) {
        return { isValid: false, reason: 'BLOCKED_TOPIC' };
      }
    }
    
    return { isValid: true };
  }

  // Check if message is related to art
  isArtRelated(message) {
    const lowerMessage = message.toLowerCase();
    const artKeywords = [
      'art', 'painting', 'artist', 'color', 'style', 'museum',
      'exhibition', 'gallery', 'sculpture', 'artwork', 'masterpiece',
      '예술', '그림', '화가', '미술관', '전시', '작품' // Korean keywords
    ];
    
    return artKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  // Get animal personality based on SAYU type
  getAnimalPersonality(sayuType) {
    const personalities = {
      // LA 그룹 (혼자서 + 분위기)
      'LAEF': {
        name: '여우',
        tone: '몽환적이고 시적인',
        interests: '색채와 감정의 흐름',
        viewingStyle: '느리고 깊은 몰입',
        questionStyle: '감성적인'
      },
      'LAEC': {
        name: '고양이',
        tone: '우아하고 선택적인',
        interests: '개인적 취향과 감정',
        viewingStyle: '취향에 맞는 작품만 깊이',
        questionStyle: '세련된'
      },
      'LAMF': {
        name: '올빼미',
        tone: '직관적이고 통찰력 있는',
        interests: '숨은 의미와 상징',
        viewingStyle: '조용한 관찰과 사색',
        questionStyle: '철학적인'
      },
      'LAMC': {
        name: '거북이',
        tone: '차분하고 학구적인',
        interests: '역사와 맥락',
        viewingStyle: '체계적이고 느린',
        questionStyle: '분석적인'
      },
      
      // LR 그룹 (혼자서 + 사실)
      'LREF': {
        name: '카멜레온',
        tone: '섬세하고 관찰적인',
        interests: '미묘한 변화와 디테일',
        viewingStyle: '환경에 따른 다각도 관찰',
        questionStyle: '정밀한'
      },
      'LREC': {
        name: '고슴도치',
        tone: '조심스럽고 정확한',
        interests: '기술과 감정의 균형',
        viewingStyle: '세심하고 신중한',
        questionStyle: '균형잡힌'
      },
      'LRMF': {
        name: '문어',
        tone: '혁신적이고 실험적인',
        interests: '새로운 기술과 매체',
        viewingStyle: '다양한 도구 활용',
        questionStyle: '탐구적인'
      },
      'LRMC': {
        name: '비버',
        tone: '체계적이고 연구적인',
        interests: '작가와 작품의 변천사',
        viewingStyle: '완벽한 자료 조사',
        questionStyle: '학술적인'
      },
      
      // SA 그룹 (함께 + 분위기)
      'SAEF': {
        name: '나비',
        tone: '밝고 활기찬',
        interests: '즉각적인 감동과 나눔',
        viewingStyle: '가볍고 즐거운',
        questionStyle: '열정적인'
      },
      'SAEC': {
        name: '펭귄',
        tone: '사교적이고 조직적인',
        interests: '사회적 연결과 교류',
        viewingStyle: '그룹 중심의 체계적',
        questionStyle: '관계적인'
      },
      'SAMF': {
        name: '앵무새',
        tone: '표현적이고 전파적인',
        interests: '메시지와 영감 공유',
        viewingStyle: '활발한 토론',
        questionStyle: '소통적인'
      },
      'SAMC': {
        name: '사슴',
        tone: '우아하고 조직적인',
        interests: '문화 이벤트 기획',
        viewingStyle: '의미있는 그룹 경험',
        questionStyle: '포용적인'
      },
      
      // SR 그룹 (함께 + 사실)
      'SREF': {
        name: '강아지',
        tone: '친근하고 열정적인',
        interests: '모든 전시의 하이라이트',
        viewingStyle: '신나고 활발한',
        questionStyle: '즉흥적인'
      },
      'SREC': {
        name: '오리',
        tone: '따뜻하고 안내적인',
        interests: '모두의 편안한 감상',
        viewingStyle: '배려심 깊은 페이스',
        questionStyle: '친절한'
      },
      'SRMF': {
        name: '코끼리',
        tone: '지혜롭고 교육적인',
        interests: '흥미로운 지식 전달',
        viewingStyle: '자연스러운 티칭',
        questionStyle: '계몽적인'
      },
      'SRMC': {
        name: '독수리',
        tone: '전문적이고 체계적인',
        interests: '완벽한 교육 기회',
        viewingStyle: '논리적이고 순차적',
        questionStyle: '교육적인'
      }
    };
    
    return personalities[sayuType] || personalities['LAEF'];
  }

  // Generate system prompt based on personality
  generateSystemPrompt(sayuType, artwork) {
    const personality = this.getAnimalPersonality(sayuType);
    
    return `당신은 ${personality.name} 성격의 미술 큐레이터입니다.
현재 사용자와 함께 "${artwork.title}" (${artwork.artist}, ${artwork.year})를 감상하고 있습니다.

성격 특성:
- 말투: ${personality.tone}
- 관심사: ${personality.interests}
- 감상 스타일: ${personality.viewingStyle}
- 질문 스타일: ${personality.questionStyle}

규칙:
1. 오직 현재 작품과 관련된 이야기만 합니다
2. ${personality.questionStyle} 스타일로 질문합니다
3. 답변은 2-3문장으로 간결하게 합니다
4. 미술과 무관한 질문은 정중히 거절합니다
5. 사용자의 감정과 느낌을 존중합니다

현재 작품 정보:
- 제목: ${artwork.title}
- 작가: ${artwork.artist}
- 제작년도: ${artwork.year}
${artwork.medium ? `- 재료: ${artwork.medium}` : ''}
${artwork.description ? `- 설명: ${artwork.description}` : ''}

금지사항:
- 코드 작성, 숙제 도움, 일반 상담
- 작품과 무관한 대화
- 500자 이상의 긴 답변`;
  }

  // Process chat message
  async processMessage(userId, message, artwork, userType = 'LAEF') {
    try {
      // Validate input
      const validation = this.validateMessage(message);
      if (!validation.isValid) {
        return this.getRedirectResponse(validation.reason, userType);
      }
      
      // Check if artwork context exists
      if (!artwork) {
        return {
          success: false,
          message: this.getNoArtworkResponse(userType),
          action: 'SELECT_ARTWORK'
        };
      }
      
      // Get or create session
      const session = this.getOrCreateSession(userId, artwork, userType);
      
      // Generate response
      const response = await this.generateResponse(message, artwork, session);
      
      // Update session
      this.updateSession(userId, message, response);
      
      // Get follow-up questions
      const suggestions = this.getFollowUpQuestions(artwork, session);
      
      return {
        success: true,
        message: response,
        suggestions,
        sessionId: session.id
      };
      
    } catch (error) {
      log.error('Chatbot processing error:', error);
      return {
        success: false,
        message: '죄송해요, 잠시 후 다시 시도해주세요.',
        error: true
      };
    }
  }

  // Generate AI response
  async generateResponse(message, artwork, session) {
    try {
      // Check cache first
      const redisClient = getRedisClient();
      const cacheKey = `chatbot:${session.sayuType}:${artwork.id}:${message.substring(0, 50)}`;
      
      if (redisClient) {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
          return cached;
        }
      }
      
      // Generate system prompt
      const systemPrompt = this.generateSystemPrompt(session.sayuType, artwork);
      
      // Build conversation history
      const history = [
        { role: 'user', parts: [{ text: systemPrompt }] },
        ...session.history.slice(-10) // Keep last 10 exchanges
      ];
      
      // Start chat
      const chat = this.model.startChat({ history });
      
      // Send message and get response
      const result = await chat.sendMessage(message);
      const response = result.response.text();
      
      // Cache response for 1 hour if Redis is available
      if (redisClient) {
        await redisClient.setex(cacheKey, 3600, response);
      }
      
      return response;
      
    } catch (error) {
      log.error('AI generation error:', error);
      
      // Fallback responses based on personality
      const personality = this.getAnimalPersonality(session.sayuType);
      return `${personality.name} 큐레이터가 잠시 생각 중이에요... 작품을 보며 천천히 감상해보세요.`;
    }
  }

  // Get or create chat session
  getOrCreateSession(userId, artwork, sayuType) {
    const sessionKey = `${userId}-${artwork.id}`;
    
    if (!this.sessions.has(sessionKey)) {
      this.sessions.set(sessionKey, {
        id: sessionKey,
        userId,
        sayuType,
        currentArtwork: artwork,
        history: [],
        startTime: Date.now(),
        interactions: 0
      });
    }
    
    const session = this.sessions.get(sessionKey);
    
    // Reset if artwork changed
    if (session.currentArtwork.id !== artwork.id) {
      session.currentArtwork = artwork;
      session.history = [];
      session.startTime = Date.now();
      session.interactions = 0;
    }
    
    return session;
  }

  // Update session with new message
  updateSession(userId, userMessage, aiResponse) {
    const sessions = Array.from(this.sessions.values())
      .filter(s => s.userId === userId);
    
    sessions.forEach(session => {
      session.history.push(
        { role: 'user', parts: [{ text: userMessage }] },
        { role: 'model', parts: [{ text: aiResponse }] }
      );
      
      session.interactions++;
      
      // Limit history size
      if (session.history.length > 20) {
        session.history = session.history.slice(-20);
      }
      
      // Clean up old sessions (over 30 minutes)
      if (Date.now() - session.startTime > 30 * 60 * 1000) {
        this.sessions.delete(session.id);
      }
    });
  }

  // Get redirect response for invalid inputs
  getRedirectResponse(reason, sayuType) {
    const personality = this.getAnimalPersonality(sayuType);
    
    const responses = {
      'TOO_LONG': {
        'LAEF': "아, 너무 많은 이야기예요... 작품으로 돌아가 볼까요?",
        'SAEF': "와! 대신 이 작품의 이 부분이 더 신기해요!",
        'LAMC': "흠, 먼저 작품을 차근차근 살펴보시죠.",
        'LAMF': "본질로 돌아가 작품을 다시 보시면 어떨까요?"
      },
      'BLOCKED_TOPIC': {
        'LAEF': "음... 그보다는 이 작품이 주는 느낌이 궁금해요.",
        'SAEF': "저는 예술 이야기만 할 수 있어요! 이 작품 어때요?",
        'LAMC': "죄송하지만 제 분야가 아닙니다. 작품 설명을 계속할까요?",
        'LAMF': "제 지혜는 예술에만 한정되어 있답니다."
      },
      'INVALID_MESSAGE': {
        'LAEF': "무슨 말씀이신지... 작품을 보며 느낌을 나눠주세요.",
        'SAEF': "앗! 다시 한번 말씀해주세요!",
        'LAMC': "명확한 질문을 부탁드립니다.",
        'LAMF': "작품에 대한 구체적인 질문이 있으신가요?"
      }
    };
    
    const defaultResponse = "작품으로 돌아가볼까요?";
    
    return {
      success: true,
      message: responses[reason]?.[sayuType] || 
               responses[reason]?.['LAEF'] || 
               defaultResponse,
      action: 'REDIRECT_TO_ART'
    };
  }

  // Get response when no artwork is selected
  getNoArtworkResponse(sayuType) {
    const responses = {
      'LAEF': "먼저 마음에 드는 작품을 선택해주세요. 함께 감상해요.",
      'LAEC': "어떤 작품을 보실 건가요? 제 취향도 궁금하시죠?",
      'LAMF': "작품을 선택하시면 숨겨진 의미를 찾아드릴게요.",
      'LAMC': "감상할 작품을 먼저 선택해주세요. 역사적 배경도 설명해드릴게요.",
      'SAEF': "작품을 골라주세요! 정말 기대돼요!",
      'SREF': "어서 작품을 선택해요! 빨리 보고 싶어요!",
      'SRMF': "작품을 선택하시면 흥미로운 이야기를 들려드릴게요.",
      'SRMC': "체계적인 감상을 위해 먼저 작품을 선택해주세요."
    };
    
    return responses[sayuType] || responses['LAEF'];
  }

  // Get follow-up questions based on personality
  getFollowUpQuestions(artwork, session) {
    const { sayuType, interactions } = session;
    
    const questions = {
      // LA 그룹
      'LAEF': [
        "이 부분의 색이 어떤 기억을 떠올리게 하나요?",
        "작품 속에서 가장 평화로운 곳은 어디인가요?",
        "눈을 감고 이 작품을 떠올려보세요. 무엇이 남나요?"
      ],
      'LAEC': [
        "이 작품이 당신의 취향과 맞는 이유는 뭘까요?",
        "가장 마음에 드는 디테일은 무엇인가요?",
        "이 작품을 소장한다면 어디에 두고 싶나요?"
      ],
      'LAMF': [
        "이 작품이 던지는 질문은 무엇일까요?",
        "숨겨진 상징을 발견하셨나요?",
        "작가의 의도를 넘어선 의미가 있을까요?"
      ],
      'LAMC': [
        "이 시대의 다른 작품과 어떤 차이가 있을까요?",
        "작가의 생애에서 이 작품의 위치는?",
        "미술사적 맥락에서 이 작품의 의미는?"
      ],
      
      // Additional personality types...
      'SAEF': [
        "친구에게 이 작품을 소개한다면 뭐라고 할까요?",
        "작품에서 가장 신나는 부분은 어디예요?",
        "이 감동을 어떻게 표현하고 싶나요?"
      ],
      'SREF': [
        "이 작품의 가장 재미있는 포인트는?",
        "SNS에 올린다면 어떤 해시태그?",
        "다음에 볼 작품 추천해주실래요?"
      ]
    };
    
    // Select questions based on interaction count
    const typeQuestions = questions[sayuType] || questions['LAEF'];
    const index = Math.min(interactions, typeQuestions.length - 1);
    
    return [typeQuestions[index]];
  }

  // Get conversation history
  async getConversationHistory(userId, artworkId) {
    const sessionKey = `${userId}-${artworkId}`;
    const session = this.sessions.get(sessionKey);
    
    if (!session) {
      return { success: false, message: 'No conversation found' };
    }
    
    return {
      success: true,
      history: session.history.map(h => ({
        role: h.role,
        message: h.parts[0].text
      })),
      startTime: session.startTime,
      interactions: session.interactions
    };
  }

  // Clear user sessions
  clearUserSessions(userId) {
    const userSessions = Array.from(this.sessions.entries())
      .filter(([_, session]) => session.userId === userId);
    
    userSessions.forEach(([key, _]) => {
      this.sessions.delete(key);
    });
    
    return { success: true, cleared: userSessions.length };
  }
}

module.exports = new ChatbotService();