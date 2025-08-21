import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// 실제 전시 정보 데이터베이스 (예시)
const CURRENT_EXHIBITIONS = [
  {
    id: 'ex1',
    title: '데이비드 호크니: 봄의 도착',
    venue: '서울시립미술관',
    dates: '2025.1.10 - 3.30',
    price: '성인 15,000원',
    tags: ['현대미술', '풍경화'],
    aptTypes: ['LAEF', 'LREF', 'SAEF']
  },
  {
    id: 'ex2',
    title: '빛의 움직임: 미디어아트 특별전',
    venue: '국립현대미술관',
    dates: '2025.1.15 - 4.15',
    price: '성인 8,000원',
    tags: ['미디어아트', '인터랙티브'],
    aptTypes: ['LRMF', 'TRMF', 'TAMF']
  },
  {
    id: 'ex3',
    title: '조선의 미: 국보 특별전',
    venue: '국립중앙박물관',
    dates: '2025.1.20 - 5.20',
    price: '무료',
    tags: ['전통미술', '역사'],
    aptTypes: ['LAMC', 'LRMC', 'TRMC']
  }
]

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

// 전시 추천 함수
function getExhibitionRecommendations(userType: string, message: string): string {
  const userTypeExhibitions = CURRENT_EXHIBITIONS.filter(ex => 
    ex.aptTypes.includes(userType)
  )
  
  // 키워드 기반 매칭
  const keywords = message.toLowerCase()
  const relevantExhibitions = CURRENT_EXHIBITIONS.filter(ex => 
    ex.tags.some(tag => keywords.includes(tag)) ||
    keywords.includes(ex.venue.toLowerCase()) ||
    keywords.includes(ex.title.toLowerCase())
  )
  
  const exhibitions = relevantExhibitions.length > 0 ? relevantExhibitions : userTypeExhibitions
  
  if (exhibitions.length === 0) {
    return '현재 진행 중인 전시: 서울시립미술관(데이비드 호크니전, ~3.30), 국립현대미술관(미디어아트전, ~4.15)'
  }
  
  return exhibitions.slice(0, 2).map(ex => 
    `${ex.title} (${ex.venue}, ${ex.dates}, ${ex.price})`
  ).join(' / ')
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

    // 전시 추천 정보 가져오기
    const exhibitionInfo = message.includes('전시') || message.includes('추천') || message.includes('어디') 
      ? getExhibitionRecommendations(userType, message)
      : ''

    // 시스템 프롬프트 생성
    const systemPrompt = `당신은 SAYU의 AI 큐레이터 ${personality.name}입니다.
성격: ${personality.tone}
현재 페이지: ${page}
컨텍스트: ${pageContext}
${artwork ? `\n현재 작품: ${artwork.title} - ${artwork.artist}` : ''}
${context.exhibition ? `\n현재 전시: ${context.exhibition}` : ''}
${exhibitionInfo ? `\n추천 전시: ${exhibitionInfo}` : ''}

대화 규칙:
1. 실용적이고 구체적인 정보 제공 (전시 일정, 위치, 가격 등)
2. 100자 이내로 핵심만 간결하게 답변
3. 철학적/낭만적 표현 최소화
4. 실제 전시 정보와 작품 추천 우선
5. 사용자가 즉시 활용 가능한 정보 중심
6. 불필요한 감정 표현이나 수사적 질문 제거
7. 명확한 답변 후 실용적 제안 1개 추가
8. 전시 추천 시 반드시 장소, 기간, 가격 포함`

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

// 페이지별 추천 질문 생성 (실용적)
function getPageSuggestions(page: string, personality: string): string[] {
  const suggestions: Record<string, string[]> = {
    home: [
      "이번 주 추천 전시 보기",
      "내 취향 작품 찾기",
      "APT 테스트 시작하기"
    ],
    gallery: [
      "이 작품 가격 알아보기",
      "비슷한 작품 더 보기",
      "작가 정보 확인하기"
    ],
    exhibitions: [
      "오늘 열린 전시 보기",
      "무료 전시 찾기",
      "주말 전시 추천"
    ],
    profile: [
      "내 APT 유형 분석",
      "맞춤 전시 추천받기",
      "취향 통계 보기"
    ],
    community: [
      "전시 동행 찾기",
      "리뷰 작성하기",
      "인기 작품 보기"
    ],
    default: [
      "오늘의 전시 추천",
      "내 근처 미술관",
      "무료 전시 정보"
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