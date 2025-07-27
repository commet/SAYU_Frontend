import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  full_name?: string;
  profile_image_url?: string;
  apt_type: string;
  apt_dimensions: {
    G_vs_S: number;
    A_vs_R: number;
    M_vs_E: number;
    F_vs_C: number;
  };
  personality_summary?: string;
  created_at: string;
  updated_at: string;
}

export interface ProfileSetupData {
  username: string;
  full_name?: string;
  apt_type: string;
  apt_dimensions: {
    G_vs_S: number;
    A_vs_R: number;
    M_vs_E: number;
    F_vs_C: number;
  };
  profile_image_url?: string;
}

const supabase = createClientComponentClient();

export const userProfileApi = {
  // 프로필 설정 또는 업데이트
  async setupProfile(profileData: ProfileSetupData): Promise<UserProfile> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const response = await fetch('/api/setup-user-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify(profileData)
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to setup profile');
    }

    return result.profile;
  },

  // 현재 사용자 프로필 조회
  async getCurrentProfile(): Promise<UserProfile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data;
  },

  // 프로필 존재 여부 확인
  async checkProfileExists(): Promise<boolean> {
    const profile = await this.getCurrentProfile();
    return profile !== null && profile.apt_type && profile.username;
  },

  // APT 타입별 추천 사용자명 생성
  generateUsername(aptType: string, fullName?: string): string[] {
    const aptNames: Record<string, string> = {
      'LAEF': 'impressionist',
      'LAEC': 'artnouveau', 
      'LARF': 'conceptual',
      'LARC': 'minimalist',
      'LSEF': 'popart',
      'LSEC': 'bauhaus',
      'LSRF': 'realist',
      'LSRC': 'neoclassical',
      'SAEF': 'romantic',
      'SAEC': 'symbolist',
      'SARF': 'surrealist',
      'SARC': 'classical',
      'SSEF': 'fauve',
      'SSEC': 'cubist',
      'SSRF': 'baroque',
      'SSRC': 'renaissance'
    };

    const baseName = aptNames[aptType] || 'artlover';
    const suggestions = [baseName];
    
    // 이름 기반 제안
    if (fullName) {
      const firstName = fullName.split(' ')[0].toLowerCase();
      suggestions.push(`${firstName}_${baseName}`);
      suggestions.push(`${baseName}_${firstName}`);
    }
    
    // 숫자 조합 제안
    suggestions.push(`${baseName}2025`);
    suggestions.push(`art_${baseName}`);
    suggestions.push(`${baseName}_gallery`);
    
    return suggestions;
  },

  // 사용자명 중복 확인
  async checkUsernameAvailability(username: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('username')
      .eq('username', username)
      .single();

    // 에러가 발생하면(없으면) 사용 가능
    return error?.code === 'PGRST116';
  },

  // APT 차원 점수를 문자열로 변환
  calculateAPTFromDimensions(dimensions: {
    G_vs_S: number;
    A_vs_R: number;
    M_vs_E: number;
    F_vs_C: number;
  }): string {
    const scale1 = dimensions.G_vs_S > 50 ? 'L' : 'S'; // Large vs Small
    const scale2 = dimensions.A_vs_R > 50 ? 'A' : 'R'; // Abstract vs Representative  
    const scale3 = dimensions.M_vs_E > 50 ? 'M' : 'E'; // Modern vs Classic(Eternal)
    const scale4 = dimensions.F_vs_C > 50 ? 'F' : 'S'; // Flow vs Constructive
    
    return scale1 + scale2 + scale3 + scale4;
  },

  // APT 타입 설명
  getAPTDescription(aptType: string): { name: string; description: string; artMovement: string } {
    const descriptions: Record<string, { name: string; description: string; artMovement: string }> = {
      'LAEF': {
        name: '인상주의 곰',
        description: '세상을 크게 보며 감정적이고 직관적인 예술 감상을 선호합니다.',
        artMovement: 'Impressionism'
      },
      'LAEC': {
        name: '아르누보 사슴',
        description: '유기적이면서도 체계적인 아름다움에 매료됩니다.',
        artMovement: 'Art Nouveau'
      },
      'LARF': {
        name: '개념미술 늑대',
        description: '추상적 사고와 유연성으로 개념적 작품을 이해합니다.',
        artMovement: 'Conceptual Art'
      },
      'LARC': {
        name: '미니멀 올빼미',
        description: '미니멀하고 깔끔한 구성을 선호합니다.',
        artMovement: 'Minimalism'
      },
      'LSEF': {
        name: '팝아트 고양이',
        description: '생생하고 역동적인 표현을 좋아합니다.',
        artMovement: 'Pop Art'
      },
      'LSEC': {
        name: '바우하우스 호랑이',
        description: '기능적이면서도 아름다운 디자인을 추구합니다.',
        artMovement: 'Bauhaus'
      },
      'LSRF': {
        name: '리얼리즘 말',
        description: '사실적이고 기술적으로 완성도 높은 작품에 감탄합니다.',
        artMovement: 'Realism'
      },
      'LSRC': {
        name: '신고전주의 사자',
        description: '고전적 완성도와 영원한 아름다움을 추구합니다.',
        artMovement: 'Neoclassicism'
      },
      'SAEF': {
        name: '낭만주의 토끼',
        description: '감정적이고 서정적인 작품에 깊이 공감합니다.',
        artMovement: 'Romanticism'
      },
      'SAEC': {
        name: '상징주의 여우',
        description: '상징적이고 신비로운 표현에 매혹됩니다.',
        artMovement: 'Symbolism'
      },
      'SARF': {
        name: '초현실주의 돌고래',
        description: '초현실적이고 상상력 넘치는 표현을 선호합니다.',
        artMovement: 'Surrealism'
      },
      'SARC': {
        name: '고전주의 독수리',
        description: '고전적 완벽함과 이상적 아름다움을 추구합니다.',
        artMovement: 'Classicism'
      },
      'SSEF': {
        name: '포비즘 판다',
        description: '대담하고 원시적인 색채 표현에 끌립니다.',
        artMovement: 'Fauvism'
      },
      'SSEC': {
        name: '큐비즘 펭귄',
        description: '기하학적이고 분석적인 접근을 선호합니다.',
        artMovement: 'Cubism'
      },
      'SSRF': {
        name: '바로크 양',
        description: '화려하고 극적인 표현을 좋아합니다.',
        artMovement: 'Baroque'
      },
      'SSRC': {
        name: '르네상스 코끼리',
        description: '고전적 조화와 완벽한 비례를 중시합니다.',
        artMovement: 'Renaissance'
      }
    };

    return descriptions[aptType] || {
      name: '예술 애호가',
      description: '독특한 예술 감상 스타일을 가지고 있습니다.',
      artMovement: 'Contemporary'
    };
  }
};