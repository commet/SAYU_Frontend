const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// ===========================================
// MIDDLEWARE
// ===========================================

// Security
app.use(helmet());

// CORS - Vercel 프론트엔드 허용
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://sayu-frontend.vercel.app',
    'https://*.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('combined'));

// ===========================================
// API ROUTES
// ===========================================

// 🏠 홈 / 상태 확인
app.get('/', (req, res) => {
  res.json({
    service: 'SAYU Backend API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    message: '🎨 SAYU AI 미적 정체성 발견 플랫폼'
  });
});

// 🩺 헬스 체크
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: '1.0.0'
  });
});

// ===========================================
// 🎯 QUIZ API
// ===========================================

// 시나리오 퀴즈 데이터
const quizScenarios = {
  'twilight_doors': {
    id: 'twilight_doors',
    type: 'visual_choice',
    narrative: {
      ko: '황혼의 미술관. 두 개의 문이 당신을 기다립니다.',
      en: 'Museum at twilight. Two doors await you.'
    },
    choices: [
      {
        id: 'A',
        text: '소리가 들리는 문',
        visual: {
          gradient: ['#FF6B6B', '#4ECDC4', '#FFE66D'],
          animation: 'pulse_warm',
          icon: 'users'
        },
        weight: { S: 3, E: 2, F: 1 }
      },
      {
        id: 'B', 
        text: '고요가 부르는 문',
        visual: {
          gradient: ['#2E86AB', '#A23B72', '#F18F01'],
          animation: 'shimmer_cool',
          icon: 'moon'
        },
        weight: { L: 3, M: 2, C: 1 }
      }
    ]
  },
  'gallery_mood': {
    id: 'gallery_mood',
    type: 'visual_choice',
    narrative: {
      ko: '신비한 갤러리에서 당신의 감정이 작품과 공명합니다.',
      en: 'In the mysterious gallery, your emotions resonate with the artwork.'
    },
    choices: [
      {
        id: 'A',
        text: '강렬한 붉은 작품',
        visual: {
          gradient: ['#FF6B6B', '#FF8E53'],
          animation: 'flame_dance', 
          icon: 'fire'
        },
        weight: { E: 3, F: 2, S: 1 }
      },
      {
        id: 'B',
        text: '차분한 푸른 작품',
        visual: {
          gradient: ['#4ECDC4', '#44A08D'],
          animation: 'water_flow',
          icon: 'waves'
        },
        weight: { L: 3, C: 2, M: 1 }
      }
    ]
  }
};

// 퀴즈 세션 저장소 (실제로는 DB 사용)
const quizSessions = new Map();

// 🎯 퀴즈 시작
app.post('/api/quiz/start', (req, res) => {
  try {
    const sessionId = uuidv4();
    const { userPreferences = {} } = req.body;
    
    // 새 퀴즈 세션 생성
    const session = {
      id: sessionId,
      startTime: new Date().toISOString(),
      answers: [],
      scores: { L: 0, S: 0, A: 0, R: 0, M: 0, E: 0, F: 0, C: 0 },
      currentQuestionIndex: 0,
      userPreferences
    };
    
    quizSessions.set(sessionId, session);
    
    // 첫 번째 질문 반환
    const firstQuestion = quizScenarios['twilight_doors'];
    
    res.json({
      success: true,
      message: 'Quiz started successfully',
      sessionId,
      currentQuestion: firstQuestion,
      progress: {
        current: 1,
        total: Object.keys(quizScenarios).length
      }
    });
    
  } catch (error) {
    console.error('Quiz start error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start quiz',
      error: error.message
    });
  }
});

// 🎯 퀴즈 답변 처리
app.post('/api/quiz/answer', (req, res) => {
  try {
    const { sessionId, questionId, choiceId, choiceText } = req.body;
    
    if (!sessionId || !questionId || !choiceId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: sessionId, questionId, choiceId'
      });
    }
    
    const session = quizSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Quiz session not found'
      });
    }
    
    // 답변 기록
    const question = quizScenarios[questionId];
    const choice = question?.choices.find(c => c.id === choiceId);
    
    if (!choice) {
      return res.status(400).json({
        success: false,
        message: 'Invalid choice'
      });
    }
    
    // 점수 계산
    Object.entries(choice.weight || {}).forEach(([axis, value]) => {
      session.scores[axis] = (session.scores[axis] || 0) + value;
    });
    
    // 답변 저장
    session.answers.push({
      questionId,
      choiceId,
      choiceText: choice.text,
      timestamp: new Date().toISOString(),
      weight: choice.weight
    });
    
    session.currentQuestionIndex++;
    
    // 다음 질문 결정
    const questionKeys = Object.keys(quizScenarios);
    const nextQuestionKey = questionKeys[session.currentQuestionIndex];
    
    if (nextQuestionKey) {
      // 다음 질문 있음
      const nextQuestion = quizScenarios[nextQuestionKey];
      
      res.json({
        success: true,
        message: 'Answer recorded',
        sessionId,
        nextQuestion,
        progress: {
          current: session.currentQuestionIndex + 1,
          total: questionKeys.length
        }
      });
    } else {
      // 퀴즈 완료
      const result = calculatePersonalityResult(session.scores);
      
      res.json({
        success: true,
        message: 'Quiz completed',
        sessionId,
        completed: true,
        result,
        finalScores: session.scores
      });
    }
    
  } catch (error) {
    console.error('Quiz answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process answer',
      error: error.message
    });
  }
});

// 🧮 성격 결과 계산
function calculatePersonalityResult(scores) {
  // 가장 높은 점수의 축들 찾기
  const maxScore = Math.max(...Object.values(scores));
  const dominantAxes = Object.entries(scores)
    .filter(([_, score]) => score === maxScore)
    .map(([axis, _]) => axis);
  
  // 성격 유형 결정 로직 (간단 버전)
  let personalityType = 'balanced';
  let description = '균형잡힌 미적 감각을 가지고 있습니다.';
  
  if (dominantAxes.includes('L')) {
    personalityType = 'contemplative';
    description = '깊이 있는 사색을 즐기는 명상적 성격입니다.';
  } else if (dominantAxes.includes('S')) {
    personalityType = 'social';
    description = '타인과의 교감을 중시하는 사교적 성격입니다.';
  } else if (dominantAxes.includes('E')) {
    personalityType = 'energetic';
    description = '역동적이고 활기찬 에너지를 가진 성격입니다.';
  } else if (dominantAxes.includes('C')) {
    personalityType = 'creative';
    description = '창의적이고 독창적인 사고를 하는 성격입니다.';
  }
  
  return {
    personalityType,
    description,
    dominantAxes,
    scores,
    recommendations: [
      '현대 미술관 전시 관람',
      '아트 워크샵 참여',
      '미술 도서 읽기'
    ]
  };
}

// ===========================================
// ERROR HANDLING
// ===========================================

// 404 핸들러
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      'GET /',
      'GET /api/health',
      'POST /api/quiz/start',
      'POST /api/quiz/answer'
    ]
  });
});

// 글로벌 에러 핸들러
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// ===========================================
// SERVER START
// ===========================================

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SAYU Backend API running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🎨 Service: AI 미적 정체성 발견 플랫폼`);
});

module.exports = app;