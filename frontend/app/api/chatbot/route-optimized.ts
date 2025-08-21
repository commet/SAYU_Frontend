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

// 캐시된 전시 데이터 (5분간 유지)
let exhibitionsCache: any[] | null = null
let cacheTimestamp = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5분

// 최적화된 전시 데이터 가져오기
async function fetchExhibitions() {
  const now = Date.now()
  
  // 캐시 확인
  if (exhibitionsCache && (now - cacheTimestamp < CACHE_DURATION)) {
    return exhibitionsCache
  }
  
  try {
    const supabase = await createClient()
    const today = new Date().toISOString().split('T')[0]
    
    // 주요 전시만 가져오기 (서울 지역, 주요 미술관 우선)
    const { data: exhibitions, error } = await supabase
      .from('exhibitions')
      .select('id, title_local, venue_name, start_date, end_date, admission_fee, tags, description')
      .gte('end_date', today)
      .eq('venue_city', '서울')
      .order('view_count', { ascending: false })
      .limit(50)
    
    if (!error && exhibitions) {
      exhibitionsCache = exhibitions
      cacheTimestamp = now
      return exhibitions
    }
    
    return []
  } catch (error) {
    console.error('전시 데이터 로드 실패:', error)
    return []
  }
}

// 간단한 전시 추천 (빠른 응답)
function getQuickRecommendations(exhibitions: any[], userType: string, message: string): any[] {
  const preferences = APT_EXHIBITION_PREFERENCES[userType] || []
  const keywords = message.toLowerCase().split(' ').filter(k => k.length > 2)
  
  // 점수 계산 (간단하게)
  const scored = exhibitions.map(ex => {
    let score = Math.random() * 2 // 랜덤성 추가로 다양성 확보
    const text = `${ex.title_local} ${ex.venue_name} ${ex.tags || ''}`.toLowerCase()
    
    // 키워드 매칭
    keywords.forEach(k => {
      if (text.includes(k)) score += 5
    })
    
    // APT 선호도
    preferences.forEach(p => {
      if (text.includes(p)) score += 2
    })
    
    // 중요 전시 보너스
    if (text.includes('이불') || text.includes('김창열') || text.includes('오랑주리')) {
      score += 10
    }
    
    return { ...ex, score }
  })
  
  // 상위 3개 선택
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
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

    const personality = APT_PERSONALITIES[userType] || APT_PERSONALITIES['LAEF']
    const pageContext = PAGE_CONTEXTS[page] || PAGE_CONTEXTS.default
    
    // 전시 관련 질문인지 확인
    const isExhibitionQuery = message.includes('전시') || message.includes('추천') || 
                             message.includes('미술관') || message.includes('갤러리') ||
                             message.includes('어디') || message.includes('근처')
    
    let exhibitionResponse = ''
    
    if (isExhibitionQuery) {
      // 전시 데이터 가져오기 (캐시 활용)
      const exhibitions = await fetchExhibitions()
      
      if (exhibitions.length > 0) {
        // 빠른 추천
        const recommendations = getQuickRecommendations(exhibitions, userType, message)
        
        if (recommendations.length > 0) {
          exhibitionResponse = recommendations.map(ex => {
            const startDate = ex.start_date ? new Date(ex.start_date).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' }) : ''
            const endDate = ex.end_date ? new Date(ex.end_date).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' }) : ''
            const price = ex.admission_fee || '문의'
            
            return `${ex.title_local} (${ex.venue_name}, ~${endDate}, ${price})`
          }).join(' / ')
        }
      }
      
      // 전시 정보가 있으면 직접 응답
      if (exhibitionResponse) {
        const directResponse = `추천 전시: ${exhibitionResponse}. ${personality.name}가 엄선한 전시예요.`
        
        return NextResponse.json({
          success: true,
          data: {
            response: directResponse,
            sessionId: `${userId}-${page}-${Date.now()}`,
            suggestions: getPageSuggestions(page, personality.name),
            personality: personality.name,
            timestamp: new Date().toISOString()
          }
        })
      }
    }

    // 일반 대화는 Gemini에게 맡김
    const systemPrompt = `당신은 SAYU의 AI 큐레이터 ${personality.name}입니다.
성격: ${personality.tone}
현재 페이지: ${page}

대화 규칙:
1. 100자 이내 간결한 답변
2. 실용적 정보 제공
3. 감정 표현 최소화`

    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: `안녕하세요! ${personality.name} 큐레이터입니다.` }] }
      ]
    })

    const result = await chat.sendMessage(message)
    const response = result.response.text()

    return NextResponse.json({
      success: true,
      data: {
        response,
        sessionId: `${userId}-${page}-${Date.now()}`,
        suggestions: getPageSuggestions(page, personality.name),
        personality: personality.name,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error: any) {
    console.error('Chatbot API error:', error)
    
    return NextResponse.json({
      success: true,
      data: {
        response: "잠시 생각을 정리하고 있어요. 다시 한번 말씀해주시겠어요?",
        sessionId: `fallback-${Date.now()}`,
        suggestions: ["오늘의 전시 추천", "내 근처 미술관", "무료 전시 정보"],
        timestamp: new Date().toISOString()
      }
    })
  }
}

// 페이지별 추천 질문 생성
function getPageSuggestions(page: string, personality: string): string[] {
  const suggestions: Record<string, string[]> = {
    home: [
      "오늘의 전시 추천",
      "이번 주 인기 전시",
      "무료 전시 보기"
    ],
    gallery: [
      "이 작품과 비슷한 전시",
      "작가의 다른 작품",
      "갤러리 정보"
    ],
    exhibitions: [
      "오늘의 전시 추천",
      "내 근처 미술관",
      "무료 전시 정보"
    ],
    profile: [
      "내 APT 유형 분석",
      "맞춤 전시 추천",
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