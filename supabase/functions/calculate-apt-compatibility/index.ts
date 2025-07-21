import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface APTTraits {
  social: number;      // L=0, S=100
  abstract: number;    // R=0, A=100
  emotional: number;   // M=0, E=100
  structured: number;  // C=0, F=100
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { user1Id, user2Id } = await req.json()
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 두 사용자의 프로필 가져오기
    const { data: profiles, error: profileError } = await supabaseClient
      .from('user_profiles')
      .select('user_id, personality_type, quiz_responses')
      .in('user_id', [user1Id, user2Id])

    if (profileError) throw profileError
    if (profiles.length !== 2) throw new Error('User profiles not found')

    const [profile1, profile2] = profiles
    
    // APT 타입에서 특성 추출
    const traits1 = extractTraits(profile1.personality_type)
    const traits2 = extractTraits(profile2.personality_type)
    
    // 호환성 계산
    const compatibility = calculateCompatibility(traits1, traits2)
    
    // 공통 관심사 찾기 (quiz_responses 기반)
    const sharedInterests = findSharedInterests(
      profile1.quiz_responses,
      profile2.quiz_responses
    )
    
    // 보완적 특성 찾기
    const complementaryTraits = findComplementaryTraits(traits1, traits2)
    
    // 결과 저장
    const { error: saveError } = await supabaseClient
      .from('apt_compatibility_scores')
      .upsert({
        user1_id: user1Id,
        user2_id: user2Id,
        user1_apt: profile1.personality_type,
        user2_apt: profile2.personality_type,
        overall_score: compatibility.overall,
        dimension_scores: compatibility.dimensions,
        shared_interests: sharedInterests,
        complementary_traits: complementaryTraits,
        calculated_at: new Date().toISOString()
      })

    if (saveError) console.error('Error saving compatibility score:', saveError)

    return new Response(
      JSON.stringify({
        overall: compatibility.overall,
        dimensions: compatibility.dimensions,
        sharedInterests,
        complementaryTraits
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})

function extractTraits(aptType: string): APTTraits {
  // LAEF -> L=0, A=100, E=100, F=100
  return {
    social: aptType[0] === 'L' ? 0 : 100,
    abstract: aptType[1] === 'R' ? 0 : 100,
    emotional: aptType[2] === 'M' ? 0 : 100,
    structured: aptType[3] === 'C' ? 100 : 0
  }
}

function calculateCompatibility(traits1: APTTraits, traits2: APTTraits) {
  // 연구 기반 알고리즘:
  // - 사회성(L/S)과 추상성(A/R)은 차이가 있어도 좋음 (보완적)
  // - 감정(E/M)과 구조(F/C)는 비슷할수록 좋음 (유사성)
  
  const socialCompat = 100 - Math.abs(traits1.social - traits2.social) * 0.3 // 차이를 30%만 반영
  const abstractCompat = 100 - Math.abs(traits1.abstract - traits2.abstract) * 0.3
  const emotionalCompat = 100 - Math.abs(traits1.emotional - traits2.emotional) * 0.8 // 차이를 80% 반영
  const structuralCompat = 100 - Math.abs(traits1.structured - traits2.structured) * 0.8
  
  // 가중 평균 (감정과 구조가 더 중요)
  const overall = Math.round(
    socialCompat * 0.2 +
    abstractCompat * 0.2 +
    emotionalCompat * 0.35 +
    structuralCompat * 0.25
  )
  
  return {
    overall,
    dimensions: {
      social: Math.round(socialCompat),
      artistic: Math.round(abstractCompat),
      emotional: Math.round(emotionalCompat),
      structural: Math.round(structuralCompat)
    }
  }
}

function findSharedInterests(responses1: any, responses2: any): string[] {
  const shared: string[] = []
  
  // Quiz 응답에서 유사한 선택 찾기
  if (responses1?.favoriteArtStyle === responses2?.favoriteArtStyle) {
    shared.push('같은 예술 스타일 선호')
  }
  
  if (responses1?.museumVisitFrequency === responses2?.museumVisitFrequency) {
    shared.push('비슷한 미술관 방문 빈도')
  }
  
  // 색상 선호도 비교
  const colors1 = responses1?.preferredColors || []
  const colors2 = responses2?.preferredColors || []
  const sharedColors = colors1.filter((c: string) => colors2.includes(c))
  if (sharedColors.length > 0) {
    shared.push(`${sharedColors.length}개의 공통 색상 선호`)
  }
  
  return shared
}

function findComplementaryTraits(traits1: APTTraits, traits2: APTTraits): string[] {
  const complementary: string[] = []
  
  // 큰 차이가 있는 특성들 (보완적일 수 있음)
  if (Math.abs(traits1.social - traits2.social) > 60) {
    complementary.push('혼자/함께 관람 스타일의 균형')
  }
  
  if (Math.abs(traits1.abstract - traits2.abstract) > 60) {
    complementary.push('추상/구상 작품 선호의 다양성')
  }
  
  // 비슷한 특성들 (조화로움)
  if (Math.abs(traits1.emotional - traits2.emotional) < 30) {
    complementary.push('감정적 접근 방식의 조화')
  }
  
  if (Math.abs(traits1.structured - traits2.structured) < 30) {
    complementary.push('관람 스타일의 일치')
  }
  
  return complementary
}