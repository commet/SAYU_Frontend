// Edge Function: 사용자 프로필 설정 및 초기화
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';
import { corsHeaders } from '../_shared/cors.ts';

interface ProfileSetupRequest {
  username: string;
  full_name?: string;
  apt_type: string;
  apt_dimensions: {
    G_vs_S: number;  // Global vs Specific (세계적 vs 구체적)
    A_vs_R: number;  // Abstract vs Representative (추상적 vs 구상적)  
    M_vs_E: number;  // Modern vs Classic (현대적 vs 고전적)
    F_vs_C: number;  // Feeling vs Structure (감정적 vs 구조적)
  };
  profile_image_url?: string;
}

// APT 타입별 기본 프로필 이미지 매핑
const APT_DEFAULT_AVATARS: Record<string, string> = {
  // L (Large Scale / Global) + A (Abstract) + E (Emotional) + F (Flow)
  'LAEF': '/images/apt-avatars/laef-impressionist-bear.png',
  'LAEC': '/images/apt-avatars/laec-art-nouveau-deer.png',
  'LARF': '/images/apt-avatars/larf-conceptual-wolf.png', 
  'LARC': '/images/apt-avatars/larc-minimalist-owl.png',
  'LSEF': '/images/apt-avatars/lsef-pop-art-cat.png',
  'LSEC': '/images/apt-avatars/lsec-bauhaus-tiger.png',
  'LSRF': '/images/apt-avatars/lsrf-realist-horse.png',
  'LSRC': '/images/apt-avatars/lsrc-neoclassical-lion.png',
  
  // S (Small Scale / Specific) + variants
  'SAEF': '/images/apt-avatars/saef-romantic-rabbit.png',
  'SAEC': '/images/apt-avatars/saec-symbolist-fox.png',
  'SARF': '/images/apt-avatars/sarf-surreal-dolphin.png',
  'SARC': '/images/apt-avatars/sarc-classical-eagle.png', 
  'SSEF': '/images/apt-avatars/ssef-fauve-panda.png',
  'SSEC': '/images/apt-avatars/ssec-cubist-penguin.png',
  'SSRF': '/images/apt-avatars/ssrf-baroque-sheep.png',
  'SSRC': '/images/apt-avatars/ssrc-renaissance-elephant.png'
};

// APT 타입별 성격 요약 생성
function generatePersonalitySummary(aptType: string, dimensions: any): string {
  const summaries: Record<string, string> = {
    'LAEF': '세상을 크게 보며 감정적이고 직관적인 예술 감상을 선호합니다. 인상주의와 같이 분위기와 느낌을 중시하는 작품에 끌리며, 열린 마음으로 새로운 표현을 탐구합니다.',
    'LAEC': '포괄적 시각과 감정적 깊이를 갖되 일정한 구조를 추구합니다. 아르누보처럼 유기적이면서도 체계적인 아름다움에 매료되며, 자연과 예술의 조화를 중요시합니다.',
    'LARF': '추상적 사고와 유연성으로 개념적 작품을 이해합니다. 실험적이고 혁신적인 표현에 관심이 많으며, 작품의 철학적 의미를 탐구하는 것을 즐깁니다.',
    'LARC': '미니멀하고 깔끔한 구성을 선호하며 현대적 감각이 뛰어납니다. 절제된 아름다움과 명확한 메시지가 담긴 작품에 끌리며, 세련된 미적 감각을 추구합니다.',
    'LSEF': '생생하고 역동적인 표현을 좋아하며 팝아트와 같은 대중적 예술에 관심이 많습니다. 밝고 활기찬 작품을 선호하며, 예술과 일상의 경계를 허무는 것을 즐깁니다.',
    'LSEC': '기능적이면서도 아름다운 디자인을 추구합니다. 바우하우스 철학처럼 실용성과 미학의 조화를 중시하며, 명확하고 체계적인 구성을 선호합니다.',
    'LSRF': '사실적이고 기술적으로 완성도 높은 작품에 감탄합니다. 정확한 묘사와 숙련된 기법을 높이 평가하며, 전통적 가치와 현대적 감각의 균형을 추구합니다.',
    'LSRC': '고전적 완성도와 영원한 아름다움을 추구합니다. 신고전주의처럼 이상적 비례와 완벽한 조화를 중시하며, 시간을 초월한 보편적 가치를 선호합니다.',
    
    'SAEF': '감정적이고 서정적인 작품에 깊이 공감합니다. 낭만주의적 표현과 개인적 감성이 담긴 작품을 선호하며, 섬세한 감정의 변화를 민감하게 포착합니다.',
    'SAEC': '상징적이고 신비로운 표현에 매혹됩니다. 숨겨진 의미와 상징을 해석하는 것을 즐기며, 꿈같고 환상적인 분위기의 작품에 특별한 애착을 보입니다.',
    'SARF': '초현실적이고 상상력 넘치는 표현을 선호합니다. 현실과 환상의 경계를 넘나드는 작품에 흥미를 느끼며, 무의식과 꿈의 세계를 탐구하는 것을 좋아합니다.',
    'SARC': '고전적 완벽함과 이상적 아름다움을 추구합니다. 엄격한 구성과 완성도 높은 기법을 중시하며, 영원불변의 미적 가치를 믿습니다.',
    'SSEF': '대담하고 원시적인 색채 표현에 끌립니다. 포비즘처럼 순수한 색의 힘과 자유로운 표현을 선호하며, 감정의 직접적 발산을 추구합니다.',
    'SSEC': '기하학적이고 분석적인 접근을 선호합니다. 큐비즘처럼 다각적 시점과 해체-재구성의 과정에 흥미를 느끼며, 논리적 구조 속의 창조성을 추구합니다.',
    'SSRF': '화려하고 극적인 표현을 좋아합니다. 바로크 양식처럼 역동적 움직임과 강렬한 대비를 선호하며, 감정의 웅장한 표현에 매료됩니다.',
    'SSRC': '고전적 조화와 완벽한 비례를 중시합니다. 르네상스 시대의 이상적 아름다움을 추구하며, 인문학적 교양과 깊이 있는 문화적 이해를 바탕으로 작품을 감상합니다.'
  };
  
  return summaries[aptType] || `${aptType} 성향을 가진 독특한 예술 감상자입니다.`;
}

export default async function handler(req: Request) {
  // CORS 처리
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 현재 사용자 확인
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (req.method === 'POST') {
      const requestData: ProfileSetupRequest = await req.json();
      
      // 필수 필드 검증
      if (!requestData.username || !requestData.apt_type) {
        return new Response(
          JSON.stringify({ error: 'Username and APT type are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // APT 타입 검증
      if (!APT_DEFAULT_AVATARS[requestData.apt_type]) {
        return new Response(
          JSON.stringify({ error: 'Invalid APT type' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // 사용자명 중복 확인
      const { data: existingUser } = await supabaseClient
        .from('user_profiles')
        .select('username')
        .eq('username', requestData.username)
        .neq('id', user.id)
        .single();

      if (existingUser) {
        return new Response(
          JSON.stringify({ error: 'Username already taken' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // 프로필 이미지 설정 (제공되지 않으면 기본값 사용)
      const profileImageUrl = requestData.profile_image_url || APT_DEFAULT_AVATARS[requestData.apt_type];

      // 성격 요약 생성
      const personalitySummary = generatePersonalitySummary(requestData.apt_type, requestData.apt_dimensions);

      // 사용자 프로필 생성 또는 업데이트
      const { data: profile, error: profileError } = await supabaseClient
        .from('user_profiles')
        .upsert({
          id: user.id,
          username: requestData.username,
          full_name: requestData.full_name || user.user_metadata?.full_name,
          email: user.email,
          profile_image_url: profileImageUrl,
          apt_type: requestData.apt_type,
          apt_dimensions: requestData.apt_dimensions,
          personality_summary: personalitySummary,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        })
        .select()
        .single();

      if (profileError) {
        console.error('Profile upsert error:', profileError);
        return new Response(
          JSON.stringify({ error: 'Failed to create profile', details: profileError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // 초기 사용자 활동 기록 생성
      await supabaseClient
        .from('user_activity_tracking')
        .upsert({
          user_id: user.id,
          total_quiz_completions: 1, // 프로필 설정 = 퀴즈 완료로 간주
          total_artwork_views: 0,
          total_collection_interactions: 0,
          community_unlock_progress: 1, // 프로필 설정으로 1점
          current_streak: 1,
          last_activity_date: new Date().toISOString().split('T')[0],
          created_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      return new Response(
        JSON.stringify({ 
          success: true, 
          profile: profile,
          message: 'Profile setup completed successfully'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GET 요청: 현재 프로필 조회
    if (req.method === 'GET') {
      const { data: profile, error: profileError } = await supabaseClient
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = no rows returned
        return new Response(
          JSON.stringify({ error: 'Failed to fetch profile' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ profile: profile || null }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in setup-user-profile:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}