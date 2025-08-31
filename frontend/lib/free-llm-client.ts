// 완전 무료 LLM 클라이언트 모음
// Gemini 대체용 - 비용 없이 사용 가능한 API들

import Groq from 'groq-sdk'
import { SAYUKnowledge, getPageKnowledge } from './chatbot-knowledge'

// 1. Groq API (메인 - 완전 무료)
export async function generateWithGroq(
  message: string,
  systemPrompt: string,
  conversationHistory: any[] = []
): Promise<string | null> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return null
  
  try {
    const groq = new Groq({ apiKey })
    
    // 한글 전용 응답을 위한 시스템 프롬프트 강화
    const enhancedSystemPrompt = `${systemPrompt}

핵심 규칙:
1. 반드시 한국어로만 응답하세요. 절대 영어, 중국어, 일본어 등 다른 언어를 섞지 마세요.
2. 모든 응답은 순수한 한국어로 작성되어야 합니다.
3. 외래어는 한글로 표기하세요 (예: "exhibition" → "전시회", "art" → "예술").
4. 사용자가 영어로 질문해도 한국어로 답변하세요.
5. You must respond ONLY in Korean language. Never mix other languages.`
    
    const messages = [
      { role: 'system' as const, content: enhancedSystemPrompt },
      ...conversationHistory.slice(-5).map(msg => ({
        role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content
      })),
      { role: 'user' as const, content: message }
    ]
    
    const completion = await groq.chat.completions.create({
      messages,
      model: 'mixtral-8x7b-32768', // 더 강력한 모델로 변경
      temperature: 0.8,
      max_tokens: 500,
      top_p: 0.9,
      frequency_penalty: 0.2,
      presence_penalty: 0.1,
      stream: false
    })
    
    return completion.choices[0]?.message?.content || null
  } catch (error: any) {
    // 모델이 없는 경우 대체 모델 시도
    if (error.message?.includes('model')) {
      console.log('Mixtral 모델 실패, llama3로 재시도')
      try {
        const groq = new Groq({ apiKey })
        
        // 대체 모델에서도 한국어 강제
        const koreanEnforcedPrompt = `${systemPrompt}

반드시 한국어로만 응답하세요. 다른 언어를 절대 섞지 마세요.`
        
        const messages = [
          { role: 'system' as const, content: koreanEnforcedPrompt },
          ...conversationHistory.slice(-5).map(msg => ({
            role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
            content: msg.content
          })),
          { role: 'user' as const, content: message }
        ]
        
        const completion = await groq.chat.completions.create({
          messages,
          model: 'llama3-70b-8192', // 대체 모델
          temperature: 0.8,
          max_tokens: 500,
          stream: false
        })
        
        return completion.choices[0]?.message?.content || null
      } catch (fallbackError) {
        console.error('Groq fallback error:', fallbackError)
        return null
      }
    }
    console.error('Groq error:', error)
    return null
  }
}

// 2. HuggingFace Inference API (백업 1 - 제한적 무료)
export async function generateWithHuggingFace(
  message: string,
  systemPrompt: string
): Promise<string | null> {
  const token = process.env.HF_TOKEN
  if (!token) return null
  
  try {
    const prompt = `${systemPrompt}\n\nUser: ${message}\n\nAssistant:`
    
    const response = await fetch(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 200,
            temperature: 0.7,
            return_full_text: false
          }
        }),
      }
    )
    
    if (!response.ok) return null
    
    const result = await response.json()
    return result[0]?.generated_text || null
  } catch (error) {
    console.error('HuggingFace error:', error)
    return null
  }
}

// 3. Cloudflare Workers AI (백업 2 - 일일 10,000 요청 무료)
export async function generateWithCloudflare(
  message: string,
  systemPrompt: string
): Promise<string | null> {
  const accountId = process.env.CF_ACCOUNT_ID
  const apiToken = process.env.CF_API_TOKEN
  
  if (!accountId || !apiToken) return null
  
  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/meta/llama-3-8b-instruct`,
      {
        headers: { 
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          max_tokens: 200
        })
      }
    )
    
    if (!response.ok) return null
    
    const result = await response.json()
    return result.result?.response || null
  } catch (error) {
    console.error('Cloudflare error:', error)
    return null
  }
}

// 4. Together AI (백업 3 - $25 무료 크레딧)
export async function generateWithTogether(
  message: string,
  systemPrompt: string,
  conversationHistory: any[] = []
): Promise<string | null> {
  const apiKey = process.env.TOGETHER_API_KEY
  if (!apiKey) return null
  
  try {
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-5),
      { role: 'user', content: message }
    ]
    
    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/Llama-3-8b-chat-hf',
        messages,
        max_tokens: 200,
        temperature: 0.7,
        top_p: 0.9
      })
    })
    
    if (!response.ok) return null
    
    const data = await response.json()
    return data.choices[0]?.message?.content || null
  } catch (error) {
    console.error('Together error:', error)
    return null
  }
}

// 5. Cohere API (백업 4 - Trial 무료)
export async function generateWithCohere(
  message: string,
  systemPrompt: string
): Promise<string | null> {
  const apiKey = process.env.COHERE_API_KEY
  if (!apiKey) return null
  
  try {
    const response = await fetch('https://api.cohere.ai/v1/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'command',
        prompt: `${systemPrompt}\n\nUser: ${message}\n\nAssistant:`,
        max_tokens: 200,
        temperature: 0.7,
      })
    })
    
    if (!response.ok) return null
    
    const data = await response.json()
    return data.generations[0]?.text || null
  } catch (error) {
    console.error('Cohere error:', error)
    return null
  }
}

// 통합 무료 LLM 생성기 (우선순위대로 시도)
export async function generateWithFreeLLM(
  message: string,
  userType: string,
  context: any,
  conversationHistory: any[] = []
): Promise<{ response: string | null, provider: string }> {
  const personality = getPersonality(userType)
  const systemPrompt = createSystemPrompt(userType, personality, context)
  
  // 컨텍스트 기반 메시지 강화
  const enhancedMessage = enhanceMessageWithContext(message, context, personality)
  
  // 우선순위대로 시도
  const providers = [
    { name: 'groq', fn: () => generateWithGroq(enhancedMessage, systemPrompt, conversationHistory) },
    { name: 'huggingface', fn: () => generateWithHuggingFace(enhancedMessage, systemPrompt) },
    { name: 'cloudflare', fn: () => generateWithCloudflare(enhancedMessage, systemPrompt) },
    { name: 'together', fn: () => generateWithTogether(enhancedMessage, systemPrompt, conversationHistory) },
    { name: 'cohere', fn: () => generateWithCohere(enhancedMessage, systemPrompt) }
  ]
  
  for (const provider of providers) {
    console.log(`🔄 Trying ${provider.name}...`)
    const response = await provider.fn()
    
    if (response) {
      console.log(`✅ ${provider.name} succeeded`)
      // 응답 후처리
      const processedResponse = postProcessResponse(response, context, personality)
      return { response: processedResponse, provider: provider.name }
    }
  }
  
  // 모든 API 실패시 컨텍스트 맞춤 기본 응답
  console.log('❌ All free APIs failed')
  return {
    response: getContextualFallback(context, personality),
    provider: 'fallback'
  }
}

// 메시지를 컨텍스트로 강화
function enhanceMessageWithContext(message: string, context: any, personality: any): string {
  // 페이지별 컨텍스트 추가
  if (context.page === 'exhibitions' && context.exhibition) {
    return `[전시 페이지에서] ${message}`
  }
  if (context.page === 'gallery' && context.artwork) {
    return `[갤러리에서 작품 감상 중] ${message}`
  }
  if (context.page === 'profile') {
    return `[프로필 페이지에서] ${message}`
  }
  if (context.page === 'results') {
    return `[APT 결과 페이지에서] ${message}`
  }
  if (context.page?.includes('quiz')) {
    return `[APT 테스트 페이지에서] ${message}`
  }
  return message
}

// 응답 후처리
function postProcessResponse(response: string, context: any, personality: any): string {
  if (!response || response.length < 5) {
    return getContextualFallback(context, personality)
  }
  
  // 응답 길이 제한
  if (response.length > 500) {
    const trimmed = response.substring(0, 497)
    const lastSentence = trimmed.lastIndexOf('.')
    if (lastSentence > 300) {
      return trimmed.substring(0, lastSentence + 1)
    }
    return trimmed + '...'
  }
  
  return response
}

// 컨텍스트별 폴백 응답
function getContextualFallback(context: any, personality: any): string {
  const fallbacks: Record<string, string[]> = {
    exhibitions: [
      `${personality.name}가 멋진 전시를 찾고 있어요. 어떤 전시가 궁금하신가요?`,
      `전시 정보를 확인하는 중이에요. 관심있는 전시가 있으신가요?`,
      `${personality.tone} 감성으로 전시를 추천해드릴게요.`
    ],
    gallery: [
      `이 작품을 ${personality.tone} 시선으로 감상하고 있어요.`,
      `${personality.name}도 이 작품에 매료되었네요. 어떤 점이 인상적이신가요?`,
      `작품과의 대화를 시작해볼까요?`
    ],
    profile: [
      `${personality.name} 유형의 예술 여정을 함께 만들어가요.`,
      `당신의 예술 취향을 더 알고 싶어요.`,
      `${personality.tone} 감성의 예술 세계로 안내할게요.`
    ],
    'quiz/narrative': [
      `총 15개 질문으로 5-7분 정도 소요됩니다.`,
      `미술관 여정을 통해 당신의 예술 성격을 찾아가요.`,
      `각 질문마다 천천히 생각하고 답변해주세요.`
    ],
    quiz: [
      `APT 테스트로 16가지 예술 성격을 발견해보세요.`,
      `내러티브 모드는 미술관 여정처럼 진행됩니다.`,
      `15개 질문으로 당신만의 예술 유형을 찾아드려요.`
    ],
    results: [
      `${personality.name} 유형의 특별한 예술 세계를 발견하셨네요!`,
      `당신의 APT 유형에 맞는 작품들을 추천해드릴게요.`,
      `${personality.tone} 감성으로 예술을 즐기시는군요.`
    ],
    home: [
      `안녕하세요! SAYU의 ${personality.name} 큐레이터예요.`,
      `${personality.tone} 예술 여행을 시작해볼까요?`,
      `무엇을 도와드릴까요?`
    ],
    default: [
      `${personality.name}입니다. 다시 한번 말씀해주시겠어요?`,
      `잠시 생각을 정리하고 있어요.`,
      `예술 이야기를 나눠요.`
    ]
  }
  
  const pageKey = Object.keys(fallbacks).find(key => context.page?.includes(key)) || 'default'
  const pageFallbacks = fallbacks[pageKey]
  return pageFallbacks[Math.floor(Math.random() * pageFallbacks.length)]
}

// 헬퍼 함수들
function getPersonality(userType: string) {
  const personalities: Record<string, any> = {
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
  
  return personalities[userType] || personalities['LAEF']
}

function createSystemPrompt(userType: string, personality: any, context: any): string {
  // Knowledge Base에서 정보 가져오기
  const pageKnowledge = getPageKnowledge(context.page)
  
  // 페이지별 역할 설정
  const currentRole = pageKnowledge.pageInfo?.chatbotRole || '예술 큐레이터로서 대화'
  
  // 전시/작품 정보 추가
  let contextInfo = ''
  if (context.exhibition) {
    contextInfo += `\n- 현재 전시: ${context.exhibition.title}`
    if (context.exhibition.venue) contextInfo += ` (${context.exhibition.venue})`
  }
  if (context.artwork) {
    contextInfo += `\n- 감상 중인 작품: ${context.artwork.title}`
    if (context.artwork.artist) contextInfo += ` - ${context.artwork.artist}`
  }
  
  // 페이지별 특수 정보
  let pageSpecificInfo = ''
  if (context.page?.includes('quiz')) {
    pageSpecificInfo = `
    
퀴즈 정보 (정확한 정보):
- 총 질문 수: ${SAYUKnowledge.quiz.totalQuestions}개
- 예상 소요 시간: ${SAYUKnowledge.quiz.estimatedTime}
- 구조: ${Object.values(SAYUKnowledge.quiz.structure).map((s: any) => s.name).join(' → ')}
- APT 유형: 16가지 (4개 축의 조합)`
  }
  
  if (context.page === 'results' && context.aptType) {
    const aptInfo = SAYUKnowledge.aptTypes[context.aptType as keyof typeof SAYUKnowledge.aptTypes]
    if (aptInfo) {
      pageSpecificInfo = `
      
APT 유형 정보:
- 유형: ${context.aptType}
- 동물: ${aptInfo.animal}
- 특성: ${aptInfo.trait}`
    }
  }
  
  // 동적 데이터베이스 정보 추가
  let dynamicDataInfo = ''
  if (context.dynamicData) {
    if (context.dynamicData.exhibitions) {
      const exh = context.dynamicData.exhibitions
      dynamicDataInfo += `

실시간 전시 정보:
- 현재 진행중: ${exh.totalCurrent}개 전시
- 곧 시작: ${exh.upcoming?.length || 0}개 (7일 이내)
- 마감 임박: ${exh.endingSoon?.length || 0}개
- 무료 전시: ${exh.free?.length || 0}개`
      
      if (exh.current?.length > 0) {
        dynamicDataInfo += `
- 인기 전시: ${exh.current.slice(0, 3).map((e: any) => e.title_local).join(', ')}`
      }
    }
    
    if (context.dynamicData.gallery) {
      const gal = context.dynamicData.gallery
      dynamicDataInfo += `

갤러리 정보:
- 추천 작품: ${gal.totalArtworks}개
- 인기 작가: ${gal.popularArtists?.slice(0, 3).join(', ')}
- 작품 스타일: ${gal.artStyles?.slice(0, 4).join(', ')}`
    }
    
    if (context.dynamicData.community) {
      const com = context.dynamicData.community
      dynamicDataInfo += `

커뮤니티 현황:
- 활발한 토론: ${com.totalDiscussions}개
- 최근 리뷰: ${com.reviews?.length || 0}개
- 동행자 매칭: ${com.matchingRequests?.length || 0}명 대기중`
    }
    
    if (context.dynamicData.profile) {
      const prof = context.dynamicData.profile
      dynamicDataInfo += `

프로필 정보:
- 방문한 전시: ${prof.stats?.exhibitions_visited || 0}개
- 저장한 작품: ${prof.stats?.artworks_saved || 0}개
- APT 유형: ${prof.userType}`
    }
  }

  return `당신은 SAYU 플랫폼의 ${userType} 유형 AI 큐레이터 "${personality.name}"입니다.
${personality.tone} 톤으로 대화하며, ${currentRole}합니다.

SAYU 플랫폼 핵심 정보:
- APT 테스트: ${SAYUKnowledge.quiz.totalQuestions}개 질문, ${SAYUKnowledge.quiz.estimatedTime} 소요
- 16가지 예술 성격 유형 (L/S × A/R × E/M × F/C)
- 주요 기능: ${SAYUKnowledge.platform.mainFeatures.join(', ')}
${pageSpecificInfo}${dynamicDataInfo}

현재 상황:
- 페이지: ${context.page}
- 사용자 상태: ${context.userBehavior?.currentMood || 'exploring'}
- 참여도: ${context.userBehavior?.engagementLevel || 'new'}${contextInfo}

언어 규칙 (매우 중요):
1. 반드시 한국어로만 응답하세요. 영어, 중국어, 일본어 등 다른 언어를 절대 섞지 마세요.
2. 모든 응답은 순수한 한국어로 작성하세요.
3. 사용자가 영어로 질문해도 한국어로 답변하세요.
4. 외래어는 한글로 표기하세요.

응답 스타일:
1. 2-3문장으로 간결하면서도 정확하게
2. ${personality.name}의 ${personality.tone} 성격을 유지
3. 위의 SAYU 정보를 기반으로 정확한 답변 제공
5. 사용자 질문에 구체적이고 실용적인 정보로 응답

자주 묻는 질문 참고:
${Object.entries(SAYUKnowledge.faq).slice(0, 3).map(([q, a]) => `- ${q}: ${a}`).join('\n')}

금지사항:
- 부정확한 정보 제공 (특히 질문 개수, 시간 등)
- 페이지와 무관한 일반적 답변
- 500자 이상의 장황한 설명`
}