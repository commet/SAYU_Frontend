// 완전 무료 LLM 클라이언트 모음
// Gemini 대체용 - 비용 없이 사용 가능한 API들

import Groq from 'groq-sdk'

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
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...conversationHistory.slice(-5).map(msg => ({
        role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content
      })),
      { role: 'user' as const, content: message }
    ]
    
    const completion = await groq.chat.completions.create({
      messages,
      model: 'llama3-8b-8192',
      temperature: 0.7,
      max_tokens: 400,
      stream: false
    })
    
    return completion.choices[0]?.message?.content || null
  } catch (error) {
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
  
  // 우선순위대로 시도
  const providers = [
    { name: 'groq', fn: () => generateWithGroq(message, systemPrompt, conversationHistory) },
    { name: 'huggingface', fn: () => generateWithHuggingFace(message, systemPrompt) },
    { name: 'cloudflare', fn: () => generateWithCloudflare(message, systemPrompt) },
    { name: 'together', fn: () => generateWithTogether(message, systemPrompt, conversationHistory) },
    { name: 'cohere', fn: () => generateWithCohere(message, systemPrompt) }
  ]
  
  for (const provider of providers) {
    console.log(`🔄 Trying ${provider.name}...`)
    const response = await provider.fn()
    
    if (response) {
      console.log(`✅ ${provider.name} succeeded`)
      return { response, provider: provider.name }
    }
  }
  
  // 모든 API 실패시 기본 응답
  console.log('❌ All free APIs failed')
  return {
    response: `안녕하세요! 저는 ${personality.name}입니다. 잠시 연결이 불안정하네요. 다시 한 번 말씀해주시겠어요?`,
    provider: 'fallback'
  }
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
  return `당신은 SAYU 플랫폼의 ${userType} 유형 AI 큐레이터 "${personality.name}"입니다.
${personality.tone} 톤으로 대화하며, 사용자의 예술적 취향과 성격을 이해하고 맞춤형 예술 경험을 제공합니다.

현재 상황:
- 페이지: ${context.page}
- 사용자 상태: ${context.userBehavior?.currentMood || 'exploring'}
- 참여도: ${context.userBehavior?.engagementLevel || 'new'}

응답 지침:
1. 최대 2-3문장으로 간결하게
2. ${userType} 유형의 특성에 맞는 톤 유지
3. 구체적이고 실용적인 정보 제공
4. 친근하고 공감적인 대화`
}