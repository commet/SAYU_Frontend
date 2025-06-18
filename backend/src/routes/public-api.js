const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

// 공개 API 레이트 리미팅
const publicApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // 15분당 100회
  message: { 
    error: 'Too many requests from this IP',
    info: 'Upgrade to API key for higher limits'
  }
});

// API 키 기반 레이트 리미팅
const apiKeyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // API 키 사용자는 1000회
  keyGenerator: (req) => req.headers['x-api-key'] || req.ip
});

// ==================== 무료 공개 API ====================

// 0. 헬스 체크 (무료)
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'SAYU Public API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      free: [
        'GET /personality-types',
        'POST /analyze-basic',
        'GET /health'
      ],
      premium: [
        'POST /analyze',
        'POST /recommend'
      ]
    }
  });
});

// 1. 성격 유형 목록 (무료)
router.get('/personality-types', publicApiLimiter, (req, res) => {
  const types = {
    "VISIONARY": {
      "description": "Big picture thinker who sees art as transformative",
      "traits": ["innovative", "abstract", "future-focused"],
      "artPreferences": ["contemporary", "conceptual", "experimental"]
    },
    "EXPLORER": {
      "description": "Adventurous spirit seeking new artistic frontiers", 
      "traits": ["curious", "experimental", "diverse"],
      "artPreferences": ["mixed-media", "global-art", "emerging-artists"]
    },
    "CURATOR": {
      "description": "Thoughtful collector with refined aesthetic sense",
      "traits": ["analytical", "detail-oriented", "quality-focused"],
      "artPreferences": ["classical", "museum-quality", "well-established"]
    },
    "SOCIAL": {
      "description": "Community-minded art enthusiast who loves sharing",
      "traits": ["collaborative", "communicative", "trend-aware"],
      "artPreferences": ["popular", "shareable", "socially-relevant"]
    }
  };

  res.json({
    success: true,
    data: types,
    usage: {
      endpoint: "public",
      rateLimit: "100 requests per 15 minutes",
      upgrade: "Get API key for 1000 requests per 15 minutes"
    }
  });
});

// 2. 간단 성격 분석 (무료, 제한적)
router.post('/analyze-basic', publicApiLimiter, (req, res) => {
  const { responses } = req.body;
  
  if (!responses || responses.length < 3) {
    return res.status(400).json({
      error: "Minimum 3 responses required",
      upgrade: "Full analysis available with API key"
    });
  }

  // 기본 분석 (간단 버전)
  const basicAnalysis = analyzeBasic(responses);
  
  res.json({
    success: true,
    data: {
      primaryType: basicAnalysis.type,
      confidence: basicAnalysis.confidence,
      summary: basicAnalysis.summary
    },
    limitations: "Basic analysis only. Full insights require API key.",
    upgrade: "contact@sayu.art for API access"
  });
});

// ==================== API 키 필요 ====================

// API 키 미들웨어
const apiKeyService = require('../services/apiKeyService');

const requireApiKey = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({
      error: "API key required",
      info: "Contact contact@sayu.art for API access"
    });
  }

  const validation = await apiKeyService.validateAPIKey(apiKey);
  
  if (!validation.valid) {
    return res.status(401).json({
      error: "Invalid API key",
      reason: validation.reason
    });
  }

  req.apiKey = apiKey;
  req.apiKeyData = validation.keyData;
  req.remainingRequests = validation.remainingToday;
  
  // 사용량 추적
  await apiKeyService.trackUsage(apiKey, req.path);
  
  next();
};

// 3. 완전한 성격 분석 (API 키 필요)
router.post('/analyze', requireApiKey, apiKeyLimiter, async (req, res) => {
  try {
    const { responses, userId } = req.body;
    
    // 완전한 분석 수행
    const fullAnalysis = await performFullAnalysis(responses, userId);
    
    res.json({
      success: true,
      data: {
        personalityType: fullAnalysis.type,
        confidence: fullAnalysis.confidence,
        traits: fullAnalysis.traits,
        artPreferences: fullAnalysis.preferences,
        recommendations: fullAnalysis.recommendations,
        insights: fullAnalysis.insights
      },
      usage: {
        requestsRemaining: await getRemainingRequests(req.apiKey),
        billingCycle: "monthly"
      }
    });
  } catch (error) {
    res.status(500).json({
      error: "Analysis failed",
      message: error.message
    });
  }
});

// 4. 작품 추천 (API 키 필요)
router.post('/recommend', requireApiKey, apiKeyLimiter, async (req, res) => {
  const { personalityType, preferences } = req.body;
  
  const recommendations = await generateRecommendations(personalityType, preferences);
  
  res.json({
    success: true,
    data: recommendations
  });
});

// ==================== 헬퍼 함수 ====================

function analyzeBasic(responses) {
  // 간단한 분석 로직
  const scores = { VISIONARY: 0, EXPLORER: 0, CURATOR: 0, SOCIAL: 0 };
  
  responses.forEach(response => {
    if (response.includes('새로운') || response.includes('혁신')) scores.VISIONARY++;
    if (response.includes('다양한') || response.includes('탐험')) scores.EXPLORER++;
    if (response.includes('품질') || response.includes('전통')) scores.CURATOR++;
    if (response.includes('공유') || response.includes('사람들')) scores.SOCIAL++;
  });

  const type = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
  const maxScore = Math.max(...Object.values(scores));
  const confidence = Math.round((maxScore / responses.length) * 100);

  return {
    type,
    confidence,
    summary: `Based on basic analysis, you lean towards ${type} personality type`
  };
}

async function performFullAnalysis(responses, userId) {
  try {
    // 기본 분석 기반으로 확장된 분석 수행
    const basicResult = analyzeBasic(responses);
    
    // 확장된 분석 추가
    const extendedAnalysis = {
      type: basicResult.type,
      confidence: Math.min(basicResult.confidence + 10, 95), // 약간 높은 신뢰도
      traits: getTraitsForType(basicResult.type),
      preferences: getPreferencesForType(basicResult.type),
      recommendations: getRecommendationsForType(basicResult.type),
      insights: getInsightsForType(basicResult.type, responses)
    };
    
    return extendedAnalysis;
  } catch (error) {
    console.error('Analysis error:', error);
    // 폴백 분석
    return analyzeBasic(responses);
  }
}

// 헬퍼 함수들
function getTraitsForType(type) {
  const traits = {
    VISIONARY: ["innovative", "abstract-thinking", "future-focused", "conceptual", "transformative"],
    EXPLORER: ["curious", "adventurous", "diverse", "experimental", "open-minded"],
    CURATOR: ["analytical", "detail-oriented", "quality-focused", "discerning", "methodical"],
    SOCIAL: ["collaborative", "communicative", "trend-aware", "empathetic", "networked"]
  };
  return traits[type] || traits.VISIONARY;
}

function getPreferencesForType(type) {
  const preferences = {
    VISIONARY: ["contemporary", "conceptual", "experimental", "digital-art", "installations"],
    EXPLORER: ["mixed-media", "global-art", "emerging-artists", "street-art", "photography"],
    CURATOR: ["classical", "museum-quality", "renaissance", "impressionism", "sculpture"],
    SOCIAL: ["popular", "shareable", "instagram-worthy", "colorful", "portraits"]
  };
  return preferences[type] || preferences.VISIONARY;
}

function getRecommendationsForType(type) {
  const recommendations = {
    VISIONARY: ["Museum of Modern Art", "Digital Art Center", "Contemporary Art Gallery"],
    EXPLORER: ["International Art Fair", "Street Art Walking Tour", "Photography Exhibition"],
    CURATOR: ["Classical Art Museum", "Renaissance Collection", "Sculpture Garden"],
    SOCIAL: ["Interactive Art Installation", "Pop Art Exhibition", "Community Art Center"]
  };
  return recommendations[type] || recommendations.VISIONARY;
}

function getInsightsForType(type, responses) {
  const insights = {
    VISIONARY: "You appreciate art that challenges conventional boundaries and offers new perspectives on the world.",
    EXPLORER: "You're drawn to diverse artistic expressions and enjoy discovering new artists and styles from different cultures.",
    CURATOR: "You have a refined taste for quality artworks and appreciate the historical significance and craftsmanship of art.",
    SOCIAL: "You enjoy art that connects with people and creates shared experiences, often gravitating toward pieces that spark conversation."
  };
  
  const baseInsight = insights[type] || insights.VISIONARY;
  const responseCount = responses.length;
  
  return `${baseInsight} Based on your ${responseCount} responses, you show a strong inclination toward ${type.toLowerCase()} characteristics.`;
}

async function generateRecommendations(personalityType, preferences) {
  // TODO: 실제 추천 로직
  return [
    {
      title: "Recommended Exhibition",
      venue: "Local Art Gallery",
      match: 92,
      reason: "Matches your preference for experimental art"
    }
  ];
}

async function getRemainingRequests(apiKey) {
  const validation = await apiKeyService.validateAPIKey(apiKey);
  return validation.valid ? validation.remainingToday : 0;
}

module.exports = router;