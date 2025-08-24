import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { promptEngine } from '@/lib/advanced-prompt-engine'
import type { PageContextV2 } from '@/lib/apt-interpreter'
import { chatbotRateLimiter } from '@/lib/rate-limiter'
import { generateWithFreeLLM } from '@/lib/free-llm-client'

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
  exhibitions: '전시 컨시어지로서 전시 예약, 관람 계획, 교통편 안내, 할인 정보 등을 종합적으로 지원하며 완벽한 전시 경험을 제공합니다',
  profile: '개인 코치로서 사용자의 예술 취향 분석, 성장 추적, 맞춤 추천을 제공하며 개인적 예술 여정을 함께 설계합니다',
  community: '소셜 가이드로서 전시 동행자 매칭, 리뷰 작성 도움, 커뮤니티 활동 참여 지원을 통해 의미있는 예술적 인맥과 경험을 연결해드립니다',
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

// 모든 개별 LLM 함수 제거 - free-llm-client.ts로 통합

// Supabase에서 실시간 전시 데이터 가져오기
async function fetchCurrentExhibitions() {
  try {
    const supabase = await createClient()
    const today = new Date().toISOString().split('T')[0]
    
    const { data: exhibitions } = await supabase
      .from('exhibitions')
      .select('id, title_local, venue_name, start_date, end_date, admission_fee, tags')
      .gte('end_date', today)
      .order('start_date', { ascending: false })
      .limit(50)
    
    return exhibitions || []
  } catch (error) {
    console.error('전시 데이터 가져오기 실패:', error)
    return []
  }
}

export async function POST(request: NextRequest) {
  console.log('🚀 Hybrid Chatbot API called')
  let userType = 'LAEF'
  
  // Rate limiting
  const clientIp = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown'
  
  if (!chatbotRateLimiter.isAllowed(clientIp)) {
    console.warn(`Rate limit exceeded for IP: ${clientIp}`)
    return NextResponse.json({
      success: false,
      error: 'Too many requests. Please try again later.',
      remainingRequests: 0
    }, { status: 429 })
  }
  
  try {
    const { 
      message, 
      userId, 
      artwork, 
      userType: requestUserType = 'LAEF',
      page = 'default',
      context = {},
      userBehavior = {},
      conversationHistory = []
    } = await request.json()
    
    userType = requestUserType
    
    console.log('📝 Request:', { 
      userType, 
      page, 
      messageLength: message?.length,
      provider: 'groq-primary'
    })
    
    // 페이지 컨텍스트 구성
    const pageContext = {
      page,
      artwork,
      exhibition: context.exhibition,
      userBehavior: {
        pageVisitCount: userBehavior.pageVisitCount || 1,
        timeOnPage: userBehavior.timeOnPage || 0,
        scrollDepth: userBehavior.scrollDepth || 0,
        clickedElements: userBehavior.clickedElements || [],
        recentArtworks: userBehavior.recentArtworks || [],
        lastActivity: Date.now(),
        engagementLevel: userBehavior.engagementLevel || 'new',
        currentMood: userBehavior.currentMood || 'exploring'
      }
    }
    
    // 무료 LLM 통합 클라이언트 사용
    console.log('🌐 Using free LLM client...')
    const { response, provider: usedProvider } = await generateWithFreeLLM(
      message,
      userType,
      pageContext,
      conversationHistory
    )
    
    if (!response) {
      // 모든 무료 API 실패시 기본 응답
      console.log('❌ All free APIs failed')
      const personality = APT_PERSONALITIES[userType]
      const fallbackResponse = `안녕하세요! 저는 ${personality.name}입니다. 잠시 연결이 불안정하네요. 다시 한 번 말씀해주시겠어요?`
      
      return NextResponse.json({
        success: true,
        data: {
          response: fallbackResponse,
          sessionId: `${userId}-${page}-${Date.now()}`,
          suggestions: generateDynamicSuggestions(pageContext, userType, artwork),
          personality: APT_PERSONALITIES[userType]?.name || '큐레이터',
          contextAnalysis: {
            engagementLevel: pageContext.userBehavior.engagementLevel,
            currentMood: pageContext.userBehavior.currentMood,
            provider: 'fallback'
          },
          timestamp: new Date().toISOString()
        }
      })
    }
    
    // 응답 길이 제한
    const limitedResponse = response.length > 1500 
      ? response.substring(0, 1500) + '...' 
      : response
    
    // 동적 추천 생성
    const suggestions = generateDynamicSuggestions(pageContext, userType, artwork)
    
    // 사용량 로깅
    console.log('📊 API Usage:', {
      timestamp: new Date().toISOString(),
      provider: usedProvider,
      userType,
      messageLength: message.length,
      responseLength: response.length,
      ip: clientIp,
      remainingRequests: chatbotRateLimiter.getRemainingRequests(clientIp)
    })
    
    return NextResponse.json({
      success: true,
      data: {
        response: limitedResponse,
        sessionId: `${userId}-${page}-${Date.now()}`,
        suggestions,
        personality: APT_PERSONALITIES[userType]?.name || '큐레이터',
        contextAnalysis: {
          engagementLevel: pageContext.userBehavior.engagementLevel,
          currentMood: pageContext.userBehavior.currentMood,
          provider: usedProvider
        },
        timestamp: new Date().toISOString()
      }
    })
    
  } catch (error: any) {
    console.error('🔴 Chatbot API error:', error)
    
    const personalityFallbacks = {
      'LAEF': "마음이 복잡해지네요... 잠시 색채 속에서 답을 찾고 있어요.",
      'SAEF': "앗! 잠깐 멈춤 상태예요. 다시 한번 말씀해주세요! 🦋",
      'LAMC': "시스템을 정리하는 중입니다. 차근차근 다시 시도해보시겠어요?",
      'TAMF': "오! 예상치 못한 상황이네요. 새로운 방식으로 다시 접근해볼까요?"
    }
    
    const fallbackResponse = personalityFallbacks[userType as keyof typeof personalityFallbacks] || 
                            "잠시 생각을 정리하고 있어요. 다시 한번 말씀해주시겠어요?"
    
    return NextResponse.json({
      success: true,
      data: {
        response: fallbackResponse,
        sessionId: `fallback-${Date.now()}`,
        suggestions: ["다른 방식으로 질문해보세요", "작품 감상부터 시작해볼까요?"],
        timestamp: new Date().toISOString()
      }
    })
  }
}

// 동적 제안 생성 함수
function generateDynamicSuggestions(context: any, userType: string, artwork?: any): string[] {
  const suggestions: string[] = []
  const { userBehavior, page } = context

  if (page.includes('/exhibitions')) {
    suggestions.push("맞춤 전시 추천받기")
    suggestions.push("예약 및 할인 정보")
    suggestions.push("교통편과 주차 안내")
  } else if (page.includes('/profile')) {
    suggestions.push("내 성장 로드맵 만들기")
    suggestions.push("감상 스타일 심화 분석")
    suggestions.push("개인 맞춤 학습 계획")
  } else if (page.includes('/gallery') && artwork) {
    suggestions.push("이 작품 저장하기")
    suggestions.push("비슷한 작품 더 보기")
    suggestions.push("작가 정보 확인하기")
  } else {
    suggestions.push("전시 추천받기")
    suggestions.push("APT 테스트 하기")
    suggestions.push("예술 이야기 듣기")
  }
  
  return suggestions.slice(0, 3)
}

// 헬퍼 함수들
function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours()
  if (hour >= 6 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 18) return 'afternoon'
  if (hour >= 18 && hour < 22) return 'evening'
  return 'night'
}

function isWeekend(): boolean {
  const day = new Date().getDay()
  return day === 0 || day === 6
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