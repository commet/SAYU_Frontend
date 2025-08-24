import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'
import { promptEngine } from '@/lib/advanced-prompt-engine'
import type { PageContextV2 } from '@/lib/apt-interpreter'
import { chatbotRateLimiter } from '@/lib/rate-limiter'

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
  console.log('🚨 CHATBOT API CALLED - STARTING EXECUTION');
  let userType = 'LAEF'; // 기본값 설정
  
  // Rate limiting check
  const clientIp = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown';
  
  if (!chatbotRateLimiter.isAllowed(clientIp)) {
    console.warn(`Rate limit exceeded for IP: ${clientIp}`);
    return NextResponse.json({
      success: false,
      error: 'Too many requests. Please try again later.',
      remainingRequests: 0
    }, { status: 429 });
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
    
    userType = requestUserType; // catch 블록에서 사용할 수 있도록
    
    console.log('🤖 Advanced Chatbot API called with:', { 
      message: message?.substring(0, 50), 
      userType, 
      page, 
      hasBehaviorData: !!userBehavior 
    });
    
    // API 키 확인
    const apiKey = process.env.GOOGLE_AI_API_KEY
    if (!apiKey) {
      console.warn('GOOGLE_AI_API_KEY not configured, using mock response')
      // Mock response for development
      const mockResponse = `안녕하세요! 저는 ${userType} 유형의 AI 큐레이터입니다. 현재는 개발 모드로 동작중이에요. 실제 AI 응답을 보시려면 GOOGLE_AI_API_KEY를 설정해주세요.`;
      
      return NextResponse.json({
        success: true,
        data: {
          response: mockResponse,
          sessionId: `mock-${userId}-${Date.now()}`,
          suggestions: ["API 키 설정하기", "개발 모드 테스트", "다른 기능 시도해보기"],
          personality: 'Mock 큐레이터',
          contextAnalysis: {
            engagementLevel: 'mock',
            currentMood: 'testing',
            recommendationReason: '개발 모드 테스트'
          },
          timestamp: new Date().toISOString()
        }
      })
    }

    // Gemini AI 초기화 (더 저렴한 모델로 변경)
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash-8b', // 더 저렴한 8B 모델 사용
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE }
      ]
    })

    // 고급 페이지 컨텍스트 구성
    const pageContextV2: PageContextV2 = {
      page,
      currentArtwork: artwork,
      currentExhibition: context.exhibition,
      userBehavior: {
        pageVisitCount: userBehavior.pageVisitCount || 1,
        timeOnPage: userBehavior.timeOnPage || 0,
        scrollDepth: userBehavior.scrollDepth || 0,
        clickedElements: userBehavior.clickedElements || [],
        recentArtworks: userBehavior.recentArtworks || [],
        lastActivity: Date.now(),
        engagementLevel: userBehavior.engagementLevel || 'new',
        currentMood: userBehavior.currentMood || 'exploring'
      },
      sessionContext: {
        visitedPages: [page],
        totalTime: userBehavior.timeOnPage || 0,
        actionsCount: userBehavior.clickedElements?.length || 0,
        preferences: []
      },
      realTimeContext: {
        timeOfDay: getTimeOfDay(),
        dayOfWeek: isWeekend() ? 'weekend' : 'weekday',
        deviceType: 'desktop' // 클라이언트에서 전송하도록 개선 가능
      }
    };

    console.log('🧠 Generated page context:', {
      engagementLevel: pageContextV2.userBehavior.engagementLevel,
      currentMood: pageContextV2.userBehavior.currentMood,
      timeOfDay: pageContextV2.realTimeContext.timeOfDay
    });

    // 전시 추천 정보 가져오기 (기존 로직 유지)
    const exhibitionInfo = (message.includes('전시') || message.includes('추천') || message.includes('어디') || message.includes('갤러리') || message.includes('미술관'))
      ? await getExhibitionRecommendations(userType, message)
      : ''

    // 고급 프롬프트 생성
    const promptConstruct = promptEngine.generateAdvancedPrompt(
      userType,
      pageContextV2,
      artwork,
      conversationHistory
    );

    console.log('✨ Advanced prompt generated with:', {
      fewShotExamples: promptConstruct.fewShotExamples.length,
      systemPromptLength: promptConstruct.systemPrompt.length
    });

    // Few-shot learning 기반 대화 히스토리 구성
    const enhancedHistory = [
      { role: 'user', parts: [{ text: promptConstruct.systemPrompt }] },
      // Few-shot 예시들 추가
      ...promptConstruct.fewShotExamples.flatMap(example => [
        { role: 'user', parts: [{ text: example.user }] },
        { role: 'model', parts: [{ text: example.assistant }] }
      ]),
      // 기존 대화 히스토리 (최근 5개만)
      ...conversationHistory.slice(-10).map((msg: any) => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      }))
    ];

    // 전시 정보 포함한 최종 시스템 프롬프트
    const finalSystemPrompt = promptConstruct.systemPrompt + 
      (exhibitionInfo ? `\n\n실시간 전시 정보:\n${exhibitionInfo}` : '') +
      `\n\n컨텍스트 지침:\n${promptConstruct.contextualInstructions}\n\n${promptConstruct.constraintsAndStyle}`;

    // 대화 생성
    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: finalSystemPrompt }] },
        ...promptConstruct.fewShotExamples.flatMap(example => [
          { role: 'user', parts: [{ text: example.user }] },
          { role: 'model', parts: [{ text: example.assistant }] }
        ])
      ]
    });

    // 응답 생성 (토큰 제한 추가)
    const result = await chat.sendMessage(message)
    const response = result.response.text()
    
    // 응답 길이 제한 (과도한 토큰 사용 방지)
    const limitedResponse = response.length > 2000 ? response.substring(0, 2000) + '...' : response

    // API 사용 로깅 (모니터링용)
    console.log('📊 Gemini API Usage:', {
      timestamp: new Date().toISOString(),
      userType,
      messageLength: message.length,
      responseLength: response.length,
      truncated: response.length > 2000,
      ip: clientIp,
      remainingRequests: chatbotRateLimiter.getRemainingRequests(clientIp)
    });

    console.log('🎯 Generated response:', response?.substring(0, 100));

    // 동적 추천 생성 (기존 정적 추천 대신)
    const dynamicSuggestions = generateDynamicSuggestions(pageContextV2, userType, artwork);

    return NextResponse.json({
      success: true,
      data: {
        response: limitedResponse,
        sessionId: `${userId}-${page}-${Date.now()}`,
        suggestions: dynamicSuggestions,
        personality: promptEngine.personalityTemplates?.[userType]?.basePersonality || '예술 큐레이터',
        contextAnalysis: {
          engagementLevel: pageContextV2.userBehavior.engagementLevel,
          currentMood: pageContextV2.userBehavior.currentMood,
          recommendationReason: `${pageContextV2.realTimeContext.timeOfDay} 시간대의 ${pageContextV2.userBehavior.engagementLevel} 사용자`
        },
        timestamp: new Date().toISOString()
      }
    })
  } catch (error: any) {
    console.error('🔴 Advanced Chatbot API error:', error)
    
    // 개성있는 Fallback 응답
    const personalityFallbacks = {
      'LAEF': "마음이 복잡해지네요... 잠시 색채 속에서 답을 찾고 있어요.",
      'SAEF': "앗! 잠깐 멈춤 상태예요. 다시 한번 말씀해주세요! 🦋",
      'LAMC': "시스템을 정리하는 중입니다. 차근차근 다시 시도해보시겠어요?",
      'TAMF': "오! 예상치 못한 상황이네요. 새로운 방식으로 다시 접근해볼까요?"
    };
    
    const fallbackResponse = personalityFallbacks[userType as keyof typeof personalityFallbacks] || 
                            "잠시 생각을 정리하고 있어요. 다시 한번 말씀해주시겠어요?";
    
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

// 헬퍼 함수들
function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon'; 
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
}

function isWeekend(): boolean {
  const day = new Date().getDay();
  return day === 0 || day === 6;
}

function generateDynamicSuggestions(context: PageContextV2, userType: string, artwork?: any): string[] {
  const suggestions: string[] = [];
  const { userBehavior, page } = context;

  // 페이지별 특화 제안 (우선)
  if (page.includes('/profile')) {
    // 개인 코치 역할 제안
    if (userBehavior.engagementLevel === 'new') {
      suggestions.push("내 APT 유형 자세히 설명해주세요");
      suggestions.push("어떤 작품부터 시작하면 좋을까요?");
      suggestions.push("나만의 예술 여정 계획 세우기");
    } else if (userBehavior.engagementLevel === 'engaged') {
      suggestions.push("내 취향 변화 분석해주세요");
      suggestions.push("다음 단계 성장 로드맵 보기");
      suggestions.push("맞춤 전시 일정 추천받기");
    } else if (userBehavior.engagementLevel === 'power') {
      suggestions.push("심화 예술 교육 과정 추천");
      suggestions.push("전문가 네트워킹 기회 찾기");
      suggestions.push("개인 컬렉션 전략 상담");
    } else {
      suggestions.push("내 감상 기록 분석하기");
      suggestions.push("새로운 예술 영역 도전해보기");
      suggestions.push("목표 설정하고 추진하기");
    }
  } else if (page.includes('/exhibitions')) {
    // 전시 컨시어지 역할 제안
    if (userBehavior.engagementLevel === 'new') {
      suggestions.push("첫 전시 관람 가이드");
      suggestions.push("무료 전시부터 시작하기");
      suggestions.push("관람 예절과 팁 알아보기");
    } else if (userBehavior.currentMood === 'overwhelmed') {
      suggestions.push("조용한 소규모 전시 추천");
      suggestions.push("주중 한가한 시간 안내");
      suggestions.push("간단한 관람 코스 제안");
    } else {
      suggestions.push("맞춤 전시 추천받기");
      suggestions.push("예약 및 할인 정보");
      suggestions.push("교통편과 주차 안내");
    }
  } else if (page.includes('/community')) {
    // 소셜 가이드 역할 제안
    if (userBehavior.engagementLevel === 'new') {
      suggestions.push("커뮤니티 이용 가이드");
      suggestions.push("첫 리뷰 작성 도움");
      suggestions.push("안전한 동행 매칭 방법");
    } else if (userBehavior.currentMood === 'exploring') {
      suggestions.push("나와 비슷한 취향의 사람 찾기");
      suggestions.push("흥미로운 토론 참여하기");
      suggestions.push("인기 아트클럽 추천");
    } else {
      suggestions.push("전시 동행자 매칭");
      suggestions.push("내 리뷰에 공감한 사람들");
      suggestions.push("새로운 친구 만들기");
    }
  } else if (page.includes('/gallery') && artwork) {
    suggestions.push("이 작품 저장하기");
    suggestions.push("비슷한 작품 더 보기");
  } else {
    // 기본 사용자 상태별 제안
    if (userBehavior.currentMood === 'overwhelmed') {
      suggestions.push("3점만 골라서 보여주세요");
      suggestions.push("간단한 작품 설명 들려주세요");
    } else if (userBehavior.currentMood === 'excited') {
      suggestions.push("이런 느낌의 작품 더 보기");
      suggestions.push("친구들과 공유하고 싶어요");  
    } else if (userBehavior.currentMood === 'focused') {
      suggestions.push("이 작가의 다른 작품들");
      suggestions.push("더 자세한 분석 듣고 싶어요");
    }

    // APT별 특화 제안
    const aptSuggestions = {
      'LAEF': ["색채의 감정 알려주세요", "비슷한 분위기 작품 찾기"],
      'SAEF': ["지금 트렌드인 작품들", "SNS 공유용 작품 추천"],
      'LAMC': ["작품의 역사적 배경", "작가 생애와 작품 연관성"],
      'TAMF': ["실험적 기법 설명", "혁신적 작품들 보기"]
    };

    if (aptSuggestions[userType as keyof typeof aptSuggestions]) {
      suggestions.push(...aptSuggestions[userType as keyof typeof aptSuggestions]);
    }
  }

  return suggestions.slice(0, 3); // 최대 3개
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
      "전시 예약 및 할인 정보",
      "관람 최적 시간대 추천",
      "교통편과 주변 맛집 안내",
      "전시 관람 준비물 체크",
      "동행자와 함께 갈 코스"
    ],
    profile: [
      "내 성장 로드맵 만들기",
      "감상 스타일 심화 분석",
      "개인 맞춤 학습 계획",
      "예술적 목표 설정하기",
      "취향 발전 추적하기"
    ],
    community: [
      "동행자 매칭하기",
      "리뷰 작성 가이드",
      "아트클럽 추천받기",
      "토론 참여 방법",
      "친구 추천 시스템"
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