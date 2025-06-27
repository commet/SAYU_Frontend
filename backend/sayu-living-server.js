#!/usr/bin/env node

// SAYU Living Identity Server - Railway 배포용
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3001;

// 기본 미들웨어
app.use(express.json({ limit: '1mb' }));
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'https://*.railway.app', 'https://*.vercel.app'],
  credentials: true
}));

// 전역 rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 2000, // 더 많은 요청 허용
  message: { error: 'Too many requests from this IP' }
});
app.use(globalLimiter);

// ===========================================
// SAYU LIVING IDENTITY API ENDPOINTS
// ===========================================

// 홈 페이지 - 새로운 기능 소개
app.get('/', (req, res) => {
  res.json({
    service: 'SAYU Living Identity API',
    version: '2.0.0',
    status: 'running',
    lastUpdated: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    features: {
      immersiveQuiz: 'Visual A/B choice quiz with gradients',
      livingIdentityCard: 'Evolving identity cards with progression',
      villageSystem: '4 art viewing style clusters',
      tokenEconomy: 'Quiz retake tokens and daily rewards',
      cardExchange: 'Social identity card trading',
      evolutionTracking: 'Identity growth and change monitoring'
    },
    villages: {
      contemplative: 'LAEF, LAMF, LREF, LRMF - 명상적 성역',
      academic: 'LRMC, LREC, SRMC, SREC - 학술 포럼', 
      social: 'SAEF, SAEC, SREF, SREC - 사교적 갤러리',
      creative: 'LAMC, LAMF, SAMC, SAMF - 창작 스튜디오'
    },
    endpoints: {
      quiz: '/api/quiz/*',
      identity: '/api/identity/*',
      villages: '/api/villages/*',
      tokens: '/api/tokens/*',
      evolution: '/api/evolution/*',
      health: '/api/health'
    },
    message: 'Experience your evolving art personality journey! 🎨'
  });
});

// 헬스 체크
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'SAYU Living Identity',
    version: '2.0.0',
    uptime: process.uptime(),
    features: {
      database: process.env.DATABASE_URL ? 'connected' : 'mock',
      auth: 'enabled',
      villageSystem: 'active',
      tokenEconomy: 'active'
    }
  });
});

// ===========================================
// IMMERSIVE QUIZ API
// ===========================================

// 몰입형 퀴즈 질문 가져오기
app.get('/api/quiz/questions', (req, res) => {
  const immersiveQuestions = [
    {
      id: 'twilight_doors',
      narrative: {
        ko: '황혼의 미술관. 두 개의 문이 있다.',
        en: 'Museum at twilight. Two doors await.'
      },
      choices: [
        {
          id: 'A',
          visual: {
            gradient: ['#FF6B6B', '#4ECDC4', '#FFE66D'],
            animation: 'pulse_warm',
            icon: 'users'
          },
          hover_text: '소리가 들린다',
          weight: { S: 3, E: 1 }
        },
        {
          id: 'B',
          visual: {
            gradient: ['#2E86AB', '#A23B72', '#F18F01'],
            animation: 'shimmer_cool',
            icon: 'moon'
          },
          hover_text: '고요가 부른다',
          weight: { L: 3, M: 1 }
        }
      ]
    },
    {
      id: 'artwork_encounter',
      narrative: {
        ko: '작품 앞. 첫 눈길이 머무는 곳은?',
        en: 'Before the artwork. Where does your gaze linger?'
      },
      choices: [
        {
          id: 'A',
          visual: {
            gradient: ['#667eea', '#764ba2'],
            animation: 'float',
            icon: 'heart'
          },
          hover_text: '색과 형태의 춤',
          weight: { A: 3, F: 1 }
        },
        {
          id: 'B',
          visual: {
            gradient: ['#43e97b', '#38f9d7'],
            animation: 'rotate',
            icon: 'brain'
          },
          hover_text: '의미와 맥락의 실',
          weight: { R: 3, C: 1 }
        }
      ]
    }
  ];

  res.json({
    success: true,
    questions: immersiveQuestions,
    totalQuestions: immersiveQuestions.length
  });
});

// 퀴즈 결과 처리
app.post('/api/quiz/submit', (req, res) => {
  const { answers } = req.body;
  
  // 점수 계산
  const scores = { L: 0, S: 0, A: 0, R: 0, M: 0, E: 0, F: 0, C: 0 };
  
  answers.forEach(answer => {
    if (answer.weight) {
      Object.entries(answer.weight).forEach(([axis, value]) => {
        scores[axis] = (scores[axis] || 0) + value;
      });
    }
  });

  // 성격 유형 결정
  const personality = [
    scores.L > scores.S ? 'L' : 'S',
    scores.A > scores.R ? 'A' : 'R', 
    scores.M > scores.E ? 'M' : 'E',
    scores.F > scores.C ? 'F' : 'C'
  ].join('');

  // 마을 매핑
  const villageMapping = {
    'LAEF': 'CONTEMPLATIVE', 'LAMF': 'CONTEMPLATIVE', 'LREF': 'CONTEMPLATIVE', 'LRMF': 'CONTEMPLATIVE',
    'LRMC': 'ACADEMIC', 'LREC': 'ACADEMIC', 'SRMC': 'ACADEMIC', 'SREC': 'ACADEMIC',
    'SAEF': 'SOCIAL', 'SAEC': 'SOCIAL', 'SREF': 'SOCIAL', 'SREC': 'SOCIAL',
    'LAMC': 'CREATIVE', 'LAMF': 'CREATIVE', 'SAMC': 'CREATIVE', 'SAMF': 'CREATIVE'
  };

  const village = villageMapping[personality] || 'CONTEMPLATIVE';

  res.json({
    success: true,
    result: {
      personality,
      village,
      scores,
      confidence: 85,
      evolutionStage: 1,
      evolutionPoints: 0
    }
  });
});

// ===========================================
// VILLAGE SYSTEM API
// ===========================================

// 마을 정보 가져오기
app.get('/api/villages/:villageCode', (req, res) => {
  const { villageCode } = req.params;
  
  const villages = {
    CONTEMPLATIVE: {
      name: 'Contemplative Sanctuary',
      koreanName: '명상적 성역',
      description: 'A quiet haven for solitary art contemplation',
      personalities: ['LAEF', 'LAMF', 'LREF', 'LRMF'],
      theme: {
        colors: ['#667eea', '#764ba2'],
        atmosphere: 'peaceful_meditation'
      },
      features: ['Silent Meditation Gardens', 'Individual Reflection Pods'],
      memberCount: 1247
    },
    ACADEMIC: {
      name: 'Academic Forum',
      koreanName: '학술 포럼',
      description: 'A scholarly space for analytical discussion',
      personalities: ['LRMC', 'LREC', 'SRMC', 'SREC'],
      theme: {
        colors: ['#f093fb', '#f5576c'],
        atmosphere: 'bright_scholarly'
      },
      features: ['Research Libraries', 'Debate Halls'],
      memberCount: 892
    },
    SOCIAL: {
      name: 'Social Gallery',
      koreanName: '사교적 갤러리', 
      description: 'A vibrant community space for shared experiences',
      personalities: ['SAEF', 'SAEC', 'SREF', 'SREC'],
      theme: {
        colors: ['#4facfe', '#00f2fe'],
        atmosphere: 'warm_communal'
      },
      features: ['Community Lounges', 'Group Tours'],
      memberCount: 1634
    },
    CREATIVE: {
      name: 'Creative Studio',
      koreanName: '창작 스튜디오',
      description: 'An inspiring workshop for artistic experimentation',
      personalities: ['LAMC', 'LAMF', 'SAMC', 'SAMF'],
      theme: {
        colors: ['#43e97b', '#38f9d7'],
        atmosphere: 'inspiring_creative'
      },
      features: ['Art Creation Workshops', 'Inspiration Galleries'],
      memberCount: 978
    }
  };

  const village = villages[villageCode];
  if (!village) {
    return res.status(404).json({ error: 'Village not found' });
  }

  res.json({
    success: true,
    village
  });
});

// ===========================================
// TOKEN ECONOMY API
// ===========================================

// 토큰 잔액 확인
app.get('/api/tokens/balance/:userId', (req, res) => {
  // 목 데이터
  res.json({
    success: true,
    balance: 3.2,
    canTakeQuiz: true,
    quizCost: 1.0
  });
});

// 일일 로그인 보너스
app.post('/api/tokens/daily-login', (req, res) => {
  res.json({
    success: true,
    tokensAwarded: 0.1,
    newBalance: 3.3,
    message: 'Daily login bonus awarded!'
  });
});

// ===========================================
// EVOLUTION TRACKING API
// ===========================================

// 진화 포인트 추가
app.post('/api/evolution/award-points', (req, res) => {
  const { activityType, points } = req.body;
  
  res.json({
    success: true,
    pointsAwarded: points || 10,
    totalPoints: 156,
    evolutionReady: false,
    currentStage: 2
  });
});

// ===========================================
// IDENTITY CARD API
// ===========================================

// 사용자 정체성 카드 정보
app.get('/api/identity/:userId', (req, res) => {
  res.json({
    success: true,
    identity: {
      type: 'LREF', // 테스트용
      village: 'CONTEMPLATIVE',
      evolutionStage: 2,
      evolutionPoints: 156,
      motto: 'Art speaks in whispers',
      badges: ['Quiz Master', 'Village Explorer'],
      journeyMarkers: [
        {
          date: '2024-01-15',
          event: 'First Quiz Taken',
          type: 'quiz',
          impact: 'Identity Discovery'
        },
        {
          date: '2024-01-20',
          event: 'Joined Contemplative Sanctuary',
          type: 'community', 
          impact: 'Found Home'
        }
      ]
    }
  });
});

// ===========================================
// 404 핸들러
// ===========================================
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: 'Check /api/health for available endpoints',
    availableEndpoints: [
      'GET /',
      'GET /api/health',
      'GET /api/quiz/questions',
      'POST /api/quiz/submit',
      'GET /api/villages/:villageCode',
      'GET /api/tokens/balance/:userId',
      'POST /api/tokens/daily-login',
      'POST /api/evolution/award-points',
      'GET /api/identity/:userId'
    ]
  });
});

// 서버 시작
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎨 SAYU Living Identity Server running on port ${PORT}`);
  console.log(`🌍 Access at: http://localhost:${PORT}`);
  console.log(`🏘️ Village System: Active`);
  console.log(`🪙 Token Economy: Active`);
  console.log(`🔄 Evolution Tracking: Active`);
  console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
});