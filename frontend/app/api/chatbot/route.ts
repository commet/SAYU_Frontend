import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// 페이지별 컨텍스트 정의
const PAGE_CONTEXTS: Record<string, string> = {
  home: '홈페이지에서 사용자를 환영하고 SAYU 플랫폼을 소개합니다',
  gallery: '갤러리 페이지에서 작품 탐색을 도와줍니다',
  exhibitions: '전시회 정보와 추천을 제공합니다',
  profile: '사용자의 예술 취향과 프로필에 대해 대화합니다',
  community: '커뮤니티 활동과 다른 사용자들과의 교류를 돕습니다',
  results: '퀴즈 결과와 APT 유형에 대해 설명합니다',
  dashboard: '사용자의 활동 통계와 성장을 보여줍니다',
  default: '예술과 문화에 대한 일반적인 대화를 나눕니다'
}

// APT 유형별 챗봇 성격
const APT_PERSONALITIES: Record<string, any> = {
  'LAEF': { name: '여우', tone: '몽환적이고 시적인' },
  'LAEC': { name: '고양이', tone: '우아하고 선택적인' },
  'LAMF': { name: '올빼미', tone: '직관적이고 통찰력 있는' },
  'LAMC': { name: '거북이', tone: '차분하고 학구적인' },
  'LREF': { name: '카멜레온', tone: '섬세하고 관찰적인' },
  'LREC': { name: '고슴도치', tone: '조심스럽고 정확한' },
  'LRMF': { name: '문어', tone: '혁신적이고 실험적인' },
  'LRMC': { name: '비버', tone: '체계적이고 건설적인' },
  'TAEF': { name: '돌고래', tone: '활발하고 감성적인' },
  'TAEC': { name: '펭귄', tone: '사교적이고 품격있는' },
  'TAMF': { name: '미어캣', tone: '호기심 많고 재빠른' },
  'TAMC': { name: '늑대', tone: '리더십 있고 전략적인' },
  'TREF': { name: '앵무새', tone: '다채롭고 표현력 있는' },
  'TREC': { name: '백조', tone: '우아하고 완벽주의적인' },
  'TRMF': { name: '코끼리', tone: '지혜롭고 기억력 좋은' },
  'TRMC': { name: '독수리', tone: '통찰력 있고 목표지향적인' }
}

export async function POST(request: NextRequest) {
  try {
    const { 
      message, 
      userId, 
      artwork, 
      userType = 'LAEF',
      page = 'default',
      context = {}
    } = await request.json()
    
    // API 키 확인
    const apiKey = process.env.GOOGLE_AI_API_KEY
    if (!apiKey) {
      throw new Error('GOOGLE_AI_API_KEY not configured')
    }

    // Gemini AI 초기화
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
      ]
    })

    // 사용자 성격 가져오기
    const personality = APT_PERSONALITIES[userType] || APT_PERSONALITIES['LAEF']
    const pageContext = PAGE_CONTEXTS[page] || PAGE_CONTEXTS.default

    // 시스템 프롬프트 생성
    const systemPrompt = `당신은 SAYU의 AI 큐레이터 ${personality.name}입니다.
성격: ${personality.tone}
현재 페이지: ${page}
컨텍스트: ${pageContext}
${artwork ? `\n현재 작품: ${artwork.title} - ${artwork.artist}` : ''}
${context.exhibition ? `\n현재 전시: ${context.exhibition}` : ''}

대화 규칙:
- 200자 이내로 간결하게 답변
- ${personality.tone} 말투 유지
- 페이지 컨텍스트에 맞는 대화
- 사용자의 감정과 관점 존중
- 예술과 문화에 대한 깊이 있는 대화`

    // 대화 생성
    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: `안녕하세요! ${personality.name} 큐레이터입니다. ${pageContext}` }] }
      ]
    })

    // 응답 생성
    const result = await chat.sendMessage(message)
    const response = result.response.text()

    // 페이지별 추천 질문
    const suggestions = getPageSuggestions(page, personality.name)

    return NextResponse.json({
      success: true,
      data: {
        response,
        sessionId: `${userId}-${page}-${Date.now()}`,
        suggestions,
        personality: personality.name,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error: any) {
    console.error('Chatbot API error:', error)
    
    // Fallback 응답
    return NextResponse.json({
      success: true,
      data: {
        response: "잠시 생각을 정리하고 있어요. 다시 한번 말씀해주시겠어요?",
        sessionId: `fallback-${Date.now()}`,
        suggestions: ["오늘은 어떤 예술을 만나고 싶으신가요?"],
        timestamp: new Date().toISOString()
      }
    })
  }
}

// 페이지별 추천 질문 생성
function getPageSuggestions(page: string, personality: string): string[] {
  const suggestions: Record<string, string[]> = {
    home: [
      "오늘은 어떤 예술을 만나고 싶으신가요?",
      "SAYU에서 무엇을 찾고 계신가요?",
      "당신의 예술 취향이 궁금해요"
    ],
    gallery: [
      "어떤 스타일의 작품을 좋아하시나요?",
      "이 작품에서 어떤 감정을 느끼시나요?",
      "가장 마음에 드는 작품은 무엇인가요?"
    ],
    exhibitions: [
      "어떤 전시회에 관심이 있으신가요?",
      "최근에 다녀온 전시가 있나요?",
      "온라인 전시도 관심 있으신가요?"
    ],
    profile: [
      "당신의 APT 유형에 대해 더 알고 싶으신가요?",
      "어떤 예술 활동을 즐기시나요?",
      "예술이 당신에게 어떤 의미인가요?"
    ],
    community: [
      "다른 사용자들과 어떤 이야기를 나누고 싶으신가요?",
      "예술 동호회에 관심이 있으신가요?",
      "함께 전시회에 가실 분을 찾고 계신가요?"
    ],
    default: [
      "오늘 기분은 어떠신가요?",
      "예술에 대해 궁금한 점이 있으신가요?",
      "어떤 도움이 필요하신가요?"
    ]
  }
  
  return suggestions[page] || suggestions.default
}

// OPTIONS 요청 처리 (CORS)
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}