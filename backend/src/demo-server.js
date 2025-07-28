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

// Demo chatbot endpoint
app.post('/api/chatbot/message', (req, res) => {
  const { message, artworkId } = req.body;

  console.log('Received message:', message, 'for artwork:', artworkId);

  // Get demo responses for this artwork
  const artworkData = demoResponses[artworkId];
  if (!artworkData) {
    return res.json({
      success: false,
      message: '죄송해요, 이 작품에 대한 정보가 없어요.'
    });
  }

  // Get next response
  if (!responseIndex[artworkId]) {
    responseIndex[artworkId] = 0;
  }

  const { responses } = artworkData;
  const response = responses[responseIndex[artworkId] % responses.length];
  responseIndex[artworkId]++;

  // Simulate AI processing delay
  setTimeout(() => {
    res.json({
      success: true,
      message: response,
      suggestions: [
        '작품의 역사적 배경은?',
        '사용된 기법이 궁금해요',
        '다른 작품과의 차이점은?',
        '작가의 다른 작품도 보여줘요'
      ],
      sessionId: `demo-session-${Date.now()}`
    });
  }, 1000);
});

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
