import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'

// APT 유형별 전시 선호도 매칭 로직
const APT_EXHIBITION_PREFERENCES: Record<string, string[]> = {
  'LAEF': ['회화', '인상주의', '추상', '감성적', '몽환적'],
  'LAEC': ['전통', '고전', '우아한', '정교한'],
  'LAMF': ['실험적', '개념미술', '철학적', '직관적'],
  'LAMC': ['역사', '학술적', '전통미술', '차분한'],
  'LREF': ['세밀한', '사실주의', '풍경화', '자연'],
  'LREC': ['정밀한', '기하학적', '건축', '도면'],
  'LRMF': ['미디어아트', '디지털', '혁신적', '실험적'],
  'LRMC': ['체계적', '과학적', '구조적', '분석적'],
  'TAEF': ['대중적', '활발한', '컬러풀', '감성적'],
  'TAEC': ['사교적', '우아한', '클래식', '품격'],
  'TAMF': ['인터랙티브', '체험형', '재미있는', '호기심'],
  'TAMC': ['리더십', '전략적', '대규모', '영향력'],
  'TREF': ['다채로운', '표현적', '생동감', '화려한'],
  'TREC': ['완벽주의', '정교한', '섬세한', '우아한'],
  'TRMF': ['지혜로운', '통찰력', '깊이있는', '사색적'],
  'TRMC': ['목표지향', '체계적', '전문적', '분석적']
}

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

// Supabase에서 실시간 전시 데이터 가져오기
async function fetchCurrentExhibitions() {
  try {
    const supabase = await createClient()
    const today = new Date().toISOString().split('T')[0]
    const pastDate = new Date()
    pastDate.setMonth(pastDate.getMonth() - 3) // 3개월 전부터
    const futureDate = new Date()
    futureDate.setMonth(futureDate.getMonth() + 6) // 6개월 후까지
    const pastDateStr = pastDate.toISOString().split('T')[0]
    const futureDateStr = futureDate.toISOString().split('T')[0]
    
    // 최근 시작했거나 곧 시작할 전시 가져오기 (3개월 전 ~ 6개월 후)
    const { data: exhibitions, error } = await supabase
      .from('exhibitions')
      .select('id, title_local, venue_name, start_date, end_date, admission_fee, tags, description')
      .gte('end_date', today)    // 종료일이 오늘 이후 (아직 안 끝남)
      .gte('start_date', pastDateStr)  // 3개월 전 이후에 시작
      .lte('start_date', futureDateStr) // 6개월 이내에 시작
      .order('start_date', { ascending: false })
      .limit(150)
    
    if (error) {
      console.error('전시 데이터 가져오기 실패:', error)
      return []
    }
    
    return exhibitions || []
  } catch (error) {
    console.error('Supabase 연결 실패:', error)
    return []
  }
}

// APT 유형에 맞는 전시 매칭 점수 계산
function calculateMatchScore(exhibition: any, userType: string): number {
  const preferences = APT_EXHIBITION_PREFERENCES[userType] || []
  let score = 0
  
  // 태그와 설명에서 선호도 키워드 매칭
  const exhibitionText = `${exhibition.tags || ''} ${exhibition.description || ''} ${exhibition.title_local || ''}`.toLowerCase()
  
  preferences.forEach(pref => {
    if (exhibitionText.includes(pref.toLowerCase())) {
      score += 1
    }
  })
  
  return score
}

// 전시 추천 함수 (실시간 데이터 기반)
async function getExhibitionRecommendations(userType: string, message: string): Promise<string> {
  // Supabase에서 실시간 전시 데이터 가져오기
  const allExhibitions = await fetchCurrentExhibitions()
  
  if (allExhibitions.length === 0) {
    return '현재 전시 정보를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.'
  }
  
  // APT 유형별 매칭 점수 계산
  const scoredExhibitions = allExhibitions.map(ex => ({
    ...ex,
    matchScore: calculateMatchScore(ex, userType)
  }))
  
  // 메시지 키워드 기반 추가 필터링
  const keywords = message.toLowerCase()
  const keywordMatches = scoredExhibitions.filter(ex => {
    const exhibitionText = `${ex.title_local || ''} ${ex.venue_name || ''} ${ex.tags || ''} ${ex.description || ''}`.toLowerCase()
    return keywords.split(' ').some(keyword => 
      keyword.length > 1 && exhibitionText.includes(keyword)
    )
  })
  
  // 최종 추천 전시 선택 (키워드 매칭 우선, 없으면 APT 매칭 점수 순)
  const recommendedExhibitions = keywordMatches.length > 0 
    ? keywordMatches.sort((a, b) => b.matchScore - a.matchScore).slice(0, 3)
    : scoredExhibitions.sort((a, b) => b.matchScore - a.matchScore).slice(0, 3)
  
  if (recommendedExhibitions.length === 0) {
    return '추천할 전시를 찾을 수 없습니다.'
  }
  
  // 전시 정보 포맷팅
  return recommendedExhibitions.map(ex => {
    const startDate = ex.start_date ? new Date(ex.start_date).toLocaleDateString('ko-KR') : ''
    const endDate = ex.end_date ? new Date(ex.end_date).toLocaleDateString('ko-KR') : ''
    const dates = startDate && endDate ? `${startDate} ~ ${endDate}` : '날짜 미정'
    const price = ex.admission_fee || '가격 정보 없음'
    
    return `${ex.title_local} (${ex.venue_name}, ${dates}, ${price})`
  }).join(' / ')
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

    // 전시 추천 정보 가져오기 (비동기)
    const exhibitionInfo = (message.includes('전시') || message.includes('추천') || message.includes('어디') || message.includes('갤러리') || message.includes('미술관'))
      ? await getExhibitionRecommendations(userType, message)
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