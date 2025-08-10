const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3006;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3007',
    'http://localhost:3008',
    'https://sayu.vercel.app'
  ],
  credentials: true
}));
app.use(express.json());

// Simple in-memory storage for demo
const demoResponses = {
  'demo-1': {
    title: '별이 빛나는 밤',
    artist: '빈센트 반 고흐',
    responses: [
      '정말 반가워요! 별이 빛나는 밤의 소용돌이치는 하늘이 마음에 드시나요?',
      '고흐는 이 작품을 1889년 생폴 요양원에서 그렸어요. 창밖으로 보이는 풍경에서 영감을 받았답니다.',
      '이 그림의 하늘은 실제로는 존재하지 않는 환상적인 모습이에요. 고흐의 상상력이 만들어낸 것이죠.',
      '별들이 마치 살아있는 것처럼 빛나고 있어요. 어떤 부분이 가장 인상적이신가요?'
    ]
  },
  'demo-2': {
    title: '모나리자',
    artist: '레오나르도 다 빈치',
    responses: [
      '모나리자의 신비로운 미소가 정말 매력적이죠! 그 미소에 어떤 감정이 담겨있다고 생각하세요?',
      '다 빈치는 이 작품을 4년에 걸쳐 완성했어요. 스푸마토 기법으로 경계선을 흐리게 처리했답니다.',
      '모나리자의 시선은 어디를 보고 있는지 항상 궁금해요. 보는 각도에 따라 다르게 느껴지거든요.',
      '이 그림은 현재 파리 루브르 박물관에 있어요. 방탄유리로 보호받고 있답니다.'
    ]
  },
  'demo-3': {
    title: '절규',
    artist: '에드바르 뭉크',
    responses: [
      '절규의 강렬한 감정이 전달되시나요? 뭉크가 표현하고 싶었던 불안과 공포가 느껴져요.',
      '이 작품은 오슬로 피요르드에서 산책하던 중 핏빛 하늘을 보고 영감을 받았어요.',
      '인물의 표정이 정말 인상적이에요. 현대인의 심리적 불안을 잘 표현했다고 생각해요.',
      '색채의 대비가 감정을 더욱 강렬하게 만들어주네요. 어떤 감정이 가장 강하게 느껴지시나요?'
    ]
  }
};

const responseIndex = {};

// Demo chatbot endpoint - Universal MIYU assistant
app.post('/api/chatbot/message', (req, res) => {
  const { message, artworkId, artwork, context } = req.body;

  console.log('Received message:', message, 'for context:', artworkId, context);

  // Handle general SAYU questions first
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('sayu') || lowerMessage.includes('서비스') || lowerMessage.includes('뭔가')) {
    return setTimeout(() => {
      res.json({
        success: true,
        message: 'SAYU는 16가지 성격 유형을 바탕으로 개인 맞춤 예술 추천을 제공하는 서비스예요! 🎨 당신만의 예술 취향을 발견하고, 비슷한 성향의 사람들과 연결될 수 있어요.',
        suggestions: [
          '성격 테스트는 어떻게 하나요?',
          '어떤 예술 작품이 있나요?',
          '16가지 성격 유형이 궁금해요'
        ],
        sessionId: `general-session-${Date.now()}`
      });
    }, 800);
  }

  if (lowerMessage.includes('성격') || lowerMessage.includes('테스트') || lowerMessage.includes('유형')) {
    return setTimeout(() => {
      res.json({
        success: true,
        message: '성격 테스트는 간단한 질문들을 통해 당신의 예술 감상 스타일을 파악해요. 혼자 vs 함께, 분위기 vs 사실 두 축으로 16가지 동물 유형으로 나뉘어져요! 🦊🐱🦉',
        suggestions: [
          '테스트 시작하기',
          '16가지 유형 보기',
          '내 성격은 어떻게 나올까요?'
        ],
        sessionId: `quiz-session-${Date.now()}`
      });
    }, 800);
  }

  if (lowerMessage.includes('작품') || lowerMessage.includes('추천') || lowerMessage.includes('갤러리')) {
    return setTimeout(() => {
      res.json({
        success: true,
        message: context?.pageContext?.type === 'gallery' ? 
          '멋진 작품들이 많죠! 어떤 스타일의 작품을 찾고 계신가요? 저는 당신의 성향에 맞는 작품을 추천해드릴 수 있어요.' :
          '갤러리에서 다양한 명작들을 만나보세요! 인상주의부터 현대 미술까지, 당신의 마음을 움직일 작품들이 기다리고 있어요.',
        suggestions: [
          '인상주의 작품 보기',
          '오늘의 추천 작품은?',
          '내 취향에 맞는 작품 찾기'
        ],
        sessionId: `gallery-session-${Date.now()}`
      });
    }, 800);
  }

  // Handle artwork-specific conversations
  if (artworkId && artworkId !== 'general' && demoResponses[artworkId]) {
    const artworkData = demoResponses[artworkId];
    
    if (!responseIndex[artworkId]) {
      responseIndex[artworkId] = 0;
    }

    const { responses } = artworkData;
    const response = responses[responseIndex[artworkId] % responses.length];
    responseIndex[artworkId]++;

    return setTimeout(() => {
      res.json({
        success: true,
        message: response,
        suggestions: [
          '작품의 역사적 배경은?',
          '사용된 기법이 궁금해요',
          '비슷한 작품 추천해주세요'
        ],
        sessionId: `demo-session-${Date.now()}`
      });
    }, 1000);
  }

  // Default helpful responses based on page context
  const contextualResponse = getContextualResponse(context, message);
  
  setTimeout(() => {
    res.json({
      success: true,
      message: contextualResponse.message,
      suggestions: contextualResponse.suggestions,
      sessionId: `context-session-${Date.now()}`
    });
  }, 800);
});

// Get contextual response based on page and message
function getContextualResponse(context, message) {
  const pageType = context?.pageContext?.type || 'home';
  const personalityType = context?.personalityType;
  
  // Personality-based responses
  const animalGreetings = {
    'LAEF': '신비로운 분위기가 느껴지네요... ✨',
    'SAEF': '와! 정말 신나는 질문이에요! 🦋',
    'LAMC': '차근차근 설명해드릴게요. 🐢',
    'SREF': '좋아요! 함께 알아봐요! 🐕'
  };
  
  const greeting = personalityType && animalGreetings[personalityType] ? 
    animalGreetings[personalityType] : '도움이 되도록 최선을 다할게요! 😊';

  const responses = {
    'home': {
      message: `${greeting} SAYU에 오신 것을 환영해요! 어떤 예술 여행을 시작해보실까요?`,
      suggestions: ['성격 테스트 하기', '갤러리 둘러보기', 'SAYU에 대해 더 알기']
    },
    'profile': {
      message: `${greeting} 프로필을 멋지게 꾸며보실래요? 당신의 예술 취향을 더 자세히 알아볼까요?`,
      suggestions: ['내 취향 분석하기', '저장한 작품 보기', '추천 작품 받기']
    },
    'gallery': {
      message: `${greeting} 어떤 작품을 찾고 계신가요? 마음에 드는 작품을 발견하도록 도와드릴게요!`,
      suggestions: ['인상주의 작품', '현대 미술', '오늘의 추천']
    },
    'quiz': {
      message: `${greeting} 성격 테스트를 진행하고 계시는군요! 궁금한 점이 있으면 언제든 물어보세요.`,
      suggestions: ['테스트가 어려워요', '다시 시작하고 싶어요', '결과가 궁금해요']
    },
    'community': {
      message: `${greeting} 커뮤니티에 오신 것을 환영해요! 다른 사용자들과 예술 이야기를 나눠보세요.`,
      suggestions: ['아트 클럽이 뭔가요?', '다른 사용자들과 연결하기', '커뮤니티 둘러보기']
    },
    'discover': {
      message: `${greeting} 새로운 발견의 시간이에요! 어떤 예술적 경험을 해보고 싶으신가요?`,
      suggestions: ['새로운 작품 탐색하기', '추천 받기', '트렌드 작품 보기']
    },
    'daily': {
      message: `${greeting} 오늘의 예술 습관을 함께 만들어봐요! 일상 속 예술이 어떤 변화를 가져다줄까요?`,
      suggestions: ['오늘의 추천은?', '습관 만들기 도움', '일일 챌린지 참여하기']
    },
    'results': {
      message: `${greeting} 축하해요! 당신만의 예술 성향을 발견했네요! 이제 진짜 예술 여행이 시작됩니다.`,
      suggestions: ['내 유형에 대해 자세히 알기', '추천 작품 보기', '다른 유형과 비교하기']
    },
    'exhibition': {
      message: `${greeting} 특별한 전시를 둘러보고 계시네요! 어떤 작품부터 보실래요?`,
      suggestions: ['전시 하이라이트 보기', '큐레이터 노트', '관람 순서 추천']
    },
    'unknown': {
      message: `${greeting} 무엇을 도와드릴까요? 예술과 관련된 모든 것을 함께 탐험해봐요!`,
      suggestions: ['SAYU 둘러보기', '작품 추천받기', '도움말']
    }
  };
  
  return responses[pageType] || responses['unknown'];
}

// Demo suggestions endpoint
app.get('/api/chatbot/suggestions/:artworkId', (req, res) => {
  const { artworkId } = req.params;

  const artworkData = demoResponses[artworkId];
  if (!artworkData) {
    return res.json({
      success: false,
      suggestions: []
    });
  }

  res.json({
    success: true,
    suggestions: [
      '이 작품에 대해 알려주세요',
      '작가의 특징은 무엇인가요?',
      '어떤 시대에 그려진 작품인가요?',
      '숨겨진 의미가 있을까요?'
    ]
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      mode: 'demo'
    }
  });
});

// Feedback endpoint (dummy)
app.post('/api/chatbot/feedback', (req, res) => {
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`🎨 SAYU Demo Server running on port ${PORT}`);
  console.log(`🎯 Demo Mode: Chatbot responses ready`);
});
