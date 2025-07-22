// Edge Function: APT 기반 데일리 챌린지 매칭 알고리즘 (최적화 버전)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';
import { corsHeaders } from '../_shared/cors.ts';

interface ChallengeResponse {
  user_id: string;
  user_apt_type: string;
  emotion_tags: string[];
  emotion_selection_time: number;
  emotion_changed: boolean;
  personal_note?: string;
}

interface APTCompatibility {
  aptType: string;
  compatibleTypes: string[];
  weight: number;
}

// 캐싱을 위한 간단한 메모리 저장소
const matchCache = new Map<string, any>();
const CACHE_DURATION = 3600000; // 1시간

// APT 호환성 매트릭스 (기존 매칭 시스템과 동일)
const APT_COMPATIBILITY: Record<string, APTCompatibility> = {
  'LAEF': { 
    aptType: 'LAEF', 
    compatibleTypes: ['LAEC', 'SREF', 'SREC'], 
    weight: 0.8 
  },
  'LAEC': { 
    aptType: 'LAEC', 
    compatibleTypes: ['LAEF', 'SREF', 'SREC'], 
    weight: 0.8 
  },
  'LARF': { 
    aptType: 'LARF', 
    compatibleTypes: ['LARC', 'SMRF', 'SMRC'], 
    weight: 0.7 
  },
  'LARC': { 
    aptType: 'LARC', 
    compatibleTypes: ['LARF', 'SMRF', 'SMRC'], 
    weight: 0.7 
  },
  'LSEF': { 
    aptType: 'LSEF', 
    compatibleTypes: ['LSEC', 'SSEF', 'SSEC'], 
    weight: 0.75 
  },
  'LSEC': { 
    aptType: 'LSEC', 
    compatibleTypes: ['LSEF', 'SSEF', 'SSEC'], 
    weight: 0.75 
  },
  'LSRF': { 
    aptType: 'LSRF', 
    compatibleTypes: ['LSRC', 'SSRF', 'SSRC'], 
    weight: 0.65 
  },
  'LSRC': { 
    aptType: 'LSRC', 
    compatibleTypes: ['LSRF', 'SSRF', 'SSRC'], 
    weight: 0.65 
  },
  'SAEF': { 
    aptType: 'SAEF', 
    compatibleTypes: ['SAEC', 'LMEF', 'LMEC'], 
    weight: 0.85 
  },
  'SAEC': { 
    aptType: 'SAEC', 
    compatibleTypes: ['SAEF', 'LMEF', 'LMEC'], 
    weight: 0.85 
  },
  'SARF': { 
    aptType: 'SARF', 
    compatibleTypes: ['SARC', 'LMRF', 'LMRC'], 
    weight: 0.75 
  },
  'SARC': { 
    aptType: 'SARC', 
    compatibleTypes: ['SARF', 'LMRF', 'LMRC'], 
    weight: 0.75 
  },
  'SSEF': { 
    aptType: 'SSEF', 
    compatibleTypes: ['SSEC', 'LSEF', 'LSEC'], 
    weight: 0.7 
  },
  'SSEC': { 
    aptType: 'SSEC', 
    compatibleTypes: ['SSEF', 'LSEF', 'LSEC'], 
    weight: 0.7 
  },
  'SSRF': { 
    aptType: 'SSRF', 
    compatibleTypes: ['SSRC', 'LSRF', 'LSRC'], 
    weight: 0.6 
  },
  'SSRC': { 
    aptType: 'SSRC', 
    compatibleTypes: ['SSRF', 'LSRF', 'LSRC'], 
    weight: 0.6 
  }
};

// 감정 태그 유사도 계산
function calculateEmotionSimilarity(tags1: string[], tags2: string[]): number {
  const set1 = new Set(tags1);
  const set2 = new Set(tags2);
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size; // Jaccard 유사도
}

// APT 호환성 점수 계산
function calculateAPTCompatibility(apt1: string, apt2: string): number {
  if (apt1 === apt2) return 1.0; // 동일한 타입은 최고 점수
  
  const compatibility = APT_COMPATIBILITY[apt1];
  if (!compatibility) return 0.3; // 기본 호환성
  
  if (compatibility.compatibleTypes.includes(apt2)) {
    return compatibility.weight;
  }
  
  return 0.3; // 낮은 호환성이지만 완전히 배제하지 않음
}

// 종합 매칭 점수 계산
function calculateMatchScore(response1: ChallengeResponse, response2: ChallengeResponse): number {
  // 1. APT 호환성 (40%)
  const aptScore = calculateAPTCompatibility(response1.user_apt_type, response2.user_apt_type);
  
  // 2. 감정 태그 유사도 (35%)
  const emotionScore = calculateEmotionSimilarity(response1.emotion_tags, response2.emotion_tags);
  
  // 3. 응답 시간 유사도 (15%)
  const timeDiff = Math.abs(response1.emotion_selection_time - response2.emotion_selection_time);
  const maxTime = Math.max(response1.emotion_selection_time, response2.emotion_selection_time);
  const timeScore = maxTime > 0 ? Math.max(0, 1 - (timeDiff / maxTime)) : 1;
  
  // 4. 변경 패턴 유사도 (10%)
  const changeScore = response1.emotion_changed === response2.emotion_changed ? 1 : 0.3;
  
  // 가중 평균으로 최종 점수 계산
  const finalScore = (
    aptScore * 0.4 +
    emotionScore * 0.35 +
    timeScore * 0.15 +
    changeScore * 0.1
  );
  
  return Math.round(finalScore * 100) / 100; // 소수점 2자리로 반올림
}

export default async function handler(req: Request) {
  const startTime = Date.now();
  
  // CORS 처리
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { date } = await req.json();
    
    if (!date) {
      return new Response(
        JSON.stringify({ error: 'Date parameter is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Calculating matches for date: ${date}`);

    // 해당 날짜의 모든 응답 가져오기
    const { data: responses, error: responsesError } = await supabaseClient
      .from('daily_challenge_responses')
      .select('*')
      .eq('challenge_date', date);

    if (responsesError) {
      throw new Error(`Failed to fetch responses: ${responsesError.message}`);
    }

    if (!responses || responses.length < 2) {
      console.log('Not enough responses to calculate matches');
      return new Response(
        JSON.stringify({ message: 'Not enough responses for matching' }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Found ${responses.length} responses for matching`);

    // 캐시 확인
    const cacheKey = `matches_${date}_${responses.length}`;
    const cachedResult = matchCache.get(cacheKey);
    
    if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_DURATION) {
      console.log('Returning cached matches');
      return new Response(
        JSON.stringify({ ...cachedResult.data, cached: true }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // 기존 매칭 결과 확인 (증분 업데이트를 위해)
    const { data: existingMatches } = await supabaseClient
      .from('daily_challenge_matches')
      .select('user1_id, user2_id')
      .eq('challenge_date', date);

    const existingPairs = new Set(
      existingMatches?.map(m => `${m.user1_id}_${m.user2_id}`) || []
    );

    // 모든 사용자 간 매칭 점수 계산 (병렬 처리를 위한 배치)
    const matches = [];
    
    // 사용자를 APT 타입별로 그룹화하여 효율성 향상
    const responsesByAPT = responses.reduce((acc, resp) => {
      if (!acc[resp.user_apt_type]) acc[resp.user_apt_type] = [];
      acc[resp.user_apt_type].push(resp);
      return acc;
    }, {} as Record<string, typeof responses>);

    // 호환성이 높은 APT 타입 간만 매칭 계산 (최적화)
    for (const [apt1, group1] of Object.entries(responsesByAPT)) {
      const compatibility = APT_COMPATIBILITY[apt1];
      if (!compatibility) continue;

      // 동일한 APT 타입 내 매칭
      for (let i = 0; i < group1.length; i++) {
        for (let j = i + 1; j < group1.length; j++) {
          const response1 = group1[i];
          const response2 = group1[j];
          const pairKey = `${response1.user_id}_${response2.user_id}`;
          
          if (!existingPairs.has(pairKey)) {
            const matchScore = calculateMatchScore(response1, response2);
            
            if (matchScore >= 0.3) {
              matches.push({
                challenge_date: date,
                user1_id: response1.user_id,
                user2_id: response2.user_id,
                match_score: matchScore,
                apt_compatibility: calculateAPTCompatibility(response1.user_apt_type, response2.user_apt_type),
                emotion_similarity: calculateEmotionSimilarity(response1.emotion_tags, response2.emotion_tags),
                match_reasons: generateMatchReasons(response1, response2, matchScore)
              });
            }
          }
        }
      }

      // 호환성이 높은 다른 APT 타입과의 매칭
      for (const compatibleType of compatibility.compatibleTypes) {
        const group2 = responsesByAPT[compatibleType];
        if (!group2) continue;

        for (const response1 of group1) {
          for (const response2 of group2) {
            const pairKey = `${response1.user_id}_${response2.user_id}`;
            const reversePairKey = `${response2.user_id}_${response1.user_id}`;
            
            if (!existingPairs.has(pairKey) && !existingPairs.has(reversePairKey)) {
              const matchScore = calculateMatchScore(response1, response2);
              
              if (matchScore >= 0.3) {
                matches.push({
                  challenge_date: date,
                  user1_id: response1.user_id,
                  user2_id: response2.user_id,
                  match_score: matchScore,
                  apt_compatibility: calculateAPTCompatibility(response1.user_apt_type, response2.user_apt_type),
                  emotion_similarity: calculateEmotionSimilarity(response1.emotion_tags, response2.emotion_tags),
                  match_reasons: generateMatchReasons(response1, response2, matchScore)
                });
              }
            }
          }
        }
      }
    }

    // 매칭 결과를 배치로 저장 (성능 최적화)
    if (matches.length > 0) {
      const batchSize = 500; // 한 번에 삽입할 최대 레코드 수
      
      for (let i = 0; i < matches.length; i += batchSize) {
        const batch = matches.slice(i, i + batchSize);
        const { error: insertError } = await supabaseClient
          .from('daily_challenge_matches')
          .insert(batch);

        if (insertError) {
          console.error(`Failed to save batch ${i / batchSize + 1}: ${insertError.message}`);
          // 배치 실패 시 계속 진행
          continue;
        }
      }

      console.log(`Successfully calculated and saved ${matches.length} matches`);
    }

    // 통계 업데이트
    await updateDailyStats(supabaseClient, date, responses.length, matches.length);

    // 결과 데이터 준비
    const result = { 
      success: true,
      responses_count: responses.length,
      matches_count: matches.length,
      average_score: matches.length > 0 ? 
        Math.round((matches.reduce((sum, m) => sum + m.match_score, 0) / matches.length) * 100) / 100 : 0,
      cached: false,
      processing_time: Date.now() - startTime
    };

    // 캐시에 저장
    matchCache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    // 캐시 크기 관리 (최대 100개로 제한)
    if (matchCache.size > 100) {
      const oldestKey = matchCache.keys().next().value;
      matchCache.delete(oldestKey);
    }

    return new Response(
      JSON.stringify(result),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in calculate-daily-matches:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}

// 매칭 이유 생성
function generateMatchReasons(response1: ChallengeResponse, response2: ChallengeResponse, matchScore: number): string[] {
  const reasons = [];
  
  // APT 호환성 확인
  const aptScore = calculateAPTCompatibility(response1.user_apt_type, response2.user_apt_type);
  if (aptScore > 0.7) {
    if (response1.user_apt_type === response2.user_apt_type) {
      reasons.push('동일한 예술 성향 (APT)');
    } else {
      reasons.push('호환되는 예술 성향');
    }
  }
  
  // 감정 태그 유사도 확인
  const emotionScore = calculateEmotionSimilarity(response1.emotion_tags, response2.emotion_tags);
  if (emotionScore > 0.5) {
    reasons.push('비슷한 감정 반응');
  }
  
  // 응답 패턴 확인
  if (response1.emotion_changed === response2.emotion_changed) {
    if (response1.emotion_changed) {
      reasons.push('신중한 감정 선택 과정');
    } else {
      reasons.push('직관적인 감정 반응');
    }
  }
  
  // 전체적인 매칭 품질
  if (matchScore > 0.8) {
    reasons.push('매우 높은 예술적 공감대');
  } else if (matchScore > 0.6) {
    reasons.push('좋은 예술적 호환성');
  }
  
  return reasons;
}

// 일일 통계 업데이트 (비동기 처리)
async function updateDailyStats(supabaseClient: any, date: string, responsesCount: number, matchesCount: number) {
  try {
    // 전체 사용자 수 가져오기 (캐싱 가능)
    const { count: totalUsers } = await supabaseClient
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });

    const participationRate = totalUsers > 0 ? (responsesCount / totalUsers) * 100 : 0;

    await supabaseClient
      .from('daily_challenge_stats')
      .upsert({
        date: date,
        total_responses: responsesCount,
        total_matches: matchesCount,
        participation_rate: Math.round(participationRate * 100) / 100,
        average_matches_per_user: responsesCount > 0 ? Math.round((matchesCount / responsesCount) * 100) / 100 : 0,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'date'
      });
  } catch (error) {
    console.error('Failed to update daily stats:', error);
    // 통계 업데이트 실패는 전체 프로세스를 중단하지 않음
  }
}